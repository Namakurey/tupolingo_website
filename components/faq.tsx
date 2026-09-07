"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import { faqs } from "./data";

export default function Faq() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-hanzi text-3xl font-black tracking-tight sm:text-5xl">
            FAQ
          </h2>
        </div>

        <div className="mt-12 divide-y divide-line rounded-3xl border border-line bg-bg2">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-base font-semibold sm:text-lg">{f.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={`grid size-8 shrink-0 place-items-center rounded-full border border-line ${
                      isOpen ? "text-accent" : "text-text3"
                    }`}
                  >
                    <ChevronDown className="size-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-sm leading-relaxed text-text2 sm:text-base">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-text2">
          Tidak menemukan jawaban?{" "}
          <a
            href="#footer"
            className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
          >
            <MessageCircle className="size-4" />
            Hubungi kami
          </a>
        </p>
      </div>
    </section>
  );
}