"use client";

import { motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

import {
  Compare,
  CompareItem,
  RIGHT_ICON,
  WRONG_ICON,
} from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

/** Eases from 0 to 1 over `duration` ms every time `key` changes. */
function useProgress(key: number, duration: number) {
  const [state, setState] = useState({ key, t: 1 });

  useEffect(() => {
    if (key === 0) return;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setState({ key, t: 1 - Math.pow(1 - p, 3) });
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [key, duration]);

  // The first render after a new value starts at 0, before any frame runs.
  return state.key === key ? state.t : 0;
}

function walk(previous: number, step: number, min: number, max: number) {
  const next = previous + (Math.random() - 0.5) * step;
  return Math.min(max, Math.max(min, next));
}

/* Sparkline and counter: a new value every 1.5s. */

const TICK_MS = 1500;
const TWEEN_MS = 900;
const RANGE = { min: 150, max: 1000 };

// One more value than fits, so the leftmost segment can slide out.
const INITIAL_SERIES = [
  540, 520, 548, 505, 590, 612, 570, 640, 655, 610, 690, 720, 700, 665, 710,
  760, 740, 705, 680, 720, 770, 810, 790, 760, 800,
];

const SPARK = { width: 160, height: 44, pad: 3 };
const SLOT = SPARK.width / (INITIAL_SERIES.length - 2);

function yOf(value: number) {
  const innerH = SPARK.height - SPARK.pad * 2;
  return (
    SPARK.pad + (1 - (value - RANGE.min) / (RANGE.max - RANGE.min)) * innerH
  );
}

/**
 * `progress` is how far the newest point has travelled in (0 to 1). Every
 * point starts one slot to the right and slides left, and the head rides
 * along the newest segment, so nothing ever jumps.
 */
function LiveCard({
  values,
  progress,
}: {
  values: readonly number[];
  progress: number;
}) {
  const clipId = useId();
  const offset = 1 - progress;
  const previous = values[values.length - 2];
  const latest = values[values.length - 1];
  const head = previous + (latest - previous) * progress;

  const d = values
    .map((value, i) => {
      const x = (i - 1 + offset) * SLOT;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${yOf(value).toFixed(2)}`;
    })
    .join(" ");

  return (
    <div className="w-full rounded-xl bg-card p-3 shadow-(--custom-shadow)">
      <p className="text-[11px] text-muted-foreground">Requests per second</p>
      <p className="mt-0.5 text-xl font-semibold text-foreground tabular-nums">
        {Math.round(head).toLocaleString("en-US")}
      </p>
      <svg
        aria-hidden="true"
        className="mt-2 h-auto w-full overflow-visible"
        viewBox={`0 0 ${SPARK.width} ${SPARK.height}`}
      >
        <defs>
          <clipPath id={clipId}>
            <rect
              height={SPARK.height + 8}
              width={SPARK.width}
              x={0}
              y={-4}
            />
          </clipPath>
        </defs>
        <path
          className="text-foreground"
          clipPath={`url(#${clipId})`}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
        />
        <circle
          className="fill-foreground"
          cx={SPARK.width}
          cy={yOf(head)}
          r={2.5}
        />
      </svg>
    </div>
  );
}

export function LivingChartsDemo() {
  const [series, setSeries] = useState<readonly number[]>(INITIAL_SERIES);
  const [tick, setTick] = useState(0);
  const progress = useProgress(tick, TWEEN_MS);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeries((values) => [
        ...values.slice(1),
        walk(values[values.length - 1], 260, RANGE.min, RANGE.max),
      ]);
      setTick((n) => n + 1);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="Instant" verdict="wrong">
          <LiveCard progress={1} values={series} />
        </CompareItem>
        <CompareItem caption={`${TWEEN_MS}ms ease-out`} verdict="right">
          <LiveCard progress={progress} values={series} />
        </CompareItem>
      </Compare>
    </Demo>
  );
}

/* Ranked bars: values change and rows swap places. */

const SOURCES = [
  { name: "Google", domain: "google.com" },
  { name: "GitHub", domain: "github.com" },
  { name: "X", domain: "x.com" },
  { name: "YouTube", domain: "youtube.com" },
  { name: "Reddit", domain: "reddit.com" },
] as const;

// Scripted so every update reorders something. Values follow SOURCES order.
const FRAMES = [
  [4210, 2860, 1940, 1720, 1180],
  [4080, 2240, 2460, 1650, 1310],
  [3900, 1620, 2580, 1590, 1840],
  [4120, 2380, 2150, 1960, 1520],
  [3980, 2610, 1880, 2240, 1400],
] as const;

const UPDATE_MS = 2000;

/** Tweens each number towards its target with requestAnimationFrame. */
function useTweened(target: readonly number[], duration: number) {
  const [display, setDisplay] = useState<readonly number[]>(target);
  const current = useRef<readonly number[]>(target);

  useEffect(() => {
    const from = current.current;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const p = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = target.map((value, i) => {
        const origin = from[i] ?? value;
        return origin + (value - origin) * eased;
      });
      current.current = next;
      setDisplay(next);
      if (p < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}

const MODE_OPTIONS = [
  { value: "snap", label: "Snap", icon: WRONG_ICON },
  { value: "animate", label: "Animate", icon: RIGHT_ICON },
] as const;

type Mode = (typeof MODE_OPTIONS)[number]["value"];

export function LivingBarsDemo() {
  const [mode, setMode] = useState<Mode>("animate");
  const [frame, setFrame] = useState(0);
  const animated = mode === "animate";
  const values = FRAMES[frame];
  const shown = useTweened(values, animated ? 600 : 0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFrame((n) => (n + 1) % FRAMES.length);
    }, UPDATE_MS);
    return () => window.clearInterval(id);
  }, []);

  const max = Math.max(...values);
  const order = SOURCES.map((_, i) => i).sort((a, b) => values[b] - values[a]);
  const transition = animated
    ? { duration: 0.6, ease: EASE_OUT }
    : { duration: 0 };

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="w-full max-w-sm rounded-xl bg-card p-3 shadow-(--custom-shadow)">
        <p className="mb-3 text-[11px] text-muted-foreground">
          Visits by source
        </p>
        <div className="flex flex-col gap-2">
          {order.map((i) => {
            const source = SOURCES[i];
            return (
              <motion.div
                key={source.domain}
                className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2 text-xs"
                layout="position"
                transition={transition}
              >
                <span className="flex min-w-0 items-center gap-1.5 text-foreground">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    className="size-3.5 shrink-0 rounded-sm"
                    height={14}
                    src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=64`}
                    width={14}
                  />
                  <span className="truncate">{source.name}</span>
                </span>
                <span className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.span
                    animate={{ width: `${(values[i] / max) * 100}%` }}
                    className="block h-full rounded-full bg-foreground"
                    initial={false}
                    transition={transition}
                  />
                </span>
                <span className="text-right text-muted-foreground tabular-nums">
                  {Math.round(shown[i]).toLocaleString("en-US")}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
      <SegmentedControl
        ariaLabel="Update style"
        onChange={setMode}
        options={MODE_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}
