"use client";

import {
  ChatCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  DownloadSimpleIcon,
  FileTextIcon,
  LinkSimpleIcon,
  PlusIcon,
  StarIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Sonner's default lifetime. Toasts with an action get twice as long.
const INFO_MS = 4000;
const ACTION_MS = 8000;
const EXPORT_MS = 3000;
const TOAST_H = 40;
const TOAST_GAP = 6;
// Collapsed stack: each toast behind peeks out 8px and shrinks by 5%, and
// only three are ever visible, like Sonner.
const PEEK = 8;
const VISIBLE = 3;

type ToastIcon = "check" | "download" | "comment" | "user";

type ToastItem = {
  id: number;
  message: string;
  icon: ToastIcon;
  duration: number;
  action?: string;
};

const ICONS = {
  check: (
    <CheckCircleIcon
      aria-hidden="true"
      className="size-4 shrink-0 text-emerald-500"
      weight="fill"
    />
  ),
  download: (
    <DownloadSimpleIcon
      aria-hidden="true"
      className="size-4 shrink-0 text-muted-foreground"
      weight="bold"
    />
  ),
  comment: (
    <ChatCircleIcon
      aria-hidden="true"
      className="size-4 shrink-0 text-muted-foreground"
      weight="fill"
    />
  ),
  user: (
    <UserPlusIcon
      aria-hidden="true"
      className="size-4 shrink-0 text-muted-foreground"
      weight="fill"
    />
  ),
} as const;

/** One list of toasts, owned by a demo. */
function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  function add(toast: Omit<ToastItem, "id">) {
    const id = nextId.current++;
    setToasts((current) => [...current, { ...toast, id }]);
  }

  function dismiss(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  return { toasts, add, dismiss, clear: () => setToasts([]) };
}

/**
 * Toasts in the bottom of a demo frame. `stacked` collapses them into a
 * Sonner-style stack that expands and pauses on hover or focus; otherwise
 * they pile up in a column and their timers never stop.
 */
function ToastRegion({
  toasts,
  stacked,
  onDismiss,
  onPausedChange,
  limit = 6,
}: {
  toasts: ToastItem[];
  stacked: boolean;
  onDismiss: (id: number) => void;
  onPausedChange?: (paused: boolean) => void;
  limit?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const engaged = stacked && (hovered || focused);
  const expanded = engaged && toasts.length > 1;
  // Newest first, so index 0 is the toast in front.
  const ordered = toasts.slice(-limit).reverse();

  useEffect(() => {
    onPausedChange?.(engaged);
  }, [engaged, onPausedChange]);

  return (
    <MotionConfig reducedMotion="user">
      <style>{`
        @keyframes craft-toast-timer {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
      <div
        aria-atomic="false"
        aria-label="Notifications"
        className="absolute inset-x-3 bottom-3 z-20"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setFocused(false);
          }
        }}
        onFocus={() => setFocused(true)}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        role="status"
        style={{
          // While expanded, the hover area covers the whole fan so moving
          // between toasts never collapses it.
          height: expanded
            ? ordered.length * (TOAST_H + TOAST_GAP) - TOAST_GAP
            : TOAST_H,
        }}
      >
        <AnimatePresence initial={false}>
          {ordered.map((toast, index) => {
            const spread = !stacked || expanded;
            const hidden = stacked && !expanded && index >= VISIBLE;
            return (
              <motion.div
                key={toast.id}
                animate={{
                  y: spread ? -index * (TOAST_H + TOAST_GAP) : -index * PEEK,
                  scale: spread ? 1 : 1 - index * 0.05,
                  opacity: hidden ? 0 : 1,
                }}
                className={cn(
                  "absolute inset-x-0 bottom-0 flex items-center gap-2 overflow-hidden rounded-lg bg-card pr-1.5 pl-3 text-xs text-foreground shadow-(--custom-shadow) outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  hidden && "pointer-events-none"
                )}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  transition: { duration: 0.15, ease: "easeIn" },
                }}
                initial={{ y: TOAST_H + 12, opacity: 0 }}
                style={{
                  height: TOAST_H,
                  zIndex: limit - index,
                  transformOrigin: "50% 100%",
                }}
                tabIndex={hidden ? -1 : 0}
                transition={{ type: "spring", duration: 0.4, bounce: 0 }}
              >
                {/* Toasts behind the front one are blank until the stack
                    opens, so their text never overlaps. */}
                <div
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 transition-opacity duration-200",
                    stacked && !expanded && index > 0 && "opacity-0"
                  )}
                >
                  {ICONS[toast.icon]}
                  <span className="min-w-0 flex-1 truncate">
                    {toast.message}
                  </span>
                  {toast.action ? (
                    <Button
                      className="h-6 px-2.5 text-xs"
                      onClick={() => onDismiss(toast.id)}
                      size="xs"
                      tabIndex={hidden ? -1 : undefined}
                      variant="secondary"
                    >
                      {toast.action}
                    </Button>
                  ) : (
                    <span className="w-1.5" />
                  )}
                </div>
                {/* The timer is the bar: when it runs out, the toast goes. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-foreground/15"
                  onAnimationEnd={() => onDismiss(toast.id)}
                  style={{
                    animation: `craft-toast-timer ${toast.duration}ms linear forwards`,
                    animationPlayState: engaged ? "paused" : "running",
                  }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

/** Grey lines standing in for the document. */
function FakeDocument() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2.5 px-4 pt-4">
      <div className="h-2 w-full rounded-full bg-foreground/10" />
      <div className="h-2 w-11/12 rounded-full bg-foreground/10" />
      <div className="h-2 w-4/5 rounded-full bg-foreground/10" />
      <div className="mt-2 h-16 rounded-lg bg-foreground/5" />
      <div className="h-2 w-full rounded-full bg-foreground/10" />
      <div className="h-2 w-2/3 rounded-full bg-foreground/10" />
    </div>
  );
}

type FeedbackMode = "toasts" | "inline";

const FEEDBACK_OPTIONS = [
  { value: "toasts", label: "Toast everything", icon: WRONG_ICON },
  { value: "inline", label: "Inline first", icon: RIGHT_ICON },
] as const;

export function ToastsDemo() {
  const [mode, setMode] = useState<FeedbackMode>("toasts");
  const [starred, setStarred] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [shown, setShown] = useState(0);
  const { toasts, add, dismiss, clear } = useToasts();
  const timers = useRef<number[]>([]);
  const inline = mode === "inline";

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    []
  );

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  function toast(item: Omit<ToastItem, "id">) {
    add(item);
    setShown((count) => count + 1);
  }

  function star() {
    setClicks((count) => count + 1);
    const next = !starred;
    setStarred(next);
    if (!inline) {
      toast({
        message: next ? "Added to starred" : "Removed from starred",
        icon: "check",
        duration: INFO_MS,
      });
    }
  }

  function copy() {
    setClicks((count) => count + 1);
    navigator.clipboard
      ?.writeText("https://craft.dev/q4-report")
      .catch(() => {});
    if (inline) {
      setCopied(true);
      later(() => setCopied(false), 1500);
    } else {
      toast({
        message: "Link copied to clipboard",
        icon: "check",
        duration: INFO_MS,
      });
    }
  }

  function exportPdf() {
    setClicks((count) => count + 1);
    setExporting(true);
    if (!inline) {
      toast({
        message: "Exporting Q4 report…",
        icon: "download",
        duration: INFO_MS,
      });
    }
    later(() => {
      setExporting(false);
      // Finishing is the one event that happens away from the button: by
      // now the reader may be anywhere.
      toast({
        message: "Q4 report.pdf is ready",
        icon: "download",
        duration: ACTION_MS,
        action: "Download",
      });
    }, EXPORT_MS);
  }

  function changeMode(next: FeedbackMode) {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    clear();
    setStarred(false);
    setCopied(false);
    setExporting(false);
    setClicks(0);
    setShown(0);
    setMode(next);
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="relative h-72 w-full max-w-md overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)">
        <div className="flex h-12 items-center gap-1.5 border-b border-border pr-2 pl-3.5">
          <FileTextIcon
            aria-hidden="true"
            className="hidden size-4 shrink-0 text-muted-foreground sm:block"
          />
          <span className="truncate text-xs font-medium text-foreground">
            Q4 report
          </span>
          <Button
            aria-label={starred ? "Unstar" : "Star"}
            aria-pressed={starred}
            className={cn(
              "shrink-0",
              starred ? "text-amber-500" : "text-muted-foreground"
            )}
            onClick={star}
            size="icon-xs"
            variant="ghost"
          >
            <StarIcon weight={starred ? "fill" : "bold"} />
          </Button>
          <div className="ml-auto flex shrink-0 gap-1.5">
            <Button
              className="w-[5.5rem]"
              onClick={copy}
              size="xs"
              variant="secondary"
            >
              {copied ? (
                <CheckIcon aria-hidden="true" weight="bold" />
              ) : (
                <LinkSimpleIcon aria-hidden="true" weight="bold" />
              )}
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button
              className="w-[5.5rem]"
              disabled={exporting}
              onClick={exportPdf}
              size="xs"
              variant="secondary"
            >
              {exporting && inline ? (
                <span
                  aria-hidden="true"
                  className="size-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
                />
              ) : (
                <DownloadSimpleIcon aria-hidden="true" weight="bold" />
              )}
              {exporting && inline ? "Exporting" : "Export"}
            </Button>
          </div>
        </div>
        <FakeDocument />
        <ToastRegion onDismiss={dismiss} stacked toasts={toasts} />
      </div>

      <p className="text-xs text-muted-foreground">
        <span className="text-foreground tabular-nums">{clicks}</span>{" "}
        {clicks === 1 ? "click" : "clicks"},{" "}
        <span
          className={cn(
            "tabular-nums",
            !inline && shown > 1 ? "text-destructive" : "text-foreground"
          )}
        >
          {shown}
        </span>{" "}
        {shown === 1 ? "toast" : "toasts"}
      </p>

      <SegmentedControl
        ariaLabel="Feedback"
        onChange={changeMode}
        options={FEEDBACK_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}

const STACK_MESSAGES: Omit<ToastItem, "id">[] = [
  { message: "Ada joined Design", icon: "user", duration: INFO_MS },
  {
    message: "Q4 report.pdf is ready",
    icon: "download",
    duration: ACTION_MS,
    action: "Download",
  },
  { message: "Backup finished", icon: "check", duration: INFO_MS },
  {
    message: "3 new comments",
    icon: "comment",
    duration: ACTION_MS,
    action: "View",
  },
  { message: "Sync complete", icon: "check", duration: INFO_MS },
];

type StackMode = "pile" | "stack";

const STACK_OPTIONS = [
  { value: "pile", label: "Piles up", icon: WRONG_ICON },
  { value: "stack", label: "Stacks", icon: RIGHT_ICON },
] as const;

export function ToastStackingDemo() {
  const [mode, setMode] = useState<StackMode>("pile");
  const [paused, setPaused] = useState(false);
  const { toasts, add, dismiss, clear } = useToasts();
  const count = useRef(0);
  const stacked = mode === "stack";

  function addToast() {
    add(STACK_MESSAGES[count.current++ % STACK_MESSAGES.length]);
  }

  function changeMode(next: StackMode) {
    clear();
    count.current = 0;
    setMode(next);
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="relative h-72 w-full max-w-md overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)">
        <div className="flex h-12 items-center border-b border-border px-3.5">
          <span className="text-xs font-medium text-foreground">Inbox</span>
        </div>
        <FakeDocument />
        <ToastRegion
          onDismiss={dismiss}
          onPausedChange={setPaused}
          stacked={stacked}
          toasts={toasts}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={addToast} variant="secondary">
          <PlusIcon aria-hidden="true" weight="bold" />
          Add toast
        </Button>
        <p className="w-28 text-xs text-muted-foreground">
          Timers{" "}
          <span className="text-foreground">
            {paused ? "paused" : "running"}
          </span>
        </p>
      </div>

      <SegmentedControl
        ariaLabel="Stacking"
        onChange={changeMode}
        options={STACK_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}
