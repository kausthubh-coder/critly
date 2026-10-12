"use client";

import {
  CoffeeIcon,
  ForkKnifeIcon,
  GasPumpIcon,
  HeartIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PlayIcon,
  TreeIcon,
  BriefcaseIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Phone, PHONE_INSETS } from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import { projectMomentum, springFromFeel } from "@/lib/spring";
import { cn } from "@/lib/utils";

const SCREEN_H = 460;
const SLOP = 6;

function rubberBand(over: number, size: number, c = 0.55) {
  return (1 - 1 / ((Math.abs(over) * c) / size + 1)) * size * Math.sign(over);
}

type Sample = { t: number; y: number };

function track(samples: Sample[], t: number, y: number) {
  samples.push({ t, y });
  while (samples.length > 2 && t - samples[0].t > 100) samples.shift();
}

/** px/s over the last 100ms; 0 if the finger had stopped before lifting. */
function releaseVelocity(samples: Sample[], now: number) {
  if (samples.length < 2) return 0;
  const last = samples[samples.length - 1];
  if (now - last.t > 80) return 0;
  const first = samples[0];
  const dt = (last.t - first.t) / 1000;
  return dt > 0 ? (last.y - first.y) / dt : 0;
}

/** Spring to a detent with the release velocity. Bounce only if it was thrown. */
function settleSpring(velocity: number, reduce: boolean) {
  if (reduce) return springFromFeel(0.25, 0);
  return springFromFeel(0.45, Math.abs(velocity) > 900 ? 0.12 : 0);
}

function nearest(points: number[], to: number) {
  return points.reduce((best, p) => (Math.abs(p - to) < Math.abs(best - to) ? p : best));
}

function Grabber({
  label,
  onActivate,
  onKeyDown,
}: {
  label: string;
  onActivate: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}) {
  return (
    <button
      aria-label={label}
      className="group/grabber relative flex h-6 w-full shrink-0 cursor-grab items-center justify-center outline-none after:absolute after:inset-x-[25%] after:-inset-y-2.5 active:cursor-grabbing"
      onClick={onActivate}
      onKeyDown={onKeyDown}
      type="button"
    >
      <span className="h-[5px] w-9 rounded-full bg-muted-foreground/40 group-focus-visible/grabber:ring-2 group-focus-visible/grabber:ring-ring/60 group-focus-visible/grabber:ring-offset-2 group-focus-visible/grabber:ring-offset-card" />
    </button>
  );
}

/* Detents: a Maps-style sheet over an interactive map */

const LARGE = PHONE_INSETS.ios.top + 10; // 44: just under the status bar
const MEDIUM = Math.round(SCREEN_H * 0.5); // 230: about half
const PEEK = SCREEN_H - PHONE_INSETS.ios.bottom - 70; // 370: grabber + search
const DETENTS = [LARGE, MEDIUM, PEEK];
const DETENT_NAMES: Record<number, string> = {
  [LARGE]: "large",
  [MEDIUM]: "medium",
  [PEEK]: "peek",
};

type Place = { id: string; name: string; kind: string; x: number; y: number; icon: React.ElementType };

const PLACES: Place[] = [
  { id: "cafe", name: "Blue Bottle", kind: "Coffee · 4 min", x: 64, y: 108, icon: CoffeeIcon },
  { id: "park", name: "Dolores Park", kind: "Park · 9 min", x: 176, y: 150, icon: TreeIcon },
  { id: "food", name: "Tartine", kind: "Bakery · 6 min", x: 112, y: 214, icon: ForkKnifeIcon },
  { id: "gas", name: "Shell", kind: "Gas · 3 min", x: 196, y: 262, icon: GasPumpIcon },
];

