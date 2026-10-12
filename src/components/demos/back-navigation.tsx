"use client";

import {
  ArrowLeftIcon,
  CaretLeftIcon,
  CaretRightIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  BellIcon,
  TextAaIcon,
  WifiHighIcon,
  BatteryFullIcon,
  LockIcon,
  SunIcon,
} from "@phosphor-icons/react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Phone, PHONE_INSETS, PHONE_WIDTH } from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import { projectMomentum, springFromFeel } from "@/lib/spring";
import { cn } from "@/lib/utils";

const W = PHONE_WIDTH;
const SLOP = 8;

type Sample = { t: number; x: number };

/**
 * Screen pixels per layout pixel. On a phone the Phone screen is scaled up
 * (see usePhoneScale), so pointer coordinates are divided by this before they
 * move anything laid out in the 248px screen.
 */
function scaleOf(el: Element) {
  const width = (el as HTMLElement).offsetWidth;
  return width ? el.getBoundingClientRect().width / width : 1;
}

function track(samples: Sample[], t: number, x: number) {
  samples.push({ t, x });
  while (samples.length > 2 && t - samples[0].t > 100) samples.shift();
}

function releaseVelocity(samples: Sample[], now: number) {
  if (samples.length < 2) return 0;
  const last = samples[samples.length - 1];
  if (now - last.t > 80) return 0;
  const first = samples[0];
  const dt = (last.t - first.t) / 1000;
  return dt > 0 ? (last.x - first.x) / dt : 0;
}

/* iOS: the pushed screen follows the finger */

type BackMode = "canned" | "follows";
type Reach = "edge" | "content";

const BACK_OPTIONS = [
  { value: "canned", label: "Canned", icon: WRONG_ICON },
  { value: "follows", label: "Follows finger", icon: RIGHT_ICON },
] as const;

const REACH_OPTIONS = [
  { value: "edge", label: "Edge" },
  { value: "content", label: "Anywhere (iOS 26)" },
] as const;

const EDGE = 20; // px from the left edge that starts an edge swipe
const PARALLAX = 0.3; // the screen below moves at 30% and starts 30% to the left
const POP = springFromFeel(0.4, 0);

const NOTES = [
  { title: "Trip packing list", body: "Passport, charger, the good socks, rain shell, snacks for the train, a book you've actually started." },
  { title: "Gift ideas", body: "A plant for Maya, the ramen cookbook for Leo, film for Ana's camera, and something for the neighbours." },
  { title: "Bike fit numbers", body: "Saddle height 72.5cm from the BB, setback 6cm, bars 2cm below saddle. Try 5mm higher next ride." },
  { title: "Sourdough", body: "500g flour, 375g water, 100g starter, 10g salt. Bulk 5h at 24°C, shape, cold proof overnight." },
  { title: "Books to read", body: "The Overstory, Piranesi, A Psalm for the Wild-Built, The Dispossessed, Stoner, and the new Ishiguro." },
  { title: "Meeting notes", body: "Ship the sheet fix first. Move the onboarding test to next sprint. Ask design about the empty state." },
];

