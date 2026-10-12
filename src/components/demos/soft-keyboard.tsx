"use client";

import { ArrowFatUpIcon, ArrowUpIcon, BackspaceIcon } from "@phosphor-icons/react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Phone, PHONE_INSETS } from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import { springFromFeel } from "@/lib/spring";
import { cn } from "@/lib/utils";

const SCREEN_H = 440;
const KB_H = 176;
const INSET = PHONE_INSETS.ios.bottom;
const HEADER_H = PHONE_INSETS.ios.top + 42;
const COMPOSER_H = 44;
// The demo's stand-in for the system keyboard curve. In an app, never copy a
// curve: let the platform move your layout with the keyboard (see Usage).
const KB_SPRING = springFromFeel(0.4, 0);

/* ------------------------------------------------------------------ */
/* Keyboard                                                            */
/* ------------------------------------------------------------------ */

const KEY =
  "flex h-[26px] items-center justify-center rounded-[5px] bg-card text-[12px] text-foreground shadow-[0_1px_0_rgb(0_0_0/0.18)] active:bg-neutral-300 dark:bg-neutral-600 dark:shadow-[0_1px_0_rgb(0_0_0/0.5)] dark:active:bg-neutral-500";
const KEY_DARK =
  "flex h-[26px] items-center justify-center rounded-[5px] bg-neutral-300 text-[11px] text-foreground shadow-[0_1px_0_rgb(0_0_0/0.18)] dark:bg-neutral-700 dark:shadow-[0_1px_0_rgb(0_0_0/0.5)]";
const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

