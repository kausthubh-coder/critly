"use client";

import { Bricolage_Grotesque, Oswald } from "next/font/google";
import { useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

// Three fictional products of three kinds (an app, a command-line tool, a
// physical object), each in its own look. The hero copy stays fixed; only the
// picture changes.

const grotesk = Bricolage_Grotesque({ subsets: ["latin"], weight: ["400", "700"] });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "600"] });

type ProductKey = "rota" | "shrinkwrap" | "holdfast";
type Mode = "abstract" | "illustration" | "product";

const PRODUCTS = [
  { value: "rota", label: "Rota" },
  { value: "shrinkwrap", label: "Shrinkwrap" },
  { value: "holdfast", label: "Holdfast" },
] as const;

const MODES = [
  { value: "abstract", label: "Shapes" },
  { value: "illustration", label: "Illustration" },
  { value: "product", label: "The product" },
] as const;

const COPY: Record<
  ProductKey,
  {
    name: string;
    headline: string;
    sub: string;
    action: string;
    tells: Record<Mode, string>;
  }
> = {
  rota: {
    name: "Rota",
    headline: "Shift schedules for restaurants, with the gaps flagged before service.",
    sub: "Rota builds the week from who's free, and staff swap shifts without texting you.",
    action: "Build next week",
    tells: {
      abstract: "Nothing about the product. Swap the colors and it fits any app in the category.",
      illustration: "Some people use a laptop. True of every product that has ever had a website.",
      product: "A week of people by day, Saturday dinner one person short, and a swap already accepted.",
    },
  },
  shrinkwrap: {
    name: "Shrinkwrap",
    headline: "Shrink every image in your repo with one command.",
    sub: "Shrinkwrap converts and compresses images in place, and prints what it saved.",
    action: "npx shrinkwrap",
    tells: {
      abstract: "Nothing. A glow on a dark ground is the default picture for a developer tool.",
      illustration: "Something launches. Every developer tool's launch page says the same.",
      product: "The exact command, what it does to each file, and the saving you can expect.",
    },
  },
  holdfast: {
    name: "Holdfast",
    headline: "A steel bike lock that folds to the size of a water bottle.",
    sub: "Six hardened links, 1.2 kg, and it rides in a bottle cage.",
    action: "Order a Holdfast",
    tells: {
      abstract: "Nothing. Not even that it's a physical thing you could hold.",
      illustration: "Someone rides a bike. The lock, the thing for sale, isn't in it.",
      product: "What it is made of, how it folds, and how big it is folded and open.",
    },
  },
};

const LOOKS: Record<
  ProductKey,
  { font: string; ground: string; ink: string; muted: string; button: string }
> = {
  rota: {
    font: grotesk.className,
    ground: "bg-white",
    ink: "text-[#141414]",
    muted: "text-[#4a4a4a]",
    button: "bg-[#141414] text-white",
  },
  shrinkwrap: {
    font: "font-mono",
    ground: "bg-[#111318]",
    ink: "text-[#e8eaf0]",
    muted: "text-[#a9aebb]",
    button: "bg-[#c6f432] text-[#111318]",
  },
  holdfast: {
    font: oswald.className,
    ground: "bg-[#d9dcd6]",
    ink: "text-[#111111]",
    muted: "text-[#3a3d39]",
    button: "bg-[#111111] text-[#ffd400]",
  },
};

