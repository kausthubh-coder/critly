"use client";

import {
  ArchiveIcon,
  DotsThreeIcon,
  EnvelopeOpenIcon,
  EnvelopeSimpleIcon,
  FlagIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  AnimatePresence,
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
import {
  HapticRing,
  Phone,
  PHONE_INSETS,
  PHONE_WIDTH,
  vibrate,
  type HapticKind,
} from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { projectMomentum, springFromFeel } from "@/lib/spring";
import { cn } from "@/lib/utils";

// Settle after a swipe: no bounce, with the release velocity passed in.
const SETTLE = springFromFeel(0.4, 0);
const SETTLE_REDUCED = springFromFeel(0.2, 0);
// The commit snap (icon jump, colour fill) is quick and a touch springy.
const SNAP = springFromFeel(0.25, 0.15);

const ROW_W = PHONE_WIDTH;
const ROW_H = 64;
const SLOP = 8; // px of horizontal travel before a row claims the gesture

// Same curve as Momentum's rubber band: 55% of the finger at first, never
// past `size`.
function rubberBand(over: number, size: number, c = 0.55) {
  return (1 - 1 / ((Math.abs(over) * c) / size + 1)) * size * Math.sign(over);
}

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

/** Velocity in px/s from the last 100ms of samples; 0 if the finger stopped. */
function releaseVelocity(samples: Sample[], now: number) {
  if (samples.length < 2) return 0;
  const last = samples[samples.length - 1];
  if (now - last.t > 80) return 0;
  const first = samples[0];
  const dt = (last.t - first.t) / 1000;
  return dt > 0 ? (last.x - first.x) / dt : 0;
}

/**
 * A horizontal swipe that leaves vertical scrolling to the browser: the
 * surface sets `touch-action: pan-y`, claims the pointer only after 8px of
 * mostly-horizontal travel, and gives up if the finger goes vertical first.
 */
function useHorizontalSwipe({
  onStart,
  onMove,
  onEnd,
  onDown,
  onTap,
}: {
  onStart: () => number;
  onMove: (x: number, event: React.PointerEvent) => void;
  onEnd: (velocity: number) => void;
  onDown?: () => void;
  onTap?: () => void;
}) {
  const gesture = useRef<{
    id: number;
    sx: number;
    sy: number;
    start: number;
    k: number;
    mode: "pending" | "swipe" | "scroll";
    samples: Sample[];
  } | null>(null);

  return {
    onPointerDown(event: React.PointerEvent<HTMLElement>) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if ((event.target as HTMLElement).closest("button")) return;
      onDown?.();
      const k = scaleOf(event.currentTarget);
      gesture.current = {
        id: event.pointerId,
        sx: event.clientX / k,
        sy: event.clientY / k,
        start: 0,
        k,
        mode: "pending",
        samples: [{ t: event.timeStamp, x: event.clientX / k }],
      };
    },
    onPointerMove(event: React.PointerEvent<HTMLElement>) {
      const g = gesture.current;
      if (!g || g.id !== event.pointerId) return;
      const px = event.clientX / g.k;
      const dx = px - g.sx;
      const dy = event.clientY / g.k - g.sy;
      if (g.mode === "pending") {
        if (Math.abs(dx) > SLOP && Math.abs(dx) > Math.abs(dy)) {
          g.mode = "swipe";
          g.start = onStart();
          g.sx += Math.sign(dx) * SLOP; // track 1:1 from here, no jump
          event.currentTarget.setPointerCapture(event.pointerId);
        } else if (Math.abs(dy) > SLOP) {
          g.mode = "scroll";
        }
      }
      if (g.mode !== "swipe") return;
      g.samples.push({ t: event.timeStamp, x: px });
      while (g.samples.length > 2 && event.timeStamp - g.samples[0].t > 100) {
        g.samples.shift();
      }
      onMove(g.start + px - g.sx, event);
    },
    onPointerUp(event: React.PointerEvent<HTMLElement>) {
      const g = gesture.current;
      if (!g || g.id !== event.pointerId) return;
      gesture.current = null;
      if (g.mode === "swipe") onEnd(releaseVelocity(g.samples, event.timeStamp));
      else if (g.mode === "pending") onTap?.();
    },
    onPointerCancel(event: React.PointerEvent<HTMLElement>) {
      const g = gesture.current;
      if (!g || g.id !== event.pointerId) return;
      gesture.current = null;
      if (g.mode === "swipe") onEnd(0);
    },
  };
}

