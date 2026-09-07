"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  PartyPopper,
  RotateCcw,
  Shuffle,
  Volume2,
  Zap,
} from "lucide-react";
import { fetchDeck } from "@/lib/insforge/api";
import { useAuth } from "@/lib/insforge/auth-provider";
import type { Flashcard } from "@/lib/insforge/types";
import StrokeAnim from "./stroke-anim";

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

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LEVELS = [1, 2, 3, 4, 5, 6];

export default function FlashcardPlayer() {
  const reduce = useReducedMotion();
  const { user } = useAuth();
  const [level, setLevel] = useState(1);
  const [entitled, setEntitled] = useState(false);
  const [total, setTotal] = useState(0);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [done, setDone] = useState<Flashcard[]>([]);
  const [repeated, setRepeated] = useState<Flashcard[]>([]);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [flipped, setFlipped] = useState(false);
  const [justPlayed, setJustPlayed] = useState(false);

  const storageKey = useMemo(
    () => `tupolingo-fc-${user?.id ?? "guest"}-L${level}`,
    [user, level],
  );

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("level");
    const n = parseInt(q ?? "", 10);
    if (n >= 1 && n <= 6) setLevel(n);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setKnown(new Set(JSON.parse(raw) as string[]));
    } catch {
      setKnown(new Set());
    }
  }, [storageKey]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDeck(level).then((d) => {
      if (cancelled) return;
      const deck = d?.entitled ? (d.cards ?? []) : (d?.sample ?? []);
      setEntitled(d?.entitled ?? false);
      setTotal(d?.total ?? 0);
      setCards(deck);
      setQueue(deck);
      setDone([]);
      setRepeated([]);
      setFlipped(false);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [level]);

  const persistKnown = useCallback(
    (next: Set<string>) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {}
    },
    [storageKey],
  );

  const card = queue[0];
  const finished = !loading && cards.length > 0 && queue.length === 0;

  const markKnown = useCallback(() => {
    if (!card) return;
    setDone((d) => [...d, card]);
    const next = new Set(known);
    next.add(card.hanzi);
    setKnown(next);
    persistKnown(next);
    setQueue((q) => q.slice(1));
    setFlipped(false);
  }, [card, known, persistKnown]);

  const markRepeat = useCallback(() => {
    if (!card) return;
    setRepeated((r) => [...r, card]);
    setQueue((q) => [...q.slice(1), q[0]]);
    setFlipped(false);
  }, [card]);

  const restart = useCallback(
    (shuffle: boolean) => {
      setQueue(shuffle ? shuffleArr(cards) : cards);
      setDone([]);
      setRepeated([]);
      setFlipped(false);
    },
    [cards],
  );

  const goTo = useCallback(
    (dir: 1 | -1) => {
      setFlipped(false);
      setQueue((q) => {
        if (q.length === 0) return q;
        if (dir === 1) return [...q.slice(1), q[0]];
        return [q[q.length - 1], ...q.slice(0, -1)];
      });
    },
    [],
  );

  const play = useCallback(() => {
    if (!card) return;
    speak(card.hanzi);
    setJustPlayed(true);
    window.setTimeout(() => setJustPlayed(false), 600);
  }, [card]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished || !card) return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((v) => !v);
      } else if (e.key === "ArrowRight") {
        goTo(1);
      } else if (e.key === "ArrowLeft") {
        goTo(-1);
      } else if (e.key === "1") {
        markRepeat();
      } else if (e.key === "2" && flipped) {
        markKnown();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, finished, flipped, goTo, markKnown, markRepeat]);

  const chars = useMemo(() => (card ? [...card.hanzi] : []), [card]);
  const progressPct = cards.length > 0 ? (done.length / cards.length) * 100 : 0;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-center gap-2">
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
      </div>

      <p className="mt-4 text-center text-sm text-text2">
        HSK {level} ·{" "}
        {entitled ? (
          <span className="text-gold">
            {total} kartu · akses penuh
          </span>
        ) : (
          <span className="text-text3">
            {total} kartu total · {cards.length} kartu contoh
          </span>
        )}
      </p>

      {loading ? (
        <div className="mt-12 grid h-[380px] place-items-center text-text3">
          Memuat kartu…
        </div>
      ) : cards.length === 0 ? (
        <div className="mt-12 grid h-[380px] place-items-center text-text3">
          Tidak ada kartu.
        </div>
      ) : finished ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 rounded-3xl border border-gold/30 bg-gold/5 p-10 text-center"
        >
          <PartyPopper className="mx-auto size-10 text-gold" />
          <h2 className="mt-4 font-hanzi text-2xl font-black">Dek selesai! 🎉</h2>
          <p className="mt-2 text-text2">
            Kamu menyelesaikan {cards.length} kartu HSK {level}.
          </p>
          <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
            <div className="rounded-2xl border border-line bg-bg2 p-4">
              <p className="text-3xl font-black text-gold">{done.length}</p>
              <p className="mt-1 text-xs text-text3">kartu ditandai hafal</p>
            </div>
            <div className="rounded-2xl border border-line bg-bg2 p-4">
              <p className="text-3xl font-black text-accent">{repeated.length}</p>
              <p className="mt-1 text-xs text-text3">kartu diulang</p>
            </div>
          </div>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => restart(false)}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white shadow-[0_4px_18px_rgba(225,29,72,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              <RotateCcw className="size-4" />
              Ulangi Dek
            </button>
            <button
              type="button"
              onClick={() => restart(true)}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-bold text-text transition-colors hover:border-accent/50 hover:text-accent"
            >
              <Shuffle className="size-4" />
              Acak & Ulangi
            </button>
          </div>
          <p className="mt-5 text-xs text-text3">
            Total hafal permanen di HSK {level}: {known.size} kartu
          </p>
        </motion.div>
      ) : (
        <>
          <div className="mx-auto mt-6 max-w-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-text3">
              <span>
                Hafal {done.length}/{cards.length}
              </span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full border border-line bg-bg2">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent to-gold"
                initial={false}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-sm flex-col items-center">
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
                className="relative h-[380px] w-[280px] cursor-pointer select-none sm:h-[420px] sm:w-[320px]"
                role="button"
                aria-label={`Kartu ${card.hanzi}`}
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
                  <div className="relative flex h-full flex-col items-center justify-between p-6">
                    <div className="flex w-full items-center justify-between">
                      <span className="text-[10px] font-bold tracking-[0.24em] text-white/60 uppercase">
                        HSK {level}
                      </span>
                      <span className="flex items-center gap-1.5">
                        {known.has(card.hanzi) && (
                          <span className="grid size-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
                            <Check className="size-3" />
                          </span>
                        )}
                        <span className="grid size-8 place-items-center rounded-full border border-white/15 bg-white/5 text-[11px] font-semibold text-white/70">
                          {done.length + 1}/{cards.length}
                        </span>
                      </span>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={card.hanzi}
                        initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className={`font-hanzi font-black text-white [text-shadow:0_8px_40px_rgba(225,29,72,0.4)] ${
                          card.hanzi.length > 3
                            ? "text-6xl"
                            : card.hanzi.length > 1
                              ? "text-7xl"
                              : "text-8xl"
                        }`}
                      >
                        {card.hanzi}
                      </motion.span>
                    </AnimatePresence>
                    <div className="flex items-center gap-2 text-white/50">
                      <Zap className="size-4" />
                      <span className="text-xs">Klik untuk balik</span>
                    </div>
                  </div>
                </div>

                <div
                  className="backface-hidden absolute inset-0 overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-[0_30px_70px_rgba(0,0,0,0.4)]"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_80%_0%,rgba(245,158,11,0.22),transparent_60%)]" />
                  <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                    <span className="font-hanzi text-3xl font-bold text-white/85">
                      {card.hanzi}
                    </span>
                    <span className="text-2xl font-bold tracking-wide text-[#f59e0b]">
                      {card.pinyin}
                    </span>
                    <span className="text-lg font-semibold text-white">
                      {card.definition || "—"}
                    </span>
                    {card.pos && (
                      <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/60 uppercase">
                        {card.pos}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        play();
                      }}
                      aria-label="Dengarkan pelafalan"
                      className={`mt-1 grid size-12 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition-transform hover:scale-105 active:scale-95 ${
                        justPlayed ? "scale-110 text-[#f59e0b]" : ""
                      }`}
                    >
                      <Volume2 className="size-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => goTo(-1)}
                aria-label="Kartu sebelumnya"
                className="grid size-11 place-items-center rounded-full border border-line bg-surface text-text2 transition-colors hover:text-text"
              >
                <ArrowLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={markRepeat}
                className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-5 py-3 text-sm font-bold text-accent transition-transform hover:scale-[1.03] active:scale-[0.97]"
              >
                <RotateCcw className="size-4" />
                Ulangi
              </button>
              <button
                type="button"
                onClick={markKnown}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-[0_4px_18px_rgba(5,150,105,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
              >
                <Check className="size-4" />
                Hafal
              </button>
              <button
                type="button"
                onClick={() => restart(true)}
                aria-label="Acak dek"
                className="grid size-11 place-items-center rounded-full border border-line bg-surface text-text2 transition-colors hover:text-text"
              >
                <Shuffle className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => goTo(1)}
                aria-label="Kartu berikutnya"
                className="grid size-11 place-items-center rounded-full border border-line bg-surface text-text2 transition-colors hover:text-text"
              >
                <ArrowRight className="size-5" />
              </button>
            </div>
            <p className="mt-3 text-[11px] text-text3">
              Spasi = balik kartu · panah = navigasi · 1 = ulangi · 2 = hafal
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-line bg-bg2 p-5">
            <p className="text-[11px] font-bold tracking-[0.16em] text-text3 uppercase">
              Urutan goresan
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {chars.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="rounded-2xl border border-line bg-surface p-2">
                    <StrokeAnim char={c} size={72} />
                  </div>
                  <span className="font-hanzi text-sm font-bold text-text2">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {!entitled && (
            <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-gold/30 bg-gold/5 p-6 text-center">
              <Lock className="size-5 text-gold" />
              <p className="text-sm text-text2">
                Ini contoh {cards.length} dari {total} kartu HSK {level}. Beli akses
                untuk membuka seluruh dek + animasi urutan goresan.
              </p>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white"
              >
                Lihat Harga
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
