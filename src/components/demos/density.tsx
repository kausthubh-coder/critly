"use client";

import {
  CheckCircleIcon,
  CircleDashedIcon,
  CircleHalfIcon,
  CircleIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

const MOTION = "duration-300 ease-snappy motion-reduce:transition-none";

type Density = "comfortable" | "compact";

const DENSITY_OPTIONS = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
] as const;

/* Every value steps down together. */
const SYSTEM: Record<
  Density,
  { row: number; padding: number; gap: number; text: number; icon: number }
> = {
  comfortable: { row: 48, padding: 16, gap: 12, text: 14, icon: 20 },
  compact: { row: 32, padding: 8, gap: 8, text: 13, icon: 16 },
};

/* The list shows exactly this much before it scrolls: 6 rows of 48px or 9
   rows of 32px. */
const VIEWPORT = 288;

type Status = "todo" | "progress" | "done" | "backlog";

const STATUS_ICON = {
  backlog: CircleDashedIcon,
  todo: CircleIcon,
  progress: CircleHalfIcon,
  done: CheckCircleIcon,
} as const;

const ISSUES: { id: number; title: string; status: Status; who: string }[] = [
  { id: 142, title: "Fix login redirect loop", status: "progress", who: "AL" },
  { id: 141, title: "Update billing copy", status: "todo", who: "GH" },
  { id: 139, title: "Flaky upload test", status: "progress", who: "AT" },
  { id: 138, title: "Chart colors in dark mode", status: "todo", who: "AL" },
  { id: 136, title: "Add CSV export", status: "backlog", who: "GH" },
  { id: 135, title: "Audit focus rings", status: "done", who: "AT" },
  { id: 133, title: "Rename workspace setting", status: "todo", who: "AL" },
  { id: 131, title: "Cache avatar images", status: "backlog", who: "GH" },
  { id: 130, title: "Retry failed webhooks", status: "done", who: "AT" },
  { id: 128, title: "Empty state for search", status: "todo", who: "AL" },
  { id: 127, title: "Keyboard shortcut for archive", status: "backlog", who: "GH" },
  { id: 125, title: "Trim long project names", status: "done", who: "AT" },
];

