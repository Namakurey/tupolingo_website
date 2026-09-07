import os, json, csv, re, sys

# ── Paths ────────────────────────────────────────────────────────────────────
BASE = r"D:\Opencode_Projects\mandarin_products\HSK writing workbook"
CSV_PATH = os.path.join(BASE, "hsk30_full.csv")
MEANINGS_PATH = os.path.join(BASE, "hsk_meanings.json")
STROKES_DIR = os.path.join(BASE, "hanzi_data")
OUT_DIR = os.path.join(os.path.dirname(__file__), "out")

POS_MAP = {
    "N": "noun", "V": "verb", "Adj": "adjective", "Adv": "adverb",
    "Prep": "preposition", "Pron": "pronoun", "M": "measure word",
    "Aux": "particle", "Conj": "conjunction", "Num": "number",
    "Suffix": "suffix", "Prefix": "prefix",
    "N/V": "noun/verb", "V/N": "verb/noun", "Adj/Adv": "adjective/adverb",
    "N/M": "noun/measure word", "M/N": "measure word/noun",
    "Aux/V": "particle/verb", "Num/M": "number/measure word",
    "Pron/N": "pronoun/noun",
}


def strip_parens(s):
    return re.sub(r"[（(][^）)]*[）)]", "", s).strip()


def clean_hanzi(raw):
    w = raw.split("|")[0].strip()
    w = strip_parens(w)
    return w


def resolve_meaning(meanings, word):
    if word in meanings:
        return meanings[word]
    # try progressively cleaner forms
    candidates = []
    c1 = strip_parens(word)
    if c1 != word:
        candidates.append(c1)
    if re.fullmatch(r".+[1-9]", word):
        candidates.append(word[:-1])
    if re.fullmatch(r".+[1-9]", c1):
        candidates.append(c1[:-1])
    for c in candidates:
        if c in meanings:
            return meanings[c]
    return ""


def main():
    with open(MEANINGS_PATH, "r", encoding="utf-8") as f:
        meanings = json.load(f)

    levels = {str(n): [] for n in range(1, 7)}

    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            lv = row["Level"].strip()
            if lv not in levels:
                continue
            word = clean_hanzi(row["Simplified"])
            if not word or not all("\u4e00" <= c <= "\u9fff" for c in word):
                continue
            py = row["Pinyin"].strip().split("|")[0].strip()
            py = strip_parens(py)
            pos_raw = row["POS"].strip()
            pos = POS_MAP.get(pos_raw, pos_raw if pos_raw else "")
            definition = resolve_meaning(meanings, word)
            levels[lv].append({
                "id": row["ID"].strip(),
                "hanzi": word,
                "pinyin": py,
                "definition": definition,
                "pos": pos,
            })

    # stroke data per unique character
    chars = set()
    for lv in levels.values():
        for w in lv:
            for c in w["hanzi"]:
                chars.add(c)

    strokes = []
    missing_chars = []
    for c in sorted(chars):
        p = os.path.join(STROKES_DIR, f"{ord(c)}.json")
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                d = json.load(f)
            strokes.append({
                "character": c,
                "strokes": d.get("strokes", []),
                "medians": d.get("medians", []),
            })
        else:
            missing_chars.append(c)

    os.makedirs(OUT_DIR, exist_ok=True)

    all_cards = []
    for n in range(1, 7):
        lv = levels[str(n)]
        all_cards.extend([dict(w, hsk_level=n) for w in lv])
        with open(os.path.join(OUT_DIR, f"flashcards_L{n}.json"), "w", encoding="utf-8") as f:
            json.dump(lv, f, ensure_ascii=False, separators=(",", ":"))

    with open(os.path.join(OUT_DIR, "flashcards_all.json"), "w", encoding="utf-8") as f:
        json.dump(all_cards, f, ensure_ascii=False, separators=(",", ":"))

    with open(os.path.join(OUT_DIR, "strokes.json"), "w", encoding="utf-8") as f:
        json.dump(strokes, f, ensure_ascii=False, separators=(",", ":"))

    total = sum(len(v) for v in levels.values())
    print("cards by level:", {k: len(v) for k, v in levels.items()})
    print("total cards (1-6):", total)
    print("unique chars:", len(chars))
    print("chars with stroke data:", len(strokes))
    print("chars missing stroke data:", len(missing_chars), missing_chars[:30])
    print("cards missing definition:",
          sum(1 for c in all_cards if not c["definition"]))
    print("output dir:", OUT_DIR)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
