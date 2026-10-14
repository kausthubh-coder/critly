"use client";

import { useReducedMotion } from "motion/react";
import { Big_Shoulders, DotGothic16, Zilla_Slab } from "next/font/google";
import { useState } from "react";

import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

// Three faces, one per route, each with only the weight it uses. The
// "Default" route uses the site's own sans on purpose: it is the average.
const dotMatrix = DotGothic16({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
const condensed = Big_Shoulders({
  subsets: ["latin"],
  weight: "800",
  display: "swap",
  adjustFontFallback: false,
});
const slab = Zilla_Slab({
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

/* ------------------------------------------------------------------ */
/* One brief, three routes                                             */
/* ------------------------------------------------------------------ */

const NOUNS = [
  "destination blind",
  "stop flag",
  "24-hour timetable",
  "sodium lamp",
  "hi-vis vest",
  "last bus",
  "route N29",
  "shift change",
] as const;

type RouteId = "default" | "noun" | "constraint" | "elsewhere";

type Trace = { label: string; value: string; from: string };

type Route = {
  label: string;
  source: string;
  sentence: string;
  common: "Common" | "Unusual" | "Rare";
  traces: Trace[];
};

const DEFAULT_SOURCE = "category default";

const ROUTES: Record<RouteId, Route> = {
  default: {
    label: "None",
    source: "No direction",
    sentence: "Whatever transit apps usually look like.",
    common: "Common",
    traces: [
      { label: "Type", value: "The framework's sans", from: DEFAULT_SOURCE },
      {
        label: "Palette",
        value: "White, slate text, a blue-violet button",
        from: DEFAULT_SOURCE,
      },
      { label: "Shape", value: "12px corners on every card", from: DEFAULT_SOURCE },
      { label: "Signature", value: "None", from: DEFAULT_SOURCE },
      {
        label: "Headline",
        value: "Get where you're going, faster.",
        from: "any transit app",
      },
    ],
  },
  noun: {
    label: "Noun",
    source: "The subject's nouns",
    sentence:
      "The bus's own destination blind: lit dots on black, the number first, then where it goes.",
    common: "Unusual",
    traces: [
      {
        label: "Type",
        value: "A dot-matrix face for numbers and headings",
        from: "destination blind",
      },
      {
        label: "Palette",
        value: "Black ground, amber ink",
        from: "sodium lamp",
      },
      {
        label: "Shape",
        value: "Near-square corners, times set in columns",
        from: "24-hour timetable",
      },
      {
        label: "Signature",
        value: "Route and destination in a lit strip",
        from: "destination blind",
      },
      {
        label: "Headline",
        value: "N29 Harbour Rd. Every 12 minutes until 05:00.",
        from: "route N29",
      },
    ],
  },
  constraint: {
    label: "Constraint",
    source: "A constraint",
    sentence:
      "One typeface and two colors, the safety vest's yellow and black, and nothing else.",
    common: "Rare",
    traces: [
      {
        label: "Type",
        value: "One heavy condensed face for everything",
        from: "stop flag",
      },
      {
        label: "Palette",
        value: "Fluorescent yellow and black, no third color",
        from: "hi-vis vest",
      },
      {
        label: "Shape",
        value: "Square corners, thick black bands",
        from: "hi-vis vest",
      },
      {
        label: "Signature",
        value: "The minutes left, set huge",
        from: "last bus",
      },
      {
        label: "Headline",
        value: "Last bus 01:12. You'll make it.",
        from: "shift change",
      },
    ],
  },
  elsewhere: {
    label: "Elsewhere",
    source: "A world outside software",
    sentence:
      "Read like the late-night shipping forecast: calm, the same order every time, each stop in one sentence.",
    common: "Rare",
    traces: [
      {
        label: "Type",
        value: "A sturdy slab that holds up small and dim",
        from: "the printed bulletin",
      },
      {
        label: "Palette",
        value: "Pale dial blue, navy ink",
        from: "a radio's lit dial",
      },
      {
        label: "Shape",
        value: "No boxes, thin ruled lines, round button",
        from: "the bulletin's ruled page",
      },
      {
        label: "Signature",
        value: "Arrivals read as one sentence, in order",
        from: "the forecast's fixed order",
      },
      {
        label: "Headline",
        value: "Harbour Road. N29 in four, then twelve.",
        from: "how the forecast is read",
      },
    ],
  },
};

const ROUTE_IDS = Object.keys(ROUTES) as RouteId[];

const ROUTE_OPTIONS = ROUTE_IDS.map((id) => ({
  value: id,
  label: ROUTES[id].label,
}));

/* ------------------------------------------------------------------ */
/* The screen, built four ways                                         */
/* ------------------------------------------------------------------ */

const SCREEN_W = 280;
const SCREEN_H = 340;

/** The product name, or a plain bar where it was when the name is covered. */
function Name({
  covered,
  children,
  className,
  style,
  bar,
}: {
  covered: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  bar: string;
}) {
  if (covered) {
    return (
      <span
        className="block h-3.5 w-20 rounded-[2px]"
        style={{ backgroundColor: bar }}
      />
    );
  }
  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
}

function Screen({ route, covered }: { route: RouteId; covered: boolean }) {
  if (route === "noun") {
    return (
      <div
        className="flex h-full flex-col gap-4 p-5 text-[12px]"
        style={{ backgroundColor: "#0B0B0A", color: "#C9C2B0" }}
      >
        <div className="flex items-center justify-between">
          <Name
            bar="#FFB000"
            className={cn(dotMatrix.className, "text-[15px] tracking-[0.08em]")}
            covered={covered}
            style={{ color: "#FFB000" }}
          >
            NIGHTJAR
          </Name>
          <span>Routes</span>
        </div>
        <p
          className={cn(dotMatrix.className, "text-[21px] leading-[1.25]")}
          style={{ color: "#FFB000" }}
        >
          N29 Harbour Rd. Every 12 minutes until 05:00.
        </p>
        <div
          className="flex flex-col gap-2 rounded-[2px] px-3 py-2.5"
          style={{
            backgroundColor: "#171204",
            boxShadow: "inset 0 0 0 1px #3A2C08",
          }}
        >
          <span
            className={cn(dotMatrix.className, "text-[22px] leading-none")}
            style={{ color: "#FFB000" }}
          >
            N29 HARBOUR RD
          </span>
          <span
            className={cn(dotMatrix.className, "grid grid-cols-3 text-[13px]")}
            style={{ color: "#B08A3A" }}
          >
            <span>01:04</span>
            <span>01:16</span>
            <span>01:28</span>
          </span>
        </div>
        <span
          className="mt-auto grid h-10 place-items-center rounded-[2px] text-[13px] font-semibold"
          style={{ backgroundColor: "#FFB000", color: "#0B0B0A" }}
        >
          Remind me at 00:50
        </span>
      </div>
    );
  }

  if (route === "constraint") {
    return (
      <div
        className={cn(condensed.className, "flex h-full flex-col uppercase")}
        style={{ backgroundColor: "#E4FF1A", color: "#0A0A0A" }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 text-[17px]">
          <Name bar="#0A0A0A" covered={covered}>
            Nightjar
          </Name>
          <span className="text-[15px]">Routes</span>
        </div>
        <span aria-hidden="true" className="h-2 bg-[#0A0A0A]" />
        <div className="flex flex-1 flex-col gap-2 px-5 pt-4 pb-5">
          <p className="text-[30px] leading-[0.95]">
            Last bus 01:12. You&apos;ll make it.
          </p>
          <div className="flex items-end gap-2">
            <span className="text-[96px] leading-[0.8]">4</span>
            <span className="pb-0.5 text-[28px] leading-none">min</span>
          </div>
          <span className="text-[15px]">N29 · Harbour Rd</span>
          <span className="mt-auto grid h-11 place-items-center bg-[#0A0A0A] text-[17px] text-[#E4FF1A]">
            Remind me at 00:50
          </span>
        </div>
      </div>
    );
  }

  if (route === "elsewhere") {
    return (
      <div
        className={cn(slab.className, "flex h-full flex-col gap-4 p-5 text-[13px]")}
        style={{ backgroundColor: "#DCE6F0", color: "#10243E" }}
      >
        <div className="flex items-center justify-between">
          <Name bar="#10243E" className="text-[18px] font-bold" covered={covered}>
            Nightjar
          </Name>
          <span style={{ color: "#3D5470" }}>Routes</span>
        </div>
        <p className="text-[22px] leading-[1.2] font-medium">
          Harbour Road. N29 in four, then twelve.
        </p>
        <div className="flex flex-col">
          {[
            ["Quay Street.", "N29 in nine. N14, twenty."],
            ["Mill Lane.", "N29 in fifteen. Last, one twelve."],
          ].map(([stop, line]) => (
            <span
              key={stop}
              className="border-t py-2 leading-snug"
              style={{ borderColor: "rgb(16 36 62 / 0.25)" }}
            >
              <span className="font-bold">{stop}</span> {line}
            </span>
          ))}
        </div>
        <span
          className="mt-auto grid h-10 place-items-center rounded-full text-[14px] font-medium"
          style={{ backgroundColor: "#10243E", color: "#DCE6F0" }}
        >
          Remind me at ten to one
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col gap-4 p-5 font-sans text-[12px]"
      style={{ backgroundColor: "#FFFFFF", color: "#0F172A" }}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-4 rounded-full"
            style={{ backgroundColor: "#4F46E5" }}
          />
          <Name bar="#0F172A" className="text-[14px] font-semibold" covered={covered}>
            Nightjar
          </Name>
        </span>
        <span style={{ color: "#64748B" }}>Routes</span>
      </div>
      <p className="text-[22px] leading-[1.2] font-semibold tracking-[-0.02em]">
        Get where you&apos;re going, faster.
      </p>
      <div
        className="flex flex-col gap-2 rounded-[12px] p-3"
        style={{ boxShadow: "inset 0 0 0 1px #E2E8F0" }}
      >
        <span style={{ color: "#64748B" }}>Harbour Rd</span>
        <span className="flex items-center justify-between">
          <span
            className="rounded-[6px] px-1.5 py-0.5 font-semibold"
            style={{ backgroundColor: "#EEF2FF", color: "#4338CA" }}
          >
            N29
          </span>
          <span className="text-[18px] font-semibold">4 min</span>
        </span>
      </div>
      <span
        className="mt-auto grid h-10 place-items-center rounded-[12px] text-[13px] font-medium"
        style={{ backgroundColor: "#4F46E5", color: "#FFFFFF" }}
      >
        Plan a trip
      </span>
    </div>
  );
}

/** A screen drawn at full size and scaled down, with a box the scaled size. */
function ScaledScreen({
  route,
  scale,
  covered,
}: {
  route: RouteId;
  scale: number;
  covered: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-lg ring-1 ring-black/10 dark:ring-white/10"
      style={{ width: SCREEN_W * scale, height: SCREEN_H * scale }}
    >
      <div
        className="absolute top-0 left-0"
        style={{
          width: SCREEN_W,
          height: SCREEN_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <Screen covered={covered} route={route} />
      </div>
    </div>
  );
}

function Common({ value }: { value: Route["common"] }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
      {value} for transit apps
    </span>
  );
}

export function DirectionFirstDemo() {
  const [route, setRoute] = useState<RouteId>("default");
  const [thumbs, setThumbs] = useState(false);
  const reduceMotion = useReducedMotion();
  const current = ROUTES[route];
  const used = new Set(current.traces.map((trace) => trace.from));

  return (
    <Demo className="items-stretch gap-6 px-3 sm:px-6">
      <div className="flex flex-col gap-2.5">
        <p className="max-w-[56ch] text-[13px] leading-snug text-foreground">
          <span className="text-muted-foreground">Brief.</span>{" "}Nightjar: live
          arrivals for a city&apos;s night buses. The only transit app built
          around the last bus home, for people whose shift ends after midnight.
        </p>
        <ul aria-label="Nouns from the subject" className="flex flex-wrap gap-1.5">
          {NOUNS.map((noun) => {
            const active = !thumbs && used.has(noun);
            return (
              <li
                key={noun}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px]",
                  !reduceMotion && "transition-colors duration-200",
                  active
                    ? "bg-sky-500/15 font-medium text-sky-800 dark:text-sky-200"
                    : "bg-muted text-foreground/75"
                )}
              >
                {noun}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <SegmentedControl
          ariaLabel="Where the direction comes from"
          onChange={(value) => {
            setRoute(value);
            setThumbs(false);
          }}
          options={ROUTE_OPTIONS}
          value={route}
        />
        <button
          aria-pressed={thumbs}
          className={cn(
            "inline-flex h-8 cursor-pointer items-center rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 max-sm:h-11",
            thumbs
              ? "bg-primary/5 text-foreground dark:bg-muted"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setThumbs((value) => !value)}
          type="button"
        >
          Thumbnail test
        </button>
      </div>
      {thumbs ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-4">
            {ROUTE_IDS.map((id) => (
              <div key={id} className="flex flex-col items-center gap-1.5">
                <ScaledScreen covered route={id} scale={0.42} />
                <span className="text-[11px] text-muted-foreground">
                  {ROUTES[id].label}
                </span>
              </div>
            ))}
          </div>
          <p className="max-w-[56ch] text-[13px] leading-snug text-foreground">
            Names covered, shrunk to a thumbnail. Which ones still say night
            bus, and which could be any transit app?
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <ScaledScreen covered={false} route={route} scale={1} />
          <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col items-start gap-1.5">
              <span className="text-[11px] text-muted-foreground">
                Source: {current.source}
              </span>
              <span className="text-[13px] leading-snug text-foreground">
                {current.sentence}
              </span>
              <Common value={current.common} />
            </div>
            <dl className="flex flex-col">
              {current.traces.map((trace) => (
                <div
                  key={trace.label}
                  className="flex flex-col gap-0.5 border-t border-border py-2"
                >
                  <dt className="text-[11px] text-muted-foreground">
                    {trace.label}
                  </dt>
                  <dd className="text-[13px] leading-snug text-foreground">
                    {trace.value}
                  </dd>
                  <dd
                    className={cn(
                      "text-[11px]",
                      trace.from === DEFAULT_SOURCE ||
                        trace.from === "any transit app"
                        ? "text-muted-foreground"
                        : "font-medium text-sky-700 dark:text-sky-300"
                    )}
                  >
                    from: {trace.from}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

    </Demo>
  );
}
