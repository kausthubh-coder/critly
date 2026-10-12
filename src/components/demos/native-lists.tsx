"use client";

import { ArrowClockwiseIcon, ArrowDownIcon, ArrowUpIcon } from "@phosphor-icons/react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { HapticRing, Phone, PHONE_INSETS, PHONE_WIDTH, type Platform, vibrate } from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { springFromFeel } from "@/lib/spring";
import { cn } from "@/lib/utils";

/* Shared: a feed of 500 people. */

const NAMES = [
  "Ava", "Ben", "Chloe", "Dev", "Elif", "Finn", "Gia", "Hugo", "Isla", "Jon",
  "Kira", "Leo", "Maya", "Nico", "Omar", "Pia", "Quinn", "Rosa", "Sami", "Tess",
  "Uma", "Vik", "Wren", "Yara", "Zed",
];
const LINES = [
  "Sent a photo", "Liked your post", "See you at 6?", "Running late", "Shared a link",
  "Thanks!", "Voice message", "Can you call me", "On my way", "Looks great",
];
const COUNT = 500;
const item = (i: number) => ({
  id: i,
  name: `${NAMES[i % NAMES.length]} ${String.fromCharCode(65 + ((i * 7) % 26))}.`,
  line: LINES[(i * 3) % LINES.length],
  hue: (i * 47) % 360,
});

/* RecyclingDemo: the same list built two ways. The counts under the phone
   are real: they count the row components this page actually creates. */

const ROW_H = 48;
const SCREEN_H = 400;
const LIST_TOP = PHONE_INSETS.ios.top + 36;
const LIST_H = SCREEN_H - LIST_TOP;
const POOL = Math.ceil(LIST_H / ROW_H) + 4; // visible rows plus a buffer

type ListMode = "all" | "recycle";

const LIST_OPTIONS = [
  { value: "all", label: "ScrollView + map", icon: WRONG_ICON },
  { value: "recycle", label: "FlashList", icon: RIGHT_ICON },
] as const;

type Counters = { created: number; rebinds: number; mounted: number };

const RowView = memo(function RowView({
  index,
  counters,
  style,
}: {
  index: number;
  counters: React.RefObject<Counters>;
  style?: React.CSSProperties;
}) {
  // Each component instance gets a number when it's created. Refs survive
  // React's dev double-mount, so each instance is counted once.
  const [instance, setInstance] = useState(0);
  const id = useRef(0);
  const lastIndex = useRef<number | null>(null);
  useEffect(() => {
    if (!id.current) {
      id.current = ++counters.current.created;
      setInstance(id.current);
    }
    counters.current.mounted++;
    return () => {
      counters.current.mounted--;
    };
  }, [counters]);
  useEffect(() => {
    // The same component, handed a different item: a reuse.
    if (lastIndex.current !== null && lastIndex.current !== index) counters.current.rebinds++;
    lastIndex.current = index;
  }, [index, counters]);

  const data = item(index);
  return (
    <div className="flex items-center gap-2.5 px-3" style={{ height: ROW_H, ...style }}>
      <span
        className="size-8 shrink-0 rounded-full"
        style={{ background: `oklch(0.82 0.06 ${data.hue})` }}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[11px] font-medium leading-tight">{data.name}</span>
        <span className="truncate text-[10px] leading-tight text-foreground/65">{data.line}</span>
      </span>
      <span className="shrink-0 rounded bg-muted px-1 font-mono text-[9px] tabular-nums text-chart-3 dark:bg-muted/60 dark:text-muted-foreground">
        cell {instance || "·"}
      </span>
    </div>
  );
});

function AllRows({ scrollTop, counters }: { scrollTop: number; counters: React.RefObject<Counters> }) {
  // Every row that has ever been on screen stays mounted.
  const [seen, setSeen] = useState(POOL);
  const needed = Math.min(COUNT, Math.ceil((scrollTop + LIST_H) / ROW_H) + 2);
  useLayoutEffect(() => {
    if (needed > seen) setSeen(needed);
  }, [needed, seen]);
  return (
    <div className="relative" style={{ height: COUNT * ROW_H }}>
      {Array.from({ length: Math.max(seen, needed) }, (_, i) => (
        <RowView key={i} counters={counters} index={i} style={{ position: "absolute", top: i * ROW_H, left: 0, right: 0 }} />
      ))}
    </div>
  );
}

