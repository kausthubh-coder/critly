"use client";

import { CheckCircleIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Button } from "@/components/ui/button";

// Both demos only move when the reader presses something, and the motion is
// the lesson, so they keep animating under reduced motion.

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
// EASE_OUT mirrored in time: the entrance, literally played backwards.
const EASE_OUT_REVERSED = [0.68, 0, 0.77, 0] as const;
const ENTER = 0.24;
const EXIT = 0.12;
const COLLAPSE = 0.16;

function Toast() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs text-foreground shadow-(--custom-shadow)">
      <CheckCircleIcon
        aria-hidden="true"
        className="size-4 shrink-0 text-emerald-500"
        weight="fill"
      />
      <span className="truncate font-medium">Changes saved</span>
    </div>
  );
}

function ToastWindow({ open, reversed }: { open: boolean; reversed: boolean }) {
  return (
    <div className="relative h-36 w-full overflow-hidden rounded-xl bg-muted shadow-(--custom-shadow) dark:bg-muted/40">
      <div aria-hidden="true" className="p-3">
        <div className="h-1.5 w-1/2 rounded-full bg-foreground/15" />
        <div className="mt-2 h-1.5 w-4/5 rounded-full bg-foreground/10" />
      </div>
      <div className="absolute inset-x-0 bottom-4 flex justify-center px-3">
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="toast"
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reversed
                  ? {
                      opacity: 0,
                      y: 12,
                      transition: { duration: ENTER, ease: EASE_OUT_REVERSED },
                    }
                  : {
                      opacity: 0,
                      filter: "blur(2px)",
                      transition: { duration: EXIT, ease: "easeIn" },
                    }
              }
              initial={{ opacity: 0, y: 12, filter: "blur(0px)" }}
              transition={{ duration: ENTER, ease: EASE_OUT }}
            >
              <Toast />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ExitAnimationsDemo() {
  const [open, setOpen] = useState(true);

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem verdict="wrong" caption="240ms, reversed">
          <ToastWindow open={open} reversed />
        </CompareItem>
        <CompareItem verdict="right" caption="120ms fade">
          <ToastWindow open={open} reversed={false} />
        </CompareItem>
      </Compare>

      <Button
        className="min-w-24"
        onClick={() => setOpen((value) => !value)}
        variant="secondary"
      >
        {open ? "Dismiss" : "Show"}
      </Button>
    </Demo>
  );
}

const TASKS = [
  "Call Sarah",
  "Book flights",
  "Review PR",
  "Pay rent",
] as const;

function TaskRow({ task, onRemove }: { task: string; onRemove: () => void }) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-lg pr-0.5 pl-2 text-xs text-foreground">
      <span
        aria-hidden="true"
        className="size-3.5 shrink-0 rounded-full border border-foreground/25"
      />
      <span className="min-w-0 flex-1 truncate">{task}</span>
      <Button
        aria-label={`Remove ${task}`}
        className="shrink-0 text-muted-foreground"
        onClick={onRemove}
        size="icon-xs"
        variant="ghost"
      >
        <XIcon aria-hidden="true" className="size-3.5" weight="bold" />
      </Button>
    </div>
  );
}

function TaskList({
  tasks,
  onRemove,
  animated,
}: {
  tasks: readonly string[];
  onRemove: (task: string) => void;
  animated: boolean;
}) {
  return (
    <ul className="h-44 w-full overflow-hidden rounded-xl bg-card p-1.5 shadow-(--custom-shadow)">
      {animated ? (
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            // Height and opacity only. The rows below reflow as this one
            // shrinks, so they slide up without a layout animation of their own.
            <motion.li
              key={task}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
              transition={{ duration: COLLAPSE, ease: EASE_OUT }}
            >
              <TaskRow onRemove={() => onRemove(task)} task={task} />
            </motion.li>
          ))}
        </AnimatePresence>
      ) : (
        tasks.map((task) => (
          <li key={task}>
            <TaskRow onRemove={() => onRemove(task)} task={task} />
          </li>
        ))
      )}
    </ul>
  );
}

export function ExitListDemo() {
  const [left, setLeft] = useState<readonly string[]>(TASKS);
  const [right, setRight] = useState<readonly string[]>(TASKS);
  const canReset = left.length < TASKS.length || right.length < TASKS.length;

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem verdict="wrong" caption="Removed instantly">
          <TaskList
            animated={false}
            onRemove={(task) => setLeft((list) => list.filter((t) => t !== task))}
            tasks={left}
          />
        </CompareItem>
        <CompareItem verdict="right" caption="160ms collapse">
          <TaskList
            animated
            onRemove={(task) =>
              setRight((list) => list.filter((t) => t !== task))
            }
            tasks={right}
          />
        </CompareItem>
      </Compare>

      <Button
        disabled={!canReset}
        onClick={() => {
          setLeft(TASKS);
          setRight(TASKS);
        }}
        variant="secondary"
      >
        Reset
      </Button>
    </Demo>
  );
}
