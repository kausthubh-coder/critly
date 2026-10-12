"use client";

import {
  animate,
  motion,
  useMotionValue,
  type AnimationPlaybackControlsWithThen,
} from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";

import monet from "@/assets/claude-monet-water-lilies.jpg";
import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

type Mode = "flat" | "depth";

const MODES = [
  { value: "flat", label: "Flat" },
  { value: "depth", label: "Depth" },
] as const;

const ROWS = [
  { title: "Water Lilies", meta: "Claude Monet, 1906" },
  { title: "The Japanese Footbridge", meta: "Claude Monet, 1899" },
  { title: "Haystacks", meta: "Claude Monet, 1890" },
] as const;

export function DepthOfFieldDemo() {
  const [mode, setMode] = useState<Mode>("flat");
  const [open, setOpen] = useState(true);
  const depth = mode === "depth" && open;

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="relative w-full max-w-sm overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)">
        <div
          className={cn(
            "transition-[transform,filter] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            depth ? "scale-[0.97] blur-[2px]" : "scale-100 blur-0"
          )}
        >
          <div className="relative aspect-[2/1] w-full">
            <Image
              alt="Water Lilies by Claude Monet"
              className="object-cover"
              fill
              placeholder="blur"
              sizes="(min-width: 640px) 384px, 100vw"
              src={monet}
            />
          </div>
          <ul className="divide-y divide-[#E7E7E7] p-1.5 dark:divide-[#1E1E1E]">
            {ROWS.map((row) => (
              <li
                key={row.title}
                className="flex h-10 items-center justify-between gap-3 px-2 text-xs"
              >
                <span className="truncate text-foreground">{row.title}</span>
                <span className="shrink-0 text-muted-foreground">
                  {row.meta}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none",
            open ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        />

        <div
          className={cn(
            "absolute inset-x-0 top-1/2 mx-auto w-[calc(100%-2.5rem)] max-w-64 -translate-y-1/2 rounded-xl bg-card p-4 shadow-(--custom-shadow) transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            open
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0"
          )}
          aria-label="Delete collection"
          inert={!open}
          role="dialog"
        >
          <div className="text-sm font-medium text-foreground">
            Delete collection?
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            The three paintings inside will stay in your library.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="h-7 cursor-pointer rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="h-7 cursor-pointer rounded-md bg-foreground px-2.5 text-xs font-medium text-background"
              onClick={() => setOpen(false)}
              type="button"
            >
              Delete
            </button>
          </div>
        </div>

        <button
          className={cn(
            "absolute inset-0 grid cursor-pointer place-items-center text-xs font-medium text-foreground transition-opacity duration-300 motion-reduce:transition-none",
            open ? "pointer-events-none opacity-0" : "opacity-100"
          )}
          inert={open}
          onClick={() => setOpen(true)}
          type="button"
        >
          <span className="rounded-md bg-card px-2.5 py-1.5 shadow-(--custom-shadow)">
            Open dialog
          </span>
        </button>
      </div>

      <SegmentedControl
        ariaLabel="Background treatment"
        onChange={setMode}
        options={MODES}
        value={mode}
      />
    </Demo>
  );
}

/*
 * Overscroll borrowed from a physical object. The list already fits, so any
 * pull is past the end. A hard stop ignores it. A rubber band gives way less
 * and less the further you pull, then springs back on release.
 */

const FOLDERS = [
  { label: "Inbox", count: "12" },
  { label: "Drafts", count: "3" },
  { label: "Sent", count: "" },
  { label: "Archive", count: "" },
] as const;

const LIST_HEIGHT = 168;
const KEY_PULL = 120;

/** Displacement for a pull of `distance`px: approaches `LIST_HEIGHT`, never reaches it. */
function rubberBand(distance: number) {
  const resisted =
    (1 - 1 / ((Math.abs(distance) * 0.55) / LIST_HEIGHT + 1)) * LIST_HEIGHT;
  return Math.sign(distance) * resisted;
}

function OverscrollList({ elastic }: { elastic: boolean }) {
  const y = useMotionValue(0);
  const start = useRef<number | null>(null);
  const spring = useRef<AnimationPlaybackControlsWithThen>(undefined);
  const [reading, setReading] = useState<{ pull: number; moved: number }>();

  function pullTo(distance: number) {
    spring.current?.stop();
    const moved = elastic ? rubberBand(distance) : 0;
    y.set(moved);
    setReading({ pull: Math.abs(distance), moved: Math.abs(moved) });
  }

  function release() {
    start.current = null;
    spring.current = animate(y, 0, { type: "spring", duration: 0.5, bounce: 0 });
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div
        aria-label={`${elastic ? "Rubber band" : "Hard stop"} list. Drag it, or press the up and down arrow keys.`}
        className="relative w-full cursor-grab touch-none overflow-hidden rounded-xl bg-card shadow-(--custom-shadow) select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing"
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          const distance = event.key === "ArrowDown" ? KEY_PULL : -KEY_PULL;
          const moved = elastic ? rubberBand(distance) : 0;
          spring.current?.stop();
          setReading({ pull: KEY_PULL, moved: Math.abs(moved) });
          const out = animate(y, moved, { duration: 0.15, ease: "easeOut" });
          spring.current = out;
          out.finished.then(() => {
            if (spring.current === out) release();
          });
        }}
        onLostPointerCapture={release}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          start.current = event.clientY;
          pullTo(0);
        }}
        onPointerMove={(event) => {
          if (start.current === null) return;
          pullTo(event.clientY - start.current);
        }}
        role="group"
        style={{ height: LIST_HEIGHT }}
        tabIndex={0}
      >
        <motion.ul className="flex flex-col p-1" style={{ y }}>
          {FOLDERS.map((folder, index) => (
            <li
              key={folder.label}
              className={cn(
                "flex h-10 items-center justify-between gap-3 rounded-lg px-2.5 text-xs",
                index === 0 ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
            >
              {folder.label}
              <span className="tabular-nums text-muted-foreground">
                {folder.count}
              </span>
            </li>
          ))}
        </motion.ul>
      </div>
      <span className="text-[10px] tabular-nums text-muted-foreground">
        {reading
          ? `Pulled ${Math.round(reading.pull)}px, moved ${Math.round(reading.moved)}px`
          : "Drag the list down"}
      </span>
    </div>
  );
}

export function RubberBandDemo() {
  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <Compare>
        <CompareItem verdict="wrong" label="Hard stop">
          <OverscrollList elastic={false} />
        </CompareItem>
        <CompareItem verdict="right" label="Rubber band">
          <OverscrollList elastic />
        </CompareItem>
      </Compare>
    </Demo>
  );
}
