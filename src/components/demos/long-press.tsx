"use client";

import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  DotsThreeVerticalIcon,
  FolderPlusIcon,
  HeartIcon,
  PushPinIcon,
  ShareFatIcon,
  ShareNetworkIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import {
  HapticRing,
  Phone,
  PHONE_INSETS,
  usePhoneScale,
  vibrate,
  type Platform,
} from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import { springFromFeel } from "@/lib/spring";
import { cn } from "@/lib/utils";

// iOS defaults: 0.5 s and 10 pt (SwiftUI onLongPressGesture). Android's
// default is 400 ms and the user can raise it, so real code reads the setting.
const HOLD_MS = 500;
const HOLD_SLOP = 10;
const BACK = springFromFeel(0.3, 0);
const LIFT = springFromFeel(0.35, 0.25);
const POP = springFromFeel(0.3, 0.1);

type Point = { x: number; y: number };

/**
 * Press-and-hold on one element. While the finger is down the element shrinks
 * over the hold (when `feedback` is on); moving past the slop or lifting early
 * cancels; at HOLD_MS `onFire` gets the finger position.
 */
function useHold({
  feedback,
  onFire,
}: {
  feedback: boolean;
  onFire: (point: Point) => void;
}) {
  const reduce = useReducedMotion();
  // Screen px per phone px; the 10pt slop is in the phone's units.
  const k = usePhoneScale();
  const scale = useMotionValue(1);
  const s = useRef({ timer: 0, id: -1, x: 0, y: 0, active: false });
  const shrink = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    const state = s.current;
    return () => window.clearTimeout(state.timer);
  }, []);

  function cancel() {
    const state = s.current;
    if (!state.active) return;
    state.active = false;
    window.clearTimeout(state.timer);
    shrink.current?.stop();
    animate(scale, 1, { type: "spring", ...BACK });
  }

  const bind = {
    onPointerDown(event: React.PointerEvent) {
      if (event.button !== 0) return;
      const state = s.current;
      window.clearTimeout(state.timer);
      Object.assign(state, { id: event.pointerId, x: event.clientX, y: event.clientY, active: true });
      if (feedback && !reduce) {
        // The shrink is the progress bar: it lands at 0.97 as the menu opens.
        shrink.current = animate(scale, 0.97, { duration: HOLD_MS / 1000, ease: [0.3, 0, 0.4, 1] });
      }
      const point = { x: event.clientX, y: event.clientY };
      state.timer = window.setTimeout(() => {
        state.active = false;
        // Stop the shrink so its last frame can't land after onFire resets it.
        shrink.current?.stop();
        onFire(point);
      }, HOLD_MS);
    },
    onPointerMove(event: React.PointerEvent) {
      const state = s.current;
      if (!state.active || event.pointerId !== state.id) return;
      if (Math.hypot(event.clientX - state.x, event.clientY - state.y) / k > HOLD_SLOP) cancel();
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
  };

  /** True while a finger is down and the hold hasn't fired or cancelled. */
  const holding = () => s.current.active;

  return { bind, scale, holding };
}

/** Screen px per layout px inside a Phone: 1 on desktop, about 1.5 on a phone. */
function scaleOf(el: HTMLElement) {
  return el.getBoundingClientRect().width / el.offsetWidth || 1;
}

/** A pointer position in the phone screen's own (unscaled) coordinates. */
function relative(el: HTMLElement | null, point: Point) {
  if (!el) return point;
  const r = el.getBoundingClientRect();
  const k = scaleOf(el);
  return { x: (point.x - r.left) / k, y: (point.y - r.top) / k };
}

/* Long press: show the hold, then the menu ------------------------------- */

type Note = { id: number; title: string; body: string; pinned: boolean };

const NOTES: Note[] = [
  { id: 1, title: "Groceries", body: "Oat milk, lemons, rye bread", pinned: false },
  { id: 2, title: "Trip to Lisbon", body: "Book the tram tour for Friday", pinned: false },
  { id: 3, title: "Gift ideas", body: "Film camera, a good pen", pinned: false },
  { id: 4, title: "Reading list", body: "The Design of Everyday Things", pinned: false },
  { id: 5, title: "Standup", body: "Ship the menu, then the sheet", pinned: false },
];

type HoldMode = "abrupt" | "shown";
const HOLD_OPTIONS = [
  { value: "abrupt", label: "Abrupt", icon: WRONG_ICON },
  { value: "shown", label: "Shown", icon: RIGHT_ICON },
] as const;

const MENU_H = 150;

