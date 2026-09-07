export type Flashcard = {
  hanzi: string;
  pinyin: string;
  definition: string;
  pos: string;
  hsk_level?: number;
};

export type ProductType =
  | "writing_pdf"
  | "flashcards"
  | "writing_flashcards"
  | "chrome_ext";

export type Product = {
  id: string;
  name: string;
  product_type: ProductType;
  hsk_level: number | null;
  price_idr: number;
};

export type Entitlement = {
  product_id: string;
  granted_at: string;
};

export type DeckResponse = {
  entitled: boolean;
  level: number;
  cards?: Flashcard[];
  sample?: Flashcard[];
  total: number;
};

export type StrokeData = {
  character: string;
  strokes: string[];
  medians: number[][][];
};

export type FulfillResult = {
  active: boolean;
  type: ProductType | string;
  level?: number | null;
  pdf_url?: string;
  store_url?: string | null;
  message?: string;
};
