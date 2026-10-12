"use client";

import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { motion, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Phone, PHONE_INSETS, PHONE_WIDTH } from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

/* ThreadJankDemo: a React Native app has two threads that matter. React
   renders on the JS thread; the UI thread draws every frame. The card's
   position is computed on one or the other.

   The busy JS thread is simulated. A web page has one main thread, so a real
   busy loop would freeze the pointer events for both cards. Instead the JS
   thread is modelled: each of its frames samples the finger when it starts
   and only commits that position when its (simulated) render ends, 40-60ms
   later when busy. The UI thread is the browser's real frame loop. */

const SCREEN_H = 360;
const CARD_W = 92;
const CARD_H = 116;
const STRIP_BARS = 36;
const STRIP_MAX_MS = 66;
const BUDGET_MS = 1000 / 60;

type Thread = "js" | "ui";
type Point = { x: number; y: number };

const THREAD_OPTIONS = [
  { value: "js", label: "JS thread", icon: WRONG_ICON },
  { value: "ui", label: "UI thread", icon: RIGHT_ICON },
] as const;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// Where the card may sit: inside the safe area of the drawn screen.
const BOUNDS = {
  minX: 12,
  maxX: PHONE_WIDTH - CARD_W - 12,
  minY: PHONE_INSETS.ios.top + 32,
  maxY: SCREEN_H - PHONE_INSETS.ios.bottom - CARD_H - 8,
};
const HOME: Point = {
  x: (PHONE_WIDTH - CARD_W) / 2,
  y: (BOUNDS.minY + BOUNDS.maxY) / 2,
};

function clampPoint(p: Point): Point {
  return {
    x: clamp(p.x, BOUNDS.minX, BOUNDS.maxX),
    y: clamp(p.y, BOUNDS.minY, BOUNDS.maxY),
  };
}

// A frame-time strip, written straight to the DOM so it never re-renders React.
function useStrip() {
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const label = useRef<HTMLSpanElement>(null);
  const times = useRef<number[]>([]);
  function push(ms: number) {
    const list = times.current;
    list.push(ms);
    if (list.length > STRIP_BARS) list.shift();
    const offset = STRIP_BARS - list.length;
    for (let i = 0; i < STRIP_BARS; i++) {
      const el = bars.current[i];
      if (!el) continue;
      const value = list[i - offset];
      if (value === undefined) {
        el.style.transform = "scaleY(0)";
        continue;
      }
      el.style.transform = `scaleY(${Math.min(value, STRIP_MAX_MS) / STRIP_MAX_MS})`;
      // A real dropped frame at 60 Hz is 33ms; ignore small timer jitter.
      el.dataset.late = value > BUDGET_MS * 1.5 ? "true" : "false";
    }
    const recent = list.slice(-8);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    if (label.current) label.current.textContent = `${Math.round(1000 / avg)} fps`;
  }
  return { bars, label, push };
}

function Strip({
  name,
  strip,
  drives,
}: {
  name: string;
  strip: ReturnType<typeof useStrip>;
  drives: boolean;
}) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex w-20 shrink-0 flex-col items-end gap-0.5 text-right">
        <span className={cn("text-xs", drives ? "font-medium text-foreground" : "text-muted-foreground")}>
          {name}
        </span>
        <span ref={strip.label} className="text-[11px] tabular-nums text-muted-foreground">
          – fps
        </span>
      </div>
      <div
        aria-hidden="true"
        className="relative flex h-9 w-50 items-end gap-px overflow-hidden rounded-md bg-muted px-1 dark:bg-muted/60"
      >
        {/* 16.7ms budget line */}
        <span
          className="absolute inset-x-0 border-t border-dashed border-sky-500/60"
          style={{ bottom: 2 + (BUDGET_MS / STRIP_MAX_MS) * 32 }}
        />
        {Array.from({ length: STRIP_BARS }, (_, i) => (
          <span
            key={i}
            ref={(el) => {
              strip.bars.current[i] = el;
            }}
            className="mb-0.5 h-8 flex-1 origin-bottom rounded-[1px] bg-muted-foreground/45 data-[late=true]:bg-rose-500/80"
            style={{ transform: "scaleY(0)" }}
          />
        ))}
      </div>
    </div>
  );
}

