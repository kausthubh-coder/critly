"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const SCALE = [4, 8, 12, 16, 24, 32, 48, 64] as const;

const MOTION = "duration-300 ease-snappy motion-reduce:transition-none";

const GUIDE =
  "border-dashed border-sky-400/80 bg-sky-500/8 dark:border-sky-500/70 dark:bg-sky-500/10";

/*
 * Vertical gaps are labelled outside the card's right edge (`inset` is the
 * card's side padding), so they never collide with the icon gaps, which are
 * labelled inside at the end of each row.
 */
function VerticalGap({
  size,
  show,
  inset,
}: {
  size: number;
  show: boolean;
  inset: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative shrink-0 transition-[height]", MOTION)}
      style={{ height: size }}
    >
      <span
        className={cn(
          "absolute inset-0 border-y transition-opacity duration-150",
          GUIDE,
          show ? "opacity-100" : "opacity-0"
        )}
      />
      <span
        className={cn(
          "absolute top-1/2 -translate-y-1/2 text-[9px] leading-none whitespace-nowrap tabular-nums text-sky-500 transition-[left,opacity]",
          MOTION,
          show ? "opacity-100" : "opacity-0"
        )}
        style={{ left: `calc(100% + ${inset + 6}px)` }}
      >
        {size}px
      </span>
    </div>
  );
}

function HorizontalGap({ size, show }: { size: number; show: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block h-4 shrink-0 transition-[width]",
        MOTION
      )}
      style={{ width: size }}
    >
      <span
        className={cn(
          "absolute inset-0 border-x transition-opacity duration-150",
          GUIDE,
          show ? "opacity-100" : "opacity-0"
        )}
      />
    </span>
  );
}

type Values = "one-off" | "scale";

const VALUE_OPTIONS = [
  { value: "one-off", label: "One-off", icon: WRONG_ICON },
  { value: "scale", label: "Scale", icon: RIGHT_ICON },
] as const;

const VIEW_OPTIONS = [
  { value: "hidden", label: "Normal" },
  { value: "shown", label: "Show values" },
] as const;

const FEATURES = ["Unlimited projects", "Version history", "Priority support"];

/* Every space in the card, picked by eye or picked from the scale. */
const SPACES: Record<
  Values,
  {
    padding: number;
    title: number;
    intro: number;
    rows: [number, number];
    icons: [number, number, number];
    action: number;
  }
> = {
  "one-off": {
    padding: 18,
    title: 6,
    intro: 14,
    rows: [7, 10],
    icons: [6, 9, 7],
    action: 22,
  },
  scale: {
    padding: 24,
    title: 4,
    intro: 16,
    rows: [8, 8],
    icons: [8, 8, 8],
    action: 24,
  },
};

function distinctValues(values: Values) {
  const s = SPACES[values];
  return [
    ...new Set([s.padding, s.title, s.intro, ...s.rows, ...s.icons, s.action]),
  ].sort((a, b) => a - b);
}

function PlanCard({ values, show }: { values: Values; show: boolean }) {
  const s = SPACES[values];

  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-xl bg-card text-left shadow-(--custom-shadow) transition-[padding]",
        MOTION
      )}
      style={{ paddingInline: s.padding }}
    >
      <VerticalGap inset={s.padding} show={show} size={s.padding} />
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">Pro</span>
        <span className="text-sm text-foreground tabular-nums">
          $12
          <span className="text-xs text-muted-foreground">/mo</span>
        </span>
      </div>
      <VerticalGap inset={s.padding} show={show} size={s.title} />
      <p className="text-xs text-pretty text-muted-foreground">
        For teams that ship weekly.
      </p>
      <VerticalGap inset={s.padding} show={show} size={s.intro} />
      {FEATURES.map((feature, index) => (
        <div key={feature} className="contents">
          {index > 0 && (
            <VerticalGap inset={s.padding} show={show} size={s.rows[index - 1]} />
          )}
          <div className="flex items-center text-xs text-foreground">
            <CheckIcon
              aria-hidden="true"
              className="size-3.5 shrink-0 text-muted-foreground"
              weight="bold"
            />
            <HorizontalGap show={show} size={s.icons[index]} />
            <span className="min-w-0 flex-1 truncate">{feature}</span>
            <span
              className={cn(
                "w-8 shrink-0 text-right text-[9px] tabular-nums text-sky-500 transition-opacity duration-150",
                show ? "opacity-100" : "opacity-0"
              )}
            >
              {s.icons[index]}px
            </span>
          </div>
        </div>
      ))}
      <VerticalGap inset={s.padding} show={show} size={s.action} />
      <span className="flex h-8 items-center justify-center rounded-md bg-primary text-xs font-medium text-primary-foreground">
        Upgrade
      </span>
      <VerticalGap inset={s.padding} show={show} size={s.padding} />
    </div>
  );
}

