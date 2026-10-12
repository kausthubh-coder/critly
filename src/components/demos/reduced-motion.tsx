"use client";

import { AnimatePresence, motion, type Transition } from "motion/react";
import { useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";

type Variant = "full" | "zero" | "reduced";

const VARIANT_OPTIONS = [
  { value: "full", label: "Full" },
  { value: "zero", label: "Duration 0", icon: WRONG_ICON },
  { value: "reduced", label: "Reduced", icon: RIGHT_ICON },
] as const;

const CAPTIONS: Record<Variant, string> = {
  full: "Slides in over 300ms, then the highlight fades",
  zero: "Everything set to 0ms, so the row just appears",
  reduced: "No slide, a 150ms fade, the highlight stays",
};

const MESSAGES = [
  { name: "Maya", text: "Pushed the new onboarding copy" },
  { name: "Leo", text: "Can you look at the pricing page?" },
  { name: "Iris", text: "Standup moved to 10:30" },
  { name: "Theo", text: "Invoice #204 is paid" },
  { name: "Nora", text: "Shipped the dark mode fix" },
  { name: "Sam", text: "Lunch on Friday?" },
] as const;

const ROW_HEIGHT = 48;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

type Row = { id: number; message: (typeof MESSAGES)[number] };

// Rows are listed newest first. Five are rendered so the list stays full
// while a new row pushes the last one below the fold.
const INITIAL_ROWS: Row[] = [3, 2, 1, 0].map((index) => ({
  id: index,
  message: MESSAGES[index],
}));

function rowMotion(variant: Variant) {
  if (variant === "zero") {
    const none: Transition = { duration: 0 };
    return {
      row: { initial: { height: 0 }, transition: none },
      content: { initial: { opacity: 0, y: -12 }, transition: none },
      highlight: none,
    };
  }

  // The highlight is a colour change, not movement, so both versions keep it.
  const highlight: Transition = {
    duration: 1.4,
    times: [0, 0.35, 1],
    ease: "easeOut",
  };

  if (variant === "reduced") {
    return {
      // No height tween: the rows below step down instead of gliding.
      row: { initial: false as const, transition: { duration: 0 } },
      content: {
        initial: { opacity: 0 },
        transition: { duration: 0.15, ease: "easeOut" } as Transition,
      },
      highlight,
    };
  }

  const slide: Transition = { duration: 0.3, ease: EASE_OUT };
  return {
    row: { initial: { height: 0 }, transition: slide },
    content: { initial: { opacity: 0, y: -12 }, transition: slide },
    highlight,
  };
}

export function ReducedMotionDemo() {
  const [variant, setVariant] = useState<Variant>("full");
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
  const nextId = useRef(INITIAL_ROWS.length);

  function addRow() {
    const id = nextId.current++;
    setRows((current) =>
      [{ id, message: MESSAGES[id % MESSAGES.length] }, ...current].slice(0, 5)
    );
  }

  function changeVariant(next: Variant) {
    setVariant(next);
    // Play the new version straight away.
    addRow();
  }

  const settings = rowMotion(variant);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="h-[14.25rem] w-full max-w-sm overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)">
        <div className="flex h-9 items-center border-b border-border px-4">
          <span className="text-xs font-medium text-foreground">Inbox</span>
        </div>
        <ul className="relative">
          <AnimatePresence initial={false}>
            {rows.map((row) => (
              <motion.li
                key={row.id}
                animate={{ height: ROW_HEIGHT }}
                className="relative overflow-hidden"
                initial={settings.row.initial}
                style={{ height: ROW_HEIGHT }}
                transition={settings.row.transition}
              >
                <motion.div
                  aria-hidden="true"
                  animate={{ opacity: [1, 1, 0] }}
                  className="absolute inset-0 bg-foreground/[0.06] dark:bg-foreground/[0.08]"
                  initial={{ opacity: 1 }}
                  transition={settings.highlight}
                />
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="relative flex h-12 items-center gap-3 px-4"
                  initial={settings.content.initial}
                  transition={settings.content.transition}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
                    {row.message.name[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-foreground">
                      {row.message.name}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {row.message.text}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    now
                  </span>
                </motion.div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">{CAPTIONS[variant]}</p>

      <div className="flex flex-col items-center gap-4">
        <SegmentedControl
          ariaLabel="Motion setting"
          onChange={changeVariant}
          options={VARIANT_OPTIONS}
          value={variant}
        />
        <Button onClick={addRow} variant="secondary">
          New message
        </Button>
      </div>
    </Demo>
  );
}
