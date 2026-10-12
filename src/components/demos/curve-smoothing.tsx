"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

type Point = { x: number; y: number };
/** One cubic Bezier segment: start, two control points, end. */
type Segment = [Point, Point, Point, Point];

/*
 * Every curve is built in data space (x = index, y = value) as a list of
 * cubic segments, the same shapes d3-shape draws.
 */

function linear(points: Point[]): Segment[] {
  return points.slice(1).map((b, i) => {
    const a = points[i];
    return [
      a,
      { x: a.x + (b.x - a.x) / 3, y: a.y + (b.y - a.y) / 3 },
      { x: a.x + ((b.x - a.x) * 2) / 3, y: a.y + ((b.y - a.y) * 2) / 3 },
      b,
    ];
  });
}

/* Uniform Catmull-Rom, the same as d3.curveCardinal with tension 0. */
function catmullRom(points: Point[]): Segment[] {
  const last = points.length - 1;
  return points.slice(1).map((p2, index) => {
    const i = index + 1;
    const p0 = points[Math.max(i - 2, 0)];
    const p1 = points[i - 1];
    const p3 = points[Math.min(i + 1, last)];
    return [
      p1,
      { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p2,
    ];
  });
}

/* Cubic B-spline with the end points tripled, like d3.curveBasis. */
function basis(points: Point[]): Segment[] {
  const first = points[0];
  const last = points[points.length - 1];
  const q = [first, first, ...points, last, last];
  const segments: Segment[] = [];
  for (let i = 0; i + 3 < q.length; i++) {
    const [a, b, c, d] = q.slice(i, i + 4);
    segments.push([
      { x: (a.x + 4 * b.x + c.x) / 6, y: (a.y + 4 * b.y + c.y) / 6 },
      { x: (2 * b.x + c.x) / 3, y: (2 * b.y + c.y) / 3 },
      { x: (b.x + 2 * c.x) / 3, y: (b.y + 2 * c.y) / 3 },
      { x: (b.x + 4 * c.x + d.x) / 6, y: (b.y + 4 * c.y + d.y) / 6 },
    ]);
  }
  return segments;
}

const sign = (value: number) => (value < 0 ? -1 : 1);

/* Steffen's monotone cubic, the method behind d3.curveMonotoneX. */
function monotone(points: Point[]): Segment[] {
  const n = points.length;
  const h: number[] = [];
  const s: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    h[i] = points[i + 1].x - points[i].x;
    s[i] = (points[i + 1].y - points[i].y) / h[i];
  }

  const m: number[] = [];
  for (let i = 1; i < n - 1; i++) {
    const p = (s[i - 1] * h[i] + s[i] * h[i - 1]) / (h[i - 1] + h[i]);
    m[i] =
      (sign(s[i - 1]) + sign(s[i])) *
        Math.min(Math.abs(s[i - 1]), Math.abs(s[i]), Math.abs(p) / 2) || 0;
  }
  m[0] = (3 * s[0] - m[1]) / 2;
  m[n - 1] = (3 * s[n - 2] - m[n - 2]) / 2;

  return points.slice(1).map((b, index) => {
    const a = points[index];
    const d = (b.x - a.x) / 3;
    return [
      a,
      { x: a.x + d, y: a.y + d * m[index] },
      { x: b.x - d, y: b.y - d * m[index + 1] },
      b,
    ];
  });
}

const CURVES = { linear, catmullRom, basis, monotone } as const;
type Curve = keyof typeof CURVES;

function pointAt([a, c1, c2, b]: Segment, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
  };
}

/*
 * Samples a fixed number of points along any curve. Every path then has the
 * same commands, so switching curves can morph one line into the other.
 */
const SAMPLES = 240;

function sample(segments: Segment[]) {
  return Array.from({ length: SAMPLES + 1 }, (_, k) => {
    const u = (k / SAMPLES) * segments.length;
    const index = Math.min(Math.floor(u), segments.length - 1);
    return pointAt(segments[index], u - index);
  });
}

