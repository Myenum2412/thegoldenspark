"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Generated product artwork: a deterministic firework burst on a dark tile.
 *
 * The storefront is a design mock with no product photography, so each
 * product gets a stable, distinct burst derived from its `seed` — the same
 * product always draws the same sky. `tone` tints the central glow toward
 * the product's selected colour. Renders as a plain SVG so it fills any
 * frame the product card gives it.
 */

const SPARK_COLORS = [
  "#f59e0b",
  "#fbbf24",
  "#fb7185",
  "#a78bfa",
  "#22d3ee",
  "#34d399",
  "#f472b6",
  "#e879f9",
  "#facc15",
  "#60a5fa",
];

/** Small, fast, deterministic PRNG — same numbers on server and client. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 400;
const H = 500;
const CX = W / 2;
const CY = H * 0.46;

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
}

interface Ray {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx: number;
  cy: number;
  r: number;
  color: string;
}

interface Burst {
  stars: Star[];
  rays: Ray[];
  rings: number[];
}

function build(seed: number): Burst {
  const rand = mulberry32(seed * 2654435761 + 1);
  const rayCount = 16 + Math.floor(rand() * 12);
  const colorOffset = Math.floor(rand() * SPARK_COLORS.length);

  const rays: Ray[] = Array.from({ length: rayCount }, (_, i) => {
    const angle = (i / rayCount) * Math.PI * 2 + rand() * 0.16;
    const inner = 30 + rand() * 16;
    const outer = inner + 80 + rand() * 120;
    return {
      x1: CX + Math.cos(angle) * inner,
      y1: CY + Math.sin(angle) * inner,
      x2: CX + Math.cos(angle) * outer,
      y2: CY + Math.sin(angle) * outer,
      cx: CX + Math.cos(angle) * outer,
      cy: CY + Math.sin(angle) * outer,
      r: 1.6 + rand() * 2.6,
      color: SPARK_COLORS[(colorOffset + i) % SPARK_COLORS.length],
    };
  });

  const stars: Star[] = Array.from({ length: 42 }, () => ({
    x: rand() * W,
    y: rand() * H * 0.8,
    r: 0.5 + rand() * 1.1,
    o: 0.15 + rand() * 0.5,
  }));

  const rings = [46, 78, 118].map((r) => r + rand() * 14);

  return { stars, rays, rings };
}

export interface ProductArtProps {
  seed: number;
  /** Accent for the central glow — usually the selected colour's hex. */
  tone?: string;
  className?: string;
}

export function ProductArt({ seed, tone = "#f59e0b", className }: ProductArtProps) {
  const uid = React.useId();
  const art = React.useMemo(() => build(seed), [seed]);
  const bgId = `${uid}-bg`;
  const glowId = `${uid}-glow`;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("size-full", className)}
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1917" />
          <stop offset="55%" stopColor="#0f0d0c" />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="46%" r="55%">
          <stop offset="0%" stopColor={tone} stopOpacity="0.45" />
          <stop offset="45%" stopColor={tone} stopOpacity="0.12" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#${bgId})`} />
      <rect width={W} height={H} fill={`url(#${glowId})`} />

      {art.stars.map((s, i) => (
        <circle key={`s-${i}`} cx={s.x} cy={s.y} r={s.r} fill="#fff7ed" opacity={s.o} />
      ))}

      <g stroke="#ffffff" strokeOpacity="0.06" fill="none" strokeWidth="1">
        {art.rings.map((r, i) => (
          <circle key={`r-${i}`} cx={CX} cy={CY} r={r} />
        ))}
      </g>

      <g strokeLinecap="round">
        {art.rays.map((ray, i) => (
          <React.Fragment key={`ray-${i}`}>
            <line
              x1={ray.x1}
              y1={ray.y1}
              x2={ray.x2}
              y2={ray.y2}
              stroke={ray.color}
              strokeWidth="1.7"
              opacity="0.9"
            />
            <circle cx={ray.cx} cy={ray.cy} r={ray.r} fill={ray.color} />
          </React.Fragment>
        ))}
      </g>

      <circle cx={CX} cy={CY} r="9" fill={tone} />
      <circle cx={CX} cy={CY} r="4" fill="#fff" opacity="0.9" />
    </svg>
  );
}
