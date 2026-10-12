"use client";

import { useId, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Phone, PHONE_INSETS } from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

// The drawn phone is about 0.63 of a real 393pt iPhone, so 1pt = 0.63px here.
const PT = 0.63;

// iOS Dynamic Type sizes from the HIG typography tables: point size and
// leading for Large Title, Body and Footnote at each of the 12 settings.
const SIZES = [
  { short: "xS", name: "Extra Small", title: [31, 38], body: [14, 19], foot: [12, 16] },
  { short: "S", name: "Small", title: [32, 39], body: [15, 20], foot: [12, 16] },
  { short: "M", name: "Medium", title: [33, 40], body: [16, 21], foot: [12, 16] },
  { short: "L", name: "Large (default)", title: [34, 41], body: [17, 22], foot: [13, 18] },
  { short: "xL", name: "Extra Large", title: [36, 43], body: [19, 24], foot: [15, 20] },
  { short: "xxL", name: "XX Large", title: [38, 46], body: [21, 26], foot: [17, 22] },
  { short: "xxxL", name: "XXX Large", title: [40, 48], body: [23, 29], foot: [19, 24] },
  { short: "AX1", name: "AX1", title: [44, 52], body: [28, 34], foot: [23, 29] },
  { short: "AX2", name: "AX2", title: [48, 57], body: [33, 40], foot: [27, 33] },
  { short: "AX3", name: "AX3", title: [52, 61], body: [40, 48], foot: [33, 40] },
  { short: "AX4", name: "AX4", title: [56, 66], body: [47, 56], foot: [38, 46] },
  { short: "AX5", name: "AX5", title: [60, 70], body: [53, 62], foot: [44, 52] },
] as const;

const FIRST_AX = 7;

function font([size, leading]: readonly [number, number]) {
  return { fontSize: size * PT, lineHeight: `${leading * PT}px` };
}

/* ------------------------------------------------------------------ */
/* TextSizeDemo                                                        */
/* ------------------------------------------------------------------ */

type Layout = "fixed" | "fluid";

const LAYOUT_OPTIONS = [
  { value: "fixed", label: "Fixed rows", icon: WRONG_ICON },
  { value: "fluid", label: "Rows grow", icon: RIGHT_ICON },
] as const;

const ROWS = [
  { label: "Name", value: "Alex Morgan" },
  { label: "Email", value: "alex.morgan@icloud.com" },
  { label: "Phone", value: "+1 (555) 010-0199" },
  { label: "Plan", value: "Family, 2 TB" },
];

// 44pt rows, the iOS default list row height.
const ROW_H = 44 * PT;

