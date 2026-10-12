"use client";

import {
  CalendarBlankIcon,
  ImageIcon,
  NotePencilIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { Compare, CompareItem, RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : value;
}

export function ButtonPressDemo() {
  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem verdict="wrong">
          <div className="grid h-28 w-full place-items-center rounded-xl bg-card shadow-(--custom-shadow)">
            <Button className="transition-none active:scale-100">
              Save changes
            </Button>
          </div>
        </CompareItem>
        <CompareItem verdict="right">
          <div className="grid h-28 w-full place-items-center rounded-xl bg-card shadow-(--custom-shadow)">
            <Button className="transition-transform duration-100 ease-out hover:duration-100 active:scale-[0.97]">
              Save changes
            </Button>
          </div>
        </CompareItem>
      </Compare>
    </Demo>
  );
}

/**
 * Press-scale playground. `pressScale` forces the button's transform (the
 * video has no real pointer), otherwise the CSS `active:` state handles it.
 */
export function PressAmountView({
  amount,
  duration,
  pressScale,
  onAmountChange,
  onDurationChange,
}: {
  amount: number;
  duration: number;
  pressScale?: number;
  onAmountChange?: (amount: number) => void;
  onDurationChange?: (duration: number) => void;
}) {
  const scale = 1 - amount / 100;

  return (
    <Demo className="gap-10">
      <div className="grid h-28 w-full max-w-xs place-items-center rounded-xl bg-card shadow-(--custom-shadow)">
        <Button
          className="transition-transform ease-out duration-(--press-ms) hover:duration-(--press-ms) active:scale-(--press) motion-reduce:transition-none"
          style={
            {
              "--press": String(scale),
              "--press-ms": `${duration}ms`,
              ...(pressScale !== undefined && {
                transform: `scale(${pressScale})`,
              }),
            } as React.CSSProperties
          }
        >
          Save changes
        </Button>
      </div>

      <div className="grid w-full max-w-xs gap-5">
        <label className="grid gap-2.5">
          <span className="flex items-center justify-between text-xs text-muted-foreground">
            Scale
            <span className="tabular-nums text-foreground">
              {scale.toFixed(2)}
            </span>
          </span>
          <Slider
            aria-label="Press scale"
            max={12}
            min={0}
            onValueChange={(value) => onAmountChange?.(getSliderValue(value))}
            step={1}
            value={[amount]}
          />
        </label>
        <label className="grid gap-2.5">
          <span className="flex items-center justify-between text-xs text-muted-foreground">
            Duration
            <span className="tabular-nums text-foreground">{duration}ms</span>
          </span>
          <Slider
            aria-label="Press duration"
            max={400}
            min={0}
            onValueChange={(value) =>
              onDurationChange?.(getSliderValue(value))
            }
            step={20}
            value={[duration]}
          />
        </label>
      </div>
    </Demo>
  );
}

export function PressAmountDemo() {
  const [amount, setAmount] = useState(3);
  const [duration, setDuration] = useState(100);

  return (
    <PressAmountView
      amount={amount}
      duration={duration}
      onAmountChange={setAmount}
      onDurationChange={setDuration}
    />
  );
}

type PressMode = "none" | "scale";

const PRESS_OPTIONS = [
  { value: "none", label: "No feedback", icon: WRONG_ICON },
  { value: "scale", label: "Scale", icon: RIGHT_ICON },
] as const;

const TILES = [
  { label: "Notes", detail: "12 items", Icon: NotePencilIcon },
  { label: "Calendar", detail: "3 today", Icon: CalendarBlankIcon },
  { label: "Photos", detail: "148 items", Icon: ImageIcon },
] as const;

export function PressEverywhereDemo() {
  const [mode, setMode] = useState<PressMode>("none");

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="grid w-full max-w-md grid-cols-3 gap-2 sm:gap-3">
        {TILES.map((tile) => (
          <button
            key={tile.label}
            type="button"
            className={cn(
              "flex cursor-pointer flex-col items-start gap-3 rounded-xl bg-card p-3 text-left shadow-(--custom-shadow) outline-none select-none hover:bg-muted/60 focus-visible:ring-[1.5px] focus-visible:ring-ring/50 sm:p-4",
              mode === "scale" &&
                "transition-transform duration-100 ease-out active:scale-[0.97] motion-reduce:transition-none"
            )}
          >
            <tile.Icon
              aria-hidden="true"
              className="size-5 text-foreground"
              weight="duotone"
            />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-medium text-foreground">
                {tile.label}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {tile.detail}
              </span>
            </span>
          </button>
        ))}
      </div>

      <SegmentedControl
        ariaLabel="Press feedback"
        onChange={setMode}
        options={PRESS_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}
