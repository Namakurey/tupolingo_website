import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@insforge/sdk";

const BASE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL!;
const API_KEY = process.env.INSFORGE_API_KEY!;
const LYNK_WEBHOOK_SECRET = process.env.LYNK_WEBHOOK_SECRET || "";

// ── Lynk.id webhook payload types ──────────────────────────────────────────────
type LynkCustomer = {
  name?: string;
  email?: string;
  phone?: string;
};

type LynkItem = {
  title?: string;
  qty?: number;
  price?: number;
};

type LynkMessageData = {
  ref_id?: string;
  refId?: string;
  customer?: LynkCustomer;
  items?: LynkItem[];
  totals?: {
    total_price?: number;
    grand_total?: number;
  };
  created_at?: string;
};

type LynkWebhookPayload = {
  event?: string;
  data?: {
    message_action?: string;
    message_code?: string;
    message_data?: LynkMessageData;
    message_desc?: string;
    message_id?: string;
    message_title?: string;
  };
  // Alternative flat structure (some Lynk.id integrations use this)
  ref_id?: string;
  refId?: string;
  customer?: LynkCustomer;
  items?: LynkItem[];
  total_price?: number;
  created_at?: string;
};

// ── Product name to product_id mapping ──────────────────────────────────────────
// This maps Lynk.id product names to our internal product IDs
const PRODUCT_NAME_MAP: Record<string, string> = {
  // Flashcards
  "HSK Flashcards 1": "flashcards_L1",
  "HSK Flashcards 2": "flashcards_L2",
  "HSK Flashcards 3": "flashcards_L3",
  "HSK Flashcards 4": "flashcards_L4",
  "HSK Flashcards 5": "flashcards_L5",
  "HSK Flashcards 6": "flashcards_L6",
  "Flashcards HSK 1": "flashcards_L1",
  "Flashcards HSK 2": "flashcards_L2",
  "Flashcards HSK 3": "flashcards_L3",
  "Flashcards HSK 4": "flashcards_L4",
  "Flashcards HSK 5": "flashcards_L5",
  "Flashcards HSK 6": "flashcards_L6",
  "Flashcard HSK 1": "flashcards_L1",
  "Flashcard HSK 2": "flashcards_L2",
  "Flashcard HSK 3": "flashcards_L3",
  "Flashcard HSK 4": "flashcards_L4",
  "Flashcard HSK 5": "flashcards_L5",
  "Flashcard HSK 6": "flashcards_L6",
  // Writing Workbook
  "HSK Writing Workbook 1": "writing_L1",
  "HSK Writing Workbook 2": "writing_L2",
  "HSK Writing Workbook 3": "writing_L3",
  "HSK Writing Workbook 4": "writing_L4",
  "HSK Writing Workbook 5": "writing_L5",
  "HSK Writing Workbook 6": "writing_L6",
  "Writing Workbook HSK 1": "writing_L1",
  "Writing Workbook HSK 2": "writing_L2",
  "Writing Workbook HSK 3": "writing_L3",
  "Writing Workbook HSK 4": "writing_L4",
  "Writing Workbook HSK 5": "writing_L5",
  "Writing Workbook HSK 6": "writing_L6",
  "Workbook HSK 1": "writing_L1",
  "Workbook HSK 2": "writing_L2",
  "Workbook HSK 3": "writing_L3",
  "Workbook HSK 4": "writing_L4",
  "Workbook HSK 5": "writing_L5",
  "Workbook HSK 6": "writing_L6",
  // Combo
  "Workbook + Flashcards HSK 1": "writing_flashcards_L1",
  "Workbook + Flashcards HSK 2": "writing_flashcards_L2",
  "Workbook + Flashcards HSK 3": "writing_flashcards_L3",
  "Workbook + Flashcards HSK 4": "writing_flashcards_L4",
  "Workbook + Flashcards HSK 5": "writing_flashcards_L5",
  "Workbook + Flashcards HSK 6": "writing_flashcards_L6",
  "Workbook + Flashcard HSK 1": "writing_flashcards_L1",
  "Workbook + Flashcard HSK 2": "writing_flashcards_L2",
  "Workbook + Flashcard HSK 3": "writing_flashcards_L3",
  "Workbook + Flashcard HSK 4": "writing_flashcards_L4",
  "Workbook + Flashcard HSK 5": "writing_flashcards_L5",
  "Workbook + Flashcard HSK 6": "writing_flashcards_L6",
  // Chrome Extension
  "ReadZhongwen Chrome Extension": "chrome_ext_only",
  "ReadZhongwen Extension": "chrome_ext_only",
  "Chrome Extension ReadZhongwen": "chrome_ext_only",
  "ReadZhongwen": "chrome_ext_only",
  // Bundles
  "All-in-One Bundle (Full HSK 1-6) + Chrome Extension": "bundle_all_in_one",
  "All-in-One Bundle": "bundle_all_in_one",
  "All-in-One": "bundle_all_in_one",
  "Paket All-in-One": "bundle_all_in_one",
  "Paket All in One": "bundle_all_in_one",
  "All-in-One (Dapet full akses produk HSK 1-6 + Chrome Extension)": "bundle_all_in_one",
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

// ── Verify Lynk.id signature (optional, for production security) ────────────────
function verifyLynkSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!secret) return true; // Skip verification if no secret configured
  if (!signature) return false;

  // Lynk.id uses SHA256: SHA256(amount + ref_id + message_id + merchant_key)
  // For now, we do basic validation. Implement full HMAC if Lynk.id provides a signing key.
  return true; // Placeholder - implement actual verification when Lynk.id docs are available
}

