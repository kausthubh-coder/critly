"use client";

import { CaretDownIcon, CheckIcon, PlusIcon } from "@phosphor-icons/react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { playSoundAlways } from "@/lib/sounds";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* One product, three feels                                            */
/* ------------------------------------------------------------------ */

type Feel = "tool" | "calm" | "playful";

const FEEL_OPTIONS = [
  { value: "tool", label: "Tool" },
  { value: "calm", label: "Calm" },
  { value: "playful", label: "Playful" },
] as const;

type FeelSpec = {
  /** Row height in px. */
  row: number;
  /** Horizontal padding inside a row in px. */
  padding: number;
  /** Gap between the card edge and the rows in px. */
  inset: number;
  /** Radius of rows, buttons and toasts in px. The card adds the inset. */
  radius: number;
  /** Weight for the heading and the button. */
  weight: 400 | 500 | 600;
  /** Body text size in px. */
  text: number;
  /** What the readout shows for motion. */
  motion: string;
  sound: boolean;
};

const FEELS: Record<Feel, FeelSpec> = {
  tool: {
    row: 32,
    padding: 8,
    inset: 4,
    radius: 6,
    weight: 500,
    text: 13,
    motion: "150ms",
    sound: false,
  },
  calm: {
    row: 48,
    padding: 16,
    inset: 8,
    radius: 12,
    weight: 400,
    text: 14,
    motion: "300ms",
    sound: false,
  },
  playful: {
    row: 44,
    padding: 12,
    inset: 6,
    radius: 16,
    weight: 600,
    text: 14,
    motion: "Spring",
    sound: true,
  },
};

const SNAPPY = [0.23, 1, 0.32, 1] as const;
const GENTLE = [0.33, 1, 0.68, 1] as const;

function feelTransition(feel: Feel, reduce: boolean): Transition {
  if (reduce) return { duration: feel === "tool" ? 0 : 0.15 };
  if (feel === "tool") return { duration: 0.15, ease: SNAPPY };
  if (feel === "calm") return { duration: 0.3, ease: GENTLE };
  return { type: "spring", duration: 0.5, bounce: 0.45 };
}

type Task = { id: number; title: string; due: string; done: boolean };

const INITIAL_TASKS: Task[] = [
  { id: 1, title: "Review onboarding copy", due: "Today", done: false },
  { id: 2, title: "Fix the login redirect", due: "Today", done: true },
  { id: 3, title: "Plan the Q4 roadmap", due: "Fri", done: false },
  { id: 4, title: "Reply to Sam", due: "Mon", done: false },
];

const NEW_TITLES = [
  "Write release notes",
  "Book a design review",
  "Update the changelog",
  "Draft the survey",
];

const VISIBLE_ROWS = 4;

type Toast = { id: number; text: string; undoId?: number };

