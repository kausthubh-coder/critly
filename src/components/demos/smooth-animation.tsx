"use client";

import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// These demos only move when the reader presses Play, and they stop when
// scrolled away, so nothing loops in the background.

type Load = "idle" | "busy";

const LOAD_OPTIONS = [
  { value: "idle", label: "Idle page" },
  { value: "busy", label: "Busy page" },
] as const;

// A busy page: the main thread is blocked for 70ms out of every 100ms, about
// what a big React re-render or a JSON parse does on a mid-range phone.
const BLOCK_MS = 70;
const BLOCK_EVERY_MS = 100;

function useMainThreadLoad(load: Load, running: boolean) {
  useEffect(() => {
    if (load !== "busy" || !running) return;
    const id = window.setInterval(() => {
      const end = performance.now() + BLOCK_MS;
      while (performance.now() < end) {
        // Deliberately spin: this is the busy page.
      }
    }, BLOCK_EVERY_MS);
    return () => window.clearInterval(id);
  }, [load, running]);
}

// Stops the demo when it scrolls out of view.
function useStopWhenHidden(
  ref: React.RefObject<HTMLElement | null>,
  stop: () => void
) {
  const stopRef = useRef(stop);
  stopRef.current = stop;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stopRef.current();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}

const PERIOD_MS = 1600;
// Track width minus the dot, in px.
const TRAVEL = 168;

function Track({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
        {label}
      </span>
      <div className="relative h-8 w-50 rounded-full bg-muted p-1 shadow-(--custom-shadow) dark:bg-muted/60">
        {children}
      </div>
    </div>
  );
}

const DOT = "absolute top-1 left-1 size-6 rounded-full bg-foreground";

// Moves the dot from JavaScript on every frame, the way a requestAnimationFrame
// loop or a JS spring library does.
function JsDot({ running }: { running: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = ((now - start) % PERIOD_MS) / PERIOD_MS;
      const progress = 0.5 - Math.cos(t * Math.PI * 2) / 2;
      if (ref.current) {
        ref.current.style.transform = `translateX(${progress * TRAVEL}px)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);
  return <div ref={ref} aria-hidden="true" className={DOT} />;
}

export function MainThreadDemo() {
  const [running, setRunning] = useState(false);
  const [load, setLoad] = useState<Load>("idle");
  const ref = useRef<HTMLElement>(null);

  useMainThreadLoad(load, running);
  useStopWhenHidden(ref, () => setRunning(false));

  const play = running ? "running" : "paused";

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <style>{`
        @keyframes craft-smooth-left {
          0%, 100% { left: 4px; }
          50% { left: ${TRAVEL + 4}px; }
        }
        @keyframes craft-smooth-transform {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(${TRAVEL}px); }
        }
      `}</style>

      <figure ref={ref} className="flex flex-col gap-3">
        <Track label="JavaScript loop">
          <JsDot running={running} />
        </Track>
        <Track label="CSS left">
          <div
            aria-hidden="true"
            className={DOT}
            style={{
              animation: `craft-smooth-left ${PERIOD_MS}ms ease-in-out infinite`,
              animationPlayState: play,
            }}
          />
        </Track>
        <Track label="CSS transform">
          <div
            aria-hidden="true"
            className={DOT}
            style={{
              animation: `craft-smooth-transform ${PERIOD_MS}ms ease-in-out infinite`,
              animationPlayState: play,
            }}
          />
        </Track>
      </figure>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          aria-pressed={running}
          className="min-w-22"
          onClick={() => setRunning((value) => !value)}
          variant="secondary"
        >
          {running ? (
            <PauseIcon aria-hidden="true" weight="fill" />
          ) : (
            <PlayIcon aria-hidden="true" weight="fill" />
          )}
          {running ? "Pause" : "Play"}
        </Button>
        <SegmentedControl
          ariaLabel="Main thread load"
          onChange={(value) => {
            setLoad(value);
            setRunning(true);
          }}
          options={LOAD_OPTIONS}
          value={load}
        />
      </div>
    </Demo>
  );
}

// Hover lift: the shadow either repaints every frame (box-shadow) or is a
// pre-painted layer that only fades (opacity).
function LiftCard({ cheap, lifted }: { cheap: boolean; lifted: boolean }) {
  const ease = "cubic-bezier(0.23, 1, 0.32, 1)";
  const shadow = "0 18px 36px -12px rgb(0 0 0 / 0.35)";
  return (
    <div
      aria-hidden="true"
      className="relative h-24 w-full rounded-xl bg-card p-3 shadow-(--custom-shadow)"
      style={{
        transform: lifted ? "translateY(-6px)" : "translateY(0)",
        transition: cheap
          ? `transform 600ms ${ease}`
          : `transform 600ms ${ease}, box-shadow 600ms ${ease}`,
        boxShadow: cheap ? undefined : lifted ? shadow : "0 0 0 transparent",
      }}
    >
      {cheap ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            boxShadow: shadow,
            opacity: lifted ? 1 : 0,
            transition: `opacity 600ms ${ease}`,
          }}
        />
      ) : null}
      <div className="h-1.5 w-1/2 rounded-full bg-foreground/15" />
      <div className="mt-2 h-1.5 w-4/5 rounded-full bg-foreground/10" />
      <div className="mt-2 h-1.5 w-2/3 rounded-full bg-foreground/10" />
    </div>
  );
}

export function ShadowLiftDemo() {
  const [lifted, setLifted] = useState(false);
  const [load, setLoad] = useState<Load>("idle");
  const ref = useRef<HTMLElement>(null);

  useMainThreadLoad(load, true);
  useStopWhenHidden(ref, () => setLoad("idle"));

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <figure ref={ref} className="w-full max-w-lg">
        <Compare>
          <CompareItem caption="Animates box-shadow" verdict="wrong">
            <LiftCard cheap={false} lifted={lifted} />
          </CompareItem>
          <CompareItem caption="Fades a shadow layer" verdict="right">
            <LiftCard cheap lifted={lifted} />
          </CompareItem>
        </Compare>
      </figure>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          aria-pressed={lifted}
          className={cn("min-w-22")}
          onClick={() => setLifted((value) => !value)}
          variant="secondary"
        >
          {lifted ? "Drop" : "Lift"}
        </Button>
        <SegmentedControl
          ariaLabel="Main thread load"
          onChange={setLoad}
          options={LOAD_OPTIONS}
          value={load}
        />
      </div>
    </Demo>
  );
}
