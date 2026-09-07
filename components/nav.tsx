"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import Logo from "./logo";
import ThemeToggle from "./theme-toggle";
import { useAuth } from "@/lib/insforge/auth-provider";
import { signOut } from "@/app/actions";

const links = [
  { href: "#produk", label: "Produk" },
  { href: "#demo", label: "Demo Kartu" },
  { href: "#harga", label: "Harga" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function onSignOut() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[40]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div
          className={`mt-3 flex h-16 items-center justify-between rounded-2xl px-4 transition-all duration-300 ${
            scrolled
              ? "glass shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
              : "border border-transparent bg-transparent"
          }`}
        >
          <a href="#" aria-label="TuPoLingo beranda">
            <Logo />
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-text2 transition-colors hover:text-text"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {user ? (
              <>
                <span className="hidden max-w-[180px] truncate text-sm font-medium text-text2 sm:inline">
                  {user.email}
                </span>
                <a
                  href="/dashboard"
                  className="hidden items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_18px_rgba(225,29,72,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.97] sm:inline-flex"
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </a>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-text2 transition-colors hover:text-text sm:inline-flex"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="hidden items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-text2 transition-colors hover:text-text sm:inline-flex"
                >
                  Masuk
                </a>
                <a
                  href="/dashboard"
                  className="hidden items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_18px_rgba(225,29,72,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.97] sm:inline-flex"
                >
                  Beli Sekarang
                  <ArrowRight className="size-4" />
                </a>
              </>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
              className="grid size-9 place-items-center rounded-full border border-line bg-surface text-text lg:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass mx-4 mt-2 rounded-2xl p-3 lg:hidden"
          >
            <nav className="flex flex-col" aria-label="Navigasi mobile">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-text2 transition-colors hover:bg-bg2 hover:text-text"
                >
                  {l.label}
                </a>
              ))}
              {user ? (
                <>
                  <a
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
                  >
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onSignOut();
                    }}
                    className="mt-1 rounded-xl px-4 py-3 text-sm font-medium text-text2 transition-colors hover:bg-bg2 hover:text-text"
                  >
                    Keluar ({user.email})
                  </button>
                </>
              ) : (
                <a
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
                >
                  Masuk
                  <ArrowRight className="size-4" />
                </a>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}