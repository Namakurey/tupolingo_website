import { createClient, createAdminClient } from "npm:@insforge/sdk";

const BASE_URL = Deno.env.get("INSFORGE_BASE_URL")!;
const API_KEY = Deno.env.get("API_KEY")!;

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
  if (!userId) return json({ error: "Unauthorized" }, 401);

  const admin = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

  const { data: ent, error: eErr } = await admin.database
    .from("entitlements")
    .select("product_id,granted_at")
    .eq("user_id", userId)
    .order("granted_at");
  if (eErr) return json({ error: "DB error" }, 500);

  // Resolve to a canonical, de-duplicated list of individual products.
  // A combo (writing_flashcards_L{n}) is split into its two parts so the
  // dashboard shows the Workbook and the Flashcards as separate cards, and a
  // product bought once is never shown twice (e.g. combo + all-in-one bundle).
  const resolved = new Map<string, string>(); // product_id -> granted_at
  for (const e of ent ?? []) {
    const m = String(e.product_id).match(/^writing_flashcards_L(\d)$/);
    const parts = m
      ? [`writing_L${m[1]}`, `flashcards_L${m[1]}`]
      : [String(e.product_id)];
    for (const pid of parts) {
      if (!resolved.has(pid)) resolved.set(pid, String(e.granted_at ?? ""));
    }
  }
  const entitlements = Array.from(resolved, ([product_id, granted_at]) => ({
    product_id,
    granted_at,
  }));

  const ids = entitlements.map((e) => e.product_id);
  let products: Array<Record<string, unknown>> = [];
  if (ids.length > 0) {
    const { data: prods } = await admin.database
      .from("products")
      .select("id,name,product_type,hsk_level,price_idr")
      .in("id", ids);
    products = prods ?? [];
  }

  return json({ entitlements, products });
}
