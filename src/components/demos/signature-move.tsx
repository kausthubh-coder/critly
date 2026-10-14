"use client";

import {
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  NotebookIcon,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

// Tidewell, a fictional tide-times app for sea swimmers. Its signature move
// is the tide curve, taken from the one thing the app is about.

type Mode = "nowhere" | "everywhere" | "corner" | "pauses";

const MODES = [
  { value: "nowhere", label: "Nowhere" },
  { value: "everywhere", label: "Everywhere" },
  { value: "corner", label: "Corner" },
  { value: "pauses", label: "Pauses" },
] as const;

const NOTES: Record<Mode, string> = {
  nowhere: "No move. Tidewell could be any weather app.",
  everywhere:
    "On every button, row and divider. It turns into texture and the eye stops reading it.",
  corner:
    "A small mark beside each title. It's there, but nobody would describe it to a friend.",
  pauses:
    "Full size on the first screen, the empty log and the finished swim. The list you use daily stays plain.",
};

const C = {
  ground: "oklch(0.25 0.045 228)",
  panel: "oklch(0.29 0.05 226)",
  line: "oklch(0.4 0.05 222)",
  text: "oklch(0.97 0.01 200)",
  muted: "oklch(0.82 0.03 205)",
  tide: "oklch(0.84 0.11 182)",
  tideFill: "oklch(0.84 0.11 182 / 0.16)",
  onTide: "oklch(0.24 0.045 228)",
};

/** A sine path across a w x h box: `cycles` waves, centered vertically. */
function wave(w: number, h: number, cycles: number, amp = 0.4, phase = 0) {
  const points: string[] = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w;
    const y =
      h / 2 - Math.sin((i / n) * cycles * Math.PI * 2 + phase) * (h * amp);
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(" ");
}

function Glyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("h-2 w-4 shrink-0", className)}
      fill="none"
      viewBox="0 0 16 8"
    >
      <path d={wave(16, 8, 1)} stroke={C.tide} strokeWidth="1.5" />
    </svg>
  );
}

