"use client";

import {
  ArrowCounterClockwiseIcon,
  CopyIcon,
  DotsThreeIcon,
  FolderIcon,
  PencilSimpleIcon,
  PlayIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useInView, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// The CSS keywords, spelled out so the graph can draw them.
const EASE_IN = "cubic-bezier(0.42, 0, 1, 1)";
const EASE_OUT = "cubic-bezier(0, 0, 0.58, 1)";
const EASE_IN_OUT = "cubic-bezier(0.42, 0, 0.58, 1)";

const MENU_ITEMS = [
  { label: "Rename", Icon: PencilSimpleIcon },
  { label: "Duplicate", Icon: CopyIcon },
  { label: "Move to", Icon: FolderIcon },
  { label: "Delete", Icon: TrashIcon },
] as const;

function MenuCard({
  open,
  easing,
  duration,
  onToggle,
}: {
  open: boolean;
  easing: string;
  duration: number;
  onToggle: () => void;
}) {
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-xl bg-muted p-2 dark:bg-muted/40">
      <Button
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={onToggle}
        size="icon-sm"
        variant="ghost"
      >
        <DotsThreeIcon aria-hidden="true" className="size-4" weight="bold" />
      </Button>

      <div
        aria-hidden={!open}
        className={cn(
          "absolute top-11 left-2 w-32 origin-top-left rounded-lg bg-card p-1 shadow-(--custom-shadow)",
          !open && "pointer-events-none"
        )}
        style={{
          opacity: open ? 1 : 0,
          transform: open
            ? "translateY(0) scale(1)"
            : "translateY(-6px) scale(0.94)",
          transitionProperty: "opacity, transform",
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: easing,
        }}
      >
        {MENU_ITEMS.map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex h-7 items-center gap-2 rounded-md px-2 text-xs",
              item.label === "Delete"
                ? "text-destructive"
                : "text-foreground"
            )}
          >
            <item.Icon aria-hidden="true" className="size-3.5" />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EasingsDemo() {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((value) => !value);

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem verdict="wrong" label="Ease in">
          <MenuCard
            duration={250}
            easing={EASE_IN}
            onToggle={toggle}
            open={open}
          />
        </CompareItem>
        <CompareItem verdict="right" label="Ease out">
          <MenuCard
            duration={250}
            easing={EASE_OUT}
            onToggle={toggle}
            open={open}
          />
        </CompareItem>
      </Compare>

      <Button onClick={toggle} variant="secondary">
        {open ? "Close" : "Open"}
      </Button>
    </Demo>
  );
}

type CurveName = "linear" | "ease-in" | "ease-out" | "in-out";

const CURVES: Record<
  CurveName,
  { label: string; css: string; points: [number, number, number, number] }
> = {
  linear: { label: "Linear", css: "linear", points: [0, 0, 1, 1] },
  "ease-in": {
    label: "Ease in",
    css: EASE_IN,
    points: [0.42, 0, 1, 1],
  },
  "ease-out": {
    label: "Ease out",
    css: EASE_OUT,
    points: [0, 0, 0.58, 1],
  },
  "in-out": {
    label: "In-out",
    css: EASE_IN_OUT,
    points: [0.42, 0, 0.58, 1],
  },
};

const CURVE_OPTIONS = (
  Object.keys(CURVES) as CurveName[]
).map((value) => ({ value, label: CURVES[value].label }));

const CHART = 160;
const RUN_MS = 1000;

