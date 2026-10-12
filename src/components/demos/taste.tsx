"use client";

import {
  BellIcon,
  PlayIcon,
  PlusIcon,
  RocketLaunchIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * Two cards that look the same at a glance. One has three small flaws:
 * an icon tile with the wrong corner radius, a bell sitting 2px low, and a
 * primary button whose padding is lopsided. Click a spot on either card to
 * mark it; matching spots count on both.
 */

type FlawId = "radius" | "bell" | "padding";

const FLAWS: Record<FlawId, string> = {
  radius: "4px radius",
  bell: "2px low",
  padding: "16px / 8px",
};

function Flaw({
  id,
  shown,
  marked,
  onFind,
  children,
  className,
}: {
  id: FlawId;
  shown: boolean;
  marked: boolean;
  onFind: (id: FlawId) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn("relative inline-flex", className)}
      onClick={() => onFind(id)}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-1 rounded-md border transition-opacity duration-200 motion-reduce:transition-none",
          marked ? "border-rose-500" : "border-transparent",
          shown ? "opacity-100" : "opacity-0"
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-rose-500 px-1 py-px text-[10px] leading-tight text-white transition-opacity duration-200 motion-reduce:transition-none",
          shown && marked ? "opacity-100" : "opacity-0"
        )}
      >
        {FLAWS[id]}
      </span>
    </span>
  );
}

function ProjectCard({
  flawed,
  shown,
  onFind,
}: {
  flawed: boolean;
  shown: Set<FlawId>;
  onFind: (id: FlawId) => void;
}) {
  const flaw = (id: FlawId) => ({
    id,
    shown: shown.has(id),
    marked: flawed,
    onFind,
  });

  return (
    <div
      aria-hidden="true"
      className="w-full max-w-60 cursor-crosshair rounded-2xl bg-card p-3 shadow-(--custom-shadow) select-none sm:p-4"
    >
      <div className="flex items-center gap-2 sm:gap-2.5">
        <Flaw {...flaw("radius")}>
          <div
            className={cn(
              "grid size-8 shrink-0 place-items-center bg-foreground text-background",
              flawed ? "rounded-[4px]" : "rounded-lg"
            )}
          >
            <RocketLaunchIcon className="size-4" weight="fill" />
          </div>
        </Flaw>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-foreground sm:text-sm">
            Launch
          </div>
          <div className="truncate text-[11px] text-muted-foreground sm:text-xs">
            3 open
          </div>
        </div>
        <Flaw {...flaw("bell")}>
          <BellIcon
            className={cn(
              "size-4 text-muted-foreground",
              flawed && "translate-y-0.5"
            )}
          />
        </Flaw>
      </div>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-3/4 rounded-full bg-foreground" />
      </div>

      <div className="mt-4 flex items-center gap-1">
        <Flaw {...flaw("padding")}>
          <span
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg bg-foreground text-xs font-medium whitespace-nowrap text-background",
              flawed ? "pr-2 pl-4" : "px-3"
            )}
          >
            <PlusIcon className="size-3.5" weight="bold" />
            Add task
          </span>
        </Flaw>
        <span className="hidden h-8 items-center rounded-lg px-2.5 text-xs font-medium text-muted-foreground sm:inline-flex">
          Share
        </span>
      </div>
    </div>
  );
}

const FLAW_IDS = Object.keys(FLAWS) as FlawId[];

export function SpotTheDifferenceDemo() {
  const [found, setFound] = useState<Set<FlawId>>(() => new Set());
  const [revealed, setRevealed] = useState(false);
  const [flawedSide, setFlawedSide] = useState<"left" | "right">("right");

  // Pick the flawed side after hydration so the server and client agree.
  useEffect(() => {
    if (Math.random() < 0.5) setFlawedSide("left");
  }, []);

  const shown = revealed ? new Set(FLAW_IDS) : found;

  function find(id: FlawId) {
    if (revealed) return;
    setFound((prev) => new Set(prev).add(id));
  }

  function toggleReveal() {
    if (revealed) setFound(new Set());
    setRevealed((value) => !value);
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="grid w-full max-w-lg grid-cols-2 gap-3 pt-3 sm:gap-8">
        {(["left", "right"] as const).map((side) => (
          <div key={side} className="flex min-w-0 justify-center">
            <ProjectCard
              flawed={flawedSide === side}
              onFind={find}
              shown={shown}
            />
          </div>
        ))}
      </div>
      <span
        aria-live="polite"
        className="text-xs tabular-nums text-muted-foreground"
      >
        {revealed
          ? "All three, revealed"
          : `Found ${found.size} of 3. Click anything that looks off.`}
      </span>
      <Button onClick={toggleReveal} size="sm" variant="secondary">
        {revealed ? "Try again" : "Reveal"}
      </Button>
    </Demo>
  );
}