function Keyboard({
  y,
  onKey,
  onDone,
}: {
  y: MotionValue<number>;
  onKey: (key: string) => void;
  onDone?: () => void;
}) {
  // Keys are pointer-only; the Send button and the field are the accessible path.
  function onClick(event: React.MouseEvent) {
    const key = (event.target as HTMLElement).closest<HTMLElement>("[data-key]")?.dataset.key;
    if (key) onKey(key);
  }

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-[9px] bg-neutral-200 px-1 pt-1 dark:bg-neutral-800"
      onClick={onClick}
      style={{ height: KB_H, y }}
    >
      <div aria-hidden="true" className="flex h-6 items-center justify-center gap-6 text-[11px] text-foreground">
        <span>I</span>
        <span>Sounds good</span>
        <span>On my way</span>
      </div>
      {onDone ? (
        <button
          aria-label="Done, hide keyboard"
          className="absolute top-1.5 right-1.5 cursor-pointer rounded px-0.5 text-[8px] font-semibold text-sky-700 outline-none after:absolute after:-inset-x-2 after:-top-1.5 after:-bottom-4 focus-visible:ring-2 focus-visible:ring-ring/50 dark:text-sky-400"
          onClick={(event) => {
            event.stopPropagation();
            onDone();
          }}
          type="button"
        >
          Done
        </button>
      ) : null}
      <div aria-hidden="true" className="flex flex-col gap-[9px] px-0.5">
        <div className="flex gap-[5px]">
          {ROWS[0].split("").map((k) => (
            <span key={k} className={cn(KEY, "flex-1 cursor-pointer")} data-key={k}>
              {k}
            </span>
          ))}
        </div>
        <div className="flex gap-[5px] px-3">
          {ROWS[1].split("").map((k) => (
            <span key={k} className={cn(KEY, "flex-1 cursor-pointer")} data-key={k}>
              {k}
            </span>
          ))}
        </div>
        <div className="flex gap-[5px]">
          <span className={cn(KEY_DARK, "w-8 shrink-0")}>
            <ArrowFatUpIcon className="size-3.5" />
          </span>
          <div className="flex flex-1 gap-[5px] px-1">
            {ROWS[2].split("").map((k) => (
              <span key={k} className={cn(KEY, "flex-1 cursor-pointer")} data-key={k}>
                {k}
              </span>
            ))}
          </div>
          <span className={cn(KEY_DARK, "w-8 shrink-0 cursor-pointer")} data-key="back">
            <BackspaceIcon className="pointer-events-none size-3.5" />
          </span>
        </div>
        <div className="flex gap-[5px]">
          <span className={cn(KEY_DARK, "w-11 shrink-0")}>123</span>
          <span className={cn(KEY, "flex-1 cursor-pointer text-[11px]")} data-key=" ">
            space
          </span>
          <span className={cn(KEY_DARK, "w-14 shrink-0 cursor-pointer")} data-key="return">
            return
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Chat screen shared by both demos                                    */
/* ------------------------------------------------------------------ */

type Message = { id: number; me: boolean; text: string };

const START: Message[] = [
  { id: 1, me: false, text: "Are we still on for Saturday?" },
  { id: 2, me: true, text: "Yes! Trailhead at 9?" },
  { id: 3, me: false, text: "Perfect. I'll bring coffee." },
  { id: 4, me: true, text: "You're the best" },
  { id: 5, me: false, text: "Weather says clear skies all morning" },
  { id: 6, me: false, text: "What's your parking plan?" },
];

function ChatScreen({
  initialMessages = START,
  kb,
  lift,
  open,
  onOpen,
  onListTap,
  listHandlers,
  onDone,
  label,
}: {
  kb: MotionValue<number>;
  lift: MotionValue<number>;
  open: boolean;
  onOpen: () => void;
  onListTap?: () => void;
  listHandlers?: React.HTMLAttributes<HTMLDivElement>;
  onDone?: () => void;
  label: string;
  initialMessages?: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const keyboardY = useTransform(kb, (v) => KB_H - v);
  const columnY = useTransform(lift, (v) => -v);

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m.slice(-7), { id: Date.now(), me: true, text }]);
    setDraft("");
  }

  function onKey(key: string) {
    if (key === "back") setDraft((d) => d.slice(0, -1));
    else if (key === "return") send();
    else setDraft((d) => (d.length < 40 ? d + key : d));
  }

  return (
    <Phone height={SCREEN_H} label={label} platform="ios">
      <div
        className="absolute inset-x-0 top-0 z-20 flex flex-col items-center justify-end gap-0.5 border-b border-border bg-background/95 pb-1.5"
        style={{ height: HEADER_H }}
      >
        <span className="grid size-6 place-items-center rounded-full bg-muted text-[10px] font-semibold">
          SK
        </span>
        <span className="text-[10px] font-medium">Sam</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: HEADER_H }}>
        <motion.div className="absolute inset-0 flex flex-col justify-end" style={{ y: columnY }}>
          <div
            className={cn(
              "flex flex-1 flex-col justify-end gap-1.5 px-3 pb-2",
              listHandlers ? "touch-none" : ""
            )}
            onClick={onListTap}
            {...listHandlers}
          >
            {messages.map((m) => (
              <span
                key={m.id}
                className={cn(
                  "max-w-[75%] rounded-2xl px-2.5 py-1.5 text-[11px] leading-snug",
                  m.me
                    ? "self-end bg-sky-700 text-white"
                    : "self-start bg-muted text-foreground"
                )}
              >
                {m.text}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 px-2.5" style={{ height: COMPOSER_H }}>
            <button
              aria-label={draft ? `Message field: ${draft}` : "Message field"}
              aria-pressed={open}
              className={cn(
                "relative flex h-7 min-w-0 flex-1 cursor-text items-center rounded-full after:absolute after:inset-x-0 after:-inset-y-2 bg-background px-3 text-left text-[11px] shadow-[inset_0_0_0_1px_var(--color-border)] outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                draft ? "text-foreground" : "text-muted-foreground"
              )}
              onClick={onOpen}
              type="button"
            >
              <span className="truncate">{draft || (open ? "" : "Message")}</span>
              {open ? <span className="ml-px h-3 w-0.5 shrink-0 rounded-full bg-sky-500" /> : null}
            </button>
            <button
              aria-label="Send"
              className={cn(
                "relative grid size-7 shrink-0 cursor-pointer place-items-center rounded-full outline-none after:absolute after:-inset-y-2 after:-left-1.5 after:-right-2.5 focus-visible:ring-2 focus-visible:ring-ring/50",
                draft ? "bg-sky-700 text-white" : "bg-muted text-muted-foreground"
              )}
              onClick={send}
              type="button"
            >
              <ArrowUpIcon className="size-3.5" weight="bold" />
            </button>
          </div>
          <div style={{ height: INSET }} />
        </motion.div>
      </div>

      <Keyboard onDone={onDone} onKey={onKey} y={keyboardY} />
    </Phone>
  );
}

function useKeyboard(initialOpen = false) {
  const reduced = useReducedMotion();
  const kb = useMotionValue(initialOpen ? KB_H : 0);
  const [open, setOpen] = useState(initialOpen);
  const anim = useRef<AnimationPlaybackControls | null>(null);

  function moveTo(target: number, velocity = 0) {
    anim.current?.stop();
    setOpen(target > 0);
    anim.current = reduced
      ? animate(kb, target, { duration: 0.15, ease: "easeOut" })
      : animate(kb, target, { type: "spring", ...KB_SPRING, velocity });
    return anim.current;
  }

  return { kb, open, moveTo, stop: () => anim.current?.stop() };
}

/* ------------------------------------------------------------------ */
/* KeyboardAvoidDemo                                                   */
/* ------------------------------------------------------------------ */

type AvoidMode = "covered" | "jumps" | "follows";

const AVOID_OPTIONS = [
  { value: "covered", label: "Covered", icon: WRONG_ICON },
  { value: "jumps", label: "Jumps", icon: WRONG_ICON },
  { value: "follows", label: "Follows", icon: RIGHT_ICON },
] as const;

export function KeyboardAvoidDemo() {
  const [mode, setMode] = useState<AvoidMode>("covered");
  const { kb, open, moveTo } = useKeyboard();
  const lift = useMotionValue(0);
  const modeRef = useRef(mode);
  const token = useRef(0);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Follows: the composer reads the keyboard's own position every frame.
  // The keyboard covers the home-indicator inset, so lift by the rest.
  useEffect(
    () =>
      kb.on("change", (v) => {
        if (modeRef.current === "follows") lift.set(Math.max(0, v - INSET));
      }),
    [kb, lift]
  );

  function go(target: number) {
    const t = ++token.current;
    moveTo(target).finished.then(() => {
      // Jumps: the layout only updates once the keyboard has finished.
      if (t === token.current && modeRef.current === "jumps") {
        lift.set(Math.max(0, target - INSET));
      }
    });
  }

  function changeMode(next: AvoidMode) {
    token.current++;
    setMode(next);
    moveTo(0);
    lift.set(0);
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <ChatScreen
        key={mode}
        kb={kb}
        label="Chat with a message composer on iPhone"
        lift={lift}
        onListTap={() => open && go(0)}
        onOpen={() => !open && go(KB_H)}
        open={open}
      />
      <SegmentedControl
        ariaLabel="How the composer handles the keyboard"
        onChange={changeMode}
        options={AVOID_OPTIONS}
        value={mode}
      />
      <p className="max-w-sm text-center text-xs text-muted-foreground">
        Tap the message field, type and send. Tap the messages to close the
        keyboard.
      </p>
    </Demo>
  );
}

/* ------------------------------------------------------------------ */
/* KeyboardDismissDemo                                                 */
/* ------------------------------------------------------------------ */

type DismissMode = "done" | "interactive";

const DISMISS_OPTIONS = [
  { value: "done", label: "Done button", icon: WRONG_ICON },
  { value: "interactive", label: "Interactive", icon: RIGHT_ICON },
] as const;

export function KeyboardDismissDemo() {
  const [mode, setMode] = useState<DismissMode>("done");
  const { kb, open, moveTo, stop } = useKeyboard(true);
  const lift = useMotionValue(KB_H - INSET);
  const wrap = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    startY: number;
    moved: boolean;
    engaged: boolean;
    samples: { t: number; y: number }[];
  } | null>(null);

  useEffect(
    () => kb.on("change", (v) => lift.set(Math.max(0, v - INSET))),
    [kb, lift]
  );

  function screenTop() {
    // The screen sits 6px inside the phone frame.
    return (wrap.current?.querySelector("[role=group]")?.getBoundingClientRect().top ?? 0);
  }

  const interactive = mode === "interactive";

  const listHandlers: React.HTMLAttributes<HTMLDivElement> | undefined = interactive
    ? {
        onPointerDown(event) {
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = {
            id: event.pointerId,
            startY: event.clientY,
            moved: false,
            engaged: false,
            samples: [{ t: performance.now(), y: event.clientY }],
          };
        },
        onPointerMove(event) {
          const d = drag.current;
          if (!d || d.id !== event.pointerId) return;
          if (Math.abs(event.clientY - d.startY) > 4) d.moved = true;
          const now = performance.now();
          d.samples.push({ t: now, y: event.clientY });
          d.samples = d.samples.filter((s) => now - s.t < 100);
          if (!open && !d.engaged) return;
          // The keyboard follows once the finger reaches the composer above it.
          const fingerY = event.clientY - screenTop();
          const next = Math.min(KB_H, Math.max(0, SCREEN_H - fingerY - COMPOSER_H));
          if (next < KB_H || d.engaged) {
            if (!d.engaged) stop();
            d.engaged = true;
            kb.set(next);
          }
        },
        onPointerUp(event) {
          const d = drag.current;
          if (!d || d.id !== event.pointerId) return;
          drag.current = null;
          if (!d.engaged) {
            if (!d.moved && open) moveTo(0);
            return;
          }
          const first = d.samples[0];
          const last = d.samples[d.samples.length - 1];
          const dt = (last.t - first.t) / 1000;
          const vy = dt > 0 ? (last.y - first.y) / dt : 0; // px/s, + is down
          const target =
            vy > 300 ? 0 : vy < -300 ? KB_H : kb.get() < KB_H / 2 ? 0 : KB_H;
          moveTo(target, -vy);
        },
        onPointerCancel() {
          drag.current = null;
          moveTo(kb.get() < KB_H / 2 ? 0 : KB_H);
        },
      }
    : undefined;

  function changeMode(next: DismissMode) {
    setMode(next);
    moveTo(KB_H);
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div ref={wrap}>
        <ChatScreen
          // Starts with the keyboard up: only the messages that fit above it.
          initialMessages={START.slice(-4)}
          kb={kb}
          label="Chat with the keyboard open on iPhone"
          lift={lift}
          listHandlers={listHandlers}
          onDone={interactive ? undefined : () => moveTo(0)}
          onOpen={() => !open && moveTo(KB_H)}
          open={open}
        />
      </div>
      <SegmentedControl
        ariaLabel="How the keyboard is dismissed"
        onChange={changeMode}
        options={DISMISS_OPTIONS}
        value={mode}
      />
      <p className="max-w-sm text-center text-xs text-muted-foreground">
        Drag the messages down into the keyboard, slowly and then with a flick.
        Tap the field to bring it back.
      </p>
    </Demo>
  );
}
