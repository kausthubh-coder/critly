"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import {
  Compare,
  CompareItem,
  RIGHT_ICON,
  WRONG_ICON,
} from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Phone, PHONE_INSETS } from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import { projectMomentum, springFromFeel } from "@/lib/spring";
import { cn } from "@/lib/utils";

/* Touch-down vs release ------------------------------------------------- */

// The timeline under each button spans this many ms of holding.
const TIMELINE_MS = 600;
// How far the finger may drift off the button and still count as on it.
// React Native's Pressable keeps 20pt on the sides (pressRetentionOffset).
const RETAIN = 16;

type Answer = { at: number; cancelled: boolean } | null;

function FollowButton({ onDown }: { onDown: boolean }) {
  const reduce = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const [following, setFollowing] = useState(false);
  const [answer, setAnswer] = useState<Answer>(null);
  const hold = useMotionValue(0);
  const g = useRef({ active: false, inside: false, t0: 0, flash: 0 });
  const run = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => () => window.clearTimeout(g.current.flash), []);

  function end(cancelled: boolean) {
    const s = g.current;
    if (!s.active) return;
    s.active = false;
    run.current?.stop();
    const held = performance.now() - s.t0;
    if (cancelled || !s.inside) {
      setPressed(false);
      setAnswer({ at: held, cancelled: true });
      return;
    }
    setFollowing((f) => !f);
    if (onDown) {
      setPressed(false);
      setAnswer({ at: 0, cancelled: false });
    } else {
      // The release-only button finally shows something, after the fact.
      setPressed(true);
      s.flash = window.setTimeout(() => setPressed(false), 120);
      setAnswer({ at: held, cancelled: false });
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <button
        aria-pressed={following}
        className={cn(
          "relative h-11 w-32 cursor-pointer touch-manipulation overflow-hidden rounded-full text-sm font-medium outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "transition-transform ease-out motion-reduce:transition-none",
          following
            ? "bg-foreground text-background"
            : "bg-card text-foreground shadow-(--custom-shadow)",
          pressed ? "duration-0" : "duration-150",
          pressed && !reduce && "scale-[0.97]"
        )}
        onClick={(event) => {
          // Keyboard: Enter and Space arrive as a click with no pointer.
          if (event.detail === 0) setFollowing((f) => !f);
        }}
        onLostPointerCapture={() => end(true)}
        onPointerCancel={() => end(true)}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          window.clearTimeout(g.current.flash);
          g.current = { ...g.current, active: true, inside: true, t0: performance.now() };
          setAnswer(null);
          if (onDown) setPressed(true);
          else setPressed(false);
          hold.set(0);
          run.current = animate(hold, 1, {
            duration: TIMELINE_MS / 1000,
            ease: "linear",
          });
        }}
        onPointerMove={(event) => {
          const s = g.current;
          if (!s.active) return;
          const r = event.currentTarget.getBoundingClientRect();
          const inside =
            event.clientX > r.left - RETAIN &&
            event.clientX < r.right + RETAIN &&
            event.clientY > r.top - RETAIN &&
            event.clientY < r.bottom + RETAIN;
          if (inside === s.inside) return;
          s.inside = inside;
          // Slide off and the button lets go; slide back and it presses again.
          if (onDown) setPressed(inside);
        }}
        onPointerUp={() => end(false)}
        type="button"
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 transition-opacity ease-out",
            following ? "bg-background/20" : "bg-foreground/10",
            pressed ? "opacity-100 duration-0" : "opacity-0 duration-200"
          )}
        />
        <span className="relative">{following ? "Following" : "Follow"}</span>
      </button>

      <div className="flex w-full max-w-44 flex-col gap-1.5">
        <div className="relative h-2 w-full rounded-full bg-muted dark:bg-muted/60">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 origin-left rounded-full bg-foreground/20"
            style={{ scaleX: hold }}
          />
          {answer ? (
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background",
                answer.cancelled ? "bg-muted-foreground" : "bg-sky-500"
              )}
              style={{ left: `${Math.min(answer.at / TIMELINE_MS, 1) * 100}%` }}
            />
          ) : null}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>down</span>
          <span>{TIMELINE_MS} ms</span>
        </div>
      </div>

      <p aria-live="polite" className="h-4 text-xs text-muted-foreground tabular-nums">
        {answer === null
          ? "Not pressed yet"
          : answer.cancelled
            ? "Slid off, nothing fired"
            : answer.at < 1
              ? "Answered at touch-down"
              : `Answered ${Math.round(answer.at)} ms after touch`}
      </p>
    </div>
  );
}

export function TouchDownDemo() {
  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <Compare>
        <CompareItem label="On release" verdict="wrong">
          <FollowButton onDown={false} />
        </CompareItem>
        <CompareItem label="On touch-down" verdict="right">
          <FollowButton onDown />
        </CompareItem>
      </Compare>
      <div className="flex flex-col items-center gap-2">
        <p className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-4 rounded-full bg-foreground/20" />
            finger down
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-sky-500" />
            first feedback
          </span>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Press and hold each button. Slide off before letting go to cancel.
        </p>
      </div>
    </Demo>
  );
}

