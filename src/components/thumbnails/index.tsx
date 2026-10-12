import {
  BellIcon,
  CheckCircleIcon,
  CopyIcon,
  HeartIcon,
  StarIcon,
} from "@phosphor-icons/react/dist/ssr";

import { SectionIcon } from "@/components/app/section-icon";
import type { Section } from "@/lib/sections";

// Static-by-default thumbnails; each plays its idea on card hover (the index
// card is a `group`). Rest is neutral and shows the problem, hover shows the
// fix, and sky is the only accent — always as a dashed guide or marker.
// Easings (`ease-snappy`, `ease-spring`) and keyframes live in globals.css.

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E")`;

// Dashed sky guide, off until the card is hovered. It sets no transition of
// its own so it never overrides the element's transition-property.
const GUIDE = "border-dashed border-sky-500/0 group-hover:border-sky-500/60";

// One edge for every surface, so borders match across cards.
const EDGE = "ring-1 ring-border";

function Cursor({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 16"
      className={`h-4 w-3 drop-shadow-xs ${className}`}
      aria-hidden
    >
      <path
        d="M1 1 L1 13 L4 10 L6.5 15 L8.5 14 L6 9 L10.5 9 Z"
        className="fill-foreground stroke-card"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Typography */

function LetterSpacingThumbnail() {
  // The letters really move: tracking animates, and the guides hug the word
  // so you see the line close in with it.
  return (
    <span
      className={`inline-block border-x px-3 text-3xl font-medium [letter-spacing:0.12em] transition-[letter-spacing,border-color] duration-700 ease-snappy group-hover:[letter-spacing:-0.04em] ${GUIDE}`}
    >
      Tracking
    </span>
  );
}

function TextWrappingThumbnail() {
  // The measure narrows, so the text rewraps for real — and balances
  // instead of stranding the last word.
  return (
    <p className="w-44 text-sm font-medium transition-[width] duration-700 ease-snappy group-hover:w-28 group-hover:[text-wrap:balance]">
      Design is how it works, not only how it looks
    </p>
  );
}

function TabularNumsThumbnail() {
  // The same number twice: proportional on top, tabular below. Hover moves
  // the emphasis from the narrow one to the one that would line up.
  return (
    <div className="flex flex-col items-end text-4xl leading-none font-medium">
      <span className="[font-variant-numeric:normal] transition-colors duration-300 group-hover:text-muted-foreground">
        1,111
      </span>
      <span className="text-muted-foreground tabular-nums transition-colors duration-300 group-hover:text-foreground">
        1,111
      </span>
    </div>
  );
}

const SHAPES = ["square", "circle", "triangle"] as const;

function OpticalAlignmentThumbnail() {
  // Same bounding box for all three. The circle and triangle have to grow
  // past it to look the same size.
  return (
    <div className="flex items-center gap-3">
      {SHAPES.map((shape) => (
        <span
          key={shape}
          className={`flex size-12 items-center justify-center rounded-lg border transition-colors duration-300 ${GUIDE}`}
        >
          {shape === "square" ? (
            <span className="size-7 rounded-[3px] bg-muted-foreground/50" />
          ) : shape === "circle" ? (
            <span className="size-7 rounded-full bg-muted-foreground/50 transition-transform duration-500 ease-snappy group-hover:scale-[1.09]" />
          ) : (
            <svg viewBox="0 0 28 28" className="size-7">
              <polygon
                points="14,3 26,25 2,25"
                className="fill-muted-foreground/50 transition-transform duration-500 ease-snappy [transform-origin:center] group-hover:scale-120"
              />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
}

// One set, three weights. Colours match the first demo in the article.
const ICON_WEIGHTS = [
  {
    Icon: StarIcon,
    weight: "regular",
    color: "group-hover:text-sky-400 dark:group-hover:text-sky-500",
  },
  {
    Icon: HeartIcon,
    weight: "fill",
    color: "group-hover:text-amber-400 dark:group-hover:text-yellow-500",
  },
  {
    Icon: BellIcon,
    weight: "duotone",
    color: "group-hover:text-green-400 dark:group-hover:text-green-500",
  },
] as const;

function IconsThumbnail() {
  return (
    <div className="flex items-center gap-4">
      {ICON_WEIGHTS.map(({ Icon, weight, color }) => (
        <Icon
          key={weight}
          weight={weight}
          className={`size-8 text-muted-foreground transition-colors duration-300 ${color}`}
        />
      ))}
    </div>
  );
}

// Both copies share one weight so the glyphs line up exactly; a hairline
// stroke stands in for the heavier default rendering. The clips are
// complementary, so only one copy ever shows at any x.
const SMOOTH_SWEEP = "transition-[clip-path] duration-700 ease-snappy";

function FontSmoothingThumbnail() {
  // The dashed line sweeps across and leaves the antialiased, lighter
  // rendering behind it.
  return (
    <span className="relative inline-block text-4xl font-medium">
      <span
        className={`block [-webkit-font-smoothing:auto] [-webkit-text-stroke:0.7px_currentColor] [clip-path:inset(0_0_0_0)] group-hover:[clip-path:inset(0_0_0_100%)] ${SMOOTH_SWEEP}`}
      >
        Smooth
      </span>
      <span
        className={`absolute inset-0 [-webkit-font-smoothing:antialiased] [-moz-osx-font-smoothing:grayscale] [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0_0_0)] ${SMOOTH_SWEEP}`}
      >
        Smooth
      </span>
      {/* Visible only while travelling: it fades in as it sets off and, on
          the way back, fades out once it has arrived. */}
      <span className="absolute -inset-y-2 -left-2 border-l border-dashed border-sky-500 opacity-0 [transition:left_700ms_var(--ease-snappy),opacity_150ms_700ms] group-hover:left-[calc(100%+0.5rem)] group-hover:opacity-100 group-hover:[transition:left_700ms_var(--ease-snappy),opacity_150ms]" />
    </span>
  );
}

// Inter is variable, so the weight eases down with the tone.
const QUIET =
  "transition-[color,font-weight] duration-500 ease-snappy group-hover:font-normal group-hover:text-muted-foreground";

function VisualHierarchyThumbnail() {
  // Rest: every line bold and dark. Hover: nothing grows, the details just
  // step back, and the names and prices lead.
  return (
    <div
      className={`flex w-40 flex-col divide-y divide-border rounded-xl bg-card text-[11px] leading-4 ${EDGE}`}
    >
      {[
        ["Linen Shirt", "Sand", "$68", "12 left"],
        ["Wool Hoodie", "Charcoal", "$145", "3 left"],
      ].map(([name, meta, price, stock]) => (
        <div key={name} className="flex items-center gap-2 px-2.5 py-2">
          <span className="size-6 shrink-0 rounded-md bg-muted" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-semibold">{name}</span>
            <span className={`truncate font-semibold ${QUIET}`}>{meta}</span>
          </div>
          <div className="flex flex-col items-end tabular-nums">
            <span className="font-semibold">{price}</span>
            <span className={`font-semibold ${QUIET}`}>{stock}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Line widths at rest (one long measure) and on hover (the 65 character
// band). The text is the same, so the short version needs more lines; the
// extra ones grow in from nothing so the block stays centered.
const MEASURE_LINES = [
  "h-1.5 w-40 group-hover:w-24",
  "mt-2 h-1.5 w-40 group-hover:w-24",
  "mt-2 h-1.5 w-24",
  "mt-0 h-0 w-0 group-hover:mt-2 group-hover:h-1.5 group-hover:w-24",
  "mt-0 h-0 w-0 group-hover:mt-2 group-hover:h-1.5 group-hover:w-14",
];

function LineLengthThumbnail() {
  return (
    <div className="relative flex w-40 flex-col">
      {MEASURE_LINES.map((width, i) => (
        <span
          key={i}
          className={`rounded-full bg-muted-foreground/40 transition-[width,height,margin] duration-700 ease-snappy ${width}`}
        />
      ))}
      {/* The edge of the comfortable band. */}
      <span
        className={`absolute -inset-y-2 left-25 border-l transition-colors duration-300 ${GUIDE}`}
      />
    </div>
  );
}

// Rest: five sizes picked by eye, a pixel or so apart. Hover: they snap to
// the 1.2 scale (12, 14, 16, 20, 24) and every step becomes visible.
const TYPE_SIZES = [
  [15, 12],
  [15.5, 14],
  [16, 16],
  [17, 20],
  [18, 24],
];

function TypeScaleThumbnail() {
  return (
    <div className={`flex items-baseline gap-1.5 border-b pb-1 font-medium transition-colors duration-300 ${GUIDE}`}>
      {TYPE_SIZES.map(([rest, step]) => (
        <span
          key={step}
          className="leading-none [font-size:var(--rest)] transition-[font-size] duration-500 ease-snappy group-hover:[font-size:var(--step)]"
          style={
            { "--rest": `${rest}px`, "--step": `${step}px` } as React.CSSProperties
          }
        >
          Aa
        </span>
      ))}
    </div>
  );
}

/* Color */

const OKLCH_SWATCHES = [
  "oklch(0.72 0.13 25)",
  "oklch(0.82 0.14 92)",
  "oklch(0.72 0.13 150)",
  "oklch(0.72 0.13 230)",
  "oklch(0.72 0.13 300)",
];

function OklchThumbnail() {
  // Rest: desaturated, every swatch is the same grey. Hover: the hues come
  // back and still read as equally light.
  return (
    <div className="flex gap-1.5">
      {OKLCH_SWATCHES.map((background, i) => (
        <div
          key={i}
          className="size-7 rounded-lg ring-1 ring-black/5 grayscale transition-[filter] duration-500 group-hover:grayscale-0 dark:ring-white/10"
          style={{ background, transitionDelay: `${i * 40}ms` }}
        />
      ))}
    </div>
  );
}

function NoiseThumbnail() {
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-linear-to-br from-neutral-100 to-neutral-400 ring-1 ring-border dark:from-neutral-600 dark:to-neutral-900">
      <div
        className="absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-70"
        style={{ backgroundImage: NOISE_SVG }}
      />
    </div>
  );
}

function ShadowsNotBordersThumbnail() {
  return (
    <div className="flex h-16 w-24 flex-col justify-end gap-1.5 rounded-xl bg-card p-3 shadow-[0_0_0_1px_var(--border)] transition-[box-shadow,translate] duration-300 ease-snappy group-hover:-translate-y-0.5 group-hover:shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_1px_1px_rgba(0,0,0,0.04),0_2px_4px_-2px_rgba(0,0,0,0.05),0_6px_10px_-6px_rgba(0,0,0,0.06)] dark:group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_1px_1px_rgba(0,0,0,0.2),0_2px_4px_-2px_rgba(0,0,0,0.2),0_6px_10px_-6px_rgba(0,0,0,0.25)]">
      <div className="h-1.5 w-12 rounded-full bg-muted-foreground/40" />
      <div className="h-1.5 w-8 rounded-full bg-muted-foreground/20" />
    </div>
  );
}

function ImageOutlinesThumbnail() {
  // A pale image blends into the card until the inset outline frames it.
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-linear-to-b from-white to-neutral-100 outline-1 -outline-offset-1 outline-transparent transition-[outline-color] duration-300 group-hover:outline-black/8 dark:from-neutral-900 dark:to-neutral-800 dark:group-hover:outline-white/10">
      <div className="absolute top-4 right-5 size-4 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      <div className="absolute -bottom-4 -left-2 h-10 w-20 rounded-[50%] bg-neutral-200 dark:bg-neutral-700" />
      <div className="absolute -right-4 -bottom-5 h-10 w-20 rounded-[50%] bg-neutral-300 dark:bg-neutral-600" />
    </div>
  );
}

const STATUS_DOTS = [
  "group-hover:bg-[oklch(0.62_0.15_150)]",
  "group-hover:bg-[oklch(0.75_0.15_75)]",
  "group-hover:bg-[oklch(0.58_0.2_27)]",
];

function ColorRolesThumbnail() {
  // Rest: the accent is on everything. Hover: it drains to gray except for
  // the button, and the status dots take on their meanings.
  return (
    <div
      className={`flex w-28 flex-col gap-2.5 rounded-xl bg-card p-3 [--acc:oklch(0.55_0.18_265)] dark:[--acc:oklch(0.72_0.12_265)] ${EDGE}`}
    >
      {STATUS_DOTS.map((dot, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="h-1.5 w-12 rounded-full bg-(--acc) transition-colors duration-500 group-hover:bg-muted-foreground/40"
            style={{ transitionDelay: `${i * 40}ms` }}
          />
          <span
            className={`ml-auto size-1.5 rounded-full bg-(--acc) transition-colors duration-500 ${dot}`}
            style={{ transitionDelay: `${i * 40}ms` }}
          />
        </div>
      ))}
      <span className="h-4 w-10 self-end rounded-full bg-(--acc)" />
    </div>
  );
}

function DarkModeThumbnail() {
  // Rest: inverted, so page, card and menu are all black and the edges are
  // gone. Hover: each layer steps up in lightness and the accent softens.
  return (
    <div
      className={`relative h-20 w-28 overflow-hidden rounded-xl bg-black transition-colors duration-500 group-hover:bg-[oklch(0.17_0_0)] ${EDGE}`}
    >
      <div className="absolute top-3 left-3 flex h-12 w-18 flex-col gap-1.5 rounded-lg bg-black p-2.5 transition-[background-color,box-shadow] duration-500 group-hover:bg-[oklch(0.205_0_0)] group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.04),0_2px_6px_rgba(0,0,0,0.4)]">
        <span className="h-1.5 w-9 rounded-full bg-white transition-colors duration-500 group-hover:bg-[oklch(0.945_0_0)]" />
        <span className="h-1.5 w-6 rounded-full bg-[oklch(0.5_0.25_265)] transition-colors duration-500 group-hover:bg-[oklch(0.72_0.12_265)]" />
      </div>
      <div className="absolute right-3 bottom-3 flex h-8 w-11 flex-col justify-center gap-1.5 rounded-md bg-black px-2 transition-[background-color,box-shadow] delay-75 duration-500 group-hover:bg-[oklch(0.24_0_0)] group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(255,255,255,0.05),0_4px_10px_rgba(0,0,0,0.5)]">
        <span className="h-1 w-6 rounded-full bg-white transition-colors duration-500 group-hover:bg-[oklch(0.945_0_0)]" />
        <span className="h-1 w-4 rounded-full bg-white/50 transition-colors duration-500 group-hover:bg-[oklch(0.66_0_0)]" />
      </div>
    </div>
  );
}

/* Layout */

function NestedRadiusThumbnail() {
  // Rest: same radius inside and out, so the gap pinches at the corners.
  // Hover: inner radius = outer radius - padding.
  return (
    <div className="rounded-[24px] bg-muted p-2 ring-1 ring-border">
      <div className="h-16 w-24 rounded-[24px] bg-card shadow-xs ring-1 ring-border transition-[border-radius] duration-500 ease-snappy group-hover:rounded-[16px]" />
    </div>
  );
}

function SquirclesThumbnail() {
  return (
    <div className="size-20 rounded-[28px] bg-muted ring-1 ring-border corner-round transition-[corner-shape,border-radius] duration-500 ease-snappy group-hover:rounded-[34px] group-hover:corner-squircle" />
  );
}

function HitAreasThumbnail() {
  // The target is always drawn; hovering only lights it up.
  return (
    <span className="relative flex items-center justify-center">
      <span className="absolute -inset-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 transition-colors duration-300 group-hover:border-sky-500/50 group-hover:bg-sky-500/5" />
      <HeartIcon
        weight="fill"
        className="size-6 text-muted-foreground/60 transition-colors duration-150 group-hover:text-rose-500"
      />
      <Cursor className="absolute top-full left-full translate-x-4 translate-y-4 opacity-0 transition-all duration-500 ease-snappy group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:opacity-100" />
    </span>
  );
}

function MiniPage({ canvasShows }: { canvasShows: boolean }) {
  // Browser chrome owns the rounded top corners and the viewport below it is
  // square, so the canvas strip never lands on a clipped edge — the same
  // reason the article's demo draws a window frame.
  return (
    <div className="h-20 w-16 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
      <div className="flex h-3.5 items-center gap-0.5 px-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1 rounded-full bg-muted-foreground/40"
          />
        ))}
      </div>
      <div className="relative h-[calc(100%-0.875rem)] overflow-hidden bg-white dark:bg-neutral-900">
        {canvasShows && (
          <div className="absolute inset-x-0 top-0 h-5 bg-neutral-900 dark:bg-white" />
        )}
        <div className="absolute inset-0 bg-white p-2 transition-transform duration-500 ease-snappy group-hover:translate-y-3 dark:bg-neutral-900">
          <div className="h-1.5 w-8 rounded-full bg-neutral-900/35 dark:bg-white/35" />
          <div className="mt-2 h-1 w-10 rounded-full bg-neutral-900/20 dark:bg-white/20" />
          <div className="mt-1 h-1 w-7 rounded-full bg-neutral-900/20 dark:bg-white/20" />
        </div>
      </div>
    </div>
  );
}

function HtmlBackgroundThumbnail() {
  // Overscroll: a white canvas shows through on the left, the matched one
  // on the right does not.
  return (
    <div className="flex gap-3">
      <MiniPage canvasShows />
      <MiniPage canvasShows={false} />
    </div>
  );
}

function ClipPathThumbnail() {
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--border)_6px_7px)]" />
      <div className="absolute inset-0 flex flex-col justify-end gap-1.5 bg-card p-3 transition-[clip-path] duration-700 ease-snappy [clip-path:inset(0_65%_0_0)] group-hover:[clip-path:inset(0_20%_0_0)]">
        <div className="h-1.5 w-16 rounded-full bg-muted-foreground/40" />
        <div className="h-1.5 w-10 rounded-full bg-muted-foreground/20" />
      </div>
      <div className="absolute inset-y-0 left-[35%] w-px -translate-x-1/2 border-l border-dashed border-muted-foreground/40 transition-[left,border-color] duration-700 ease-snappy group-hover:left-[80%] group-hover:border-sky-500/60" />
    </div>
  );
}

function ScrollFadesThumbnail() {
  // At rest only the bottom fades (there is only more below). Once
  // scrolled, the top fades in too.
  return (
    <div className="scroll-fade-thumb h-20 w-28 overflow-hidden">
      <div className="flex flex-col gap-2 pt-1 transition-transform duration-700 ease-snappy group-hover:-translate-y-6">
        {[20, 26, 18, 24, 16, 22, 19].map((w, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-muted-foreground/30" />
            <div
              className="h-1.5 rounded-full bg-muted-foreground/30"
              style={{ width: w * 3.5 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function WhitespaceThumbnail() {
  // Rest: every gap is equal, so six lines read as one list. Hover: the gaps
  // inside each group shrink, the gap between them grows.
  return (
    <div className="flex w-24 flex-col gap-2 transition-[gap] duration-500 ease-snappy group-hover:gap-5">
      {[0, 1].map((group) => (
        <div
          key={group}
          className="flex flex-col gap-2 rounded-[3px] outline-1 outline-offset-[3px] outline-sky-500/0 outline-dashed transition-[gap,outline-color] duration-500 ease-snappy group-hover:gap-1 group-hover:outline-sky-500/60"
        >
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/50" />
          <div className="h-1.5 w-full rounded-full bg-muted-foreground/25" />
          <div className="h-1.5 w-16 rounded-full bg-muted-foreground/25" />
        </div>
      ))}
    </div>
  );
}

const SPACING_STEPS = [4, 8, 12, 16, 24, 32, 48, 64];
const ONE_OFF_SPACES = [6, 13, 9, 22, 18, 37, 30, 52];

function SpacingScaleThumbnail() {
  // Rest: values picked by eye. Hover: they snap to 4, 8, 12 ... 64.
  return (
    <div className="flex h-16 items-end gap-1.5">
      {SPACING_STEPS.map((step, i) => (
        <div
          key={step}
          className="h-(--rest) w-2 rounded-[2px] bg-muted-foreground/30 transition-[height,background-color] duration-500 ease-snappy group-hover:h-(--step) group-hover:bg-muted-foreground/50"
          style={
            {
              "--rest": `${ONE_OFF_SPACES[i]}px`,
              "--step": `${step}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

// Left offsets at rest: each block starts a few px off its neighbor.
const NEAR_MISSES = [0, 5, 2, 7, 3];

function AlignmentThumbnail() {
  // Rest: near misses. Hover: everything snaps to one edge, and the guide
  // shows it.
  const nudge = (i: number) =>
    ({ "--off": `${NEAR_MISSES[i]}px` }) as React.CSSProperties;
  const SNAP =
    "translate-x-(--off) transition-transform duration-500 ease-snappy group-hover:translate-x-0";

  return (
    <div className="relative flex w-24 flex-col gap-2">
      <span
        className={`absolute -inset-y-2 left-0 border-l transition-colors duration-500 ${GUIDE}`}
      />
      <div
        className={`h-2 w-14 rounded-full bg-muted-foreground/50 ${SNAP}`}
        style={nudge(0)}
      />
      <div
        className={`h-5 w-full rounded-[5px] bg-muted ${EDGE} ${SNAP}`}
        style={nudge(1)}
      />
      {[16, 12, 14].map((w, i) => (
        <div
          key={i}
          className={`flex items-center gap-1.5 ${SNAP}`}
          style={nudge(i + 2)}
        >
          <span className="size-2 rounded-full bg-muted-foreground/40" />
          <span
            className="h-1.5 rounded-full bg-muted-foreground/25"
            style={{ width: w * 4 }}
          />
        </div>
      ))}
    </div>
  );
}

const DENSITY_ROWS = [18, 13, 16, 11, 15, 12, 17, 14, 10, 16];

function DensityThumbnail() {
  // Rest: comfortable rows, about 4 to a screen. Hover: every value steps
  // down together and 7 fit.
  return (
    <div
      className={`h-20 w-28 overflow-hidden rounded-lg bg-card px-2 py-1 ${EDGE}`}
    >
      {DENSITY_ROWS.map((w, i) => (
        <div
          key={i}
          className="flex h-4 items-center gap-1.5 transition-[height,gap] duration-500 ease-snappy group-hover:h-2.5 group-hover:gap-1"
        >
          <span className="size-2 shrink-0 rounded-full bg-muted-foreground/40 transition-[width,height] duration-500 ease-snappy group-hover:size-1.5" />
          <span
            className="h-1.5 rounded-full bg-muted-foreground/25 transition-[height] duration-500 ease-snappy group-hover:h-1"
            style={{ width: w * 4 }}
          />
        </div>
      ))}
    </div>
  );
}

function ShiftMini({ reserved }: { reserved: boolean }) {
  // A post with a photo that arrives late and a button under the cursor.
  return (
    <div className={`relative flex h-20 w-14 flex-col rounded-lg bg-card p-1.5 ${EDGE}`}>
      <div className="mb-1.5 h-1.5 w-8 shrink-0 rounded-full bg-muted-foreground/40" />
      {reserved ? (
        <div className="mb-1.5 h-6 shrink-0 rounded-[3px] bg-muted">
          <div className="size-full rounded-[3px] bg-muted-foreground/30 opacity-0 transition-opacity delay-200 duration-300 group-hover:opacity-100" />
        </div>
      ) : (
        <>
          <div className="h-0 shrink-0 rounded-[3px] bg-muted-foreground/30 transition-[height,margin] delay-200 duration-150 ease-snappy group-hover:mb-1.5 group-hover:h-6" />
          <span
            className={`absolute inset-x-1.5 top-[18px] h-3 rounded-full border ${GUIDE}`}
          />
        </>
      )}
      <div className="h-3 w-full shrink-0 rounded-full bg-foreground/80" />
      <Cursor
        className={`absolute left-6 ${reserved ? "top-[52px]" : "top-[22px]"}`}
      />
    </div>
  );
}

function LayoutShiftThumbnail() {
  // Hover: a photo arrives in both. On the left nothing was holding its
  // place, so the button drops out from under the cursor.
  return (
    <div className="flex gap-3">
      <ShiftMini reserved={false} />
      <ShiftMini reserved />
    </div>
  );
}

function ResponsiveThumbnail() {
  // A real container query: the box narrows on hover and the card inside
  // stacks once its container drops below 5rem.
  return (
    <div
      className={`@container w-28 rounded-xl border p-1 transition-[width,border-color] duration-700 ease-snappy group-hover:w-16 ${GUIDE}`}
    >
      <div
        className={`flex flex-col gap-1.5 rounded-lg bg-card p-1.5 @min-[5rem]:flex-row @min-[5rem]:items-center ${EDGE}`}
      >
        <div className="h-6 w-full shrink-0 rounded-[3px] bg-muted-foreground/30 @min-[5rem]:w-6" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="h-1.5 w-full rounded-full bg-muted-foreground/45" />
          <div className="h-1 w-2/3 rounded-full bg-muted-foreground/25" />
        </div>
      </div>
    </div>
  );
}

/* Interaction */

// Rest: six copies of one face. Hover: each takes its own state - rest,
// hover, pressed, focus, disabled, loading.
const STATE_FACES = [
  "",
  "group-hover:bg-foreground/75",
  "group-hover:scale-[0.92] group-hover:bg-foreground/65",
  "group-hover:outline-foreground group-hover:outline-offset-2",
  "group-hover:opacity-30",
  "",
];

function InteractionStatesThumbnail() {
  return (
    <div className="grid grid-cols-3 gap-x-2.5 gap-y-3">
      {STATE_FACES.map((face, i) => (
        <span
          key={i}
          className={`relative grid h-5 w-8 place-items-center rounded-full bg-foreground outline-2 outline-offset-0 outline-transparent transition-[background-color,scale,opacity,outline-color,outline-offset] duration-300 ease-snappy ${face}`}
          style={{ transitionDelay: `${i * 40}ms` }}
        >
          {i === 5 ? (
            <span
              className="size-2.5 rounded-full border-[1.5px] border-background/70 border-t-transparent opacity-0 transition-opacity duration-300 group-hover:animate-spin group-hover:opacity-100"
              style={{ transitionDelay: "200ms" }}
            />
          ) : null}
        </span>
      ))}
    </div>
  );
}

function FocusRingsThumbnail() {
  // Tab is pressed and the ring lands on the button, offset from its edge.
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid h-6 place-items-center rounded-md bg-card px-1.5 text-[10px] font-medium text-muted-foreground shadow-xs group-hover:animate-[thumb-press_600ms_ease-out] ${EDGE}`}
      >
        Tab
      </span>
      <span
        className={`rounded-full bg-card px-4 py-2 text-xs font-medium shadow-xs outline-2 outline-offset-0 outline-transparent transition-[outline-color,outline-offset] delay-150 duration-300 ease-snappy group-hover:outline-foreground group-hover:outline-offset-2 ${EDGE}`}
      >
        Invite
      </span>
    </div>
  );
}

function InputDetailsThumbnail() {
  // Rest: an error after the first letter. Hover: the rest of the email
  // types in and the error goes away.
  return (
    <div className="flex w-28 flex-col gap-1.5">
      <div className="flex h-8 items-center rounded-lg bg-card px-2 text-[11px] shadow-xs ring-1 ring-rose-500/60 transition-[box-shadow] duration-300 group-hover:ring-border">
        <span>j</span>
        <span className="[clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-700 ease-[steps(12)] group-hover:[clip-path:inset(0_0_0_0)]">
          ane@site.com
        </span>
      </div>
      <span className="pl-0.5 text-[9px] text-rose-500 transition-opacity duration-200 group-hover:opacity-0">
        Invalid email
      </span>
    </div>
  );
}

function EmptyStatesThumbnail() {
  // Rest: a lone "No data." line. Hover: the same card says what goes here
  // and offers the one next action.
  return (
    <div
      className={`relative flex h-20 w-28 items-center justify-center rounded-xl bg-card shadow-xs ${EDGE}`}
    >
      <div className="h-1.5 w-10 rounded-full bg-muted-foreground/25 transition-opacity duration-200 group-hover:opacity-0" />
      <div className="absolute inset-0 flex translate-y-1 flex-col items-center justify-center gap-1 opacity-0 transition-[opacity,translate] duration-500 ease-snappy group-hover:translate-y-0 group-hover:opacity-100">
        <div className="mb-1 size-4 rounded-[5px] bg-muted ring-1 ring-border" />
        <div className="h-1.5 w-12 rounded-full bg-muted-foreground/45" />
        <div className="h-1 w-16 rounded-full bg-muted-foreground/20" />
        <div className="mt-1 h-3.5 w-11 rounded-full bg-foreground/80" />
      </div>
    </div>
  );
}

function CommandMenuThumbnail() {
  // One shortcut, and the menu is just there: no transition on purpose.
  // Every row carries its own shortcut.
  return (
    <div className="relative flex h-20 w-28 items-center justify-center">
      <div className="flex gap-1.5 group-hover:opacity-0">
        {["⌘", "K"].map((key) => (
          <span
            key={key}
            className={`grid size-8 place-items-center rounded-lg bg-card text-sm font-medium text-muted-foreground shadow-xs ${EDGE}`}
          >
            {key}
          </span>
        ))}
      </div>
      <div
        className={`absolute inset-0 flex flex-col rounded-xl bg-card p-1 opacity-0 shadow-sm group-hover:opacity-100 ${EDGE}`}
      >
        <div className="mb-1 flex h-4 items-center gap-1 border-b border-border px-1 pb-1">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          <span className="h-1 w-8 rounded-full bg-muted-foreground/30" />
        </div>
        {[14, 10, 12].map((width, i) => (
          <div
            key={i}
            className={`flex h-4.5 items-center justify-between rounded-[5px] px-1 ${i === 0 ? "bg-muted" : ""}`}
          >
            <span
              className="h-1 rounded-full bg-muted-foreground/40"
              style={{ width: width * 4 }}
            />
            <span className="h-2.5 w-3 rounded-[3px] bg-background ring-1 ring-border" />
          </div>
        ))}
      </div>
    </div>
  );
}

function OverlaysThumbnail() {
  // The modal's list scrolls to its end inside the dashed edge, and the page
  // behind stays exactly where it was.
  return (
    <div
      className={`relative h-20 w-28 overflow-hidden rounded-xl bg-card ${EDGE}`}
    >
      <div className="flex flex-col gap-1.5 p-2.5">
        <div className="h-1.5 w-10 rounded-full bg-muted-foreground/40" />
        {[20, 16, 22, 14, 18].map((width, i) => (
          <div
            key={i}
            className="h-1 rounded-full bg-muted-foreground/20"
            style={{ width: width * 4 }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-black/10 dark:bg-black/40" />
      <div
        className={`absolute inset-x-5 inset-y-3 overflow-hidden rounded-lg bg-card shadow-sm ${EDGE}`}
      >
        <div className="flex flex-col gap-1.5 p-2 transition-transform duration-700 ease-snappy group-hover:-translate-y-7">
          {[12, 9, 11, 8, 12, 10, 9].map((width, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-muted-foreground/35"
              style={{ width: width * 4 }}
            />
          ))}
        </div>
        <div
          className={`absolute inset-0.5 rounded-md border transition-colors duration-300 ${GUIDE}`}
        />
      </div>
    </div>
  );
}

// Rest: three toasts piled into a column over the page. Hover: they fold
// into one stack in the corner, the two behind peeking out.
const TOAST_PILE = [
  "",
  "-translate-y-5 group-hover:-translate-y-[3px] group-hover:scale-[0.92]",
  "-translate-y-10 group-hover:-translate-y-1.5 group-hover:scale-[0.84]",
];

function ToastsThumbnail() {
  return (
    <div
      className={`relative h-20 w-28 overflow-hidden rounded-xl bg-card ${EDGE}`}
    >
      <div className="flex flex-col gap-1.5 p-2.5">
        {[20, 16, 22, 14, 18].map((width, i) => (
          <div
            key={i}
            className="h-1 rounded-full bg-muted-foreground/20"
            style={{ width: width * 4 }}
          />
        ))}
      </div>
      {TOAST_PILE.map((pose, i) => (
        <div
          key={i}
          className={`absolute inset-x-1.5 bottom-1.5 flex h-4 items-center gap-1 rounded-[5px] bg-card px-1.5 shadow-xs transition-[translate,scale] duration-500 ease-snappy ${EDGE} ${pose}`}
          style={{ zIndex: 3 - i }}
        >
          <span
            className={`flex items-center gap-1 transition-opacity duration-300 ${i > 0 ? "group-hover:opacity-0" : ""}`}
          >
            <span className="size-1.5 rounded-full bg-muted-foreground/50" />
            <span
              className="h-1 rounded-full bg-muted-foreground/40"
              style={{ width: [40, 32, 36][i] }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

// Rest: "Are you sure?" over the list. Hover: no question, the row just
// goes and an Undo toast rises in its place.
function DestructiveActionsThumbnail() {
  return (
    <div
      className={`relative h-20 w-28 overflow-hidden rounded-xl bg-card p-1.5 ${EDGE}`}
    >
      {[12, 9, 11].map((width, i) => (
        <div
          key={i}
          className={`flex h-5 items-center justify-between overflow-hidden px-1 transition-[height,opacity] duration-300 ease-snappy ${
            i === 1 ? "group-hover:h-0 group-hover:opacity-0" : ""
          }`}
        >
          <span
            className="h-1 rounded-full bg-muted-foreground/35"
            style={{ width: width * 4 }}
          />
          <span className="size-2 rounded-[2px] bg-muted-foreground/25" />
        </div>
      ))}
      <div className="absolute inset-0 bg-black/10 transition-opacity duration-150 group-hover:opacity-0 dark:bg-black/40" />
      <div
        className={`absolute inset-x-5 top-1/2 flex -translate-y-1/2 flex-col gap-2 rounded-lg bg-card p-2 shadow-sm transition-opacity duration-150 group-hover:opacity-0 ${EDGE}`}
      >
        <span className="h-1.5 w-10 rounded-full bg-muted-foreground/45" />
        <span className="flex justify-end gap-1">
          <span className="h-2.5 w-5 rounded-full bg-muted" />
          <span className="h-2.5 w-5 rounded-full bg-foreground/80" />
        </span>
      </div>
      <div
        className={`absolute inset-x-1.5 bottom-1.5 flex h-5 translate-y-2 items-center justify-between rounded-md bg-card pr-1 pl-1.5 opacity-0 shadow-sm transition-[translate,opacity] delay-150 duration-500 ease-snappy group-hover:translate-y-0 group-hover:opacity-100 ${EDGE}`}
      >
        <span className="h-1 w-10 rounded-full bg-muted-foreground/40" />
        <span className="h-3 w-6 rounded-full bg-foreground/80" />
      </div>
    </div>
  );
}

/* Content */

// Both labels share one grid cell, so the button keeps its width while the
// words cross-fade.
function SwapLabel({ rest, hover }: { rest: string; hover: string }) {
  return (
    <span className="grid justify-items-center">
      <span className="[grid-area:1/1] transition-opacity duration-300 group-hover:opacity-0">
        {rest}
      </span>
      <span className="[grid-area:1/1] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {hover}
      </span>
    </span>
  );
}

function MicrocopyThumbnail() {
  // Rest: "Are you sure?" with No / Yes. Hover: the dialog names the thing
  // and the buttons name the action.
  return (
    <div
      className={`flex h-20 w-28 flex-col justify-between rounded-xl bg-card p-2.5 shadow-xs ${EDGE}`}
    >
      <div className="flex flex-col items-start gap-1.5">
        <span className="text-[10px] leading-none font-medium [&>span]:justify-items-start">
          <SwapLabel hover="Delete project?" rest="Are you sure?" />
        </span>
        <span className="h-1 w-16 rounded-full bg-muted-foreground/20" />
      </div>
      <div className="flex justify-end gap-1 text-[9px] leading-none font-medium">
        <span className="rounded-full px-1.5 py-1 text-muted-foreground ring-1 ring-border">
          <SwapLabel hover="Cancel" rest="No" />
        </span>
        <span className="rounded-full bg-foreground px-1.5 py-1 text-background">
          <SwapLabel hover="Delete" rest="Yes" />
        </span>
      </div>
    </div>
  );
}

function RealContentThumbnail() {
  // Rest: a long name runs off the card and takes its count with it.
  // Hover: it truncates and the count lines up with the others again.
  return (
    <div
      className={`relative flex h-20 w-28 flex-col justify-center gap-2.5 overflow-hidden rounded-xl bg-card px-2.5 shadow-xs ${EDGE}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="size-4 shrink-0 rounded-full bg-muted-foreground/25" />
        <span className="max-w-[200px] shrink-0 truncate text-[9px] leading-none font-medium transition-[max-width] duration-700 ease-snappy group-hover:max-w-[46px]">
          Maximiliane Wolfeschlegelsteinhausen
        </span>
        <span className="ml-auto h-1.5 w-4 shrink-0 rounded-full bg-muted-foreground/40" />
      </div>
      {[10, 7].map((width, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="size-4 shrink-0 rounded-full bg-muted-foreground/25" />
          <span
            className="h-1.5 rounded-full bg-muted-foreground/30"
            style={{ width: width * 4 }}
          />
          <span className="ml-auto h-1.5 w-4 shrink-0 rounded-full bg-muted-foreground/40" />
        </div>
      ))}
      <div
        className={`absolute inset-y-2 right-[1.875rem] border-r transition-colors duration-300 ${GUIDE}`}
      />
    </div>
  );
}

/* Motion */

function IconMorphThumbnail() {
  return (
    <span className="relative flex size-12 items-center justify-center rounded-xl bg-card shadow-xs ring-1 ring-border">
      <CopyIcon className="size-5 transition-all duration-500 ease-snappy group-hover:scale-25 group-hover:opacity-0 group-hover:blur-[2px]" />
      <CheckCircleIcon
        weight="fill"
        className="absolute size-5 scale-25 text-emerald-600 opacity-0 blur-[2px] transition-all duration-500 ease-snappy group-hover:scale-100 group-hover:opacity-100 group-hover:blur-none dark:text-emerald-400"
      />
    </span>
  );
}

function ButtonPressThumbnail() {
  return (
    <span className="relative">
      <span className="block rounded-full bg-card px-5 py-2.5 text-sm font-medium shadow-xs ring-1 ring-border group-hover:animate-[thumb-press_600ms_ease-out_150ms]">
        Continue
      </span>
      <Cursor className="absolute top-3/5 left-3/5 translate-x-3 translate-y-3 opacity-0 transition-all duration-300 ease-snappy group-hover:translate-0 group-hover:opacity-100" />
    </span>
  );
}

// The curve is the easing itself: cubic-bezier(0.23, 1, 0.32, 1) drawn from
// (4,60) to (108,4), with the dot riding it.
const EASE_CURVE = "M4 60 C 27.9 4, 37.3 4, 108 4";

function EasingsThumbnail() {
  return (
    <div className="relative h-16 w-28">
      <svg viewBox="0 0 112 64" className="absolute inset-0 h-16 w-28">
        <path
          d="M4 4 L4 60 L108 60"
          fill="none"
          strokeWidth="1"
          strokeDasharray="3 3"
          className="stroke-muted-foreground/30"
        />
        <path
          d={EASE_CURVE}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-muted-foreground/60 transition-colors duration-300 group-hover:stroke-foreground"
        />
      </svg>
      <span
        className="absolute size-2.5 rounded-full bg-foreground ring-4 ring-foreground/10 [offset-distance:0%] transition-[offset-distance] duration-700 ease-linear group-hover:[offset-distance:100%]"
        style={{ offsetPath: `path("${EASE_CURVE}")` }}
      />
    </div>
  );
}

function StaggerThumbnail() {
  // The same lift on every square; only the delay between them differs.
  return (
    <div className="flex h-12 items-center gap-2">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="size-5 rounded-[6px] bg-muted-foreground/25 transition-[translate,background-color] duration-300 ease-snappy group-hover:-translate-y-2.5 group-hover:bg-muted-foreground/60"
          style={{ transitionDelay: `${i * 70}ms` }}
        />
      ))}
    </div>
  );
}

function InterruptibilityThumbnail() {
  // A sheet on a spring: let go halfway and it turns around from there.
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
      <div className="absolute inset-x-1.5 top-14 h-16 rounded-t-xl bg-card shadow-sm ring-1 ring-border transition-transform duration-500 ease-snappy group-hover:-translate-y-10">
        <div className="mx-auto mt-1.5 h-1 w-8 rounded-full bg-muted-foreground/30" />
        <div className="mt-3 ml-3 h-1.5 w-14 rounded-full bg-muted-foreground/30" />
        <div className="mt-2 ml-3 h-1.5 w-10 rounded-full bg-muted-foreground/20" />
      </div>
    </div>
  );
}

function HoverRestraintThumbnail() {
  // The same hover at two speeds: one lands on arrival, the other is still
  // fading in long after the pointer got there.
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-medium">
      <span className="rounded-lg px-3 py-2 ring-1 ring-border transition-colors duration-0 group-hover:bg-muted">
        Instant
      </span>
      <span className="rounded-lg px-3 py-2 ring-1 ring-border transition-colors duration-700 group-hover:bg-muted">
        Slow
      </span>
    </div>
  );
}

function ScaleEntrancesThumbnail() {
  // A menu grows out of the button that opened it: the origin sits on the
  // trigger's corner, and it starts at 95%, not from nothing.
  return (
    <div className="relative h-24 w-28">
      <span
        className={`absolute top-0 left-0 flex h-7 items-center gap-1.5 rounded-lg bg-card px-2.5 shadow-xs ${EDGE}`}
      >
        <span className="h-1.5 w-8 rounded-full bg-muted-foreground/50" />
        <span className="size-1.5 rounded-[2px] bg-muted-foreground/50" />
      </span>
      <div
        className={`absolute top-9 left-0 flex w-20 origin-top-left scale-95 flex-col gap-2 rounded-lg bg-card p-2.5 opacity-0 shadow-md transition-[scale,opacity] duration-300 ease-spring group-hover:scale-100 group-hover:opacity-100 group-hover:duration-500 ${EDGE}`}
      >
        <div className="h-1.5 w-11 rounded-full bg-muted-foreground/40" />
        <div className="h-1.5 w-8 rounded-full bg-muted-foreground/20" />
        <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
      </div>
      <Cursor className="absolute top-2 left-10 translate-x-3 translate-y-3 opacity-0 transition-all duration-300 ease-snappy group-hover:translate-0 group-hover:opacity-100" />
    </div>
  );
}

function SharedLayoutThumbnail() {
  // Block and lines are the same elements in both layouts: the block grows
  // and the lines travel under it, instead of one set swapping for another.
  return (
    <div className="relative h-24 w-28">
      <div className="absolute top-8 left-0 h-8 w-8 rounded-lg bg-muted ring-1 ring-border transition-[width,height,top] duration-500 ease-snappy group-hover:top-2 group-hover:h-14 group-hover:w-28" />
      <div className="absolute top-9 left-10 flex flex-col gap-1.5 transition-transform duration-500 ease-snappy group-hover:-translate-x-10 group-hover:translate-y-9">
        <div className="h-1.5 w-16 rounded-full bg-muted-foreground/40" />
        <div className="h-1.5 w-10 rounded-full bg-muted-foreground/20" />
      </div>
    </div>
  );
}

function ExitAnimationsThumbnail() {
  // The middle row leaves in half the time it would take to arrive, and the
  // rows below close the gap with it.
  return (
    <div className="flex w-28 flex-col">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`mb-1.5 flex h-7 items-center rounded-lg bg-card px-2.5 shadow-xs ring-1 ring-border transition-[height,opacity,margin,scale] duration-300 ease-snappy ${
            i === 1
              ? "group-hover:mb-0 group-hover:h-0 group-hover:scale-[0.98] group-hover:opacity-0 group-hover:duration-200"
              : ""
          }`}
        >
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>
      ))}
    </div>
  );
}

function ReducedMotionThumbnail() {
  // The new row doesn't travel: it fades in right where it lands, inside the
  // dashed slot, still highlighted so you can see what arrived.
  return (
    <div className={`flex w-28 flex-col rounded-xl bg-card p-1 ${EDGE}`}>
      <div className={`h-5 rounded-lg border p-px ${GUIDE}`}>
        <div className="flex h-full items-center gap-1.5 rounded-[7px] bg-muted px-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:delay-150">
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          <span className="h-1.5 w-12 rounded-full bg-muted-foreground/45" />
        </div>
      </div>
      {[10, 14, 8].map((width, i) => (
        <div key={i} className="flex h-5 items-center gap-1.5 px-2">
          <span className="size-2.5 rounded-full bg-muted-foreground/20" />
          <span
            className="h-1.5 rounded-full bg-muted-foreground/25"
            style={{ width: width * 4 }}
          />
        </div>
      ))}
    </div>
  );
}

/* Sound */

// Idle is already a played cue; hover fires a different, less even one.
const SFX_BARS = [
  { idle: 26, hover: 11 },
  { idle: 20, hover: 28 },
  { idle: 15, hover: 8 },
  { idle: 11, hover: 21 },
  { idle: 8, hover: 30 },
  { idle: 6, hover: 9 },
  { idle: 5, hover: 16 },
  { idle: 3, hover: 6 },
];

function InterfaceSfxThumbnail() {
  return (
    <div className="flex h-8 items-center gap-1">
      {SFX_BARS.map(({ idle, hover }, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-muted-foreground/50 transition-[height,background-color] duration-300 ease-snappy h-(--h) group-hover:h-(--hh) group-hover:bg-foreground/70"
          style={
            {
              "--h": `${idle}px`,
              "--hh": `${hover}px`,
              transitionDelay: `${i * 25}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

// Three sources at different pitches: a slow swell, a mid tone and a fast
// tick. Apart they are three sounds; on hover they land on one baseline and
// read as a single, richer cue.
const SOUND_LAYERS = [
  {
    d: "M0 24 Q12 10 24 24 T48 24 T72 24 T96 24",
    rest: "-translate-y-4",
    tone: "stroke-neutral-500 dark:stroke-neutral-400",
  },
  {
    d: "M0 24 Q6 16 12 24 T24 24 T36 24 T48 24 T60 24 T72 24 T84 24 T96 24",
    rest: "translate-y-0",
    tone: "stroke-neutral-400 dark:stroke-neutral-500",
  },
  {
    d: "M0 24 Q3 20 6 24 T12 24 T18 24 T24 24 T30 24 T36 24 T42 24 T48 24 T54 24 T60 24 T66 24 T72 24 T78 24 T84 24 T90 24 T96 24",
    rest: "translate-y-4",
    tone: "stroke-neutral-300 dark:stroke-neutral-600",
  },
];

function LayeringSoundsThumbnail() {
  return (
    <svg viewBox="0 0 96 48" className="h-12 w-24 overflow-visible">
      {SOUND_LAYERS.map(({ d, rest, tone }, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={`${tone} ${rest} transition-transform duration-500 ease-snappy group-hover:translate-y-0`}
          style={{ transitionDelay: `${i * 40}ms` }}
        />
      ))}
    </svg>
  );
}

/* Data */

// New readings for the same series: every bar eases to its next value
// instead of the chart redrawing itself.
const CHART_BARS = [
  { rest: 16, hover: 28 },
  { rest: 30, hover: 20 },
  { rest: 22, hover: 40 },
  { rest: 42, hover: 26 },
  { rest: 26, hover: 34 },
  { rest: 34, hover: 48 },
  { rest: 20, hover: 30 },
];

function LivingChartsThumbnail() {
  return (
    <div className="flex h-14 items-end gap-2">
      {CHART_BARS.map(({ rest, hover }, i) => (
        <div
          key={i}
          className="w-1.5 rounded-t-[2px] bg-muted-foreground/40 transition-[height,background-color] duration-700 ease-snappy h-(--h) group-hover:h-(--hh) group-hover:bg-muted-foreground/60"
          style={
            {
              "--h": `${rest}px`,
              "--hh": `${hover}px`,
              transitionDelay: `${i * 45}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

const CURVE_POINTS: [number, number][] = [
  [0, 32],
  [16, 32],
  [32, 8],
  [48, 30],
  [64, 30],
  [80, 12],
  [96, 20],
];

// Monotone first (never leaves the data), then the cardinal spline that
// invents the dips shaded underneath.
const MONOTONE =
  "M0 32 L16 32 C21.3 32 26.7 8 32 8 C37.3 8 42.7 30 48 30 L64 30 C69.3 30 74.7 12 80 12 C85.3 12 90.7 17.3 96 20";
const OVERSHOOT =
  "M0 32 C5.3 32 10.7 37 16 32 C21.3 27 26.7 8.3 32 8 C37.3 7.7 42.7 26 48 30 C53.3 34 58.7 34 64 30 C69.3 26 74.7 13.7 80 12 C85.3 10.3 90.7 17.3 96 20";

function CurveSmoothingThumbnail() {
  return (
    <svg viewBox="-4 0 104 44" className="h-14 w-32 overflow-visible">
      <path
        d={MONOTONE}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-neutral-300 transition-opacity duration-500 group-hover:opacity-0 dark:text-neutral-600"
      />
      <path
        d={OVERSHOOT}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-neutral-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:text-neutral-500"
      />
      {CURVE_POINTS.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="2.5"
          className="fill-card stroke-neutral-400 dark:stroke-neutral-500"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

/* Craft */

function PerceivedPerformanceThumbnail() {
  // The blur-up: something is on screen immediately, then it sharpens.
  return (
    <div className="h-20 w-28 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
      <div className="relative h-full w-full scale-110 blur-[7px] transition-[filter,scale] duration-500 ease-snappy group-hover:scale-100 group-hover:blur-none">
        <div className="absolute top-3 right-4 size-5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
        <div className="absolute -bottom-5 -left-3 h-12 w-24 rounded-[50%] bg-neutral-300 dark:bg-neutral-700" />
        <div className="absolute -right-5 -bottom-6 h-12 w-20 rounded-[50%] bg-neutral-400 dark:bg-neutral-600" />
      </div>
    </div>
  );
}

const REFERENCE_CARDS = [
  "-translate-x-3 -rotate-8 group-hover:-translate-x-10 group-hover:-rotate-12",
  "rotate-2 group-hover:-translate-y-1 group-hover:rotate-0",
  "translate-x-3 rotate-8 group-hover:translate-x-10 group-hover:rotate-12",
];

function ReferencesThumbnail() {
  // Cards use the shared edge, and the image inside is nested for real:
  // outer radius 8px minus 6px of padding leaves 2px.
  return (
    <div className="relative h-20 w-16">
      {REFERENCE_CARDS.map((classes, i) => (
        <div
          key={i}
          className={`absolute inset-0 flex flex-col gap-1.5 rounded-lg bg-card p-1.5 shadow-sm ring-1 ring-neutral-200 transition-transform duration-500 ease-snappy dark:ring-neutral-800 ${classes}`}
          style={{ transitionDelay: `${i * 30}ms` }}
        >
          <div className="h-10 rounded-[2px] bg-muted" />
          <div className="h-1 w-9 rounded-full bg-muted-foreground/30" />
          <div className="h-1 w-6 rounded-full bg-muted-foreground/20" />
        </div>
      ))}
    </div>
  );
}

function TasteThumbnail() {
  // Each marker is anchored to the flaw it circles: the corner radius, the
  // nudged icon and the uneven gap.
  const flaw =
    "pointer-events-none absolute rounded-full border border-dashed border-sky-500/0 bg-sky-500/0 transition-colors duration-300 group-hover:border-sky-500/60 group-hover:bg-sky-500/5";
  return (
    <div className="flex gap-3">
      <div className="relative flex h-16 w-20 flex-col gap-1.5 rounded-xl bg-card p-2.5 shadow-xs ring-1 ring-border">
        <div className="size-3 rounded-[4px] bg-muted-foreground/40" />
        <div className="h-1.5 w-11 rounded-full bg-muted-foreground/40" />
        <div className="h-1.5 w-8 rounded-full bg-muted-foreground/20" />
      </div>
      <div className="relative flex h-16 w-20 flex-col gap-1.5 rounded-lg bg-card p-2.5 shadow-xs ring-1 ring-border">
        <span className={`${flaw} -top-2 -right-2 size-6`} />
        <div className="relative ml-0.5 size-3 rounded-[4px] bg-muted-foreground/40">
          <span
            className={`${flaw} -inset-1.5`}
            style={{ transitionDelay: "80ms" }}
          />
        </div>
        <div className="h-1.5 w-11 rounded-full bg-muted-foreground/40" />
        <div className="relative mt-0.5 h-1.5 w-8 rounded-full bg-muted-foreground/20">
          <span
            className={`${flaw} -inset-x-1.5 -inset-y-1.5`}
            style={{ transitionDelay: "160ms" }}
          />
        </div>
      </div>
    </div>
  );
}

function TimelessnessThumbnail() {
  // The dated surface burns off and leaves the structure it was painted on.
  return (
    <div className="relative h-20 w-28">
      <div className="absolute inset-0 rounded-xl border border-neutral-300 bg-linear-to-b from-white via-neutral-200 to-neutral-300 p-3 shadow-[inset_0_1px_0_white,0_1px_2px_rgba(0,0,0,0.1)] transition-opacity duration-500 group-hover:opacity-0 dark:border-neutral-900 dark:from-neutral-500 dark:via-neutral-700 dark:to-neutral-800 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.3)]">
        <div className="size-6 rounded-md bg-linear-to-b from-neutral-400 to-neutral-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] dark:from-neutral-600 dark:to-neutral-800 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
        <div className="mt-2.5 h-1.5 w-16 rounded-full bg-neutral-400/80 dark:bg-neutral-500" />
        <div className="mt-1.5 h-1.5 w-10 rounded-full bg-neutral-400/50 dark:bg-neutral-600" />
      </div>
      <div className="absolute inset-0 rounded-xl border border-dashed border-sky-500/50 p-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="size-6 rounded-md border border-dashed border-sky-500/50" />
        <div className="mt-2.5 h-1.5 w-16 rounded-full border border-dashed border-sky-500/50" />
        <div className="mt-1.5 h-1.5 w-10 rounded-full border border-dashed border-sky-500/50" />
      </div>
    </div>
  );
}

function NoveltyBudgetThumbnail() {
  // Ten everyday moments, one worth spending on.
  return (
    <div className="flex h-12 items-end gap-1.5">
      {Array.from({ length: 11 }, (_, i) =>
        i === 7 ? (
          <div
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25 transition-[height,background-color] duration-500 ease-snappy group-hover:h-10 group-hover:bg-sky-500"
          />
        ) : (
          <div
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25"
          />
        )
      )}
    </div>
  );
}

// Rest: three products built from the same defaults. Hover: each picks a
// feel - compact and square, roomy and soft, round and springy.
const FEEL_CARDS = [
  {
    card: "group-hover:rounded-[4px] group-hover:p-1 group-hover:gap-0.5",
    row: "group-hover:h-1.5 group-hover:rounded-[1px]",
    extra: "group-hover:h-1.5 group-hover:opacity-100",
    ease: "ease-snappy",
  },
  {
    card: "group-hover:rounded-[12px] group-hover:p-2 group-hover:gap-2",
    row: "group-hover:h-2 group-hover:rounded-[3px] group-hover:bg-muted-foreground/20",
    extra: "",
    ease: "ease-snappy",
  },
  {
    card: "group-hover:rounded-[16px] group-hover:gap-1.5",
    row: "group-hover:h-3 group-hover:rounded-full",
    extra: "",
    ease: "ease-spring",
  },
];

function ProductFeelThumbnail() {
  return (
    <div className="flex items-center gap-1.5">
      {FEEL_CARDS.map((feel, i) => (
        <div
          key={i}
          className={`flex w-9 flex-col gap-1 rounded-[8px] bg-card p-1.5 shadow-xs ring-1 ring-border transition-all duration-500 ${feel.ease} ${feel.card}`}
          style={{ transitionDelay: `${i * 40}ms` }}
        >
          {[0, 1, 2].map((r) => (
            <div
              key={r}
              className={`h-2 shrink-0 rounded-[3px] bg-muted-foreground/30 transition-all duration-500 ${feel.ease} ${feel.row}`}
              style={{ transitionDelay: `${i * 40}ms` }}
            />
          ))}
          <div
            className={`-mt-1 h-0 shrink-0 rounded-[1px] bg-muted-foreground/30 opacity-0 transition-all duration-500 ${feel.ease} ${feel.extra} group-hover:mt-0`}
            style={{ transitionDelay: `${i * 40}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

function DesignTokensThumbnail() {
  // Rest: three controls, each with its own hand-picked radius and tone.
  // Hover: they all read the same token, marked by the dashed guide.
  const item =
    "transition-[border-radius,background-color] duration-500 ease-snappy group-hover:rounded-[6px] group-hover:bg-muted-foreground/35";
  return (
    <div
      className={`flex flex-col items-start gap-1.5 rounded-xl border p-2 ${GUIDE}`}
    >
      <div className={`h-5 w-20 rounded-[2px] bg-muted-foreground/20 ${item}`} />
      <div className="flex gap-1.5">
        <div className={`h-5 w-10 rounded-[10px] bg-muted-foreground/30 ${item}`} />
        <div
          className={`h-5 w-8 rounded-[4px] bg-muted-foreground/45 ${item}`}
        />
      </div>
    </div>
  );
}

/* Springs, momentum, liquid motion, smooth animation, liquid glass */

function SpringsThumbnail() {
  // The ball overshoots the dashed target, then settles back onto it.
  return (
    <div className="relative h-10 w-28 rounded-full bg-muted ring-1 ring-border">
      <div
        className={`absolute top-1 bottom-1 left-[4.6rem] border-l ${GUIDE}`}
      />
      <span className="absolute top-1 left-1 size-8 rounded-full bg-foreground transition-transform duration-700 ease-spring group-hover:translate-x-[3.6rem]" />
    </div>
  );
}

function MomentumThumbnail() {
  // A flicked window coasts to the far corner the throw was aimed at.
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
      <span
        className={`absolute top-1.5 right-1.5 h-6 w-9 rounded-md border ${GUIDE}`}
      />
      <span className="absolute bottom-1.5 left-1.5 h-6 w-9 rounded-md bg-foreground shadow-sm transition-transform duration-700 ease-snappy group-hover:translate-x-[3.75rem] group-hover:-translate-y-[2.5rem]" />
    </div>
  );
}

function LiquidMotionThumbnail() {
  // The button itself grows into the menu, from the corner it sat in.
  return (
    <div className="relative h-20 w-28">
      <div className="absolute bottom-0 left-0 h-7 w-16 overflow-hidden rounded-[14px] bg-card shadow-sm ring-1 ring-border transition-[width,height,border-radius] duration-500 ease-spring group-hover:h-20 group-hover:w-28 group-hover:rounded-[12px]">
        <div className="mt-2.5 ml-3 h-1.5 w-8 rounded-full bg-muted-foreground/40" />
        <div className="mt-3 ml-3 h-1.5 w-14 rounded-full bg-muted-foreground/20 opacity-0 transition-opacity delay-150 duration-300 group-hover:opacity-100" />
        <div className="mt-2 ml-3 h-1.5 w-10 rounded-full bg-muted-foreground/20 opacity-0 transition-opacity delay-150 duration-300 group-hover:opacity-100" />
      </div>
    </div>
  );
}

function SmoothAnimationThumbnail() {
  // Layers already painted: the top one only moves, nothing redraws.
  return (
    <div className="relative h-20 w-28">
      <div className="absolute top-6 left-6 h-12 w-16 rounded-lg bg-muted ring-1 ring-border" />
      <div className="absolute top-3 left-3 h-12 w-16 rounded-lg bg-muted ring-1 ring-border" />
      <div className="absolute top-0 left-0 h-12 w-16 rounded-lg bg-card shadow-sm ring-1 ring-border transition-transform duration-500 ease-snappy group-hover:translate-x-10">
        <div className="mt-2.5 ml-2.5 h-1.5 w-8 rounded-full bg-muted-foreground/40" />
        <div className="mt-2 ml-2.5 h-1.5 w-10 rounded-full bg-muted-foreground/20" />
      </div>
    </div>
  );
}

function LiquidGlassThumbnail() {
  // A glass pill slides over stripes, blurring them as it passes.
  return (
    <div
      className="relative h-20 w-28 overflow-hidden rounded-xl ring-1 ring-border"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, var(--muted-foreground) 0 2px, transparent 2px 9px)",
        backgroundColor: "var(--muted)",
      }}
    >
      <div className="absolute top-6 left-2 h-8 w-14 rounded-full bg-white/15 shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_0_0_0.5px_rgb(0_0_0/0.14),0_6px_16px_rgb(0_0_0/0.14)] backdrop-blur-[3px] transition-transform duration-700 ease-snappy group-hover:translate-x-10" />
    </div>
  );
}

/* Performance */

function ResponsivenessThumbnail() {
  // The button answers the moment it's touched: "Save" becomes "Saving".
  return (
    <div className="relative grid h-9 w-24 place-items-center rounded-full bg-card text-[11px] font-medium shadow-sm ring-1 ring-border transition-transform duration-100 ease-out group-hover:scale-[0.97]">
      <span className="transition-opacity duration-0 group-hover:opacity-0">Save</span>
      <span className="absolute flex items-center gap-1.5 text-muted-foreground opacity-0 transition-opacity duration-0 group-hover:opacity-100">
        <span className="size-2.5 rounded-full border-[1.5px] border-current border-t-transparent group-hover:animate-spin" />
        Saving
      </span>
    </div>
  );
}

function InstantNavigationThumbnail() {
  // Hovering the link is enough: the next page is already filling in.
  return (
    <div className="flex h-20 w-28 overflow-hidden rounded-xl bg-card ring-1 ring-border">
      <div className="flex w-9 flex-col gap-1.5 border-r border-border p-1.5">
        <div className="h-1.5 w-full rounded-full bg-muted-foreground/25" />
        <div className={`h-1.5 w-full rounded-full border bg-muted-foreground/40 ${GUIDE}`} />
        <div className="h-1.5 w-full rounded-full bg-muted-foreground/25" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        <div className="h-1.5 w-10 rounded-full bg-muted-foreground/40 opacity-0 transition-opacity delay-75 duration-300 group-hover:opacity-100" />
        <div className="h-1.5 w-14 rounded-full bg-muted-foreground/20 opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100" />
        <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20 opacity-0 transition-opacity delay-150 duration-300 group-hover:opacity-100" />
      </div>
    </div>
  );
}

function ImageLoadingThumbnail() {
  // The box was there all along, tinted with the photo's colour; the photo fades in.
  return (
    <div className="flex w-24 flex-col gap-1.5 rounded-xl bg-card p-1.5 ring-1 ring-border">
      <div className="relative h-12 overflow-hidden rounded-md bg-[oklch(0.72_0.04_200)]">
        <div className="absolute inset-0 bg-linear-to-b from-[oklch(0.8_0.07_230)] via-[oklch(0.75_0.06_190)] to-[oklch(0.6_0.08_140)] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
      </div>
      <div className="h-1.5 w-14 rounded-full bg-muted-foreground/30" />
      <div className="h-1.5 w-10 rounded-full bg-muted-foreground/20" />
    </div>
  );
}

function LongListsThumbnail() {
  // Only the rows inside the window exist; the rest fade back to space.
  return (
    <div className="relative flex h-20 w-24 flex-col justify-center gap-1">
      {Array.from({ length: 9 }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full bg-muted-foreground/30 transition-opacity duration-500 ${
            i >= 3 && i <= 5 ? "w-20" : "w-16 group-hover:opacity-0"
          }`}
        />
      ))}
      <div className={`absolute inset-x-[-6px] top-[1.85rem] h-[1.6rem] rounded-md border ${GUIDE}`} />
    </div>
  );
}

function MeasuringPerformanceThumbnail() {
  // A timeline: the early "load" tick is grey, the real "ready" tick lights up.
  return (
    <div className="flex w-28 flex-col gap-2">
      <div className="relative h-1.5 rounded-full bg-muted-foreground/20">
        <div className="absolute inset-y-0 left-0 w-0 rounded-full bg-muted-foreground/50 transition-[width] duration-1000 ease-linear group-hover:w-full" />
        <span className="absolute -top-1 left-[18%] h-3.5 w-0.5 rounded-full bg-muted-foreground/60" />
        <span className={`absolute -top-1.5 left-[80%] h-4.5 w-1 rounded-full border bg-muted-foreground/30 transition-colors delay-700 duration-300 group-hover:bg-emerald-500 ${GUIDE}`} />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>load</span>
        <span>ready</span>
      </div>
    </div>
  );
}

function EffectCostThumbnail() {
  // Many hidden blurred chips on a grid; on hover all but one turn into scrims.
  return (
    <div className="grid w-24 grid-cols-4 gap-1">
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className={`aspect-[2/3] rounded-sm ring-1 ring-border transition-colors duration-300 ${
            i === 0
              ? "bg-muted-foreground/40"
              : "bg-muted-foreground/25 group-hover:bg-muted-foreground/10"
          }`}
        />
      ))}
    </div>
  );
}

function JavascriptCostThumbnail() {
  // A tall stack of script blocks shrinks to the one the first screen needs.
  return (
    <div className="flex h-16 w-24 items-end gap-1">
      {[64, 48, 56, 40, 52].map((h, i) => (
        <div
          key={i}
          className={`h-(--h) w-full rounded-sm bg-muted-foreground/30 ring-1 ring-border transition-[height,opacity] duration-500 ease-snappy ${
            i === 0 ? "group-hover:h-3" : "group-hover:h-1 group-hover:opacity-30"
          }`}
          style={{ "--h": `${h}px` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function FontLoadingThumbnail() {
  // The same word in the fallback and the brand font: the box doesn't move.
  return (
    <div className={`relative rounded-md border px-3 py-1.5 ${GUIDE}`}>
      <span className="block text-2xl font-medium opacity-100 transition-opacity duration-300 [font-family:Arial,sans-serif] group-hover:opacity-0">
        Aa Text
      </span>
      <span className="absolute inset-0 grid place-items-center text-2xl font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        Aa Text
      </span>
    </div>
  );
}

function VideoAndEmbedsThumbnail() {
  // A light poster with a play button; the player only arrives on hover.
  return (
    <div className="relative grid h-16 w-28 place-items-center overflow-hidden rounded-lg bg-linear-to-br from-muted-foreground/20 to-muted-foreground/40 ring-1 ring-border">
      <span className="grid size-7 place-items-center rounded-full bg-foreground/70 transition-transform duration-200 ease-out group-hover:scale-110">
        <span className="ml-0.5 size-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-background" />
      </span>
      <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-foreground/60 transition-transform duration-1000 ease-linear group-hover:scale-x-100" />
    </div>
  );
}

const thumbnails: Record<string, () => React.ReactNode> = {
  "letter-spacing": LetterSpacingThumbnail,
  "text-wrapping": TextWrappingThumbnail,
  oklch: OklchThumbnail,
  "nested-border-radius": NestedRadiusThumbnail,
  squircles: SquirclesThumbnail,
  "icon-morph": IconMorphThumbnail,
  "interface-sfx": InterfaceSfxThumbnail,
  "tabular-numbers": TabularNumsThumbnail,
  "optical-alignment": OpticalAlignmentThumbnail,
  icons: IconsThumbnail,
  noise: NoiseThumbnail,
  "shadows-not-borders": ShadowsNotBordersThumbnail,
  "image-outlines": ImageOutlinesThumbnail,
  "color-roles": ColorRolesThumbnail,
  "dark-mode": DarkModeThumbnail,
  "hit-areas": HitAreasThumbnail,
  "html-background": HtmlBackgroundThumbnail,
  "button-press": ButtonPressThumbnail,
  easings: EasingsThumbnail,
  stagger: StaggerThumbnail,
  interruptibility: InterruptibilityThumbnail,
  "hover-restraint": HoverRestraintThumbnail,
  "layering-sounds": LayeringSoundsThumbnail,
  "living-charts": LivingChartsThumbnail,
  "performance-is-design": PerceivedPerformanceThumbnail,
  "how-to-get-references": ReferencesThumbnail,
  "novelty-budget": NoveltyBudgetThumbnail,
  "shared-layout": SharedLayoutThumbnail,
  "exit-animations": ExitAnimationsThumbnail,
  "scale-entrances": ScaleEntrancesThumbnail,
  "clip-path": ClipPathThumbnail,
  "scroll-fades": ScrollFadesThumbnail,
  whitespace: WhitespaceThumbnail,
  "spacing-scale": SpacingScaleThumbnail,
  alignment: AlignmentThumbnail,
  density: DensityThumbnail,
  "layout-shift": LayoutShiftThumbnail,
  responsive: ResponsiveThumbnail,
  "interaction-states": InteractionStatesThumbnail,
  "focus-rings": FocusRingsThumbnail,
  "input-details": InputDetailsThumbnail,
  "empty-states": EmptyStatesThumbnail,
  "command-menu": CommandMenuThumbnail,
  overlays: OverlaysThumbnail,
  toasts: ToastsThumbnail,
  "destructive-actions": DestructiveActionsThumbnail,
  microcopy: MicrocopyThumbnail,
  "real-content": RealContentThumbnail,
  "reduced-motion": ReducedMotionThumbnail,
  "font-smoothing": FontSmoothingThumbnail,
  "visual-hierarchy": VisualHierarchyThumbnail,
  "line-length": LineLengthThumbnail,
  "type-scale": TypeScaleThumbnail,
  "curve-smoothing": CurveSmoothingThumbnail,
  "taste-is-trained": TasteThumbnail,
  timelessness: TimelessnessThumbnail,
  "product-feel": ProductFeelThumbnail,
  "design-tokens": DesignTokensThumbnail,
  springs: SpringsThumbnail,
  momentum: MomentumThumbnail,
  "liquid-motion": LiquidMotionThumbnail,
  "smooth-animation": SmoothAnimationThumbnail,
  "liquid-glass": LiquidGlassThumbnail,
  responsiveness: ResponsivenessThumbnail,
  "instant-navigation": InstantNavigationThumbnail,
  "image-loading": ImageLoadingThumbnail,
  "long-lists": LongListsThumbnail,
  "measuring-performance": MeasuringPerformanceThumbnail,
  "effect-cost": EffectCostThumbnail,
  "javascript-cost": JavascriptCostThumbnail,
  "font-loading": FontLoadingThumbnail,
  "video-and-embeds": VideoAndEmbedsThumbnail,
};

export function ConceptThumbnail({
  slug,
  section,
}: {
  slug: string;
  section: Section;
}) {
  const Thumbnail = thumbnails[slug];
  if (Thumbnail) return <Thumbnail />;
  // Fallback for concepts without a bespoke thumbnail yet.
  return <SectionIcon section={section} className="size-8 opacity-40" />;
}
