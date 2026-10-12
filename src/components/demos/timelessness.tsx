"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

type Era = "2011" | "2014" | "2021" | "now";

const ERAS = [
  { value: "2011", label: "2011" },
  { value: "2014", label: "2014" },
  { value: "2021", label: "2021" },
  { value: "now", label: "Now" },
] as const;

/** The 2014 flat-design long shadow: a hard 45 degree shadow, 32px deep. */
const LONG_SHADOW = Array.from(
  { length: 32 },
  (_, i) => `${i + 1}px ${i + 1}px 0 #16a085`
).join(", ");

const BACKDROP: Record<Era, string> = {
  "2011": "bg-[linear-gradient(#d9d9d9,#bfbfbf)] dark:bg-[linear-gradient(#3a3a3a,#262626)]",
  "2014": "bg-[#1abc9c]",
  "2021": "bg-[linear-gradient(135deg,#f472b6,#a78bfa_50%,#38bdf8)]",
  now: "bg-muted",
};

const BUTTON: Record<Era, string> = {
  "2011":
    "rounded-[7px] border border-[#2a5fb6] bg-[linear-gradient(#7fb0f2,#3d7fe0_50%,#2568d6_50%,#4a8ef2)] text-white [text-shadow:0_-1px_0_rgba(0,0,0,0.35)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.35)]",
  "2014":
    "rounded-[3px] bg-[#e74c3c] text-white uppercase tracking-[0.08em] text-[13px]",
  "2021":
    "rounded-2xl border border-white/40 bg-white/20 text-white backdrop-blur-md shadow-[0_8px_32px_rgba(31,38,135,0.25)]",
  now: "rounded-lg bg-foreground text-background shadow-(--custom-shadow)",
};

export function SurfaceErasDemo() {
  const [era, setEra] = useState<Era>("now");

  return (
    <Demo className="gap-8">
      <div
        className={cn(
          "grid h-44 w-full max-w-sm place-items-center overflow-hidden rounded-xl transition-colors duration-300 motion-reduce:transition-none",
          BACKDROP[era]
        )}
      >
        <button
          className={cn(
            "inline-flex h-10 cursor-pointer items-center px-5 text-sm font-medium transition-[transform,box-shadow] duration-150 active:scale-[0.97] motion-reduce:transition-none",
            BUTTON[era]
          )}
          style={era === "2014" ? { boxShadow: LONG_SHADOW } : undefined}
          type="button"
        >
          Continue
        </button>
      </div>
      <SegmentedControl
        ariaLabel="Era"
        onChange={setEra}
        options={ERAS}
        value={era}
      />
    </Demo>
  );
}

/*
 * Two pricing cards under the same four surfaces. One has weak structure
 * (no hierarchy, uneven spacing, a stray button), the other strong. The
 * surface dates both. Only the structure decides whether they read.
 */

const CARD: Record<Era, string> = {
  "2011":
    "rounded-[10px] border border-[#b5b5b5] bg-[linear-gradient(#fdfdfd,#e4e4e4)] text-[#333] shadow-[inset_0_1px_0_#fff,0_2px_4px_rgba(0,0,0,0.3)] [text-shadow:0_1px_0_#fff]",
  "2014": "rounded-[2px] bg-white text-[#2c3e50]",
  "2021":
    "rounded-2xl border border-white/40 bg-white/20 text-white backdrop-blur-md shadow-[0_8px_32px_rgba(31,38,135,0.25)]",
  now: "rounded-xl bg-card text-foreground shadow-(--custom-shadow)",
};

const MUTED: Record<Era, string> = {
  "2011": "text-[#777]",
  "2014": "text-[#7f8c8d]",
  "2021": "text-white/75",
  now: "text-muted-foreground",
};

const CARD_BUTTON: Record<Era, string> = {
  "2011":
    "rounded-[6px] border border-[#2a5fb6] bg-[linear-gradient(#7fb0f2,#3d7fe0_50%,#2568d6_50%,#4a8ef2)] text-white [text-shadow:0_-1px_0_rgba(0,0,0,0.35)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]",
  "2014": "rounded-[2px] bg-[#e74c3c] text-white uppercase tracking-[0.06em]",
  "2021": "rounded-xl border border-white/50 bg-white/30 text-white",
  now: "rounded-lg bg-foreground text-background",
};

function PricingCard({ era, strong }: { era: Era; strong: boolean }) {
  const card = cn("w-full min-w-0", CARD[era]);
  const style = era === "2014" ? { boxShadow: LONG_SHADOW } : undefined;

  if (!strong) {
    return (
      <div className={cn(card, "px-2 py-4")} style={style}>
        <p className="text-xs font-medium">Pro plan, $12 per month</p>
        <p className="mt-1 text-xs">
          Unlimited files and sync included
        </p>
        <span
          className={cn(
            "mt-1 ml-3 inline-flex h-6 items-center px-1.5 text-[10px] font-medium whitespace-nowrap",
            CARD_BUTTON[era]
          )}
        >
          Upgrade now
        </span>
      </div>
    );
  }

  return (
    <div className={cn(card, "p-3 sm:p-4")} style={style}>
      <p className={cn("text-xs", MUTED[era])}>Pro</p>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          $12
        </span>
        <span className={cn("text-xs", MUTED[era])}>/month</span>
      </p>
      <ul className="mt-3 space-y-1.5 text-xs">
        {["Unlimited", "Sync"].map((feature) => (
          <li key={feature} className="flex min-w-0 items-center gap-1.5">
            <CheckIcon aria-hidden="true" className="size-3 shrink-0" weight="bold" />
            <span className="truncate">{feature}</span>
          </li>
        ))}
      </ul>
      <span
        className={cn(
          "mt-4 flex h-8 w-full items-center justify-center text-xs font-medium",
          CARD_BUTTON[era]
        )}
      >
        Upgrade
      </span>
    </div>
  );
}

export function StructureErasDemo() {
  const [era, setEra] = useState<Era>("now");

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <Compare>
        {([false, true] as const).map((strong) => (
          <CompareItem
            key={String(strong)}
            label={strong ? "Strong structure" : "Weak structure"}
            verdict={strong ? "right" : "wrong"}
          >
            <div
              aria-hidden="true"
              className={cn(
                "grid h-64 w-full grid-cols-[minmax(0,1fr)] place-items-center overflow-hidden rounded-xl p-2 sm:p-5",
                BACKDROP[era]
              )}
            >
              <PricingCard era={era} strong={strong} />
            </div>
          </CompareItem>
        ))}
      </Compare>
      <SegmentedControl
        ariaLabel="Surface era"
        onChange={setEra}
        options={ERAS}
        value={era}
      />
    </Demo>
  );
}
