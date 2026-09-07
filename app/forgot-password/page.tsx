"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Logo from "@/components/logo";
import { requestPasswordReset } from "@/app/actions";

export default function ForgotPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    try {
      window.localStorage.setItem("tupolingo-reset-email", email);
    } catch {}
    const res = await requestPasswordReset(email);
    setBusy(false);
    if (res.error) {
      setError(res.message ?? "Terjadi kesalahan.");
      return;
    }
    setNotice(res.message ?? "Email reset telah dikirim.");
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
            Lupa kata sandi
          </h1>
          <p className="mt-2 text-sm text-text2">
            Masukkan email kamu, kami akan kirim link untuk mengganti kata sandi.
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text2">Email</span>
              <input
                name="email"
                type="email"
                required
                placeholder="kamu@email.com"
                className="rounded-xl border border-line bg-bg2 px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-text3 focus:border-accent/60"
              />
            </label>

            {error && (
              <p className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
                {notice}
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
                  Kirim link reset
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <p className="mt-6 text-center text-xs text-text3">
          Link reset akan kedaluwarsa. Gunakan segera setelah diterima.
        </p>
      </div>
    </main>
  );
}
