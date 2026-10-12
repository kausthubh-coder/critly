"use client";

import { useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

/**
 * Inter's dynamic metrics: the letter spacing (in em) that keeps the
 * typeface looking even at a given pixel size. Published by Rasmus Andersson
 * for Inter 3, which had a single (text) design for every size.
 */
function interTracking(fontSizePx: number) {
  const a = -0.0223;
  const b = 0.185;
  const c = -0.1745;
  return a + b * Math.exp(c * fontSizePx);
}

function formatEm(value: number) {
  const rounded = Math.round(value * 1000) / 1000;
  if (rounded === 0) return "0em";
  return `${rounded > 0 ? "+" : "−"}${Math.abs(rounded).toFixed(3)}em`;
}

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * The site loads Inter 4, whose optical size axis already tightens display
 * sizes on its own. Pinning `opsz` to the text design shows the problem the
 * way most fonts have it: one drawing, scaled up.
 */
const TEXT_DESIGN: React.CSSProperties = {
  fontVariationSettings: '"opsz" 14',
};

function Word({
  size,
  tracking,
  guide = false,
}: {
  size: number;
  tracking: number;
  guide?: boolean;
}) {
  return (
    <span
      className="relative w-fit font-semibold leading-none whitespace-nowrap text-foreground"
      style={{ ...TEXT_DESIGN, fontSize: size, letterSpacing: `${tracking}em` }}
    >
      Headline
      {guide ? (
        // Marks where the tracked word ends and runs up through the row
        // above, so the untracked word's extra width shows as overshoot.
        <span
          aria-hidden="true"
          className="absolute bottom-0 h-[calc(200%+2.5rem)] border-l border-dashed border-sky-300 dark:border-sky-800"
          // letter-spacing also trails the last letter; sit on the glyph.
          style={{ right: `${tracking}em` }}
        />
      ) : null}
    </span>
  );
}

export function LetterSpacingDemo() {
  const [size, setSize] = useState(48);
  const tracking = interTracking(size);

  return (
    <Demo className="gap-10 px-4 sm:px-8">
      <div
        aria-hidden="true"
        className="flex w-full max-w-sm flex-col gap-5 rounded-xl bg-card px-5 py-5 shadow-(--custom-shadow)"
      >
        {/* Label (16px) + gap (4px) per row and a 20px gap between rows:
            the guide spans 2 words + 40px. */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] leading-4 tabular-nums text-muted-foreground">
            No tracking
          </span>
          <Word size={size} tracking={0} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] leading-4 tabular-nums text-sky-500">
            {formatEm(tracking)}
          </span>
          <Word guide size={size} tracking={tracking} />
        </div>
      </div>

      <label className="grid w-full max-w-xs gap-2.5">
        <span className="flex items-center justify-between text-xs text-muted-foreground">
          Font size
          <span className="tabular-nums text-foreground">{size}px</span>
        </span>
        <Slider
          aria-label="Font size"
          max={56}
          min={12}
          onValueChange={(value) => setSize(getSliderValue(value))}
          step={1}
          value={[size]}
        />
      </label>
    </Demo>
  );
}

const PINNED = [
  { name: "Roadmap", status: "Draft" },
  { name: "Pricing", status: "Live" },
  { name: "Changelog", status: "Live" },
] as const;

function PinnedList({ tracking }: { tracking: string }) {
  return (
    <div className="w-full rounded-xl bg-card p-2 shadow-(--custom-shadow)">
      <span
        className="block px-2 pt-1 pb-2 text-[10px] font-semibold uppercase text-muted-foreground"
        style={{ letterSpacing: tracking }}
      >
        Pinned
      </span>
      <ul className="flex flex-col">
        {PINNED.map((page) => (
          <li
            key={page.name}
            className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-foreground"
          >
            <span className="truncate">{page.name}</span>
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                page.status === "Live"
                  ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              )}
              style={{ letterSpacing: tracking }}
            >
              {page.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function UppercaseTrackingDemo() {
  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem verdict="wrong" caption="0em">
          <PinnedList tracking="0" />
        </CompareItem>
        <CompareItem verdict="right" caption="0.05em">
          <PinnedList tracking="0.05em" />
        </CompareItem>
      </Compare>
    </Demo>
  );
}
