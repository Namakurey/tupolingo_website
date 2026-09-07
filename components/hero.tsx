"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useScroll,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, PenTool, Layers } from "lucide-react";

const headline = ["Bicara", "Mandarin,", "dari", "nol", "sampai", "fasih."];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const word = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function EBookCover() {
  return (
    <div className="relative aspect-[3/4.2] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-black shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_10%_0%,rgba(225,29,72,0.35),transparent_55%),radial-gradient(130%_100%_at_100%_100%,rgba(245,158,11,0.22),transparent_55%)]" />
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#f59e0b] via-[#e11d48] to-[#7f1d1d]" />
      <div className="absolute inset-0 rounded-2xl border border-white/10" />
      <div className="relative flex h-full flex-col p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold tracking-[0.2em] text-white/90 uppercase">
            TuPoLingo
          </span>
          <span className="h-px w-10 bg-[#f59e0b]" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <span className="font-hanzi text-7xl font-black text-white/95 [text-shadow:0_0_40px_rgba(225,29,72,0.45)] sm:text-8xl">
            写字
          </span>
        </div>
        <div>
          <div className="mb-3 h-1.5 w-16 rounded-full bg-gradient-to-r from-[#e11d48] to-[#f59e0b]" />
          <p className="text-base font-semibold text-white">HSK Writing Workbook</p>
          <p className="text-sm text-white/60">Stroke-order · 1.800+ hanzi · PDF per level</p>
        </div>
      </div>
    </div>
  );
}

function TiltCard() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [9, -9]), {
    stiffness: 160,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-11, 11]), {
    stiffness: 160,
    damping: 20,
  });
  const glareX = useTransform(mx, [0, 1], ["20%", "80%"]);
  const glareY = useTransform(my, [0, 1], ["15%", "85%"]);
  const glareBg = useMotionTemplate`radial-gradient(220px 220px at ${glareX} ${glareY}, rgba(255,255,255,0.14), transparent 60%)`;

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, transformPerspective: 1000 }}
      className="relative w-full max-w-[480px] cursor-grab select-none"
    >
      <motion.div
        style={{ background: glareBg }}
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
      />
      <EBookCover />
    </motion.div>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={heroRef} className="hero-mesh relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line to-transparent" />

      <motion.div
        style={reduce ? undefined : { y: orbY, opacity: fade }}
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-32 size-96 rounded-full bg-[radial-gradient(circle,rgba(225,29,48,0.22),transparent_65%)] blur-2xl"
      />
      <motion.div
        style={reduce ? undefined : { y: orbY }}
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.16),transparent_65%)] blur-2xl"
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col justify-center px-4 pt-28 pb-20 sm:px-6 lg:px-16">
        <div className="w-full max-w-5xl xl:max-w-4xl">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 flex items-center gap-3 lg:mb-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-text2 uppercase">
              <span className="size-1.5 rounded-full bg-gold" />
              Mandarin Mastery Platform
            </span>
          </motion.div>

          <motion.h1
            variants={container}
            initial="hidden"
            animate="show"
            className="font-hanzi text-[2.6rem] leading-[1.08] font-black tracking-tight sm:text-6xl lg:text-[4.2rem]"
          >
            {headline.map((w, i) => (
              <motion.span
                key={i}
                variants={word}
                className={`inline-block mr-[0.28em] pb-1 ${
                  i === 1 ? "text-gold" : i === 5 ? "italic text-accent" : ""
                }`}
              >
                {w}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-[52ch] text-base font-medium leading-relaxed text-text sm:text-lg"
          >
            Materi digital premium HSK 1-6: workbook menulis, flashcard interaktif, dan ekstensi
            Chrome ReadZhongwen. Akses selamanya mulai Rp 9.999.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:items-center"
          >
            <motion.a
              href="/dashboard"
              whileHover={{ scale: reduce ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="animate-pulse-ring inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-[15px] font-bold text-white shadow-[0_6px_24px_rgba(225,29,72,0.4)]"
            >
              Beli Sekarang
              <ArrowRight className="size-4" />
            </motion.a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white/85 px-7 py-4 text-[15px] font-semibold text-text backdrop-blur-sm transition-colors hover:border-gold/50 hover:bg-white/95 hover:text-gold dark:bg-black/85 dark:hover:bg-black/95"
            >
              Coba Demo Kartu
            </a>
          </motion.div>

          <div className="mt-8 flex flex-wrap gap-6 sm:mt-10 sm:gap-12 lg:mt-14 lg:gap-16">
            {[
              { value: "5.400+", label: "Kartu flashcard HSK 3.0" },
              { value: "1.900+", label: "Karakter hanzi" },
              { value: "6", label: "Level HSK lengkap" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-inter text-2xl font-bold tracking-tight text-text sm:text-4xl lg:text-5xl">
                  {s.value}
                </p>
                <p className="mt-1 font-inter text-[9px] uppercase tracking-widest text-text3 sm:text-xs">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating elements over 3D mesh — right side */}
        <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-0 lg:flex">
          <span
            aria-hidden
            className="pointer-events-none -rotate-90 -mr-20 font-hanzi text-[3.5rem] font-black tracking-widest text-text3/20"
          >
            零到流利
          </span>

          {/* TiltCard — interactive flashcard on right */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <TiltCard />
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="animate-float absolute right-4 top-[15%] hidden lg:block"
        >
          <div className="glass rounded-2xl p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#e11d48] to-[#9f1239] text-white">
                <Layers className="size-5" />
              </span>
              <div className="text-xs leading-tight">
                <p className="font-bold">5.400+ kartu</p>
                <p className="text-text3">HSK 3.0 flashcard</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="animate-float-slow absolute bottom-[13%] right-28 hidden lg:block"
        >
          <div className="glass rounded-2xl p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#b45309] text-white">
                <PenTool className="size-5" />
              </span>
              <div className="text-xs leading-tight">
                <p className="font-bold">1.800+ hanzi</p>
                <p className="text-text3">Urutan goresan</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.35, duration: 0.5 }}
          className="animate-float absolute bottom-[17%] right-4 hidden lg:block"
        >
          <div className="glass rounded-2xl px-4 py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-2">
              <span className="font-hanzi text-lg font-black text-accent">你</span>
              <span className="text-[10px] font-semibold text-text2">
                nǐ — kamu
                <span className="block text-text3">kartu demo</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
