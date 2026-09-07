import { Layers } from "lucide-react";

const LEVELS = [
  { level: 1, count: 300 },
  { level: 2, count: 200 },
  { level: 3, count: 500 },
  { level: 4, count: 1000 },
  { level: 5, count: 1600 },
  { level: 6, count: 1800 },
];

const TOTAL = LEVELS.reduce((s, l) => s + l.count, 0);

export default function FlashcardStats() {
  return (
    <section id="flashcards" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-text3 uppercase">
            <Layers className="size-4 text-gold" />
            Flashcard HSK 3.0
          </span>
          <h2 className="mt-4 font-hanzi text-3xl font-black tracking-tight sm:text-5xl">
            {TOTAL.toLocaleString("id-ID")}+ kartu flashcard
          </h2>
          <p className="mx-auto mt-5 max-w-[58ch] text-base leading-relaxed text-text2 sm:text-lg">
            Dek kosakata lengkap HSK 3.0 dari level 1 sampai 6 — pinyin, arti, dan animasi urutan
            goresan di setiap kartu.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {LEVELS.map((l) => (
            <div
              key={l.level}
              className="flex flex-col items-center justify-center gap-1 rounded-3xl border border-line bg-bg2 px-4 py-8 text-center"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-text3 uppercase">
                HSK {l.level}
              </span>
              <span className="font-hanzi text-3xl font-black text-gold">
                {l.count.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-text3">kartu</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
