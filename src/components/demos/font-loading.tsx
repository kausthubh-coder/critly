"use client";

import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Demo } from "@/components/app/demo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Simulated: the site's Inter is already loaded, so "arrival" is a switch at
// 1.2s. The fallbacks are real: plain Arial, and Arial tuned with the
// metric overrides next/font generates for Inter.
const ARRIVAL_MS = 1200;

const MATCHED_FACE = `
@font-face {
  font-family: "Critly Inter Match";
  src: local("Arial"), local("ArialMT"), local("Roboto");
  ascent-override: 89.79%;
  descent-override: 22.36%;
  line-gap-override: 0%;
  size-adjust: 107.89%;
}`;

const TEXT =
  "The quiet details decide whether an interface feels finished. Fonts that arrive late can move every line you are reading.";

const LANES = [
  {
    id: "block",
    label: "Invisible until it loads",
    note: "font-display: block",
    before: { fontFamily: "var(--font-inter)", color: "transparent" },
  },
  {
    id: "swap",
    label: "Swap from plain Arial",
    note: "swap, no matching",
    before: { fontFamily: "Arial, sans-serif" },
  },
  {
    id: "matched",
    label: "Swap from a matched fallback",
    note: "swap + size-adjust",
    before: { fontFamily: '"Critly Inter Match", Arial, sans-serif' },
  },
] as const;

function Lane({
  lane,
  loaded,
}: {
  lane: (typeof LANES)[number];
  loaded: boolean;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const beforeHeight = useRef(0);
  const [shift, setShift] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!loaded) {
      beforeHeight.current = el.offsetHeight;
      setShift(null);
    } else {
      setShift(el.offsetHeight - beforeHeight.current);
    }
  }, [loaded]);

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-foreground">{lane.label}</span>
        <code className="text-[10px] text-muted-foreground">{lane.note}</code>
      </figcaption>
      <div className="rounded-xl bg-card p-3 shadow-(--custom-shadow)">
        <p
          ref={ref}
          className="text-[13px] leading-normal text-foreground"
          style={loaded ? { fontFamily: "var(--font-inter)" } : lane.before}
        >
          {TEXT}
        </p>
      </div>
      <span
        className={cn(
          "text-[11px] tabular-nums",
          shift !== null && Math.abs(shift) > 1 ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {shift === null
          ? lane.id === "block"
            ? "Nothing to read yet"
            : "Readable, in the fallback"
          : lane.id === "block"
            ? `Appeared after ${ARRIVAL_MS / 1000}s of blank space`
            : Math.abs(shift) > 1
            ? `Lines moved by ${Math.abs(shift)}px when the font arrived`
            : "Letters changed, lines stayed put"}
      </span>
    </figure>
  );
}

export function FontRaceDemo() {
  const [run, setRun] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const id = window.setTimeout(() => setLoaded(true), ARRIVAL_MS);
    return () => window.clearTimeout(id);
  }, [run]);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <style>{MATCHED_FACE}</style>
      <div className="grid w-full max-w-sm gap-4">
        {LANES.map((lane) => (
          <Lane key={lane.id} lane={lane} loaded={loaded} />
        ))}
      </div>
      <Button onClick={() => setRun((n) => n + 1)} variant="secondary">
        <ArrowClockwiseIcon aria-hidden="true" weight="bold" />
        Load the font again
      </Button>
    </Demo>
  );
}
