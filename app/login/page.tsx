"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { signInWithPassword, signUp } from "@/app/actions";
import Logo from "@/components/logo";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [next, setNext] = useState("/dashboard");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("next");
    if (p && p.startsWith("/")) setNext(p);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const fd = new FormData(e.currentTarget);
    const res = mode === "signin" ? await signInWithPassword(fd) : await signUp(fd);
    if (res.error) {
      setError(res.message ?? "Terjadi kesalahan.");
      setBusy(false);
      return;
    }
    if (res.message) {
      setNotice(res.message);
      setBusy(false);
      return;
    }
    // Full navigation so AuthProvider remounts and reads the fresh session cookie.
    window.location.assign(next);
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <div className="hero-mesh pointer-events-none absolute inset-0" />
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text2 transition-colors hover:text-text"
          >
            <ArrowLeft className="size-4" />
            Beranda
          </a>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-3xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
        >
          <h1 className="font-hanzi text-2xl font-black tracking-tight">
            {mode === "signin" ? "Masuk ke akun" : "Buat akun baru"}
          </h1>
          <p className="mt-2 text-sm text-text2">
            {mode === "signin"
              ? "Lanjutkan belajar Mandarin kamu."
              : "Akses materi HSK 1-6, flashcard, dan ekstensi."}
          </p>

          <div className="mt-6 flex rounded-full border border-line bg-surface p-1.5">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setNotice(null);
                }}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  mode === m ? "bg-accent text-white" : "text-text2 hover:text-text"
                }`}
              >
                {m === "signin" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            {mode === "signup" && (
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text2">Nama</span>
                <input
                  name="name"
                  required
                  placeholder="Nama kamu"
                  className="rounded-xl border border-line bg-bg2 px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-text3 focus:border-accent/60"
                />
              </label>
            )}
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
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text2">Kata sandi</span>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
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
                  {mode === "signin" ? "Masuk" : "Daftar"}
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {mode === "signin" && (
            <p className="mt-4 text-center text-sm">
              <a
                href="/forgot-password"
                className="font-semibold text-text2 transition-colors hover:text-accent"
              >
                Lupa kata sandi?
              </a>
            </p>
          )}
        </motion.div>

        <p className="mt-6 text-center text-xs text-text3">
          Dengan masuk, kamu menyetujui akses materi digital TuPoLingo.
        </p>
      </div>
    </main>
  );
}