export function ShowTheProductDemo() {
  const [product, setProduct] = useState<ProductKey>("rota");
  const [mode, setMode] = useState<Mode>("abstract");

  const copy = COPY[product];
  const look = LOOKS[product];

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <SegmentedControl
        ariaLabel="Product"
        onChange={setProduct}
        options={PRODUCTS}
        value={product}
      />

      <div
        className={cn(
          "flex w-full max-w-xl flex-col gap-5 overflow-hidden rounded-xl p-5 ring-1 ring-black/10 sm:p-7 dark:ring-white/15",
          look.ground,
          look.ink
        )}
      >
        <div className={cn("flex min-h-[176px] flex-col gap-3 sm:min-h-[150px]", look.font)}>
          <span className="text-[15px] font-semibold">{copy.name}</span>
          <p
            className={cn(
              "max-w-[26ch] text-[21px] leading-[1.12] text-balance sm:text-[28px]",
              product === "holdfast" ? "font-semibold uppercase" : "font-bold",
              product === "shrinkwrap" && "text-[19px] sm:text-[24px]"
            )}
          >
            {copy.headline}
          </p>
          <p className={cn("max-w-[48ch] text-[15px] leading-snug", look.muted)}>
            {copy.sub}
          </p>
        </div>

        <div className="relative h-[240px] w-full sm:h-[260px]">
          {mode === "abstract" ? <Shapes product={product} /> : null}
          {mode === "illustration" ? <Illustration product={product} /> : null}
          {mode === "product" ? <ProductShot product={product} /> : null}
        </div>
      </div>

      <SegmentedControl
        ariaLabel="Hero picture"
        onChange={setMode}
        options={MODES}
        value={mode}
      />

      <dl className="grid w-full max-w-md gap-3 text-xs" aria-live="polite">
        <div className="grid gap-1">
          <dt className="font-medium text-foreground">What the picture tells you</dt>
          <dd className="min-h-[2lh] text-muted-foreground">{copy.tells[mode]}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="font-medium text-foreground">
            Could it sit on a competitor&apos;s page?
          </dt>
          <dd className="flex items-center gap-1.5 text-muted-foreground">
            {mode === "product" ? RIGHT_ICON : WRONG_ICON}
            {mode === "product"
              ? "No. It only fits this product."
              : "Yes, unchanged."}
          </dd>
        </div>
      </dl>
    </Demo>
  );
}

/* Shapes: gradients and blobs, the usual stand-in. */

