"use client";

import {
  ArrowsLeftRightIcon,
  CheckCircleIcon,
  EnvelopeSimpleIcon,
  LinkSimpleIcon,
  PlusIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Every demo here is something the reader starts on purpose, and the motion
// is the whole point, so none of them drop to zero for reduced motion.

// Slowed down on purpose so there is time to change your mind mid-flight.
const SLOW_MS = 600;
const SLOW_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const SHEET_HIDDEN = "translateY(calc(100% + 8px))";

const SHEET_ACTIONS = [
  { label: "Copy link", Icon: LinkSimpleIcon },
  { label: "Send by email", Icon: EnvelopeSimpleIcon },
  { label: "Invite people", Icon: UsersIcon },
] as const;

function Sheet({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-1.5 bottom-1.5 rounded-lg bg-card p-2.5 shadow-(--custom-shadow)"
      style={style}
    >
      <div className="mx-auto mb-2.5 h-1 w-8 rounded-full bg-foreground/15" />
      <p className="mb-1.5 px-1 text-xs font-medium text-foreground">Share</p>
      <ul className="flex flex-col">
        {SHEET_ACTIONS.map((action) => (
          <li
            key={action.label}
            className="flex items-center gap-2 rounded-md px-1 py-1 text-[11px] text-muted-foreground"
          >
            <action.Icon aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate">{action.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Screen({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl bg-muted shadow-(--custom-shadow) dark:bg-muted/40",
        className
      )}
    >
      <div aria-hidden="true" className="p-3">
        <div className="h-1.5 w-1/2 rounded-full bg-foreground/15" />
        <div className="mt-2 h-1.5 w-4/5 rounded-full bg-foreground/10" />
        <div className="mt-2 h-1.5 w-2/3 rounded-full bg-foreground/10" />
      </div>
      {children}
    </div>
  );
}

export function InterruptibilityDemo() {
  const [open, setOpen] = useState(false);
  // No animation until the first click, so the sheet starts parked.
  const [touched, setTouched] = useState(false);

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <style>{`
        @keyframes craft-sheet-in {
          from { transform: ${SHEET_HIDDEN}; }
          to { transform: translateY(0); }
        }
        @keyframes craft-sheet-out {
          from { transform: translateY(0); }
          to { transform: ${SHEET_HIDDEN}; }
        }
      `}</style>

      <Compare>
        <CompareItem verdict="wrong" caption="Keyframes restart">
          <Screen className="h-44">
            <Sheet
              style={{
                transform: SHEET_HIDDEN,
                animation: touched
                  ? `${open ? "craft-sheet-in" : "craft-sheet-out"} ${SLOW_MS}ms ${SLOW_EASE} both`
                  : "none",
              }}
            />
          </Screen>
        </CompareItem>

        <CompareItem verdict="right" caption="Transition retargets">
          <Screen className="h-44">
            <Sheet
              style={{
                transform: open ? "translateY(0)" : SHEET_HIDDEN,
                transition: `transform ${SLOW_MS}ms ${SLOW_EASE}`,
              }}
            />
          </Screen>
        </CompareItem>
      </Compare>

      <Button
        aria-pressed={open}
        className="min-w-24"
        onClick={() => {
          setOpen((value) => !value);
          setTouched(true);
        }}
        variant="secondary"
      >
        {open ? "Close" : "Open"}
      </Button>
    </Demo>
  );
}

const TRAVEL = 180;

const TRACKS = [
  {
    label: "Tween",
    transition: { duration: SLOW_MS / 1000, ease: [0.65, 0, 0.35, 1] as const },
  },
  {
    label: "Spring",
    // Critically damped: no overshoot, settles in about the same 600ms.
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
];

export function SpringVelocityDemo() {
  const [on, setOn] = useState(false);

  return (
    <Demo className="gap-8">
      <div className="flex flex-col gap-4">
        {TRACKS.map((track) => (
          <div key={track.label} className="flex items-center gap-3">
            <span className="w-11 text-right text-xs text-muted-foreground">
              {track.label}
            </span>
            <div className="h-11 w-56 rounded-full bg-muted p-1 shadow-(--custom-shadow) dark:bg-muted/60">
              <motion.div
                aria-hidden="true"
                animate={{ x: on ? TRAVEL : 0 }}
                className="size-9 rounded-full bg-foreground"
                initial={false}
                transition={track.transition}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        aria-pressed={on}
        onClick={() => setOn((value) => !value)}
        variant="secondary"
      >
        <ArrowsLeftRightIcon aria-hidden="true" weight="bold" />
        Toggle
      </Button>
    </Demo>
  );
}

const TOAST_MESSAGES = [
  "Changes saved",
  "Link copied",
  "Invite sent",
  "File uploaded",
  "Comment posted",
] as const;

const TOAST_LIMIT = 3;
const TOAST_LIFETIME = 4000;
const TOAST_MS = 400;

type Toast = { id: number; message: string };

function ToastBody({ message }: { message: string }) {
  return (
    <>
      <CheckCircleIcon
        aria-hidden="true"
        className="size-3.5 shrink-0 text-emerald-500"
        weight="fill"
      />
      <span className="truncate">{message}</span>
    </>
  );
}

const TOAST_CLASS =
  "flex h-8 w-full items-center gap-2 rounded-lg bg-card px-2.5 text-xs text-foreground shadow-(--custom-shadow)";

export function ToastStackDemo() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    []
  );

  function addToast() {
    const id = nextId.current++;
    const message = TOAST_MESSAGES[id % TOAST_MESSAGES.length];
    setToasts((current) => [...current, { id, message }].slice(-TOAST_LIMIT));
    timers.current.push(
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, TOAST_LIFETIME)
    );
  }

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <style>{`
        @keyframes craft-toast-in {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Compare>
        <CompareItem verdict="wrong" caption="Keyframe entrance">
          <Screen className="h-48">
            <ul
              aria-hidden="true"
              className="absolute inset-x-2 bottom-2 flex flex-col gap-1.5"
            >
              {toasts.map((toast) => (
                <li
                  key={toast.id}
                  className={TOAST_CLASS}
                  style={{
                    animation: `craft-toast-in ${TOAST_MS}ms cubic-bezier(0.23, 1, 0.32, 1) both`,
                  }}
                >
                  <ToastBody message={toast.message} />
                </li>
              ))}
            </ul>
          </Screen>
        </CompareItem>

        <CompareItem verdict="right" caption="Layout animation">
          <Screen className="h-48">
            <ul
              aria-hidden="true"
              className="absolute inset-x-2 bottom-2 flex flex-col gap-1.5"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {toasts.map((toast) => (
                  <motion.li
                    key={toast.id}
                    layout
                    animate={{ opacity: 1, y: 0 }}
                    className={TOAST_CLASS}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    initial={{ opacity: 0, y: "100%" }}
                    transition={{
                      type: "spring",
                      duration: TOAST_MS / 1000,
                      bounce: 0,
                    }}
                  >
                    <ToastBody message={toast.message} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </Screen>
        </CompareItem>
      </Compare>

      <Button onClick={addToast} variant="secondary">
        <PlusIcon aria-hidden="true" weight="bold" />
        Add toast
      </Button>
    </Demo>
  );
}
