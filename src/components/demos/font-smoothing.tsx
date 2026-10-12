"use client";

import { useState, useSyncExternalStore } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

type Smoothing = "auto" | "antialiased";

const SMOOTHING_OPTIONS = [
  { value: "auto", label: "Default", icon: WRONG_ICON },
  { value: "antialiased", label: "Antialiased", icon: RIGHT_ICON },
] as const;

// No verdict for thin weights: the default is the kinder one there.
const NEUTRAL_OPTIONS = [
  { value: "auto", label: "Default" },
  { value: "antialiased", label: "Antialiased" },
] as const;

/**
 * `-webkit-font-smoothing` only changes anything on macOS. iPadOS Safari
 * reports a Mac platform too, so touch points tell the two apart.
 */
function detectMac() {
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform = nav.userAgentData?.platform ?? nav.platform ?? "";
  return /mac/i.test(platform) && nav.maxTouchPoints < 2;
}

const noop = () => () => {};

/** `null` during SSR and hydration, then whether the property is live here. */
function useIsMac() {
  return useSyncExternalStore<boolean | null>(noop, detectMac, () => null);
}

/**
 * The real property on macOS. Everywhere else it is a no-op, so the default
 * rendering is approximated: a hairline stroke in the text color stands in
 * for the thickening macOS applies to every glyph.
 */
function smoothingStyle(
  mode: Smoothing,
  isMac: boolean | null
): React.CSSProperties {
  if (mode === "antialiased") {
    return {
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    };
  }
  return {
    WebkitFontSmoothing: "auto",
    MozOsxFontSmoothing: "auto",
    ...(isMac === false && { WebkitTextStroke: "0.012em currentColor" }),
  };
}

function SmoothingControl({
  value,
  onChange,
  isMac,
  verdict = true,
}: {
  value: Smoothing;
  onChange: (value: Smoothing) => void;
  isMac: boolean | null;
  verdict?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <SegmentedControl
        ariaLabel="Font smoothing"
        onChange={onChange}
        options={verdict ? SMOOTHING_OPTIONS : NEUTRAL_OPTIONS}
        value={value}
      />
      {/* Fixed height so the note can swap in after hydration without
          moving anything. */}
      <p className="h-8 max-w-72 text-center text-[11px] leading-4 text-balance text-muted-foreground/80">
        {isMac === false
          ? "You're not on a Mac, where the property does nothing. The default is simulated here."
          : isMac
            ? "You're on a Mac, so this is the real rendering."
            : null}
      </p>
    </div>
  );
}

function ReleaseNote({ tone }: { tone: "dark" | "light" }) {
  const dark = tone === "dark";

  return (
    <div className="flex flex-col gap-1.5">
      <span
        className={cn(
          "text-lg font-semibold leading-tight tracking-tight",
          dark ? "text-white" : "text-neutral-900"
        )}
      >
        Faster cold starts
      </span>
      <span
        className={cn(
          "text-sm leading-relaxed",
          dark ? "text-white/70" : "text-neutral-600"
        )}
      >
        Functions now boot in under 100ms. No changes are needed on your side.
      </span>
    </div>
  );
}

export function FontSmoothingDemo() {
  const [mode, setMode] = useState<Smoothing>("auto");
  const isMac = useIsMac();

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div
        className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2"
        style={smoothingStyle(mode, isMac)}
      >
        <div className="rounded-xl bg-white px-5 py-5 shadow-(--custom-shadow)">
          <ReleaseNote tone="light" />
        </div>
        <div className="rounded-xl bg-neutral-900 px-5 py-5 shadow-(--custom-shadow) dark:bg-neutral-950">
          <ReleaseNote tone="dark" />
        </div>
      </div>
      <SmoothingControl isMac={isMac} onChange={setMode} value={mode} />
    </Demo>
  );
}

const WEIGHTS = [300, 400, 500, 600] as const;

export function FontSmoothingWeightsDemo() {
  const [mode, setMode] = useState<Smoothing>("auto");
  const isMac = useIsMac();

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div
        className="flex w-full max-w-sm flex-col rounded-xl bg-neutral-900 px-5 py-2 shadow-(--custom-shadow) dark:bg-neutral-950"
        style={smoothingStyle(mode, isMac)}
      >
        {WEIGHTS.map((weight) => (
          <div
            key={weight}
            className="flex items-baseline justify-between gap-6 border-b border-white/8 py-2.5 last:border-b-0"
          >
            <span
              className="text-sm text-white/80"
              style={{ fontWeight: weight }}
            >
              Boots in under 100ms
            </span>
            <span className="text-[10px] tabular-nums text-white/40">
              {weight}
            </span>
          </div>
        ))}
      </div>
      <SmoothingControl
        isMac={isMac}
        onChange={setMode}
        value={mode}
        verdict={false}
      />
    </Demo>
  );
}
