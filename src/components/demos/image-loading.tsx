"use client";

import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import cliffWalk from "@/assets/claude-monet-cliff-walk-pourville.jpg";
import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The network is simulated: the image is held back for a moment, then shown,
// so the arrival can be replayed. The average colour was measured from the
// file once; in a real app it is stored next to the image.
const ARRIVAL_MS = 900;
const AVERAGE = "rgb(129 149 149)";
// Mixed with the page surface so the placeholder never flashes bright in dark mode.
const THEMED_PLACEHOLDER = `color-mix(in oklab, ${AVERAGE} 55%, var(--muted))`;

function useArrival(replay: number) {
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    setArrived(false);
    const id = window.setTimeout(() => setArrived(true), ARRIVAL_MS);
    return () => window.clearTimeout(id);
  }, [replay]);
  return arrived;
}

function Lines() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-1.5 p-3">
      <div className="h-2 w-3/4 rounded-full bg-foreground/20" />
      <div className="h-1.5 w-full rounded-full bg-foreground/10" />
      <div className="h-1.5 w-5/6 rounded-full bg-foreground/10" />
    </div>
  );
}

function PoppingCard({ replay }: { replay: number }) {
  const arrived = useArrival(replay);
  return (
    <div className="h-52 w-full overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)">
      {/* No size, no placeholder: nothing, then the image shoves the text down. */}
      {arrived ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="block w-full" src={cliffWalk.src} />
      ) : null}
      <Lines />
    </div>
  );
}

function CalmCard({ replay }: { replay: number }) {
  const arrived = useArrival(replay);
  return (
    <div className="h-52 w-full overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)">
      <div
        className="relative w-full"
        style={{ aspectRatio: `${cliffWalk.width} / ${cliffWalk.height}`, background: THEMED_PLACEHOLDER }}
      >
        {arrived ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="absolute inset-0 size-full object-cover motion-safe:animate-[craft-img-in_240ms_cubic-bezier(0.2,0,0,1)_both]"
            height={cliffWalk.height}
            src={cliffWalk.src}
            width={cliffWalk.width}
          />
        ) : null}
      </div>
      <Lines />
    </div>
  );
}

export function ImageArrivalDemo() {
  const [replay, setReplay] = useState(0);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <style>{`@keyframes craft-img-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <Compare>
        <CompareItem caption="Pops in and pushes" verdict="wrong">
          <PoppingCard replay={replay} />
        </CompareItem>
        <CompareItem caption="Holds its place, fades in" verdict="right">
          <CalmCard replay={replay} />
        </CompareItem>
      </Compare>
      <Button onClick={() => setReplay((n) => n + 1)} variant="secondary">
        <ArrowClockwiseIcon aria-hidden="true" weight="bold" />
        Replay
      </Button>
    </Demo>
  );
}

type Stage = "placeholder" | "loaded";

const STAGE_OPTIONS = [
  { value: "placeholder", label: "Placeholder" },
  { value: "loaded", label: "Loaded" },
] as const;

const PLACEHOLDERS = [
  { label: "Grey box", style: { background: "var(--muted)" } },
  { label: "Average colour", style: { background: THEMED_PLACEHOLDER } },
  {
    label: "Tiny, unblurred",
    wrong: true,
    style: {
      backgroundImage: `url(${cliffWalk.blurDataURL})`,
      backgroundSize: "cover",
      imageRendering: "pixelated" as const,
    },
  },
  {
    label: "Tiny, blurred",
    blurred: true,
    style: {},
  },
] as const;

export function PlaceholderDemo() {
  const [stage, setStage] = useState<Stage>("placeholder");

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <style>{`@keyframes craft-img-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
        {PLACEHOLDERS.map((ph) => (
          <figure key={ph.label} className="flex flex-col items-center gap-2">
            <div
              className="relative aspect-[5/4] w-full overflow-hidden rounded-lg shadow-(--custom-shadow)"
              style={ph.style}
            >
              {"blurred" in ph ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 size-full scale-110 object-cover blur-md"
                  src={cliffWalk.blurDataURL}
                />
              ) : null}
              {stage === "loaded" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="absolute inset-0 size-full object-cover motion-safe:animate-[craft-img-in_240ms_cubic-bezier(0.2,0,0,1)_both]"
                  src={cliffWalk.src}
                />
              ) : null}
            </div>
            <figcaption
              className={cn(
                "text-center text-xs",
                "wrong" in ph ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {ph.label}
            </figcaption>
          </figure>
        ))}
      </div>
      <SegmentedControl
        ariaLabel="Image state"
        onChange={setStage}
        options={STAGE_OPTIONS}
        value={stage}
      />
    </Demo>
  );
}
