"use client";

import {
  ArchiveIcon,
  ArrowCounterClockwiseIcon,
  DotsThreeIcon,
  EnvelopeSimpleIcon,
  FlagIcon,
  HeartIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import {
  HapticRing,
  Phone,
  PHONE_INSETS,
  usePhoneScale,
  vibrate,
} from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import { springFromFeel } from "@/lib/spring";
import { cn } from "@/lib/utils";

/* Double tap makes every single tap wait -------------------------------- */

// Android's DOUBLE_TAP_TIMEOUT. The single tap can't fire until it's over.
const DOUBLE_TAP_MS = 300;

function Photo({ hue }: { hue: "dawn" | "dusk" }) {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 size-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 160 200"
    >
      <rect className="fill-muted dark:fill-muted/70" height="200" width="160" />
      <circle
        className="fill-foreground/10"
        cx={hue === "dawn" ? 116 : 46}
        cy="58"
        r="18"
      />
      <path
        className="fill-foreground/15"
        d="M0 150 L44 104 L74 132 L108 92 L160 146 L160 200 L0 200 Z"
      />
      <path
        className="fill-foreground/25"
        d="M0 172 L36 146 L70 166 L118 132 L160 164 L160 200 L0 200 Z"
      />
    </svg>
  );
}

function PhotoCard({ doubleTap }: { doubleTap: boolean }) {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState(false);
  const [liked, setLiked] = useState(false);
  const [burst, setBurst] = useState(0);
  const [lag, setLag] = useState<number | null>(null);
  const pending = useRef(0);

  useEffect(() => () => window.clearTimeout(pending.current), []);

  function answer(t0: number) {
    setSelected((s) => !s);
    // Measure to the frame that shows the ring.
    requestAnimationFrame(() => setLag(performance.now() - t0));
  }

  function tap() {
    const t0 = performance.now();
    if (!doubleTap) {
      answer(t0);
      return;
    }
    if (pending.current) {
      // Second tap inside the window: it was a double tap, not a select.
      window.clearTimeout(pending.current);
      pending.current = 0;
      setLiked(true);
      setBurst((b) => b + 1);
      setLag(null);
      return;
    }
    pending.current = window.setTimeout(() => {
      pending.current = 0;
      answer(t0);
    }, DOUBLE_TAP_MS);
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative w-full max-w-36">
        <button
          aria-label={doubleTap ? "Photo. Tap to select, double tap to like." : "Photo. Tap to select."}
          aria-pressed={selected}
          className={cn(
            "relative block aspect-[4/5] w-full cursor-pointer touch-manipulation overflow-hidden rounded-2xl outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50",
            selected &&
              "ring-[2.5px] ring-foreground ring-offset-2 ring-offset-background"
          )}
          onClick={tap}
          type="button"
        >
          <Photo hue={doubleTap ? "dawn" : "dusk"} />
          <AnimatePresence>
            {burst > 0 ? (
              <motion.span
                key={burst}
                animate={{ opacity: [0, 1, 1, 0], scale: reduce ? 1 : [0.4, 1.15, 1, 1] }}
                aria-hidden="true"
                className="absolute inset-0 grid place-items-center"
                initial={{ opacity: 0 }}
                transition={{ duration: 0.8, times: [0, 0.25, 0.7, 1] }}
              >
                <HeartIcon className="size-14 text-white drop-shadow-md" weight="fill" />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </button>
        <button
          aria-label={liked ? "Unlike" : "Like"}
          aria-pressed={liked}
          className="absolute right-1.5 bottom-1.5 grid size-9 cursor-pointer after:absolute after:-inset-1 touch-manipulation place-items-center rounded-full bg-background/80 shadow-(--custom-shadow) outline-none backdrop-blur-sm transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-90 motion-reduce:active:scale-100"
          onClick={() => setLiked((l) => !l)}
          type="button"
        >
          <HeartIcon
            aria-hidden="true"
            className={cn("size-[18px]", liked ? "text-rose-500" : "text-foreground")}
            weight={liked ? "fill" : "regular"}
          />
        </button>
      </div>
      <p aria-live="polite" className="h-4 text-xs text-muted-foreground tabular-nums">
        {lag === null ? (
          "Tap the photo"
        ) : (
          <>
            Tap answered in{" "}
            <span
              className={cn(
                "font-medium",
                lag > 100 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
              )}
            >
              {Math.round(lag)} ms
            </span>
          </>
        )}
      </p>
    </div>
  );
}

export function DoubleTapDelayDemo() {
  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem label="Double tap to like" verdict="wrong">
          <PhotoCard doubleTap />
        </CompareItem>
        <CompareItem label="Like is a button" verdict="right">
          <PhotoCard doubleTap={false} />
        </CompareItem>
      </Compare>
      <p className="text-center text-xs text-muted-foreground">
        Tap each photo once to select it. Double tap the left one to like it.
      </p>
    </Demo>
  );
}

/* Every gesture has a visible twin ---------------------------------------- */

type Mail = { id: number; from: string; subject: string; time: string; unread: boolean; flagged: boolean };

const MAILS: Mail[] = [
  { id: 1, from: "Maya Chen", subject: "Draft for Thursday", time: "9:12", unread: true, flagged: false },
  { id: 2, from: "Studio Ops", subject: "Your invoice is ready", time: "8:40", unread: true, flagged: false },
  { id: 3, from: "Leo Park", subject: "Photos from the trip", time: "Tue", unread: false, flagged: false },
  { id: 4, from: "Nadia Rahman", subject: "Re: the logo files", time: "Mon", unread: false, flagged: false },
  { id: 5, from: "Calendar", subject: "Design review moved", time: "Sun", unread: false, flagged: false },
];

/** Screen px per layout px inside a Phone: 1 on desktop, about 1.5 on a phone. */
function scaleOf(el: HTMLElement) {
  return el.getBoundingClientRect().width / el.offsetWidth || 1;
}

const HOLD_MS = 500;
const HOLD_SLOP = 10;
const SNAP = springFromFeel(0.35, 0);

type Gestures = "on" | "off";
const GESTURE_OPTIONS = [
  { value: "on", label: "Gestures on" },
  { value: "off", label: "Buttons only" },
] as const;

type Hint = "swipe" | "hold" | null;

function MailRow({
  mail,
  gestures,
  onArchive,
  onMenu,
  onHint,
  onHaptic,
  buttonRef,
}: {
  mail: Mail;
  gestures: boolean;
  onArchive: () => void;
  onMenu: (row: HTMLElement, viaButton: boolean) => void;
  onHint: (hint: Hint) => void;
  onHaptic: (x: number, y: number) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const reduce = useReducedMotion();
  const k = usePhoneScale();
  const x = useMotionValue(0);
  const reveal = useTransform(x, [-90, -20], [1, 0]);
  const rowRef = useRef<HTMLDivElement>(null);
  const g = useRef({
    id: -1,
    sx: 0,
    sy: 0,
    mode: "idle" as "idle" | "pending" | "pan" | "done",
    timer: 0,
    samples: [] as { t: number; x: number }[],
  });

  useEffect(() => {
    const s = g.current;
    return () => window.clearTimeout(s.timer);
  }, []);

  function settle(velocity: number) {
    const width = rowRef.current?.offsetWidth ?? 240;
    const past = x.get() < -width * 0.4 || velocity < -600;
    if (past) {
      onHint("swipe");
      animate(x, -width, { type: "spring", ...SNAP, velocity }).then(onArchive);
    } else {
      animate(x, 0, { type: "spring", ...SNAP, velocity });
    }
  }

  return (
    <div ref={rowRef} className="relative overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-end bg-emerald-600 pr-5 text-white"
        style={{ opacity: reveal }}
      >
        <ArchiveIcon className="size-5" weight="fill" />
      </motion.div>
      <motion.div
        className={cn(
          "relative flex h-[58px] items-stretch bg-background [-webkit-touch-callout:none]",
          gestures ? "touch-pan-y" : ""
        )}
        onContextMenu={(event) => {
          event.preventDefault();
          // A touch hold in progress (Android Chrome sends contextmenu too)
          // opens the menu from its own timer.
          if (g.current.mode === "pending" || g.current.mode === "done") return;
          if (rowRef.current) onMenu(rowRef.current, false);
        }}
        onPointerCancel={() => {
          const s = g.current;
          window.clearTimeout(s.timer);
          if (s.mode === "pan") animate(x, 0, { type: "spring", ...SNAP });
          s.mode = "idle";
        }}
        onPointerDown={(event) => {
          if (!gestures || event.button !== 0) return;
          if ((event.target as HTMLElement).closest("button")) return;
          const s = g.current;
          s.id = event.pointerId;
          s.sx = event.clientX;
          s.sy = event.clientY;
          s.mode = "pending";
          s.samples = [{ t: event.timeStamp, x: 0 }];
          const cx = event.clientX;
          const cy = event.clientY;
          s.timer = window.setTimeout(() => {
            if (g.current.mode !== "pending" || !rowRef.current) return;
            g.current.mode = "done";
            onHaptic(cx, cy);
            onHint("hold");
            onMenu(rowRef.current, false);
          }, HOLD_MS);
        }}
        onPointerMove={(event) => {
          const s = g.current;
          if (event.pointerId !== s.id) return;
          // Pointer deltas are screen px; the row lives in the phone's units.
          const dx = (event.clientX - s.sx) / k;
          const dy = (event.clientY - s.sy) / k;
          if (s.mode === "pending") {
            if (Math.hypot(dx, dy) > HOLD_SLOP) window.clearTimeout(s.timer);
            if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
              s.mode = "pan";
              event.currentTarget.setPointerCapture(event.pointerId);
            } else if (Math.abs(dy) > 8) {
              s.mode = "idle";
            }
          }
          if (s.mode === "pan") {
            x.set(dx < 0 ? dx : dx * 0.15);
            s.samples.push({ t: event.timeStamp, x: dx });
            if (s.samples.length > 6) s.samples.shift();
          }
        }}
        onPointerUp={() => {
          const s = g.current;
          window.clearTimeout(s.timer);
          if (s.mode === "pan") {
            const a = s.samples[0];
            const b = s.samples[s.samples.length - 1];
            const dt = b.t - a.t;
            settle(dt > 0 && dt < 120 && !reduce ? ((b.x - a.x) / dt) * 1000 : 0);
          }
          s.mode = "idle";
        }}
        style={{ x }}
      >
        <div className="flex w-5 shrink-0 items-start justify-center pt-[13px]">
          {mail.unread ? <span className="size-2 rounded-full bg-sky-500" /> : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center border-b border-border/70">
          <div className="flex items-baseline justify-between gap-2 pr-1">
            <span className="truncate text-[13px] leading-tight font-semibold">
              {mail.from}
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
              {mail.flagged ? (
                <FlagIcon aria-label="Flagged" className="size-3 text-amber-500" weight="fill" />
              ) : null}
              {mail.time}
            </span>
          </div>
          <span className="truncate text-[11px] leading-snug text-muted-foreground">
            {mail.subject}
          </span>
        </div>
        <div className="flex shrink-0 items-center border-b border-border/70 pr-1.5">
          <button
            ref={buttonRef}
            aria-haspopup="menu"
            aria-label={`Actions for ${mail.from}`}
            className="grid size-9 cursor-pointer place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() => rowRef.current && onMenu(rowRef.current, true)}
            type="button"
          >
            <DotsThreeIcon aria-hidden="true" className="size-5" weight="bold" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function GestureTwinDemo() {
  const reduce = useReducedMotion();
  const [gestures, setGestures] = useState<Gestures>("on");
  const [mails, setMails] = useState(MAILS);
  const [menu, setMenu] = useState<{ id: number; top: number; below: boolean } | null>(null);
  const [undo, setUndo] = useState<{ mail: Mail; index: number; verb: string } | null>(null);
  const [hint, setHint] = useState<Hint>(null);
  const [haptic, setHaptic] = useState({ pulse: 0, x: 0, y: 0 });
  const screenRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggers = useRef(new Map<number, HTMLButtonElement>());
  const hintTimer = useRef(0);
  const viaButton = useRef(false);
  const openedAt = useRef(0);

  useEffect(() => () => window.clearTimeout(hintTimer.current), []);

  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector<HTMLButtonElement>("[role=menuitem]")?.focus({ preventScroll: true });
  }, [menu]);

  function flashHint(next: Hint) {
    setHint(next);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(null), 1400);
  }

  function openMenu(id: number, row: HTMLElement, fromButton: boolean) {
    const screen = screenRef.current;
    if (!screen) return;
    const k = scaleOf(screen);
    const s = screen.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    const top = (r.top - s.top) / k;
    const bottom = (r.bottom - s.top) / k;
    const below = bottom + 168 < screen.offsetHeight - PHONE_INSETS.ios.bottom;
    viaButton.current = fromButton;
    openedAt.current = performance.now();
    setMenu({ id, top: below ? bottom + 4 : top - 4, below });
  }

  function closeMenu() {
    const id = menu?.id;
    setMenu(null);
    if (id !== undefined && viaButton.current) triggers.current.get(id)?.focus({ preventScroll: true });
  }

  function remove(id: number, verb: string) {
    const index = mails.findIndex((m) => m.id === id);
    if (index < 0) return;
    setUndo({ mail: mails[index], index, verb });
    setMails((list) => list.filter((m) => m.id !== id));
  }

  function act(action: "archive" | "unread" | "flag" | "delete") {
    // The click that ends a touch hold can land on an item under the finger.
    if (!menu || performance.now() - openedAt.current < 300) return;
    const id = menu.id;
    setMenu(null);
    if (action === "archive") remove(id, "Archived");
    else if (action === "delete") remove(id, "Deleted");
    else
      setMails((list) =>
        list.map((m) =>
          m.id === id
            ? action === "unread"
              ? { ...m, unread: !m.unread }
              : { ...m, flagged: !m.flagged }
            : m
        )
      );
  }

  function undoLast() {
    if (!undo) return;
    setMails((list) => {
      const next = [...list];
      next.splice(Math.min(undo.index, next.length), 0, undo.mail);
      return next;
    });
    setUndo(null);
  }

  const current = menu ? mails.find((m) => m.id === menu.id) : undefined;

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone label="Mail inbox on iPhone">
        <div ref={screenRef} className="absolute inset-0">
          <div
            className="px-4 pb-2 text-lg font-semibold"
            style={{ paddingTop: PHONE_INSETS.ios.top + 6 }}
          >
            Inbox
          </div>
          <ul>
            <AnimatePresence initial={false}>
              {mails.map((mail) => (
                <motion.li
                  key={mail.id}
                  exit={{ height: 0, opacity: 0 }}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  <MailRow
                    buttonRef={(el) => {
                      if (el) triggers.current.set(mail.id, el);
                      else triggers.current.delete(mail.id);
                    }}
                    gestures={gestures === "on"}
                    mail={mail}
                    onArchive={() => remove(mail.id, "Archived")}
                    onHaptic={(cx, cy) => {
                      const screen = screenRef.current;
                      if (!screen) return;
                      const s = screen.getBoundingClientRect();
                      const k = scaleOf(screen);
                      setHaptic((h) => ({ pulse: h.pulse + 1, x: (cx - s.left) / k, y: (cy - s.top) / k }));
                      vibrate("medium");
                    }}
                    onHint={flashHint}
                    onMenu={(row, fromButton) => openMenu(mail.id, row, fromButton)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {mails.length === 0 ? (
            <div className="flex flex-col items-center gap-3 pt-16 text-xs text-muted-foreground">
              Inbox zero
              <button
                className="cursor-pointer rounded-full bg-muted px-3 py-1.5 font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                onClick={() => {
                  setMails(MAILS);
                  setUndo(null);
                }}
                type="button"
              >
                Reset inbox
              </button>
            </div>
          ) : null}

          <AnimatePresence>
            {undo ? (
              <motion.div
                key={undo.mail.id}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-x-3 z-20 flex h-10 items-center justify-between rounded-xl bg-foreground pr-1 pl-3.5 text-xs text-background shadow-lg"
                exit={{ opacity: 0, y: 8 }}
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                role="status"
                style={{ bottom: PHONE_INSETS.ios.bottom + 6 }}
                transition={{ duration: 0.2 }}
              >
                {undo.verb}
                <button
                  className="flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2.5 font-medium outline-none hover:bg-background/10 focus-visible:ring-2 focus-visible:ring-background/60"
                  onClick={undoLast}
                  type="button"
                >
                  <ArrowCounterClockwiseIcon aria-hidden="true" className="size-3.5" weight="bold" />
                  Undo
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {menu && current ? (
              <motion.div
                key="menu"
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-30"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") closeMenu();
                }}
                transition={{ duration: 0.15 }}
              >
                <button
                  aria-label="Close menu"
                  className="absolute inset-0 cursor-default bg-black/15 outline-none dark:bg-black/40"
                  // Close on a new press, not on click: the click that ends the hold
                  // that opened the menu lands here on touch and would close it.
                  onPointerDown={closeMenu}
                  tabIndex={-1}
                  type="button"
                />
                <motion.div
                  ref={menuRef}
                  animate={{ scale: 1, opacity: 1 }}
                  aria-label={`Actions for ${current.from}`}
                  className="absolute right-3 w-44 overflow-hidden rounded-xl bg-card p-1 shadow-(--custom-shadow) ring-1 ring-border"
                  initial={{ scale: reduce ? 1 : 0.92, opacity: 0 }}
                  role="menu"
                  style={{
                    top: menu.top,
                    translateY: menu.below ? 0 : "-100%",
                    transformOrigin: menu.below ? "top right" : "bottom right",
                  }}
                  transition={{ type: "spring", ...springFromFeel(0.25, 0.1) }}
                >
                  {(
                    [
                      ["archive", "Archive", ArchiveIcon],
                      ["unread", current.unread ? "Mark as read" : "Mark as unread", EnvelopeSimpleIcon],
                      ["flag", current.flagged ? "Unflag" : "Flag", FlagIcon],
                      ["delete", "Delete", TrashIcon],
                    ] as const
                  ).map(([key, label, Icon]) => (
                    <button
                      key={key}
                      className={cn(
                        "flex h-9 w-full cursor-pointer items-center justify-between rounded-lg px-2.5 text-left text-[13px] outline-none hover:bg-muted focus-visible:bg-muted",
                        key === "delete" &&
                          "mt-1 text-rose-600 shadow-[0_-1px_0_var(--color-border)] dark:text-rose-400"
                      )}
                      onClick={() => act(key)}
                      role="menuitem"
                      type="button"
                    >
                      {label}
                      <Icon aria-hidden="true" className="size-4" />
                    </button>
                  ))}
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <HapticRing kind="medium" pulse={haptic.pulse} x={haptic.x} y={haptic.y} />
        </div>
      </Phone>

      <div className="flex w-full max-w-72 flex-col gap-1.5 text-xs">
        {(
          [
            ["swipe", "Swipe a row left", "Archive in the ··· menu"],
            ["hold", "Touch and hold a row", "The ··· button"],
          ] as const
        ).map(([key, gesture, twin]) => (
          <div
            key={key}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg border border-dashed px-2.5 py-1.5 transition-colors duration-300",
              hint === key ? "border-sky-500/60 bg-sky-500/5" : "border-transparent"
            )}
          >
            <span
              className={cn(
                gestures === "off" &&
                  "text-muted-foreground line-through decoration-muted-foreground/60"
              )}
            >
              {gesture}
            </span>
            <span className="text-muted-foreground">{twin}</span>
          </div>
        ))}
      </div>

      <SegmentedControl
        ariaLabel="Gesture shortcuts"
        onChange={(next) => {
          setGestures(next);
          setMenu(null);
        }}
        options={GESTURE_OPTIONS}
        value={gestures}
      />
      <p className="-mt-2 text-center text-xs text-muted-foreground">
        Swipe a row left or hold it. Then turn gestures off and do the same with ···.
      </p>
    </Demo>
  );
}
