"use client";

import {
  ArrowCounterClockwiseIcon,
  BookmarkSimpleIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  PlayIcon,
  UserIcon,
} from "@phosphor-icons/react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Phone, PHONE_INSETS, type Platform } from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* A small news app, "Daily", drawn at the phone's scale. The same pieces
   build the launch screen, the cached first screen and the fresh one, so the
   chrome lines up exactly between them. */

const SCREEN_H = 420;
const TITLE_H = 40;

const CACHED = [
  { title: "City approves new bike lanes", meta: "Local · 4 min" },
  { title: "Five recipes for a rainy weekend", meta: "Food · 6 min" },
  { title: "The quiet comeback of film cameras", meta: "Culture · 8 min" },
  { title: "How tides are measured", meta: "Science · 5 min" },
  { title: "A walk along the old rail line", meta: "Travel · 7 min" },
];

const FRESH = [
  { title: "Storm warning lifted for the coast", meta: "Weather · 2 min" },
  { title: "Transit fares frozen through spring", meta: "Local · 3 min" },
];

function TabBar({ platform = "ios" }: { platform?: Platform }) {
  const icons = [HouseIcon, MagnifyingGlassIcon, BookmarkSimpleIcon, UserIcon];
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 z-10 flex items-start justify-around border-t border-border bg-background/90 pt-2"
      style={{ height: 34 + PHONE_INSETS[platform].bottom }}
    >
      {icons.map((Icon, i) => (
        <Icon
          key={i}
          className={cn("size-[18px]", i === 0 ? "text-foreground" : "text-muted-foreground/70")}
          weight={i === 0 ? "fill" : "regular"}
        />
      ))}
    </div>
  );
}

function Row({
  title,
  meta,
  skeleton = false,
}: {
  title?: string;
  meta?: string;
  skeleton?: boolean;
}) {
  return (
    <div className="flex h-[52px] items-center gap-2.5 px-4">
      <span className="size-10 shrink-0 rounded-lg bg-muted dark:bg-muted/60" />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        {skeleton || !title ? (
          <>
            <span className="h-2 w-4/5 rounded-full bg-muted dark:bg-muted/60" />
            <span className="h-2 w-2/5 rounded-full bg-muted dark:bg-muted/60" />
          </>
        ) : (
          <>
            <span className="truncate text-[11px] font-medium leading-tight">{title}</span>
            <span className="text-[10px] leading-tight text-muted-foreground">{meta}</span>
          </>
        )}
      </span>
    </div>
  );
}

type AppState = "launch" | "cached" | "fresh";

/** The app's own screen: launch (bars only), cached content, or fresh content. */
function AppScreen({
  state,
  platform = "ios",
  banner = false,
  fade = true,
}: {
  state: AppState;
  platform?: Platform;
  banner?: boolean;
  /** Fade fresh stories in where cached ones were. */
  fade?: boolean;
}) {
  const top = PHONE_INSETS[platform].top;
  const rows = state === "fresh" ? [...FRESH, ...CACHED.slice(2)] : CACHED;
  return (
    <div className="absolute inset-0 bg-background">
      <div className="flex items-end justify-between px-4" style={{ height: TITLE_H, marginTop: top }}>
        <span
          className={cn(
            "text-lg leading-none font-bold tracking-tight transition-opacity duration-200 motion-reduce:transition-none",
            state === "launch" ? "opacity-0" : "opacity-100"
          )}
        >
          Today
        </span>
        <span
          className={cn(
            "pb-0.5 text-[10px] text-muted-foreground transition-opacity duration-200 motion-reduce:transition-none",
            state === "launch" ? "opacity-0" : "opacity-100"
          )}
        >
          {state === "fresh" ? "Updated just now" : "Updated 2 h ago"}
        </span>
      </div>
      <div className="mt-2">
        {banner ? (
          <div className="mx-4 mb-1 flex h-16 items-center rounded-xl bg-muted px-3 text-[11px] font-medium text-muted-foreground dark:bg-muted/60">
            Try Daily Plus free for a month
          </div>
        ) : null}
        {rows.map((row, i) => (
          <motion.div
            key={row.title}
            animate={{ opacity: 1 }}
            initial={fade && state === "fresh" && i < FRESH.length ? { opacity: 0 } : false}
            transition={{ duration: 0.25 }}
          >
            <Row meta={row.meta} skeleton={state === "launch"} title={row.title} />
          </motion.div>
        ))}
      </div>
      <TabBar platform={platform} />
    </div>
  );
}

function HomeScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="absolute inset-0 grid grid-cols-4 content-start gap-x-3 gap-y-4 bg-muted/60 px-5 dark:bg-muted/30" style={{ paddingTop: PHONE_INSETS.ios.top + 18 }}>
      {Array.from({ length: 12 }, (_, i) =>
        i === 5 ? (
          <button
            key={i}
            aria-label="Open Daily"
            className="relative flex flex-col items-center gap-1 rounded-xl outline-none after:absolute after:-inset-1 after:content-[''] focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={onOpen}
            type="button"
          >
            <span className="grid aspect-square w-full place-items-center rounded-[22%] bg-foreground text-background shadow-sm">
              <NewspaperIcon className="size-5" weight="fill" />
            </span>
            <span className="text-[9px] font-medium">Daily</span>
          </button>
        ) : (
          <span key={i} aria-hidden="true" className="flex flex-col items-center gap-1">
            <span className="aspect-square w-full rounded-[22%] bg-card shadow-(--custom-shadow)" />
            <span className="h-1.5 w-7 rounded-full bg-muted-foreground/20" />
          </span>
        )
      )}
    </div>
  );
}

/* LaunchDemo: the same app opened two ways, on one clock. */

type Mode = "splash" | "content";

const MODE_OPTIONS = [
  { value: "splash", label: "Logo splash", icon: WRONG_ICON },
  { value: "content", label: "Content first", icon: RIGHT_ICON },
] as const;

const END_MS = 3400;

type Segment = {
  from: number;
  to: number;
  label: string;
  useful: boolean;
  shift?: boolean;
  /** Too narrow for its label on small screens. */
  compact?: boolean;
};

const TIMELINES: Record<Mode, { segments: Segment[]; content: number }> = {
  splash: {
    segments: [
      { from: 0, to: 1500, label: "Logo", useful: false },
      { from: 1500, to: 2600, label: "Spinner", useful: false },
      { from: 2600, to: 3000, label: "", useful: true },
      { from: 3000, to: END_MS, label: "Shift", useful: true, shift: true, compact: true },
    ],
    content: 2600,
  },
  content: {
    segments: [
      { from: 0, to: 400, label: "", useful: false },
      { from: 400, to: 1400, label: "Cached", useful: true },
      { from: 1400, to: END_MS, label: "Fresh", useful: true },
    ],
    content: 400,
  },
};

function SplashScreens({ t }: { t: number }) {
  if (t < 1500) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-foreground text-background">
        <span className="flex flex-col items-center gap-2">
          <span className="grid size-14 place-items-center rounded-2xl bg-background text-foreground">
            <NewspaperIcon className="size-7" weight="fill" />
          </span>
          <span className="text-sm font-bold tracking-tight">Daily</span>
        </span>
      </div>
    );
  }
  if (t < 2600) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-background">
        <span className="size-5 animate-spin rounded-full border-2 border-muted-foreground/60 border-t-transparent motion-reduce:animate-none" />
      </div>
    );
  }
  return <AppScreen banner={t >= 3000} fade={false} state="fresh" />;
}

function ContentFirstScreens({ t }: { t: number }) {
  return <AppScreen state={t < 400 ? "launch" : t < 1400 ? "cached" : "fresh"} />;
}

function TimelineRow({
  mode,
  active,
  progress,
}: {
  mode: Mode;
  active: boolean;
  progress: MotionValue<number>;
}) {
  const line = TIMELINES[mode];
  const pct = (ms: number) => `${(ms / END_MS) * 100}%`;
  const x = useTransform(progress, (v) => `${v * 100}%`);
  return (
    <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
      <span className={cn("text-right text-xs", active ? "font-medium text-foreground" : "text-muted-foreground")}>
        {mode === "splash" ? "Logo splash" : "Content first"}
      </span>
      <div className="relative h-6 overflow-hidden rounded-md bg-muted dark:bg-muted/60">
        {line.segments.map((s) => (
          <span
            key={s.from}
            className={cn(
              "absolute inset-y-1 flex items-center overflow-hidden rounded-sm border-l-2 border-background pl-1 text-[10px] font-medium whitespace-nowrap",
              s.shift
                ? "bg-rose-700 text-white"
                : s.useful
                  ? "bg-foreground/70 text-background"
                  : "bg-muted-foreground/20 text-chart-3 dark:text-foreground"
            )}
            style={{ left: pct(s.from), width: `calc(${pct(s.to - s.from)})` }}
          >
            <span className={s.compact ? "hidden sm:inline" : undefined}>{s.label}</span>
          </span>
        ))}
        <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ x }}>
          <span className="absolute inset-y-0 left-0 w-0.5 -translate-x-1/2 bg-sky-500" />
        </motion.span>
      </div>
    </div>
  );
}