/*
 * Two menus open side by side. Only one variable differs between them.
 */

type Variable = "duration" | "easing" | "origin";

const VARIABLES = [
  { value: "duration", label: "Duration" },
  { value: "easing", label: "Easing" },
  { value: "origin", label: "Origin" },
] as const;

const PAIRS: Record<
  Variable,
  readonly [
    { label: string; style: React.CSSProperties },
    { label: string; style: React.CSSProperties },
  ]
> = {
  duration: [
    {
      label: "400ms",
      style: {
        transitionDuration: "400ms",
        transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        transformOrigin: "top left",
      },
    },
    {
      label: "150ms",
      style: {
        transitionDuration: "150ms",
        transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        transformOrigin: "top left",
      },
    },
  ],
  easing: [
    {
      label: "Ease in",
      style: {
        transitionDuration: "220ms",
        transitionTimingFunction: "cubic-bezier(0.55, 0, 1, 0.45)",
        transformOrigin: "top left",
      },
    },
    {
      label: "Ease out",
      style: {
        transitionDuration: "220ms",
        transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        transformOrigin: "top left",
      },
    },
  ],
  origin: [
    {
      label: "From center",
      style: {
        transitionDuration: "220ms",
        transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        transformOrigin: "center",
      },
    },
    {
      label: "From trigger",
      style: {
        transitionDuration: "220ms",
        transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        transformOrigin: "top left",
      },
    },
  ],
};

const MENU_ITEMS = ["Rename", "Duplicate", "Move to", "Archive"] as const;

function MenuStage({
  open,
  style,
}: {
  open: boolean;
  style: React.CSSProperties;
}) {
  return (
    <div className="relative h-44 w-full max-w-44">
      <div
        aria-hidden="true"
        className="inline-flex h-7 items-center rounded-md bg-muted px-2.5 text-xs font-medium text-foreground"
      >
        Options
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "absolute top-8 left-0 w-36 rounded-lg bg-card p-1 shadow-(--custom-shadow) transition-[transform,opacity] motion-reduce:transition-none",
          open ? "scale-100 opacity-100" : "scale-90 opacity-0"
        )}
        // Closing is instant so only the opening is ever compared.
        style={open ? style : { ...style, transitionDuration: "0ms" }}
      >
        {MENU_ITEMS.map((item) => (
          <div
            key={item}
            className="flex h-7 items-center rounded-md px-2 text-xs text-foreground first:bg-muted"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PairJudgementDemo() {
  const [variable, setVariable] = useState<Variable>("duration");
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!busy) return;
    const timer = setTimeout(() => {
      setOpen(true);
      setBusy(false);
    }, 60);
    return () => clearTimeout(timer);
  }, [busy]);

  function play() {
    setOpen(false);
    setBusy(true);
  }

  const [left, right] = PAIRS[variable];

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-10">
        {[left, right].map((side) => (
          <div
            key={side.label}
            className="flex min-w-0 flex-col items-center gap-2"
          >
            <MenuStage open={open} style={side.style} />
            <span className="text-[10px] text-muted-foreground">
              {side.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-4">
        <Button onClick={play} size="sm" variant="secondary">
          <PlayIcon weight="fill" />
          Play
        </Button>
        <SegmentedControl
          ariaLabel="Variable to compare"
          onChange={(value) => {
            setVariable(value);
            setOpen(false);
            setBusy(true);
          }}
          options={VARIABLES}
          value={variable}
        />
      </div>
    </Demo>
  );
}