function extent(points: Point[]) {
  const ys = points.map((p) => p.y);
  return { min: Math.min(...ys), max: Math.max(...ys) };
}

/* Chart geometry */

const PAD_X = 12;
const PAD_Y = 12;

type Frame = {
  width: number;
  height: number;
  /** Value range mapped to the plot height. */
  domain: [number, number];
  count: number;
};

function scale(frame: Frame) {
  const [lo, hi] = frame.domain;
  return {
    x: (i: number) =>
      PAD_X + (i / (frame.count - 1)) * (frame.width - PAD_X * 2),
    y: (v: number) =>
      PAD_Y + (1 - (v - lo) / (hi - lo)) * (frame.height - PAD_Y * 2),
  };
}

function toPath(points: Point[], frame: Frame) {
  const s = scale(frame);
  return points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${s.x(p.x).toFixed(2)},${s.y(p.y).toFixed(2)}`
    )
    .join(" ");
}

function Dots({ values, frame }: { values: readonly number[]; frame: Frame }) {
  const s = scale(frame);
  return values.map((value, i) => (
    <circle
      key={i}
      className="fill-card stroke-foreground"
      cx={s.x(i)}
      cy={s.y(value)}
      r={3}
      strokeWidth={1.5}
    />
  ));
}

function Guide({
  frame,
  value,
  label,
  align = "end",
}: {
  frame: Frame;
  value: number;
  label: string;
  align?: "start" | "end";
}) {
  const y = scale(frame).y(value);
  return (
    <g aria-hidden="true">
      <line
        className="stroke-sky-300 dark:stroke-sky-800"
        strokeDasharray="3 3"
        x1={PAD_X - 6}
        x2={frame.width - PAD_X + 6}
        y1={y}
        y2={y}
      />
      <text
        className="fill-sky-400 dark:fill-sky-500"
        fontSize={9}
        x={align === "end" ? frame.width - PAD_X + 6 : PAD_X - 6}
        y={y - 4}
        textAnchor={align}
      >
        {label}
      </text>
    </g>
  );
}

const lineProps = {
  className: "text-foreground",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 2,
} as const;

/* Same points, four interpolations, and how high each line actually goes. */

const SERIES = [30, 34, 31, 62, 28, 30, 88, 90, 26, 40, 34, 48] as const;
const SERIES_POINTS = SERIES.map((y, x) => ({ x, y }));
const DATA_PEAK = Math.max(...SERIES);

const FRAME: Frame = {
  width: 320,
  height: 150,
  domain: [18, 100],
  count: SERIES.length,
};

const LINES = Object.fromEntries(
  (Object.keys(CURVES) as Curve[]).map((curve) => {
    const points = sample(CURVES[curve](SERIES_POINTS));
    return [curve, { d: toPath(points, FRAME), peak: extent(points).max }];
  })
) as Record<Curve, { d: string; peak: number }>;

const CURVE_OPTIONS = [
  { value: "linear", label: "Linear" },
  { value: "catmullRom", label: "Catmull-Rom" },
  { value: "basis", label: "Basis" },
  { value: "monotone", label: "Monotone" },
] as const;

export function CurveSmoothingDemo() {
  const [curve, setCurve] = useState<Curve>("catmullRom");
  const reduced = useReducedMotion();
  const line = LINES[curve];
  const peak = Math.round(line.peak);
  const off = peak - DATA_PEAK;

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="w-full max-w-md rounded-xl bg-card shadow-(--custom-shadow)">
        <svg
          aria-hidden="true"
          className="h-auto w-full px-2 pt-3"
          viewBox={`0 0 ${FRAME.width} ${FRAME.height}`}
        >
          <Guide frame={FRAME} label="Highest value" value={DATA_PEAK} />
          <motion.path
            {...lineProps}
            animate={{ d: line.d }}
            initial={false}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
            }
          />
          <Dots frame={FRAME} values={SERIES} />
        </svg>
        <div className="flex justify-between gap-4 border-t border-[#E7E7E7] px-4 py-2.5 text-xs dark:border-[#1E1E1E]">
          <span className="text-muted-foreground">
            Highest value{" "}
            <span className="text-foreground tabular-nums">{DATA_PEAK}</span>
          </span>
          <span className="text-muted-foreground" aria-live="polite">
            Line reaches{" "}
            <span
              className={cn(
                "tabular-nums",
                off === 0
                  ? "text-foreground"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {peak}
              <span className="ml-1.5 inline-block w-6">
                {off === 0 ? "" : off > 0 ? `+${off}` : `${off}`}
              </span>
            </span>
          </span>
        </div>
      </div>
      <SegmentedControl
        ariaLabel="Curve type"
        onChange={setCurve}
        options={CURVE_OPTIONS}
        value={curve}
      />
    </Demo>
  );
}

/* Bounded data: anything drawn outside 0-100% is invented. */

const CPU = [30, 8, 0, 0, 100, 100, 4, 0, 0, 70, 100, 100] as const;
const CPU_POINTS = CPU.map((y, x) => ({ x, y }));

const BOUNDED: Frame = {
  width: 200,
  height: 130,
  domain: [-15, 115],
  count: CPU.length,
};

function BoundedChart({ curve }: { curve: Curve }) {
  const id = useId();
  const s = scale(BOUNDED);
  const points = sample(CURVES[curve](CPU_POINTS));
  const d = toPath(points, BOUNDED);
  const top = s.y(100);
  const bottom = s.y(0);
  const left = s.x(0);
  const right = s.x(CPU.length - 1);

  return (
    <svg
      aria-hidden="true"
      className="h-auto w-full"
      viewBox={`0 0 ${BOUNDED.width} ${BOUNDED.height}`}
    >
      <defs>
        {/* Starts just past each bound so a line resting on it stays black. */}
        <clipPath id={`${id}-outside`}>
          <rect height={top - 1.5} width={BOUNDED.width} x={0} y={0} />
          <rect
            height={BOUNDED.height - bottom}
            width={BOUNDED.width}
            x={0}
            y={bottom + 1.5}
          />
        </clipPath>
      </defs>
      <Guide align="start" frame={BOUNDED} label="100%" value={100} />
      <Guide align="start" frame={BOUNDED} label="0%" value={0} />
      {/* Area between the line and each bound, only where the line crosses it. */}
      <g className="fill-rose-500/20" clipPath={`url(#${id}-outside)`}>
        <path d={`${d} L${right},${top} L${left},${top} Z`} />
        <path d={`${d} L${right},${bottom} L${left},${bottom} Z`} />
      </g>
      <path {...lineProps} d={d} />
      <path
        {...lineProps}
        className="text-rose-500"
        clipPath={`url(#${id}-outside)`}
        d={d}
      />
      <Dots frame={BOUNDED} values={CPU} />
    </svg>
  );
}

function boundsCaption(curve: Curve) {
  const { min, max } = extent(sample(CURVES[curve](CPU_POINTS)));
  const low = Math.round(min);
  const high = Math.round(max);
  if (low >= 0 && high <= 100) return "Stays within 0-100%";
  return `Reaches ${high}% and ${low}%`;
}

export function CurveOvershootDemo() {
  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem
          caption={
            <span className="tabular-nums">{boundsCaption("catmullRom")}</span>
          }
          label="Catmull-Rom"
          verdict="wrong"
        >
          <div className="w-full rounded-xl bg-card p-1.5 shadow-(--custom-shadow)">
            <BoundedChart curve="catmullRom" />
          </div>
        </CompareItem>
        <CompareItem
          caption={
            <span className="tabular-nums">{boundsCaption("monotone")}</span>
          }
          label="Monotone"
          verdict="right"
        >
          <div className="w-full rounded-xl bg-card p-1.5 shadow-(--custom-shadow)">
            <BoundedChart curve="monotone" />
          </div>
        </CompareItem>
      </Compare>
    </Demo>
  );
}
