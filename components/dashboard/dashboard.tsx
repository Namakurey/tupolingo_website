"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Chrome,
  Download,
  Layers,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { signOut } from "@/app/actions";
import Logo from "@/components/logo";
import WorkbookPreview from "@/components/previews/workbook-preview";
import FlashcardDeckPreview from "@/components/previews/flashcard-deck-preview";
import ExtensionPreview from "@/components/previews/extension-preview";
import { useAuth } from "@/lib/insforge/auth-provider";
import { fetchEntitlements, fulfill, formatIDR } from "@/lib/insforge/api";
import type { Entitlement, Product } from "@/lib/insforge/types";

type Bundle = {
  id: string;
  name: string;
  price: number;
  features: string[];
  featured?: boolean;
};

const BUNDLES: Bundle[] = [
  {
    id: "bundle_all_in_one",
    name: "All-in-One",
    price: 99999,
    features: ["Workbook PDF semua level", "Flashcard semua level", "ReadZhongwen Extension"],
    featured: true,
  },
];

const LEVELS = [1, 2, 3, 4, 5, 6];

const BUNDLE_CONTENTS: Record<string, string[]> = {
  bundle_all_in_one: [
    ...LEVELS.map((n) => `writing_L${n}`),
    ...LEVELS.map((n) => `flashcards_L${n}`),
    "chrome_ext_only",
  ],
};

type SatuanItem = {
  key: string;
  hanzi: string;
  name: string;
  desc: string;
  price: number;
  pattern: string;
};

const SATUAN: SatuanItem[] = [
  {
    key: "writing",
    hanzi: "写字",
    name: "Writing Workbook",
    desc: "PDF stroke-order",
    price: 19999,
    pattern: "writing_L{n}",
  },
  {
    key: "flashcards",
    hanzi: "闪卡",
    name: "Flashcards",
    desc: "Dek interaktif",
    price: 9999,
    pattern: "flashcards_L{n}",
  },
  {
    key: "combo",
    hanzi: "练",
    name: "Workbook + Flashcard",
    desc: "PDF + dek",
    price: 24999,
    pattern: "writing_flashcards_L{n}",
  },
];

function typeLabel(t: string) {
  switch (t) {
    case "writing_pdf":
      return "Workbook PDF";
    case "flashcards":
      return "Flashcard";
    case "writing_flashcards":
      return "Workbook + Flashcard";
    case "chrome_ext":
      return "Chrome Extension";
    default:
      return t;
  }
}

function previewFor(type: string) {
  switch (type) {
    case "writing_pdf":
      return <WorkbookPreview />;
    case "flashcards":
      return <FlashcardDeckPreview />;
    case "chrome_ext":
      return <ExtensionPreview />;
    default:
      return null;
  }
}