export function EdgeSwipeBackDemo() {
  const reduce = useReducedMotion() ?? false;
  const [mode, setMode] = useState<BackMode>("canned");
  const [reach, setReach] = useState<Reach>("edge");
  const [note, setNote] = useState<number | null>(null);
  // Where the pushed screen sits: 0 = on top, W = off to the right.
  const x = useMotionValue(W);
  const listX = useTransform(x, (v) => -PARALLAX * (W - v));
  const dim = useTransform(x, [0, W], [0.12, 0]);
  const shadow = useTransform(x, [0, W * 0.9], [1, 0]);
  const gesture = useRef<{
    id: number;
    sx: number;
    sy: number;
    k: number;
    mode: "pending" | "drag" | "ignore" | "fired";
    samples: Sample[];
  } | null>(null);
  const screen = useRef<HTMLDivElement>(null);

  const spring = reduce ? springFromFeel(0.25, 0) : POP;

  function push(index: number) {
    setNote(index);
    animate(x, 0, { type: "spring", ...spring });
  }

  function pop(velocity = 0) {
    animate(x, W, { type: "spring", ...spring, velocity }).then(() => {
      if (x.get() >= W - 0.5) setNote(null);
    });
  }

  function canned() {
    // A fixed clip: it ignores the finger from here on and can't be undone.
    animate(x, W, { duration: 0.35, ease: [0.42, 0, 0.58, 1] }).then(() => setNote(null));
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const el = screen.current;
    if (!el) return;
    const k = scaleOf(el);
    const fromEdge = (event.clientX - el.getBoundingClientRect().left) / k;
    if (reach === "edge" && fromEdge > EDGE) return;
    x.stop();
    gesture.current = {
      id: event.pointerId,
      sx: event.clientX / k,
      sy: event.clientY / k,
      k,
      mode: "pending",
      samples: [{ t: event.timeStamp, x: event.clientX / k }],
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId || g.mode === "ignore" || g.mode === "fired") return;
    const px = event.clientX / g.k;
    const dx = px - g.sx;
    const dy = event.clientY / g.k - g.sy;
    if (g.mode === "pending") {
      // Only a pan that starts left-to-right and mostly sideways is back.
      if (dx > SLOP && dx > Math.abs(dy)) {
        g.mode = "drag";
        g.sx += SLOP - x.get();
        event.currentTarget.setPointerCapture(event.pointerId);
      } else if (Math.abs(dy) > SLOP || dx < -SLOP) {
        g.mode = "ignore";
        return;
      } else return;
    }
    if (mode === "canned") {
      if (px - g.sx > 40) {
        g.mode = "fired";
        canned();
      }
      return;
    }
    track(g.samples, event.timeStamp, px);
    x.set(Math.max(0, Math.min(W, px - g.sx)));
  }

  function onPointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    gesture.current = null;
    if (g.mode !== "drag" || mode === "canned") return;
    const velocity = event.type === "pointercancel" ? 0 : releaseVelocity(g.samples, event.timeStamp);
    // Project the release: a quick flick pops from a short drag, and a slow
    // drag back toward the edge cancels.
    const aim = x.get() + projectMomentum(velocity, 0.99);
    if (aim > W / 2) pop(velocity);
    else animate(x, 0, { type: "spring", ...spring, velocity });
  }

  const current = note === null ? null : NOTES[note];

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone label="Notes app on iPhone">
        <div ref={screen} className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 flex flex-col bg-background"
            inert={note !== null}
            style={{ x: listX }}
          >
            <div
              className="px-4 pb-2 text-[22px] font-bold tracking-tight"
              style={{ paddingTop: PHONE_INSETS.ios.top + 8 }}
            >
              Notes
            </div>
            <ul className="mx-3 overflow-hidden rounded-xl bg-card shadow-(--custom-shadow) dark:bg-muted/40">
              {NOTES.map((n, index) => (
                <li key={n.title} className="border-b border-border last:border-0">
                  <button
                    className="flex h-11 w-full cursor-pointer items-center gap-2 px-3 text-left outline-none focus-visible:bg-muted active:bg-muted"
                    onClick={() => push(index)}
                    type="button"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[12px] font-medium">{n.title}</span>
                      <span className="truncate text-[10px] text-muted-foreground">{n.body}</span>
                    </span>
                    <CaretRightIcon className="size-3 shrink-0 text-muted-foreground/60" weight="bold" />
                  </button>
                </li>
              ))}
            </ul>
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-black"
              style={{ opacity: dim }}
            />
          </motion.div>

          <motion.div
            aria-hidden={note === null}
            className="absolute inset-0 flex touch-pan-y flex-col bg-background"
            inert={note === null}
            onKeyDown={(event) => event.key === "Escape" && pop()}
            onPointerCancel={onPointerEnd}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            style={{ x }}
          >
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-4 w-4 bg-linear-to-l from-black/15 to-transparent"
              style={{ opacity: shadow }}
            />
            <div
              className="flex shrink-0 items-center px-1.5"
              style={{ paddingTop: PHONE_INSETS.ios.top, height: PHONE_INSETS.ios.top + 36 }}
            >
              <button
                className="flex h-8 cursor-pointer items-center gap-0.5 rounded-full pr-2.5 pl-1 text-[13px] text-blue-600 outline-none dark:text-blue-400 focus-visible:ring-2 focus-visible:ring-ring/50"
                onClick={() => (mode === "canned" ? canned() : pop())}
                type="button"
              >
                <CaretLeftIcon className="size-4" weight="bold" />
                Notes
              </button>
            </div>
            <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto px-4 pb-8">
              <h3 className="mb-2 text-[18px] font-bold tracking-tight">{current?.title}</h3>
              {[0, 1, 2].map((i) => (
                <p key={i} className="mb-3 text-[12px] leading-relaxed text-foreground/85">
                  {current?.body}
                </p>
              ))}
            </div>
            {reach === "edge" ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 border-l border-dashed border-sky-500/60"
                style={{ left: EDGE }}
              />
            ) : null}
          </motion.div>
        </div>
      </Phone>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        {mode === "canned"
          ? "Open a note and swipe right. Halfway through, try to change your mind."
          : reach === "edge"
            ? "Open a note and swipe right from left of the dashed line. Stop halfway, go back, flick."
            : "Open a note and swipe right from anywhere. Stop halfway, go back, flick."}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <SegmentedControl
          ariaLabel="Back gesture"
          onChange={(value) => {
            setMode(value);
            if (note !== null) animate(x, 0, { type: "spring", ...spring });
          }}
          options={BACK_OPTIONS}
          value={mode}
        />
        <SegmentedControl
          ariaLabel="Where the swipe can start"
          onChange={setReach}
          options={REACH_OPTIONS}
          value={reach}
        />
      </div>
    </Demo>
  );
}

