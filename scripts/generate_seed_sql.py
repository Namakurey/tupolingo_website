import os, json, sys

OUT_DIR = os.path.join(os.path.dirname(__file__), "out")

LEVELS = range(1, 7)

def esc(s):
    return s.replace("'", "''")

def products_sql():
    lines = []
    for n in LEVELS:
        rows = [
            (f"writing_L{n}", f"HSK Writing Workbook — Level {n}", "writing_pdf", n, 19999),
            (f"writing_flashcards_L{n}", f"Writing Workbook + Flashcards — Level {n}", "writing_flashcards", n, 24999),
            (f"flashcards_L{n}", f"HSK Flashcards — Level {n}", "flashcards", n, 9999),
        ]
        for pid, name, ptype, lvl, price in rows:
            lines.append(
                f"INSERT INTO public.products (id, name, product_type, hsk_level, price_idr) VALUES "
                f"('{pid}', '{esc(name)}', '{ptype}', {lvl}, {price}) ON CONFLICT (id) DO NOTHING;"
            )
    lines.append(
        "INSERT INTO public.products (id, name, product_type, hsk_level, price_idr) VALUES "
        "('chrome_ext_only', 'ReadZhongwen Chrome Extension', 'chrome_ext', NULL, 29999) ON CONFLICT (id) DO NOTHING;"
    )
    bundles = [
        ("bundle_all_in_one", "All-in-One", 99999, "writing_pdf,flashcards,chrome_ext"),
    ]
    for bid, name, price, types in bundles:
        arr = "{" + types + "}"
        lines.append(
            f"INSERT INTO public.bundles (id, name, price_idr, included_product_types, includes_all_levels) VALUES "
            f"('{bid}', '{esc(name)}', {price}, '{arr}', TRUE) ON CONFLICT (id) DO NOTHING;"
        )
    return "\n".join(lines) + "\n"


def hanzi_sql():
    lines = []
    all_cards = json.load(open(os.path.join(OUT_DIR, "flashcards_all.json"), encoding="utf-8"))
    for c in all_cards:
        lines.append(
            "INSERT INTO public.hanzi_data (id, hanzi, hsk_level, pinyin, definition, pos) VALUES "
            f"('{esc(c['id'])}', '{esc(c['hanzi'])}', {c['hsk_level']}, '{esc(c['pinyin'])}', '{esc(c['definition'])}', '{esc(c['pos'])}') "
            "ON CONFLICT (id) DO NOTHING;"
        )
    return "\n".join(lines) + "\n"


def strokes_sql():
    lines = []
    strokes = json.load(open(os.path.join(OUT_DIR, "strokes.json"), encoding="utf-8"))
    for s in strokes:
        sj = json.dumps(s["strokes"], ensure_ascii=False)
        mj = json.dumps(s["medians"], ensure_ascii=False)
        lines.append(
            "INSERT INTO public.hanzi_strokes (character, strokes, medians) VALUES "
            f"('{esc(s['character'])}', '{esc(sj)}'::jsonb, '{esc(mj)}'::jsonb) "
            "ON CONFLICT (character) DO NOTHING;"
        )
    return "\n".join(lines) + "\n"


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    parts = [
        "-- Seed: products + bundles",
        products_sql(),
        "-- Refresh: flashcard source tables are rebuilt from the current CSV",
        "TRUNCATE TABLE public.hanzi_data, public.hanzi_strokes;",
        "-- Seed: hanzi_data (flashcard decks, HSK 3.0 levels 1-6)",
        hanzi_sql(),
        "-- Seed: hanzi_strokes (stroke order per character)",
        strokes_sql(),
    ]
    out = "\n".join(parts)
    path = os.path.join(OUT_DIR, "seed.sql")
    with open(path, "w", encoding="utf-8") as f:
        f.write(out)
    print("wrote", path, f"{os.path.getsize(path):,} bytes")


if __name__ == "__main__":
    main()