export function ProductFeelDemo() {
  const [feel, setFeel] = useState<Feel>("tool");
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [toast, setToast] = useState<Toast | null>(null);
  const nextId = useRef(100);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion() ?? false;

  const spec = FEELS[feel];
  const transition = feelTransition(feel, reduce);
  const moves = !reduce && feel !== "tool";

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  function showToast(text: string, undoId?: number) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: nextId.current++, text, undoId });
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  function changeFeel(next: Feel) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
    setFeel(next);
  }

  function toggle(id: number) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
    if (!task.done) {
      if (spec.sound) void playSoundAlways("success");
      showToast("Marked as done", id);
    } else if (toast?.undoId === id) {
      setToast(null);
    }
  }

  function undo(id: number) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: false } : t))
    );
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }

  function addTask() {
    const id = nextId.current++;
    const title = NEW_TITLES[id % NEW_TITLES.length];
    setTasks((prev) =>
      [{ id, title, due: "Today", done: false }, ...prev].slice(0, 6)
    );
    if (spec.sound) void playSoundAlways("tick");
    showToast("Task created");
  }

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      {/* Tallest feel is 256px; reserving it keeps the page still. */}
      <div className="flex h-64 w-full max-w-sm items-center justify-center">
        <div
          key={feel}
          className="relative w-full overflow-hidden bg-card shadow-(--custom-shadow)"
          style={{
            padding: spec.inset,
            borderRadius: spec.radius + spec.inset,
            fontSize: spec.text,
          }}
        >
          <div
            className="flex items-center justify-between gap-3"
            style={{ height: spec.row, paddingInline: spec.padding }}
          >
            <div className="flex min-w-0 items-baseline gap-2">
              <span
                className="text-foreground"
                style={{
                  fontWeight: spec.weight,
                  fontSize: feel === "tool" ? 13 : 15,
                }}
              >
                Today
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {doneCount}/{tasks.length}
              </span>
            </div>
            <button
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                feel === "tool" &&
                  "h-6 bg-primary px-2 text-primary-foreground hover:bg-primary/90",
                feel === "calm" &&
                  "h-8 bg-muted px-3.5 text-foreground hover:bg-muted/70",
                feel === "playful" &&
                  "h-8 bg-violet-500 px-3.5 text-white hover:bg-violet-600 active:scale-95 transition-transform"
              )}
              onClick={addTask}
              style={{
                borderRadius: feel === "playful" ? 999 : spec.radius,
                fontWeight: spec.weight,
              }}
              type="button"
            >
              <PlusIcon
                aria-hidden="true"
                className="size-3"
                weight={feel === "playful" ? "bold" : "regular"}
              />
              New task
            </button>
          </div>

          <ul
            className="relative overflow-hidden"
            style={{ height: spec.row * VISIBLE_ROWS }}
          >
            <AnimatePresence initial={false}>
              {tasks.map((task) => (
                <motion.li
                  key={task.id}
                  layout="position"
                  initial={
                    moves
                      ? {
                          opacity: 0,
                          y: feel === "calm" ? -6 : 0,
                          scale: feel === "playful" ? 0.9 : 1,
                        }
                      : reduce && feel !== "tool"
                        ? { opacity: 0 }
                        : false
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                  transition={transition}
                  style={{ height: spec.row }}
                >
                  <TaskRow
                    feel={feel}
                    spec={spec}
                    task={task}
                    transition={transition}
                    moves={moves}
                    onToggle={() => toggle(task.id)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div
            className="pointer-events-none absolute inset-x-0 flex justify-center"
            style={{ bottom: spec.inset + 6 }}
          >
            <AnimatePresence>
              {toast ? (
                <motion.div
                  key={toast.id}
                  role="status"
                  className={cn(
                    "pointer-events-auto flex items-center gap-3 text-xs",
                    feel === "tool" &&
                      "h-7 bg-primary pr-1 pl-2.5 text-primary-foreground",
                    feel === "calm" &&
                      "h-10 bg-card pr-2 pl-4 text-foreground shadow-[var(--custom-shadow),0_8px_24px_-8px_rgb(0_0_0/0.15)]",
                    feel === "playful" &&
                      "h-9 bg-violet-500 pr-1.5 pl-4 text-white shadow-lg shadow-violet-500/25"
                  )}
                  style={{
                    borderRadius: feel === "playful" ? 999 : spec.radius,
                    fontWeight: feel === "playful" ? 500 : 400,
                  }}
                  initial={
                    reduce
                      ? { opacity: feel === "tool" ? 1 : 0 }
                      : feel === "tool"
                        ? { opacity: 0, y: 6 }
                        : feel === "calm"
                          ? { opacity: 0, y: 4 }
                          : { opacity: 0, y: 16, scale: 0.85 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    transition: {
                      duration: reduce || feel === "tool" ? 0.1 : 0.2,
                    },
                  }}
                  transition={transition}
                >
                  {toast.text}
                  {toast.undoId !== undefined ? (
                    <button
                      className={cn(
                        "cursor-pointer px-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        feel === "tool" && "h-5 hover:bg-white/15 dark:hover:bg-black/10",
                        feel === "calm" && "h-7 text-muted-foreground hover:bg-muted hover:text-foreground",
                        feel === "playful" && "h-6 bg-white/20 hover:bg-white/30"
                      )}
                      onClick={() => undo(toast.undoId as number)}
                      style={{
                        borderRadius:
                          feel === "playful"
                            ? 999
                            : Math.max(2, spec.radius - 4),
                        fontWeight: spec.weight,
                      }}
                      type="button"
                    >
                      Undo
                    </button>
                  ) : (
                    <span className="w-1" />
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <FeelReadout spec={spec} />

      <SegmentedControl
        ariaLabel="Product feel"
        onChange={changeFeel}
        options={FEEL_OPTIONS}
        value={feel}
      />
    </Demo>
  );
}

function TaskRow({
  feel,
  spec,
  task,
  transition,
  moves,
  onToggle,
}: {
  feel: Feel;
  spec: FeelSpec;
  task: Task;
  transition: Transition;
  moves: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-pressed={task.done}
      className="flex h-full w-full cursor-pointer items-center gap-2.5 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset dark:hover:bg-muted/70"
      onClick={onToggle}
      style={{
        borderRadius: spec.radius,
        paddingInline: spec.padding,
        gap: feel === "tool" ? 8 : 12,
      }}
      type="button"
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative grid shrink-0 place-items-center",
          feel === "tool"
            ? "size-3.5 rounded-[4px]"
            : "size-[18px] rounded-full",
          !task.done &&
            (feel === "tool"
              ? "shadow-[inset_0_0_0_1.5px_var(--muted-foreground)] opacity-60"
              : "shadow-[inset_0_0_0_1.5px_var(--muted-foreground)] opacity-50")
        )}
      >
        <AnimatePresence initial={false}>
          {task.done ? (
            <motion.span
              key="check"
              className={cn(
                "absolute inset-0 grid place-items-center",
                feel === "tool" && "rounded-[4px] bg-primary text-primary-foreground",
                feel === "calm" &&
                  "rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                feel === "playful" && "rounded-full bg-violet-500 text-white"
              )}
              initial={
                feel === "tool"
                  ? false
                  : moves && feel === "playful"
                    ? { scale: 0.3, opacity: 0 }
                    : { opacity: 0 }
              }
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={transition}
            >
              <CheckIcon
                className={feel === "tool" ? "size-2.5" : "size-3"}
                weight="bold"
              />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          feel === "calm" && "transition-colors duration-300",
          task.done ? "text-muted-foreground line-through" : "text-foreground"
        )}
        style={{ fontWeight: feel === "playful" ? 500 : 400 }}
      >
        {task.title}
      </span>
      <span
        className={cn(
          "shrink-0 text-xs tabular-nums",
          feel === "playful"
            ? "rounded-full bg-violet-500/10 px-2 py-0.5 text-violet-600 dark:text-violet-300"
            : "text-muted-foreground"
        )}
      >
        {task.due}
      </span>
    </button>
  );
}

function FeelReadout({ spec }: { spec: FeelSpec }) {
  const items = [
    ["Rows", `${spec.row}px`],
    ["Padding", `${spec.padding}px`],
    ["Radius", `${spec.radius}px`],
    ["Weight", String(spec.weight)],
    ["Motion", spec.motion],
    ["Sound", spec.sound ? "On" : "Off"],
  ] as const;

  return (
    <dl className="grid w-full max-w-sm grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-6">
      {items.map(([label, value]) => (
        <div key={label} className="flex flex-col items-center gap-1">
          <dt className="text-[10px] text-muted-foreground">{label}</dt>
          <dd className="text-xs tabular-nums text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ */
/* Mismatch: a dense table wearing a playful feel                      */
/* ------------------------------------------------------------------ */

type Match = "mismatched" | "matched";

const MATCH_OPTIONS = [
  { value: "mismatched", label: "Mismatched", icon: WRONG_ICON },
  { value: "matched", label: "Matched", icon: RIGHT_ICON },
] as const;

const SERVICES = [
  { name: "api-gateway", region: "iad1", p95: 42 },
  { name: "auth", region: "sfo1", p95: 118 },
  { name: "billing", region: "fra1", p95: 87 },
  { name: "search", region: "iad1", p95: 23 },
  { name: "media", region: "hnd1", p95: 164 },
  { name: "webhooks", region: "cdg1", p95: 65 },
] as const;

type Sort = "none" | "asc" | "desc";

export function FeelMismatchDemo() {
  const [match, setMatch] = useState<Match>("mismatched");
  const [sort, setSort] = useState<Sort>("none");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(["auth"])
  );
  const reduce = useReducedMotion() ?? false;
  const playful = match === "mismatched";

  const rows = [...SERVICES];
  if (sort === "asc") rows.sort((a, b) => a.p95 - b.p95);
  if (sort === "desc") rows.sort((a, b) => b.p95 - a.p95);

  function cycleSort() {
    setSort((s) => (s === "desc" ? "asc" : "desc"));
  }

  function toggleRow(name: string) {
    const wasSelected = selected.has(name);
    setSelected((prev) => {
      const next = new Set(prev);
      if (wasSelected) next.delete(name);
      else next.add(name);
      return next;
    });
    if (playful && !wasSelected) void playSoundAlways("pop");
  }

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="w-full max-w-sm rounded-xl bg-card p-1.5 shadow-(--custom-shadow)">
        <div className="grid h-7 grid-cols-[1fr_4rem_4.5rem] items-center px-2.5 text-[11px] text-muted-foreground">
          <span>Service</span>
          <span>Region</span>
          <button
            aria-label={`Sort by p95 latency${sort === "desc" ? ", descending" : sort === "asc" ? ", ascending" : ""}`}
            className="-mr-1 inline-flex cursor-pointer items-center justify-end gap-1 justify-self-end rounded-[4px] px-1 text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={cycleSort}
            type="button"
          >
            p95
            <CaretDownIcon
              aria-hidden="true"
              className={cn(
                "size-3",
                sort === "none" && "opacity-40",
                sort === "asc" && "rotate-180"
              )}
              weight="bold"
            />
          </button>
        </div>
        <ul className="flex flex-col">
          {rows.map((row, index) => {
            const isSelected = selected.has(row.name);
            return (
              <motion.li
                key={row.name}
                layout="position"
                transition={
                  playful
                    ? reduce
                      ? { duration: 0.6, delay: index * 0.05 }
                      : {
                          type: "spring",
                          duration: 0.8,
                          bounce: 0.4,
                          delay: index * 0.05,
                        }
                    : { duration: 0 }
                }
              >
                <motion.button
                  aria-pressed={isSelected}
                  className={cn(
                    "grid h-8 w-full cursor-pointer grid-cols-[1fr_4rem_4.5rem] items-center px-2.5 text-left text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
                    playful
                      ? "rounded-full transition-colors duration-300"
                      : "rounded-[6px]",
                    isSelected
                      ? playful
                        ? "bg-violet-500/15 text-violet-700 dark:text-violet-200"
                        : "bg-muted text-foreground"
                      : playful
                        ? "text-foreground hover:bg-violet-500/10"
                        : "text-foreground hover:bg-muted/60"
                  )}
                  animate={{ scale: playful && isSelected && !reduce ? 1.04 : 1 }}
                  initial={false}
                  onClick={() => toggleRow(row.name)}
                  transition={
                    playful
                      ? { type: "spring", duration: 0.6, bounce: 0.6 }
                      : { duration: 0 }
                  }
                  type="button"
                >
                  <span
                    className={cn(
                      "truncate",
                      playful && "font-semibold"
                    )}
                  >
                    {row.name}
                  </span>
                  <span className="text-muted-foreground">{row.region}</span>
                  <span className="text-right tabular-nums">{row.p95}ms</span>
                </motion.button>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <SegmentedControl
        ariaLabel="Feel for a dense table"
        onChange={setMatch}
        options={MATCH_OPTIONS}
        value={match}
      />
    </Demo>
  );
}