export function LaunchDemo() {
  const [mode, setMode] = useState<Mode>("splash");
  const [t, setT] = useState(-1); // -1: on the home screen
  const progress = useMotionValue(0);
  const run = useRef<ReturnType<typeof animate> | null>(null);

  // Only the moments a screen changes reach React state.
  const cuts = [0, 400, 1400, 1500, 2600, 3000];
  useMotionValueEvent(progress, "change", (v) => {
    const ms = v * END_MS;
    const cut = [...cuts].reverse().find((c) => ms >= c) ?? 0;
    setT((prev) => (prev === -1 || prev === cut ? prev : cut));
  });

  useEffect(() => () => run.current?.stop(), []);

  function launch() {
    run.current?.stop();
    progress.jump(0);
    setT(0);
    run.current = animate(progress, 1, { duration: END_MS / 1000, ease: "linear" });
  }

  function changeMode(next: Mode) {
    setMode(next);
    run.current?.stop();
    progress.jump(0);
    setT(-1);
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone height={SCREEN_H} label={`Daily app, opened with ${mode === "splash" ? "a logo splash" : "its content first"}`}>
        {t < 0 ? (
          <HomeScreen onOpen={launch} />
        ) : mode === "splash" ? (
          <SplashScreens t={t} />
        ) : (
          <ContentFirstScreens t={t} />
        )}
      </Phone>

      <div className="flex w-full max-w-md flex-col gap-2">
        <TimelineRow active={mode === "splash"} mode="splash" progress={progress} />
        <TimelineRow active={mode === "content"} mode="content" progress={progress} />
        <div className="grid grid-cols-[5.5rem_1fr] gap-3 text-[10px] tabular-nums text-muted-foreground">
          <span />
          <span className="flex justify-between">
            <span>0 s</span>
            <span>1 s</span>
            <span>2 s</span>
            <span>3 s</span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <SegmentedControl ariaLabel="Launch style" onChange={changeMode} options={MODE_OPTIONS} value={mode} />
        <Button className="min-w-24" onClick={launch} variant="secondary">
          {t < 0 ? (
            <PlayIcon aria-hidden="true" weight="fill" />
          ) : (
            <ArrowCounterClockwiseIcon aria-hidden="true" weight="bold" />
          )}
          {t < 0 ? "Launch" : "Replay"}
        </Button>
      </div>

      <p className="max-w-sm text-center text-xs text-muted-foreground" aria-live="polite">
        {mode === "splash"
          ? "Launch, then watch for the content: 2.6 s in, and it jumps at 3 s."
          : "Launch: cached stories at 0.4 s, fresh ones swap in without moving."}
      </p>
    </Demo>
  );
}

/* LaunchScreenDemo: what each platform lets you draw before your first frame. */

type Os = "ios" | "android";

const OS_OPTIONS = [
  { value: "ios", label: "iPhone" },
  { value: "android", label: "Android" },
] as const;

// The Android phone is about 412dp wide, drawn 248px: 0.6px per dp.
const DP = 248 / 412;

function AndroidSplash({ guides }: { guides: boolean }) {
  const canvas = 240 * DP;
  const circle = 160 * DP;
  return (
    <div className="absolute inset-0 grid place-items-center bg-background">
      <div className="relative grid place-items-center" style={{ width: canvas, height: canvas }}>
        <span
          className={cn(
            "absolute inset-0 rounded-sm border border-dashed transition-colors duration-200",
            guides ? "border-sky-500/70" : "border-transparent"
          )}
        />
        <span
          className="grid place-items-center rounded-full bg-foreground text-background"
          style={{ width: circle, height: circle }}
        >
          <NewspaperIcon className="size-10" weight="fill" />
        </span>
        <span
          className={cn(
            "absolute -top-5 left-0 text-[10px] text-sky-700 tabular-nums transition-opacity dark:text-sky-400",
            guides ? "opacity-100" : "opacity-0"
          )}
        >
          240 dp icon
        </span>
        <span
          className={cn(
            "absolute -bottom-5 text-[10px] text-sky-700 tabular-nums transition-opacity dark:text-sky-400",
            guides ? "opacity-100" : "opacity-0"
          )}
        >
          160 dp circle mask
        </span>
      </div>
    </div>
  );
}

