"use client";

import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { Demo } from "@/components/app/demo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Simulated timings. The point is the gap between what a test can see and
// what the person waits for, not the exact numbers.
const LOAD_EVENT_MS = 260;
const SKELETON_MS = 320;
const READY_MS = 1500;
const TIMELINE_MS = 1800;

type Phase = "blank" | "skeleton" | "ready";

export function ReadySignalDemo() {
  const [elapsed, setElapsed] = useState<number | null>(null);
  const frame = useRef(0);
  const finish = useRef<number>(undefined);

  function run() {
    cancelAnimationFrame(frame.current);
    const start = performance.now();
    const tick = (now: number) => {
      const t = now - start;
      setElapsed(Math.min(t, TIMELINE_MS));
      if (t < TIMELINE_MS) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    // Frames can be throttled (background tabs), so a timer guarantees the end.
    window.clearTimeout(finish.current);
    finish.current = window.setTimeout(() => setElapsed(TIMELINE_MS), TIMELINE_MS + 50);
  }

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      window.clearTimeout(finish.current);
    },
    []
  );

  const t = elapsed ?? 0;
  const phase: Phase = elapsed === null || t < SKELETON_MS ? "blank" : t < READY_MS ? "skeleton" : "ready";
  const pct = (ms: number) => `${(ms / TIMELINE_MS) * 100}%`;

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="w-full max-w-sm overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)">
        <div className="h-28 p-3" aria-hidden="true">
          {phase === "skeleton" ? (
            <div className="flex flex-col gap-2">
              <div className="h-3 w-1/2 animate-pulse rounded-full bg-muted" />
              <div className="h-2 w-4/5 animate-pulse rounded-full bg-muted" />
              <div className="h-2 w-3/5 animate-pulse rounded-full bg-muted" />
            </div>
          ) : phase === "ready" ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-foreground">Your orders</p>
              <p className="text-xs text-muted-foreground">3 shipped, 1 arriving today</p>
              <p className="text-xs text-muted-foreground">Order #2041 · Out for delivery</p>
            </div>
          ) : null}
        </div>
        <div className="relative h-14 border-t border-border px-3 pt-3">
          <div className="relative h-1.5 rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-foreground/30"
              style={{ width: pct(t) }}
            />
            {[
              { at: LOAD_EVENT_MS, label: "load event", tone: "bg-muted-foreground" },
              { at: READY_MS, label: "content ready", tone: "bg-emerald-500" },
            ].map((mark) => (
              <div
                key={mark.label}
                className="absolute -top-1 flex -translate-x-1/2 flex-col items-center gap-1"
                style={{ left: pct(mark.at) }}
              >
                <span
                  className={cn(
                    "h-3.5 w-0.5 rounded-full transition-opacity",
                    mark.tone,
                    t >= mark.at ? "opacity-100" : "opacity-25"
                  )}
                />
                <span className="text-[10px] whitespace-nowrap tabular-nums text-muted-foreground">
                  {mark.label} · {mark.at}ms
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Button onClick={run} variant="secondary">
        <ArrowClockwiseIcon aria-hidden="true" weight="bold" />
        Load the page
      </Button>
    </Demo>
  );
}

// A skewed distribution like real page loads: mostly around 800ms, with a
// slow tail from cold caches, background work and garbage collection.
function sampleLoad() {
  const u = Math.random();
  const base = 700 + Math.random() * 250;
  return Math.round(u > 0.7 ? base + 500 + Math.random() * 900 : base);
}

const SCALE_MIN = 500;
const SCALE_MAX = 2300;

export function RepeatRunsDemo() {
  const [runs, setRuns] = useState<number[]>([]);

  const sorted = [...runs].sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="w-full max-w-sm">
        <div className="relative h-16 rounded-xl bg-card px-4 shadow-(--custom-shadow)">
          <div className="absolute inset-x-4 top-1/2 h-px bg-border" />
          {runs.map((ms, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/60"
              style={{ left: `calc(1rem + (100% - 2rem) * ${(ms - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)})` }}
            />
          ))}
          {median !== null && runs.length > 1 ? (
            <span
              aria-hidden="true"
              className="absolute top-2 bottom-2 w-0.5 -translate-x-1/2 rounded-full bg-emerald-500"
              style={{ left: `calc(1rem + (100% - 2rem) * ${(median - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)})` }}
            />
          ) : null}
        </div>
        <div className="mt-1.5 flex justify-between px-1 text-[10px] tabular-nums text-muted-foreground">
          <span>{SCALE_MIN}ms</span>
          <span>{SCALE_MAX}ms</span>
        </div>
      </div>
      <p className="min-h-4 text-center text-xs tabular-nums text-muted-foreground" aria-live="polite">
        {runs.length === 0
          ? "Simulated page loads"
          : runs.length === 1
            ? `One run: ${runs[0]}ms. Is that the real number?`
            : `${runs.length} runs · median ${median}ms · range ${sorted[0]}–${sorted[sorted.length - 1]}ms`}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={() => setRuns([sampleLoad()])} variant="secondary">
          Measure once
        </Button>
        <Button
          onClick={() => setRuns(Array.from({ length: 7 }, sampleLoad))}
          variant="secondary"
        >
          Measure 7 times
        </Button>
      </div>
    </Demo>
  );
}
