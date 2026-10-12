"use client";

import {
  AlignLeftIcon,
  BoundingBoxIcon,
  EyeIcon,
  TargetIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The numbers and the overlay come from the real taste pass: the same
// taste.js that `critly taste` runs, measured live on the screen below.

type Rect = [number, number, number, number];
type TasteReport = {
  boxes: { count: number; maxDepth: number };
  edges: { count: number; nearMisses: { at: [number, number] }[] };
  focus: {
    verdict: "clear" | "weak" | "tie" | "nothing";
    ratio: number | null;
    ranked: { where: string }[];
  };
  _draw: {
    boxes: { r: Rect; depth: number }[];
    edges: { x: number; n: number }[];
    misses: number[];
    ranked: Rect[];
  };
};

declare global {
  interface Window {
    __critlyTaste?: (options: { root: Element }) => Promise<TasteReport>;
  }
}

async function measure(root: Element) {
  if (!window.__critlyTaste) {
    // @ts-expect-error -- a classic script that sets window.__critlyTaste, not a module
    await import("../../../packages/critly/src/taste.js");
  }
  return window.__critlyTaste!({ root });
}

type Version = "draft" | "passed";
type Lens = "squint" | "boxes" | "edges" | "lead";

const VERSIONS = [
  { value: "draft", label: "First draft", icon: WRONG_ICON },
  { value: "passed", label: "After the pass", icon: RIGHT_ICON },
] as const;

const LENSES = [
  { value: "squint", label: "Squint", Icon: EyeIcon },
  { value: "boxes", label: "Boxes", Icon: BoundingBoxIcon },
  { value: "edges", label: "Edges", Icon: AlignLeftIcon },
  { value: "lead", label: "Lead", Icon: TargetIcon },
] as const;

// Quoted names in the report look like `button.solid "Add seats"`.
const nameOf = (where?: string) => where?.match(/"(.*)"$/)?.[1] ?? "nothing";

const ROWS = [
  { label: "Seats used", value: "6 of 8" },
  { label: "Next invoice", value: "$96.00" },
];

function Draft() {
  // Each group in its own box, each box with its own inset, everything bold,
  // and two solid buttons.
  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg font-bold">Billing</p>
      <div className="rounded-xl border border-border p-3.5">
        <p className="font-bold">Team plan</p>
        <p className="text-sm font-bold">Renews March 3, 8 seats</p>
        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border p-2">
          {ROWS.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-md border border-border px-2.5 py-2 text-sm font-semibold"
            >
              <span>{row.label}</span>
              <span className="tabular-nums">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2 pl-1">
          <Button className="bg-blue-600 font-semibold text-white hover:bg-blue-600/90 dark:bg-blue-600 dark:hover:bg-blue-600/90">
            Upgrade plan
          </Button>
          <Button className="font-semibold">Add seats</Button>
        </div>
      </div>
    </div>
  );
}

function Passed() {
  // One surface, one inset, space instead of lines, one solid action.
  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg font-medium">Billing</p>
      <div className="rounded-xl bg-card p-4 shadow-(--custom-shadow)">
        <p className="font-medium">Team plan</p>
        <p className="text-sm text-muted-foreground">Renews March 3, 8 seats</p>
        <dl className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">
          {ROWS.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex gap-2">
          <Button>Upgrade plan</Button>
          <Button variant="ghost">Add seats</Button>
        </div>
      </div>
    </div>
  );
}

const DEPTH = [
  "",
  "outline-sky-500",
  "outline-amber-500",
  "outline-red-500",
] as const;
const DEPTH_BADGE = ["", "bg-sky-700", "bg-amber-700", "bg-red-700"] as const;

function Overlay({ report, lens }: { report: TasteReport; lens: Lens }) {
  const draw = report._draw;
  const misses = new Set(draw.misses);
  return (
    <div
      aria-hidden="true"
      data-critly-taste=""
      className="pointer-events-none absolute inset-0 text-[10px] leading-none font-semibold text-white"
    >
      {lens === "boxes" &&
        draw.boxes.map((box, i) => (
          <div
            key={i}
            className={cn(
              "absolute rounded-[inherit] outline-[1.5px] -outline-offset-1 outline-dashed",
              DEPTH[Math.min(box.depth, 3)]
            )}
            style={{
              left: box.r[0],
              top: box.r[1],
              width: box.r[2],
              height: box.r[3],
            }}
          >
            {box.depth > 1 && (
              <span
                className={cn(
                  "absolute top-1/2 -right-2 grid size-4 -translate-y-1/2 place-items-center rounded-full",
                  DEPTH_BADGE[Math.min(box.depth, 3)]
                )}
              >
                {box.depth}
              </span>
            )}
          </div>
        ))}
      {lens === "edges" &&
        draw.edges.map((edge) => (
          <div
            key={edge.x}
            className={cn(
              "absolute inset-y-0 border-l",
              misses.has(edge.x)
                ? "border-red-500"
                : "border-dashed border-sky-500/70"
            )}
            style={{ left: edge.x }}
          />
        ))}
      {lens === "lead" &&
        draw.ranked.map((r, i) => (
          <div
            key={i}
            className={cn(
              "absolute rounded-lg border-2",
              i === 0 ? "border-sky-500" : "border-dashed border-sky-500/60"
            )}
            style={{
              left: r[0] - 4,
              top: r[1] - 4,
              width: r[2] + 8,
              height: r[3] + 8,
            }}
          >
            <span
              className={cn(
                "absolute -top-2.5 -left-2.5 grid size-5 place-items-center rounded-full",
                i === 0 ? "bg-sky-700" : "bg-sky-700/70"
              )}
            >
              {i + 1}
            </span>
          </div>
        ))}
    </div>
  );
}

function caption(report: TasteReport | null, lens: Lens | null) {
  if (!report || !lens) return "Turn on a lens to see what the taste pass measures.";
  const { boxes, edges, focus } = report;
  const lead = nameOf(focus.ranked[0]?.where);
  const runner = nameOf(focus.ranked[1]?.where);
  if (lens === "squint") {
    return focus.verdict === "clear"
      ? `Blurred at 6px, the words go and the shapes stay. ${lead} is the one dark shape left.`
      : `Blurred at 6px, the words go and the shapes stay. ${lead} and ${runner} pull about equally, and the boxes read as stacked outlines.`;
  }
  if (lens === "boxes") {
    return boxes.maxDepth >= 3
      ? `${boxes.count} boxes, nested ${boxes.maxDepth} deep: a box in a box in a box.`
      : `${boxes.count} ${boxes.count === 1 ? "box" : "boxes"}. The rows are grouped by space, not lines.`;
  }
  if (lens === "edges") {
    const miss = edges.nearMisses[0];
    return miss
      ? `${edges.count} left edges. The red pair are ${miss.at[1] - miss.at[0]}px apart, close enough to look like a mistake.`
      : `${edges.count} left edges, none of them near misses.`;
  }
  if (focus.verdict === "clear") {
    return `${lead} leads, ${focus.ratio}× heavier than ${runner}.`;
  }
  return focus.verdict === "tie"
    ? `Nothing leads: ${lead} and ${runner} weigh within ${Math.round(((focus.ratio ?? 1) - 1) * 100)}% of each other.`
    : `${lead} leads, but only ${focus.ratio}× over ${runner}. Two solid buttons compete.`;
}

export function TastePassDemo() {
  const [version, setVersion] = useState<Version>("draft");
  const [lens, setLens] = useState<Lens | null>(null);
  const [report, setReport] = useState<TasteReport | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = stage.current;
    if (!root) return;
    let live = true;
    const run = () =>
      measure(root).then((next) => {
        if (live) setReport(next);
      });
    const observer = new ResizeObserver(run);
    observer.observe(root);
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [version]);

  const stats = report && [
    {
      lens: "boxes",
      label: "Boxes",
      value: `${report.boxes.count}`,
      note: `${report.boxes.maxDepth} deep`,
    },
    {
      lens: "edges",
      label: "Left edges",
      value: `${report.edges.count}`,
      note: report.edges.nearMisses.length
        ? `${report.edges.nearMisses.length} near miss`
        : "aligned",
    },
    {
      lens: "lead",
      label: "Lead",
      value: report.focus.ratio ? `${report.focus.ratio}×` : "–",
      note: report.focus.verdict === "nothing" ? "none" : report.focus.verdict,
    },
  ];

  return (
    <Demo className="gap-6 px-0 sm:px-4">
      <div className="relative w-full max-w-md">
        <div
          ref={stage}
          className={cn(
            "p-4 transition-[filter] duration-200 sm:p-5",
            lens === "squint" && "blur-[6px]"
          )}
        >
          {version === "draft" ? <Draft /> : <Passed />}
        </div>
        {report && lens && lens !== "squint" && (
          <Overlay report={report} lens={lens} />
        )}
      </div>

      {stats && (
        <dl className="grid w-full max-w-md grid-cols-3 gap-2 px-4 sm:px-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col gap-0.5 transition-opacity duration-200",
                lens && lens !== "squint" && lens !== stat.lens && "opacity-50"
              )}
            >
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="text-sm font-medium tabular-nums">
                {stat.value}
                <span className="ml-1.5 font-normal text-muted-foreground">
                  {stat.note}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      <p
        aria-live="polite"
        className="min-h-10 w-full max-w-md px-4 text-center text-sm text-pretty text-muted-foreground sm:px-5"
      >
        {caption(report, lens)}
      </p>

      <div className="flex flex-col items-center gap-3">
        <SegmentedControl
          ariaLabel="Version"
          onChange={setVersion}
          options={VERSIONS}
          value={version}
        />
        <div
          role="group"
          aria-label="Lens"
          className="flex flex-wrap justify-center gap-1"
        >
          {LENSES.map(({ value, label, Icon }) => (
            <Button
              key={value}
              aria-pressed={lens === value}
              className="text-xs"
              onClick={() => setLens(lens === value ? null : value)}
              variant={lens === value ? "secondary" : "ghost"}
            >
              <Icon aria-hidden="true" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    </Demo>
  );
}
