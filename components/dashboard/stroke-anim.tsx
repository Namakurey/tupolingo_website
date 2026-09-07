"use client";

import { useEffect, useRef, useState } from "react";
import { fetchStroke } from "@/lib/insforge/api";
import type { StrokeData } from "@/lib/insforge/types";

function StrokeSvg({
  data,
  step,
  size,
}: {
  data: StrokeData;
  step: number;
  size: number;
}) {
  const n = data.strokes.length;
  const total = step >= n ? n : step;
  return (
    <svg viewBox="0 0 1024 1024" width={size} height={size} className="block">
      <g transform="scale(1,-1) translate(0,-900)">
        {data.strokes.slice(0, total).map((d, i) => (
          <path
            key={i}
            d={d}
            fill={i === total - 1 ? "var(--accent)" : "currentColor"}
          />
        ))}
      </g>
    </svg>
  );
}

export default function StrokeAnim({
  char,
  size = 64,
  className = "",
}: {
  char: string;
  size?: number;
  className?: string;
}) {
  const [data, setData] = useState<StrokeData | null>(null);
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setStep(0);
    fetchStroke(char).then((d) => {
      if (cancelled) return;
      setData(d);
      setStep(d ? 1 : 0);
    });
    return () => {
      cancelled = true;
    };
  }, [char]);

  useEffect(() => {
    if (!data || data.strokes.length <= 1) return;
    timer.current = setInterval(() => {
      setStep((s) => (s >= data.strokes.length ? 1 : s + 1));
    }, 650);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [data]);

  if (!data) {
    return (
      <span
        className={`grid place-items-center text-text3 ${className}`}
        style={{ width: size, height: size }}
      >
        …
      </span>
    );
  }

  return (
    <span
      className={`grid place-items-center text-text ${className}`}
      style={{ width: size, height: size }}
      title={`${char} · ${data.strokes.length} goresan`}
    >
      <StrokeSvg data={data} step={step} size={size} />
    </span>
  );
}