export function ThreadJankDemo() {
  const [thread, setThread] = useState<Thread>("js");
  const [busy, setBusy] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [touching, setTouching] = useState(false);

  // The card, and the finger (a dashed ring).
  const cardX = useMotionValue(HOME.x);
  const cardY = useMotionValue(HOME.y);
  const fingerX = useMotionValue(HOME.x + CARD_W / 2);
  const fingerY = useMotionValue(HOME.y + CARD_H / 2);

  const jsStrip = useStrip();
  const uiStrip = useStrip();

  // Mutable simulation state, read inside the frame loop.
  const sim = useRef({
    target: { ...HOME } as Point, // where the finger wants the card
    jsCommitted: { ...HOME } as Point,
    jsSample: { ...HOME } as Point,
    jsStart: 0,
    jsEnd: 0,
    lastTick: 0,
    activeUntil: 0,
    playStart: 0,
    grab: { x: 0, y: 0 },
  });
  const settings = useRef({ thread, busy, playing });
  settings.current = { thread, busy, playing };
  const frame = useRef(0);
  const stage = useRef<HTMLDivElement>(null);

  function setTarget(p: Point) {
    const s = sim.current;
    s.target = clampPoint(p);
    fingerX.set(s.target.x + s.grab.x);
    fingerY.set(s.target.y + s.grab.y);
    // On the UI thread the gesture writes the position directly.
    if (settings.current.thread === "ui") {
      cardX.set(s.target.x);
      cardY.set(s.target.y);
    }
    wake();
  }

  function tick(now: number) {
    const s = sim.current;
    const { thread: t, busy: b, playing: p } = settings.current;

    if (p) {
      // A scripted finger tracing a figure eight for four seconds.
      const elapsed = now - s.playStart;
      if (elapsed > 4000) {
        setPlaying(false);
      } else {
        const a = (elapsed / 4000) * Math.PI * 2;
        const rx = (BOUNDS.maxX - BOUNDS.minX) / 2;
        const ry = (BOUNDS.maxY - BOUNDS.minY) / 2;
        s.grab = { x: CARD_W / 2, y: CARD_H / 2 };
        setTarget({ x: HOME.x + Math.sin(a) * rx, y: HOME.y + Math.sin(a * 2) * ry * 0.9 });
      }
    }

    // UI thread: the browser's real frame.
    if (s.lastTick) uiStrip.push(now - s.lastTick);
    s.lastTick = now;

    // JS thread: commit the sampled position when the render finishes.
    if (now >= s.jsEnd) {
      if (s.jsStart) {
        s.jsCommitted = s.jsSample;
        // A frame that finishes early still waits for the next vsync.
        jsStrip.push(Math.max(BUDGET_MS, now - s.jsStart));
      }
      s.jsStart = now;
      s.jsSample = s.target;
      s.jsEnd = now + (b ? 40 + Math.random() * 20 : 3 + Math.random() * 5);
    }

    if (t === "js") {
      cardX.set(s.jsCommitted.x);
      cardY.set(s.jsCommitted.y);
    } else {
      cardX.set(s.target.x);
      cardY.set(s.target.y);
    }

    if (now < s.activeUntil || p) {
      frame.current = requestAnimationFrame(tick);
    } else {
      frame.current = 0;
      s.lastTick = 0;
    }
  }

  // Keep the loop running while there's input, and a moment after.
  function wake() {
    sim.current.activeUntil = performance.now() + 700;
    if (!frame.current) frame.current = requestAnimationFrame(tick);
  }

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // Stop when scrolled away.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setPlaying(false);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function play() {
    if (playing) {
      setPlaying(false);
      return;
    }
    sim.current.playStart = performance.now();
    setPlaying(true);
    settings.current.playing = true;
    wake();
  }

  function localPoint(event: React.PointerEvent) {
    const rect = stage.current?.getBoundingClientRect();
    return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) };
  }

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setPlaying(false);
    settings.current.playing = false;
    const p = localPoint(event);
    const s = sim.current;
    s.grab = { x: p.x - s.target.x, y: p.y - s.target.y };
    setTouching(true);
    setTarget(s.target);
  }

  function onPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const p = localPoint(event);
    const s = sim.current;
    setTarget({ x: p.x - s.grab.x, y: p.y - s.grab.y });
  }

  function onPointerUp() {
    setTouching(false);
    wake();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const step = event.shiftKey ? 48 : 16;
    const moves: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const s = sim.current;
    s.grab = { x: CARD_W / 2, y: CARD_H / 2 };
    setTarget({ x: s.target.x + move.x, y: s.target.y + move.y });
  }

  function changeThread(next: Thread) {
    setThread(next);
    settings.current.thread = next;
    const s = sim.current;
    s.jsCommitted = s.target;
    cardX.set(s.target.x);
    cardY.set(s.target.y);
  }

  const showFinger = touching || playing;

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone height={SCREEN_H} label="Photo card you can drag">
        <div ref={stage} className="absolute inset-0">
          <div
            className="absolute inset-x-4 flex items-center justify-between"
            style={{ top: PHONE_INSETS.ios.top + 4 }}
          >
            <span className="text-sm font-semibold">Photos</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums",
                busy ? "bg-rose-500/10 text-rose-700 dark:text-rose-300" : "bg-muted text-muted-foreground"
              )}
            >
              {busy ? "JS busy 40–60ms" : "JS idle"}
            </span>
          </div>

          <motion.span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-0 left-0 z-20 -mt-4 -ml-4 size-8 rounded-full border-2 border-dashed border-sky-500/80 transition-opacity duration-150",
              showFinger ? "opacity-100" : "opacity-0"
            )}
            style={{ x: fingerX, y: fingerY }}
          />

          <motion.button
            aria-label="Photo card. Drag it, or use the arrow keys."
            className="absolute top-0 left-0 z-10 flex cursor-grab touch-none flex-col gap-2 rounded-2xl bg-card p-2 shadow-(--custom-shadow) outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing"
            onKeyDown={onKeyDown}
            onLostPointerCapture={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{ x: cardX, y: cardY, width: CARD_W, height: CARD_H }}
            type="button"
          >
            <span className="block h-16 w-full rounded-lg bg-linear-to-br from-sky-300/50 via-muted to-emerald-300/40 dark:from-sky-500/25 dark:to-emerald-500/20" />
            <span className="block h-1.5 w-3/4 rounded-full bg-foreground/20" />
            <span className="block h-1.5 w-1/2 rounded-full bg-foreground/10" />
          </motion.button>
        </div>
      </Phone>

      <div className="flex flex-col gap-2.5">
        <Strip drives={thread === "js"} name="JS thread" strip={jsStrip} />
        <Strip drives={thread === "ui"} name="UI thread" strip={uiStrip} />
      </div>

      <div className="flex flex-col items-center gap-3">
        <SegmentedControl
          ariaLabel="Thread the card's position is computed on"
          onChange={changeThread}
          options={THREAD_OPTIONS}
          value={thread}
        />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            aria-pressed={busy}
            onClick={() => {
              setBusy((b) => !b);
              wake();
            }}
            variant="secondary"
          >
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full", busy ? "bg-rose-500" : "bg-muted-foreground/40")}
            />
            Busy JS thread
          </Button>
          <Button aria-pressed={playing} className="min-w-22" onClick={play} variant="secondary">
            {playing ? (
              <PauseIcon aria-hidden="true" weight="fill" />
            ) : (
              <PlayIcon aria-hidden="true" weight="fill" />
            )}
            {playing ? "Pause" : "Play"}
          </Button>
        </div>
      </div>

      <p className="max-w-sm text-center text-xs text-muted-foreground">
        Drag the card fast, or press Play. The busy JS thread is simulated, so
        the page itself stays free.
      </p>
    </Demo>
  );
}