/* Press inside a scroll view --------------------------------------------- */

const CONTACTS = [
  ["Ada Lovelace", "The engine can do more than numbers"],
  ["Grace Hopper", "Found the bug. It was a moth."],
  ["Alan Turing", "Can machines think? Lunch first."],
  ["Katherine Johnson", "Trajectory checks out"],
  ["Linus Torvalds", "Just a hobby, won't be big"],
  ["Margaret Hamilton", "Priority display is working"],
  ["Dennis Ritchie", "Sent you the C notes"],
  ["Hedy Lamarr", "Frequency hopping, call me"],
  ["Tim Berners-Lee", "I made a page. Have a look"],
  ["Barbara Liskov", "Subtypes should behave"],
  ["Ken Thompson", "Unix is ready to try"],
  ["Radia Perlman", "The tree protocol poem"],
  ["Donald Knuth", "Here is a cheque for $2.56"],
  ["Frances Allen", "Compilers, Friday?"],
] as const;

// About 8dp of touch slop, in the phone's 248px layout (0.63 of real size).
const SLOP = 6;
// Android's TAP_TIMEOUT: how long a press waits inside a scrolling parent.
const PRESS_DELAY = 100;
const FLING = springFromFeel(0.7, 0);

/** Screen px per layout px inside a Phone: 1 on desktop, about 1.5 on a phone. */
function scaleOf(el: HTMLElement) {
  return el.getBoundingClientRect().width / el.offsetWidth || 1;
}

type ScrollMode = "instant" | "delayed";

const SCROLL_OPTIONS = [
  { value: "instant", label: "Instant", icon: WRONG_ICON },
  { value: "delayed", label: "Delayed", icon: RIGHT_ICON },
] as const;

type Fire = { id: number; name: string; scrolled: boolean };