type Mail = {
  id: number;
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  flagged: boolean;
};

const INBOX: Mail[] = [
  { id: 1, from: "Maya Chen", subject: "Friday plans", preview: "Are we still on for the climbing gym? I can book the 6pm slot.", time: "9:24", unread: true, flagged: false },
  { id: 2, from: "Linear", subject: "3 issues assigned to you", preview: "ENG-412 Sheet snaps past the medium detent on fast flicks", time: "8:51", unread: true, flagged: false },
  { id: 3, from: "Jonah Park", subject: "Re: invoice #2041", preview: "Paid, thanks! Receipt attached for your records.", time: "8:02", unread: false, flagged: false },
  { id: 4, from: "Studio Rent", subject: "October reminder", preview: "Your payment of $640 is due on the 15th.", time: "Yesterday", unread: false, flagged: true },
  { id: 5, from: "Ana Ruiz", subject: "Photos from the trip", preview: "Finally sorted them. The ones from the ridge came out great.", time: "Yesterday", unread: false, flagged: false },
  { id: 6, from: "GitHub", subject: "Your weekly digest", preview: "12 pull requests merged across 3 repositories.", time: "Sun", unread: false, flagged: false },
  { id: 7, from: "Leo Brandt", subject: "Lunch?", preview: "New ramen place opened on 5th. Thursday works for me.", time: "Sat", unread: false, flagged: false },
];

type Action = "read" | "flag" | "archive" | "delete";

type Haptic = { pulse: number; x: number; y: number; kind: HapticKind };

function useHaptic(screen: React.RefObject<HTMLDivElement | null>) {
  const [haptic, setHaptic] = useState<Haptic>({ pulse: 0, x: 0, y: 0, kind: "medium" });
  function fire(clientX: number, clientY: number, kind: HapticKind) {
    const el = screen.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const k = scaleOf(el);
    vibrate(kind);
    setHaptic((h) => ({
      pulse: h.pulse + 1,
      x: (clientX - rect.left) / k,
      y: (clientY - rect.top) / k,
      kind,
    }));
  }
  return [haptic, fire] as const;
}

/* Swipe actions: a Mail-style inbox */

// Trailing actions from the edge in: Delete (full swipe), Archive, Flag.
const BTN_W = 48;
const TRAILING = 3;
const REVEAL = BTN_W * TRAILING; // 144px, about 58% of the row, like Mail
const COMMIT = 184; // 74% of the row: past here a release deletes
const TRAIL_MAX = ROW_W - 12;
const READ_W = 72; // leading Read: one action, no full swipe

function constrain(raw: number) {
  if (raw > READ_W) return READ_W + rubberBand(raw - READ_W, ROW_W);
  if (raw < -TRAIL_MAX) return -TRAIL_MAX + rubberBand(raw + TRAIL_MAX, ROW_W);
  return raw;
}