function MapBackground({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (place: Place) => void;
}) {
  return (
    <div className="absolute inset-0 bg-[oklch(0.95_0.01_120)] dark:bg-[oklch(0.27_0.01_250)]">
      <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 248 460">
        <path
          className="fill-[oklch(0.88_0.07_150)] dark:fill-[oklch(0.35_0.05_150)]"
          d="M140 112 h80 v70 h-80 z"
        />
        <path
          className="fill-[oklch(0.85_0.06_235)] dark:fill-[oklch(0.33_0.05_240)]"
          d="M0 300 C60 290 90 330 150 320 S248 330 248 330 V460 H0 Z"
        />
        <g className="stroke-white dark:stroke-white/15" fill="none" strokeLinecap="round">
          <path d="M-10 90 L260 130" strokeWidth="9" />
          <path d="M30 0 L95 470" strokeWidth="7" />
          <path d="M150 -10 L170 470" strokeWidth="6" />
          <path d="M-10 240 L260 200" strokeWidth="6" />
          <path d="M-10 170 L120 190" strokeWidth="3" />
          <path d="M200 40 L240 300" strokeWidth="3" />
        </g>
      </svg>
      {PLACES.map((place) => {
        const Icon = place.icon;
        const active = selected === place.id;
        return (
          <button
            key={place.id}
            aria-label={place.name}
            aria-pressed={active}
            className={cn(
              "absolute grid size-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-white shadow-md outline-none ring-2 ring-white transition-transform duration-200 ease-snappy after:absolute after:-inset-2 focus-visible:ring-sky-400 dark:ring-white/80",
              active ? "scale-125 bg-rose-500" : "bg-foreground/80"
            )}
            onClick={() => onSelect(place)}
            style={{ left: place.x, top: place.y }}
            type="button"
          >
            <Icon className="size-3.5" weight="fill" />
          </button>
        );
      })}
    </div>
  );
}

