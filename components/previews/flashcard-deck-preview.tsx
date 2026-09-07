"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Volume2, Zap } from "lucide-react";

export default function FlashcardDeckPreview() {
  const reduce = useReducedMotion();
  return (
    <div className="relative flex justify-center rounded-2xl border border-line bg-bg2 px-6 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <motion.div
        aria-hidden
        initial={reduce ? false : { rotate: 0 }}
        animate={{ rotate: -8 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute h-[190px] w-[140px] rounded-2xl border border-line bg-gradient-to-br from-slate-800 to-slate-900 opacity-70"
        style={{ y: 6 }}
      />
      <motion.div
        aria-hidden
        initial={reduce ? false : { rotate: 0 }}
        animate={{ rotate: 7 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute h-[190px] w-[140px] rounded-2xl border border-line bg-gradient-to-br from-slate-800 to-slate-900 opacity-80"
        style={{ y: 3 }}
      />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="relative z-10 flex h-[190px] w-[140px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 via-slate-900 to-black shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(90%_70%_at_20%_0%,rgba(225,29,72,0.3),transparent_60%)]" />
        <span className="relative font-hanzi text-5xl font-black text-white">学</span>
        <span className="relative text-sm font-bold text-[#f59e0b]">xué</span>
        <span className="relative text-[11px] text-white/70">"belajar"</span>
        <span className="relative flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[9px] font-semibold text-white/60">
          <Volume2 className="size-3" />
          Audio · HSK 1
        </span>
      </motion.div>
      <span className="absolute right-4 bottom-3 inline-flex items-center gap-1 text-[10px] font-semibold text-text3">
        <Zap className="size-3 text-gold" />
        5.400+ kartu · HSK 1-6
      </span>
    </div>
  );
}
