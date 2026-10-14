"use client";

import { useState } from "react";

import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Color math: OKLCH to sRGB (Björn Ottosson's matrices), the sRGB gamut
// limit, and WCAG 2 contrast. Same approach as the OKLCH demos.

type Lch = { l: number; c: number; h: number };

function toLinearSrgb({ l, c, h }: Lch): [number, number, number] {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

function inSrgb(color: Lch) {
  return toLinearSrgb(color).every((v) => v >= -1e-4 && v <= 1 + 1e-4);
}

function maxChroma(l: number, h: number) {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (inSrgb({ l, c: mid, h })) lo = mid;
    else hi = mid;
  }
  return lo;
}

function luminance(color: Lch) {
  const [r, g, b] = toLinearSrgb(color).map((v) =>
    Math.min(1, Math.max(0, v))
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Lch, b: Lch) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const css = ({ l, c, h }: Lch) =>
  `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;

// ---------------------------------------------------------------------------
// One set of lightness steps per ground, shared by every hue. Chroma rises
// toward the solid step (9) and falls again for text, capped at what sRGB
// can show at that lightness and hue.

const LIGHT_STEPS = [
  0.993, 0.98, 0.955, 0.93, 0.9, 0.865, 0.81, 0.73, 0.54, 0.5, 0.46, 0.25,
];
const DARK_STEPS = [
  0.17, 0.2, 0.245, 0.28, 0.315, 0.36, 0.42, 0.5, 0.54, 0.6, 0.82, 0.95,
];
const CHROMA_SHAPE = [
  0.06, 0.12, 0.25, 0.35, 0.45, 0.55, 0.65, 0.8, 1, 1, 0.9, 0.4,
];
const BRIGHT_SOLID = 0.88;
// Neutrals take a trace of the brand hue.
const NEUTRAL_TINT = 0.12;

function ramp(steps: number[], h: number, c: number): Lch[] {
  return steps.map((l, i) => ({
    l,
    c: Math.min(c * CHROMA_SHAPE[i], maxChroma(l, h)),
    h,
  }));
}

type Ground = "light" | "dark";

type Subject = {
  id: string;
  label: string;
  product: string;
  noun: string;
  hue: number;
  chroma: number;
  ground: Ground;
  headline: string;
  body: string;
  badge: string;
  action: string;
};

const SUBJECTS: Subject[] = [
  {
    id: "lido",
    label: "Lido",
    product: "Parkside Lido",
    noun: "the pool's tiles",
    hue: 215,
    chroma: 0.13,
    ground: "light",
    headline: "Lane swim, 6:30 tomorrow",
    body: "Water is 19°. The slow lane is free until seven.",
    badge: "2 lanes open",
    action: "Book a lane",
  },
  {
    id: "courier",
    label: "Bike courier",
    product: "Spoke Dispatch",
    noun: "a hi-vis vest",
    hue: 118,
    chroma: 0.2,
    ground: "dark",
    headline: "Pickup at Leman St, 4 min",
    body: "Two parcels, both under a kilo. Drop by 18:40.",
    badge: "Rush",
    action: "Accept job",
  },
  {
    id: "plums",
    label: "Plum orchard",
    product: "Damson Co-op",
    noun: "ripe plums",
    hue: 335,
    chroma: 0.12,
    ground: "dark",
    headline: "Harvest week 3 of 5",
    body: "1,240 kg picked so far. Rows 12 to 18 are ready.",
    badge: "Ripe",
    action: "Log a crate",
  },
  {
    id: "forage",
    label: "Foraging",
    product: "Fieldnote",
    noun: "a chanterelle",
    hue: 72,
    chroma: 0.14,
    ground: "light",
    headline: "Chanterelles near you",
    body: "Three finds this week under beech, after the rain.",
    badge: "In season",
    action: "Add a find",
  },
  {
    id: "glacier",
    label: "Glacier survey",
    product: "Icefield Log",
    noun: "glacier ice",
    hue: 225,
    chroma: 0.04,
    ground: "light",
    headline: "Stake 14 moved 31 cm",
    body: "Measured at 09:12. Snow line holding at 2,410 m.",
    badge: "Synced",
    action: "Add reading",
  },
  {
    id: "chili",
    label: "Hot sauce",
    product: "Ember & Vine",
    noun: "dried chilies",
    hue: 32,
    chroma: 0.18,
    ground: "dark",
    headline: "This month: smoked habanero",
    body: "Ships on the 14th. Heat 8 of 10, bottled in small batches.",
    badge: "Batch 41",
    action: "Skip this month",
  },
];

const GROUNDS = [
  { value: "light", label: "Light ground" },
  { value: "dark", label: "Dark ground" },
] as const;

const WHITE: Lch = { l: 1, c: 0, h: 0 };

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : value;
}

function Ratio({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-0.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums text-foreground">
        {value.toFixed(1)}:1{" "}
        <span className="text-xs font-normal text-muted-foreground">
          {value >= 4.5 ? "passes" : "fails"}
        </span>
      </span>
    </div>
  );
}

export function PaletteWorldDemo() {
  const [subjectId, setSubjectId] = useState("lido");
  const subject = SUBJECTS.find((s) => s.id === subjectId) ?? SUBJECTS[0];
  const [hue, setHue] = useState(subject.hue);
  const [chroma, setChroma] = useState(subject.chroma);
  const [ground, setGround] = useState<Ground>(subject.ground);

  function pick(next: Subject) {
    setSubjectId(next.id);
    setHue(next.hue);
    setChroma(next.chroma);
    setGround(next.ground);
  }

  const steps = ground === "light" ? LIGHT_STEPS : DARK_STEPS;
  const brand = ramp(steps, hue, chroma);
  // Yellows, limes and some greens only get vivid when they're light. At the
  // usual solid lightness they turn olive, so (as Radix does) their solid
  // steps sit high and take dark text.
  const bright =
    chroma > maxChroma(0.54, hue) &&
    maxChroma(BRIGHT_SOLID, hue) > maxChroma(0.54, hue) * 1.25;
  if (bright) {
    brand[8] = {
      l: BRIGHT_SOLID,
      c: Math.min(chroma, maxChroma(BRIGHT_SOLID, hue)),
      h: hue,
    };
    brand[9] = {
      l: BRIGHT_SOLID - 0.04,
      c: Math.min(chroma, maxChroma(BRIGHT_SOLID - 0.04, hue)),
      h: hue,
    };
  }
  const gray = ramp(steps, hue, Math.min(chroma, 0.1) * NEUTRAL_TINT);

  const surface = gray[1];
  const solid = brand[8];
  // The label on the solid step is white or the darkest gray, whichever
  // reads better on it. Vivid yellows and limes take the dark one.
  const ink = ground === "light" ? gray[11] : gray[0];
  const onSolid =
    contrast(WHITE, solid) >= contrast(ink, solid) ? WHITE : ink;

  const ratios = {
    body: contrast(gray[10], surface),
    link: contrast(brand[10], surface),
    button: contrast(onSolid, solid),
  };

  const adjusted = hue !== subject.hue || chroma !== subject.chroma;

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div
        aria-label="Subject"
        className="flex w-full max-w-lg flex-wrap gap-1"
        role="group"
      >
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            aria-pressed={s.id === subject.id}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 max-sm:h-11",
              s.id === subject.id
                ? "bg-primary/7 text-foreground shadow-(--custom-shadow) dark:bg-muted"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => pick(s)}
            type="button"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        className="w-full max-w-lg overflow-hidden rounded-xl shadow-(--custom-shadow)"
        style={{ background: css(gray[0]) }}
      >
        <div
          className="flex items-center justify-between gap-3 px-5 py-3"
          style={{ background: css(solid), color: css(onSolid) }}
        >
          <span className="text-sm font-semibold">{subject.product}</span>
          <span className="text-xs font-medium">
            Hue from {subject.noun}
            {adjusted ? " (adjusted)" : ""}
          </span>
        </div>
        <div
          className="m-3 rounded-lg p-5 sm:m-4"
          style={{
            background: css(surface),
            boxShadow: `0 0 0 1px ${css(gray[5])}`,
          }}
        >
          <span
            className="inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium"
            style={{ background: css(brand[2]), color: css(brand[10]) }}
          >
            {subject.badge}
          </span>
          <p
            className="mt-3 text-xl font-semibold tracking-tight"
            style={{ color: css(gray[11]) }}
          >
            {subject.headline}
          </p>
          <p className="mt-1 text-sm leading-6" style={{ color: css(gray[10]) }}>
            {subject.body}{" "}
            <span
              className="font-medium underline underline-offset-2"
              style={{ color: css(brand[10]) }}
            >
              Details
            </span>
          </p>
          <span
            className="mt-4 inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium"
            style={{ background: css(solid), color: css(onSolid) }}
          >
            {subject.action}
          </span>
        </div>

        <div className="grid gap-1.5 px-3 pb-4 sm:px-4" aria-hidden="true">
          {[brand, gray].map((row, r) => (
            <div key={r} className="grid grid-cols-12 gap-1">
              {row.map((step, i) => (
                <span
                  key={i}
                  className="h-5 rounded-[4px]"
                  style={{ background: css(step) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid w-full max-w-lg grid-cols-3 gap-4">
        <Ratio label="Body text" value={ratios.body} />
        <Ratio label="Link" value={ratios.link} />
        <Ratio label="Button" value={ratios.button} />
      </div>

      <div className="grid w-full max-w-lg gap-5 sm:grid-cols-2 sm:gap-8">
        <label className="grid gap-2.5">
          <span className="flex items-center justify-between text-xs text-muted-foreground">
            Hue
            <span className="tabular-nums text-foreground">
              {Math.round(hue)}°
            </span>
          </span>
          <Slider
            aria-label="Hue"
            max={359}
            min={0}
            onValueChange={(value) => setHue(getSliderValue(value))}
            step={1}
            value={[hue]}
          />
        </label>
        <label className="grid gap-2.5">
          <span className="flex items-center justify-between text-xs text-muted-foreground">
            Chroma (energy)
            <span className="tabular-nums text-foreground">
              {chroma.toFixed(2)}
            </span>
          </span>
          <Slider
            aria-label="Chroma"
            max={0.24}
            min={0}
            onValueChange={(value) => setChroma(getSliderValue(value))}
            step={0.01}
            value={[chroma]}
          />
        </label>
      </div>

      <SegmentedControl
        ariaLabel="Ground lightness"
        onChange={setGround}
        options={GROUNDS}
        value={ground}
      />
    </Demo>
  );
}
