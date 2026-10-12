"use client";

import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";

// A phone frame for the Mobile demos: a screen with a status bar and a home
// indicator, drawn as iOS or Android. It is roughly 0.63 of a real 393pt
// iPhone, so a 44pt row is about 28px here. Content goes in the screen; use
// PHONE_INSETS to keep it out of the status bar and the gesture area the way
// a real app keeps out of the safe area.

export type Platform = "ios" | "android";

export const PHONE_WIDTH = 248;

/** Safe-area insets of the drawn screen, in px. */
export const PHONE_INSETS: Record<Platform, { top: number; bottom: number }> = {
  ios: { top: 34, bottom: 20 },
  android: { top: 28, bottom: 16 },
};

// Nested radius: inner = outer - padding (see Nested Border Radius).
const FRAME = {
  ios: { outer: 42, padding: 6 },
  android: { outer: 34, padding: 6 },
} as const;

export function Phone({
  platform = "ios",
  height = 460,
  width = PHONE_WIDTH,
  chrome = true,
  className,
  screenClassName,
  children,
  label,
}: {
  platform?: Platform;
  height?: number;
  width?: number;
  /** Draw the status bar and home indicator. */
  chrome?: boolean;
  className?: string;
  screenClassName?: string;
  children?: React.ReactNode;
  /** Accessible name for the screen, e.g. "Mail inbox on iPhone". */
  label?: string;
}) {
  const frame = FRAME[platform];
  return (
    <div
      className={cn("max-w-full shrink-0 bg-card shadow-(--custom-shadow)", className)}
      style={{ borderRadius: frame.outer, padding: frame.padding, width: width + frame.padding * 2 }}
    >
      <div
        aria-label={label}
        data-phone={platform}
        className={cn(
          "relative isolate w-full overflow-clip bg-background select-none [-webkit-tap-highlight-color:transparent]",
          screenClassName
        )}
        role={label ? "group" : undefined}
        // The clip-path repeats what overflow-clip already does, for tools
        // (like the Critly check) that only read clip-path as clipping.
        style={{
          borderRadius: frame.outer - frame.padding,
          clipPath: `inset(0 round ${frame.outer - frame.padding}px)`,
          height,
        }}
      >
        {children}
        {chrome ? <StatusBar platform={platform} /> : null}
        {chrome ? <HomeIndicator platform={platform} /> : null}
      </div>
    </div>
  );
}

export function StatusBar({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  const ios = platform === "ios";
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between text-[11px] font-semibold tabular-nums text-foreground",
        ios ? "px-6" : "px-4",
        className
      )}
      style={{ height: PHONE_INSETS[platform].top }}
    >
      <span className={ios ? "w-14" : "w-14 font-medium"}>9:41</span>
      {ios ? (
        <span className="absolute top-[8px] left-1/2 h-[20px] w-[70px] -translate-x-1/2 rounded-full bg-black" />
      ) : (
        <span className="absolute top-[9px] left-1/2 size-[10px] -translate-x-1/2 rounded-full bg-black" />
      )}
      <span className="flex w-14 items-center justify-end gap-1">
        <SignalIcon />
        <BatteryIcon platform={platform} />
      </span>
    </div>
  );
}

export function HomeIndicator({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute left-1/2 z-40 -translate-x-1/2 rounded-full bg-foreground",
        platform === "ios"
          ? "bottom-[6px] h-[4px] w-[86px] opacity-80"
          : "bottom-[6px] h-[3px] w-[64px] opacity-60",
        className
      )}
    />
  );
}

function SignalIcon() {
  return (
    <svg className="h-[9px] w-[14px]" fill="currentColor" viewBox="0 0 14 9">
      <rect height="3" rx="0.6" width="2.4" x="0" y="6" />
      <rect height="5" rx="0.6" width="2.4" x="3.8" y="4" />
      <rect height="7" rx="0.6" width="2.4" x="7.6" y="2" />
      <rect height="9" rx="0.6" width="2.4" x="11.4" y="0" />
    </svg>
  );
}

function BatteryIcon({ platform }: { platform: Platform }) {
  if (platform === "android") {
    return (
      <svg className="h-[10px] w-[6px]" fill="currentColor" viewBox="0 0 6 10">
        <rect height="1.2" rx="0.4" width="2.4" x="1.8" y="0" />
        <rect height="8.8" rx="1" width="6" x="0" y="1.2" />
      </svg>
    );
  }
  return (
    <svg className="h-[10px] w-[21px]" viewBox="0 0 21 10">
      <rect
        fill="none"
        height="9"
        opacity="0.4"
        rx="2.6"
        stroke="currentColor"
        width="18"
        x="0.5"
        y="0.5"
      />
      <rect fill="currentColor" height="6" rx="1.4" width="13" x="2" y="2" />
      <rect fill="currentColor" height="3.4" opacity="0.4" rx="0.8" width="1.4" x="19.4" y="3.3" />
    </svg>
  );
}

/**
 * Phones can't be felt through a web page, so the demos show haptics: a ring
 * at the point of contact, and a real vibration where the browser has one
 * (Android Chrome; iOS Safari has no vibration API).
 */
export type HapticKind = "selection" | "light" | "medium" | "heavy" | "success" | "warning" | "error";

const VIBRATION: Record<HapticKind, number | number[]> = {
  selection: 6,
  light: 10,
  medium: 16,
  heavy: 24,
  success: [12, 60, 12],
  warning: [16, 80, 16],
  error: [16, 50, 16, 50, 16],
};

export function vibrate(kind: HapticKind) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(VIBRATION[kind]);
    } catch {
      // Blocked without a user gesture; the ring still shows.
    }
  }
}

/**
 * A ring that pulses each time `pulse` changes (pass a counter). Position it
 * with `x`/`y` in the parent's coordinates; the parent needs `relative`.
 */
export function HapticRing({
  pulse,
  x,
  y,
  kind = "light",
}: {
  pulse: number;
  x: number;
  y: number;
  kind?: HapticKind;
}) {
  const size = kind === "selection" ? 22 : kind === "heavy" ? 44 : 32;
  return (
    <AnimatePresence>
      {pulse > 0 ? (
        <motion.span
          key={pulse}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute z-50 rounded-full border-2",
            kind === "error" || kind === "warning"
              ? "border-rose-500/70"
              : kind === "success"
                ? "border-emerald-500/70"
                : "border-sky-500/70"
          )}
          initial={{ opacity: 0.9, scale: 0.4 }}
          animate={{ opacity: 0, scale: 1.2 }}
          exit={{ opacity: 0 }}
          style={{ left: x - size / 2, top: y - size / 2, width: size, height: size }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        />
      ) : null}
    </AnimatePresence>
  );
}