/* Android: predictive back */

const A_EDGE = 24;
// M3 predictive back: shrink to 90%, keep 8dp from the edge. The largest
// sideways shift is width / 20 - 8dp; in this 0.63 scale phone that's 7px.
const MAX_SHIFT_X = W / 20 - 8 * 0.63;
const MAX_SHIFT_Y = 460 / 20 - 8 * 0.63;

// cubic-bezier(0, 0, 0, 1): STANDARD_DECELERATE, which M3 asks for on the
// progress so the preview moves most at the start of the gesture.
function decelerate(p: number) {
  // Solve x(t) = p for the curve (0,0) (0,0) (0,1) (1,1) by bisection.
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const t = (lo + hi) / 2;
    const xt = t * t * t; // x control points 0, 0 → x(t) = t³
    if (xt < p) lo = t;
    else hi = t;
  }
  const t = (lo + hi) / 2;
  const u = 1 - t;
  return 3 * u * t * t + t * t * t; // y control points 0, 1
}

const SETTINGS = [
  { label: "Network", icon: WifiHighIcon },
  { label: "Display", icon: SunIcon },
  { label: "Sound", icon: BellIcon },
  { label: "Battery", icon: BatteryFullIcon },
  { label: "Security", icon: LockIcon },
];

export function PredictiveBackDemo() {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState(true);
  const progress = useMotionValue(0); // eased gesture progress, 0..1
  const exit = useMotionValue(0); // 0..1 after the back is committed
  const side = useMotionValue(1); // 1 = from the left edge, -1 = right
  const fingerY = useMotionValue(0); // vertical drift, px
  const arrowY = useMotionValue(200);
  const screen = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    id: number;
    sx: number;
    sy: number;
    dir: 1 | -1;
    k: number;
    mode: "pending" | "drag" | "ignore";
    raw: number;
    samples: Sample[];
  } | null>(null);

  const scale = useTransform(() => 1 - 0.1 * progress.get() - 0.05 * exit.get());
  const shiftX = useTransform(() => side.get() * MAX_SHIFT_X * progress.get());
  const shiftY = useTransform(() =>
    Math.max(-MAX_SHIFT_Y, Math.min(MAX_SHIFT_Y, fingerY.get() * 0.15)) * progress.get()
  );
  // The outgoing screen has faded out by 35% of the way through the exit.
  const opacity = useTransform(exit, [0, 0.35], [1, 0]);
  // The screen behind dims as the preview shrinks, so the edges read.
  const behindDim = useTransform(() => 0.3 * progress.get() * (1 - exit.get()));
  const arrowScale = useTransform(progress, [0, 0.3], [0.4, 1]);
  const arrowOpacity = useTransform(() => Math.min(1, progress.get() * 5) * (1 - exit.get()));
  const arrowLeft = useTransform(() =>
    side.get() > 0 ? 4 + 18 * Math.min(1, progress.get() * 2) : W - 32 - 18 * Math.min(1, progress.get() * 2)
  );

  function commit() {
    animate(exit, 1, { duration: reduce ? 0.15 : 0.3, ease: [0.1, 0.1, 0, 1] }).then(() => {
      setOpen(false);
      progress.set(0);
      exit.set(0);
    });
  }

  function cancel(velocity = 0) {
    animate(progress, 0, { type: "spring", ...springFromFeel(0.35, 0), velocity });
  }

  function reopen() {
    exit.set(0);
    progress.set(0);
    setOpen(true);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!open || (event.pointerType === "mouse" && event.button !== 0)) return;
    const el = screen.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const k = scaleOf(el);
    const fromLeft = (event.clientX - rect.left) / k;
    const fromRight = (rect.right - event.clientX) / k;
    // Back comes from either edge.
    const dir = fromLeft <= A_EDGE ? 1 : fromRight <= A_EDGE ? -1 : 0;
    if (!dir) return;
    progress.stop();
    gesture.current = {
      id: event.pointerId,
      sx: event.clientX / k,
      sy: event.clientY / k,
      dir,
      k,
      mode: "pending",
      raw: 0,
      samples: [{ t: event.timeStamp, x: event.clientX / k }],
    };
    arrowY.set((event.clientY - rect.top) / k - 18);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId || g.mode === "ignore") return;
    const px = event.clientX / g.k;
    const inward = (px - g.sx) * g.dir;
    const dy = event.clientY / g.k - g.sy;
    if (g.mode === "pending") {
      if (inward > SLOP && inward > Math.abs(dy)) {
        g.mode = "drag";
        g.sx += SLOP * g.dir;
        side.set(g.dir);
        event.currentTarget.setPointerCapture(event.pointerId);
      } else if (Math.abs(dy) > SLOP) {
        g.mode = "ignore";
        return;
      } else return;
    }
    track(g.samples, event.timeStamp, px * g.dir);
    g.raw = Math.max(0, Math.min(1, ((px - g.sx) * g.dir) / (W * 0.6)));
    progress.set(decelerate(g.raw));
    fingerY.set(dy);
    const rect = screen.current?.getBoundingClientRect();
    if (rect) arrowY.set((event.clientY - rect.top) / g.k - 18);
  }

  function onPointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    gesture.current = null;
    if (g.mode !== "drag") return;
    const velocity = event.type === "pointercancel" ? 0 : releaseVelocity(g.samples, event.timeStamp);
    // Let go to go back; slide back toward the edge to cancel.
    if (g.raw > 0.15 && velocity > -150 && event.type !== "pointercancel") commit();
    else cancel();
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone label="Settings app on Android" platform="android">
        <div
          ref={screen}
          className="absolute inset-0 touch-pan-y overflow-hidden bg-zinc-900"
          onPointerCancel={onPointerEnd}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
        >
          {/* The screen you'd go back to, visible behind the preview. */}
          <div className="absolute inset-0 flex flex-col bg-background" inert={open}>
            <div
              className="px-4 pb-3 text-[20px]"
              style={{ paddingTop: PHONE_INSETS.android.top + 14 }}
            >
              Settings
            </div>
            <ul className="flex flex-col px-2">
              {SETTINGS.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <button
                    className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-full px-3 text-left text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:bg-muted"
                    onClick={() => label === "Display" && reopen()}
                    type="button"
                  >
                    <Icon className="size-4 text-muted-foreground" weight="fill" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-black"
              style={{ opacity: open ? behindDim : 0 }}
            />
          </div>

          {open ? (
            <motion.div
              className="absolute inset-0 flex flex-col overflow-hidden rounded-[28px] bg-background shadow-[0_6px_24px_rgb(0_0_0/0.25)]"
              onKeyDown={(event) => event.key === "Escape" && commit()}
              style={{ scale, x: shiftX, y: shiftY, opacity }}
            >
              <div
                className="flex items-center gap-2 px-2"
                style={{ paddingTop: PHONE_INSETS.android.top + 6 }}
              >
                <button
                  aria-label="Back"
                  className="grid size-10 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:bg-muted"
                  onClick={commit}
                  type="button"
                >
                  <ArrowLeftIcon className="size-4" />
                </button>
                <span className="text-[16px]">Display</span>
              </div>
              <ul className="flex flex-col gap-1 px-4 pt-2">
                {[
                  { label: "Dark theme", hint: "On", icon: MoonIcon },
                  { label: "Brightness", hint: "Adaptive", icon: SunIcon },
                  { label: "Font size", hint: "Default", icon: TextAaIcon },
                ].map(({ label, hint, icon: Icon }) => (
                  <li key={label} className="flex h-12 items-center gap-3">
                    <Icon className="size-4 text-muted-foreground" weight="fill" />
                    <span className="flex flex-col">
                      <span className="text-[12px]">{label}</span>
                      <span className="text-[10px] text-muted-foreground">{hint}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : null}

          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 z-30 grid size-7 place-items-center rounded-full bg-foreground text-background shadow-md"
            style={{ left: 0, x: arrowLeft, y: arrowY, scale: arrowScale, opacity: arrowOpacity }}
          >
            <CaretLeftIcon className="size-3.5" weight="bold" />
          </motion.span>
        </div>
      </Phone>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        {open
          ? "Drag in from the left or right edge. Let go to go back, or slide back to cancel."
          : "Tap Display to open it again."}
      </p>
    </Demo>
  );
}

/* Tabs keep their own stack and scroll position */

type TabMode = "resets" | "keeps";
type TabName = "home" | "search";

const TAB_OPTIONS = [
  { value: "resets", label: "Resets", icon: WRONG_ICON },
  { value: "keeps", label: "Keeps its place", icon: RIGHT_ICON },
] as const;

const ALBUMS = [
  "Blue Hour", "Northern Lines", "Glass Houses", "Paper Moons", "Slow Rivers",
  "Kite Season", "Low Tide", "Copper Sky", "Small Hours", "Field Notes",
  "Night Bus", "Salt & Cedar", "Open Water", "Late Bloom", "Static Dreams",
  "Lantern", "Ground Floor", "Wild Card", "Soft Focus", "Last Light",
];

const TAB_BAR_H = 46;

function HomeTab({
  detail,
  setDetail,
  scrollRef,
  reduce,
}: {
  detail: number | null;
  setDetail: (index: number | null) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  reduce: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ x: detail === null ? 0 : -W * PARALLAX, opacity: reduce && detail !== null ? 0 : 1 }}
        className="absolute inset-0"
        inert={detail !== null}
        initial={false}
        transition={{ type: "spring", ...POP }}
      >
        <div
          ref={scrollRef}
          className="absolute inset-x-0 top-0 overflow-y-auto overscroll-contain [scrollbar-width:none]"
          style={{ bottom: TAB_BAR_H + PHONE_INSETS.ios.bottom }}
        >
          <div
            className="px-4 pb-2 text-[22px] font-bold tracking-tight"
            style={{ paddingTop: PHONE_INSETS.ios.top + 8 }}
          >
            Library
          </div>
          <ul>
            {ALBUMS.map((album, index) => (
              <li key={album}>
                <button
                  className="flex h-12 w-full cursor-pointer items-center gap-3 px-4 text-left outline-none focus-visible:bg-muted active:bg-muted"
                  onClick={() => setDetail(index)}
                  type="button"
                >
                  <span
                    className="size-8 shrink-0 rounded-md"
                    style={{ backgroundColor: `oklch(0.75 0.08 ${(index * 37) % 360})` }}
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[12px] font-medium">{album}</span>
                    <span className="text-[10px] text-muted-foreground">Album · {2014 + (index % 12)}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{index + 1}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
      <motion.div
        animate={{ x: detail === null ? (reduce ? 0 : W) : 0, opacity: reduce && detail === null ? 0 : 1 }}
        className="absolute inset-0 flex flex-col bg-background"
        inert={detail === null}
        initial={false}
        transition={{ type: "spring", ...POP }}
      >
        <div className="flex items-center px-1.5" style={{ paddingTop: PHONE_INSETS.ios.top, height: PHONE_INSETS.ios.top + 36 }}>
          <button
            className="flex h-8 cursor-pointer items-center gap-0.5 rounded-full pr-2.5 pl-1 text-[13px] text-blue-600 outline-none dark:text-blue-400 focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() => setDetail(null)}
            type="button"
          >
            <CaretLeftIcon className="size-4" weight="bold" />
            Library
          </button>
        </div>
        {detail !== null ? (
          <div className="flex flex-col items-center gap-3 px-4 pt-2">
            <span
              className="size-28 rounded-xl shadow-(--custom-shadow)"
              style={{ backgroundColor: `oklch(0.75 0.08 ${(detail * 37) % 360})` }}
            />
            <span className="text-[15px] font-semibold">{ALBUMS[detail]}</span>
            <span className="text-[11px] text-muted-foreground">12 songs · 41 min</span>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

function HomeTabWithOwnState({ reduce }: { reduce: boolean }) {
  // Wrong: the tab's history lives inside the tab, so unmounting loses it.
  const [detail, setDetail] = useState<number | null>(null);
  return <HomeTab detail={detail} reduce={reduce} setDetail={setDetail} />;
}

function SearchTab() {
  return (
    <div className="absolute inset-0 flex flex-col gap-3 px-4" style={{ paddingTop: PHONE_INSETS.ios.top + 8 }}>
      <span className="text-[22px] font-bold tracking-tight">Search</span>
      <div className="flex h-8 items-center gap-2 rounded-lg bg-muted px-2.5 text-[12px] text-muted-foreground dark:bg-muted/60">
        <MagnifyingGlassIcon className="size-3.5" weight="bold" />
        Artists, songs, albums
      </div>
      <div className="grid grid-cols-2 gap-2">
        {["Pop", "Jazz", "Focus", "Chill", "Indie", "Live"].map((genre, i) => (
          <span
            key={genre}
            className="flex h-14 items-end rounded-lg p-2 text-[11px] font-semibold text-white"
            style={{ backgroundColor: `oklch(0.6 0.1 ${(i * 61 + 20) % 360})` }}
          >
            {genre}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TabStateDemo() {
  const reduce = useReducedMotion() ?? false;
  const [mode, setMode] = useState<TabMode>("resets");
  const [tab, setTab] = useState<TabName>("home");
  const [detail, setDetail] = useState<number | null>(null);
  const homeScroll = useRef<HTMLDivElement>(null);
  const keeps = mode === "keeps";

  function select(next: TabName) {
    if (next !== tab) {
      setTab(next);
      return;
    }
    if (!keeps || next !== "home") return;
    // Re-tap the active tab: pop to its root, and at the root scroll to top.
    if (detail !== null) setDetail(null);
    else homeScroll.current?.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone label="Music app with tabs on iPhone">
        {keeps ? (
          <>
            {/* Both tabs stay mounted; the hidden one keeps its stack and scroll. */}
            <div className={cn("absolute inset-0", tab !== "home" && "invisible")} inert={tab !== "home"}>
              <HomeTab detail={detail} reduce={reduce} scrollRef={homeScroll} setDetail={setDetail} />
            </div>
            <div className={cn("absolute inset-0", tab !== "search" && "invisible")} inert={tab !== "search"}>
              <SearchTab />
            </div>
          </>
        ) : tab === "home" ? (
          <HomeTabWithOwnState key="home" reduce={reduce} />
        ) : (
          <SearchTab key="search" />
        )}

        <nav
          aria-label="Tabs"
          className="absolute inset-x-0 bottom-0 z-30 flex border-t border-border bg-background"
          style={{ height: TAB_BAR_H + PHONE_INSETS.ios.bottom, paddingBottom: PHONE_INSETS.ios.bottom }}
        >
          {(
            [
              { value: "home", label: "Library", icon: HouseIcon },
              { value: "search", label: "Search", icon: MagnifyingGlassIcon },
            ] as const
          ).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              aria-current={tab === value ? "page" : undefined}
              className={cn(
                "flex flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 text-[10px] font-medium outline-none focus-visible:bg-muted",
                tab === value ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
              )}
              onClick={() => select(value)}
              type="button"
            >
              <Icon className="size-5" weight={tab === value ? "fill" : "regular"} />
              {label}
            </button>
          ))}
        </nav>
      </Phone>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        Scroll the library and open an album. Switch to Search and back, then
        tap Library again, twice.
      </p>
      <SegmentedControl
        ariaLabel="Tab state"
        onChange={(value) => {
          setMode(value);
          setTab("home");
          setDetail(null);
        }}
        options={TAB_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}