export async function POST(req: NextRequest) {
  // 1. Parse payload
  let payload: LynkWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  // Normalize payload structure (handle both nested and flat formats)
  const messageData = payload.data?.message_data ?? payload;
  const customer = messageData.customer ?? payload.customer;
  const items = messageData.items ?? payload.items ?? [];
  const refId = messageData.ref_id ?? messageData.refId ?? payload.ref_id ?? payload.refId;

  // Log all incoming webhooks for debugging
  console.log("[LYNK_WEBHOOK] Received:", JSON.stringify(payload, null, 2));

  // If this is a test/empty payload from Lynk.id, return OK (pass their test)
  if (!refId || !customer?.email) {
    console.log("[LYNK_WEBHOOK] Test or incomplete payload, returning OK");
    return json({ ok: true, message: "Test received" });
  }

  const email = customer.email;

  // 2. Initialize admin client
  const admin = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

  // 3. Check if transaction already processed (idempotency)
  const { data: existingLog } = await admin.database
    .from("webhook_logs")
    .select("id, status")
    .eq("transaction_id", refId)
    .single();

  if (existingLog && existingLog.status === "processed") {
    return json({ ok: true, message: "Already processed" });
  }

  // 4. Log the webhook
  if (!existingLog) {
    await admin.database.from("webhook_logs").insert({
      transaction_id: refId,
      source: "lynk.id",
      payload: payload as any,
      status: "received",
    });
  }

  // 5. Find user by email - check profiles first, then auth.users
  let userId: string | null = null;

  const { data: profiles } = await admin.database
    .from("profiles")
    .select("id")
    .eq("username", email)
    .limit(1);

  userId = profiles?.[0]?.id ?? null;

  // Fallback: check auth.users if profile not found
  if (!userId) {
    const { data: authUsers } = await admin.database
      .from("auth.users")
      .select("id")
      .eq("email", email)
      .limit(1);

    userId = authUsers?.[0]?.id ?? null;

    // Create profile if user exists in auth but not in profiles
    if (userId) {
      await admin.database.from("profiles").upsert(
        { id: userId, username: email, is_premium: false },
        { onConflict: "id" },
      );
    }
  }

  // 6. Process each item
  const grantedProducts: string[] = [];

  for (const item of items) {
    const itemName = item.title ?? "";
    const productId = PRODUCT_NAME_MAP[itemName];

    if (!productId) {
      console.warn(`Unknown product: ${itemName}`);
      continue;
    }

    if (userId) {
      // User exists - grant entitlement directly
      const { error: entitlementError } = await admin.database
        .from("entitlements")
        .upsert(
          { user_id: userId, product_id: productId },
          { onConflict: "user_id,product_id" },
        );

      if (!entitlementError) {
        grantedProducts.push(productId);

        // Set premium flag
        await admin.database
          .from("profiles")
          .update({ is_premium: true })
          .eq("id", userId);
      }
    } else {
      // User doesn't exist yet - save to pending_access
      await admin.database.from("pending_access").upsert(
        {
          email: email,
          product_id: productId,
          transaction_id: refId,
          product_name: itemName,
          customer_name: customer?.name,
          status: "pending",
        },
        { onConflict: "email,transaction_id,product_id" },
      );
    }
  }

  // 7. Update webhook log status
  await admin.database
    .from("webhook_logs")
    .update({ status: "processed" })
    .eq("transaction_id", refId);

  return json({
    ok: true,
    message: userId
      ? "Akses berhasil diberikan."
      : "Transaksi tersimpan. Akses akan aktif setelah registrasi.",
    granted: grantedProducts,
    user_found: !!userId,
  });
}