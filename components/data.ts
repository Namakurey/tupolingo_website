export type ProductCategory =
  | "Workbook"
  | "Flashcards"
  | "Bundle"
  | "Extension";

export type Product = {
  id: string;
  checkoutId: string;
  title: string;
  hanzi: string;
  category: ProductCategory;
  price: number;
  format: string;
  desc: string;
  features: string[];
  gradient: string;
  accent: "accent" | "gold";
};

export const products: Product[] = [
  {
    id: "all-in-one",
    checkoutId: "bundle_all_in_one",
    title: "All-in-One (Dapet full akses produk HSK 1-6 + Chrome Extension)",
    hanzi: "全套",
    category: "Bundle",
    price: 99999,
    format: "PDF + Flashcard + Chrome Extension",
    desc: "Semua Workbook PDF HSK 1-6, flashcard interaktif tiap level, plus ekstensi Chrome ReadZhongwen.",
    features: [
      "Workbook PDF HSK 1-6",
      "Flashcard interaktif semua level",
      "ReadZhongwen Chrome Extension",
      "Akses selamanya",
    ],
    gradient: "from-rose-950 via-slate-900 to-slate-950",
    accent: "accent",
  },
  {
    id: "writing-workbook",
    checkoutId: "writing_L1",
    title: "HSK Writing Workbook",
    hanzi: "写字",
    category: "Workbook",
    price: 19999,
    format: "Writing Workbook PDF",
    desc: "Workbook latihan menulis hanzi dengan urutan goresan (stroke order) per karakter, per level HSK.",
    features: [
      "Stroke-order progression tiap hanzi",
      "Kotak latihan 田字格",
      "Per level HSK 1-6",
      "Update gratis seumur hidup",
    ],
    gradient: "from-slate-800 via-slate-900 to-black",
    accent: "accent",
  },
  {
    id: "flashcards",
    checkoutId: "flashcards_L1",
    title: "HSK Flashcards",
    hanzi: "闪卡",
    category: "Flashcards",
    price: 9999,
    format: "Interaktif",
    desc: "Dek flashcard interaktif HSK 3.0 per level, lengkap dengan pinyin, arti, dan animasi urutan goresan.",
    features: [
      "Kartu lengkap per level",
      "Pinyin + arti Bahasa Inggris",
      "Animasi stroke order",
      "Audio pelafalan",
    ],
    gradient: "from-rose-950 via-slate-900 to-slate-950",
    accent: "gold",
  },
  {
    id: "writing-flashcards",
    checkoutId: "writing_flashcards_L1",
    title: "Workbook + Flashcards",
    hanzi: "练",
    category: "Bundle",
    price: 24999,
    format: "PDF + Interaktif",
    desc: "Gabungkan workbook PDF dan flashcard interaktif untuk satu level HSK. Hemat dibanding beli terpisah.",
    features: [
      "Workbook PDF level itu",
      "Flashcard interaktif level itu",
      "Hemat Rp 5.000",
      "Akses selamanya",
    ],
    gradient: "from-slate-800 via-slate-900 to-black",
    accent: "gold",
  },
  {
    id: "chrome-ext",
    checkoutId: "chrome_ext_only",
    title: "ReadZhongwen Extension",
    hanzi: "读",
    category: "Extension",
    price: 29999,
    format: "Chrome Extension",
    desc: "Baca halaman web Mandarin seperti native: hover hanzi untuk pinyin, arti, dan level HSK.",
    features: [
      "Hover hanzi → pinyin, arti, part of speech, contoh kalimat, bahkan level HSK.",
      "Deteksi level HSK",
      "Berfungsi di semua tulisan hanzi simplified chinese",
    ],
    gradient: "from-rose-950 via-slate-900 to-slate-950",
    accent: "accent",
  },
];

export type Flashcard = {
  hanzi: string;
  pinyin: string;
  meaning: string;
};

export const flashcards: Flashcard[] = [
  { hanzi: "你好", pinyin: "nǐ hǎo", meaning: "Halo" },
  { hanzi: "谢谢", pinyin: "xiè xie", meaning: "Terima kasih" },
  { hanzi: "学习", pinyin: "xué xí", meaning: "Belajar" },
  { hanzi: "朋友", pinyin: "péng you", meaning: "Teman" },
  { hanzi: "中文", pinyin: "zhōng wén", meaning: "Bahasa Mandarin" },
  { hanzi: "再见", pinyin: "zài jiàn", meaning: "Sampai jumpa" },
];