export function SheetDetentsDemo() {
  const reduce = useReducedMotion() ?? false;
  const top = useMotionValue(MEDIUM);
  const [detent, setDetent] = useState(MEDIUM);
  const [selected, setSelected] = useState<Place | null>(null);
  const [aim, setAim] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ id: number; sy: number; start: number; mode: "pending" | "drag"; samples: Sample[] } | null>(null);
  const dragged = useRef(false);

  // The map dims only between medium and large, and stays tappable below.
  const scrim = useTransform(top, [MEDIUM, LARGE], [0, 0.32], { clamp: true });

  function settle(target: number, velocity = 0) {
    setDetent(target);
    animate(top, target, { type: "spring", ...settleSpring(velocity, reduce), velocity });
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    top.stop();
    dragged.current = false;
    setAim(null);
    gesture.current = {
      id: event.pointerId,
      sy: event.clientY,
      start: top.get(),
      mode: "pending",
      samples: [{ t: event.timeStamp, y: event.clientY }],
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    const dy = event.clientY - g.sy;
    if (g.mode === "pending") {
      if (Math.abs(dy) < SLOP) return;
      g.mode = "drag";
      g.sy += Math.sign(dy) * SLOP;
      dragged.current = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    track(g.samples, event.timeStamp, event.clientY);
    const raw = g.start + event.clientY - g.sy;
    // Rubber band past the largest and smallest detents.
    const next =
      raw < LARGE
        ? LARGE - rubberBand(LARGE - raw, SCREEN_H)
        : raw > PEEK
          ? PEEK + rubberBand(raw - PEEK, 160)
          : raw;
    top.set(next);
  }

  function onPointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    gesture.current = null;
    if (g.mode !== "drag") return;
    setDragging(false);
    const velocity = event.type === "pointercancel" ? 0 : releaseVelocity(g.samples, event.timeStamp);
    // Project the flick, then pick the detent nearest where it was going.
    const projected = top.get() + projectMomentum(velocity, 0.99);
    setAim(Math.max(LARGE - 12, Math.min(projected, SCREEN_H - 12)));
    settle(nearest(DETENTS, projected), velocity);
  }

  function cycle() {
    // Tapping the grabber steps through the detents, like iOS.
    const index = DETENTS.indexOf(detent);
    settle(DETENTS[(index + DETENTS.length - 1) % DETENTS.length]);
  }

  function onGrabberKey(event: React.KeyboardEvent) {
    const index = DETENTS.indexOf(detent);
    if (event.key === "ArrowUp" && index > 0) {
      event.preventDefault();
      settle(DETENTS[index - 1]);
    } else if (event.key === "ArrowDown" && index < DETENTS.length - 1) {
      event.preventDefault();
      settle(DETENTS[index + 1]);
    }
  }

  function select(place: Place) {
    setSelected(place);
    if (detent === PEEK) settle(MEDIUM);
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone label="Maps-style sheet on iPhone">
        <MapBackground onSelect={select} selected={selected?.id ?? null} />

        <motion.div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 z-10 bg-black",
            detent === LARGE && !dragging ? "pointer-events-auto" : "pointer-events-none"
          )}
          onClick={() => settle(MEDIUM)}
          style={{ opacity: scrim }}
        />

        {/* Detent guides and where the last flick was headed. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-30 w-2">
          {DETENTS.map((d) => (
            <span
              key={d}
              className={cn(
                "absolute right-0 w-2 border-t-2 border-dashed border-sky-500/70 transition-opacity duration-200",
                dragging || aim !== null ? "opacity-100" : "opacity-0"
              )}
              style={{ top: d - 1 }}
            />
          ))}
          {aim !== null ? (
            <span
              className="absolute right-0.5 size-1.5 rounded-full bg-sky-500"
              style={{ top: aim - 3 }}
            />
          ) : null}
        </div>

        <motion.div
          aria-label="Places sheet"
          className="absolute inset-x-0 top-0 z-20 flex cursor-grab touch-none flex-col rounded-t-[22px] bg-card shadow-[0_-1px_12px_rgb(0_0_0/0.12)] active:cursor-grabbing dark:shadow-[0_-1px_0_rgb(255_255_255/0.08)]"
          onClickCapture={(event) => {
            // A drag that started on a button isn't a tap.
            if (dragged.current) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
          onPointerCancel={onPointerEnd}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          role="region"
          style={{ y: top, height: SCREEN_H - LARGE + 160 }}
        >
          <Grabber
            label={`Sheet height: ${DETENT_NAMES[detent]}. Activate to change, or use the arrow keys.`}
            onActivate={cycle}
            onKeyDown={onGrabberKey}
          />
          <div className="flex flex-col gap-4 px-3 pt-2.5">
            <button
              className="relative flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-muted px-3 text-left text-[12px] text-foreground/65 outline-none after:absolute after:inset-x-0 after:top-0 after:-bottom-2 focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-muted/60"
              onClick={() => settle(LARGE)}
              type="button"
            >
              <MagnifyingGlassIcon className="size-3.5" weight="bold" />
              {selected ? selected.name : "Search Maps"}
            </button>
            <div>
              <p className="mb-2 px-1 text-[11px] font-semibold text-muted-foreground">
                {selected ? selected.kind : "Favorites"}
              </p>
              <div className="flex justify-between px-1">
                {[
                  { label: "Home", icon: HouseIcon },
                  { label: "Work", icon: BriefcaseIcon },
                  { label: "Coffee", icon: CoffeeIcon },
                  { label: "Food", icon: ForkKnifeIcon },
                ].map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    className="relative flex cursor-pointer flex-col items-center gap-1 rounded-lg text-[10px] outline-none after:absolute after:-inset-x-1 after:inset-y-0 focus-visible:ring-2 focus-visible:ring-ring/50"
                    type="button"
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-muted dark:bg-muted/60">
                      <Icon className="size-4" weight="fill" />
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 px-1 text-[11px] font-semibold text-muted-foreground">
                Recents
              </p>
              <ul className="flex flex-col">
                {PLACES.map((place) => (
                  <li key={place.id}>
                    <button
                      className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      onClick={() => select(place)}
                      type="button"
                    >
                      <span className="grid size-7 place-items-center rounded-full bg-muted text-muted-foreground dark:bg-muted/60">
                        <MapPinIcon className="size-3.5" weight="fill" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-[12px] font-medium">{place.name}</span>
                        <span className="truncate text-[10px] text-muted-foreground">{place.kind}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </Phone>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        Drag the sheet or flick it. Tap a pin on the map at the two lower
        heights; at the top the map dims and a tap brings the sheet down.
      </p>
    </Demo>
  );
}

/* Scroll handoff: the list scrolls, then the sheet takes over */

type ScrollMode = "trapped" | "handoff";

const SCROLL_OPTIONS = [
  { value: "trapped", label: "Scroll only", icon: WRONG_ICON },
  { value: "handoff", label: "Hands off", icon: RIGHT_ICON },
] as const;

const S_LARGE = PHONE_INSETS.ios.top + 10;
const S_MEDIUM = Math.round(SCREEN_H * 0.45);
const S_CLOSED = SCREEN_H + 12;
const HEADER_H = 64; // grabber + title row
const ROW = 46;

const COMMENTS = [
  ["Maya", "The part at 2:14 is so good"],
  ["Jonah", "How long did this take to film?"],
  ["Ana", "Saving this for the weekend"],
  ["Leo", "Finally someone explains it properly"],
  ["Priya", "Can you do one on the sequel?"],
  ["Sam", "The music choice is perfect"],
  ["Chen", "Watched it three times already"],
  ["Ines", "Where is this, it's beautiful"],
  ["Tomás", "Underrated channel honestly"],
  ["Noor", "My cat stared at the screen the whole time"],
  ["Kai", "The lighting in the last shot"],
  ["Rosa", "This needs more views"],
  ["Elif", "Came here from the newsletter"],
  ["Ben", "Ok the ending got me"],
  ["Yuki", "Love the pacing on this one"],
  ["Omar", "Instant subscribe"],
  ["Lena", "The colour grade is unreal"],
  ["Ravi", "Tutorial on the edit please"],
  ["Zoe", "First time here, staying"],
  ["Hugo", "That transition at 5:40"],
] as const;

const LIST_H = COMMENTS.length * ROW + PHONE_INSETS.ios.bottom + 12;
const VIEW_H = SCREEN_H - S_LARGE - HEADER_H;
const MAX_SCROLL = LIST_H - VIEW_H;

// A scroll that coasts like UIScrollView: a critically damped spring aimed at
// the projected end with ω = 1/τ is exactly the exponential decay.
const DECAY = { stiffness: 4, damping: 4, mass: 1 };
const EDGE_BOUNCE = springFromFeel(0.5, 0);

function CommentRows({ onFocusRow }: { onFocusRow?: (index: number) => void }) {
  return (
    <ul style={{ paddingBottom: PHONE_INSETS.ios.bottom + 12 }}>
      {COMMENTS.map(([name, text], index) => (
        <li key={name} className="flex items-center gap-2.5 px-4" style={{ height: ROW }}>
          <span
            className="size-7 shrink-0 rounded-full bg-muted dark:bg-muted/60"
            style={{ backgroundColor: `oklch(0.8 0.06 ${(index * 47) % 360} / 0.5)` }}
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[10px] font-semibold text-muted-foreground">{name}</span>
            <span className="truncate text-[12px]">{text}</span>
          </span>
          <button
            aria-label={`Like ${name}'s comment`}
            className="relative grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground outline-none after:absolute after:-inset-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            onFocus={() => onFocusRow?.(index)}
            type="button"
          >
            <HeartIcon className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function SheetHeader({
  onClose,
  grabber,
}: {
  onClose: () => void;
  grabber?: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-col" style={{ height: HEADER_H }}>
      {grabber ?? <div className="h-6" />}
      <div className="flex flex-1 items-center justify-between border-b border-border px-4 pb-1">
        <span className="text-[14px] font-semibold">Comments</span>
        <button
          aria-label="Close comments"
          className="relative grid size-7 cursor-pointer place-items-center rounded-full bg-muted text-muted-foreground outline-none after:absolute after:-inset-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-muted/60"
          onClick={onClose}
          type="button"
        >
          <XIcon className="size-3.5" weight="bold" />
        </button>
      </div>
    </div>
  );
}

function VideoPage({ onOpen, open }: { onOpen: () => void; open: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col gap-3 px-4" style={{ paddingTop: PHONE_INSETS.ios.top + 6 }}>
      <div className="grid aspect-video place-items-center rounded-xl bg-muted dark:bg-muted/50">
        <PlayIcon className="size-6 text-muted-foreground" weight="fill" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-semibold">Building a bottom sheet from scratch</span>
        <span className="text-[11px] text-muted-foreground">48K views · 2 days ago</span>
      </div>
      <button
        aria-expanded={open}
        className="h-11 cursor-pointer rounded-xl bg-muted text-[12px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-muted/60"
        onClick={onOpen}
        type="button"
      >
        Comments · {COMMENTS.length}
      </button>
    </div>
  );
}

function useScrim(top: MotionValue<number>) {
  return useTransform(top, [S_CLOSED, S_MEDIUM], [0, 0.32], { clamp: true });
}

function TrappedSheet() {
  const reduce = useReducedMotion() ?? false;
  const top = useMotionValue(S_MEDIUM);
  const [open, setOpen] = useState(true);
  const scrim = useScrim(top);

  function show(next: boolean) {
    setOpen(next);
    animate(top, next ? S_MEDIUM : S_CLOSED, { type: "spring", ...settleSpring(0, reduce) });
  }

  return (
    <>
      <VideoPage onOpen={() => show(true)} open={open} />
      <motion.div
        aria-hidden="true"
        className={cn("absolute inset-0 z-10 bg-black", open ? "pointer-events-auto" : "pointer-events-none")}
        onClick={() => show(false)}
        style={{ opacity: scrim }}
      />
      <motion.div
        aria-label="Comments"
        className="absolute inset-x-0 top-0 z-20 flex flex-col rounded-t-[22px] bg-card shadow-[0_-1px_12px_rgb(0_0_0/0.12)] dark:shadow-[0_-1px_0_rgb(255_255_255/0.08)]"
        inert={!open}
        onKeyDown={(event) => event.key === "Escape" && show(false)}
        role="dialog"
        style={{ y: top, height: SCREEN_H - S_MEDIUM }}
      >
        <SheetHeader onClose={() => show(false)} />
        {/* A plain overflow scroll: it bounces and chains, the sheet never moves. */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <CommentRows />
        </div>
      </motion.div>
    </>
  );
}

function HandoffSheet() {
  const reduce = useReducedMotion() ?? false;
  const top = useMotionValue(S_MEDIUM);
  const scroll = useMotionValue(0);
  const listY = useTransform(scroll, (v) => -v);
  const scrim = useScrim(top);
  const [open, setOpen] = useState(true);
  const [atLarge, setAtLarge] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const gesture = useRef<{
    id: number;
    lastY: number;
    sy: number;
    mode: "pending" | "drag";
    movedSheet: boolean;
    over: number; // finger travel past the end of the list, before rubber banding
    samples: Sample[];
  } | null>(null);

  function settleSheet(target: number, velocity = 0) {
    setOpen(target !== S_CLOSED);
    setAtLarge(target === S_LARGE);
    animate(top, target, { type: "spring", ...settleSpring(velocity, reduce), velocity });
    if (target === S_CLOSED) scroll.set(0);
  }

  function coast(velocity: number) {
    // velocity: finger px/s, positive down. Content moves the other way.
    const v = -velocity;
    const from = scroll.get();
    if (from < 0 || from > MAX_SCROLL) {
      animate(scroll, from < 0 ? 0 : MAX_SCROLL, { type: "spring", ...EDGE_BOUNCE, velocity: v });
      return;
    }
    const end = from + projectMomentum(v);
    if (end >= 0 && end <= MAX_SCROLL) {
      animate(scroll, end, { type: "spring", ...DECAY, velocity: v });
    } else {
      // Runs out of list: arrive at the edge still moving, and bounce.
      animate(scroll, end < 0 ? 0 : MAX_SCROLL, { type: "spring", ...EDGE_BOUNCE, velocity: v });
    }
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    top.stop();
    scroll.stop();
    dragged.current = false;
    const s = scroll.get();
    gesture.current = {
      id: event.pointerId,
      lastY: event.clientY,
      sy: event.clientY,
      mode: "pending",
      movedSheet: false,
      over: s > MAX_SCROLL ? s - MAX_SCROLL : 0,
      samples: [{ t: event.timeStamp, y: event.clientY }],
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    if (g.mode === "pending") {
      if (Math.abs(event.clientY - g.sy) < SLOP) return;
      g.mode = "drag";
      g.lastY = g.sy + Math.sign(event.clientY - g.sy) * SLOP;
      dragged.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    track(g.samples, event.timeStamp, event.clientY);
    let rest = event.clientY - g.lastY; // positive = finger moving down
    g.lastY = event.clientY;

    if (rest < 0) {
      // Finger up: grow the sheet to its top detent first, then scroll.
      const t = top.get();
      if (t > S_LARGE) {
        const next = Math.max(S_LARGE, t + rest);
        rest -= next - t;
        top.set(next);
        g.movedSheet = true;
      }
      if (rest < 0) {
        const s = Math.min(scroll.get(), MAX_SCROLL);
        const room = MAX_SCROLL - s;
        const used = Math.min(room, -rest);
        g.over += -rest - used;
        scroll.set(s + used + (g.over > 0 ? rubberBand(g.over, VIEW_H) : 0));
      }
    } else if (rest > 0) {
      // Finger down: undo any overscroll, scroll back to the top, then move
      // the sheet down. At scrollTop 0 the same drag keeps going as a sheet drag.
      if (g.over > 0) {
        const used = Math.min(g.over, rest);
        g.over -= used;
        rest -= used;
        scroll.set(MAX_SCROLL + (g.over > 0 ? rubberBand(g.over, VIEW_H) : 0));
      }
      const s = Math.max(0, scroll.get());
      if (rest > 0 && s > 0 && !g.movedSheet) {
        const used = Math.min(s, rest);
        rest -= used;
        scroll.set(s - used);
      }
      if (rest > 0) {
        top.set(top.get() + rest);
        g.movedSheet = true;
      }
    }
  }

  function onPointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    gesture.current = null;
    if (g.mode !== "drag") return;
    const velocity = event.type === "pointercancel" ? 0 : releaseVelocity(g.samples, event.timeStamp);
    const t = top.get();
    if (g.movedSheet && t !== S_LARGE) {
      const projected = t + projectMomentum(velocity, 0.99);
      settleSheet(nearest([S_LARGE, S_MEDIUM, S_CLOSED], projected), velocity);
      return;
    }
    if (g.movedSheet) setAtLarge(true);
    coast(velocity);
  }

  // Wheel and trackpad scroll the list too, and leave the page alone
  // only once the list can't move further that way.
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    function onWheel(event: WheelEvent) {
      if (!open) return;
      const s = scroll.get();
      const next = Math.max(0, Math.min(MAX_SCROLL, s + event.deltaY));
      if (next === s) return;
      event.preventDefault();
      scroll.stop();
      if (top.get() > S_LARGE && event.deltaY > 0) settleSheet(S_LARGE);
      scroll.set(next);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  function focusRow(index: number) {
    // The list is a transform, so keep a focused row in view by hand.
    if (top.get() > S_LARGE) settleSheet(S_LARGE);
    const rowTop = index * ROW;
    const s = scroll.get();
    if (rowTop < s) scroll.set(rowTop);
    else if (rowTop + ROW > s + VIEW_H - PHONE_INSETS.ios.bottom) {
      scroll.set(Math.min(MAX_SCROLL, rowTop + ROW - VIEW_H + PHONE_INSETS.ios.bottom));
    }
    list.current?.scrollTo(0, 0);
  }

  return (
    <>
      <VideoPage onOpen={() => settleSheet(S_MEDIUM)} open={open} />
      <motion.div
        aria-hidden="true"
        className={cn("absolute inset-0 z-10 bg-black", open ? "pointer-events-auto" : "pointer-events-none")}
        onClick={() => settleSheet(S_CLOSED)}
        style={{ opacity: scrim }}
      />
      <motion.div
        aria-label="Comments"
        className="absolute inset-x-0 top-0 z-20 flex cursor-grab touch-none flex-col rounded-t-[22px] bg-card shadow-[0_-1px_12px_rgb(0_0_0/0.12)] active:cursor-grabbing dark:shadow-[0_-1px_0_rgb(255_255_255/0.08)]"
        inert={!open}
        onClickCapture={(event) => {
          if (dragged.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        onKeyDown={(event) => event.key === "Escape" && settleSheet(S_CLOSED)}
        onPointerCancel={onPointerEnd}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        role="dialog"
        style={{ y: top, height: SCREEN_H - S_LARGE + 160 }}
      >
        <SheetHeader
          grabber={
            <Grabber
              label={`Sheet height: ${atLarge ? "large" : "medium"}. Activate to change.`}
              onActivate={() => settleSheet(atLarge ? S_MEDIUM : S_LARGE)}
            />
          }
          onClose={() => settleSheet(S_CLOSED)}
        />
        <div ref={list} className="relative overflow-hidden" style={{ height: VIEW_H + 160 }}>
          <motion.div style={{ y: listY }}>
            <CommentRows onFocusRow={focusRow} />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

export function SheetScrollDemo() {
  const [mode, setMode] = useState<ScrollMode>("trapped");
  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone label="Comments sheet on iPhone">
        {mode === "trapped" ? <TrappedSheet key="trapped" /> : <HandoffSheet key="handoff" />}
      </Phone>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        {mode === "trapped"
          ? "Scroll the comments, then try to close the sheet without the X."
          : "Drag the list up to grow the sheet, scroll, then pull down past the top."}
      </p>
      <SegmentedControl
        ariaLabel="Sheet scrolling"
        onChange={setMode}
        options={SCROLL_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}