/* FrameBudgetDemo: one frame's work against three refresh rates. The frame
   starts on a vsync; if it isn't done by the next one, the screen shows the
   old image again and the new one lands a whole refresh later. */

const RATES = [60, 90, 120] as const;
const TIMELINE_MS = 42;

function lateness(work: number, hz: number) {
  const budget = 1000 / hz;
  const intervals = Math.max(1, Math.ceil(work / budget - 1e-9));
  return { budget, dropped: intervals - 1, shownAt: intervals * budget };
}

function fmt(ms: number) {
  return ms.toFixed(1).replace(/\.0$/, "");
}

function RateRow({ hz, work }: { hz: number; work: number }) {
  const { budget, dropped, shownAt } = lateness(work, hz);
  const pct = (ms: number) => `${(Math.min(ms, TIMELINE_MS) / TIMELINE_MS) * 100}%`;
  const ticks = Array.from({ length: Math.floor(TIMELINE_MS / budget) }, (_, i) => (i + 1) * budget);
  const late = dropped > 0;

  return (
    <div className="grid grid-cols-[3.25rem_1fr_5.5rem] items-center gap-3">
      <div className="flex flex-col text-right">
        <span className="text-xs font-medium tabular-nums">{hz} Hz</span>
        <span className="text-[11px] tabular-nums text-muted-foreground">{fmt(budget)} ms</span>
      </div>

      <div aria-hidden="true" className="relative h-8 rounded-md bg-muted dark:bg-muted/60">
        {/* Vsyncs; the first one is this frame's deadline. */}
        {ticks.map((t, i) => (
          <span
            key={t}
            className={cn(
              "absolute inset-y-0 border-l",
              i === 0 ? "border-dashed border-sky-500/80" : "border-foreground/15"
            )}
            style={{ left: pct(t) }}
          />
        ))}
        {/* The work */}
        <span
          className={cn(
            "absolute top-2 bottom-2 left-0 rounded-r-sm transition-[width,background-color] duration-150 ease-out motion-reduce:transition-none",
            late ? "bg-rose-500/70" : "bg-foreground/60"
          )}
          style={{ width: pct(work) }}
        />
        {/* When the new image reaches the screen */}
        <span
          className={cn(
            "absolute top-1/2 -mt-1.5 -ml-1.5 size-3 rounded-full border-2 border-background transition-[left] duration-150 ease-out motion-reduce:transition-none",
            late ? "bg-rose-500" : "bg-emerald-500"
          )}
          style={{ left: pct(shownAt) }}
        />
      </div>

      <div className="flex flex-col text-left">
        <span
          className={cn(
            "text-xs font-medium",
            late ? "text-destructive" : "text-emerald-700 dark:text-emerald-400"
          )}
        >
          {late ? `${dropped} frame${dropped > 1 ? "s" : ""} late` : "On time"}
        </span>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {late ? `+${fmt(shownAt - budget)} ms` : `${fmt(budget - work)} ms spare`}
        </span>
      </div>
    </div>
  );
}

