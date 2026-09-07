import { createClient, createAdminClient } from "npm:@insforge/sdk";

const BASE_URL = Deno.env.get("INSFORGE_BASE_URL")!;
const API_KEY = Deno.env.get("API_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  if (!token) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient({ baseUrl: BASE_URL, accessToken: token });
  const { data: authData } = await userClient.auth.getCurrentUser();
  const userId = authData?.user?.id;
  if (!userId) return json({ error: "Unauthorized" }, 401);

  const admin = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

  let level: number;
  try {
    const body = await req.json();
    level = parseInt(String(body?.level), 10);
  } catch {
    return json({ error: "Bad request" }, 400);
  }
  if (!Number.isInteger(level) || level < 1 || level > 6) {
    return json({ error: "Invalid level" }, 400);
  }

  const { data: ent, error: entErr } = await admin.database
    .from("entitlements")
    .select("product_id")
    .eq("user_id", userId)
    .in("product_id", [`flashcards_L${level}`, `writing_flashcards_L${level}`]);
  if (entErr) return json({ error: "DB error" }, 500);
  const entitled = !!ent && ent.length > 0;

  // Deck sizes exceed the backend's 1000-row page limit for HSK 5 (1600) and
  // HSK 6 (1800), so page through the deck until all cards are collected.
  const PAGE_SIZE = 1000;
  let deck: Array<Record<string, unknown>> = [];
  let from = 0;
  while (true) {
    const { data: page, error: deckErr } = await admin.database
      .from("hanzi_data")
      .select("hanzi,hsk_level,pinyin,definition,pos")
      .eq("hsk_level", level)
      .order("hanzi")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (deckErr) return json({ error: "DB error" }, 500);
    const rows = (page ?? []) as Array<Record<string, unknown>>;
    deck = deck.concat(rows);
    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  if (entitled) {
    return json({ entitled: true, level, cards: deck, total: deck.length });
  }
  return json({
    entitled: false,
    level,
    sample: deck.slice(0, 10),
    total: deck.length,
  });
}
