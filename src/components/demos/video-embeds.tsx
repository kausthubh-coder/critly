"use client";

import { ArrowClockwiseIcon, PlayIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import regatta from "@/assets/claude-monet-regatta-sainte-adresse.jpg";
import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";

// Costs measured for one embed on an otherwise empty page (Chrome, 4× CPU
// throttle, median of 3 cold loads, October 2026). Orders of magnitude, not
// exact: YouTube ships different builds by region and experiment.
const EMBED = { kb: 1156, requests: 20, scriptMs: 1379 };
const FACADE = { kb: 27, requests: 6, scriptMs: 12 };

function Meter({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
        <span>{label}</span>
        <span className="text-foreground">
          {value.toLocaleString()}
          {unit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground/50 transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(2, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function VideoCard({ facade }: { facade: boolean }) {
  const [clicked, setClicked] = useState(false);
  // An eager embed costs its full weight on page load; a facade only on click.
  const cost = !facade || clicked ? EMBED : FACADE;

  return (
    <div className="flex w-full flex-col gap-3">
      <button
        className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted bg-cover bg-center shadow-(--custom-shadow) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        onClick={() => setClicked(true)}
        style={{ backgroundImage: `url(${regatta.src})` }}
        type="button"
      >
        <span className="absolute inset-0 grid place-items-center bg-black/15">
          <span className="grid size-10 place-items-center rounded-full bg-black/60 text-white">
            <PlayIcon aria-hidden="true" className="size-4" weight="fill" />
          </span>
        </span>
        <span className="sr-only">Play video</span>
      </button>
      <div className="flex flex-col gap-2">
        <Meter label="Downloaded" max={EMBED.kb} unit=" KB" value={cost.kb} />
        <Meter label="Requests" max={EMBED.requests} unit="" value={cost.requests} />
        <Meter label="Script on a phone" max={EMBED.scriptMs} unit="ms" value={cost.scriptMs} />
      </div>
    </div>
  );
}

export function EmbedFacadeDemo() {
  const [key, setKey] = useState(0);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Compare key={key}>
        <CompareItem caption="Embed loads with the page" verdict="wrong">
          <VideoCard facade={false} />
        </CompareItem>
        <CompareItem caption="Facade loads it on click" verdict="right">
          <VideoCard facade />
        </CompareItem>
      </Compare>
      <Button onClick={() => setKey((n) => n + 1)} size="sm" variant="ghost">
        Reset
      </Button>
    </Demo>
  );
}

type Network = "fast" | "slow";

const NETWORK_OPTIONS = [
  { value: "fast", label: "Fast network" },
  { value: "slow", label: "Slow network" },
] as const;

const NETWORK_DELAY: Record<Network, number> = { fast: 150, slow: 2200 };
const TIMER_REVEAL_MS = 900;

// The source is attached after a delay to stand in for a slow connection;
// the reveal logic is real.
function RevealTile({ onFirstFrame, network, run }: { onFirstFrame: boolean; network: Network; run: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    setShown(false);
    video.removeAttribute("src");
    video.load();
    video.muted = true;
    video.setAttribute("muted", "");

    const timers: number[] = [];
    const cleanups: (() => void)[] = [];
    let frameRequest = 0;

    if (!onFirstFrame) {
      // Fade on a timer, whether or not there is anything to show yet.
      timers.push(window.setTimeout(() => setShown(true), TIMER_REVEAL_MS));
    }

    timers.push(
      window.setTimeout(() => {
        video.src = "/demos/regatta.mp4";
        if (onFirstFrame) {
          // The first painted frame. requestVideoFrameCallback can be held
          // back in background tabs, so time moving past zero also counts.
          if ("requestVideoFrameCallback" in video) {
            frameRequest = video.requestVideoFrameCallback(() => setShown(true));
          }
          const onTime = () => {
            if (video.currentTime > 0) setShown(true);
          };
          video.addEventListener("timeupdate", onTime);
          cleanups.push(() => video.removeEventListener("timeupdate", onTime));
        }
        video.play().catch(() => {
          // Autoplay can be refused (Low Power Mode, settings): keep the poster.
        });
      }, NETWORK_DELAY[network])
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      cleanups.forEach((cleanup) => cleanup());
      if (frameRequest) video.cancelVideoFrameCallback(frameRequest);
      video.pause();
    };
  }, [onFirstFrame, network, run]);

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-xl bg-cover bg-center shadow-(--custom-shadow)"
      // The poster sits behind the video, so a crossfade never passes through black.
      style={{ backgroundImage: onFirstFrame ? "url(/demos/regatta-poster.jpg)" : undefined, backgroundColor: "black" }}
    >
      {!onFirstFrame ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="absolute inset-0 size-full object-cover transition-opacity duration-300"
          src="/demos/regatta-poster.jpg"
          style={{ opacity: shown ? 0 : 1 }}
        />
      ) : null}
      <video
        ref={ref}
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover transition-opacity duration-300"
        loop
        muted
        playsInline
        style={{ opacity: shown ? 1 : 0 }}
      />
    </div>
  );
}

export function VideoRevealDemo() {
  const [network, setNetwork] = useState<Network>("slow");
  const [run, setRun] = useState(0);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="Fades in after 900ms" verdict="wrong">
          <RevealTile network={network} onFirstFrame={false} run={run} />
        </CompareItem>
        <CompareItem caption="Fades in on the first frame" verdict="right">
          <RevealTile network={network} onFirstFrame run={run} />
        </CompareItem>
      </Compare>
      <div className="flex flex-col items-center gap-3">
        <SegmentedControl
          ariaLabel="Network speed"
          onChange={(value) => {
            setNetwork(value);
            setRun((n) => n + 1);
          }}
          options={NETWORK_OPTIONS}
          value={network}
        />
        <Button onClick={() => setRun((n) => n + 1)} variant="secondary">
          <ArrowClockwiseIcon aria-hidden="true" weight="bold" />
          Replay
        </Button>
      </div>
    </Demo>
  );
}
