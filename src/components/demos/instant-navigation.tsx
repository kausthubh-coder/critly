"use client";

import { useEffect, useRef, useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A fake network: every page takes 600ms to load, once. Each side of the
// comparison keeps its own cache, so the demo can be replayed with "Reset".
const LATENCY_MS = 600;
const HOVER_INTENT_MS = 65;

const PAGES = [
  { id: "inbox", title: "Inbox", lines: ["12 unread", "3 flagged"] },
  { id: "projects", title: "Projects", lines: ["Website refresh", "Mobile app"] },
  { id: "team", title: "Team", lines: ["8 members", "2 invites pending"] },
] as const;

type PageId = (typeof PAGES)[number]["id"];

function useFakeLoader() {
  const cache = useRef(new Map<PageId, Promise<void>>());
  return {
    load(id: PageId) {
      let pending = cache.current.get(id);
      if (!pending) {
        pending = new Promise<void>((resolve) => setTimeout(resolve, LATENCY_MS));
        cache.current.set(id, pending);
      }
      return pending;
    },
    reset() {
      cache.current.clear();
    },
  };
}

function MiniApp({
  prefetch,
  resetKey,
}: {
  prefetch: boolean;
  resetKey: number;
}) {
  const loader = useFakeLoader();
  const [current, setCurrent] = useState<PageId | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const hoverTimer = useRef<number>(undefined);
  const navId = useRef(0);

  useEffect(() => {
    loader.reset();
    setCurrent(null);
    setLastMs(null);
    setLoading(false);
    // The loader is stable for the component's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  async function open(id: PageId) {
    const nav = ++navId.current;
    const start = performance.now();
    setLoading(true);
    // A click joins the prefetch already in flight instead of starting over.
    await loader.load(id);
    if (nav !== navId.current) return;
    setCurrent(id);
    setLoading(false);
    setLastMs(Math.round(performance.now() - start));
  }

  const intent = (id: PageId) =>
    prefetch
      ? {
          onPointerEnter: (event: React.PointerEvent) => {
            if (event.pointerType !== "mouse") return;
            hoverTimer.current = window.setTimeout(
              () => loader.load(id),
              HOVER_INTENT_MS
            );
          },
          onPointerLeave: () => window.clearTimeout(hoverTimer.current),
          onPointerDown: () => loader.load(id),
          onFocus: () => loader.load(id),
        }
      : {};

  const page = PAGES.find((p) => p.id === current);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex h-40 w-full overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)">
        <nav className="flex w-[5.5rem] shrink-0 flex-col gap-0.5 border-r border-border p-1.5">
          {PAGES.map((p) => (
            <button
              key={p.id}
              className={cn(
                "rounded-md px-2 py-1.5 text-left text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                current === p.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
              onClick={() => open(p.id)}
              type="button"
              {...intent(p.id)}
            >
              {p.title}
            </button>
          ))}
        </nav>
        <div aria-live="polite" className="min-w-0 flex-1 p-3">
          {loading ? (
            <div aria-label="Loading" className="flex flex-col gap-2">
              <div className="h-2.5 w-16 animate-pulse rounded-full bg-muted" />
              <div className="h-2 w-24 animate-pulse rounded-full bg-muted" />
              <div className="h-2 w-20 animate-pulse rounded-full bg-muted" />
            </div>
          ) : page ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-foreground">{page.title}</p>
              {page.lines.map((line) => (
                <p key={line} className="truncate text-[11px] text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">Pick a page</p>
          )}
        </div>
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        {lastMs === null ? "Click to content: –" : `Click to content: ${lastMs}ms`}
      </span>
    </div>
  );
}

export function PrefetchDemo() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="Fetches on click" verdict="wrong">
          <MiniApp prefetch={false} resetKey={resetKey} />
        </CompareItem>
        <CompareItem caption="Fetches on intent" verdict="right">
          <MiniApp prefetch resetKey={resetKey} />
        </CompareItem>
      </Compare>
      <Button onClick={() => setResetKey((key) => key + 1)} variant="secondary">
        Reset
      </Button>
    </Demo>
  );
}

// Latencies the "Load" button cycles through: mostly fast, sometimes slow.
const LOADS = [90, 120, 650, 80, 110, 900, 70, 140];
const SPINNER_DELAY_MS = 150;
const SPINNER_MIN_MS = 300;

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-5 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-foreground"
    />
  );
}

function LoadPanel({ delayed, run }: { delayed: boolean; run: { id: number; ms: number } | null }) {
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [spinner, setSpinner] = useState(false);

  useEffect(() => {
    if (!run) return;
    setPhase("loading");
    const timers: number[] = [];
    let shownAt = 0;
    if (delayed) {
      // Show the spinner only if the load is still going after 150ms.
      timers.push(
        window.setTimeout(() => {
          shownAt = performance.now();
          setSpinner(true);
        }, SPINNER_DELAY_MS)
      );
    } else {
      shownAt = performance.now();
      setSpinner(true);
    }
    timers.push(
      window.setTimeout(() => {
        // Once a spinner is up, keep it for at least 300ms so it never blinks.
        const visibleFor = shownAt ? performance.now() - shownAt : 0;
        const hold = delayed && shownAt ? Math.max(0, SPINNER_MIN_MS - visibleFor) : 0;
        timers.push(
          window.setTimeout(() => {
            setSpinner(false);
            setPhase("done");
          }, hold)
        );
      }, run.ms)
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [run, delayed]);

  return (
    <div className="grid h-28 w-full place-items-center rounded-xl bg-card shadow-(--custom-shadow)">
      {spinner ? (
        <Spinner />
      ) : phase === "done" ? (
        <div className="flex w-3/4 flex-col gap-2" key={run?.id}>
          <div className="h-2.5 w-1/2 rounded-full bg-foreground/20" />
          <div className="h-2 w-full rounded-full bg-foreground/10" />
          <div className="h-2 w-4/5 rounded-full bg-foreground/10" />
        </div>
      ) : phase === "loading" ? null : (
        <span className="text-xs text-muted-foreground">Press load</span>
      )}
    </div>
  );
}

export function SpinnerDelayDemo() {
  const [run, setRun] = useState<{ id: number; ms: number } | null>(null);
  const count = useRef(0);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="Spinner right away" verdict="wrong">
          <LoadPanel delayed={false} run={run} />
        </CompareItem>
        <CompareItem caption="Spinner after 150ms" verdict="right">
          <LoadPanel delayed run={run} />
        </CompareItem>
      </Compare>
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={() => {
            const ms = LOADS[count.current++ % LOADS.length];
            setRun({ id: count.current, ms });
          }}
          variant="secondary"
        >
          Load
        </Button>
        <span className="text-xs tabular-nums text-muted-foreground">
          {run ? `This load took ${run.ms}ms` : "Press it a few times"}
        </span>
      </div>
    </Demo>
  );
}
