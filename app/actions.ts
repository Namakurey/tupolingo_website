"use server";

import { cookies } from "next/headers";
import { createAuthActions } from "@insforge/sdk/ssr";
import { createInsForgeServerClient } from "@/lib/insforge/server";

function auth() {
  return createAuthActions({ cookies: cookies() });
}

export type SessionUser = { id: string; email: string };

export async function getCurrentUser(): Promise<SessionUser | null> {
  const client = await createInsForgeServerClient();
  const { data } = await client.auth.getCurrentUser();
  const user = data?.user ?? null;
  if (!user) return null;
  return { id: user.id, email: user.email };
}

export type AuthResult = {
  error: string | null;
  message?: string;
};

export async function signInWithPassword(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "");
  const { error } = await auth().signInWithPassword({
    email,
    password: String(formData.get("password") ?? ""),
  });
  if (error) {
    return {
      error: error.error ?? "AUTH_FAILED",
      message: error.message ?? "Gagal masuk. Periksa email dan kata sandi.",
    };
  }

  // Fulfill any pending access from Lynk.id webhooks
  fulfillPendingAccess(email).catch((err) =>
    console.error("Failed to fulfill pending access:", err),
  );

  return { error: null };
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const { data, error } = await auth().signUp({
    email,
    password: String(formData.get("password") ?? ""),
    name: name || undefined,
  });
  if (error) {
    return {
      error: error.error ?? "SIGNUP_FAILED",
      message: error.message ?? "Pendaftaran gagal.",
    };
  }
  if (data?.requireEmailVerification) {
    // Still fulfill pending access even with email verification
    fulfillPendingAccess(email).catch((err) =>
      console.error("Failed to fulfill pending access:", err),
    );
    return {
      error: null,
      message: "Periksa email untuk kode verifikasi.",
    };
  }

  // After successful signup, check for pending access from Lynk.id webhooks
  fulfillPendingAccess(email).catch((err) =>
    console.error("Failed to fulfill pending access:", err),
  );

  // Create profile if not exists
  const client = await createInsForgeServerClient();
  const { data: existingProfile } = await client.database
    .from("profiles")
    .select("id")
    .eq("username", email)
    .limit(1);

  if (!existingProfile || existingProfile.length === 0) {
    // Get user ID from auth.users
    const { data: authUser } = await client.auth.getCurrentUser();
    if (authUser?.user?.id) {
      await client.database.from("profiles").upsert(
        { id: authUser.user.id, username: email, is_premium: false },
        { onConflict: "id" },
      );
    }
  }

  return { error: null };
}

export async function signOut(): Promise<void> {
  await auth().signOut();
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const client = await createInsForgeServerClient();
  const { error } = await client.auth.sendResetPasswordEmail({
    email,
    redirectTo: `${appUrl}/reset-password`,
  });
  if (error) {
    return {
      error: error.error ?? "RESET_FAILED",
      message: error.message ?? "Gagal mengirim email reset kata sandi.",
    };
  }
  return { error: null, message: "Email reset telah dikirim. Cek inbox kamu." };
}

export async function resetPassword(
  newPassword: string,
  otp: string,
): Promise<AuthResult> {
  const client = await createInsForgeServerClient();
  const { error } = await client.auth.resetPassword({ newPassword, otp });
  if (error) {
    return {
      error: error.error ?? "RESET_FAILED",
      message: error.message ?? "Gagal mereset kata sandi. Link mungkin sudah kedaluwarsa.",
    };
  }
  return { error: null };
}

// ── Fulfill pending access from Lynk.id webhooks ───────────────────────────────
async function fulfillPendingAccess(email: string): Promise<void> {
  const client = await createInsForgeServerClient();

  // Get user ID by email (profiles.username stores email)
  const { data: profiles } = await client.database
    .from("profiles")
    .select("id")
    .eq("username", email)
    .limit(1);

  const userId = profiles?.[0]?.id;
  if (!userId) return;

  // Get all pending access for this email
  const { data: pendingItems } = await client.database
    .from("pending_access")
    .select("id, product_id, transaction_id")
    .eq("email", email)
    .eq("status", "pending");

  if (!pendingItems || pendingItems.length === 0) return;

  // Grant entitlements for each pending item
  for (const item of pendingItems) {
    await client.database.from("entitlements").upsert(
      { user_id: userId, product_id: item.product_id },
      { onConflict: "user_id,product_id" },
    );

    // Mark as fulfilled
    await client.database
      .from("pending_access")
      .update({ status: "fulfilled", fulfilled_at: new Date().toISOString() })
      .eq("id", item.id);
  }

  // Set premium flag
  await client.database
    .from("profiles")
    .update({ is_premium: true })
    .eq("id", userId);
}
