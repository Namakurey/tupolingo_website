import { Instagram, Mail } from "lucide-react";
import Logo from "./logo";

const productLinks = [
  { label: "Writing Workbook", href: "#produk" },
  { label: "HSK Flashcards", href: "#produk" },
  { label: "ReadZhongwen Extension", href: "#produk" },
];

const navLinks = [
  { label: "Produk", href: "#produk" },
  { label: "Demo Kartu", href: "#demo" },
  { label: "Harga", href: "#harga" },
  { label: "FAQ", href: "#faq" },
];

const socials = [
  {
    label: "Instagram",
    icon: Instagram,
    href: "https://www.instagram.com/tupolingo/",
  },
];

export default function Footer() {
  return (
    <footer id="footer" className="border-t border-line bg-bg2/40">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-text2">
              Mandarin Learning Platform yang membantu pelajar Indonesia dan Overseas menguasai
              Bahasa Mandarin dengan materi premium: e-book, flashcards, digital tools, dan masih
              banyak lagi.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid size-10 place-items-center rounded-full border border-line bg-surface text-text2 transition-colors hover:border-accent/50 hover:text-accent"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Navigasi footer">
            <p className="text-[11px] font-bold tracking-[0.18em] text-text3 uppercase">Navigasi</p>
            <ul className="mt-5 space-y-3">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-text2 transition-colors hover:text-text">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-text3 uppercase">Produk</p>
            <ul className="mt-5 space-y-3">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-text2 transition-colors hover:text-text">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="mailto:namakureynard@gmail.com"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent"
            >
              <Mail className="size-4" />
              namakureynard@gmail.com
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
          <p className="text-xs text-text3">
            © {new Date().getFullYear()} TuPoLingo. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wide text-text3 uppercase">
            <span className="rounded-md border border-line px-2.5 py-1">Midtrans</span>
            <span className="rounded-md border border-line px-2.5 py-1">Lifetime Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
}