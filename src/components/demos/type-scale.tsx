"use client";

import { ReceiptIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// The scale itself. Every size is 14px times the ratio to some power, rounded
// to an even pixel. At 1.2 that lands on 12, 14, 16, 20 and 24.

const BASE = 14;

const ROLES = [
  { name: "Display", step: 3 },
  { name: "Title", step: 2 },
  { name: "Subhead", step: 1 },
  { name: "Body", step: 0 },
  { name: "Caption", step: -1 },
] as const;

function roundEven(value: number) {
  return Math.round(value / 2) * 2;
}

/**
 * Line height on a 4px grid: 1.3x up to 16px, easing to 1.1x by 32px, so
 * big text doesn't look double spaced.
 */
function lineHeightFor(size: number) {
  const factor = Math.min(1.3, Math.max(1.1, 1.3 - (size - 16) * 0.0125));
  return Math.ceil((size * factor) / 4) * 4;
}

/** Tracking in em: none at text sizes, tighter as the size grows. */
function trackingFor(size: number) {
  if (size >= 24) return -0.02;
  if (size >= 18) return -0.01;
  return 0;
}

function styleFor(size: number): React.CSSProperties {
  return {
    fontSize: size,
    lineHeight: `${lineHeightFor(size)}px`,
    letterSpacing: `${trackingFor(size)}em`,
  };
}

// ---------------------------------------------------------------------------
// A billing card, set twice: once with sizes picked by eye, once from the
// 1.2 scale above.

type Sizing = "drift" | "scale";

const SIZING_OPTIONS = [
  { value: "drift", label: "By eye", icon: WRONG_ICON },
  { value: "scale", label: "Scale", icon: RIGHT_ICON },
] as const;

type Slot =
  | "title"
  | "badge"
  | "meta"
  | "label"
  | "value"
  | "budget"
  | "row"
  | "rowValue"
  | "foot"
  | "button";

const SIZES: Record<Sizing, Record<Slot, number>> = {
  drift: {
    title: 22,
    badge: 13,
    meta: 15,
    label: 18,
    value: 26,
    budget: 15.5,
    row: 14,
    rowValue: 17,
    foot: 13,
    button: 16,
  },
  scale: {
    title: 20,
    badge: 12,
    meta: 14,
    label: 16,
    value: 24,
    budget: 14,
    row: 14,
    rowValue: 14,
    foot: 12,
    button: 14,
  },
};

const ROWS = [
  { label: "Requests", value: "2.4M" },
  { label: "Storage", value: "182 GB" },
  { label: "Bandwidth", value: "1.1 TB" },
] as const;

function distinctSizes(sizing: Sizing) {
  return [...new Set(Object.values(SIZES[sizing]))].sort((a, b) => a - b);
}

function BillingCard({
  sizing,
  highlight,
}: {
  sizing: Sizing;
  highlight: number | null;
}) {
  const sizes = SIZES[sizing];
  const scaled = sizing === "scale";

  // By eye, every line keeps the browser's default line height and no
  // tracking. On the scale, each size brings its own.
  function text(slot: Slot, className?: string) {
    const size = sizes[slot];
    return {
      className: cn(
        "rounded-[2px] outline-1 -outline-offset-1 outline-transparent outline-dashed transition-[outline-color] duration-150",
        highlight === size && "outline-sky-500",
        className
      ),
      style: scaled ? styleFor(size) : { fontSize: size, lineHeight: "normal" },
    };
  }

  return (
    <div className="flex w-full flex-col rounded-xl bg-card p-5 text-left shadow-(--custom-shadow)">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
          <ReceiptIcon aria-hidden="true" className="size-4" />
        </span>
        <span {...text("title", "font-semibold text-foreground")}>
          Billing
        </span>
        <span
          {...text(
            "badge",
            "ml-auto rounded-full bg-muted px-2 font-medium text-muted-foreground"
          )}
        >
          Pro
        </span>
      </div>
      <span {...text("meta", "mt-2 self-start text-muted-foreground")}>
        Renews on Oct 14
      </span>

      <span {...text("label", "mt-5 self-start font-medium text-foreground")}>
        This month
      </span>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span
          {...text("value", "font-semibold text-foreground tabular-nums")}
        >
          $1,284
        </span>
        <span {...text("budget", "text-muted-foreground tabular-nums")}>
          of $2,000
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-[64%] rounded-full bg-foreground/70" />
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        {ROWS.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between">
            <span {...text("row", "text-muted-foreground")}>{row.label}</span>
            <span {...text("rowValue", "text-foreground tabular-nums")}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#E7E7E7] pt-4 dark:border-[#1E1E1E]">
        <span {...text("foot", "text-muted-foreground")}>
          Updated 2 min ago
        </span>
        <span
          {...text(
            "button",
            "flex h-8 items-center rounded-full bg-primary px-3 font-medium text-primary-foreground"
          )}
        >
          Upgrade
        </span>
      </div>
    </div>
  );
}

export function TypeScaleDemo() {
  const [sizing, setSizing] = useState<Sizing>("drift");
  const [highlight, setHighlight] = useState<number | null>(null);
  const used = distinctSizes(sizing);

  function select(next: Sizing) {
    setSizing(next);
    setHighlight(null);
  }

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="flex w-full max-w-72 flex-col items-center gap-5">
        {/* The by-eye version is the taller one; keep its height reserved. */}
        <div className="grid w-full *:col-start-1 *:row-start-1">
          <div aria-hidden="true" className="invisible" inert>
            <BillingCard highlight={null} sizing="drift" />
          </div>
          <div aria-hidden="true" className="self-start" inert>
            <BillingCard highlight={highlight} sizing={sizing} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">
            <span className="text-foreground tabular-nums">{used.length}</span>{" "}
            font sizes
          </span>
          <div
            className="flex h-6 flex-wrap justify-center gap-1"
            onMouseLeave={() => setHighlight(null)}
          >
            {used.map((size) => (
              <button
                key={size}
                aria-label={`Outline the ${size}px text`}
                className={cn(
                  "h-6 min-w-6 cursor-pointer rounded-md px-1 font-mono text-[10px] tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                  highlight === size
                    ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
                onBlur={() => setHighlight(null)}
                onClick={() =>
                  setHighlight((current) => (current === size ? null : size))
                }
                onFocus={() => setHighlight(size)}
                onMouseEnter={() => setHighlight(size)}
                type="button"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SegmentedControl
        ariaLabel="Font sizes"
        onChange={select}
        options={SIZING_OPTIONS}
        value={sizing}
      />
    </Demo>
  );
}

// ---------------------------------------------------------------------------
// The same five roles, generated live from one ratio.

const NAMED_RATIOS = [
  { ratio: 1.067, name: "Minor second" },
  { ratio: 1.125, name: "Major second" },
  { ratio: 1.2, name: "Minor third" },
  { ratio: 1.25, name: "Major third" },
  { ratio: 1.333, name: "Perfect fourth" },
  { ratio: 1.414, name: "Augmented fourth" },
  { ratio: 1.5, name: "Perfect fifth" },
] as const;

function ratioName(ratio: number) {
  return NAMED_RATIOS.find((named) => Math.abs(named.ratio - ratio) < 0.0051)
    ?.name;
}

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : value;
}

export function TypeScaleRatioDemo() {
  const [hundredths, setHundredths] = useState(120);
  const ratio = hundredths / 100;
  const steps = ROLES.map((role) => ({
    ...role,
    size: roundEven(BASE * ratio ** role.step),
  }));
  const distinct = new Set(steps.map((step) => step.size)).size;
  const name = ratioName(ratio);

  return (
    <Demo className="gap-10 px-4 sm:px-8">
      <div className="flex h-48 w-full max-w-sm flex-col justify-end gap-2">
        {steps.map((step, index) => {
          // A step that rounds to the same size as the one below it is not a
          // step at all.
          const below = steps[index + 1];
          const duplicate = below && below.size === step.size;

          return (
            <div
              key={step.name}
              className="flex items-baseline justify-between gap-4"
            >
              <span
                className={cn(
                  "truncate text-foreground",
                  step.step >= 2 ? "font-semibold" : "font-normal",
                  duplicate && "text-destructive"
                )}
                style={styleFor(step.size)}
              >
                {step.name}
              </span>
              <span
                className={cn(
                  "shrink-0 font-mono text-[10px] tabular-nums",
                  duplicate ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {duplicate
                  ? `same as ${below.name}`
                  : `${step.size}/${lineHeightFor(step.size)}${
                      trackingFor(step.size)
                        ? ` ${trackingFor(step.size)}em`
                        : ""
                    }`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        <label className="grid w-full max-w-xs gap-2.5">
          <span className="flex items-center justify-between text-xs text-muted-foreground">
            Ratio
            <span className="flex items-center gap-2">
              {name ? <span>{name}</span> : null}
              <span className="tabular-nums text-foreground">
                {ratio.toFixed(2)}
              </span>
            </span>
          </span>
          <Slider
            aria-label="Ratio"
            max={150}
            min={105}
            onValueChange={(value) => setHundredths(getSliderValue(value))}
            step={1}
            value={[hundredths]}
          />
        </label>
        <span className="text-xs text-muted-foreground">
          <span className="text-foreground tabular-nums">{distinct}</span>{" "}
          distinct sizes
        </span>
      </div>
    </Demo>
  );
}