function WavyRule() {
  return (
    <svg
      aria-hidden="true"
      className="h-1.5 w-full"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 120 6"
    >
      <path
        d={wave(120, 6, 10, 0.3)}
        stroke={C.line}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Panel({
  title,
  mode,
  children,
  className,
}: {
  title: string;
  mode: Mode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-64 flex-col overflow-hidden rounded-lg p-4",
        className
      )}
      style={{ background: C.panel }}
    >
      {mode === "everywhere" ? (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full opacity-60"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          {[18, 38, 58, 78, 98].map((y) => (
            <path
              key={y}
              d={wave(100, 8, 3, 0.4)}
              stroke={C.line}
              strokeWidth="1"
              transform={`translate(0 ${y - 4})`}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      ) : null}
      <div className="relative flex items-center gap-1.5">
        {mode === "corner" || mode === "everywhere" ? <Glyph /> : null}
        <span className="text-[11px] font-medium" style={{ color: C.muted }}>
          {title}
        </span>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

function Action({ mode, children }: { mode: Mode; children: string }) {
  return (
    <span
      className="relative inline-flex h-8 w-fit items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold"
      style={{ background: C.tide, color: C.onTide }}
    >
      {mode === "everywhere" ? (
        <svg aria-hidden="true" className="h-2 w-4" fill="none" viewBox="0 0 16 8">
          <path d={wave(16, 8, 1)} stroke={C.onTide} strokeWidth="1.5" />
        </svg>
      ) : null}
      {children}
    </span>
  );
}

const WEEK = [
  { day: "Mon", time: "14:32", height: "5.8 m" },
  { day: "Tue", time: "15:10", height: "5.5 m" },
  { day: "Wed", time: "15:51", height: "5.1 m" },
  { day: "Thu", time: "16:38", height: "4.7 m" },
];

export function SignatureMoveDemo() {
  const [mode, setMode] = useState<Mode>("nowhere");
  const [squint, setSquint] = useState(false);
  const reduceMotion = useReducedMotion();

  const big = mode === "pauses" || mode === "everywhere";

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div
        className="w-full max-w-xl rounded-xl p-2 shadow-(--custom-shadow) transition-[filter] duration-300 motion-reduce:transition-none"
        style={{
          background: C.ground,
          color: C.text,
          filter: squint ? "blur(5px)" : "none",
        }}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {/* First screen */}
          <Panel mode={mode} title="Tidewell · Porthmeor">
            <p className="mt-3 text-[11px]" style={{ color: C.muted }}>
              High water today
            </p>
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              14:32
            </p>
            <p className="mt-1 text-xs" style={{ color: C.muted }}>
              Swim window 13:40 to 15:20
            </p>
            {big ? (
              <svg
                aria-hidden="true"
                className="absolute inset-x-[-16px] bottom-11 h-16 w-[calc(100%+32px)]"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 200 80"
              >
                <path
                  d={`${wave(200, 80, 1.15, 0.38, -0.6)} L200,80 L0,80 Z`}
                  fill={C.tideFill}
                />
                <path
                  d={wave(200, 80, 1.15, 0.38, -0.6)}
                  stroke={C.tide}
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            ) : null}
            <div className="mt-auto">
              <Action mode={mode}>Plan a swim</Action>
            </div>
          </Panel>

          {/* The everyday list: the move stays out of it unless forced. */}
          <Panel mode={mode} title="This week">
            <ul className="mt-2 flex flex-col">
              {WEEK.map((row, i) => (
                <li key={row.day}>
                  {i > 0 ? (
                    mode === "everywhere" ? (
                      <WavyRule />
                    ) : (
                      <div className="h-px" style={{ background: C.line }} />
                    )
                  ) : null}
                  <div className="flex h-9 items-center gap-3 text-xs">
                    <span className="w-8" style={{ color: C.muted }}>
                      {row.day}
                    </span>
                    {mode === "everywhere" ? <Glyph className="w-6" /> : null}
                    <span className="font-medium tabular-nums">{row.time}</span>
                    <span
                      className="ml-auto tabular-nums"
                      style={{ color: C.muted }}
                    >
                      {row.height}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <Action mode={mode}>Set a reminder</Action>
            </div>
          </Panel>

          {/* Empty state */}
          <Panel mode={mode} title="Swim log">
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              {big ? (
                <svg
                  aria-hidden="true"
                  className="h-12 w-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 200 48"
                >
                  <path
                    d={`${wave(200, 20, 2, 0.15)} L200,48 L0,48 Z`}
                    fill={C.tideFill}
                    transform="translate(0 26)"
                  />
                  <path
                    d={wave(200, 20, 2, 0.15)}
                    stroke={C.tide}
                    strokeWidth="3"
                    transform="translate(0 26)"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              ) : (
                <NotebookIcon
                  aria-hidden="true"
                  className="size-7"
                  style={{ color: C.muted }}
                />
              )}
              <p className="text-sm font-semibold">
                {big ? "Low tide in here." : "No swims yet"}
              </p>
              <p className="max-w-52 text-xs" style={{ color: C.muted }}>
                {big
                  ? "Log your first swim when the water comes in."
                  : "Your logged swims will appear here."}
              </p>
            </div>
          </Panel>

          {/* Success moment */}
          <Panel mode={mode} title="Swim logged">
            {big ? (
              <motion.svg
                key={mode}
                aria-hidden="true"
                className="absolute inset-x-[-16px] -bottom-4 h-44 w-[calc(100%+32px)]"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 200 176"
                initial={reduceMotion ? false : { y: 90 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
              >
                <path
                  d={`${wave(200, 24, 1.5, 0.3)} L200,176 L0,176 Z`}
                  fill={C.tideFill}
                />
                <path
                  d={wave(200, 24, 1.5, 0.3)}
                  stroke={C.tide}
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
              </motion.svg>
            ) : null}
            <div className="relative flex flex-1 flex-col items-center justify-center gap-1 text-center">
              {big ? null : (
                <CheckCircleIcon
                  aria-hidden="true"
                  className="mb-1 size-7"
                  style={{ color: C.tide }}
                  weight="fill"
                />
              )}
              <p className="text-2xl font-semibold tabular-nums">1.2 km</p>
              <p className="text-xs" style={{ color: C.muted }}>
                Logged at 14:05, an hour before high water.
              </p>
            </div>
          </Panel>
        </div>
      </div>

      <p
        aria-live="polite"
        className="min-h-12 w-full max-w-xl text-center text-sm leading-6 text-muted-foreground"
      >
        {NOTES[mode]}
      </p>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <SegmentedControl
          ariaLabel="Where the tide curve appears"
          onChange={setMode}
          options={MODES}
          value={mode}
        />
        <button
          aria-pressed={squint}
          className={cn(
            "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 max-sm:h-11",
            squint
              ? "bg-primary/7 text-foreground shadow-(--custom-shadow) dark:bg-muted"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setSquint((value) => !value)}
          type="button"
        >
          {squint ? (
            <EyeSlashIcon aria-hidden="true" className="size-4" />
          ) : (
            <EyeIcon aria-hidden="true" className="size-4" />
          )}
          Squint
        </button>
      </div>
    </Demo>
  );
}