function TrailingAction({
  index,
  x,
  armed,
  label,
  icon,
  className,
  onPress,
  subject,
}: {
  index: number;
  x: MotionValue<number>;
  armed: MotionValue<number>;
  label: string;
  icon: React.ReactNode;
  className: string;
  onPress: () => void;
  subject: string;
}) {
  // Each button is a full-width slab anchored at the right edge. Slab i
  // starts i thirds of the way in, so the revealed width splits evenly.
  // Once armed, the others slide under the row and Delete fills it all.
  const slab = useTransform(() => {
    const w = Math.max(0, -x.get());
    const a = armed.get();
    if (index === 0) return 0;
    return -((w * index) / TRAILING) * (1 - a) - w * a;
  });
  // The icon sits in the middle of its slot; armed, Delete's icon jumps to
  // the row's edge, next to the finger.
  const iconX = useTransform(() => {
    const w = Math.max(0, -x.get());
    const center = w / (TRAILING * 2);
    const offset = index === 0 ? center + (w - 30 - center) * armed.get() : center;
    return -(offset - BTN_W / 2);
  });
  const iconOpacity = useTransform(x, [-REVEAL * 0.35, -REVEAL * 0.8], [0, 1]);

  return (
    <motion.button
      aria-label={`${label}: ${subject}`}
      className={cn(
        "absolute inset-y-0 right-0 cursor-pointer text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white",
        className
      )}
      onClick={onPress}
      style={{ x: slab, width: ROW_W, zIndex: index + 1 }}
      tabIndex={-1}
      type="button"
    >
      <motion.span
        className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium"
        style={{ x: iconX, opacity: iconOpacity, width: BTN_W }}
      >
        {icon}
        {label}
      </motion.span>
    </motion.button>
  );
}

