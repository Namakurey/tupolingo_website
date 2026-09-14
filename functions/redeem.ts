import { createClient, createAdminClient } from "npm:@insforge/sdk";

const BASE_URL = Deno.env.get("INSFORGE_BASE_URL")!;
const API_KEY = Deno.env.get("API_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
  const userEmail = authData?.user?.email;
  if (!userId || !userEmail) return json({ error: "Unauthorized" }, 401);

  const admin = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

  let code: string;
  try {
    const body = await req.json();
    code = String(body?.code ?? "").toUpperCase();
  } catch {
    return json({ error: "Bad request" }, 400);
  }

  if (!code) return json({ error: "Kode tidak valid." }, 400);

  // ── ATOMIC CLAIM: prevents race-condition ──────────────────────────────────
  // Try to claim the key in ONE atomic UPDATE that only succeeds if is_used = false.
  // If 0 rows are affected, the key was already used by someone else (or same user).
  const now = new Date().toISOString();
  const { data: updatedRows, error: atomicError } = await admin.database
    .from("license_keys")
    .update({
      is_used: true,
      redeemed_by_email: userEmail,
      redeemed_at: now,
    })
    .eq("code", code)
    .eq("is_used", false)
    .select("code");

  // If the key doesn't exist at all
  if (atomicError) {
    return json({ error: "Gagal memproses kode." }, 500);
  }

  // No rows updated means either: key not found OR key already used
  if (!updatedRows || updatedRows.length === 0) {
    // Check if key exists to give the right error message
    const { data: existingKey } = await admin.database
      .from("license_keys")
      .select("code, is_used")
      .eq("code", code)
      .single();

    if (!existingKey) {
      return json({ error: "Kode tidak valid." }, 404);
    }

    // Key exists but is_used = true (someone already claimed it)
    return json({ error: "Kode ini sudah pernah digunakan dan tidak dapat dipakai lagi." }, 400);
  }

  // ── Key claimed successfully. Now get mapped products and grant access. ────
  const { data: licenseProducts, error: prodError } = await admin.database
    .from("license_key_products")
    .select("product_id")
    .eq("license_code", code);

  if (prodError || !licenseProducts || licenseProducts.length === 0) {
    return json({ error: "Kode tidak memiliki produk terkait." }, 400);
  }

  // Grant entitlements
  const entitlementsToInsert = licenseProducts.map((lp: { product_id: string }) => ({
    user_id: userId,
    product_id: lp.product_id,
  }));

  const { error: entitlementError } = await admin.database
    .from("entitlements")
    .insert(entitlementsToInsert);

  if (entitlementError) {
    console.error("Entitlement grant failed:", entitlementError);
    return json({ error: "Gagal memberikan akses produk." }, 500);
  }

  // Set user as premium
  const { error: premiumError } = await admin.database
    .from("profiles")
    .update({ is_premium: true })
    .eq("id", userId);

  if (premiumError) {
    console.error("Premium update failed:", premiumError);
    // Non-critical: entitlements already granted
  }

  return json({
    ok: true,
    message: "Akses premium berhasil diaktifkan!",
    granted: licenseProducts.map((p: { product_id: string }) => p.product_id),
  });
}