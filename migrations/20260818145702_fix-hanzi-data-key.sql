-- hanzi_data: allow polyphonic words (same hanzi, different pinyin/POS) in decks.
-- The old PRIMARY KEY on `hanzi` forced one row per hanzi, which dropped distinct
-- readings such as 得 (de/dé/děi) and 中 (zhōng/zhòng) from the flashcards.
-- Replace it with a surrogate `id` (CSV row id) so every word card survives.

ALTER TABLE public.hanzi_data DROP CONSTRAINT hanzi_data_pkey;

ALTER TABLE public.hanzi_data ADD COLUMN id TEXT;

-- Backfill existing rows so the column is NOT NULL before it becomes the key.
-- (hanzi was unique under the old PK, so this is unique per row.)
UPDATE public.hanzi_data
SET id = 'L' || hsk_level || '-' || md5(hanzi || '|' || pinyin || '|' || pos);

ALTER TABLE public.hanzi_data ALTER COLUMN id SET NOT NULL;

ALTER TABLE public.hanzi_data ADD PRIMARY KEY (id);

CREATE INDEX IF NOT EXISTS idx_hanzi_data_level ON public.hanzi_data(hsk_level);
