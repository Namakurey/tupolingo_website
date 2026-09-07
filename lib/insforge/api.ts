"use client";

import { insforge } from "./client";
import type {
  DeckResponse,
  Entitlement,
  FulfillResult,
  Product,
  StrokeData,
} from "./types";

export function formatIDR(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await insforge.database
    .from("products")
    .select("id,name,product_type,hsk_level,price_idr")
    .order("hsk_level", { ascending: true, nullsFirst: false });
  if (error) return [];
  return (data ?? []) as Product[];
}

export async function fetchEntitlements(): Promise<{
  entitlements: Entitlement[];
  products: Product[];
}> {
  const { data, error } = await insforge.functions.invoke<{
    entitlements: Entitlement[];
    products: Product[];
  }>("entitlements", { method: "GET" });
  if (error || !data) return { entitlements: [], products: [] };
  return data;
}

export async function fetchDeck(level: number): Promise<DeckResponse | null> {
  const { data, error } = await insforge.functions.invoke<DeckResponse>(
    "flashcards",
    { body: { level } },
  );
  if (error || !data) return null;
  return data;
}

export async function fetchStroke(char: string): Promise<StrokeData | null> {
  const { data, error } = await insforge.functions.invoke<StrokeData>("stroke", {
    body: { char },
  });
  if (error || !data) return null;
  return data;
}

export async function fulfill(productId: string): Promise<{
  ok: boolean;
  status: number | null;
  result: FulfillResult | null;
}> {
  const { data, error } = await insforge.functions.invoke<FulfillResult>(
    "fulfill",
    { body: { product_id: productId } },
  );
  if (error) {
    return { ok: false, status: error.statusCode ?? null, result: null };
  }
  return { ok: true, status: 200, result: data };
}

export async function checkout(
  items: string[],
  finishUrl?: string,
): Promise<{
  ok: boolean;
  message: string;
  status?: string;
  snap_token?: string;
  redirect_url?: string;
  granted?: string[];
}> {
  const { data, error } = await insforge.functions.invoke<{
    status?: string;
    message?: string;
    granted?: string[];
    snap_token?: string;
    redirect_url?: string;
    success?: boolean;
  }>("checkout", { body: { items, finish_url: finishUrl } });
  if (error) {
    return { ok: false, message: error.message ?? "Checkout gagal." };
  }
  if (data?.status === "stub") {
    return { ok: false, message: data.message ?? "Checkout belum tersedia." };
  }
  if (data?.status === "pending" && data?.snap_token) {
    return {
      ok: true,
      message: "Mengarahkan ke Midtrans…",
      status: "pending",
      snap_token: data.snap_token,
      redirect_url: data.redirect_url,
    };
  }
  return {
    ok: true,
    message: "Pembelian berhasil!",
    status: data?.status ?? "ok",
    granted: data?.granted,
  };
}
