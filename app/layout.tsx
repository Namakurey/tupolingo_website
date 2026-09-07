import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Noto_Sans_SC } from "next/font/google";
import { AuthProvider } from "@/lib/insforge/auth-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const noto = Noto_Sans_SC({
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto",
  display: "swap",
  subsets: ["latin", "cyrillic", "vietnamese"],
  preload: false,
});

export const metadata: Metadata = {
  title: "TuPoLingo — Mandarin Mastery Platform",
  description:
    "Kuasai Bahasa Mandarin dengan materi digital premium: Writing Workbook HSK 1-6, Flashcard interaktif HSK 3.0, dan ReadZhongwen Chrome Extension. Beli sekali, akses selamanya.",
  keywords: [
    "belajar mandarin",
    "HSK",
    "writing workbook mandarin",
    "flashcard mandarin",
    "stroke order hanzi",
    "kursus bahasa mandarin",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${noto.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("tupolingo-theme");if(t==="light"){document.documentElement.classList.remove("dark")}else if(t==="dark"){document.documentElement.classList.add("dark")}else if(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches){document.documentElement.classList.remove("dark")}}catch(e){document.documentElement.classList.add("dark")}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key="SB-Mid-client-0W43U70KKWUXDTsA"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}