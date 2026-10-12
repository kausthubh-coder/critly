"use client";

import { useEffect, useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type CornerMode = "round" | "squircle";

const CORNER_OPTIONS = [
  { value: "round", label: "Round" },
  { value: "squircle", label: "Squircle" },
] as const;

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : value;
}

// `corner-shape` ignores unsupported values, so the demos quietly fall back to
// round corners. Say so, otherwise the comparison looks like nothing changes.
function useCornerShapeSupport() {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(
      typeof CSS !== "undefined" && CSS.supports("corner-shape", "squircle")
    );
  }, []);

  return supported;
}

function UnsupportedNote() {
  const supported = useCornerShapeSupport();
  if (supported) return null;

  return (
    <p className="max-w-xs text-center text-xs text-pretty text-muted-foreground/70">
      Your browser does not support <code>corner-shape</code> yet, so every
      corner here renders as round.
    </p>
  );
}

const TILE_CLASS =
  "size-24 bg-linear-to-br from-sky-500 to-indigo-600 shadow-(--custom-shadow) sm:size-28 [--edge:0_0_0_/_0.15] dark:[--edge:255_255_255_/_0.1]";

const TILE_STYLE: React.CSSProperties = {
  outline: "1px solid rgb(var(--edge))",
  outlineOffset: -1,
};

export function SquircleCompareDemo() {
  return (
    <Demo className="gap-10 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="corner-shape: round">
          <div
            aria-hidden="true"
            className={cn(TILE_CLASS, "rounded-[28px] corner-round")}
            style={TILE_STYLE}
          />
        </CompareItem>
        <CompareItem caption="corner-shape: squircle">
          <div
            aria-hidden="true"
            className={cn(TILE_CLASS, "rounded-[28px] corner-squircle")}
            style={TILE_STYLE}
          />
        </CompareItem>
      </Compare>
      <UnsupportedNote />
    </Demo>
  );
}

// Named stops on the superellipse scale. The parameter is an exponent of two,
// so 1 is a circle, 2 is the classic squircle and 0 is a straight bevel.
const CURVATURE_NAMES: Record<string, string> = {
  "-1": "scoop",
  "0": "bevel",
  "1": "round",
  "2": "squircle",
};

/** Curvature tile and slider; controlled so the video can drag it per frame. */
export function SquircleCurvatureView({
  curvature,
  onCurvatureChange,
}: {
  curvature: number;
  onCurvatureChange?: (curvature: number) => void;
}) {
  // Slider steps can carry float noise, so round before naming the stop.
  const rounded = Math.round(curvature * 10) / 10;
  const name = CURVATURE_NAMES[String(rounded)];

  return (
    <Demo className="gap-10 px-4 sm:px-8">
      <div className="flex flex-col items-center gap-4" aria-hidden="true">
        <div className="relative size-36">
          <div
            className="size-full rounded-[48px] bg-card shadow-(--custom-shadow) dark:bg-muted"
            style={
              {
                cornerShape: `superellipse(${rounded})`,
              } as React.CSSProperties
            }
          />
          {/* Where a plain 48px round corner would sit, for reference. */}
          <div className="pointer-events-none absolute inset-0 rounded-[48px] border border-dashed border-sky-400 dark:border-sky-500" />
          <span className="absolute -top-5 right-0 text-[9px] text-sky-400 dark:text-sky-500">
            Round
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          <span className="text-foreground">
            superellipse({rounded.toFixed(1)})
          </span>
          {name ? <span className="ml-2">{name}</span> : null}
        </span>
      </div>

      <label className="grid w-full max-w-xs gap-2.5">
        <span className="flex items-center justify-between text-xs text-muted-foreground">
          Curvature
          <span className="tabular-nums text-foreground">
            {rounded.toFixed(1)}
          </span>
        </span>
        <Slider
          aria-label="Curvature"
          max={4}
          min={-1}
          onValueChange={(value) => onCurvatureChange?.(getSliderValue(value))}
          step={0.1}
          value={[curvature]}
        />
      </label>
      <UnsupportedNote />
    </Demo>
  );
}

export function SquircleCurvatureDemo() {
  const [curvature, setCurvature] = useState(2);
  return (
    <SquircleCurvatureView
      curvature={curvature}
      onCurvatureChange={setCurvature}
    />
  );
}

export function SquircleExamplesDemo() {
  const [mode, setMode] = useState<CornerMode>("round");
  const corner = mode === "squircle" ? "corner-squircle" : "corner-round";

  return (
    <Demo className="gap-10 px-4 sm:px-8">
      <div
        aria-hidden="true"
        className="flex w-full max-w-md flex-wrap items-center justify-center gap-6 sm:gap-10"
      >
        {/* Avatar: a big radius on a small box, the squircle is obvious. */}
        <div
          className={cn(
            "size-14 rounded-[22px] bg-linear-to-br from-amber-300 to-orange-500 shadow-(--custom-shadow)",
            corner
          )}
        />

        {/* Button: a small radius on a wide box, the squircle is subtle. */}
        <span
          className={cn(
            "inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground shadow-(--custom-shadow)",
            corner
          )}
        >
          Continue
        </span>

        {/* Card with a nested surface: both layers need the same shape and
            the outer radius still equals inner radius plus the inset. */}
        <div
          className={cn(
            "w-44 rounded-[24px] bg-muted p-2 shadow-(--custom-shadow) dark:bg-muted/60",
            corner
          )}
        >
          <div
            className={cn(
              "h-20 rounded-[16px] bg-card shadow-(--custom-shadow) dark:bg-muted",
              corner
            )}
          />
        </div>
      </div>

      <SegmentedControl
        ariaLabel="Corner shape"
        onChange={setMode}
        options={CORNER_OPTIONS}
        value={mode}
      />
      <UnsupportedNote />
    </Demo>
  );
}
