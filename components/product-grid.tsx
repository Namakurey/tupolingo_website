"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Layers,
  Package,
  Chrome,
  Eye,
} from "lucide-react";
import { products, type Product, type ProductCategory } from "./data";
import QuickViewModal from "./quick-view-modal";

const filters: Array<"Semua" | ProductCategory> = [
  "Semua",
  "Workbook",
  "Flashcards",
  "Bundle",
  "Extension",
];

const categoryIcon: Record<ProductCategory, React.ReactNode> = {
  Workbook: <BookOpen className="size-4" />,
  Flashcards: <Layers className="size-4" />,
  Bundle: <Package className="size-4" />,
  Extension: <Chrome className="size-4" />,
};

export function formatIDR(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

function Cover({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${product.gradient} ${
        large ? "h-56 sm:h-72" : "h-44"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_0%,rgba(225,29,72,0.3),transparent_55%),radial-gradient(130%_100%_at_90%_100%,rgba(245,158,11,0.2),transparent_55%)]" />
      <div className="absolute inset-0 border border-white/10" />
      <span
        className={`pointer-events-none absolute -right-2 -bottom-4 font-hanzi font-black text-white/10 ${
          large ? "text-8xl" : "text-7xl"
        }`}
        aria-hidden
      >
        {product.hanzi}
      </span>
      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[10px] font-semibold tracking-wide text-white/85 uppercase backdrop-blur-sm">
            {categoryIcon[product.category]}
            {product.category}
          </span>
          <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold tracking-wider text-[#f59e0b] uppercase backdrop-blur-sm">
            {product.format}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.18em] text-white/55 uppercase">TuPoLingo</p>
            <p className="font-hanzi text-2xl font-black text-white sm:text-3xl">{product.hanzi}</p>
          </div>
          <div
            className={`grid size-9 place-items-center rounded-full ${
              product.accent === "gold"
                ? "bg-[#f59e0b] text-black"
                : "bg-[#e11d48] text-white"
            }`}
          >
            {categoryIcon[product.category]}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Semua");
  const [active, setActive] = useState<Product | null>(null);

  const list =
    filter === "Semua" ? products : products.filter((p) => p.category === filter);

  return (
    <section id="produk" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="font-hanzi text-3xl font-black tracking-tight sm:text-5xl">
            Koleksi produk digital Mandarin
          </h2>
          <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-text2 sm:text-lg">
            Dari kosakata HSK 1-6 sampai template menulis hanzi. Semua disusun oleh pengajar
            berpengalaman, dirancang untuk belajar cepat.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === f
                  ? "bg-accent text-white shadow-[0_4px_16px_rgba(225,29,72,0.35)]"
                  : "border border-line bg-surface text-text2 hover:text-text"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <motion.div
          layout
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.article
                layout
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setActive(p)}
                className={`group cursor-pointer overflow-hidden rounded-3xl border border-line bg-bg2 transition-all duration-300 hover:-translate-y-2 hover:border-accent/50 hover:shadow-[0_24px_60px_rgba(225,29,48,0.18)] ${
                  i === 0 ? "sm:col-span-2" : ""
                }`}
              >
                <div className="p-5 pb-0">
                  <h3 className="text-lg font-bold tracking-tight">{p.title}</h3>
                </div>
                <div className="relative overflow-hidden">
                  <Cover product={p} large={i === 0} />
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </div>
                <div className="flex flex-col gap-3 p-5">
                  <p className="line-clamp-2 text-sm leading-relaxed text-text2">
                    {p.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text3">{p.format}</span>
                    <span className="text-base font-bold">{formatIDR(p.price)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between border-t border-line pt-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      <Eye className="size-4" />
                      Preview Produk
                    </span>
                    <span className="text-xs text-text3">{p.category}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <QuickViewModal product={active} onClose={() => setActive(null)} />
    </section>
  );
}