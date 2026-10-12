"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import {
  HapticRing,
  Phone,
  PHONE_INSETS,
  vibrate,
  type HapticKind,
} from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import { projectMomentum, springFromFeel } from "@/lib/spring";

/* ------------------------------------------------------------------ */
/* A tiny event bus so haptic events re-render only the ring and log,  */
/* never the wheel that follows the finger.                            */
/* ------------------------------------------------------------------ */

type TickKind = "selection" | "impact" | "buzz";
type TickEvent = { t: number; kind: TickKind };
type Listener = (event: TickEvent) => void;

function createBus() {
  const listeners = new Set<Listener>();
  return {
    emit(kind: TickKind) {
      const event = { t: performance.now(), kind };
      listeners.forEach((listener) => listener(event));
    },
    on(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

type Bus = ReturnType<typeof createBus>;

/* ------------------------------------------------------------------ */
/* HapticPickerDemo                                                    */
/* ------------------------------------------------------------------ */

type Mode = "frame" | "none" | "value";

const MODE_OPTIONS = [
  { value: "frame", label: "Every frame", icon: WRONG_ICON },
  { value: "none", label: "None", icon: WRONG_ICON },
  { value: "value", label: "Per value", icon: RIGHT_ICON },
] as const;

const ROW = 30;
const VISIBLE = 5;
const WHEEL_H = ROW * VISIBLE;
const MAX = 30;
const MIN_Y = -MAX * ROW;
const SETTLE = springFromFeel(0.5, 0);

// iOS-style rubber band past the ends (see Momentum).
function rubberBand(over: number, size: number, c = 0.55) {
  return (1 - 1 / ((Math.abs(over) * c) / size + 1)) * size * Math.sign(over);
}

function clampIndex(y: number) {
  return Math.min(MAX, Math.max(0, Math.round(-y / ROW)));
}

function TickRing({ bus }: { bus: Bus }) {
  const [pulse, setPulse] = useState({ n: 0, kind: "selection" as HapticKind });
  const buzz = useMotionValue(0);

  useEffect(
    () =>
      bus.on((event) => {
        if (event.kind === "buzz") {
          // A ring per frame: drive it with a motion value, not state.
          buzz.set(1);
          animate(buzz, 0, { duration: 0.12 });
          return;
        }
        setPulse((p) => ({
          n: p.n + 1,
          kind: event.kind === "impact" ? "medium" : "selection",
        }));
      }),
    [bus, buzz]
  );

  return (
    <>
      <HapticRing kind={pulse.kind} pulse={pulse.n} x={206} y={0} />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 left-[190px] size-8 rounded-full border-2 border-rose-500/70"
        style={{ opacity: buzz }}
      />
    </>
  );
}

const WINDOW_MS = 2500;

function TickLog({ bus }: { bus: Bus }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const summary = useRef<HTMLSpanElement>(null);
  const events = useRef<TickEvent[]>([]);
  const frame = useRef(0);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    function draw() {
      if (!el || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (el.width !== w * dpr) {
        el.width = w * dpr;
        el.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const fg = getComputedStyle(el).color;
      const now = performance.now();
      events.current = events.current.filter((e) => now - e.t < WINDOW_MS);

      ctx.globalAlpha = 0.25;
      ctx.fillStyle = fg;
      ctx.fillRect(0, h - 1, w, 1);
      ctx.globalAlpha = 1;

      let ticks = 0;
      let impacts = 0;
      let buzzes = 0;
      for (const e of events.current) {
        const x = w - ((now - e.t) / WINDOW_MS) * w;
        if (e.kind === "buzz") {
          buzzes++;
          ctx.fillStyle = "rgb(244 63 94 / 0.8)";
          ctx.fillRect(x, h - 10, 1, 9);
        } else if (e.kind === "selection") {
          ticks++;
          ctx.fillStyle = "rgb(14 165 233)";
          ctx.fillRect(x - 0.75, h - 16, 1.5, 15);
        } else {
          impacts++;
          ctx.fillStyle = fg;
          ctx.fillRect(x - 1.5, h - 26, 3, 25);
        }
      }

      if (summary.current) {
        const parts = [];
        if (buzzes) parts.push(`${buzzes} buzzes`);
        if (ticks) parts.push(`${ticks} ${ticks === 1 ? "tick" : "ticks"}`);
        if (impacts) parts.push(`${impacts} ${impacts === 1 ? "impact" : "impacts"}`);
        summary.current.textContent = parts.length
          ? `Last 2.5 s: ${parts.join(", ")}`
          : "Haptics, last 2.5 s";
      }

      frame.current = events.current.length ? requestAnimationFrame(draw) : 0;
    }

    draw();
    const off = bus.on((event) => {
      events.current.push(event);
      if (!frame.current) frame.current = requestAnimationFrame(draw);
    });
    return () => {
      off();
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [bus]);

  return (
    <div className="flex w-[260px] max-w-full flex-col gap-1.5">
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="h-7 w-full text-foreground"
      />
      <span
        ref={summary}
        aria-live="off"
        className="text-[11px] tabular-nums text-muted-foreground"
      >
        Haptics, last 2.5 s
      </span>
    </div>
  );
}

export function HapticPickerDemo() {
  const [mode, setMode] = useState<Mode>("frame");
  const [value, setValue] = useState(10);
  const [bus] = useState(createBus);
  const reduced = useReducedMotion();

  const y = useMotionValue(-10 * ROW);
  const modeRef = useRef(mode);
  const lastIndex = useRef(10);
  const lastY = useRef(-10 * ROW);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const drag = useRef<{
    id: number;
    startY: number;
    startOffset: number;
    moved: boolean;
    samples: { t: number; y: number }[];
  } | null>(null);
  const wheel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Haptics come from the value, not the gesture: one per index crossed.
  useEffect(
    () =>
      y.on("change", (v) => {
        const index = clampIndex(v);
        const moved = Math.abs(v - lastY.current);
        lastY.current = v;
        const m = modeRef.current;
        if (m === "frame" && moved > 0.5) {
          bus.emit("buzz");
          vibrate("light");
        }
        if (index !== lastIndex.current) {
          lastIndex.current = index;
          setValue(index);
          if (m === "value") {
            const end = index === 0 || index === MAX;
            bus.emit(end ? "impact" : "selection");
            vibrate(end ? "medium" : "selection");
          }
        }
      }),
    [y, bus]
  );

  function settleTo(index: number, velocity = 0) {
    anim.current?.stop();
    const target = -Math.min(MAX, Math.max(0, index)) * ROW;
    anim.current = reduced
      ? animate(y, target, { duration: 0.2, ease: [0.23, 1, 0.32, 1] })
      : animate(y, target, { type: "spring", ...SETTLE, velocity });
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    anim.current?.stop();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: event.pointerId,
      startY: event.clientY,
      startOffset: y.get(),
      moved: false,
      samples: [{ t: performance.now(), y: event.clientY }],
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const dy = event.clientY - d.startY;
    if (Math.abs(dy) > 4) d.moved = true;
    if (!d.moved) return;
    const raw = d.startOffset + dy;
    const next =
      raw > 0
        ? rubberBand(raw, WHEEL_H)
        : raw < MIN_Y
          ? MIN_Y + rubberBand(raw - MIN_Y, WHEEL_H)
          : raw;
    y.set(next);
    const now = performance.now();
    d.samples.push({ t: now, y: event.clientY });
    d.samples = d.samples.filter((s) => now - s.t < 100);
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    drag.current = null;

    if (!d.moved) {
      // A tap on a row picks it.
      const rect = event.currentTarget.getBoundingClientRect();
      const offset = Math.round((event.clientY - rect.top - WHEEL_H / 2) / ROW);
      settleTo(clampIndex(y.get()) + offset);
      return;
    }

    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const dt = (last.t - first.t) / 1000;
    const velocity = dt > 0 ? (last.y - first.y) / dt : 0;
    const aim = y.get() + (reduced ? 0 : projectMomentum(velocity));
    settleTo(clampIndex(aim), velocity);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const current = clampIndex(y.get());
    const step: Record<string, number> = {
      ArrowUp: -1,
      ArrowDown: 1,
      PageUp: -5,
      PageDown: 5,
    };
    if (event.key in step) settleTo(current + step[event.key]);
    else if (event.key === "Home") settleTo(0);
    else if (event.key === "End") settleTo(MAX);
    else return;
    event.preventDefault();
  }

  function changeMode(next: Mode) {
    setMode(next);
  }

  const values = Array.from({ length: MAX + 1 }, (_, i) => i);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone height={360} label="Rest timer picker on iPhone" platform="ios">
        <div
          className="flex h-full flex-col px-4"
          style={{ paddingTop: PHONE_INSETS.ios.top + 10 }}
        >
          <span className="text-[19px] font-bold tracking-tight">Rest timer</span>
          <span className="mt-0.5 text-[11px] text-muted-foreground">
            Between sets
          </span>

          <div className="relative mt-6">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 rounded-lg bg-muted dark:bg-muted/70"
              style={{ top: WHEEL_H / 2 - ROW / 2, height: ROW }}
            />
            <div
              ref={wheel}
              aria-label="Rest minutes"
              aria-valuemax={MAX}
              aria-valuemin={0}
              aria-valuenow={value}
              aria-valuetext={`${value} ${value === 1 ? "minute" : "minutes"}`}
              className="relative cursor-grab touch-none overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing"
              onKeyDown={onKeyDown}
              onPointerCancel={onPointerUp}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              role="slider"
              style={{
                height: WHEEL_H,
                maskImage:
                  "linear-gradient(transparent, black 30%, black 70%, transparent)",
              }}
              tabIndex={0}
            >
              <motion.div aria-hidden="true" className="absolute inset-x-0 top-0" style={{ y }}>
                {values.map((v) => (
                  <div
                    key={v}
                    className="absolute inset-x-0 flex items-center justify-center pr-10 text-[17px] tabular-nums"
                    style={{ top: WHEEL_H / 2 - ROW / 2 + v * ROW, height: ROW }}
                  >
                    {v}
                  </div>
                ))}
              </motion.div>
            </div>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 translate-x-3 text-[13px] font-medium"
              style={{ top: WHEEL_H / 2 - 9 }}
            >
              min
            </span>
            <div className="absolute inset-x-0" style={{ top: WHEEL_H / 2 }}>
              <TickRing bus={bus} />
            </div>
          </div>

          <div className="mt-auto mb-9 flex h-8 items-center justify-center rounded-full bg-foreground text-[12px] font-medium text-background">
            Start
          </div>
        </div>
      </Phone>

      <TickLog bus={bus} />

      <SegmentedControl
        ariaLabel="When the picker plays haptics"
        onChange={changeMode}
        options={MODE_OPTIONS}
        value={mode}
      />
      <p className="max-w-sm text-center text-xs text-muted-foreground">
        Fling the wheel hard into an end, then scrub it slowly. Rings show each
        haptic; Android Chrome also vibrates.
      </p>
    </Demo>
  );
}

/* ------------------------------------------------------------------ */
/* HapticVocabularyDemo                                                */
/* ------------------------------------------------------------------ */

// Mirrors the patterns `vibrate()` plays in phone.tsx, in ms on/off.
const PATTERNS: Record<HapticKind, number[]> = {
  selection: [6],
  light: [10],
  medium: [16],
  heavy: [24],
  success: [12, 60, 12],
  warning: [16, 80, 16],
  error: [16, 50, 16, 50, 16],
};

const STRENGTH: Record<HapticKind, number> = {
  selection: 0.3,
  light: 0.45,
  medium: 0.7,
  heavy: 1,
  success: 0.65,
  warning: 0.8,
  error: 0.8,
};

const VOCABULARY: { kind: HapticKind; name: string; use: string; group: string }[] = [
  { kind: "selection", name: "Tick", use: "A picker value changes", group: "Selection" },
  { kind: "light", name: "Light", use: "A card snaps to the grid", group: "Impact" },
  { kind: "medium", name: "Medium", use: "A sheet lands on a detent", group: "Impact" },
  { kind: "heavy", name: "Heavy", use: "A file drops into a folder", group: "Impact" },
  { kind: "success", name: "Success", use: "Payment sent", group: "Notification" },
  { kind: "warning", name: "Warning", use: "Saved, but you're offline", group: "Notification" },
  { kind: "error", name: "Error", use: "Wrong passcode", group: "Notification" },
];

const WAVE_W = 96;
const WAVE_H = 28;
const WAVE_MS = 200;

function Waveform({ kind, playing }: { kind: HapticKind; playing: number }) {
  const pattern = PATTERNS[kind];
  const scale = WAVE_W / WAVE_MS;
  const bars: { x: number; w: number; delay: number }[] = [];
  let t = 0;
  pattern.forEach((ms, i) => {
    if (i % 2 === 0) bars.push({ x: t * scale, w: Math.max(3, ms * scale), delay: t });
    t += ms;
  });
  const h = Math.max(6, STRENGTH[kind] * WAVE_H);
  const tone =
    kind === "error" || kind === "warning"
      ? "fill-rose-500"
      : kind === "success"
        ? "fill-emerald-500"
        : "fill-sky-500";

  return (
    <svg
      aria-hidden="true"
      className="overflow-visible"
      height={WAVE_H}
      viewBox={`0 0 ${WAVE_W} ${WAVE_H}`}
      width={WAVE_W}
    >
      <rect
        className="fill-muted-foreground/25"
        height={1}
        width={WAVE_W}
        x={0}
        y={WAVE_H / 2 - 0.5}
      />
      {bars.map((bar, i) => (
        <g key={i}>
          <rect
            className="fill-muted-foreground/50"
            height={h}
            rx={1.5}
            width={bar.w}
            x={bar.x + 2}
            y={(WAVE_H - h) / 2}
          />
          {playing > 0 ? (
            <motion.rect
              key={playing}
              animate={{ opacity: [0, 1, 0] }}
              className={tone}
              height={h}
              initial={{ opacity: 0 }}
              rx={1.5}
              transition={{ duration: 0.45, delay: (bar.delay / 1000) * 3, times: [0, 0.15, 1] }}
              width={bar.w}
              x={bar.x + 2}
              y={(WAVE_H - h) / 2}
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}

function VocabularyCard({
  kind,
  name,
  use,
  group,
}: (typeof VOCABULARY)[number]) {
  const [pulse, setPulse] = useState(0);
  const [at, setAt] = useState({ x: 0, y: 0 });

  function play(event: React.MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    // Keyboard clicks have no pointer position; ring from the center.
    const fromPointer = event.detail > 0;
    setAt({
      x: fromPointer ? event.clientX - rect.left : rect.width / 2,
      y: fromPointer ? event.clientY - rect.top : rect.height / 2,
    });
    setPulse((p) => p + 1);
    vibrate(kind);
  }

  return (
    <button
      aria-label={`Play the ${group === "Impact" ? `${name.toLowerCase()} impact` : name.toLowerCase()} haptic. For example: ${use}.`}
      className="relative flex cursor-pointer flex-col items-start gap-2 rounded-xl bg-card p-3 text-left shadow-(--custom-shadow) transition-transform duration-150 ease-snappy outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.97] motion-reduce:transition-none dark:bg-muted/40"
      onClick={play}
      type="button"
    >
      <span className="flex flex-col">
        <span className="text-[10px] text-muted-foreground">{group}</span>
        <span className="text-[13px] font-medium">{name}</span>
      </span>
      <Waveform kind={kind} playing={pulse} />
      <span className="text-[11px] leading-snug text-muted-foreground">{use}</span>
      <HapticRing kind={kind} pulse={pulse} x={at.x} y={at.y} />
    </button>
  );
}

export function HapticVocabularyDemo() {
  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="grid w-full max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4">
        {VOCABULARY.map((item) => (
          <VocabularyCard key={item.kind} {...item} />
        ))}
        <div className="flex flex-col items-start gap-2 rounded-xl p-3 shadow-[inset_0_0_0_1px_var(--color-border)]">
          <span className="flex flex-col">
            <span className="text-[10px] text-muted-foreground">Default</span>
            <span className="text-[13px] font-medium">Nothing</span>
          </span>
          <svg aria-hidden="true" height={WAVE_H} viewBox={`0 0 ${WAVE_W} ${WAVE_H}`} width={WAVE_W}>
            <rect className="fill-muted-foreground/25" height={1} width={WAVE_W} x={0} y={WAVE_H / 2 - 0.5} />
          </svg>
          <span className="text-[11px] leading-snug text-muted-foreground">
            Most taps and every scroll
          </span>
        </div>
      </div>
      <p className="max-w-sm text-center text-xs text-muted-foreground">
        Tap each one. On an Android phone in Chrome you feel it; an iPhone or a
        laptop can't vibrate from a web page, so watch the ring.
      </p>
    </Demo>
  );
}
