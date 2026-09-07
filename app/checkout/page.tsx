"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import Checkout from "@/components/checkout/checkout";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-[100dvh] place-items-center">
          <Loader2 className="size-8 animate-spin text-accent" />
        </main>
      }
    >
      <Checkout />
    </Suspense>
  );
}
