import { config } from "dotenv";

config({ path: ".env.local" });

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL!;
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY!;

if (!INSFORGE_URL || !INSFORGE_API_KEY) {
  console.error("Missing INSFORGE_URL or INSFORGE_API_KEY in .env.local");
  process.exit(1);
}

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TUPO-${result}`;
}

async function insertKey(code: string) {
  const res = await fetch(`${INSFORGE_URL}/rest/v1/license_keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${INSFORGE_API_KEY}`,
      "apikey": INSFORGE_API_KEY,
      "Prefer": "return=representation"
    },
    body: JSON.stringify({ code })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to insert key");
  }
  return (await res.json())[0];
}

async function mapProducts(code: string, productIds: string[]) {
  const mappings = productIds.map(pid => ({
    license_code: code,
    product_id: pid,
  }));

  const res = await fetch(`${INSFORGE_URL}/rest/v1/license_key_products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${INSFORGE_API_KEY}`,
      "apikey": INSFORGE_API_KEY,
    },
    body: JSON.stringify(mappings)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to map products");
  }
}

async function main() {
  const count = parseInt(process.argv[2] || "10", 10);
  const hskLevel = process.argv[3]; // Optional: specific level
  const includeAll = process.argv.includes("--all"); // Flag for all products

  let productIds: string[] = [];

  if (includeAll) {
    // All individual levels
    for (let n = 1; n <= 6; n++) {
      productIds.push(`writing_L${n}`);
      productIds.push(`flashcards_L${n}`);
      productIds.push(`writing_flashcards_L${n}`);
    }
    productIds.push("chrome_ext_only");
  } else if (hskLevel) {
    productIds.push(`writing_L${hskLevel}`);
    productIds.push(`flashcards_L${hskLevel}`);
    productIds.push(`writing_flashcards_L${hskLevel}`);
  } else {
    // Default: writing flashcards L1 only? Or maybe require arg?
    console.log("Usage: npx tsx scripts/generate-license-keys.ts [count] [level] [--all]");
    process.exit(1);
  }

  console.log(`Generating ${count} keys for products: ${productIds.join(", ")}`);

  for (let i = 0; i < count; i++) {
    const code = generateCode();
    try {
      await insertKey(code);
      await mapProducts(code, productIds);
      console.log(`[${i + 1}/${count}] Created key: ${code}`);
    } catch (e: any) {
      console.error(`Failed to create key: ${e.message}`);
      i--; // Retry on next iteration? Or just skip? Let's skip for now.
    }
  }
}

main();