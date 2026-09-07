"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, BadgePercent, Crown, ShieldCheck, Zap } from "lucide-react";
import { satuanTiers, bundleTiers, type PricingOption } from "./data";
import { formatIDR } from "./product-grid";

type Mode = "satuan" | "bundel";

function discount(opt: PricingOption) {
  return Math.round((1 - opt.price / opt.value) * 100);
}

function TierCard({ opt, level }: { opt: PricingOption; level: number }) {
  const off = discount(opt);
  const hasLevel = /_L\d+$/.test(opt.id);
  const checkoutId = hasLevel ? opt.id.replace(/_L\d+$/, `_L${level}`) : opt.id;
  const name = hasLevel ? `${opt.name} HSK ${level}` : opt.name;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex flex-col rounded-3xl border p-7 transition-all ${
        opt.featured
          ? "border-gold/60 bg-gradient-to-b from-bg2 to-bg shadow-[0_30px_80px_rgba(245,158,11,0.15)] sm:scale-[1.04]"
          : "border-line bg-bg2"
      }`}
    >
      {opt.featured && (
        <>
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#f59e0b] px-4 py-1.5 text-[11px] font-bold tracking-wide text-black uppercase">
            <span
              aria-hidden
              className="animate-shimmer pointer-events-none absolute inset-0 rounded-full mix-blend-overlay"
            />
            Paling Hemat · {off}%
          </span>
          <span className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-gold text-black">
            <Crown className="size-4" />
          </span>
        </>
      )}

      <p className="text-[11px] font-bold tracking-[0.16em] text-text3 uppercase">
        {opt.featured ? "Bundel Rekomendasi" : opt.hanzi}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <h3 className="text-2xl font-black tracking-tight">{name}</h3>
        <span className="font-hanzi text-xl font-bold text-gold">{opt.hanzi}</span>
      </div>
      <p className="mt-2 text-sm text-text2">{opt.tagline}</p>

      <div className="mt-6">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-black tracking-tight">{formatIDR(opt.price)}</span>
          {off > 0 && (
            <span className="mb-1.5 text-sm text-text3 line-through">
              {formatIDR(opt.value)}
            </span>
          )}
        </div>
        {opt.featured && (
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
            <BadgePercent className="size-4" />
            Hemat {off}% dibanding harga satuan
          </p>
        )}
      </div>

      <ul className="mt-7 flex flex-1 flex-col gap-3">
        {opt.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
              <Check className="size-3" />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <a
        href={`/checkout?items=${checkoutId}`}
        className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-transform hover:scale-[1.02] active:scale-[0.97] ${
          opt.featured
            ? "bg-accent text-white shadow-[0_6px_24px_rgba(225,29,72,0.4)]"
            : "border border-line bg-surface text-text hover:border-accent/50 hover:text-accent"
        }`}
      >
        <Zap className="size-4" />
        {opt.featured ? "Pilih Paket Ini" : "Pilih Paket"}
      </a>
    </motion.div>
  );
}

export default function Pricing() {
  const [mode, setMode] = useState<Mode>("bundel");
  const [level, setLevel] = useState(1);
  const tiers = mode === "bundel" ? bundleTiers : satuanTiers;

  return (
    <section id="harga" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-semibold tracking-[0.18em] text-text3 uppercase">
            Harga & Paket
          </span>
          <h2 className="mt-4 font-hanzi text-3xl font-black tracking-tight sm:text-5xl">
            Pilih cara belajarmu
          </h2>
          <p className="mx-auto mt-5 max-w-[56ch] text-base leading-relaxed text-text2 sm:text-lg">
            Beli per level sesuai kebutuhan, atau ambil All-in-One untuk semua materi dengan harga
            paling hemat.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold">
            <ShieldCheck className="size-4" />
            Beli sekali. Akses selamanya.
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="relative flex items-center rounded-full border border-line bg-surface p-1.5">
            {(["bundel", "satuan"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`relative z-10 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${
                  mode === m ? "text-white" : "text-text2 hover:text-text"
                }`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="pricing-toggle"
                    className="absolute inset-0 -z-10 rounded-full bg-accent shadow-[0_4px_16px_rgba(225,29,72,0.4)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {m === "bundel" ? "Paket Bundel" : "Satuan"}
              </button>
            ))}
          </div>
        </div>

        {mode === "satuan" && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-sm font-medium text-text2">Level HSK:</span>
            {[1, 2, 3, 4, 5, 6].map((n) => (
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
            <p className="ml-2 text-sm text-text3">Produk satuan untuk HSK {level}</p>
          </div>
        )}

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {tiers.map((t) => (
              <div
                key={t.id}
                className={t.featured ? "sm:col-span-2 lg:col-span-1" : ""}
              >
                <TierCard opt={t} level={level} />
              </div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 text-sm text-text2 sm:flex-row sm:gap-8">
          <span className="inline-flex items-center gap-2">
            <Zap className="size-4 text-gold" />
            Akses instan setelah bayar
          </span>
          <span className="inline-flex items-center gap-2">
            <BadgePercent className="size-4 text-gold" />
            Midtrans · Sekali bayar selamanya
          </span>
        </div>
      </div>
    </section>
  );
}