export function TextSizeDemo() {
  const [layout, setLayout] = useState<Layout>("fixed");
  const [index, setIndex] = useState(3);
  const sliderId = useId();
  const size = SIZES[index];
  const fluid = layout === "fluid";
  const stacked = fluid && index >= FIRST_AX;

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone height={400} label="Account settings on iPhone" platform="ios">
        <div
          className={cn(
            "h-full px-3 pb-8",
            fluid ? "touch-pan-y overflow-y-auto overscroll-contain" : "overflow-hidden"
          )}
          style={{ paddingTop: PHONE_INSETS.ios.top + 8 }}
        >
          <div
            className={cn("font-bold tracking-tight", fluid ? "" : "overflow-hidden whitespace-nowrap")}
            style={{ ...font(size.title), height: fluid ? undefined : 41 * PT }}
          >
            Account
          </div>

          <div className="mt-3 overflow-hidden rounded-[10px] bg-card shadow-(--custom-shadow) dark:bg-muted/50">
            {ROWS.map((row, i) => (
              <div
                key={row.label}
                className={cn(
                  "relative mx-2.5",
                  i > 0 && "border-t border-border",
                  fluid
                    ? cn(
                        "flex py-[7px]",
                        stacked ? "flex-col items-start gap-0.5" : "items-baseline justify-between gap-3"
                      )
                    : "overflow-hidden"
                )}
                style={{
                  ...font(size.body),
                  minHeight: fluid ? ROW_H : undefined,
                  height: fluid ? undefined : ROW_H,
                }}
              >
                {fluid ? (
                  <>
                    <span className="shrink-0">{row.label}</span>
                    <span
                      className={cn(
                        "min-w-0 text-muted-foreground [overflow-wrap:anywhere]",
                        stacked ? "text-left" : "text-right"
                      )}
                    >
                      {row.value}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="absolute left-0 whitespace-nowrap" style={{ top: (ROW_H - size.body[1] * PT) / 2 }}>
                      {row.label}
                    </span>
                    <span
                      className="absolute right-0 max-w-[78%] truncate text-right text-muted-foreground"
                      style={{ top: (ROW_H - size.body[1] * PT) / 2 }}
                    >
                      {row.value}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>

          <p
            className={cn("mt-2 px-2.5 text-muted-foreground", fluid ? "" : "overflow-hidden whitespace-nowrap")}
            style={{ ...font(size.foot), height: fluid ? undefined : 18 * PT }}
          >
            Your plan renews on November 3.
          </p>
        </div>
      </Phone>

      <div className="flex w-[264px] max-w-full flex-col gap-2">
        <label className="flex justify-between text-xs" htmlFor={sliderId}>
          <span className="font-medium">Text size: {size.name}</span>
          <span className="tabular-nums text-muted-foreground">Body {size.body[0]} pt</span>
        </label>
        <input
          aria-valuetext={`${size.name}, body text ${size.body[0]} points`}
          className="h-11 w-full cursor-pointer accent-foreground sm:h-6"
          id={sliderId}
          max={SIZES.length - 1}
          min={0}
          onChange={(event) => setIndex(Number(event.target.value))}
          step={1}
          type="range"
          value={index}
        />
        <div aria-hidden="true" className="flex text-[10px] text-muted-foreground">
          <span className="border-r border-border pr-1" style={{ width: `${(FIRST_AX - 0.5) / 11 * 100}%` }}>
            Standard
          </span>
          <span className="pl-1.5">Accessibility</span>
        </div>
      </div>

      <SegmentedControl
        ariaLabel="Row layout"
        onChange={setLayout}
        options={LAYOUT_OPTIONS}
        value={layout}
      />
      <p className="max-w-sm text-center text-xs text-muted-foreground">
        Drag the text size up to AX5 in each layout. Scroll the screen once it
        overflows.
      </p>
    </Demo>
  );
}

/* ------------------------------------------------------------------ */
/* TextReflowDemo                                                      */
/* ------------------------------------------------------------------ */

type Scaling = "default" | "linear" | "ramp";

const SCALING_OPTIONS = [
  { value: "default", label: "Large" },
  { value: "linear", label: "AX5 ×3.57", icon: WRONG_ICON },
  { value: "ramp", label: "AX5 ramp", icon: RIGHT_ICON },
] as const;

// React Native multiplies every size by one factor (3.571 at AX5) unless a
// Text sets dynamicTypeRamp, which follows Apple's curve for that style.
const SCALED: Record<Scaling, { title: number; body: number; caption: number }> = {
  default: { title: 34, body: 17, caption: 12 },
  linear: { title: 34 * 3.571, body: 17 * 3.571, caption: 12 * 3.571 },
  ramp: { title: 60, body: 53, caption: 43 },
};

export function TextReflowDemo() {
  const [scaling, setScaling] = useState<Scaling>("linear");
  const s = SCALED[scaling];

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone height={440} label="Article screen in a React Native app" platform="ios">
        <div
          className="h-full touch-pan-y overflow-y-auto overscroll-contain px-4 pb-8 [overflow-wrap:anywhere]"
          style={{ paddingTop: PHONE_INSETS.ios.top + 8 }}
        >
          <p className="text-muted-foreground" style={{ fontSize: s.caption * PT, lineHeight: 1.25 }}>
            Travel · 4 min read
          </p>
          <h3
            className="mt-1 font-bold tracking-tight"
            style={{ fontSize: s.title * PT, lineHeight: 1.15 }}
          >
            Weekend in Lisbon
          </h3>
          <p className="mt-2" style={{ fontSize: s.body * PT, lineHeight: 1.3 }}>
            Three days of tiled streets, custard tarts and the 28 tram up the
            hill.
          </p>
        </div>
      </Phone>

      <p className="flex h-4 items-center gap-3 text-[11px] tabular-nums text-muted-foreground">
        <span>Title {Math.round(s.title)} pt</span>
        <span>Body {Math.round(s.body)} pt</span>
        <span>Caption {Math.round(s.caption)} pt</span>
      </p>

      <SegmentedControl
        ariaLabel="How text scales"
        onChange={setScaling}
        options={SCALING_OPTIONS}
        value={scaling}
      />
      <p className="max-w-sm text-center text-xs text-muted-foreground">
        At AX5, compare one multiplier for every size with Apple's ramp for
        each text style.
      </p>
    </Demo>
  );
}
