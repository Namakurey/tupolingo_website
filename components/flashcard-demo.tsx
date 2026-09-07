"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Volume2, ArrowLeft, ArrowRight, RotateCcw, MousePointerClick, Zap } from "lucide-react";
import MeshBg from "@/components/mesh-bg";
import { flashcards } from "./data";

function speak(hanzi: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(hanzi);
  u.lang = "zh-CN";
  u.rate = 0.8;
  const voice = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang.toLowerCase().startsWith("zh"));
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

export default function FlashcardDemo() {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [justPlayed, setJustPlayed] = useState(false);
  const reduce = useReducedMotion();

  const card = flashcards[idx];

  const goTo = useCallback((next: number) => {
    setFlipped(false);
    setIdx((next + flashcards.length) % flashcards.length);
  }, []);

  const play = useCallback(() => {
    speak(card.hanzi);
    setJustPlayed(true);
    window.setTimeout(() => setJustPlayed(false), 600);
  }, [card.hanzi]);

  return (
    <section id="demo" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
        <MeshBg />
      </div>
      <div className="relative mx-auto max-w-[1200px] px-4 pt-56 sm:px-6 sm:pt-72">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-semibold tracking-[0.18em] text-text3 uppercase">
            Interactive Demo
          </span>
          <h2 className="mt-4 font-hanzi text-3xl font-black tracking-tight sm:text-5xl">
            Coba kartu kosakatanya, tanpa daftar dulu
          </h2>
          <p className="mx-auto mt-5 max-w-[58ch] text-base leading-relaxed text-text2 sm:text-lg">
            Tekan kartunya untuk membalik dari Hanzi ke pinyin dan artinya. Tekan ikon suara untuk
            mendengar pelafalan native speaker.
          </p>
        </div>

        <div className="mx-auto mt-14 flex max-w-3xl flex-col items-center">
          <div className="[perspective:1200px]">
            <motion.div
              onClick={() => setFlipped((v) => !v)}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 130, damping: 18 }
              }
              style={{ transformStyle: "preserve-3d" }}
              className="relative h-[400px] w-[300px] cursor-pointer select-none sm:h-[430px] sm:w-[340px]"
              role="button"
              aria-label={`Kartu ${card.hanzi}, klik untuk membalik`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFlipped((v) => !v);
                }
              }}
            >
              <div className="backface-hidden absolute inset-0 overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-slate-800 via-slate-900 to-black shadow-[0_30px_70px_rgba(0,0,0,0.4)]">
                <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_20%_0%,rgba(225,29,72,0.3),transparent_60%)]" />
                <div className="relative flex h-full flex-col items-center justify-between p-7">
                  <div className="flex w-full items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.24em] text-white/60 uppercase">
                      Hanzi
                    </span>
                    <span className="grid size-8 place-items-center rounded-full border border-white/15 bg-white/5 text-[11px] font-semibold text-white/70">
                      {idx + 1}/{flashcards.length}
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={card.hanzi}
                      initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      className="font-hanzi text-8xl font-black text-white [text-shadow:0_8px_40px_rgba(225,29,72,0.4)]"
                    >
                      {card.hanzi}
                    </motion.span>
                  </AnimatePresence>
                  <div className="flex items-center gap-2 text-white/50">
                    <MousePointerClick className="size-4" />
                    <span className="text-xs">Klik untuk balik</span>
                  </div>
                </div>
              </div>

              <div
                className="backface-hidden absolute inset-0 overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-[0_30px_70px_rgba(0,0,0,0.4)]"
                style={{ transform: "rotateY(180deg)" }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_80%_0%,rgba(245,158,11,0.22),transparent_60%)]" />
                <div className="relative flex h-full flex-col items-center justify-center gap-5 p-7 text-center">
                  <span className="font-hanzi text-4xl font-bold text-white/85">{card.hanzi}</span>
                  <span className="text-3xl font-bold tracking-wide text-[#f59e0b]">
                    {card.pinyin}
                  </span>
                  <span className="text-xl font-semibold text-white">{card.meaning}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      play();
                    }}
                    aria-label={`Dengarkan pelafalan ${card.hanzi}`}
                    className={`mt-2 grid size-14 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition-transform hover:scale-105 active:scale-95 ${
                      justPlayed ? "scale-110 text-[#f59e0b]" : ""
                    }`}
                  >
                    <Volume2 className="size-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-9 flex items-center gap-3">
            <button
              type="button"
              onClick={() => goTo(idx - 1)}
              aria-label="Kartu sebelumnya"
              className="grid size-11 place-items-center rounded-full border border-line bg-surface text-text2 transition-colors hover:text-text"
            >
              <ArrowLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={play}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_18px_rgba(225,29,72,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              <Zap className="size-4" />
              Dengarkan
            </button>
            <button
              type="button"
              onClick={() => goTo(idx + 1)}
              aria-label="Kartu berikutnya"
              className="grid size-11 place-items-center rounded-full border border-line bg-surface text-text2 transition-colors hover:text-text"
            >
              <ArrowRight className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setFlipped(false)}
              aria-label="Balik ke depan"
              className="grid size-11 place-items-center rounded-full border border-line bg-surface text-text2 transition-colors hover:text-text"
            >
              <RotateCcw className="size-5" />
            </button>
          </div>

          <p className="mt-6 inline-flex items-center gap-2 text-xs text-text3">
            <Zap className="size-3.5 text-gold" />
            Audio & kartu penuh tersedia di semua paket
          </p>
        </div>
      </div>
    </section>
  );
}