export type Metric = {
  value: number;
  suffix?: string;
  decimals?: number;
  label: string;
};

export const metrics: Metric[] = [
  { value: 5400, suffix: "+", label: "Kartu flashcard HSK 3.0" },
  { value: 1900, suffix: "+", label: "Karakter hanzi" },
  { value: 6, label: "Level HSK lengkap" },
];

export type Faq = {
  q: string;
  a: string;
};

export const faqs: Faq[] = [
  {
    q: "Cocok untuk pemula yang belum pernah belajar Mandarin?",
    a: "Sangat cocok. Semua materi disusun bertahap dari HSK 1, dimulai dari pengenalan nada dan pinyin sebelum masuk ke kosakata dan grammar.",
  },
  {
    q: "Apa itu HSK 3.0?",
    a: "HSK 3.0 adalah standar terbaru ujian resmi Bahasa Mandarin (Hànyǔ Shuǐpíng Kǎoshì) dengan 6 level. Materi kami memakai daftar kosakata resmi HSK 3.0 level 1 sampai 6.",
  },
  {
    q: "Bagaimana cara mengakses materi setelah membeli?",
    a: "Instan. Setelah pembayaran diverifikasi, semua materi langsung tersedia di dashboard akun Anda untuk diunduh atau diakses kapan pun.",
  },
  {
    q: "Apakah aksesnya berbayar per bulan?",
    a: "Tidak. Semua pembelian bersifat sekali bayar dan berlaku selamanya (lifetime). Anda dapat mengaksesnya dari perangkat mana pun, kapan pun, tanpa biaya tambahan.",
  },
  {
    q: "Apakah flashcard termasuk animasi urutan goresan?",
    a: "Ya. Setiap kartu menampilkan karakter, pinyin, arti, dan animasi urutan goresan (stroke order) untuk tiap hanzi.",
  },
  {
    q: "Kapan ekstensi Chrome ReadZhongwen tersedia?",
    a: "Ekstensi masih dalam tahap penyiapan di Chrome Web Store. Pembeli sudah tercatat memiliki lisensinya — link instalasi akan muncul di dashboard begitu siap.",
  },
];

export type PricingOption = {
  id: string;
  name: string;
  hanzi: string;
  price: number;
  value: number;
  tagline: string;
  features: string[];
  featured?: boolean;
};

export const satuanTiers: PricingOption[] = [
  {
    id: "writing_L1",
    name: "Writing Workbook",
    hanzi: "写字",
    price: 19999,
    value: 19999,
    tagline: "PDF per level (HSK 1-6)",
    features: ["Stroke-order progression", "Kotak 田字格", "Per level"],
  },
  {
    id: "writing_flashcards_L1",
    name: "Workbook + Flashcard",
    hanzi: "练",
    price: 24999,
    value: 29998,
    tagline: "PDF + flashcard per level",
    features: ["Workbook PDF", "Flashcard interaktif", "Hemat Rp 5.000"],
  },
  {
    id: "flashcards_L1",
    name: "Flashcards",
    hanzi: "闪卡",
    price: 9999,
    value: 9999,
    tagline: "Dek interaktif per level",
    features: ["Kartu HSK 3.0", "Pinyin + arti", "Animasi goresan"],
  },
  {
    id: "chrome_ext_only",
    name: "ReadZhongwen",
    hanzi: "读",
    price: 29999,
    value: 29999,
    tagline: "Ekstensi Chrome, semua level",
    features: ["Hover pinyin & arti", "Deteksi level HSK", "Lifetime"],
  },
];

export const bundleTiers: PricingOption[] = [
  {
    id: "bundle_all_in_one",
    name: "All-in-One (Dapet full akses produk HSK 1-6 + Chrome Extension)",
    hanzi: "全套",
    price: 99999,
    value: 209987,
    tagline: "Workbook + flashcard semua level + ekstensi",
    features: [
      "Workbook PDF HSK 1-6",
      "Flashcard semua level",
      "ReadZhongwen Extension",
      "Akses selamanya",
    ],
    featured: true,
  },
];