function NoteCard({ note, className }: { note: Note; className?: string }) {
  return (
    <div className={cn("flex h-14 flex-col justify-center rounded-xl bg-card px-3.5 shadow-(--custom-shadow)", className)}>
      <span className="flex items-center gap-1.5 text-[13px] leading-tight font-semibold">
        {note.pinned ? (
          <PushPinIcon aria-label="Pinned" className="size-3 text-amber-500" weight="fill" />
        ) : null}
        {note.title}
      </span>
      <span className="truncate text-[11px] leading-snug text-muted-foreground">
        {note.body}
      </span>
    </div>
  );
}

function NoteRow({
  note,
  feedback,
  hidden,
  onOpen,
}: {
  note: Note;
  feedback: boolean;
  hidden: boolean;
  onOpen: (row: HTMLElement, point: Point | null) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const { bind, scale, holding } = useHold({
    feedback,
    onFire: (point) => {
      scale.set(1);
      if (ref.current) onOpen(ref.current, point);
    },
  });

  return (
    <motion.button
      ref={ref}
      aria-haspopup="menu"
      aria-label={`${note.title}. Touch and hold, or open the context menu, for actions.`}
      className={cn(
        "block w-full cursor-pointer touch-manipulation rounded-xl text-left outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-2 focus-visible:ring-ring/50",
        hidden && "opacity-0"
      )}
      onContextMenu={(event) => {
        // Right click and the keyboard's menu key; Android Chrome also sends
        // this on a long press, so it shares the same path.
        event.preventDefault();
        if (holding()) return; // a touch hold in progress fires on its own
        if (ref.current) onOpen(ref.current, null);
      }}
      style={{ scale }}
      type="button"
      {...bind}
    >
      <NoteCard note={note} />
    </motion.button>
  );
}

type Open = { id: number; top: number; height: number; below: boolean; point: Point | null };

export function LongPressDemo() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<HoldMode>("shown");
  const [notes, setNotes] = useState(NOTES);
  const [open, setOpen] = useState<Open | null>(null);
  const [haptic, setHaptic] = useState({ pulse: 0, x: 0, y: 0 });
  const screenRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const openedAt = useRef(0);
  const shown = mode === "shown";

  useEffect(() => {
    if (open) menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus({ preventScroll: true });
  }, [open]);

  function openMenu(id: number, row: HTMLElement, point: Point | null) {
    if (openRef.current) return;
    const screen = screenRef.current;
    if (!screen) return;
    openRef.current = true;
    const s = screen.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    const top = (r.top - s.top) / scaleOf(screen);
    const height = row.offsetHeight;
    const below = top + height + 8 + MENU_H < screen.offsetHeight - PHONE_INSETS.ios.bottom;
    openedAt.current = performance.now();
    setOpen({ id, top, height, below, point });
    if (point && shown) {
      const p = relative(screen, point);
      setHaptic((h) => ({ pulse: h.pulse + 1, ...p }));
      vibrate("medium");
    }
  }

  function close() {
    openRef.current = false;
    setOpen(null);
  }

  function act(action: "pin" | "copy" | "share" | "delete") {
    // The click that ends a touch hold can land on an item under the finger.
    if (!open || performance.now() - openedAt.current < 300) return;
    const id = open.id;
    close();
    if (action === "pin") setNotes((list) => list.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
    if (action === "delete") setNotes((list) => list.filter((n) => n.id !== id));
  }

  const note = open ? notes.find((n) => n.id === open.id) : undefined;

  const items = note
    ? ([
        ["pin", note.pinned ? "Unpin" : "Pin", PushPinIcon],
        ["copy", "Copy", CopyIcon],
        ["share", "Share", ShareFatIcon],
        ["delete", "Delete", TrashIcon],
      ] as const)
    : [];

  const menuList = (
    <div
      ref={menuRef}
      aria-label={note ? `Actions for ${note.title}` : undefined}
      className="w-48 overflow-hidden rounded-xl bg-card p-1 shadow-(--custom-shadow) ring-1 ring-border"
      role="menu"
    >
      {items.map(([key, label, Icon]) => (
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
    </div>
  );

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone label="Notes list on iPhone">
        <div
          ref={screenRef}
          className="absolute inset-0"
          onKeyDown={(event) => {
            if (event.key === "Escape" && open) close();
          }}
        >
          <div
            className="px-4 pb-3 text-lg font-semibold"
            style={{ paddingTop: PHONE_INSETS.ios.top + 6 }}
          >
            Notes
          </div>
          <div className="flex flex-col gap-2 px-3">
            {notes.map((n) => (
              <NoteRow
                key={n.id}
                feedback={shown}
                hidden={shown && open?.id === n.id}
                note={n}
                onOpen={(row, point) => openMenu(n.id, row, point)}
              />
            ))}
            {notes.length < NOTES.length ? (
              <button
                className="mx-auto mt-2 cursor-pointer rounded-full bg-muted px-3 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                onClick={() => setNotes(NOTES)}
                type="button"
              >
                Restore notes
              </button>
            ) : null}
          </div>

          {/* Wrong: nothing during the hold, then a menu in the middle. */}
          {open && note && !shown ? (
            <div className="absolute inset-0 z-30">
              <button
                aria-label="Close menu"
                className="absolute inset-0 cursor-default outline-none"
                // Close on a new press, not on click: the click that ends the hold
                  // that opened the menu lands here on touch and would close it.
                  onPointerDown={close}
                tabIndex={-1}
                type="button"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {menuList}
              </div>
            </div>
          ) : null}

          {/* Right: dim and blur, lift the row, anchor the menu to it. */}
          <AnimatePresence>
            {open && note && shown ? (
              <motion.div
                key="lift"
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-30"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  aria-label="Close menu"
                  className="absolute inset-0 cursor-default bg-black/20 outline-none backdrop-blur-[3px] dark:bg-black/45"
                  // Close on a new press, not on click: the click that ends the hold
                  // that opened the menu lands here on touch and would close it.
                  onPointerDown={close}
                  tabIndex={-1}
                  type="button"
                />
                <motion.div
                  animate={{ scale: reduce ? 1 : 1.03 }}
                  className="pointer-events-none absolute inset-x-3"
                  initial={{ scale: reduce ? 1 : 0.97 }}
                  style={{ top: open.top }}
                  transition={{ type: "spring", ...LIFT }}
                >
                  <NoteCard className="shadow-lg ring-1 ring-border" note={note} />
                </motion.div>
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute left-3"
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
                  style={{
                    top: open.below ? open.top + open.height + 8 : open.top - 8,
                    translateY: open.below ? 0 : "-100%",
                    transformOrigin: open.below ? "top left" : "bottom left",
                  }}
                  transition={{ type: "spring", ...POP }}
                >
                  {menuList}
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <HapticRing kind="medium" pulse={haptic.pulse} x={haptic.x} y={haptic.y} />
        </div>
      </Phone>

      <SegmentedControl
        ariaLabel="Long press feedback"
        onChange={(next) => {
          setMode(next);
          close();
        }}
        options={HOLD_OPTIONS}
        value={mode}
      />
      <p className="-mt-2 text-center text-xs text-muted-foreground">
        Press and hold a note. Move before the menu opens to cancel.
      </p>
    </Demo>
  );
}

/* Context menu on iPhone, selection mode on Android ---------------------- */

const PHOTOS = Array.from({ length: 12 }, (_, i) => i);

function Tile({ index }: { index: number }) {
  // Neutral stand-in photos: a sun and two ridges, varied per tile.
  const sun = 20 + ((index * 37) % 60);
  const ridge = 50 + ((index * 23) % 30);
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 size-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
    >
      <rect className="fill-background" height="100" width="100" />
      <rect className={index % 3 === 1 ? "fill-foreground/[0.12]" : "fill-muted"} height="100" width="100" />
      <circle className="fill-foreground/10" cx={sun} cy="30" r="10" />
      <path className="fill-foreground/15" d={`M0 80 L30 ${ridge} L55 72 L80 ${ridge - 10} L100 70 L100 100 L0 100 Z`} />
      <path className="fill-foreground/25" d="M0 92 L40 78 L70 88 L100 80 L100 100 L0 100 Z" />
    </svg>
  );
}

function PhotoTile({
  index,
  platform,
  selected,
  selecting,
  lifted,
  onHold,
  onTap,
}: {
  index: number;
  platform: Platform;
  selected: boolean;
  selecting: boolean;
  lifted: boolean;
  onHold: (el: HTMLElement, point: Point | null) => void;
  onTap: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const fired = useRef(false);
  const { bind, scale, holding } = useHold({
    feedback: true,
    onFire: (point) => {
      fired.current = true;
      if (platform === "ios") scale.set(1);
      else animate(scale, 1, { type: "spring", ...BACK });
      if (ref.current) onHold(ref.current, point);
    },
  });

  return (
    <motion.button
      ref={ref}
      aria-label={`Photo ${index + 1}${selecting ? (selected ? ", selected" : ", not selected") : ""}`}
      aria-pressed={selecting ? selected : undefined}
      className={cn(
        "relative aspect-square cursor-pointer touch-manipulation overflow-hidden outline-none select-none [-webkit-touch-callout:none] focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring/50",
        platform === "android" ? "rounded-md" : "",
        lifted && "opacity-0"
      )}
      onClick={() => {
        // The click that follows a finished hold is part of the hold.
        if (fired.current) {
          fired.current = false;
          return;
        }
        onTap();
      }}
      onContextMenu={(event) => {
        // Right click or the menu key. A touch hold (Android Chrome sends
        // contextmenu too) is left to the timer so it isn't handled twice.
        event.preventDefault();
        if (holding() || fired.current) return;
        if (ref.current) onHold(ref.current, null);
      }}
      onPointerDown={(event) => {
        fired.current = false;
        bind.onPointerDown(event);
      }}
      onPointerCancel={bind.onPointerCancel}
      onPointerLeave={bind.onPointerLeave}
      onPointerMove={bind.onPointerMove}
      onPointerUp={bind.onPointerUp}
      style={{ scale }}
      type="button"
    >
      <motion.span
        animate={{ scale: selected ? 0.82 : 1, borderRadius: selected ? 10 : platform === "android" ? 6 : 0 }}
        className="absolute inset-0 overflow-hidden"
        transition={{ type: "spring", ...BACK }}
      >
        <Tile index={index} />
      </motion.span>
      {selecting ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1 left-1 grid size-4 place-items-center rounded-full",
            selected
              ? "bg-sky-600 text-white"
              : "border-[1.5px] border-white/90 bg-black/10"
          )}
        >
          {selected ? <CheckIcon className="size-2.5" weight="bold" /> : null}
        </span>
      ) : null}
    </motion.button>
  );
}

type Shape = "ios" | "android";
const SHAPE_OPTIONS = [
  { value: "ios", label: "iPhone" },
  { value: "android", label: "Android" },
] as const;

export function ContextMenuDemo() {
  const reduce = useReducedMotion();
  const [platform, setPlatform] = useState<Shape>("ios");
  const [preview, setPreview] = useState<{ index: number; tileTop: number } | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [haptic, setHaptic] = useState({ pulse: 0, x: 0, y: 0 });
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const screenRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const previewAt = useRef(0);
  const selecting = selected.size > 0;
  const insets = PHONE_INSETS[platform];

  useEffect(() => {
    if (preview) menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus({ preventScroll: true });
  }, [preview]);

  function pulse(point: Point | null) {
    if (!point) return;
    const p = relative(screenRef.current, point);
    setHaptic((h) => ({ pulse: h.pulse + 1, ...p }));
    vibrate("medium");
  }

  function hold(index: number, el: HTMLElement, point: Point | null) {
    pulse(point);
    if (platform === "ios") {
      const screen = screenRef.current;
      const r = el.getBoundingClientRect();
      const tileTop = screen
        ? (r.top - screen.getBoundingClientRect().top) / scaleOf(screen)
        : 100;
      previewAt.current = performance.now();
      setPreview({ index, tileTop });
    } else {
      setSelected((set) => new Set(set).add(index));
    }
  }

  function tap(index: number) {
    if (platform === "android" && selecting) {
      setSelected((set) => {
        const next = new Set(set);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    }
  }

  function switchPlatform(next: Shape) {
    setPlatform(next);
    setPreview(null);
    setSelected(new Set());
  }

  const fav = preview ? favorites.has(preview.index) : false;
  const groups = preview
    ? ([
        [
          ["Copy", CopyIcon],
          ["Share", ShareFatIcon],
        ],
        [
          [fav ? "Unfavorite" : "Favorite", HeartIcon],
          ["Add to Album", FolderPlusIcon],
        ],
        [["Delete", TrashIcon]],
      ] as const)
    : [];

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone label={platform === "ios" ? "Photos on iPhone" : "Photos on Android"} platform={platform}>
        <div
          ref={screenRef}
          className="absolute inset-0"
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            setPreview(null);
            setSelected(new Set());
          }}
        >
          {/* Top bar: a title, or on Android in selection mode the contextual bar. */}
          <div className="relative" style={{ paddingTop: insets.top }}>
            {platform === "android" && selecting ? (
              <div className="flex h-11 items-center gap-1 bg-muted px-1.5 dark:bg-muted/60">
                <button
                  aria-label="Exit selection"
                  className="grid size-9 cursor-pointer place-items-center rounded-full outline-none hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring/50"
                  onClick={() => setSelected(new Set())}
                  type="button"
                >
                  <XIcon aria-hidden="true" className="size-[18px]" />
                </button>
                <span aria-live="polite" className="flex-1 text-[15px] tabular-nums">
                  {selected.size} selected
                </span>
                {[
                  ["Share", ShareNetworkIcon],
                  ["Delete", TrashIcon],
                  ["More options", DotsThreeVerticalIcon],
                ].map(([label, Icon]) => {
                  const I = Icon as typeof XIcon;
                  return (
                    <button
                      key={label as string}
                      aria-label={label as string}
                      className="grid size-9 cursor-pointer place-items-center rounded-full outline-none hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring/50"
                      onClick={() => setSelected(new Set())}
                      type="button"
                    >
                      <I aria-hidden="true" className="size-[18px]" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                className={cn(
                  "flex h-11 items-center px-4",
                  platform === "ios" ? "text-lg font-semibold" : "gap-3 text-[17px]"
                )}
              >
                {platform === "android" ? <ArrowLeftIcon aria-hidden="true" className="size-[18px]" /> : null}
                Photos
              </div>
            )}
          </div>

          <div className={cn("grid grid-cols-3", platform === "ios" ? "gap-0.5" : "gap-1 px-1")}>
            {PHOTOS.map((index) => (
              <PhotoTile
                key={index}
                index={index}
                lifted={preview?.index === index}
                onHold={(el, point) => hold(index, el, point)}
                onTap={() => tap(index)}
                platform={platform}
                selected={selected.has(index)}
                selecting={platform === "android" && selecting}
              />
            ))}
          </div>

          <AnimatePresence>
            {preview ? (
              <motion.div
                key="preview"
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-30 flex flex-col items-center gap-2 px-6"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                style={{ paddingTop: insets.top + 12 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  aria-label="Close menu"
                  className="absolute inset-0 cursor-default bg-black/20 outline-none backdrop-blur-md dark:bg-black/45"
                  // Close on a new press, not on click: the click that ends the hold
                  // that opened the menu lands here on touch and would close it.
                  onPointerDown={() => setPreview(null)}
                  tabIndex={-1}
                  type="button"
                />
                <motion.div
                  animate={{ y: 0, scale: 1 }}
                  className="pointer-events-none relative w-full"
                  initial={{ y: reduce ? 0 : preview.tileTop - insets.top - 40, scale: reduce ? 1 : 0.45 }}
                  transition={{ type: "spring", ...LIFT }}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
                    <Tile index={preview.index} />
                  </div>
                </motion.div>
                <motion.div
                  ref={menuRef}
                  animate={{ opacity: 1, scale: 1 }}
                  aria-label={`Actions for photo ${preview.index + 1}`}
                  className="relative w-48 self-start overflow-hidden rounded-xl bg-card shadow-(--custom-shadow) ring-1 ring-border"
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
                  role="menu"
                  style={{ transformOrigin: "top left" }}
                  transition={{ type: "spring", ...POP }}
                >
                  {groups.map((group, g) => (
                    <div key={g} className={cn(g > 0 && "border-t-[5px] border-border/60")}>
                      {group.map(([label, Icon]) => (
                        <button
                          key={label}
                          className={cn(
                            "flex h-9 w-full cursor-pointer items-center justify-between px-3 text-left text-[13px] outline-none hover:bg-muted focus-visible:bg-muted",
                            label === "Delete" && "text-rose-600 dark:text-rose-400",
                            "[&:not(:first-child)]:border-t [&:not(:first-child)]:border-border/60"
                          )}
                          onClick={() => {
                            // Ignore the click that ends the hold itself.
                            if (performance.now() - previewAt.current < 300) return;
                            if (label === "Favorite" || label === "Unfavorite") {
                              setFavorites((set) => {
                                const next = new Set(set);
                                if (next.has(preview.index)) next.delete(preview.index);
                                else next.add(preview.index);
                                return next;
                              });
                            }
                            setPreview(null);
                          }}
                          role="menuitem"
                          type="button"
                        >
                          {label}
                          <Icon aria-hidden="true" className="size-4" weight={label === "Unfavorite" ? "fill" : "regular"} />
                        </button>
                      ))}
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <HapticRing kind="medium" pulse={haptic.pulse} x={haptic.x} y={haptic.y} />
        </div>
      </Phone>

      <p aria-live="polite" className="h-4 text-center text-xs text-muted-foreground">
        {platform === "ios"
          ? "Context menu: a preview, about three groups, Delete last"
          : selecting
            ? "Selection mode: tap more photos, then act on all of them"
            : "Long press enters selection mode"}
      </p>
      <SegmentedControl
        ariaLabel="Platform"
        onChange={switchPlatform}
        options={SHAPE_OPTIONS}
        value={platform}
      />
      <p className="-mt-2 text-center text-xs text-muted-foreground">
        Press and hold a photo on each platform.
      </p>
    </Demo>
  );
}