function MailRow({
  mail,
  open,
  reduce,
  onOpen,
  onClose,
  onAction,
  onHaptic,
}: {
  mail: Mail;
  open: boolean;
  reduce: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAction: (action: Action) => void;
  onHaptic: (clientX: number, clientY: number, kind: HapticKind) => void;
}) {
  const x = useMotionValue(0);
  const armed = useMotionValue(0);
  const isArmed = useRef(false);
  const committing = useRef(false);
  const spring = reduce ? SETTLE_REDUCED : SETTLE;

  // Only one row open at a time: when the list closes this row, follow.
  useEffect(() => {
    if (!open && x.get() !== 0 && !committing.current) {
      animate(x, 0, { type: "spring", ...spring });
    }
  }, [open, x, spring]);

  function setArmed(next: boolean, event?: React.PointerEvent) {
    if (next === isArmed.current) return;
    isArmed.current = next;
    animate(armed, next ? 1 : 0, { type: "spring", ...SNAP });
    if (event) onHaptic(event.clientX, event.clientY, next ? "medium" : "selection");
  }

  function settle(target: number, velocity = 0) {
    animate(x, target, { type: "spring", ...spring, velocity });
    if (target === 0) onClose();
    else onOpen();
  }

  function commit(action: "delete" | "archive", velocity = 0) {
    committing.current = true;
    if (action === "archive") setArmed(false);
    animate(x, -ROW_W - 8, {
      type: "spring",
      ...spring,
      velocity: Math.min(velocity, -400),
    });
    window.setTimeout(() => onAction(action), reduce ? 60 : 160);
  }

  function closeThen(action: Action) {
    settle(0);
    onAction(action);
  }

  const swipe = useHorizontalSwipe({
    onDown: () => {
      x.stop();
    },
    onStart: () => {
      onOpen();
      return x.get();
    },
    onMove: (raw, event) => {
      const next = constrain(raw);
      x.set(next);
      setArmed(-next > COMMIT, event);
    },
    onEnd: (velocity) => {
      if (isArmed.current) {
        commit("delete", velocity);
        return;
      }
      // Velocity decides open or closed: aim where the flick was going.
      const aim = x.get() + projectMomentum(velocity, 0.99);
      if (aim < -REVEAL / 2) settle(-REVEAL, velocity);
      else if (aim > READ_W / 2) settle(READ_W, velocity);
      else settle(0, velocity);
    },
    onTap: () => {
      if (x.get() !== 0) settle(0);
    },
  });

  // Hide the action slabs at rest so none of their colour shows at the seams.
  const actionsShown = useTransform(x, (v) => (v === 0 ? 0 : 1));
  const readX = useTransform(x, (v) => Math.max(0, v) - ROW_W);
  const readIconX = useTransform(x, (v) => {
    const w = Math.max(0, v);
    return -(Math.min(w / 2, READ_W / 2) - BTN_W / 2);
  });
  const readOpacity = useTransform(x, [READ_W * 0.3, READ_W * 0.8], [0, 1]);

  const ReadIcon = mail.unread ? EnvelopeOpenIcon : EnvelopeSimpleIcon;

  return (
    <div className="relative overflow-hidden" style={{ height: ROW_H }}>
      {/* Hidden until the row is open, so Tab only reaches what's visible. */}
      <motion.div className="absolute inset-0" inert={!open} style={{ opacity: actionsShown }}>
        <motion.button
          aria-label={`${mail.unread ? "Mark as read" : "Mark as unread"}: ${mail.subject}`}
          className="absolute inset-y-0 left-0 cursor-pointer bg-blue-500 text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
          onClick={() => closeThen("read")}
          style={{ x: readX, width: ROW_W, zIndex: TRAILING + 1 }}
          tabIndex={-1}
          type="button"
        >
          <motion.span
            className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium"
            style={{ x: readIconX, opacity: readOpacity, width: BTN_W }}
          >
            <ReadIcon className="size-[18px]" weight="fill" />
            {mail.unread ? "Read" : "Unread"}
          </motion.span>
        </motion.button>
        <TrailingAction
          armed={armed}
          className="bg-rose-500"
          icon={<TrashIcon className="size-[18px]" weight="fill" />}
          index={0}
          label="Delete"
          onPress={() => commit("delete")}
          subject={mail.subject}
          x={x}
        />
        <TrailingAction
          armed={armed}
          className="bg-zinc-500"
          icon={<ArchiveIcon className="size-[18px]" weight="fill" />}
          index={1}
          label="Archive"
          onPress={() => commit("archive")}
          subject={mail.subject}
          x={x}
        />
        <TrailingAction
          armed={armed}
          className="bg-orange-500"
          icon={<FlagIcon className="size-[18px]" weight="fill" />}
          index={2}
          label={mail.flagged ? "Unflag" : "Flag"}
          onPress={() => closeThen("flag")}
          subject={mail.subject}
          x={x}
        />
      </motion.div>

      <motion.div
        className="relative z-10 flex h-full cursor-grab touch-pan-y flex-col justify-center gap-px bg-background pr-2 pl-5 active:cursor-grabbing"
        style={{ x }}
        {...swipe}
      >
        <span
          aria-label={mail.unread ? "Unread" : undefined}
          className={cn(
            "absolute top-[15px] left-[7px] size-[7px] rounded-full bg-blue-500 transition-opacity",
            mail.unread ? "opacity-100" : "opacity-0"
          )}
        />
        <div className="flex items-center gap-1.5">
          <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">
            {mail.from}
          </span>
          {mail.flagged ? (
            <FlagIcon aria-label="Flagged" className="size-3 text-orange-500" weight="fill" />
          ) : null}
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {mail.time}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Actions for ${mail.subject}`}
              className="relative -my-1 grid size-6 cursor-pointer place-items-center rounded-full text-muted-foreground outline-none after:absolute after:-inset-1 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-popup-open:bg-muted"
            >
              <DotsThreeIcon className="size-4" weight="bold" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onAction("read")}>
                <ReadIcon />
                {mail.unread ? "Mark as Read" : "Mark as Unread"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("flag")}>
                <FlagIcon />
                {mail.flagged ? "Unflag" : "Flag"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("archive")}>
                <ArchiveIcon />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction("delete")} variant="destructive">
                <TrashIcon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <span className="truncate pr-1 text-[11px]">{mail.subject}</span>
        <span className="truncate pr-1 text-[11px] text-muted-foreground">
          {mail.preview}
        </span>
        <span className="absolute right-0 bottom-0 left-5 h-px bg-border" />
      </motion.div>
    </div>
  );
}

type Removed = { mail: Mail; index: number; verb: string };

function UndoToast({
  removed,
  onUndo,
}: {
  removed: Removed | null;
  onUndo: () => void;
}) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-3 z-30 flex justify-center"
      style={{ bottom: PHONE_INSETS.ios.bottom + 6 }}
    >
      <AnimatePresence>
        {removed ? (
          <motion.div
            key={removed.mail.id}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto flex h-9 w-full items-center justify-between rounded-full bg-foreground pr-1 pl-4 text-[11px] text-background shadow-lg"
            exit={{ opacity: 0, y: 8 }}
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            {removed.verb}
            <button
              className="h-7 cursor-pointer rounded-full px-3 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-background/60"
              onClick={onUndo}
              type="button"
            >
              Undo
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function SwipeActionsDemo() {
  const reduce = useReducedMotion() ?? false;
  const screen = useRef<HTMLDivElement>(null);
  const [haptic, fireHaptic] = useHaptic(screen);
  const [mails, setMails] = useState(INBOX);
  const [openId, setOpenId] = useState<number | null>(null);
  const [removed, setRemoved] = useState<Removed | null>(null);

  useEffect(() => {
    if (!removed) return;
    const timer = window.setTimeout(() => setRemoved(null), 5000);
    return () => window.clearTimeout(timer);
  }, [removed]);

  function act(mail: Mail, action: Action) {
    setOpenId(null);
    if (action === "read" || action === "flag") {
      const key = action === "read" ? "unread" : "flagged";
      setMails((list) =>
        list.map((m) => (m.id === mail.id ? { ...m, [key]: !m[key] } : m))
      );
      return;
    }
    const index = mails.findIndex((m) => m.id === mail.id);
    if (index === -1) return;
    setMails((list) => list.filter((m) => m.id !== mail.id));
    setRemoved({ mail, index, verb: action === "delete" ? "Message deleted" : "Message archived" });
  }

  function undo() {
    if (!removed) return;
    setMails((list) => {
      const next = [...list];
      next.splice(Math.min(removed.index, next.length), 0, removed.mail);
      return next;
    });
    setRemoved(null);
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone label="Mail inbox on iPhone">
        <div ref={screen} className="absolute inset-0 flex flex-col">
          {/* 34px header: rows then break at the home indicator, so no
              text sits under it. */}
          <div
            className="shrink-0 px-4 pb-1 text-[22px] leading-[26px] font-bold tracking-tight"
            style={{ paddingTop: PHONE_INSETS.ios.top + 4 }}
          >
            Inbox
          </div>
          <div
            className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:none]"
            style={{ marginBottom: PHONE_INSETS.ios.bottom }}
            onScroll={() => openId !== null && setOpenId(null)}
          >
            <ul style={{ paddingBottom: 48 }}>
              <AnimatePresence initial={false} mode="popLayout">
                {mails.map((mail) => (
                  <motion.li
                    key={mail.id}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    layout={reduce ? false : "position"}
                    transition={{ type: "spring", ...SETTLE }}
                  >
                    <MailRow
                      mail={mail}
                      onAction={(action) => act(mail, action)}
                      onClose={() => setOpenId((id) => (id === mail.id ? null : id))}
                      onHaptic={fireHaptic}
                      onOpen={() => setOpenId(mail.id)}
                      open={openId === mail.id}
                      reduce={reduce}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            {mails.length === 0 ? (
              <div className="flex flex-col items-center gap-2 pt-16 text-[12px] text-muted-foreground">
                No messages
                <button
                  className="h-8 cursor-pointer rounded-full bg-muted px-3 text-[11px] font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  onClick={() => {
                    setMails(INBOX);
                    setRemoved(null);
                  }}
                  type="button"
                >
                  Restore inbox
                </button>
              </div>
            ) : null}
          </div>
          <UndoToast onUndo={undo} removed={removed} />
        </div>
        <HapticRing kind={haptic.kind} pulse={haptic.pulse} x={haptic.x} y={haptic.y} />
      </Phone>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        Swipe a row left a little, then all the way. Swipe right to mark it
        read, or use the ••• menu.
      </p>
    </Demo>
  );
}

/* Threshold: announce the commit point */

type ThresholdMode = "silent" | "announced";

const THRESHOLD_OPTIONS = [
  { value: "silent", label: "Fixed 56dp", icon: WRONG_ICON },
  { value: "announced", label: "Announced", icon: RIGHT_ICON },
] as const;

// Compose's SwipeToDismissBox default: dismiss after 56dp, or a 125dp/s
// fling, whatever the row's width. Scaled to the drawn phone (0.63).
const SILENT_AT = Math.round(56 * 0.63); // 35px
const SILENT_FLING = 125 * 0.63; // 79px/s
const ANNOUNCED_AT = ROW_W * 0.5; // 124px

function ThresholdRow({
  mail,
  mode,
  reduce,
  onDelete,
  onHaptic,
}: {
  mail: Mail;
  mode: ThresholdMode;
  reduce: boolean;
  onDelete: () => void;
  onHaptic: (clientX: number, clientY: number, kind: HapticKind) => void;
}) {
  const x = useMotionValue(0);
  const armed = useMotionValue(0);
  const isArmed = useRef(false);
  const [dragging, setDragging] = useState(false);
  const spring = reduce ? SETTLE_REDUCED : SETTLE;
  const announced = mode === "announced";
  const threshold = announced ? ANNOUNCED_AT : SILENT_AT;

  function setArmed(next: boolean, event: React.PointerEvent) {
    if (next === isArmed.current) return;
    isArmed.current = next;
    animate(armed, next ? 1 : 0, { type: "spring", ...SNAP });
    onHaptic(event.clientX, event.clientY, next ? "medium" : "selection");
  }

  function remove(velocity: number) {
    animate(x, -ROW_W - 8, { type: "spring", ...spring, velocity: Math.min(velocity, -400) });
    window.setTimeout(onDelete, reduce ? 60 : 160);
  }

  const swipe = useHorizontalSwipe({
    onDown: () => {
      x.stop();
    },
    onStart: () => {
      setDragging(true);
      return x.get();
    },
    onMove: (raw, event) => {
      const next = raw > 0 ? rubberBand(raw, ROW_W) : Math.max(raw, -TRAIL_MAX);
      x.set(next);
      if (announced) setArmed(-next > threshold, event);
    },
    onEnd: (velocity) => {
      setDragging(false);
      const past = -x.get() > threshold;
      // Silent: distance or any small fling, so a peek can delete by surprise.
      // Announced: only a release past the point you were told about.
      const commit = announced ? past : past || velocity < -SILENT_FLING;
      if (isArmed.current) {
        isArmed.current = false;
        animate(armed, 0, { type: "spring", ...SNAP });
      }
      if (commit) remove(velocity);
      else animate(x, 0, { type: "spring", ...spring, velocity });
    },
  });

  // Announced: before the threshold the icon waits at the edge and grows
  // with the drag. At the threshold it jumps to the row's edge and rides
  // with the finger; back out and it returns.
  const iconX = useTransform(() => {
    const edge = -16; // resting 16px in from the right edge
    const follow = x.get() + 34; // 12px right of the row's trailing edge
    const a = announced ? armed.get() : 0;
    return edge + (follow - edge) * a;
  });
  const iconScale = useTransform(() => {
    if (!announced) return 1;
    const p = Math.min(1, -x.get() / threshold);
    return 0.6 + 0.4 * p + 0.15 * armed.get();
  });
  // Nothing behind the row at rest, so no colour shows at the seams when
  // the phone is scaled up.
  const fill = useTransform(() => (announced ? armed.get() : x.get() < 0 ? 1 : 0));

  return (
    <div className="relative overflow-hidden" style={{ height: ROW_H }}>
      <div aria-hidden="true" className="absolute inset-0 bg-muted">
        <motion.div className="absolute inset-0 bg-rose-500" style={{ opacity: fill }} />
        <motion.span
          className="absolute top-1/2 right-0 -mt-[11px] grid size-[22px] place-items-center"
          style={{ x: iconX, scale: iconScale }}
        >
          <motion.span className="absolute inset-0 grid place-items-center text-muted-foreground">
            <TrashIcon className="size-[18px]" weight="fill" />
          </motion.span>
          <motion.span className="absolute inset-0 grid place-items-center text-white" style={{ opacity: fill }}>
            <TrashIcon className="size-[18px]" weight="fill" />
          </motion.span>
        </motion.span>
        <span
          className={cn(
            "absolute inset-y-1 border-l border-dashed border-sky-500/80 transition-opacity duration-150",
            dragging ? "opacity-100" : "opacity-0"
          )}
          style={{ left: ROW_W - threshold }}
        />
      </div>
      <motion.div
        className="relative z-10 flex h-full cursor-grab touch-pan-y items-center gap-2 bg-background pr-2 pl-4 active:cursor-grabbing"
        style={{ x }}
        {...swipe}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-px">
          <span className="truncate text-[12px] font-semibold">{mail.from}</span>
          <span className="truncate text-[11px] text-muted-foreground">{mail.subject}</span>
        </div>
        <button
          aria-label={`Delete ${mail.subject}`}
          className="relative grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground outline-none after:absolute after:-inset-px hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={() => remove(0)}
          type="button"
        >
          <TrashIcon className="size-4" />
        </button>
        <span className="absolute right-0 bottom-0 left-4 h-px bg-border" />
      </motion.div>
    </div>
  );
}

export function SwipeThresholdDemo() {
  const reduce = useReducedMotion() ?? false;
  const screen = useRef<HTMLDivElement>(null);
  const [haptic, fireHaptic] = useHaptic(screen);
  const [mode, setMode] = useState<ThresholdMode>("silent");
  const [mails, setMails] = useState(INBOX.slice(0, 5));
  const [removed, setRemoved] = useState<Removed | null>(null);

  useEffect(() => {
    if (!removed) return;
    const timer = window.setTimeout(() => setRemoved(null), 5000);
    return () => window.clearTimeout(timer);
  }, [removed]);

  function remove(mail: Mail) {
    const index = mails.findIndex((m) => m.id === mail.id);
    setMails((list) => list.filter((m) => m.id !== mail.id));
    setRemoved({ mail, index, verb: "Message deleted" });
  }

  function undo() {
    if (!removed) return;
    setMails((list) => {
      const next = [...list];
      next.splice(Math.min(removed.index, next.length), 0, removed.mail);
      return next;
    });
    setRemoved(null);
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone height={400} label="Swipe to delete on iPhone">
        <div ref={screen} className="absolute inset-0 flex flex-col">
          <div
            className="shrink-0 px-4 pb-1.5 text-[22px] font-bold tracking-tight"
            style={{ paddingTop: PHONE_INSETS.ios.top + 8 }}
          >
            Inbox
          </div>
          <ul className="min-h-0 flex-1 overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout">
              {mails.map((mail) => (
                <motion.li
                  key={`${mode}-${mail.id}`}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  layout={reduce ? false : "position"}
                  transition={{ type: "spring", ...SETTLE }}
                >
                  <ThresholdRow
                    mail={mail}
                    mode={mode}
                    onDelete={() => remove(mail)}
                    onHaptic={fireHaptic}
                    reduce={reduce}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
            {mails.length === 0 ? (
              <li className="flex flex-col items-center gap-2 pt-12 text-[12px] text-muted-foreground">
                No messages
                <button
                  className="h-8 cursor-pointer rounded-full bg-muted px-3 text-[11px] font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  onClick={() => {
                    setMails(INBOX.slice(0, 5));
                    setRemoved(null);
                  }}
                  type="button"
                >
                  Restore inbox
                </button>
              </li>
            ) : null}
          </ul>
          <UndoToast onUndo={undo} removed={removed} />
        </div>
        <HapticRing kind={haptic.kind} pulse={haptic.pulse} x={haptic.x} y={haptic.y} />
      </Phone>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        {mode === "silent"
          ? "Drag a row a little way left and let go. The dashed line is where it commits."
          : "Drag a row left past half, then back out before you let go."}
      </p>
      <SegmentedControl
        ariaLabel="Commit threshold"
        onChange={(value) => {
          setMode(value);
          setMails(INBOX.slice(0, 5));
          setRemoved(null);
        }}
        options={THRESHOLD_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}
