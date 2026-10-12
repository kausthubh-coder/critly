"use client";

import { CheckIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { memo, useDeferredValue, useEffect, useRef, useState } from "react";

import { Compare, CompareItem, RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Every row burns a little main-thread time on purpose, standing in for a
// real row's components, so a fast laptop feels what a mid-range phone does.
const ROW_COST_MS = 0.7;

function spin(ms: number) {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    // Deliberately busy.
  }
}

const WORDS = [
  "Apricot", "Basil", "Cardamom", "Dill", "Elderflower", "Fennel", "Ginger",
  "Hazelnut", "Iris", "Juniper", "Kale", "Lavender", "Mango", "Nutmeg",
  "Oregano", "Paprika", "Quince", "Rosemary", "Saffron", "Thyme", "Umami",
  "Vanilla", "Walnut", "Yuzu", "Zest",
];

// 250 items: every word in ten numbered variants.
const ITEMS = Array.from({ length: 250 }, (_, i) => ({
  id: i,
  name: `${WORDS[i % WORDS.length]} ${Math.floor(i / WORDS.length) + 1}`,
}));

function SlowRow({ name, match }: { name: string; match: boolean }) {
  spin(ROW_COST_MS);
  return (
    <li
      className={cn(
        "truncate px-2.5 py-1 text-xs",
        match ? "text-foreground" : "text-muted-foreground/50"
      )}
    >
      {name}
    </li>
  );
}

// Every keystroke re-renders all 250 rows: matches first, the rest faded.
const Results = memo(function Results({ query }: { query: string }) {
  const q = query.trim().toLowerCase();
  const rows = ITEMS.map((item) => ({
    ...item,
    match: q === "" || item.name.toLowerCase().includes(q),
  })).sort((x, y) => Number(y.match) - Number(x.match));
  return (
    <ul aria-hidden="true">
      {rows.map((item) => (
        <SlowRow key={item.id} match={item.match} name={item.name} />
      ))}
    </ul>
  );
});

type Mode = "blocking" | "deferred";

const MODE_OPTIONS = [
  { value: "blocking", label: "Blocking", icon: WRONG_ICON },
  { value: "deferred", label: "Deferred", icon: RIGHT_ICON },
] as const;

function SearchList({ mode }: { mode: Mode }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const listQuery = mode === "deferred" ? deferred : query;
  const stale = listQuery !== query;

  return (
    <div className="w-full max-w-xs overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)">
      <label className="flex h-10 items-center gap-2 border-b border-border px-3">
        <MagnifyingGlassIcon aria-hidden="true" className="size-4 text-muted-foreground" />
        <input
          aria-label="Filter ingredients"
          className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type quickly…"
          value={query}
        />
      </label>
      <div
        className="h-40 overflow-y-auto py-1 transition-opacity duration-150"
        style={{ opacity: stale ? 0.55 : 1, transitionDelay: stale ? "100ms" : "0ms" }}
      >
        <Results query={listQuery} />
      </div>
    </div>
  );
}

export function TypingLagDemo() {
  const [mode, setMode] = useState<Mode>("blocking");

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      {/* Remount on mode change so each mode starts from an empty box. */}
      <SearchList key={mode} mode={mode} />
      <SegmentedControl
        ariaLabel="Rendering mode"
        onChange={setMode}
        options={MODE_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}

const WORK_MS = 600;
const CHUNK_MS = 40;

type SaveState = "idle" | "saving" | "saved";

function yieldToMain() {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } })
    .scheduler;
  if (scheduler?.yield) return scheduler.yield();
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

// Lets React commit and the browser paint before the work starts.
function nextPaint() {
  return new Promise<void>((resolve) =>
    requestAnimationFrame(() => setTimeout(resolve, 0))
  );
}

function SaveButton({ paintFirst }: { paintFirst: boolean }) {
  const [state, setState] = useState<SaveState>("idle");
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function save() {
    if (state === "saving") return;
    window.clearTimeout(timer.current);
    if (paintFirst) {
      setState("saving");
      await nextPaint();
      // The same work, in chunks, yielding so the page stays live.
      let left = WORK_MS;
      while (left > 0) {
        spin(Math.min(CHUNK_MS, left));
        left -= CHUNK_MS;
        await yieldToMain();
      }
    } else {
      spin(WORK_MS);
    }
    setState("saved");
    timer.current = window.setTimeout(() => setState("idle"), 1400);
  }

  return (
    <Button
      aria-busy={state === "saving"}
      className={cn("min-w-28", state === "saving" && "text-muted-foreground")}
      onClick={save}
      variant="secondary"
    >
      {state === "saving" ? (
        <span
          aria-hidden="true"
          className="size-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
        />
      ) : null}
      {state === "saved" ? <CheckIcon aria-hidden="true" weight="bold" /> : null}
      {state === "idle" ? "Save" : state === "saving" ? "Saving…" : "Saved"}
    </Button>
  );
}

export function PaintFirstDemo() {
  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="Works, then answers" verdict="wrong">
          <div className="grid h-28 w-full place-items-center rounded-xl bg-card shadow-(--custom-shadow)">
            <SaveButton paintFirst={false} />
          </div>
        </CompareItem>
        <CompareItem caption="Answers, then works" verdict="right">
          <div className="grid h-28 w-full place-items-center rounded-xl bg-card shadow-(--custom-shadow)">
            <SaveButton paintFirst />
          </div>
        </CompareItem>
      </Compare>
    </Demo>
  );
}
