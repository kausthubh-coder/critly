"use client";

import { MusicNotesIcon, PlayIcon, SquaresFourIcon, UserIcon } from "@phosphor-icons/react";
import { useLayoutEffect, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Phone, PHONE_INSETS, type Platform } from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1";

/* Painted onto the insets, like the Hit Areas overlay. */
const PAINT = "bg-rose-500/12 outline-1 outline-dashed outline-rose-500/70 -outline-offset-1";

const SONGS = [
  "Slow Morning",
  "Paper Boats",
  "Northbound",
  "Glasshouse",
  "Late Bloom",
  "Tidewater",
  "Small Hours",
  "Field Notes",
  "Afterglow",
  "Low Light",
  "Copper Sky",
  "Homeward",
  "Last Song",
] as const;

function Art({ i, size }: { i: number; size: number }) {
  return (
    <span
      aria-hidden="true"
      className="shrink-0 rounded-[5px]"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, oklch(0.78 0.09 ${(i * 41) % 360}), oklch(0.62 0.1 ${(i * 41 + 60) % 360}))`,
      }}
    />
  );
}

/* SafeAreaDemo: one screen, three ways to treat the insets. */

type Mode = "ignored" | "boxed" | "edge";

const PLATFORM_OPTIONS = [
  { value: "ios", label: "iPhone" },
  { value: "android", label: "Android" },
] as const;

const MODE_OPTIONS = [
  { value: "ignored", label: "Ignored", icon: WRONG_ICON },
  { value: "boxed", label: "Boxed", icon: WRONG_ICON },
  { value: "edge", label: "Edge to edge", icon: RIGHT_ICON },
] as const;

const OVERLAY_OPTIONS = [
  { value: "hidden", label: "Normal" },
  { value: "shown", label: "Show insets" },
] as const;

const HERO =
  "bg-linear-to-b from-indigo-300 to-sky-100 dark:from-indigo-900 dark:to-slate-900";

export function SafeAreaDemo() {
  const [platform, setPlatform] = useState<Platform>("ios");
  const [mode, setMode] = useState<Mode>("ignored");
  const [overlay, setOverlay] = useState<"hidden" | "shown">("hidden");
  const inset = PHONE_INSETS[platform];

  // Where the app's own background and content go in each mode.
  const bg = mode === "boxed" ? { top: inset.top, bottom: inset.bottom } : { top: 0, bottom: 0 };
  const pad =
    mode === "ignored" ? { top: 6, bottom: 6 } : { top: inset.top + 10, bottom: inset.bottom + 8 };

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone
        height={440}
        label={`Playlist screen on ${platform === "ios" ? "iPhone" : "Android"}`}
        platform={platform}
      >
        {/* Boxed: the system bars stay plain, the app starts below them. */}
        <div className={cn("absolute inset-x-0 overflow-hidden", HERO)} style={bg}>
          <div
            className="flex h-full flex-col px-3.5"
            style={{
              paddingTop: mode === "boxed" ? 10 : pad.top,
              paddingBottom: mode === "boxed" ? 8 : pad.bottom,
            }}
          >
            <div className="flex items-center gap-3">
              <Art i={2} size={64} />
              <div className="flex min-w-0 flex-col">
                <p className="text-[17px] leading-tight font-bold tracking-tight">Morning Mix</p>
                <p className="text-[10px] text-foreground/80">13 songs, 48 min</p>
              </div>
            </div>
            <ul aria-label="Songs" className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
              {/* Only as many rows as fit in the smallest mode, so none hide behind Play. */}
              {SONGS.slice(0, 7).map((song, i) => (
                <li key={song} className="flex items-center gap-2.5 py-[5px] text-[11px]">
                  <Art i={i + 3} size={22} />
                  {song}
                </li>
              ))}
            </ul>
            <button
              className={cn(
                "relative mt-2 flex h-[32px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-foreground text-[11px] font-semibold text-background active:opacity-80 after:absolute after:inset-x-0 after:-inset-y-[6px]",
                FOCUS
              )}
              type="button"
            >
              <PlayIcon aria-hidden="true" className="size-[12px]" weight="fill" />
              Play
            </button>
          </div>
        </div>

        {overlay === "shown" ? (
          <>
            <div
              aria-hidden="true"
              className={cn("pointer-events-none absolute inset-x-0 top-0 z-50 flex items-end justify-end px-6 pb-px", PAINT)}
              style={{ height: inset.top }}
            >
              <span className="text-[8px] font-semibold text-rose-600 dark:text-rose-400">top inset</span>
            </div>
            <div
              aria-hidden="true"
              className={cn("pointer-events-none absolute inset-x-0 bottom-0 z-50 flex items-start justify-end px-6 pt-px", PAINT)}
              style={{ height: inset.bottom }}
            >
              <span className="text-[8px] font-semibold text-rose-600 dark:text-rose-400">bottom inset</span>
            </div>
          </>
        ) : null}
      </Phone>
      <div className="flex flex-col items-center gap-2">
        <SegmentedControl ariaLabel="Inset handling" onChange={setMode} options={MODE_OPTIONS} value={mode} />
        <div className="flex flex-wrap justify-center gap-2">
          <SegmentedControl ariaLabel="Platform" onChange={setPlatform} options={PLATFORM_OPTIONS} value={platform} />
          <SegmentedControl ariaLabel="Inset overlay" onChange={setOverlay} options={OVERLAY_OPTIONS} value={overlay} />
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Try each mode, then show the insets.
      </p>
    </Demo>
  );
}

/* EdgeToEdgeDemo: a list under a top bar and a floating tab bar. */

type ScrollMode = "overlay" | "padding" | "inset";

const SCROLL_OPTIONS = [
  { value: "overlay", label: "Overlay", icon: WRONG_ICON },
  { value: "padding", label: "Padding", icon: WRONG_ICON },
  { value: "inset", label: "Content inset", icon: RIGHT_ICON },
] as const;

const NAV_H = 30;
const TAB_H = 36;
const TAB_GAP = 4; // tab bar sits this far above the bottom inset's edge

const TABS = [
  { label: "Library", Icon: MusicNotesIcon },
  { label: "Browse", Icon: SquaresFourIcon },
  { label: "Profile", Icon: UserIcon },
] as const;

export function EdgeToEdgeDemo() {
  const [mode, setMode] = useState<ScrollMode>("overlay");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inset = PHONE_INSETS.ios;
  const barsTop = inset.top + NAV_H;
  const barsBottom = inset.bottom - TAB_GAP + TAB_H;

  // Start at the end of the list: that's where the difference shows.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mode]);

  function scrollToEnd() {
    const el = scrollRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }

  function scrollToTop() {
    const el = scrollRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  // Overlay: the bar is drawn over the list and nobody told the list.
  // Padding: the scroll view itself is shrunk, so nothing passes under the bars.
  // Content inset: the scroll view fills the screen; its content is padded.
  const frame = mode === "padding" ? { top: barsTop, bottom: barsBottom + 8 } : { top: 0, bottom: 0 };
  const content =
    mode === "inset"
      ? { paddingTop: barsTop, paddingBottom: barsBottom + 12 }
      : mode === "overlay"
        ? { paddingTop: barsTop, paddingBottom: 0 }
        : { paddingTop: 0, paddingBottom: 0 };

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone height={440} label="Music library with a floating tab bar" platform="ios">
        <div
          ref={scrollRef}
          aria-label="Songs"
          className={cn(
            // clip-path matches the scroll clip, so tools that read paint areas
            // don't see rows scrolled out of view as sitting under the controls.
            "absolute inset-x-0 touch-pan-y overflow-y-auto overscroll-contain [clip-path:inset(0)] [scrollbar-width:none] focus-visible:outline-none",
            "[&::-webkit-scrollbar]:hidden"
          )}
          role="region"
          style={frame}
          tabIndex={0}
        >
          <ul className="flex flex-col px-3" style={content}>
            {SONGS.map((song, i) => {
              const last = i === SONGS.length - 1;
              return (
                <li key={song} className="flex items-center gap-2.5 border-b border-border py-[7px] text-[11px] last:border-b-0">
                  <Art i={i + 3} size={30} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{song}</span>
                    <span className="truncate text-[9.5px] text-muted-foreground">
                      {last ? "The last row. Can you tap it?" : "Morning Mix"}
                    </span>
                  </span>
                  <button
                    aria-label={`Play ${song}`}
                    className={cn(
                      // Rows are 45px apart, so a 44px target never overlaps the next one.
                      "relative grid size-[26px] shrink-0 cursor-pointer place-items-center rounded-full active:bg-foreground/10 after:absolute after:-inset-[9px]",
                      FOCUS,
                      last && "bg-indigo-500 text-white active:bg-indigo-600"
                    )}
                    type="button"
                  >
                    <PlayIcon aria-hidden="true" className="size-[11px]" weight="fill" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Top bar, painted up under the status bar, with a soft scroll edge
            below it so rows fade as they pass under. Solid behind its text,
            so the title reads over whatever scrolls by. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-end justify-center bg-background pb-2"
          style={{ height: barsTop }}
        >
          <p className="text-[11px] font-semibold">Library</p>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 z-20 h-4 bg-linear-to-b from-background to-transparent"
          style={{ top: barsTop }}
        />

        {/* Floating tab bar above the home indicator. */}
        <div
          aria-label="Tabs"
          className="absolute inset-x-6 z-20 flex items-center rounded-full bg-background p-[3px] shadow-(--custom-shadow)"
          role="group"
          style={{ bottom: inset.bottom - TAB_GAP, height: TAB_H }}
        >
          {TABS.map(({ label, Icon }, i) => (
            <button
              key={label}
              aria-pressed={i === 0}
              className={cn(
                "relative flex h-full flex-1 cursor-pointer flex-col items-center justify-center gap-px rounded-full text-[8px] font-medium after:absolute after:inset-x-0 after:-inset-y-[7px]",
                FOCUS,
                i === 0 ? "bg-foreground/8 text-indigo-600 dark:text-indigo-400" : "text-foreground"
              )}
              onClick={i === 0 ? scrollToTop : undefined}
              type="button"
            >
              <Icon aria-hidden="true" className="size-[13px]" weight={i === 0 ? "fill" : "regular"} />
              {label}
            </button>
          ))}
        </div>
      </Phone>
      <div className="flex flex-col items-center gap-2">
        <SegmentedControl ariaLabel="Scroll inset" onChange={setMode} options={SCROLL_OPTIONS} value={mode} />
        <button
          className="relative h-8 cursor-pointer rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors after:absolute after:inset-x-0 after:-inset-y-1.5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          onClick={scrollToEnd}
          type="button"
        >
          Scroll to the end
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Scroll the list in each mode and try to reach the last row.
      </p>
    </Demo>
  );
}