export function EasingCurveDemo() {
  const [curve, setCurve] = useState<CurveName>("ease-out");
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.6 });
  const xRef = useRef<HTMLDivElement>(null);
  const yRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  const run = useCallback(
    (duration = RUN_MS) => {
      const x = xRef.current;
      const y = yRef.current;
      const track = trackRef.current;
      const ball = ballRef.current;
      if (!x || !y || !track || !ball) return;

      const easing = CURVES[curve].css;
      const distance = track.clientWidth - ball.offsetWidth - 8;
      const options = { duration, fill: "forwards" } as const;

      x.animate(
        [{ transform: "translateX(0px)" }, { transform: `translateX(${CHART}px)` }],
        { ...options, easing: "linear" }
      );
      y.animate(
        [{ transform: "translateY(0px)" }, { transform: `translateY(-${CHART}px)` }],
        { ...options, easing }
      );
      ball.animate(
        [{ transform: "translateX(0px)" }, { transform: `translateX(${distance}px)` }],
        { ...options, easing }
      );
    },
    [curve]
  );

  // Play once when the demo scrolls into view, and again whenever the curve
  // changes. Reduced motion skips the automatic first run; replay always plays.
  const autoRan = useRef(false);
  useEffect(() => {
    if (!inView) return;
    const first = !autoRan.current;
    autoRan.current = true;
    run(first && reduceMotion ? 0 : RUN_MS);
  }, [inView, run, reduceMotion]);

  const [x1, y1, x2, y2] = CURVES[curve].points;
  const path = `M 0 ${CHART} C ${x1 * CHART} ${(1 - y1) * CHART}, ${
    x2 * CHART
  } ${(1 - y2) * CHART}, ${CHART} 0`;

  return (
    <Demo className="gap-8">
      <div
        ref={rootRef}
        className="flex w-full max-w-xs flex-col items-center gap-6"
      >
        <div
          aria-hidden="true"
          className="relative shrink-0"
          style={{ width: CHART, height: CHART }}
        >
          <svg
            className="absolute inset-0 overflow-visible"
            height={CHART}
            viewBox={`0 0 ${CHART} ${CHART}`}
            width={CHART}
          >
            <line
              className="stroke-foreground/10"
              strokeDasharray="3 3"
              x1={0}
              x2={CHART}
              y1={CHART}
              y2={0}
            />
            <rect
              className="fill-none stroke-foreground/10"
              height={CHART}
              width={CHART}
              x={0}
              y={0}
            />
            <path
              className="fill-none stroke-foreground transition-[d] duration-300 ease-out motion-reduce:transition-none"
              d={path}
              strokeLinecap="round"
              strokeWidth={2}
            />
          </svg>
          <div ref={xRef} className="absolute bottom-0 left-0">
            <div ref={yRef}>
              <div className="size-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-sky-500 shadow-[0_0_0_2px_var(--background)]" />
            </div>
          </div>
        </div>

        <div
          ref={trackRef}
          aria-hidden="true"
          className="relative h-8 w-full rounded-full bg-muted"
        >
          <div
            ref={ballRef}
            className="absolute top-1 left-1 size-6 rounded-full bg-foreground"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <SegmentedControl
          ariaLabel="Easing curve"
          onChange={setCurve}
          options={CURVE_OPTIONS}
          value={curve}
        />
        <Button
          aria-label="Replay"
          onClick={() => run()}
          size="icon-sm"
          variant="secondary"
        >
          <ArrowCounterClockwiseIcon aria-hidden="true" className="size-4" weight="bold" />
        </Button>
      </div>
    </Demo>
  );
}

/** Solves a CSS cubic-bezier: progress at a given fraction of the duration. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (t: number, a: number, b: number) =>
    3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  return (x: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (at(mid, x1, x2) < x) lo = mid;
      else hi = mid;
    }
    return at((lo + hi) / 2, y1, y2);
  };
}

const STRONG_MS = 250;

const RACE = [
  { label: "ease-out", progress: cubicBezier(0, 0, 0.58, 1) },
  { label: "ease-snappy", progress: cubicBezier(0.23, 1, 0.32, 1) },
] as const;

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : (value as number);
}

export function StrongEasingDemo() {
  const [time, setTime] = useState(60);
  const frame = useRef(0);

  const stop = () => cancelAnimationFrame(frame.current);

  const play = () => {
    stop();
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(STRONG_MS, Math.max(0, now - start));
      setTime(elapsed);
      if (elapsed < STRONG_MS) frame.current = requestAnimationFrame(tick);
    };
    setTime(0);
    frame.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <Demo className="gap-10 px-4 sm:px-8">
      <div className="grid w-full max-w-xs gap-5">
        {RACE.map((row) => {
          const progress = row.progress(time / STRONG_MS);
          return (
            <div key={row.label} className="grid gap-2.5">
              <span className="flex items-center justify-between text-xs text-muted-foreground">
                {row.label}
                <span className="tabular-nums text-foreground">
                  {Math.round(progress * 100)}%
                </span>
              </span>
              <div
                aria-hidden="true"
                className="relative h-8 w-full rounded-full bg-muted"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-foreground/8"
                  style={{ width: `calc(32px + (100% - 32px) * ${progress})` }}
                />
                <div
                  className="absolute top-1 size-6 rounded-full bg-foreground"
                  style={{ left: `calc(4px + (100% - 32px) * ${progress})` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid w-full max-w-xs gap-6">
        <label className="grid gap-2.5">
          <span className="flex items-center justify-between text-xs text-muted-foreground">
            Time
            <span className="tabular-nums text-foreground">
              {Math.round(time)}ms
              <span className="text-muted-foreground"> of {STRONG_MS}ms</span>
            </span>
          </span>
          <Slider
            aria-label="Time"
            max={STRONG_MS}
            min={0}
            onValueChange={(value) => {
              stop();
              setTime(getSliderValue(value));
            }}
            step={5}
            value={[Math.round(time)]}
          />
        </label>
        <Button
          className="justify-self-center"
          onClick={play}
          variant="secondary"
        >
          <PlayIcon aria-hidden="true" weight="fill" />
          Play at full speed
        </Button>
      </div>
    </Demo>
  );
}
