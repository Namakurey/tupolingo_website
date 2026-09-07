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
  if (!authData?.user?.id) return json({ error: "Unauthorized" }, 401);

  const admin = createAdminClient({ baseUrl: BASE_URL, apiKey: API_KEY });

  let char: string;
  try {
    const body = await req.json();
    char = String(body?.char ?? "").trim();
  } catch {
    return json({ error: "Bad request" }, 400);
  }
  if (!char || char.length > 4) return json({ error: "Invalid char" }, 400);

  const { data, error } = await admin.database
    .from("hanzi_strokes")
    .select("character,strokes,medians")
    .eq("character", char)
    .maybeSingle();
  if (error) return json({ error: "DB error" }, 500);
  if (!data) return json({ error: "Not found" }, 404);

  return json({ character: data.character, strokes: data.strokes, medians: data.medians });
}
