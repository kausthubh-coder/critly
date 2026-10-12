"use client";

import { ArrowsDownUpIcon, ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { useLayoutEffect, useRef, useState } from "react";

import { Compare, CompareItem, RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";

const COUNT = 5000;
const ROW_H = 32;
const VIEW_H = 192;
const OVERSCAN = 6;

const NAMES = ["Ada", "Ben", "Cleo", "Dev", "Eli", "Fay", "Gus", "Hana", "Ivo", "June"];
const ACTIONS = ["opened", "commented on", "closed", "merged", "reviewed"];

const ROWS = Array.from({ length: COUNT }, (_, i) => ({
  id: i,
  text: `${NAMES[i % NAMES.length]} ${ACTIONS[i % ACTIONS.length]} issue #${4000 + i}`,
}));

function Row({ text, top }: { text: string; top?: number }) {
  return (
    <li
      className="flex items-center gap-2 border-b border-border/60 px-3 text-xs text-muted-foreground"
      style={{ height: ROW_H, ...(top !== undefined && { position: "absolute", top, left: 0, right: 0 }) }}
    >
      <span aria-hidden="true" className="size-4 shrink-0 rounded-full bg-muted" />
      <span className="truncate">{text}</span>
    </li>
  );
}

type Mode = "all" | "visible";

const MODE_OPTIONS = [
  { value: "all", label: "All 5,000 rows", icon: WRONG_ICON },
  { value: "visible", label: "Visible rows only", icon: RIGHT_ICON },
] as const;

export function LongListDemo() {
  const [mode, setMode] = useState<Mode>("all");
  const [reversed, setReversed] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [timing, setTiming] = useState<string | null>(null);
  const started = useRef<number | null>(null);
  const list = useRef<HTMLUListElement>(null);

  const rows = reversed ? [...ROWS].reverse() : ROWS;

  // Time from the click to the next painted frame.
  useLayoutEffect(() => {
    if (started.current === null) return;
    const start = started.current;
    started.current = null;
    requestAnimationFrame(() =>
      setTimeout(() => {
        const nodes = list.current?.childElementCount ?? 0;
        setTiming(
          `${Math.round(performance.now() - start)}ms to update ${nodes.toLocaleString()} rows`
        );
      }, 0)
    );
  });

  const first = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
  const last = Math.min(COUNT, Math.ceil((scrollTop + VIEW_H) / ROW_H) + OVERSCAN);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div
        className="w-full max-w-sm overflow-y-auto rounded-xl bg-card shadow-(--custom-shadow)"
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        style={{ height: VIEW_H }}
      >
        {mode === "all" ? (
          <ul ref={list} aria-label="Activity">
            {rows.map((row) => (
              <Row key={row.id} text={row.text} />
            ))}
          </ul>
        ) : (
          <ul
            ref={list}
            aria-label="Activity"
            className="relative"
            style={{ height: COUNT * ROW_H }}
          >
            {rows.slice(first, last).map((row, i) => (
              <Row key={row.id} text={row.text} top={(first + i) * ROW_H} />
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col items-center gap-3">
        <SegmentedControl
          ariaLabel="Rendering"
          onChange={(value) => {
            started.current = performance.now();
            setMode(value);
          }}
          options={MODE_OPTIONS}
          value={mode}
        />
        <Button
          onClick={() => {
            started.current = performance.now();
            setReversed((value) => !value);
          }}
          variant="secondary"
        >
          <ArrowsDownUpIcon aria-hidden="true" weight="bold" />
          Re-sort
        </Button>
        <span className="text-xs tabular-nums text-muted-foreground">
          {timing ?? "Re-sort the list in each mode"}
        </span>
      </div>
    </Demo>
  );
}

const CHAT_H = 176;
const PAGE = 8;
const SENDERS = ["Maya", "Leo"] as const;
const LINES = [
  "Did the build pass?",
  "Yes, deploying now",
  "Can you check the pricing page?",
  "Looks good on mobile",
  "The header wraps on small screens",
  "Fixed, take another look",
  "Ship it",
  "Lunch?",
];

function message(n: number) {
  return { id: n, sender: SENDERS[Math.abs(n) % 2], text: LINES[Math.abs(n) % LINES.length] };
}

function Chat({ anchored, replay }: { anchored: boolean; replay: number }) {
  const [oldest, setOldest] = useState(-PAGE);
  const box = useRef<HTMLDivElement>(null);
  const before = useRef<{ height: number; top: number } | null>(null);

  // Start each replay scrolled to the bottom, reading the latest messages.
  useLayoutEffect(() => {
    setOldest(-PAGE);
  }, [replay]);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    if (before.current && anchored) {
      // Keep the message you were reading where it was.
      el.scrollTop = before.current.top + (el.scrollHeight - before.current.height);
    } else if (!before.current) {
      el.scrollTop = el.scrollHeight;
    }
    before.current = null;
  }, [oldest, anchored]);

  function loadOlder() {
    const el = box.current;
    if (el) before.current = { height: el.scrollHeight, top: el.scrollTop };
    setOldest((n) => n - PAGE);
  }

  const messages = Array.from({ length: -oldest }, (_, i) => message(oldest + i));

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div
        ref={box}
        className="w-full overflow-y-auto rounded-xl bg-card p-2 shadow-(--custom-shadow)"
        // Native scroll anchoring would hide the difference, so both sides opt out.
        style={{ height: CHAT_H, overflowAnchor: "none" }}
      >
        <ul aria-label="Messages" className="flex flex-col gap-1.5">
          {messages.map((m) => (
            <li
              key={m.id}
              className={
                m.sender === "Maya"
                  ? "max-w-[85%] self-start rounded-lg bg-muted px-2 py-1 text-[11px] text-foreground"
                  : "max-w-[85%] self-end rounded-lg bg-foreground px-2 py-1 text-[11px] text-background"
              }
            >
              {m.text}
            </li>
          ))}
        </ul>
      </div>
      <Button onClick={loadOlder} size="sm" variant="secondary">
        <ClockCounterClockwiseIcon aria-hidden="true" weight="bold" />
        Load older
      </Button>
    </div>
  );
}

export function ChatAnchorDemo() {
  const [replay, setReplay] = useState(0);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="Jumps to the old messages" verdict="wrong">
          <Chat anchored={false} replay={replay} />
        </CompareItem>
        <CompareItem caption="Stays where you were" verdict="right">
          <Chat anchored replay={replay} />
        </CompareItem>
      </Compare>
      <Button onClick={() => setReplay((n) => n + 1)} variant="ghost">
        Reset
      </Button>
    </Demo>
  );
}
