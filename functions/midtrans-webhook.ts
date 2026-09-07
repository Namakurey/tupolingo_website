import { createAdminClient } from "npm:@insforge/sdk";

const BASE_URL = Deno.env.get("INSFORGE_BASE_URL")!;
const API_KEY = Deno.env.get("API_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

async function sha512Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
  if (!serverKey) {
    return json({ error: "Midtrans not configured" }, 503);
  }

  const admin = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

  async function setOrderStatus(orderId: string, status: string) {
    const { data } = await admin.database
      .from("orders")
      .select("id")
      .eq("midtrans_order_id", orderId)
      .single();
    if (data?.id) {
      await admin.database.from("orders").update({ status }).eq("id", data.id);
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Bad request" }, 400);
  }

  const orderId = String(body.order_id ?? "");
  const statusCode = String(body.status_code ?? "");
  const grossAmount = String(body.gross_amount ?? "");
  const signatureKey = String(body.signature_key ?? "");
  const transactionStatus = String(body.transaction_status ?? "");

  const expected = await sha512Hex(`${orderId}${statusCode}${grossAmount}${serverKey}`);
  if (expected !== signatureKey) {
    return json({ error: "Invalid signature" }, 403);
  }

  const isSettled =
    transactionStatus === "settlement" ||
    (transactionStatus === "capture" && String(body.fraud_status ?? "") === "accept");

  if (!isSettled) {
    if (transactionStatus === "expire" || transactionStatus === "cancel") {
      await setOrderStatus(orderId, transactionStatus);
    }
    return json({ received: true, status: transactionStatus });
  }

  const { data: order, error: oErr } = await admin.database
    .from("orders")
    .select("*")
    .eq("midtrans_order_id", orderId)
    .single();
  if (oErr || !order) return json({ error: "Order not found" }, 404);

  // Resolve bundles into individual product ids.
  const items: string[] = Array.isArray(order.items) ? order.items : [];
  const productIds = new Set<string>();
  const bundleIds = items.filter((i) => i.startsWith("bundle_"));
  items.filter((i) => !i.startsWith("bundle_")).forEach((i) => productIds.add(i));

  if (bundleIds.length > 0) {
    const { data: bundles } = await admin.database
      .from("bundles")
      .select("included_product_types,included_product_ids")
      .in("id", bundleIds);
    for (const b of bundles ?? []) {
      const types = b.included_product_types ?? [];
      if (types.length > 0) {
        const { data: prods } = await admin.database
          .from("products")
          .select("id")
          .in("product_type", types);
        for (const p of prods ?? []) productIds.add(p.id);
      }
      for (const id of b.included_product_ids ?? []) productIds.add(id);
    }
  }

  const ids = Array.from(productIds);
  if (ids.length > 0) {
    await admin.database
      .from("entitlements")
      .upsert(
        ids.map((pid) => ({ user_id: order.user_id, product_id: pid, order_id: order.id })),
        { onConflict: "user_id,product_id" },
      );
  }

  await admin.database
    .from("orders")
    .update({ status: "settlement" })
    .eq("id", order.id);

  return json({ success: true, granted: ids });
}
