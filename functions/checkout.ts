import { createClient, createAdminClient } from "npm:@insforge/sdk";

const BASE_URL = Deno.env.get("INSFORGE_BASE_URL")!;
const API_KEY = Deno.env.get("API_KEY")!;
const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY") ?? "";
const IS_PRODUCTION = Deno.env.get("MIDTRANS_IS_PRODUCTION") === "true";
const SNAP_BASE = IS_PRODUCTION
  ? "https://app.midtrans.com"
  : "https://app.sandbox.midtrans.com";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  if (!token) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient({ baseUrl: BASE_URL, accessToken: token });
  const { data: authData } = await userClient.auth.getCurrentUser();
  const userId = authData?.user?.id;
  const userEmail = authData?.user?.email ?? "";
  const userName = authData?.user?.name ?? "";
  if (!userId) return json({ error: "Unauthorized" }, 401);

  const admin = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

  let items: string[];
  let finishUrl = "";
  try {
    const body = await req.json();
    items = Array.isArray(body?.items) ? body.items.map(String) : [];
    finishUrl = String(body?.finish_url ?? "");
  } catch {
    return json({ error: "Bad request" }, 400);
  }
  if (items.length === 0) return json({ error: "No items" }, 400);

  // Split bundle ids from product ids.
  const bundleIds = items.filter((i) => i.startsWith("bundle_"));
  const requestedProductIds = new Set(items.filter((i) => !i.startsWith("bundle_")));

  if (bundleIds.length > 0) {
    const { data: bundles, error: bErr } = await admin.database
      .from("bundles")
      .select("included_product_types,included_product_ids")
      .in("id", bundleIds);
    if (bErr) return json({ error: "DB error" }, 500);
    for (const b of bundles ?? []) {
      const types = b.included_product_types ?? [];
      if (types.length > 0) {
        const { data: prods } = await admin.database
          .from("products")
          .select("id")
          .in("product_type", types);
        for (const p of prods ?? []) requestedProductIds.add(p.id);
      }
      for (const id of b.included_product_ids ?? []) requestedProductIds.add(id);
    }
  }

  const ids = Array.from(requestedProductIds);

  // Guard: block repurchase of packages the user already effectively owns.
  // A combo (writing_flashcards_L{n}) is owned if the user owns its two parts
  // (writing_L{n} + flashcards_L{n}); a part is owned if its combo is owned.
  const { data: ownedRows } = await admin.database
    .from("entitlements")
    .select("product_id")
    .eq("user_id", userId);
  const ownedSet = new Set((ownedRows ?? []).map((e) => e.product_id));
  const isOwned = (pid: string): boolean => {
    if (ownedSet.has(pid)) return true;
    const combo = pid.match(/^writing_flashcards_L(\d)$/);
    if (combo) {
      const n = combo[1];
      return ownedSet.has(`writing_L${n}`) && ownedSet.has(`flashcards_L${n}`);
    }
    const single = pid.match(/^(writing|flashcards)_L(\d)$/);
    if (single) {
      const n = single[2];
      return ownedSet.has(`writing_flashcards_L${n}`);
    }
    return false;
  };
  const alreadyOwned = ids.filter(isOwned);
  if (ids.length > 0 && alreadyOwned.length === ids.length) {
    return json(
      {
        error: "already_owned",
        message: "Paket sudah kamu miliki. Tidak perlu membeli ulang.",
        status: "already_owned",
      },
      400,
    );
  }

  // Resolve prices for the resolved product ids.
  const { data: priced, error: pErr } = await admin.database
    .from("products")
    .select("id,name,price_idr")
    .in("id", ids);
  if (pErr) return json({ error: "DB error" }, 500);

  const priceMap = new Map<string, number>();
  const nameMap = new Map<string, string>();
  for (const p of priced ?? []) {
    priceMap.set(p.id, p.price_idr);
    nameMap.set(p.id, p.name);
  }
  const missing = ids.filter((id) => !priceMap.has(id));
  if (missing.length > 0) return json({ error: `Unknown products: ${missing.join(",")}` }, 404);

  const total = ids.reduce((sum, id) => sum + (priceMap.get(id) ?? 0), 0);

  if (Deno.env.get("DEV_MODE") === "true") {
    const devOrderId = `DEV-${crypto.randomUUID()}`;
    const { data: order, error: oErr } = await admin.database
      .from("orders")
      .insert([{
        user_id: userId,
        midtrans_order_id: devOrderId,
        total_amount: total,
        status: "settlement",
        items: ids,
      }])
      .select()
      .single();
    if (oErr) return json({ error: "Failed to create order" }, 500);

    const { data: existing } = await admin.database
      .from("entitlements")
      .select("product_id")
      .eq("user_id", userId)
      .in("product_id", ids);
    const owned = new Set((existing ?? []).map((e) => e.product_id));
    const toGrant = ids.filter((id) => !owned.has(id));

    if (toGrant.length > 0) {
      const { error: gErr } = await admin.database
        .from("entitlements")
        .insert(toGrant.map((pid) => ({ user_id: userId, product_id: pid, order_id: order.id })));
      if (gErr) return json({ error: "Failed to grant entitlements" }, 500);
    }

    return json({
      status: "dev_grant",
      success: true,
      granted: toGrant,
      already_owned: owned.size,
      order_id: devOrderId,
    });
  }

  if (!MIDTRANS_SERVER_KEY) {
    return json({ error: "Midtrans not configured", status: "unconfigured" }, 503);
  }

  // Real Midtrans Snap flow.
  const midtransOrderId = `TU-${crypto.randomUUID()}`;

  const { data: order, error: oErr } = await admin.database
    .from("orders")
    .insert([{
      user_id: userId,
      midtrans_order_id: midtransOrderId,
      total_amount: total,
      status: "pending",
      items: ids,
    }])
    .select()
    .single();
  if (oErr) return json({ error: "Failed to create order" }, 500);

  const auth = btoa(`${MIDTRANS_SERVER_KEY}:`);
  const snapBody = {
    transaction_details: {
      order_id: midtransOrderId,
      gross_amount: total,
    },
    item_details: ids.map((id) => ({
      id,
      name: nameMap.get(id) ?? id,
      price: priceMap.get(id) ?? 0,
      quantity: 1,
    })),
    customer_details: {
      first_name: userName || undefined,
      email: userEmail || undefined,
    },
    callbacks: {
      finish: finishUrl || `${BASE_URL}/functions/midtrans-webhook`,
    },
  };

  const snapRes = await fetch(`${SNAP_BASE}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Basic ${auth}`,
    },
    body: JSON.stringify(snapBody),
  });

  const snapData = await snapRes.json().catch(() => ({}));
  if (!snapRes.ok) {
    await admin.database
      .from("orders")
      .update({ status: "expire" })
      .eq("id", order.id);
    return json(
      {
        error: "Midtrans rejected the transaction",
        detail: snapData?.status_message ?? snapRes.statusText,
        status: "error",
      },
      502,
    );
  }

  const snapToken = String(snapData?.token ?? "");
  const redirectUrl = `${SNAP_BASE}/snap/v1/vtweb/${snapToken}`;

  return json({
    status: "pending",
    order_id: midtransOrderId,
    total,
    snap_token: snapToken,
    redirect_url: redirectUrl,
  });
}
