"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function CtaBand() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-[#e11d48] via-[#be123c] to-[#7f1d1d] px-8 py-16 text-center sm:px-16 sm:py-20"
        >
          <div className="absolute inset-0 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(245,158,11,0.3),transparent_60%)]" />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-4 -top-10 font-hanzi text-[10rem] font-black text-white/10"
          >
            学
          </span>
          <div className="relative">
            <p className="text-[11px] font-bold tracking-[0.22em] text-white/70 uppercase">
              Mulai hari ini
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl font-hanzi text-3xl font-black tracking-tight text-white sm:text-5xl">
              Siap berbicara Mandarin dengan percaya diri?
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
              Ambil All-in-One sekarang dan hemat 60%. Akses semua materi selamanya.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-white px-9 py-4 text-[15px] font-bold text-[#be123c] shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
              >
                Beli Sekarang
                <ArrowRight className="size-4" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-8 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                Coba Demo Kartu
              </a>
            </div>
            <p className="mt-6 inline-flex items-center gap-2 text-xs text-white/70">
              <ShieldCheck className="size-4" />
              Beli sekali. Akses selamanya.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}