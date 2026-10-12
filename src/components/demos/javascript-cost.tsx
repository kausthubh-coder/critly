"use client";

import { ArrowClockwiseIcon, ShoppingBagIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Simulated: a page can't slow down its own CPU, so boot time is modelled as
// kilobytes × milliseconds per kilobyte for each device class. The ratios
// follow Alex Russell's 2026 device gap (mid-tier Android ~3.5×, low-end ~9×).
type Device = "laptop" | "mid" | "low";

const DEVICE_OPTIONS = [
  { value: "laptop", label: "Fast laptop" },
  { value: "mid", label: "Mid-range phone" },
  { value: "low", label: "Budget phone" },
] as const;

const MS_PER_KB: Record<Device, number> = { laptop: 1, mid: 3.5, low: 9 };

function BootingCard({ kb, device, run }: { kb: number; device: Device; run: number }) {
  const bootMs = Math.round(kb * MS_PER_KB[device]);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ignored, setIgnored] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setReady(false);
    setIgnored(0);
    setAdded(false);
    setProgress(0);
    const start = performance.now();
    let frame = 0;
    // A timer decides when it works; the bar is only a picture of it.
    const done = window.setTimeout(() => {
      setReady(true);
      setProgress(1);
    }, bootMs);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / bootMs);
      setProgress(p);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      window.clearTimeout(done);
      cancelAnimationFrame(frame);
    };
  }, [bootMs, run]);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="w-full rounded-xl bg-card p-3 shadow-(--custom-shadow)">
        <div aria-hidden="true" className="mb-2 h-16 rounded-lg bg-muted" />
        <p className="text-xs font-medium text-foreground">Canvas tote</p>
        <p className="mb-2.5 text-[11px] text-muted-foreground">$38</p>
        {/* Painted at once, but it only works once the script has booted. */}
        <Button
          className="w-full"
          onClick={() => (ready ? setAdded(true) : setIgnored((n) => n + 1))}
          size="sm"
          variant="secondary"
        >
          <ShoppingBagIcon aria-hidden="true" weight="bold" />
          {added ? "Added" : "Add to cart"}
        </Button>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", ready ? "bg-emerald-500" : "bg-muted-foreground/50")}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      <span className="text-center text-xs tabular-nums text-muted-foreground">
        {kb} KB · works after {bootMs.toLocaleString()}ms
        <br />
        {ignored > 0 ? `${ignored} tap${ignored === 1 ? "" : "s"} ignored` : " "}
      </span>
    </div>
  );
}

export function HydrationGapDemo() {
  const [device, setDevice] = useState<Device>("mid");
  const [run, setRun] = useState(0);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="Lean page" verdict="right">
          <BootingCard device={device} kb={50} run={run} />
        </CompareItem>
        <CompareItem caption="A typical page today" verdict="wrong">
          <BootingCard device={device} kb={600} run={run} />
        </CompareItem>
      </Compare>
      <div className="flex flex-col items-center gap-3">
        <SegmentedControl
          ariaLabel="Device"
          onChange={(value) => {
            setDevice(value);
            setRun((n) => n + 1);
          }}
          options={DEVICE_OPTIONS}
          value={device}
        />
        <Button onClick={() => setRun((n) => n + 1)} variant="secondary">
          <ArrowClockwiseIcon aria-hidden="true" weight="bold" />
          Reload and tap fast
        </Button>
      </div>
    </Demo>
  );
}

// The editor's code takes a moment to arrive and start (simulated).
const EDITOR_LOAD_MS = 450;

type Strategy = "upfront" | "intent";

const STRATEGY_OPTIONS = [
  { value: "upfront", label: "Load it all upfront" },
  { value: "intent", label: "Load on intent" },
] as const;

function useEditorLoader() {
  const pending = useRef<Promise<void> | null>(null);
  return {
    load() {
      pending.current ??= new Promise((resolve) => setTimeout(resolve, EDITOR_LOAD_MS));
      return pending.current;
    },
    reset() {
      pending.current = null;
    },
  };
}

export function LoadOnIntentDemo() {
  const [strategy, setStrategy] = useState<Strategy>("intent");
  const [open, setOpen] = useState<"closed" | "loading" | "open">("closed");
  const [clickMs, setClickMs] = useState<number | null>(null);
  const loader = useEditorLoader();

  function reset(next: Strategy) {
    loader.reset();
    setStrategy(next);
    setOpen("closed");
    setClickMs(null);
  }

  async function openEditor() {
    const start = performance.now();
    if (strategy === "intent") {
      setOpen("loading");
      await loader.load();
    }
    setOpen("open");
    setClickMs(Math.round(performance.now() - start));
  }

  const firstLoad = strategy === "upfront" ? 340 : 40;

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="w-full max-w-sm rounded-xl bg-card p-3 shadow-(--custom-shadow)">
        {open === "closed" ? (
          <button
            className="flex h-20 w-full items-start rounded-lg bg-muted/60 p-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={openEditor}
            onFocus={() => strategy === "intent" && loader.load()}
            onPointerEnter={() => strategy === "intent" && loader.load()}
            type="button"
          >
            Write a comment…
          </button>
        ) : open === "loading" ? (
          <div className="flex h-20 w-full flex-col gap-2 rounded-lg bg-muted/60 p-2.5">
            <div className="h-2 w-1/3 animate-pulse rounded-full bg-muted-foreground/20" />
            <div className="h-2 w-2/3 animate-pulse rounded-full bg-muted-foreground/15" />
          </div>
        ) : (
          <div className="flex h-20 w-full flex-col rounded-lg bg-background p-2 ring-1 ring-border">
            <div aria-hidden="true" className="mb-1.5 flex gap-1.5 border-b border-border pb-1.5 text-[10px] font-semibold text-muted-foreground">
              <span>B</span>
              <span className="italic">I</span>
              <span className="underline">U</span>
              <span>•</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Rich editor ready</span>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-6 text-center text-xs tabular-nums">
        <div>
          <dt className="text-muted-foreground">JavaScript on first load</dt>
          <dd className="text-foreground">{firstLoad} KB</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Click to editor ready</dt>
          <dd className="text-foreground">{clickMs === null ? "–" : `${clickMs}ms`}</dd>
        </div>
      </dl>

      <div className="flex flex-col items-center gap-3">
        <SegmentedControl
          ariaLabel="Loading strategy"
          onChange={reset}
          options={STRATEGY_OPTIONS}
          value={strategy}
        />
        <Button onClick={() => reset(strategy)} size="sm" variant="ghost">
          Reset
        </Button>
      </div>
    </Demo>
  );
}