function Shapes({ product }: { product: ProductKey }) {
  const fills = {
    rota: ["#ffb199", "#ff5a1f", "#ffd6c7"],
    shrinkwrap: ["#c6f432", "#3a5a12", "#6d8f1f"],
    holdfast: ["#ffd400", "#8a8f87", "#f5e67a"],
  }[product];

  return (
    <svg aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 520 260">
      <defs>
        <filter id={`blur-${product}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
      </defs>
      <g filter={`url(#blur-${product})`} opacity="0.9">
        <circle cx="170" cy="130" fill={fills[0]} r="90" />
        <circle cx="330" cy="110" fill={fills[1]} r="80" />
        <circle cx="260" cy="190" fill={fills[2]} r="70" />
      </g>
      <rect fill="white" fillOpacity="0.18" height="120" rx="28" stroke="white" strokeOpacity="0.4" width="180" x="250" y="70" />
      <circle cx="190" cy="120" fill="white" fillOpacity="0.14" r="44" stroke="white" strokeOpacity="0.35" />
    </svg>
  );
}

/* Illustration: the generic people-and-props scene. */

function Illustration({ product }: { product: ProductKey }) {
  const tint = { rota: "#ff5a1f", shrinkwrap: "#c6f432", holdfast: "#ffd400" }[product];
  const skin = ["#f2c7a5", "#8d5a3b", "#d9a07a"];
  const ink = product === "shrinkwrap" ? "#e8eaf0" : "#141414";

  if (product === "holdfast") {
    return (
      <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 520 260">
        <circle cx="420" cy="70" fill={tint} r="36" />
        <path d="M0 210 H520" stroke={ink} strokeOpacity="0.3" strokeWidth="2" />
        <rect fill={ink} fillOpacity="0.12" height="90" rx="4" width="40" x="40" y="120" />
        <rect fill={ink} fillOpacity="0.12" height="130" rx="4" width="50" x="90" y="80" />
        <circle cx="210" cy="180" fill="none" r="30" stroke={ink} strokeWidth="5" />
        <circle cx="320" cy="180" fill="none" r="30" stroke={ink} strokeWidth="5" />
        <path d="M210 180 L250 130 L300 130 L320 180 M250 130 L265 180 L210 180" fill="none" stroke={ink} strokeLinejoin="round" strokeWidth="5" />
        <path d="M262 126 L280 80 L300 92" fill="none" stroke={tint} strokeLinecap="round" strokeWidth="12" />
        <circle cx="284" cy="66" fill={skin[1]} r="13" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 520 260">
      <rect fill={tint} fillOpacity="0.18" height="200" rx="100" width="460" x="30" y="40" />
      <rect fill={ink} fillOpacity="0.85" height="96" rx="8" width="150" x="185" y="110" />
      <rect fill={tint} height="70" rx="4" width="130" x="195" y="120" />
      <path d="M170 206 H350" stroke={ink} strokeLinecap="round" strokeWidth="8" />
      <circle cx="120" cy="96" fill={skin[0]} r="20" />
      <path d="M90 230 C90 150 150 150 150 230 Z" fill={tint} />
      <circle cx="400" cy="96" fill={skin[1]} r="20" />
      <path d="M370 230 C370 150 430 150 430 230 Z" fill={ink} fillOpacity="0.7" />
      {product === "shrinkwrap" ? (
        <path d="M260 20 L276 60 L268 60 L268 84 L252 84 L252 60 L244 60 Z" fill={tint} />
      ) : (
        <g>
          <rect fill="white" height="40" rx="6" stroke={ink} strokeOpacity="0.2" width="64" x="40" y="20" />
          <path d="M50 48 L64 38 L76 44 L94 30" fill="none" stroke={tint} strokeWidth="3" />
        </g>
      )}
      <path d="M470 230 C460 190 480 170 470 140 M470 190 C490 180 500 170 500 160 M470 175 C450 165 445 150 448 140" fill="none" stroke="#3f7d4c" strokeWidth="4" />
    </svg>
  );
}

/* The product, drawn: a real screen, real output, the real object. */

function ProductShot({ product }: { product: ProductKey }) {
  if (product === "rota") return <RotaShot />;
  if (product === "shrinkwrap") return <ShrinkwrapShot />;
  return <HoldfastShot />;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STAFF: { name: string; shifts: (string | null)[] }[] = [
  { name: "Ana", shifts: ["11–17", "11–17", null, "17–23", "17–23", "17–23", null] },
  { name: "Bilal", shifts: [null, "17–23", "17–23", "17–23", "17–23", "11–17", "11–17"] },
  { name: "Chen", shifts: ["17–23", null, "11–17", null, "↔ Bilal", "17–23", "17–23"] },
  { name: "Dee", shifts: ["17–23", "17–23", "17–23", "11–17", null, null, "11–17"] },
];

function RotaShot() {
  return (
    <div className={cn("absolute inset-0 flex flex-col gap-1.5 rounded-lg bg-[#f4f4f2] p-2.5 text-[#141414] sm:p-3", grotesk.className)}>
      <div className="grid grid-cols-[44px_repeat(7,1fr)] gap-1 text-[11px] sm:grid-cols-[52px_repeat(7,1fr)] sm:text-[12px]">
        <span />
        {DAYS.map((day) => (
          <span
            key={day}
            className={cn(
              "rounded px-1 py-0.5 text-center font-bold",
              day === "Sat" && "bg-[#ff5a1f] text-[#141414]"
            )}
          >
            {day}
          </span>
        ))}
      </div>
      {STAFF.map((person) => (
        <div
          key={person.name}
          className="grid flex-1 grid-cols-[44px_repeat(7,1fr)] gap-1 text-[11px] sm:grid-cols-[52px_repeat(7,1fr)] sm:text-[12px]"
        >
          <span className="self-center font-bold">{person.name}</span>
          {person.shifts.map((shift, index) => (
            <span
              key={index}
              className={cn(
                "flex items-center justify-center rounded text-center leading-tight",
                shift === null && "border border-dashed border-[#c9c9c4]",
                shift?.startsWith("11") && "bg-[#ffe1d6]",
                shift?.startsWith("17") && "bg-[#141414] text-white",
                shift?.startsWith("↔") && "bg-[#fff1a8]"
              )}
            >
              {shift}
            </span>
          ))}
        </div>
      ))}
      <div className="flex items-center justify-between gap-2 rounded bg-white px-2 py-1.5 text-[12px]">
        <span>
          <span className="font-bold text-[#c2410c]">Sat dinner: 1 short.</span>{" "}
          Dee is free.
        </span>
        <span className="shrink-0 font-bold">Ask Dee</span>
      </div>
    </div>
  );
}

const FILES = [
  ["hero.png", "2.4 MB", "312 KB", "avif"],
  ["team.jpg", "1.1 MB", "188 KB", "avif"],
  ["og-image.png", "880 KB", "96 KB", "webp"],
  ["logo.svg", "38 KB", "9 KB", "svgo"],
] as const;

function ShrinkwrapShot() {
  return (
    <div className="absolute inset-0 flex flex-col gap-1 overflow-hidden rounded-lg bg-black p-3 font-mono text-[11px] leading-[1.6] text-[#e8eaf0] sm:p-4 sm:text-[13px]">
      <span>
        <span className="text-[#c6f432]">$</span> npx shrinkwrap ./public
      </span>
      <table className="mt-1 w-full border-separate border-spacing-0">
        <tbody>
          {FILES.map(([file, before, after, format]) => (
            <tr key={file}>
              <td className="pr-2">{file}</td>
              <td className="pr-1 text-right tabular-nums text-[#a9aebb]">{before}</td>
              <td className="px-1 text-[#a9aebb]">→</td>
              <td className="pr-2 text-right tabular-nums">{after}</td>
              <td className="text-[#c6f432]">{format}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-auto border-t border-[#2a2e38] pt-2">
        4 files · 4.4 MB → 605 KB ·{" "}
        <span className="text-[#c6f432]">86% smaller</span>
      </span>
    </div>
  );
}

// Six links joined end to end in a loop around the post.
const HEX = Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI / 3) * i + Math.PI / 6;
  const b = (Math.PI / 3) * (i + 1) + Math.PI / 6;
  const r = 62;
  return [100 + r * Math.cos(a), 95 + r * Math.sin(a), 100 + r * Math.cos(b), 95 + r * Math.sin(b)].map((n) => Math.round(n * 10) / 10);
});

function HoldfastShot() {
  const links = [0, 1, 2, 3, 4, 5];
  return (
    <div className={cn("absolute inset-0 flex items-stretch gap-3 text-[#111111]", oswald.className)}>
      <div className="flex flex-1 flex-col items-center justify-between rounded-lg bg-[#f2f3ef] p-3">
        <svg aria-hidden="true" className="h-[170px] w-full sm:h-[190px]" viewBox="0 0 120 190">
          <rect fill="none" height="150" rx="12" stroke="#111" strokeWidth="3" width="56" x="32" y="20" />
          {links.map((index) => (
            <rect key={index} fill={index % 2 ? "#ffd400" : "#2b2b2b"} height="140" rx="5" width="7" x={36 + index * 8} y="25" />
          ))}
          <circle cx="60" cy="40" fill="#f2f3ef" r="7" stroke="#111" strokeWidth="2" />
          <path d="M20 170 H100" stroke="#111" strokeDasharray="3 3" strokeWidth="1.5" />
        </svg>
        <span className="text-[14px] font-semibold uppercase">Folded · 18 cm</span>
      </div>
      <div className="flex flex-[1.4] flex-col items-center justify-between rounded-lg bg-[#f2f3ef] p-3">
        <svg aria-hidden="true" className="h-[170px] w-full sm:h-[190px]" viewBox="0 0 200 190">
          <rect fill="#8a8f87" height="190" width="18" x="91" y="0" />
          {HEX.map(([x1, y1, x2, y2], index) => (
            <g key={index}>
              <line stroke="#111" strokeLinecap="round" strokeWidth="15" x1={x1} x2={x2} y1={y1} y2={y2} />
              <line stroke={index % 2 ? "#ffd400" : "#2b2b2b"} strokeLinecap="round" strokeWidth="11" x1={x1} x2={x2} y1={y1} y2={y2} />
            </g>
          ))}
          <rect fill="#111" height="24" rx="6" width="30" x="31" y="114" />
        </svg>
        <span className="text-[14px] font-semibold uppercase">Open · 90 cm loop</span>
      </div>
    </div>
  );
}
