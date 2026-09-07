"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { metrics, type Metric } from "./data";

function fmt(v: number, decimals?: number) {
  const fixed = v.toFixed(decimals ?? 0);
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return dec ? `${grouped}.${dec}` : grouped;
}

function Counter({ metric }: { metric: Metric }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || !ref.current) return;
    if (reduce) {
      ref.current.textContent = fmt(metric.value, metric.decimals);
      return;
    }
    const controls = animate(0, metric.value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = fmt(v, metric.decimals);
      },
    });
    return () => controls.stop();
  }, [inView, metric, reduce]);

  return (
    <span className="font-hanzi text-4xl font-black tracking-tight sm:text-5xl">
      <span ref={ref}>{fmt(0, metric.decimals)}</span>
      {metric.suffix && <span className="text-accent">{metric.suffix}</span>}
    </span>
  );
}

export default function Metrics() {
  return (
    <section className="border-y border-line bg-bg2/40">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-y-12 px-4 py-16 sm:px-6 sm:grid-cols-3 lg:divide-x lg:divide-line lg:py-20">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-start gap-2 px-4 lg:px-10 lg:first:pl-0"
          >
            <Counter metric={m} />
            <p className="text-sm font-medium text-text2">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}