function RecycledRows({ scrollTop, counters }: { scrollTop: number; counters: React.RefObject<Counters> }) {
  // A fixed pool of cells. Cell k always shows an item whose index is k mod
  // POOL, so leaving rows hand their cell to arriving ones.
  const start = Math.max(0, Math.min(COUNT - POOL, Math.floor(scrollTop / ROW_H) - 2));
  const cells = Array.from({ length: POOL }, (_, k) => {
    const offset = (k - (start % POOL) + POOL) % POOL;
    return { k, index: start + offset };
  });
  return (
    <div className="relative" style={{ height: COUNT * ROW_H }}>
      {cells.map(({ k, index }) => (
        <RowView
          key={k}
          counters={counters}
          index={index}
          style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${index * ROW_H}px)` }}
        />
      ))}
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span
        className={cn(
          "text-xl font-semibold tabular-nums",
          warn ? "text-rose-600 dark:text-rose-400" : "text-foreground"
        )}
      >
        {value}
      </span>
      <span className="text-[11px] leading-tight text-muted-foreground">{label}</span>
    </div>
  );
}

function RecyclingList({ mode }: { mode: ListMode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const counters = useRef<Counters>({ created: 0, rebinds: 0, mounted: 0 });
  const [scrollTop, setScrollTop] = useState(0);
  const [stats, setStats] = useState<Counters>({ created: 0, rebinds: 0, mounted: 0 });
  const fling = useRef<ReturnType<typeof animate> | null>(null);
  const reduce = useReducedMotion();

  // Only re-render when the first visible row changes, not every pixel.
  function onScroll() {
    const top = scroller.current?.scrollTop ?? 0;
    const row = Math.floor(top / ROW_H);
    setScrollTop((prev) => (Math.floor(prev / ROW_H) === row ? prev : top));
  }

  useEffect(() => {
    setStats({ ...counters.current });
  }, [scrollTop]);

  useEffect(() => () => fling.current?.stop(), []);

  function flick(direction: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    fling.current?.stop();
    const max = el.scrollHeight - el.clientHeight;
    const to = Math.max(0, Math.min(max, el.scrollTop + direction * 4000));
    if (reduce) {
      el.scrollTop = to;
      return;
    }
    // A decelerating throw, like a fast fling.
    fling.current = animate(el.scrollTop, to, {
      duration: 1.6,
      ease: [0.15, 0.85, 0.3, 1],
      onUpdate: (v) => {
        el.scrollTop = v;
      },
    });
  }

  const climbing = mode === "all" && stats.mounted > POOL * 3;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
      <Phone height={SCREEN_H} label="Messages list">
        <div className="absolute inset-x-4 flex items-center" style={{ top: PHONE_INSETS.ios.top + 6 }}>
          <span className="text-sm font-semibold">Messages</span>
        </div>
        <div
          ref={scroller}
          // clip-path repeats the overflow clip so tools that only read
          // clip-path know the rows below the fold aren't painted.
          aria-label="Messages, 500 rows"
          className="absolute inset-x-0 bottom-0 overflow-y-auto overscroll-contain [clip-path:inset(0)] border-t border-border outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
          onPointerDown={() => fling.current?.stop()}
          onScroll={onScroll}
          onWheel={() => fling.current?.stop()}
          role="region"
          style={{ top: LIST_TOP }}
          tabIndex={0}
        >
          {mode === "all" ? (
            <AllRows counters={counters} scrollTop={scrollTop} />
          ) : (
            <RecycledRows counters={counters} scrollTop={scrollTop} />
          )}
          <div style={{ height: PHONE_INSETS.ios.bottom }} />
        </div>
      </Phone>

      <div className="flex w-full max-w-[248px] flex-col gap-5 sm:w-36">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:gap-4">
          <Stat label="Rows mounted" value={stats.mounted} warn={climbing} />
          <Stat label="Rows created" value={stats.created} warn={climbing} />
          <Stat label="Rows reused" value={stats.rebinds} />
        </div>
        <div className="flex gap-2 sm:flex-col">
          <Button className="flex-1 sm:flex-none" onClick={() => flick(1)} variant="outline">
            <ArrowDownIcon aria-hidden="true" weight="bold" />
            Fling down
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={() => flick(-1)} variant="outline">
            <ArrowUpIcon aria-hidden="true" weight="bold" />
            Fling up
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RecyclingDemo() {
  const [mode, setMode] = useState<ListMode>("all");
  return (
    <Demo className="gap-6 px-4 sm:px-8">
      {/* Remount per mode so each starts from the top with fresh counts. */}
      <RecyclingList key={mode} mode={mode} />
      <SegmentedControl ariaLabel="How the list is built" onChange={setMode} options={LIST_OPTIONS} value={mode} />
      <p className="max-w-sm text-center text-xs text-muted-foreground">
        Scroll or fling the list, then watch the counts and the cell tags.
      </p>
    </Demo>
  );
}

/* PullToRefreshDemo: the two platform controls. iOS pulls the content down
   and reveals a spinner above it; Android leaves the content still and drops
   a circular indicator over it. */

const THRESHOLD = 64;
const HOLD = { ios: 52, android: 60 };
const SETTLE = springFromFeel(0.35, 0);
const PTR_SCREEN_H = 420;

// iOS-style resistance: follows less and less, never past `size`.
function rubberBand(raw: number, size = 260, c = 0.55) {
  if (raw <= 0) return 0;
  return (1 - 1 / ((raw * c) / size + 1)) * size;
}

function IosSpinner({ progress, spinning }: { progress: number; spinning: boolean }) {
  // Spokes appear one by one as you pull, then spin.
  return (
    <svg
      aria-hidden="true"
      className={cn("size-6 text-muted-foreground", spinning && "animate-spin motion-reduce:animate-none")}
      style={spinning ? { animationDuration: "0.9s", animationTimingFunction: "steps(8)" } : undefined}
      viewBox="0 0 24 24"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          fill="currentColor"
          height="6"
          opacity={spinning ? 0.25 + (i / 8) * 0.75 : progress * 8 > i ? 0.25 + (i / 8) * 0.75 : 0}
          rx="1"
          transform={`rotate(${i * 45} 12 12)`}
          width="2.4"
          x="10.8"
          y="1.5"
        />
      ))}
    </svg>
  );
}

function MaterialIndicator({ progress, spinning }: { progress: number; spinning: boolean }) {
  const r = 8;
  const c = 2 * Math.PI * r;
  const arc = spinning ? 0.7 : Math.min(0.8, progress * 0.8);
  return (
    <span className="grid size-9 place-items-center rounded-full bg-card shadow-md ring-1 ring-border">
      <svg
        aria-hidden="true"
        className={cn("size-5", spinning && "animate-spin motion-reduce:animate-none")}
        style={{ transform: spinning ? undefined : `rotate(${progress * 270}deg)` }}
        viewBox="0 0 20 20"
      >
        <circle
          className="text-foreground"
          cx="10"
          cy="10"
          fill="none"
          r={r}
          stroke="currentColor"
          strokeDasharray={`${arc * c} ${c}`}
          strokeLinecap="round"
          strokeWidth="2.2"
        />
      </svg>
    </span>
  );
}

const PLATFORM_OPTIONS = [
  { value: "ios", label: "iPhone" },
  { value: "android", label: "Android" },
] as const;

function PullList({ platform }: { platform: Platform }) {
  const offset = useMotionValue(0); // displayed pull distance
  const [progress, setProgress] = useState(0); // 0..1, coarse steps for the indicator
  const [refreshing, setRefreshing] = useState(false);
  const [fresh, setFresh] = useState(0);
  const [pulse, setPulse] = useState(0);
  const drag = useRef<{ startY: number; armed: boolean; k: number } | null>(null);
  const timer = useRef<number>(undefined);
  const reduce = useReducedMotion();

  const contentY = useTransform(offset, (v) => (platform === "ios" ? v : 0));
  const indicatorY = useTransform(offset, (v) => (platform === "ios" ? v / 2 - 12 : v - 40));
  const indicatorScale = useTransform(offset, (v) => (platform === "android" ? Math.min(1, v / 24) : 1));

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function settle(to: number) {
    animate(offset, to, reduce ? { duration: 0.15 } : { type: "spring", ...SETTLE });
  }

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setProgress(1);
    settle(HOLD[platform]);
    timer.current = window.setTimeout(() => {
      setFresh((n) => n + 1);
      setRefreshing(false);
      setProgress(0);
      settle(0);
    }, 1300);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (refreshing) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    // On a phone the screen is scaled up; pointer px divide by that scale.
    const el = event.currentTarget;
    const k = el.getBoundingClientRect().height / el.offsetHeight || 1;
    drag.current = { startY: event.clientY, armed: false, k };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const shown = rubberBand((event.clientY - d.startY) / d.k);
    offset.set(shown);
    const p = Math.min(1, shown / THRESHOLD);
    setProgress((prev) => (Math.round(prev * 8) === Math.round(p * 8) ? prev : p));
    if (!d.armed && shown >= THRESHOLD) {
      d.armed = true;
      setPulse((n) => n + 1);
      vibrate("light");
    } else if (d.armed && shown < THRESHOLD) {
      d.armed = false;
    }
  }

  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.armed) refresh();
    else {
      setProgress(0);
      settle(0);
    }
  }

  const rows = Array.from({ length: 8 }, (_, i) => item(i + 40 - fresh * 2));
  const top = PHONE_INSETS[platform].top;
  const headerH = 36;

  return (
    <div className="flex flex-col items-center gap-4">
      <Phone height={PTR_SCREEN_H} label="Inbox, pull down to refresh" platform={platform}>
        <div className="absolute inset-x-4 z-10 flex items-center justify-between bg-background" style={{ top, height: headerH }}>
          <span className="text-sm font-semibold">Inbox</span>
          <span className="text-[10px] text-muted-foreground" aria-live="polite">
            {fresh ? "Updated just now" : "Updated 1 h ago"}
          </span>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 cursor-grab touch-none overflow-hidden active:cursor-grabbing"
          onLostPointerCapture={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ top: top + headerH }}
        >
          <motion.div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute left-1/2 -ml-[18px] grid w-9 place-items-center",
              platform === "ios" ? "z-0" : "z-20"
            )}
            style={{ top: 0, y: indicatorY, scale: indicatorScale }}
          >
            {platform === "ios" ? (
              <IosSpinner progress={progress} spinning={refreshing} />
            ) : (
              <MaterialIndicator progress={progress} spinning={refreshing} />
            )}
          </motion.div>

          <motion.div className="relative z-10 bg-background" style={{ y: contentY }}>
            {rows.map((row, i) => (
              <motion.div
                key={row.id}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2.5 border-b border-border/60 px-4"
                initial={fresh && i < 2 ? { opacity: 0 } : false}
                style={{ height: 50 }}
                transition={{ duration: 0.25 }}
              >
                <span className="size-8 shrink-0 rounded-full" style={{ background: `oklch(0.82 0.06 ${row.hue})` }} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[11px] font-medium leading-tight">{row.name}</span>
                  <span className="truncate text-[10px] leading-tight text-foreground/65">{row.line}</span>
                </span>
                {fresh && i < 2 ? <span className="size-2 rounded-full bg-sky-500" /> : null}
              </motion.div>
            ))}
          </motion.div>
        </div>
        <HapticRing kind="light" pulse={pulse} x={PHONE_WIDTH / 2} y={top + headerH + THRESHOLD / 2} />
      </Phone>

      <Button disabled={refreshing} onClick={refresh} variant="secondary">
        <ArrowClockwiseIcon aria-hidden="true" weight="bold" />
        Refresh
      </Button>
    </div>
  );
}

export function PullToRefreshDemo() {
  const [platform, setPlatform] = useState<Platform>("ios");
  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <PullList key={platform} platform={platform} />
      <SegmentedControl ariaLabel="Platform" onChange={setPlatform} options={PLATFORM_OPTIONS} value={platform} />
      <p className="max-w-sm text-center text-xs text-muted-foreground">
        Pull the list down past the ring and let go, or press Refresh.
      </p>
    </Demo>
  );
}
