"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Check, ArrowRight, Zap, Eye } from "lucide-react";
import type { Product } from "./data";
import { formatIDR } from "./product-grid";
import WorkbookPreview from "./previews/workbook-preview";
import ExtensionPreview from "./previews/extension-preview";
import FlashcardDeckPreview from "./previews/flashcard-deck-preview";

function previews(p: Product) {
  const text = (p.desc + " " + p.features.join(" ")).toLowerCase();
  const out: { name: string; node: React.ReactNode }[] = [];
  if (p.category === "Extension" || text.includes("ekstensi") || text.includes("readzhongwen")) {
    out.push({ name: "ReadZhongwen Chrome Extension", node: <ExtensionPreview /> });
  }
  if (text.includes("workbook") || text.includes("pdf")) {
    out.push({ name: "Writing Workbook PDF", node: <WorkbookPreview /> });
  }
  if (p.category === "Flashcards" || text.includes("flashcard")) {
    out.push({ name: "HSK Flashcards", node: <FlashcardDeckPreview /> });
  }
  return out;
}

type Props = {
  product: Product | null;
  onClose: () => void;
};

export default function QuickViewModal({ product, onClose }: Props) {
  const reduce = useReducedMotion();

  return (
    <Dialog.Root open={!!product} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <AnimatePresence>
          {product && (
            <>
              <Dialog.Overlay forceMount asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
                />
              </Dialog.Overlay>
              <Dialog.Content forceMount asChild>
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 28, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed inset-x-4 top-1/2 z-[95] mx-auto max-h-[88dvh] w-full max-w-3xl -translate-y-1/2 overflow-y-auto rounded-3xl border border-line bg-bg shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br md:w-[42%] md:rounded-l-3xl md:rounded-tr-none">
                      <div
                        className={`relative flex h-64 flex-col justify-between bg-gradient-to-br ${product.gradient} md:h-full`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_0%,rgba(225,29,72,0.35),transparent_55%),radial-gradient(130%_100%_at_90%_100%,rgba(245,158,11,0.22),transparent_55%)]" />
                        <div className="absolute inset-0 border border-white/10" />
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -right-4 bottom-0 font-hanzi text-9xl font-black text-white/10"
                        >
                          {product.hanzi}
                        </span>
                        <div className="relative flex justify-between p-6">
                          <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[10px] font-semibold tracking-wider text-white/85 uppercase backdrop-blur-sm">
                            {product.format}
                          </span>
                        </div>
                        <div className="relative p-6">
                          <p className="font-hanzi text-4xl font-black text-white">{product.hanzi}</p>
                          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/70">
                            <Zap className="size-3.5 text-[#f59e0b]" />
                            Akses selamanya
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-6 sm:p-8">
                      <Dialog.Title className="text-2xl font-black tracking-tight">
                        {product.title}
                      </Dialog.Title>

                      <p className="mt-4 text-sm leading-relaxed text-text2">{product.desc}</p>

                      {previews(product).length > 0 && (
                        <div className="mt-5">
                          <p className="mb-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] text-text3 uppercase">
                            <Eye className="size-3.5 text-gold" />
                            Preview Produk
                          </p>
                          <div className="flex flex-col gap-4">
                            {previews(product).map((pv) => (
                              <div key={pv.name}>
                                <p className="mb-2 text-sm font-semibold">{pv.name}</p>
                                {pv.node}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                        {product.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-7 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs text-text3">Harga</p>
                          <p className="text-3xl font-black tracking-tight">
                            {formatIDR(product.price)}
                          </p>
                        </div>
                        <a
                          href={`/checkout?items=${product.checkoutId}`}
                          onClick={onClose}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-[0_4px_18px_rgba(225,29,72,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
                        >
                          Beli Sekarang
                          <ArrowRight className="size-4" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Tutup"
                      className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-line bg-surface text-text2 transition-colors hover:text-text"
                    >
                      <X className="size-4" />
                    </button>
                  </Dialog.Close>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}