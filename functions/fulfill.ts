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

  let productId: string;
  try {
    const body = await req.json();
    productId = String(body?.product_id ?? "");
  } catch {
    return json({ error: "Bad request" }, 400);
  }

  const { data: product, error: pErr } = await admin.database
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();
  if (pErr || !product) return json({ error: "Product not found" }, 404);

  // Resolve the set of product_ids whose ownership grants access to this product.
  let allowed: string[];
  const n = product.hsk_level;
  switch (product.product_type) {
    case "writing_pdf":
      allowed = [`writing_L${n}`, `writing_flashcards_L${n}`];
      break;
    case "writing_flashcards":
      allowed = [`writing_flashcards_L${n}`];
      break;
    case "flashcards":
      allowed = [`flashcards_L${n}`, `writing_flashcards_L${n}`];
      break;
    case "chrome_ext":
      allowed = ["chrome_ext_only"];
      break;
    default:
      allowed = [product.id];
  }

  const { data: ent, error: eErr } = await admin.database
    .from("entitlements")
    .select("product_id")
    .eq("user_id", userId)
    .in("product_id", allowed);
  if (eErr) return json({ error: "DB error" }, 500);
  if (!ent || ent.length === 0) {
    return json({ error: "Purchase required", product_id: productId }, 403);
  }

  // Deliver according to product type.
  if (product.product_type === "chrome_ext") {
    const { data: tok } = await admin.database
      .from("extension_tokens")
      .select("secret_token")
      .eq("user_id", userId)
      .single();
    if (!tok) {
      await admin.database.from("extension_tokens").insert([{ user_id: userId }]);
    }
    return json({
      active: true,
      type: "chrome_ext",
      store_url: "https://chromewebstore.google.com/detail/ikhomlaoadmdaigfabjfeemaiolmiipo?utm_source=item-share-cb",
      message:
        "Pembelian kamu sudah terkonfirmasi! Klik tombol untuk membuka ReadZhongwen di Chrome Web Store.",
    });
  }

  if (product.product_type === "flashcards") {
    return json({
      active: true,
      type: "flashcards",
      level: product.hsk_level,
      message: "Akses flashcard aktif — buka pemutar flashcard di dashboard.",
    });
  }

  // PDF-bearing products (writing_pdf, writing_flashcards).
  const pdfLevel = product.hsk_level;
  const key = `writing_L${pdfLevel}.pdf`;
  const { data: signed, error: sErr } = await admin.storage
    .from("products")
    .createSignedUrl(key, 3600);
  if (sErr || !signed?.signedUrl) return json({ error: "Failed to sign URL" }, 500);

  return json({
    active: true,
    type: product.product_type,
    level: pdfLevel,
    pdf_url: signed.signedUrl,
  });
}