export function ScrollCancelDemo() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<ScrollMode>("instant");
  const [pressed, setPressed] = useState<number | null>(null);
  const [log, setLog] = useState<Fire[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const fling = useRef<AnimationPlaybackControls | null>(null);
  const nextId = useRef(0);
  const g = useRef({
    active: false,
    pointerId: -1,
    row: -1,
    x: 0,
    y: 0,
    top: 0,
    moved: false,
    mouse: false,
    waitingTouchEnd: false,
    k: 1,
    timer: 0,
    unpress: 0,
    samples: [] as { t: number; y: number }[],
  });

  useEffect(() => {
    const s = g.current;
    return () => {
      window.clearTimeout(s.timer);
      window.clearTimeout(s.unpress);
      fling.current?.stop();
    };
  }, []);

  function fire(row: number, scrolled: boolean) {
    const id = nextId.current++;
    setLog((l) => [{ id, name: CONTACTS[row][0], scrolled }, ...l].slice(0, 3));
  }

  function flash(row: number) {
    setPressed(row);
    window.clearTimeout(g.current.unpress);
    g.current.unpress = window.setTimeout(() => setPressed(null), 100);
  }

  function changeMode(next: ScrollMode) {
    setMode(next);
    setLog([]);
    setPressed(null);
    scroller.current?.scrollTo({ top: 0 });
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const el = scroller.current;
    const rowEl = (event.target as HTMLElement).closest<HTMLElement>("[data-row]");
    if (!el || !rowEl) return;
    fling.current?.stop();
    const s = g.current;
    window.clearTimeout(s.timer);
    window.clearTimeout(s.unpress);
    const row = Number(rowEl.dataset.row);
    Object.assign(s, {
      active: true,
      pointerId: event.pointerId,
      row,
      x: event.clientX,
      y: event.clientY,
      top: el.scrollTop,
      moved: false,
      mouse: event.pointerType === "mouse",
      waitingTouchEnd: false,
      // On a phone the screen is scaled up; distances below are in its units.
      k: scaleOf(el),
      samples: [{ t: event.timeStamp, y: event.clientY }],
    });
    // A mouse can't scroll by dragging, so the demo scrolls for it. A finger
    // scrolls natively (touch-action: pan-y) and the browser cancels the
    // pointer once it takes over.
    if (s.mouse) {
      event.preventDefault();
      el.setPointerCapture(event.pointerId);
    }
    if (mode === "instant") {
      setPressed(row);
    } else {
      setPressed(null);
      s.timer = window.setTimeout(() => {
        if (!g.current.moved) setPressed(row);
      }, PRESS_DELAY);
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const s = g.current;
    if (!s.active || event.pointerId !== s.pointerId) return;
    const dx = (event.clientX - s.x) / s.k;
    const dy = (event.clientY - s.y) / s.k;
    if (!s.moved && Math.hypot(dx, dy) > SLOP) {
      s.moved = true;
      if (mode === "delayed") {
        // Past the slop it's a scroll: drop the press before it shows.
        window.clearTimeout(s.timer);
        setPressed(null);
      }
    }
    if (s.mouse && s.moved && scroller.current) {
      scroller.current.scrollTop = s.top - dy;
      s.samples.push({ t: event.timeStamp, y: event.clientY });
      if (s.samples.length > 6) s.samples.shift();
    }
  }

  function throwList() {
    const el = scroller.current;
    const s = g.current;
    if (!el || reduce || s.samples.length < 2) return;
    const a = s.samples[0];
    const b = s.samples[s.samples.length - 1];
    const dt = b.t - a.t;
    if (dt <= 0 || dt > 120) return;
    // Finger velocity in px/s; the list moves the opposite way.
    const velocity = -((b.y - a.y) / s.k / dt) * 1000;
    const max = el.scrollHeight - el.clientHeight;
    const from = el.scrollTop;
    const to = Math.max(0, Math.min(max, from + projectMomentum(velocity, 0.997)));
    fling.current = animate(from, to, {
      type: "spring",
      ...FLING,
      velocity,
      onUpdate: (v) => {
        el.scrollTop = v;
      },
    });
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const s = g.current;
    if (!s.active || event.pointerId !== s.pointerId) return;
    s.active = false;
    window.clearTimeout(s.timer);
    if (s.mouse && s.moved) throwList();
    if (mode === "instant") {
      // Naive: whatever row the finger started on fires on lift.
      fire(s.row, s.moved);
      flash(s.row);
    } else if (!s.moved) {
      // A quick tap still shows the press, briefly, on release.
      fire(s.row, false);
      flash(s.row);
    }
  }

  function onPointerCancel(event: React.PointerEvent<HTMLDivElement>) {
    const s = g.current;
    if (!s.active || event.pointerId !== s.pointerId) return;
    s.active = false;
    window.clearTimeout(s.timer);
    if (mode === "instant") {
      // Code that listens for touchend still gets it after a scroll, so the
      // row stays lit and fires when the finger lifts.
      s.waitingTouchEnd = true;
    } else {
      setPressed(null);
    }
  }

  function onTouchEnd() {
    const s = g.current;
    if (!s.waitingTouchEnd) return;
    s.waitingTouchEnd = false;
    fire(s.row, true);
    flash(s.row);
  }

  const top = PHONE_INSETS.ios.top;

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone label="Messages list on iPhone">
        <div
          className="absolute inset-x-0 z-10 bg-background px-4 pb-2 text-lg font-semibold"
          style={{ top, paddingTop: 6 }}
        >
          Messages
        </div>
        <div
          ref={scroller}
          className="scrollbar-hidden absolute inset-x-0 bottom-0 touch-pan-y overflow-y-auto overscroll-contain"
          onLostPointerCapture={(event) => {
            if (g.current.mouse) onPointerUp(event);
          }}
          onPointerCancel={onPointerCancel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onTouchEnd={onTouchEnd}
          style={{ top: top + 40, paddingBottom: PHONE_INSETS.ios.bottom }}
        >
          <ul>
            {CONTACTS.map(([name, preview], index) => (
              <li key={name}>
                <button
                  aria-label={`${name}: ${preview}`}
                  className={cn(
                    "flex h-12 w-full cursor-pointer items-center gap-2.5 pl-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
                    "transition-colors ease-out",
                    pressed === index
                      ? "bg-foreground/10 duration-0"
                      : "duration-200"
                  )}
                  data-row={index}
                  onClick={(event) => {
                    if (event.detail === 0) fire(index, false);
                  }}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground dark:bg-muted/70"
                  >
                    {name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span className="flex h-full min-w-0 flex-1 flex-col justify-center border-b border-border/70 pr-4">
                    <span className="truncate text-[13px] leading-tight font-medium">
                      {name}
                    </span>
                    <span className="truncate text-[11px] leading-tight text-foreground/65">
                      {preview}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Phone>

      <ul aria-live="polite" className="flex h-[54px] w-60 flex-col gap-1 text-xs">
        {log.length === 0 ? (
          <li className="text-center text-muted-foreground">Nothing opened yet</li>
        ) : (
          log.map((entry, index) => (
            <li
              key={entry.id}
              className={cn(
                "flex items-center justify-between gap-3 transition-opacity",
                index > 0 && "opacity-50"
              )}
            >
              <span className="truncate">Opened {entry.name}</span>
              {entry.scrolled ? (
                <span className="shrink-0 font-medium text-rose-600 dark:text-rose-400">
                  while scrolling
                </span>
              ) : (
                <span className="shrink-0 text-muted-foreground">tap</span>
              )}
            </li>
          ))
        )}
      </ul>

      <SegmentedControl
        ariaLabel="When rows show they are pressed"
        onChange={changeMode}
        options={SCROLL_OPTIONS}
        value={mode}
      />
      <p className="-mt-2 text-center text-xs text-muted-foreground">
        Drag the list to scroll, starting on a row. Then tap a row.
      </p>
    </Demo>
  );
}
