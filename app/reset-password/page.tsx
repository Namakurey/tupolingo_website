"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Lock } from "lucide-react";
import Logo from "@/components/logo";
import { resetPassword, signInWithPassword } from "@/app/actions";

function decodeTokenEmail(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = JSON.parse(atob(pad));
    const claim = json.email ?? json.sub;
    return typeof claim === "string" && claim.includes("@") ? claim : null;
  } catch {
    return null;
  }
}

function storedResetEmail(): string {
  try {
    return window.localStorage.getItem("tupolingo-reset-email") ?? "";
  } catch {
    return "";
  }
}

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("token");
    const status = sp.get("insforge_status");
    const emailFromUrl = sp.get("email");
    setToken(t);
    setEmail(emailFromUrl ?? decodeTokenEmail(t ?? "") ?? storedResetEmail());
    setInvalid(!t || status === "error");
    setReady(true);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Kata sandi tidak sama.");
      return;
    }
    if (!token) {
      setError("Link reset tidak valid.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await resetPassword(password, token);
    if (res.error) {
      setBusy(false);
      setError(res.message ?? "Gagal mereset kata sandi.");
      return;
    }
    if (email) {
      const loginFd = new FormData();
      loginFd.append("email", email);
      loginFd.append("password", password);
      const login = await signInWithPassword(loginFd);
      if (login.error) {
        setBusy(false);
        setError(login.message ?? "Kata sandi berhasil diganti, tapi gagal masuk otomatis.");
        return;
      }
    }
    window.location.assign("/dashboard");
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <div className="hero-mesh pointer-events-none absolute inset-0" />
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <a
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text2 transition-colors hover:text-text"
          >
            <ArrowLeft className="size-4" />
            Masuk
          </a>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-3xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
        >
          <h1 className="font-hanzi text-2xl font-black tracking-tight">
            Ganti kata sandi
          </h1>
          <p className="mt-2 text-sm text-text2">
            Buat kata sandi baru untuk akunmu.
          </p>

          {!ready ? (
            <div className="mt-8 grid place-items-center py-10">
              <Loader2 className="size-6 animate-spin text-accent" />
            </div>
          ) : invalid ? (
            <p className="mt-8 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
              Link reset tidak valid atau sudah kedaluwarsa. Silakan minta link baru.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text2">Email</span>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    value={email}
                    disabled
                    aria-readonly="true"
                    className="w-full cursor-not-allowed rounded-xl border border-line bg-bg2/60 px-4 py-3 pr-10 text-sm text-text2 outline-none disabled:opacity-100"
                  />
                  <Lock className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text3" />
                </div>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text2">Kata sandi baru</span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  className="rounded-xl border border-line bg-bg2 px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-text3 focus:border-accent/60"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text2">Ulangi kata sandi baru</span>
                <input
                  name="confirm"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Ketik ulang kata sandi"
                  className="rounded-xl border border-line bg-bg2 px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-text3 focus:border-accent/60"
                />
              </label>

              {error && (
                <p className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-[0_6px_24px_rgba(225,29,72,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Simpan & Masuk
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>

        <p className="mt-6 text-center text-xs text-text3">
          Setelah disimpan, kamu akan langsung masuk ke dashboard.
        </p>
      </div>
    </main>
  );
}
