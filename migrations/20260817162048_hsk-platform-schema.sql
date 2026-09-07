-- HSK Learning Platform — core schema + RLS
-- TuPoLingo (InsForge). All tables in public schema.

-- ── 1. Profiles ──────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Products ──────────────────────────────────────────────────────────────
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  product_type TEXT NOT NULL,   -- writing_pdf | flashcards | writing_flashcards | chrome_ext
  hsk_level INTEGER,            -- NULL for level-agnostic products
  price_idr INTEGER NOT NULL
);

-- ── 3. Bundles ───────────────────────────────────────────────────────────────
CREATE TABLE public.bundles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_idr INTEGER NOT NULL,
  included_product_types TEXT[] NOT NULL,
  includes_all_levels BOOLEAN DEFAULT TRUE,
  included_product_ids TEXT[] DEFAULT '{}'
);

-- ── 4. Orders (Midtrans state) ───────────────────────────────────────────────
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  midtrans_order_id TEXT UNIQUE NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',   -- pending | settlement | expire
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. Entitlements (always resolved to individual product_ids) ──────────────
CREATE TABLE public.entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES public.products(id) NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ── 6. Chrome extension tokens ───────────────────────────────────────────────
CREATE TABLE public.extension_tokens (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  secret_token UUID DEFAULT gen_random_uuid(),
  last_used_at TIMESTAMPTZ
);

-- ── 7. Flashcard deck source (word-level, HSK 3.0) ───────────────────────────
CREATE TABLE public.hanzi_data (
  hanzi TEXT PRIMARY KEY,
  hsk_level INTEGER NOT NULL,
  pinyin TEXT NOT NULL,
  definition TEXT NOT NULL DEFAULT '',
  pos TEXT NOT NULL DEFAULT ''
);

-- ── 8. Per-character stroke order (backs stroke animation) ───────────────────
CREATE TABLE public.hanzi_strokes (
  character TEXT PRIMARY KEY,
  strokes JSONB NOT NULL,
  medians JSONB NOT NULL
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_entitlements_user ON public.entitlements(user_id);
CREATE INDEX idx_entitlements_product ON public.entitlements(product_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_hanzi_data_level ON public.hanzi_data(hsk_level);

-- ── Enable RLS ───────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extension_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hanzi_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hanzi_strokes ENABLE ROW LEVEL SECURITY;

-- ── Tighten privilege surface (revoke broad DML, grant exact) ────────────────
-- products / bundles: public read only
REVOKE ALL ON public.products FROM anon, authenticated;
REVOKE ALL ON public.bundles FROM anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.bundles TO anon, authenticated;

-- orders: read-own only (writes happen server-side via service key)
REVOKE ALL ON public.orders FROM anon, authenticated;
GRANT SELECT ON public.orders TO authenticated;

-- entitlements: read-own only
REVOKE ALL ON public.entitlements FROM anon, authenticated;
GRANT SELECT ON public.entitlements TO authenticated;

-- extension_tokens: read-own only
REVOKE ALL ON public.extension_tokens FROM anon, authenticated;
GRANT SELECT ON public.extension_tokens TO authenticated;

-- hanzi_data / hanzi_strokes: service-only (gated edge functions)
REVOKE ALL ON public.hanzi_data FROM anon, authenticated;
REVOKE ALL ON public.hanzi_strokes FROM anon, authenticated;

-- profiles: authenticated read-all, own insert/update
REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- ── RLS Policies ─────────────────────────────────────────────────────────────

-- products / bundles: public read
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "bundles_public_read" ON public.bundles
  FOR SELECT TO anon, authenticated USING (true);

-- profiles
CREATE POLICY "profiles_read" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- orders: read-own
CREATE POLICY "orders_read_own" ON public.orders
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- entitlements: read-own
CREATE POLICY "entitlements_read_own" ON public.entitlements
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- extension_tokens: read-own
CREATE POLICY "extension_tokens_read_own" ON public.extension_tokens
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
