"use client";

import { ArrowLeft } from "lucide-react";
import FlashcardPlayer from "@/components/dashboard/flashcard-player";
import Logo from "@/components/logo";

export default function FlashcardsPage() {
  return (
    <main className="relative min-h-[100dvh] pb-24">
      <div className="hero-mesh pointer-events-none absolute inset-0 -z-10" />
      <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text2 transition-colors hover:text-text"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </a>
        </div>
      </header>
      <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-hanzi text-3xl font-black tracking-tight sm:text-4xl">
            Flashcard HSK 3.0
          </h1>
          <p className="mt-3 text-text2">
            Pilih level, balik kartu untuk lihat pinyin & arti, dan amati urutan
            goresan tiap hanzi.
          </p>
        </div>
        <div className="mt-10">
          <FlashcardPlayer />
        </div>
      </div>
    </main>
  );
}