export function FrameBudgetDemo() {
  const [work, setWork] = useState(12);
  const lateAt = RATES.filter((hz) => lateness(work, hz).dropped > 0);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="flex w-full max-w-md flex-col gap-3">
        {RATES.map((hz) => (
          <RateRow key={hz} hz={hz} work={work} />
        ))}
        <div
          aria-hidden="true"
          className="grid grid-cols-[3.25rem_1fr_5.5rem] gap-3 text-[11px] text-muted-foreground"
        >
          <span />
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5">
              <span className="h-3 border-l border-dashed border-sky-500/80" />
              Deadline
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 border-l border-foreground/25" />
              Next vsyncs
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground" />
              On screen
            </span>
          </span>
        </div>
      </div>

      <label className="grid w-full max-w-xs gap-2.5">
        <span className="flex items-center justify-between text-xs text-muted-foreground">
          This frame's work
          <span className="tabular-nums text-foreground">{work} ms</span>
        </span>
        <Slider
          aria-label="Work in this frame, in milliseconds"
          max={40}
          min={2}
          onValueChange={(value) => setWork(Array.isArray(value) ? value[0] : (value as number))}
          step={1}
          value={[work]}
        />
      </label>

      <p className="max-w-sm text-center text-xs text-muted-foreground" aria-live="polite">
        {lateAt.length === 0
          ? `A ${work} ms frame is on time at every rate.`
          : lateAt.length === RATES.length
            ? `A ${work} ms frame is late at every rate.`
            : `A ${work} ms frame is on time at ${RATES.filter((hz) => !lateAt.includes(hz)).join(" and ")} Hz and late at ${lateAt.join(" and ")} Hz.`}
      </p>
    </Demo>
  );
}
