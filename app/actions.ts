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
  const { error } = await auth().signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) {
    return {
      error: error.error ?? "AUTH_FAILED",
      message: error.message ?? "Gagal masuk. Periksa email dan kata sandi.",
    };
  }
  return { error: null };
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const name = String(formData.get("name") ?? "");
  const { data, error } = await auth().signUp({
    email: String(formData.get("email") ?? ""),
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
    return {
      error: null,
      message: "Periksa email untuk kode verifikasi.",
    };
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
