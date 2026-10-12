"use client";

import { useState } from "react";

import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Slider } from "@/components/ui/slider";

// ---------------------------------------------------------------------------
// Color math. Every color in these demos is written as oklch(); these helpers
// only exist to keep the values inside sRGB (so no screen has to clip them)
// and to measure lightness and contrast. Matrices from Björn Ottosson's Oklab
// post, sRGB transfer function from the CSS Color 4 spec.

type Lch = { l: number; c: number; h: number };

function oklchToLinearSrgb({ l, c, h }: Lch): [number, number, number] {
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
  return oklchToLinearSrgb(color).every((v) => v >= -1e-4 && v <= 1 + 1e-4);
}

/** The most chroma sRGB can show at this lightness and hue. */
function maxChroma(l: number, h: number) {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (inSrgb({ l, c: mid, h })) lo = mid;
    else hi = mid;
  }
  return Math.floor(lo * 1000) / 1000;
}

function toLinear(v: number) {
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** sRGB channels (0-1) of an hsl() color, per the CSS Color 4 algorithm. */
function hslToSrgb(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

/** OKLab lightness of an sRGB color. */
function oklabLightness([r, g, b]: [number, number, number]) {
  const [lr, lg, lb] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}

/** WCAG 2 relative luminance of an in-gamut OKLCH color. */
function luminance(color: Lch) {
  const [r, g, b] = oklchToLinearSrgb(color).map((v) =>
    Math.min(1, Math.max(0, v))
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: number, b: number) {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const css = ({ l, c, h }: Lch) => `oklch(${l} ${c} ${h})`;
const gray = (l: number) => `oklch(${l.toFixed(3)} 0 0)`;

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : value;
}

// ---------------------------------------------------------------------------

const HUES = Array.from({ length: 12 }, (_, index) => index * 30);

type View = "color" | "lightness";

const VIEW_OPTIONS = [
  { value: "color", label: "Color" },
  { value: "lightness", label: "Lightness only" },
] as const;

function SwatchRow({
  label,
  swatches,
}: {
  label: string;
  swatches: string[];
}) {
  return (
    <div className="grid w-full gap-1.5">
      <span className="font-mono text-[10px] text-muted-foreground">
        {label}
      </span>
      <div
        aria-hidden="true"
        className="flex h-10 w-full overflow-hidden rounded-lg shadow-(--custom-shadow)"
      >
        {swatches.map((background, index) => (
          <span key={index} className="flex-1" style={{ background }} />
        ))}
      </div>
    </div>
  );
}

export function OklchDemo() {
  const [percent, setPercent] = useState(65);
  const [view, setView] = useState<View>("color");
  const lightness = percent / 100;
  // One chroma for every hue: the most the weakest hue can hold in sRGB at
  // this lightness, so none of the twelve swatches gets clipped.
  const chroma = Math.min(...HUES.map((h) => maxChroma(lightness, h)));
  const strip = view === "lightness";

  const hsl = HUES.map((h) => {
    const rgb = hslToSrgb(h, 0.85, lightness);
    return strip
      ? gray(oklabLightness(rgb))
      : `hsl(${h} 85% ${percent}%)`;
  });
  const oklch = HUES.map((h) =>
    strip ? gray(lightness) : css({ l: lightness, c: chroma, h })
  );

  return (
    <Demo className="gap-10 px-4 sm:px-8">
      <div className="grid w-full max-w-sm gap-4">
        <SwatchRow label={`hsl(h 85% ${percent}%)`} swatches={hsl} />
        <SwatchRow
          label={`oklch(${lightness.toFixed(2)} ${chroma.toFixed(3)} h)`}
          swatches={oklch}
        />
      </div>

      <div className="flex w-full flex-col items-center gap-8">
        <label className="grid w-full max-w-xs gap-2.5">
          <span className="flex items-center justify-between text-xs text-muted-foreground">
            Lightness
            <span className="tabular-nums text-foreground">{percent}%</span>
          </span>
          <Slider
            aria-label="Lightness"
            max={75}
            min={50}
            onValueChange={(value) => setPercent(getSliderValue(value))}
            step={1}
            value={[percent]}
          />
        </label>
        <SegmentedControl
          ariaLabel="Swatch view"
          onChange={setView}
          options={VIEW_OPTIONS}
          value={view}
        />
      </div>
    </Demo>
  );
}

// ---------------------------------------------------------------------------

type PairId = "blue-amber" | "red-teal" | "pink-green";

// Endpoints chosen so the whole OKLCH path stays inside sRGB: the gradient
// you see is the real interpolation, not a clipped one.
const PAIRS = [
  {
    value: "blue-amber",
    label: "Blue to amber",
    from: "oklch(0.6 0.16 260)",
    to: "oklch(0.75 0.16 70)",
  },
  {
    value: "red-teal",
    label: "Red to teal",
    from: "oklch(0.65 0.15 20)",
    to: "oklch(0.9 0.15 190)",
  },
  {
    value: "pink-green",
    label: "Pink to green",
    from: "oklch(0.6 0.15 350)",
    to: "oklch(0.85 0.15 160)",
  },
] as const;

function GradientRow({ label, style }: { label: string; style: string }) {
  return (
    <div className="grid w-full gap-1.5">
      <span className="font-mono text-[10px] text-muted-foreground">
        {label}
      </span>
      <div
        aria-hidden="true"
        className="h-10 w-full rounded-lg shadow-(--custom-shadow)"
        style={{ background: style }}
      />
    </div>
  );
}

export function OklchGradientDemo() {
  const [pair, setPair] = useState<PairId>("blue-amber");
  const current = PAIRS.find((option) => option.value === pair) ?? PAIRS[0];

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="grid w-full max-w-sm gap-4">
        <GradientRow
          label="in srgb"
          style={`linear-gradient(to right in srgb, ${current.from}, ${current.to})`}
        />
        <GradientRow
          label="in oklch"
          style={`linear-gradient(to right in oklch, ${current.from}, ${current.to})`}
        />
      </div>

      <SegmentedControl
        ariaLabel="Gradient colors"
        onChange={setPair}
        options={PAIRS}
        value={pair}
      />
    </Demo>
  );
}

// ---------------------------------------------------------------------------

/** Lightness and target chroma per step. Chroma tapers at both ends. */
const RAMP = [
  { l: 0.97, c: 0.02 },
  { l: 0.93, c: 0.05 },
  { l: 0.87, c: 0.09 },
  { l: 0.78, c: 0.13 },
  { l: 0.68, c: 0.16 },
  { l: 0.58, c: 0.17 },
  { l: 0.48, c: 0.15 },
  { l: 0.38, c: 0.12 },
  { l: 0.28, c: 0.08 },
] as const;

const WHITE = 1;

export function OklchPaletteDemo() {
  const [hue, setHue] = useState(250);
  // Lightness is fixed per step. Chroma is capped at what sRGB can show for
  // this hue, which is why some hues come out softer than others.
  const steps = RAMP.map(({ l, c }) => ({
    l,
    c: Math.min(c, maxChroma(l, hue)),
    h: hue,
  }));
  const button = steps[6];
  const ratio = contrast(WHITE, luminance(button));

  return (
    <Demo className="gap-10 px-4 sm:px-8">
      <div className="flex w-full max-w-sm flex-col items-center gap-5">
        <div aria-hidden="true" className="grid w-full grid-cols-9 gap-1">
          {steps.map((step, index) => (
            <div key={index} className="grid justify-items-center gap-1.5">
              <span
                className="aspect-square w-full rounded-md shadow-(--custom-shadow)"
                style={{ background: css(step) }}
              />
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {(index + 1) * 100}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-card px-4 py-3 shadow-(--custom-shadow)">
          <span
            aria-hidden="true"
            className="rounded-full px-2.5 py-1 text-xs font-medium dark:hidden"
            style={{ background: css(steps[1]), color: css(steps[6]) }}
          >
            Shipped
          </span>
          <span
            aria-hidden="true"
            className="hidden rounded-full px-2.5 py-1 text-xs font-medium dark:inline"
            style={{ background: css(steps[7]), color: css(steps[2]) }}
          >
            Shipped
          </span>
          <span
            aria-hidden="true"
            className="rounded-full px-3 py-1.5 text-xs font-medium text-white"
            style={{ background: css(button) }}
          >
            Continue
          </span>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {ratio.toFixed(1)}:1 contrast
          </span>
        </div>
      </div>

      <label className="grid w-full max-w-xs gap-2.5">
        <span className="flex items-center justify-between text-xs text-muted-foreground">
          Hue
          <span className="tabular-nums text-foreground">{hue}°</span>
        </span>
        <Slider
          aria-label="Hue"
          max={360}
          min={0}
          onValueChange={(value) => setHue(getSliderValue(value))}
          step={1}
          value={[hue]}
        />
      </label>
    </Demo>
  );
}
