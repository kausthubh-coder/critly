"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

// A phone frame for the Mobile demos: a screen with a status bar and a home
// indicator, drawn as iOS or Android. Demos lay the screen out at 248px wide,
// about 0.63 of a real 393pt iPhone, so a 44pt row is about 28px. Content goes
// in the screen; use PHONE_INSETS to keep it out of the status bar and the
// gesture area the way a real app keeps out of the safe area.
//
// On desktop the screen sits in a small frame. On a phone (640px and down) the
// frame goes away and the screen scales up to the width of the phone you're
// holding, inset 6px so it nests in its corners. That's close to real size:
// a 44pt row becomes about 44px under your thumb, and a swipe covers the
// distance it would in a real app. Demos keep working in 248px coordinates;
// anything they measure in screen pixels (clientX, getBoundingClientRect)
// must go through usePhoneScale().

export type Platform = "ios" | "android";

const PhoneScaleContext = createContext(1);

/**
 * How many screen pixels one layout pixel of the phone covers: 1 on desktop,
 * about 1.5 on a phone. Divide distances measured in screen pixels (pointer
 * deltas, getBoundingClientRect) by it before using them inside the phone.
 * Motion's drag and pan already get converted points.
 */
export function usePhoneScale() {
  return useContext(PhoneScaleContext);
}

/**
 * The same scale, read from the DOM: works from any element inside a phone
 * screen, including in the component that renders <Phone> itself, where the
 * hook above can't see the provider. 1 outside a phone.
 */
export function phoneScaleOf(el: Element | null | undefined) {
  const screen = el?.closest<HTMLElement>("[data-phone]");
  if (!screen || !screen.offsetWidth) return 1;
  return screen.getBoundingClientRect().width / screen.offsetWidth;
}

// Tailwind's max-sm, and the CSS in globals.css (.phone-track, .phone-box).
const MOBILE = "(width < 40rem)";

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
  const radius = frame.outer - frame.padding;
  const box = useRef<HTMLDivElement>(null);
  // null until measured; the screen stays hidden on a phone until then, while
  // CSS has already reserved its final size, so nothing jumps.
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const media = matchMedia(MOBILE);
    const measure = () =>
      setScale(media.matches ? el.clientWidth / width : 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    media.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", measure);
    };
  }, [width]);

  const k = scale ?? 1;
  const toLocal = useCallback(
    (point: { x: number; y: number }) => ({ x: point.x / k, y: point.y / k }),
    [k]
  );

  return (
    // On a phone: a full-bleed track, so the screen can use the whole width.
    <div
      className={cn("phone-track flex max-w-full shrink-0 justify-center", className)}
    >
      <div
        // On a phone the bezel goes; the hairline stays, on the screen's corners.
        className="rounded-(--frame-r) bg-card p-1.5 shadow-(--custom-shadow) max-sm:mx-auto max-sm:w-fit max-sm:rounded-(--screen-r) max-sm:bg-transparent max-sm:p-0"
        style={
          {
            "--frame-r": `${frame.outer}px`,
            "--screen-r": `${radius * k}px`,
            "--phone-w": width,
            "--phone-h": height,
          } as React.CSSProperties
        }
      >
        {/* The box the screen scales into: its layout size on desktop; on a
            phone the full width, capped so the whole screen fits the view. */}
        <div
          ref={box}
          className="phone-box relative mx-auto overflow-clip"
          style={{
            borderRadius: radius * k,
            clipPath: `inset(0 round ${radius * k}px)`,
          }}
        >
          <div
            aria-label={label}
            data-phone={platform}
            className={cn(
              "absolute top-0 left-0 isolate origin-top-left overflow-clip bg-background select-none [-webkit-tap-highlight-color:transparent]",
              scale === null && "max-sm:invisible",
              screenClassName
            )}
            role={label ? "group" : undefined}
            // The clip-path repeats what overflow-clip already does, for tools
            // (like the Critly check) that only read clip-path as clipping.
            style={{
              borderRadius: radius,
              clipPath: `inset(0 round ${radius}px)`,
              width,
              height,
              transform: k === 1 ? undefined : `scale(${k})`,
            }}
          >
            <PhoneScaleContext.Provider value={k}>
              <MotionConfig transformPagePoint={k === 1 ? undefined : toLocal}>
                {children}
              </MotionConfig>
            </PhoneScaleContext.Provider>
            {chrome ? <StatusBar platform={platform} /> : null}
            {chrome ? <HomeIndicator platform={platform} /> : null}
          </div>
        </div>
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
