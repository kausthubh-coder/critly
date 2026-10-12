"use client";

import { PlayIcon } from "@phosphor-icons/react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import { useMemo, useRef, useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { sampleSpring, springFromFeel, springStats } from "@/lib/spring";

// Every demo here is started by the reader and the motion is the point, so
// none of them drop to zero for reduced motion.

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : value;
}

const PLOT_W = 280;
const PLOT_H = 120;
const PLOT_SECONDS = 1.2;
const STEP = 1 / 240;
// Leave headroom above the target so overshoot has somewhere to go.
const Y_MAX = 1.3;
// Leaves room in the track for a bounce of 0.6, which overshoots by 25%.
const TRAVEL = 140;

function plotY(value: number) {
  return PLOT_H - (value / Y_MAX) * PLOT_H;
}

function SpringPlot({
  samples,
  time,
}: {
  samples: Float32Array;
  time: ReturnType<typeof useMotionValue<number>>;
}) {
  const path = useMemo(() => {
    let d = "";
    for (let i = 0; i < samples.length; i++) {
      const x = (i * STEP * PLOT_W) / PLOT_SECONDS;
      d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${plotY(samples[i]).toFixed(1)}`;
    }
    return d;
  }, [samples]);

  // Read through a ref so the transforms always see the current curve.
  const samplesRef = useRef(samples);
  samplesRef.current = samples;
  const cx = useTransform(time, (t) => (t * PLOT_W) / PLOT_SECONDS);
  const cy = useTransform(time, (t) => {
    const current = samplesRef.current;
    return plotY(current[Math.min(current.length - 1, Math.round(t / STEP))]);
  });

  return (
    <svg
      aria-hidden="true"
      className="w-full max-w-[280px] overflow-visible"
      viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
    >
      <line
        className="stroke-muted-foreground/30"
        strokeDasharray="3 3"
        x1={0}
        x2={PLOT_W}
        y1={plotY(1)}
        y2={plotY(1)}
      />
      <line
        className="stroke-muted-foreground/30"
        x1={0}
        x2={PLOT_W}
        y1={PLOT_H}
        y2={PLOT_H}
      />
      <path
        className="stroke-foreground"
        d={path}
        fill="none"
        strokeLinecap="round"
        strokeWidth={2}
      />
      <motion.circle className="fill-foreground" cx={cx} cy={cy} r={4} />
    </svg>
  );
}

export function SpringTunerDemo() {
  const [duration, setDuration] = useState(0.5);
  const [bounce, setBounce] = useState(0.2);
  const time = useMotionValue(0);
  const playback = useRef<AnimationPlaybackControls>(undefined);

  const physics = springFromFeel(duration, bounce);
  const samples = useMemo(
    () => sampleSpring(springFromFeel(duration, bounce), PLOT_SECONDS, STEP),
    [duration, bounce]
  );
  const stats = useMemo(
    () => springStats(springFromFeel(duration, bounce)),
    [duration, bounce]
  );

  const samplesRef = useRef(samples);
  samplesRef.current = samples;
  const x = useTransform(time, (t) => {
    const current = samplesRef.current;
    return current[Math.min(current.length - 1, Math.round(t / STEP))] * TRAVEL;
  });

  function play() {
    playback.current?.stop();
    time.set(0);
    playback.current = animate(time, PLOT_SECONDS, {
      duration: PLOT_SECONDS,
      ease: "linear",
    });
  }

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <div className="flex w-full max-w-xs flex-col items-center gap-5">
        <div className="h-11 w-56 rounded-full bg-muted p-1 shadow-(--custom-shadow) dark:bg-muted/60">
          <motion.div
            aria-hidden="true"
            className="size-9 rounded-full bg-foreground"
            style={{ x }}
          />
        </div>
        <SpringPlot samples={samples} time={time} />
        <p className="text-xs tabular-nums text-muted-foreground">
          Overshoots {(stats.overshoot * 100).toFixed(1)}%, settles in{" "}
          {stats.settleMs}ms
          <span className="sr-only">
            {`. Stiffness ${physics.stiffness.toFixed(0)}, damping ${physics.damping.toFixed(1)}.`}
          </span>
        </p>
      </div>

      <div className="grid w-full max-w-xs gap-5">
        <label className="grid gap-2.5">
          <span className="flex items-center justify-between text-xs text-muted-foreground">
            Duration
            <span className="tabular-nums text-foreground">
              {duration.toFixed(2)}s
            </span>
          </span>
          <Slider
            aria-label="Spring duration"
            max={1}
            min={0.2}
            onValueChange={(value) => setDuration(getSliderValue(value))}
            onValueCommitted={play}
            step={0.05}
            value={[duration]}
          />
        </label>
        <label className="grid gap-2.5">
          <span className="flex items-center justify-between text-xs text-muted-foreground">
            Bounce
            <span className="tabular-nums text-foreground">
              {bounce.toFixed(2)}
            </span>
          </span>
          <Slider
            aria-label="Spring bounce"
            max={0.6}
            min={0}
            onValueChange={(value) => setBounce(getSliderValue(value))}
            onValueCommitted={play}
            step={0.05}
            value={[bounce]}
          />
        </label>
      </div>

      <Button onClick={play} variant="secondary">
        <PlayIcon aria-hidden="true" weight="fill" />
        Play
      </Button>
    </Demo>
  );
}

const SHEET_HIDDEN = "calc(100% + 8px)";
const SHEET_ROWS = ["Copy link", "Send by email", "Invite people"] as const;

function SheetScreen({
  open,
  bounce,
}: {
  open: boolean;
  bounce: number;
}) {
  // Open on a spring; every close is the same quick, flat exit.
  const transition = open
    ? { type: "spring" as const, ...springFromFeel(0.45, bounce) }
    : { duration: 0.2, ease: [0.4, 0, 1, 1] as const };

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted shadow-(--custom-shadow) dark:bg-muted/40">
      <div aria-hidden="true" className="p-3">
        <div className="h-1.5 w-1/2 rounded-full bg-foreground/15" />
        <div className="mt-2 h-1.5 w-4/5 rounded-full bg-foreground/10" />
        <div className="mt-2 h-1.5 w-2/3 rounded-full bg-foreground/10" />
      </div>
      {/* The sheet runs 40px past the bottom edge, so an overshoot never
          shows a gap underneath it. */}
      <motion.div
        animate={{ y: open ? 0 : SHEET_HIDDEN }}
        aria-hidden="true"
        className="absolute inset-x-1.5 -bottom-10 rounded-lg bg-card p-2.5 pb-12 shadow-(--custom-shadow)"
        initial={false}
        transition={transition}
      >
        <div className="mx-auto mb-2.5 h-1 w-8 rounded-full bg-foreground/15" />
        <p className="mb-1.5 px-1 text-xs font-medium text-foreground">Share</p>
        <ul className="flex flex-col">
          {SHEET_ROWS.map((row) => (
            <li
              key={row}
              className="truncate rounded-md px-1 py-1 text-[11px] text-muted-foreground"
            >
              {row}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

export function SpringBounceDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="Bounce 0.4 on a click" verdict="wrong">
          <SheetScreen bounce={0.4} open={open} />
        </CompareItem>
        <CompareItem caption="Bounce 0 on a click" verdict="right">
          <SheetScreen bounce={0} open={open} />
        </CompareItem>
      </Compare>

      <Button
        aria-pressed={open}
        className="min-w-24"
        onClick={() => setOpen((value) => !value)}
        variant="secondary"
      >
        {open ? "Close" : "Share"}
      </Button>
    </Demo>
  );
}