function IosLaunchGuides({ show }: { show: boolean }) {
  const top = PHONE_INSETS.ios.top;
  const box = "absolute inset-x-2 rounded-md border border-dashed transition-colors duration-200";
  const tone = show ? "border-sky-500/70" : "border-transparent";
  // Tags sit on each box's top border.
  const label = cn(
    "absolute right-4 -translate-y-1/2 rounded bg-background px-1 text-[10px] leading-4 text-sky-700 transition-opacity dark:text-sky-400",
    show ? "opacity-100" : "opacity-0"
  );
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
      <span className={cn(box, tone)} style={{ top: top - 2, height: TITLE_H + 6 }} />
      <span className={label} style={{ top: top - 2 }}>
        Same bars, no title
      </span>
      <span className={cn(box, tone)} style={{ top: top + TITLE_H + 8, bottom: 34 + PHONE_INSETS.ios.bottom + 4 }} />
      <span className={label} style={{ top: top + TITLE_H + 8 }}>
        No text, no logo
      </span>
      <span className={cn(box, tone)} style={{ bottom: 2, height: 34 + PHONE_INSETS.ios.bottom }} />
      <span className={label} style={{ bottom: 34 + PHONE_INSETS.ios.bottom + 2 - 16 }}>
        Same tab bar
      </span>
    </div>
  );
}

export function LaunchScreenDemo() {
  const [os, setOs] = useState<Os>("ios");
  const [opened, setOpened] = useState(false);
  const timer = useRef<number>(undefined);
  const [androidStage, setAndroidStage] = useState<"splash" | "exit" | "app">("splash");

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function open() {
    window.clearTimeout(timer.current);
    if (opened) {
      setOpened(false);
      setAndroidStage("splash");
      return;
    }
    setOpened(true);
    if (os === "android") {
      // The system holds the splash until the app draws its first frame,
      // then plays the exit (here a 200ms fade).
      setAndroidStage("exit");
      timer.current = window.setTimeout(() => setAndroidStage("app"), 200);
    }
  }

  function changeOs(next: Os) {
    window.clearTimeout(timer.current);
    setOs(next);
    setOpened(false);
    setAndroidStage("splash");
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      {os === "ios" ? (
        <Phone height={SCREEN_H} label={opened ? "Daily's first screen" : "Daily's launch screen"}>
          <AppScreen state={opened ? "cached" : "launch"} />
          <IosLaunchGuides show={!opened} />
        </Phone>
      ) : (
        <Phone height={SCREEN_H} label={opened ? "Daily's first screen" : "Android splash screen"} platform="android">
          {androidStage === "app" ? <AppScreen platform="android" state="cached" /> : null}
          {androidStage !== "app" ? (
            <div
              className={cn(
                "absolute inset-0 transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-none",
                androidStage === "exit" ? "scale-95 opacity-0" : "scale-100 opacity-100"
              )}
            >
              <AndroidSplash guides={androidStage === "splash"} />
            </div>
          ) : null}
        </Phone>
      )}

      <p className="max-w-xs text-center text-xs text-muted-foreground">
        {os === "ios"
          ? opened
            ? "Only the content filled in. The bars never moved."
            : "You draw the launch screen: your first screen, emptied."
          : opened
            ? "Straight into cached content, with no second splash."
            : "The system draws it: your icon on a background colour."}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <SegmentedControl ariaLabel="Platform" onChange={changeOs} options={OS_OPTIONS} value={os} />
        <Button aria-pressed={opened} className="min-w-28" onClick={open} variant="secondary">
          {opened ? (
            <ArrowCounterClockwiseIcon aria-hidden="true" weight="bold" />
          ) : (
            <PlayIcon aria-hidden="true" weight="fill" />
          )}
          {opened ? "Back to launch" : "First frame"}
        </Button>
      </div>
    </Demo>
  );
}
