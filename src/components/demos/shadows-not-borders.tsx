"use client";

import { CalendarBlankIcon } from "@phosphor-icons/react";
import { type CSSProperties, useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

/** The light mode surface shadow this site uses (`--custom-shadow`). */
const LIGHT_SHADOW =
  "0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06), 0 2px 4px 0 rgba(0,0,0,0.04)";

/** The dark mode version: an inner highlight and a ring, then soft shadows. */
const DARK_SHADOW =
  "inset 0 1px 0 0 rgba(255,255,255,0.03), inset 0 0 0 1px rgba(255,255,255,0.03), 0 0 0 1px rgba(0,0,0,0.1), 0 2px 2px 0 rgba(0,0,0,0.1), 0 4px 4px 0 rgba(0,0,0,0.1), 0 8px 8px 0 rgba(0,0,0,0.1)";

function SampleCard({
  className,
  style,
  dark = false,
}: {
  className?: string;
  style?: CSSProperties;
  dark?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-full rounded-xl p-3.5",
        dark ? "bg-[oklch(0.205_0_0)]" : "bg-card",
        className
      )}
      style={style}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full",
            dark ? "bg-white/8" : "bg-muted"
          )}
        >
          <CalendarBlankIcon
            className={cn(
              "size-3.5",
              dark ? "text-white/60" : "text-muted-foreground"
            )}
            weight="duotone"
          />
        </span>
        <span className="flex min-w-0 flex-col">
          <span
            className={cn(
              "truncate text-xs font-medium",
              dark ? "text-white/90" : "text-foreground"
            )}
          >
            Design review
          </span>
          <span
            className={cn(
              "truncate text-[10px]",
              dark ? "text-white/50" : "text-muted-foreground"
            )}
          >
            Tomorrow, 10:00
          </span>
        </span>
      </div>
      <div className="mt-3 flex gap-1.5">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px]",
            dark ? "bg-white/8 text-white/60" : "bg-muted text-muted-foreground"
          )}
        >
          Figma
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px]",
            dark ? "bg-white/8 text-white/60" : "bg-muted text-muted-foreground"
          )}
        >
          3 comments
        </span>
      </div>
    </div>
  );
}

export function ShadowsNotBordersDemo() {
  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem verdict="wrong" label="Border">
          <SampleCard className="border border-border" />
        </CompareItem>
        <CompareItem verdict="right" label="Shadow">
          <SampleCard className="shadow-(--custom-shadow)" />
        </CompareItem>
      </Compare>
    </Demo>
  );
}

type Layer = "ring" | "contact" | "ambient";

const LAYER_ORDER: readonly Layer[] = ["ring", "contact", "ambient"];

const LAYER_OPTIONS = [
  { value: "ring", label: "Ring" },
  { value: "contact", label: "Contact" },
  { value: "ambient", label: "Ambient" },
] as const;

/** The value each step adds, light and dark, split out of `--custom-shadow`. */
const LAYER_VALUES: Record<Layer, { light: string; dark: string }> = {
  ring: {
    light: "0 0 0 1px rgb(0 0 0 / 0.06)",
    dark: "inset 0 0 0 1px rgb(255 255 255 / 0.03), 0 0 0 1px rgb(0 0 0 / 0.1)",
  },
  contact: {
    light: "0 1px 2px -1px rgb(0 0 0 / 0.06)",
    dark: "inset 0 1px 0 0 rgb(255 255 255 / 0.03)",
  },
  ambient: {
    light: "0 2px 4px 0 rgb(0 0 0 / 0.04)",
    dark: "0 2px 2px, 0 4px 4px and 0 8px 8px, all rgb(0 0 0 / 0.1)",
  },
};

export function ShadowLayersDemo() {
  const [layer, setLayer] = useState<Layer>("ring");
  const active = LAYER_ORDER.slice(0, LAYER_ORDER.indexOf(layer) + 1);

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="flex w-full flex-col items-center gap-5">
        <SampleCard
          className="max-w-60 [--ring:0_0_0_1px_rgba(0,0,0,0.06)] [--contact:0_1px_2px_-1px_rgba(0,0,0,0.06)] [--ambient:0_2px_4px_0_rgba(0,0,0,0.04)] transition-shadow duration-300 ease-out motion-reduce:transition-none dark:[--ring:inset_0_0_0_1px_rgba(255,255,255,0.03),0_0_0_1px_rgba(0,0,0,0.1)] dark:[--contact:inset_0_1px_0_0_rgba(255,255,255,0.03)] dark:[--ambient:0_2px_2px_0_rgba(0,0,0,0.1),0_4px_4px_0_rgba(0,0,0,0.1),0_8px_8px_0_rgba(0,0,0,0.1)]"
          style={{
            boxShadow: active.map((name) => `var(--${name})`).join(", "),
          }}
        />
        <code className="h-8 max-w-xs text-center font-mono text-[10px] leading-4 text-balance text-muted-foreground">
          <span className="dark:hidden">+ {LAYER_VALUES[layer].light}</span>
          <span className="hidden dark:inline">
            + {LAYER_VALUES[layer].dark}
          </span>
        </code>
      </div>

      <SegmentedControl
        ariaLabel="Shadow layers"
        onChange={setLayer}
        options={LAYER_OPTIONS}
        value={layer}
      />
    </Demo>
  );
}

// Every level starts from the site token and only adds layers on top, so
// the edge and contact stay identical as the surface rises.
const LEVELS = [
  { label: "Card", lift: "" },
  {
    label: "Hover",
    lift: "[--lift:0_4px_8px_-2px_rgba(0,0,0,0.08)] dark:[--lift:0_8px_16px_-4px_rgba(0,0,0,0.3)]",
  },
  {
    label: "Popover",
    lift: "[--lift:0_4px_8px_-2px_rgba(0,0,0,0.08),0_12px_24px_-6px_rgba(0,0,0,0.12)] dark:[--lift:0_8px_16px_-4px_rgba(0,0,0,0.3),0_16px_32px_-8px_rgba(0,0,0,0.5)]",
  },
] as const;

export function ShadowElevationDemo() {
  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <div className="grid w-full max-w-md grid-cols-3 gap-3 sm:gap-6">
        {LEVELS.map((level) => (
          <div
            key={level.label}
            className="flex min-w-0 flex-col items-center gap-4"
          >
            <div
              aria-hidden="true"
              className={cn(
                "flex h-20 w-full flex-col gap-2 rounded-xl bg-card p-3",
                level.lift
              )}
              style={{
                boxShadow: level.lift
                  ? "var(--custom-shadow), var(--lift)"
                  : "var(--custom-shadow)",
              }}
            >
              <span className="h-1.5 w-1/2 rounded-full bg-foreground/15" />
              <span className="h-1.5 w-4/5 rounded-full bg-foreground/8" />
              <span className="h-1.5 w-2/3 rounded-full bg-foreground/8" />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {level.label}
            </span>
          </div>
        ))}
      </div>
    </Demo>
  );
}

export function ShadowDarkModeDemo() {
  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <div className="w-full max-w-lg rounded-2xl bg-[oklch(0.17_0_0)] p-4 sm:p-6">
        <Compare className="max-w-none">
          <CompareItem verdict="wrong">
            <SampleCard dark style={{ boxShadow: LIGHT_SHADOW }} />
          </CompareItem>
          <CompareItem verdict="right">
            <SampleCard dark style={{ boxShadow: DARK_SHADOW }} />
          </CompareItem>
        </Compare>
      </div>
    </Demo>
  );
}