export function SpacingScaleDemo() {
  const [values, setValues] = useState<Values>("one-off");
  const [view, setView] = useState<"hidden" | "shown">("hidden");
  const used = distinctValues(values);

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="flex w-full max-w-64 flex-col items-center gap-4">
        {/* The scale version is the taller one; keep its height reserved. */}
        <div
          aria-hidden="true"
          className="grid w-full *:col-start-1 *:row-start-1"
          inert
        >
          <div className="invisible">
            <PlanCard show={false} values="scale" />
          </div>
          <div className="self-start">
            <PlanCard show={view === "shown"} values={values} />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          <span className="text-foreground tabular-nums">{used.length}</span>{" "}
          values:{" "}
          <span className="tabular-nums">{used.join(", ")}</span>
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <SegmentedControl
          ariaLabel="Spacing values"
          onChange={setValues}
          options={VALUE_OPTIONS}
          value={values}
        />
        <SegmentedControl
          ariaLabel="Value overlay"
          onChange={setView}
          options={VIEW_OPTIONS}
          value={view}
        />
      </div>
    </Demo>
  );
}

/* A slider that only lands on the scale. */

function nearestStep(value: number) {
  return SCALE.reduce((best, step) =>
    Math.abs(step - value) < Math.abs(best - value) ? step : best
  );
}

const MIN = SCALE[0];
const MAX = SCALE[SCALE.length - 1];

export function SpacingStepsDemo() {
  const [value, setValue] = useState<number>(24);
  const index = SCALE.indexOf(value as (typeof SCALE)[number]);
  const previous = index > 0 ? SCALE[index - 1] : null;
  const ratio = previous ? value / previous : null;

  function handleChange(
    next: number | readonly number[],
    details: { reason: string }
  ) {
    const raw = Array.isArray(next) ? next[0] : (next as number);
    let snapped = nearestStep(raw);
    // Arrow keys move 1px at a time, which would always snap back. Step to
    // the neighbour in that direction instead.
    if (details.reason === "keyboard" && snapped === value && raw !== value) {
      const direction = raw > value ? 1 : -1;
      snapped = SCALE[Math.min(SCALE.length - 1, Math.max(0, index + direction))];
    }
    setValue(snapped);
  }

  return (
    <Demo className="gap-10 px-4 sm:px-8">
      <div aria-hidden="true" className="flex h-20 items-center">
        <span className="h-20 w-20 rounded-xl bg-card shadow-(--custom-shadow) sm:w-24" />
        <span
          className={cn(
            "relative flex h-full shrink-0 justify-center transition-[width]",
            MOTION
          )}
          style={{ width: value }}
        >
          <span className={cn("absolute inset-0 border-x", GUIDE)} />
          <span className="absolute top-full mt-2 text-[10px] whitespace-nowrap tabular-nums text-sky-500">
            {value}px
          </span>
        </span>
        <span className="h-20 w-20 rounded-xl bg-card shadow-(--custom-shadow) sm:w-24" />
      </div>

      <div className="grid w-full max-w-xs gap-3">
        <span className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <code className="font-mono text-[10px] text-foreground">
              gap-{value / 4}
            </code>
          </span>
          <span className="tabular-nums">
            {ratio ? (
              <>
                <span className="text-foreground">
                  {Number(ratio.toFixed(2))}x
                </span>{" "}
                the step below
              </>
            ) : (
              "The base step"
            )}
          </span>
        </span>
        <Slider
          aria-label="Gap"
          max={MAX}
          min={MIN}
          onValueChange={handleChange}
          step={1}
          value={[value]}
        />
        {/* Ticks sit where the thumb's centre lands for each step. */}
        <div className="relative h-4 text-[10px] tabular-nums text-muted-foreground">
          {SCALE.map((step) => (
            <button
              key={step}
              className={cn(
                "absolute top-0 -translate-x-1/2 cursor-pointer rounded-sm px-0.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                step === value && "text-foreground"
              )}
              onClick={() => setValue(step)}
              style={{
                left: `calc(12px + ${(step - MIN) / (MAX - MIN)} * (100% - 24px))`,
              }}
              tabIndex={-1}
              type="button"
            >
              {step}
            </button>
          ))}
        </div>
      </div>
    </Demo>
  );
}