function previewsFor(key: string) {
  switch (key) {
    case "writing":
      return [<WorkbookPreview key="wb" />];
    case "flashcards":
      return [<FlashcardDeckPreview key="fc" />];
    case "combo":
      return [<WorkbookPreview key="wb" />, <FlashcardDeckPreview key="fc" />];
    case "chrome_ext":
      return [<ExtensionPreview key="ex" />];
    case "bundle":
      return [
        <WorkbookPreview key="wb" />,
        <FlashcardDeckPreview key="fc" />,
        <ExtensionPreview key="ex" />,
      ];
    default:
      return [];
  }
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [paidBanner, setPaidBanner] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("paid");
    if (q === "1") {
      setPaidBanner(true);
      setReloadKey((k) => k + 1);
      window.history.replaceState(null, "", "/dashboard");
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/dashboard");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchEntitlements().then((r) => {
      if (cancelled) return;
      setEntitlements(r.entitlements);
      setProducts(r.products);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [user, reloadKey]);

  const productById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  );

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  async function onDownload(productId: string) {
    setBusy(productId);
    const { ok, result } = await fulfill(productId);
    setBusy(null);
    if (ok && result?.pdf_url) {
      window.open(result.pdf_url, "_blank", "noopener");
    } else {
      flash("Akses tidak tersedia untuk produk ini.");
    }
  }

  async function onExtension() {
    setBusy("chrome_ext_only");
    const { ok, result } = await fulfill("chrome_ext_only");
    setBusy(null);
    if (ok && result?.store_url) {
      window.open(result.store_url, "_blank", "noopener");
    } else if (ok) {
      flash(result?.message ?? "Link Chrome akan muncul segera.");
    }
  }

  async function onSignOut() {
    await signOut();
    router.replace("/");
    router.refresh();
  }

  if (loading || !user) {
    return (
      <main className="grid min-h-[100dvh] place-items-center">
        <Loader2 className="size-8 animate-spin text-accent" />
      </main>
    );
  }

  const hasAny = entitlements.length > 0;
  const rawOwned = new Set(entitlements.map((e) => e.product_id));
  const owned = new Set(rawOwned);
  for (const id of rawOwned) {
    const combo = id.match(/^writing_flashcards_L(\d)$/);
    if (combo) {
      owned.add(`writing_L${combo[1]}`);
      owned.add(`flashcards_L${combo[1]}`);
    }
  }
  for (let n = 1; n <= 6; n++) {
    if (owned.has(`writing_L${n}`) && owned.has(`flashcards_L${n}`)) {
      owned.add(`writing_flashcards_L${n}`);
    }
  }
  const bundleOwned = (id: string) =>
    (BUNDLE_CONTENTS[id] ?? []).length > 0 &&
    BUNDLE_CONTENTS[id].every((pid) => owned.has(pid));

  // Chrome extension always renders last in the purchased list.
  const sortedEntitlements = [...entitlements].sort(
    (a, b) =>
      Number(a.product_id === "chrome_ext_only") -
      Number(b.product_id === "chrome_ext_only"),
  );

  return (
    <main className="relative min-h-[100dvh] pb-24">
      <div className="hero-mesh pointer-events-none absolute inset-0 -z-10" />
      <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-text2 sm:inline">
              {user.email}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-text2 transition-colors hover:text-accent"
            >
              <LogOut className="size-4" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-hanzi text-3xl font-black tracking-tight sm:text-4xl">
            Dashboard kamu
          </h1>
          <p className="mt-2 text-text2">
            Satu pembelian. Akses selamanya — dari perangkat mana pun, kapan pun.
          </p>
        </motion.div>

        {paidBanner && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4"
          >
            <p className="text-sm font-semibold text-emerald-500">
              Pembelian berhasil! Materi baru sudah aktif di akunmu.
            </p>
            <button
              type="button"
              onClick={() => setPaidBanner(false)}
              aria-label="Tutup"
              className="text-sm font-bold text-emerald-500 hover:text-text"
            >
              OK
            </button>
          </motion.div>
        )}

        {loaded && (
          <section className="mt-10">
            <h2 className="text-[11px] font-bold tracking-[0.18em] text-text3 uppercase">
              Materi kamu
            </h2>

            {!hasAny ? (
              <div className="mt-4 rounded-3xl border border-line bg-bg2 p-10 text-center">
                <Lock className="mx-auto size-8 text-text3" />
                <p className="mt-4 text-lg font-semibold">
                  Kamu belum punya materi.
                </p>
                <p className="mt-1 text-sm text-text2">
                  Pilih paket di bawah untuk mulai belajar.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sortedEntitlements.map((e) => {
                  const p = productById(e.product_id);
                  if (!p) return null;
                  const isPdf =
                    p.product_type === "writing_pdf" ||
                    p.product_type === "writing_flashcards";
                  const isFlash =
                    p.product_type === "flashcards" ||
                    p.product_type === "writing_flashcards";
                  return (
                    <div
                      key={e.product_id}
                      className="flex flex-col rounded-3xl border border-line bg-bg2 p-6"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#e11d48] to-[#9f1239] text-white">
                          {p.product_type === "chrome_ext" ? (
                            <Chrome className="size-5" />
                          ) : p.product_type === "flashcards" ? (
                            <Layers className="size-5" />
                          ) : (
                            <BookOpen className="size-5" />
                          )}
                        </span>
                        <div>
                          <p className="font-bold leading-tight">{typeLabel(p.product_type)}</p>
                          {p.hsk_level && (
                            <p className="text-xs text-text3">HSK {p.hsk_level}</p>
                          )}
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-text3">
                        {p.name}
                      </p>
                      {previewFor(p.product_type) && (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-bg">
                          {previewFor(p.product_type)}
                        </div>
                      )}
                      <div className="mt-auto flex flex-col gap-2 pt-5">
                        {isPdf && (
                          <button
                            type="button"
                            disabled={busy === e.product_id}
                            onClick={() => onDownload(e.product_id)}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                          >
                            {busy === e.product_id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Download className="size-4" />
                            )}
                            Unduh PDF
                          </button>
                        )}
                        {isFlash && (
                          <a
                            href={`/dashboard/flashcards?level=${p.hsk_level ?? 1}`}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-text transition-colors hover:border-accent/50 hover:text-accent"
                          >
                            <Layers className="size-4" />
                            Buka Flashcard
                          </a>
                        )}
                        {p.product_type === "chrome_ext" && (
                          <button
                            type="button"
                            disabled={busy === "chrome_ext_only"}
                            onClick={onExtension}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-text transition-colors hover:border-accent/50 hover:text-accent"
                          >
                            <Chrome className="size-4" />
                            Install Sekarang
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <section className="mt-14">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-gold" />
            <h2 className="text-[11px] font-bold tracking-[0.18em] text-text3 uppercase">
              Beli per level
            </h2>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {LEVELS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setLevel(n)}
                className={`grid size-10 place-items-center rounded-xl text-sm font-bold transition-colors ${
                  level === n
                    ? "bg-accent text-white shadow-[0_4px_16px_rgba(225,29,72,0.4)]"
                    : "border border-line bg-surface text-text2 hover:text-text"
                }`}
              >
                {n}
              </button>
            ))}
            <span className="ml-2 text-sm text-text2">HSK {level}</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SATUAN.map((s) => {
              const pid = s.pattern.replace("{n}", String(level));
              const isOwned = owned.has(pid);
              const dbPrice = productById(pid)?.price_idr;
              return (
                <div
                  key={s.key}
                  className="flex flex-col rounded-2xl border border-line bg-bg2 p-5"
                >
                  <span className="font-hanzi text-lg font-black text-gold">
                    {s.hanzi}
                  </span>
                  <p className="mt-1 font-bold">
                    {s.name} HSK {level}
                  </p>
                  <p className="mt-1 text-sm text-text2">{s.desc}</p>
                  {previewsFor(s.key).length > 0 && (
                    <div className="mt-4 flex flex-col gap-3">
                      {previewsFor(s.key)}
                    </div>
                  )}
                  <p className="mt-3 text-xl font-black">
                    {formatIDR(dbPrice ?? s.price)}
                  </p>
                  <a
                    href={`/checkout?items=${pid}`}
                    aria-disabled={isOwned}
                    className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] ${
                      isOwned
                        ? "pointer-events-none border border-line bg-surface text-text3"
                        : "bg-accent text-white shadow-[0_4px_16px_rgba(225,29,72,0.35)]"
                    }`}
                  >
                    {isOwned ? "Dimiliki" : "Beli"}
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-center gap-2">
            <Chrome className="size-5 text-gold" />
            <h2 className="text-[11px] font-bold tracking-[0.18em] text-text3 uppercase">
              Ekstensi Chrome
            </h2>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col rounded-2xl border border-line bg-bg2 p-5">
              <span className="font-hanzi text-lg font-black text-gold">读</span>
              <p className="mt-1 font-bold">ReadZhongwen</p>
              <p className="mt-1 text-sm text-text2">Hover hanzi → pinyin, arti, part of speech, contoh kalimat, bahkan level HSK.</p>
              <div className="mt-4 flex flex-col gap-3">
                <ExtensionPreview />
              </div>
              <p className="mt-3 text-xl font-black">{formatIDR(29999)}</p>
              <a
                href="/checkout?items=chrome_ext_only"
                aria-disabled={owned.has("chrome_ext_only")}
                className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] ${
                  owned.has("chrome_ext_only")
                    ? "pointer-events-none border border-line bg-surface text-text3"
                    : "bg-accent text-white shadow-[0_4px_16px_rgba(225,29,72,0.35)]"
                }`}
              >
                {owned.has("chrome_ext_only") ? "Dimiliki" : "Beli"}
              </a>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-gold" />
            <h2 className="text-[11px] font-bold tracking-[0.18em] text-text3 uppercase">
              Paket bundel
            </h2>
          </div>
          <p className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
            Beli sekali. Akses selamanya.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BUNDLES.map((b) => {
              const owned = bundleOwned(b.id);
              return (
                <div
                  key={b.id}
                  className={`relative flex flex-col rounded-3xl border p-6 ${
                    b.featured
                      ? "border-gold/60 bg-gradient-to-b from-bg2 to-bg shadow-[0_30px_80px_rgba(245,158,11,0.12)]"
                      : "border-line bg-bg2"
                  }`}
                >
                  {b.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#f59e0b] px-4 py-1 text-[11px] font-bold tracking-wide text-black uppercase">
                      Nilai Terbaik
                    </span>
                  )}
                  <h3 className="text-xl font-black tracking-tight">{b.name}</h3>
                  <p className="mt-3 text-3xl font-black">{formatIDR(b.price)}</p>
                  <ul className="mt-5 flex flex-1 flex-col gap-2">
                    {b.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-text2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-col gap-3">
                    {previewsFor("bundle")}
                  </div>
                  <a
                    href={`/checkout?items=${b.id}`}
                    aria-disabled={owned}
                    className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-transform hover:scale-[1.02] active:scale-[0.97] ${
                      owned
                        ? "pointer-events-none border border-line bg-surface text-text3"
                        : b.featured
                          ? "bg-accent text-white shadow-[0_6px_24px_rgba(225,29,72,0.4)]"
                          : "border border-line bg-surface text-text hover:border-accent/50"
                    }`}
                  >
                    {owned ? "Sudah dimiliki" : "Beli Sekarang"}
                  </a>
                </div>
              );
            })}
          </div>

          <p className="mt-5 flex items-center gap-2 text-xs text-text3">
            <MessageCircle className="size-4 text-gold" />
            Pembayaran diproses via Midtrans — Virtual Account, QRIS, dan metode
            lain. Akses aktif otomatis begitu pembayaran terkonfirmasi.
          </p>
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line bg-bg px-5 py-3 text-sm font-semibold shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
          {toast}
        </div>
      )}
    </main>
  );
}
