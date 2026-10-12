"use client";

import {
  ArrowsClockwiseIcon,
  CopyIcon,
  DotsThreeIcon,
  ExportIcon,
  FolderSimpleIcon,
  LinkSimpleIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
  TrashIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// Every animation here is started by the reader and the motion is the lesson,
// so none of them drop to zero for reduced motion.
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const ENTER_MS = 320;
// The origin demo uses the bottom of the recommended range so the difference
// between origins is visible without exaggerating the scale.
const ORIGIN_SCALE = 0.9;
// Slowed down so the shape of the entrance is easier to see.
const SLOW_MS = 480;

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : (value as number);
}

const SHARE_ITEMS = [
  { label: "Copy link", Icon: LinkSimpleIcon },
  { label: "Invite people", Icon: UsersIcon },
  { label: "Export as PDF", Icon: ExportIcon },
] as const;

const MORE_ITEMS = [
  { label: "Rename", Icon: PencilSimpleIcon },
  { label: "Duplicate", Icon: CopyIcon },
  { label: "Move to", Icon: FolderSimpleIcon },
  { label: "Delete", Icon: TrashIcon },
] as const;

function Menu({
  items,
  className,
  style,
}: {
  items: readonly { label: string; Icon: React.ElementType }[];
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <ul
      aria-hidden="true"
      className={cn(
        "flex w-36 flex-col rounded-lg bg-card p-1 shadow-(--custom-shadow)",
        className
      )}
      style={style}
    >
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-foreground"
        >
          <item.Icon
            aria-hidden="true"
            className="size-3.5 shrink-0 text-muted-foreground"
            weight="duotone"
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function FakeTrigger({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-(--custom-shadow) transition-colors",
        open && "bg-muted"
      )}
    >
      <ShareNetworkIcon className="size-3.5" weight="duotone" />
      Share
    </span>
  );
}

export function ScaleEntrancesDemo() {
  const [open, setOpen] = useState(false);
  const ms = ENTER_MS;

  const popover = (from: number) =>
    ({
      opacity: open ? 1 : 0,
      transform: open ? "scale(1)" : `scale(${from})`,
      transformOrigin: "top center",
      transition: `opacity ${ms}ms ${EASE_OUT}, transform ${ms}ms ${EASE_OUT}`,
    }) satisfies React.CSSProperties;

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem verdict="wrong" caption="From scale(0)">
          <div className="flex h-44 w-full flex-col items-center gap-2 rounded-xl bg-muted pt-4 dark:bg-muted/40">
            <FakeTrigger open={open} />
            <Menu items={SHARE_ITEMS} style={popover(0)} />
          </div>
        </CompareItem>
        <CompareItem verdict="right" caption="From scale(0.95)">
          <div className="flex h-44 w-full flex-col items-center gap-2 rounded-xl bg-muted pt-4 dark:bg-muted/40">
            <FakeTrigger open={open} />
            <Menu items={SHARE_ITEMS} style={popover(0.95)} />
          </div>
        </CompareItem>
      </Compare>

      <Button
        aria-pressed={open}
        className="min-w-24"
        onClick={() => setOpen((value) => !value)}
        variant="secondary"
      >
        {open ? "Close" : "Open"}
      </Button>
    </Demo>
  );
}

function CornerCard({
  open,
  origin,
  marker,
}: {
  open: boolean;
  origin: string;
  /** Where the dot marking the transform origin sits, in the menu's box. */
  marker: string;
}) {
  const ms = ENTER_MS;

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-xl bg-muted p-3 dark:bg-muted/40">
      <div aria-hidden="true" className="flex items-start justify-between">
        <div className="pt-1">
          <div className="h-1.5 w-16 rounded-full bg-foreground/20" />
          <div className="mt-2 h-1.5 w-10 rounded-full bg-foreground/10" />
        </div>
        <span
          className={cn(
            "inline-flex size-6 items-center justify-center rounded-md bg-card text-foreground shadow-(--custom-shadow) transition-colors",
            open && "bg-card/60"
          )}
        >
          <DotsThreeIcon className="size-4" weight="bold" />
        </span>
      </div>
      <div className="absolute top-10 right-3">
        <Menu
          className="w-28 sm:w-36"
          items={MORE_ITEMS}
          style={{
            opacity: open ? 1 : 0,
            transform: open ? "scale(1)" : `scale(${ORIGIN_SCALE})`,
            transformOrigin: origin,
            transition: `opacity ${ms}ms ${EASE_OUT}, transform ${ms}ms ${EASE_OUT}`,
          }}
        />
        {/* Guide: the point the menu grows from. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute size-2 -translate-1/2 rounded-full border border-dashed border-sky-500 bg-sky-500/20"
          style={{ left: marker.split(" ")[0], top: marker.split(" ")[1] }}
        />
      </div>
    </div>
  );
}

export function TransformOriginDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem verdict="wrong" caption="Origin: center">
          <CornerCard marker="50% 50%" open={open} origin="center" />
        </CompareItem>
        <CompareItem verdict="right" caption="Origin: top right">
          <CornerCard marker="100% 0%" open={open} origin="top right" />
        </CompareItem>
      </Compare>

      <Button
        aria-pressed={open}
        className="min-w-24"
        onClick={() => setOpen((value) => !value)}
        variant="secondary"
      >
        {open ? "Close" : "Open"}
      </Button>
    </Demo>
  );
}

export function StartingScaleDemo() {
  const [from, setFrom] = useState(0.95);
  const [run, setRun] = useState(0);
  const ms = SLOW_MS;

  return (
    <Demo className="gap-8">
      <style>{`
        @keyframes craft-scale-enter {
          from { opacity: 0; transform: scale(var(--from)); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="flex h-44 w-full max-w-xs flex-col items-center gap-2 rounded-xl bg-muted pt-4 dark:bg-muted/40">
        <FakeTrigger open />
        <Menu
          key={run}
          items={SHARE_ITEMS}
          style={
            {
              "--from": from,
              transformOrigin: "top center",
              animation: `craft-scale-enter ${ms}ms ${EASE_OUT} both`,
            } as React.CSSProperties
          }
        />
      </div>

      <div className="flex w-full max-w-xs flex-col items-center gap-5">
        <label className="grid w-full gap-2.5">
          <span className="flex items-center justify-between text-xs text-muted-foreground">
            Start scale
            <span className="font-mono text-[10px] tabular-nums text-foreground">
              {from.toFixed(2)}
            </span>
          </span>
          <Slider
            aria-label="Starting scale"
            max={1}
            min={0}
            onValueChange={(value) => setFrom(getSliderValue(value))}
            // Replay once the thumb is released, not on every step of a drag.
            onValueCommitted={() => setRun((n) => n + 1)}
            step={0.01}
            value={[from]}
          />
        </label>
        <Button onClick={() => setRun((n) => n + 1)} variant="secondary">
          <ArrowsClockwiseIcon aria-hidden="true" weight="bold" />
          Replay
        </Button>
      </div>
    </Demo>
  );
}
