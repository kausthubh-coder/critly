"use client";

import { DotsThreeIcon, PlusIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";

// A grid of cards over moving content. In "everywhere" mode each card's
// hover actions are glass, hidden at opacity 0 until hover, the way a shared
// glass button ends up in every list item. Hidden blurs still count.
const CARDS = 48;

type Mode = "everywhere" | "budgeted";

const MODE_OPTIONS = [
  { value: "everywhere", label: "Glass on every card", icon: WRONG_ICON },
  { value: "budgeted", label: "Glass on the toolbar", icon: RIGHT_ICON },
] as const;

const GLASS = "backdrop-blur-md bg-white/20 shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_4px_12px_rgb(0_0_0/0.2)]";
const SCRIM = "bg-black/55";

function useFrameStats(active: boolean) {
  const [stats, setStats] = useState({ avg: 0, worst: 0 });
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let last = performance.now();
    let deltas: number[] = [];
    let lastReport = last;
    const tick = (now: number) => {
      deltas.push(now - last);
      last = now;
      if (now - lastReport > 1000) {
        const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
        setStats({ avg, worst: Math.max(...deltas) });
        deltas = [];
        lastReport = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);
  return stats;
}

export function EffectCountDemo() {
  const [mode, setMode] = useState<Mode>("everywhere");
  const [visible, setVisible] = useState(false);
  const [counts, setCounts] = useState({ total: 0, shown: 0 });
  const root = useRef<HTMLDivElement>(null);
  const stats = useFrameStats(visible);

  // Only run the moving background while the demo is on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Count elements with a backdrop-filter, the same check you'd run on a page.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const all = [...el.querySelectorAll<HTMLElement>("*")].filter(
      (node) => getComputedStyle(node).backdropFilter !== "none"
    );
    setCounts({
      total: all.length,
      shown: all.filter((node) => getComputedStyle(node).opacity !== "0").length,
    });
  }, [mode]);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div
        ref={root}
        className="relative h-64 w-full max-w-lg overflow-hidden rounded-xl shadow-(--custom-shadow)"
      >
        {/* Moving content underneath, so every blur has to redraw. */}
        <div
          aria-hidden="true"
          className="absolute -inset-1/2 bg-[conic-gradient(from_0deg,oklch(0.75_0.15_30),oklch(0.7_0.15_150),oklch(0.65_0.15_260),oklch(0.75_0.15_30))]"
          style={{
            animation: "craft-effect-spin 6s linear infinite",
            animationPlayState: visible ? "running" : "paused",
          }}
        />
        <style>{`@keyframes craft-effect-spin { to { transform: rotate(1turn); } }`}</style>

        <div className="absolute inset-x-2 top-2 z-10 flex h-9 items-center justify-between rounded-full px-3 text-[11px] font-medium text-white backdrop-blur-md bg-white/20 shadow-[inset_0_1px_0_rgb(255_255_255/0.4)]">
          <span>Library</span>
          <span className="tabular-nums">{CARDS} titles</span>
        </div>

        <div className="absolute inset-x-2 top-13 bottom-2 grid grid-cols-8 gap-1.5 overflow-hidden">
          {Array.from({ length: CARDS }, (_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="group/card relative aspect-[2/3] rounded-md bg-black/25 ring-1 ring-white/10"
            >
              <div
                className={`absolute right-0.5 bottom-0.5 flex gap-0.5 rounded-full p-0.5 text-white opacity-0 transition-opacity duration-150 group-hover/card:opacity-100 ${
                  mode === "everywhere" ? GLASS : SCRIM
                }`}
              >
                <PlusIcon className="size-2.5" weight="bold" />
                <DotsThreeIcon className="size-2.5" weight="bold" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-4 text-center text-xs tabular-nums">
        <div>
          <dt className="text-muted-foreground">Blurs you can see</dt>
          <dd className="text-foreground">{counts.shown}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Blurs the page pays for</dt>
          <dd className={counts.total > 4 ? "text-destructive" : "text-foreground"}>{counts.total}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Frame time (worst)</dt>
          <dd className="text-foreground">
            {stats.avg ? `${stats.avg.toFixed(1)}ms (${stats.worst.toFixed(0)}ms)` : "–"}
          </dd>
        </div>
      </dl>

      <SegmentedControl
        ariaLabel="Where glass is used"
        onChange={setMode}
        options={MODE_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}
