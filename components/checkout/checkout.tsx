"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Loader2, Zap } from "lucide-react";
import Logo from "@/components/logo";
import { useAuth } from "@/lib/insforge/auth-provider";
import { checkout, formatIDR } from "@/lib/insforge/api";
import { insforge } from "@/lib/insforge/client";

type LineItem = {
  id: string;
  name: string;
  price: number;
};

export default function Checkout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const items = useMemo(
    () => (searchParams.get("items") ?? "").split(",").filter(Boolean),
    [searchParams],
  );
  const [detail, setDetail] = useState<LineItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = useCallback(() => {
    if (typeof window === "undefined") return "/checkout";
    return window.location.pathname + window.location.search;
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(redirectTo())}`);
    }
  }, [loading, user, router, redirectTo]);

  useEffect(() => {
    if (!user || items.length === 0 || detail) return;
    let cancelled = false;
    (async () => {
      const rows: LineItem[] = [];
      const prodIds = items.filter((i) => !i.startsWith("bundle_"));
      const bundleIds = items.filter((i) => i.startsWith("bundle_"));
      if (prodIds.length > 0) {
        const { data } = await insforge.database
          .from("products")
          .select("id,name,price_idr")
          .in("id", prodIds);
        for (const p of data ?? []) rows.push({ id: p.id, name: p.name, price: p.price_idr });
      }
      if (bundleIds.length > 0) {
        const { data } = await insforge.database
          .from("bundles")
          .select("id,name,price_idr")
          .in("id", bundleIds);
        for (const b of data ?? []) rows.push({ id: b.id, name: b.name, price: b.price_idr });
      }
      if (!cancelled) setDetail(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, items, detail]);

  const total = useMemo(() => (detail ?? []).reduce((s, r) => s + r.price, 0), [detail]);
  const missing = detail
    ? items.filter((id) => !detail.some((d) => d.id === id))
    : [];

  async function onPay() {
    setBusy(true);
    setError(null);
    const res = await checkout(items, `${window.location.origin}/dashboard?paid=1`);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    if (res.status === "pending" && res.snap_token) {
      if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(res.snap_token, {
          onSuccess: () => {
            router.push("/dashboard?paid=1");
            router.refresh();
          },
          onPending: () => {
            setBusy(false);
          },
          onError: () => {
            setError("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: () => {
            setBusy(false);
          },
        });
      } else if (res.redirect_url) {
        window.location.href = res.redirect_url;
      }
      return;
    }
    router.push("/dashboard?paid=1");
    router.refresh();
  }

  if (loading || !user) {
    return (
      <main className="grid min-h-[100dvh] place-items-center">
        <Loader2 className="size-8 animate-spin text-accent" />
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh]">
      <div className="hero-mesh pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text2 transition-colors hover:text-text"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </a>
        </div>

        {items.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <p className="text-lg font-semibold">Tidak ada item untuk dibayar.</p>
            <a
              href="/dashboard"
              className="mt-4 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-white"
            >
              Buka Dashboard
            </a>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-3xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
          >
            <h1 className="font-hanzi text-2xl font-black tracking-tight">
              Pembayaran
            </h1>
            <p className="mt-2 text-sm text-text2">
              Beli sekali, akses selamanya. Pembayaran aman via Midtrans.
            </p>

            {detail === null ? (
              <div className="mt-8 grid place-items-center py-10">
                <Loader2 className="size-6 animate-spin text-accent" />
              </div>
            ) : missing.length > 0 ? (
              <p className="mt-8 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
                Produk tidak dikenali: {missing.join(", ")}
              </p>
            ) : (
              <>
                <div className="mt-6 flex flex-col gap-3">
                  {detail.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg2 p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-snug">{d.name}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold">{formatIDR(d.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
                  <span className="text-sm font-semibold text-text2">Total</span>
                  <span className="text-2xl font-black tracking-tight">
                    {formatIDR(total)}
                  </span>
                </div>

                {error && (
                  <p className="mt-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  disabled={busy}
                  onClick={onPay}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-bold text-white shadow-[0_6px_24px_rgba(225,29,72,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="size-4" />
                      Bayar Sekarang
                    </>
                  )}
                </button>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-text3">
                  <Zap className="size-4 text-gold" />
                  Akses instan setelah pembayaran terkonfirmasi
                </p>
              </>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}