function IssueList({ density }: { density: Density }) {
  const s = SYSTEM[density];

  return (
    <div className="w-full overflow-hidden rounded-xl bg-card text-left shadow-(--custom-shadow)">
      <div
        className={cn(
          "flex h-11 items-center justify-between border-b border-border transition-[padding,font-size]",
          MOTION
        )}
        style={{ paddingInline: s.padding, fontSize: s.text }}
      >
        <span className="font-medium text-foreground">Issues</span>
        <span className="text-muted-foreground tabular-nums">
          {ISSUES.length}
        </span>
      </div>
      <div className="overflow-hidden" style={{ height: VIEWPORT }}>
        {ISSUES.map((issue) => {
          const Icon = STATUS_ICON[issue.status];
          return (
            <div
              key={issue.id}
              className={cn(
                "flex items-center transition-[height,padding,gap,font-size] [@media(hover:hover)]:hover:bg-muted/60",
                MOTION
              )}
              style={{
                height: s.row,
                paddingInline: s.padding,
                gap: s.gap,
                fontSize: s.text,
              }}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  "shrink-0 text-muted-foreground transition-[width,height]",
                  MOTION
                )}
                style={{ width: s.icon, height: s.icon }}
                weight={issue.status === "progress" ? "fill" : "regular"}
              />
              <span className="shrink-0 whitespace-nowrap text-muted-foreground tabular-nums">
                CRA-{issue.id}
              </span>
              <span className="min-w-0 flex-1 truncate text-foreground">
                {issue.title}
              </span>
              <span
                className={cn(
                  "grid shrink-0 place-items-center rounded-full bg-muted font-medium text-muted-foreground transition-[width,height]",
                  MOTION
                )}
                style={{
                  width: s.icon,
                  height: s.icon,
                  fontSize: s.icon * 0.42,
                }}
              >
                {issue.who}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DensityDemo() {
  const [density, setDensity] = useState<Density>("comfortable");
  const s = SYSTEM[density];

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div aria-hidden="true" className="w-full max-w-88" inert>
        <IssueList density={density} />
      </div>
      <div
        aria-live="polite"
        className="-mt-1 flex flex-col items-center gap-1 text-xs text-muted-foreground tabular-nums"
      >
        <span>
          <span className="font-medium text-foreground">
            {VIEWPORT / s.row} of {ISSUES.length}
          </span>{" "}
          rows visible
        </span>
        <span>
          Row {s.row} · Padding {s.padding} · Gap {s.gap} · Text {s.text} ·
          Icon {s.icon}
        </span>
      </div>
      <SegmentedControl
        ariaLabel="Density"
        onChange={setDensity}
        options={DENSITY_OPTIONS}
        value={density}
      />
    </Demo>
  );
}

/* Cutting padding only: the comfortable type and icons squeezed into a
   28px row, with targets the size of the icons. */

const OVERLAY_OPTIONS = [
  { value: "hidden", label: "Normal" },
  { value: "shown", label: "Show hit areas" },
] as const;

/* Same paint as the hit areas article, on the real clickable box. */
const PAINT =
  "bg-rose-500/10 outline-1 outline-dashed outline-rose-500/60 -outline-offset-1";

const TASKS = [
  { title: "Fix login redirect loop", done: true },
  { title: "Update billing copy", done: false },
  { title: "Flaky upload test", done: false },
  { title: "Add CSV export", done: true },
  { title: "Audit focus rings", done: false },
] as const;

function TaskList({
  variant,
  paint,
}: {
  variant: "padding" | "compact";
  paint: boolean;
}) {
  const [done, setDone] = useState<boolean[]>(() =>
    TASKS.map((task) => task.done)
  );
  const squeezed = variant === "padding";

  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-xl bg-card text-left shadow-(--custom-shadow)",
        squeezed ? "py-1" : "py-1.5"
      )}
    >
      {TASKS.map((task, i) => (
        <div
          key={task.title}
          className={cn(
            "flex items-center",
            squeezed ? "h-7 gap-1 px-1 text-sm" : "h-8 gap-1 px-1 text-[13px]"
          )}
        >
          <button
            aria-label={`Complete ${task.title}`}
            aria-pressed={done[i]}
            className={cn(
              "grid shrink-0 cursor-pointer place-items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [@media(hover:hover)]:hover:bg-muted",
              squeezed ? "size-5" : "size-6",
              paint && PAINT
            )}
            onClick={() =>
              setDone((prev) => prev.map((v, j) => (j === i ? !v : v)))
            }
            type="button"
          >
            {done[i] ? (
              <CheckCircleIcon
                aria-hidden="true"
                className={cn(
                  "text-foreground",
                  squeezed ? "size-5" : "size-4"
                )}
                weight="fill"
              />
            ) : (
              <CircleIcon
                aria-hidden="true"
                className={cn(
                  "text-muted-foreground",
                  squeezed ? "size-5" : "size-4"
                )}
              />
            )}
          </button>
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              done[i] ? "text-muted-foreground" : "text-foreground",
              !squeezed && "pl-1"
            )}
          >
            {task.title}
          </span>
          <button
            aria-label={`More actions for ${task.title}`}
            className={cn(
              "grid shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [@media(hover:hover)]:hover:bg-muted [@media(hover:hover)]:hover:text-foreground",
              squeezed ? "size-5" : "size-6",
              paint && PAINT
            )}
            type="button"
          >
            <DotsThreeIcon
              aria-hidden="true"
              className={squeezed ? "size-5" : "size-4"}
              weight="bold"
            />
          </button>
        </div>
      ))}
    </div>
  );
}

export function DensityPaddingDemo() {
  const [overlay, setOverlay] = useState<"hidden" | "shown">("hidden");
  const paint = overlay === "shown";

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare className="items-start">
        <CompareItem
          caption={<span className="tabular-nums">20px targets</span>}
          label="Padding only"
          verdict="wrong"
        >
          <TaskList paint={paint} variant="padding" />
        </CompareItem>
        <CompareItem
          caption={<span className="tabular-nums">24px targets</span>}
          label="Compact"
          verdict="right"
        >
          <TaskList paint={paint} variant="compact" />
        </CompareItem>
      </Compare>
      <SegmentedControl
        ariaLabel="Hit area overlay"
        onChange={setOverlay}
        options={OVERLAY_OPTIONS}
        value={overlay}
      />
    </Demo>
  );
}
