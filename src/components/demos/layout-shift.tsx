"use client";

import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import waterLiliesImage from "@/assets/claude-monet-water-lilies.jpg";
import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Space = "jumpy" | "reserved";

const SPACE_OPTIONS = [
  { value: "jumpy", label: "Jumpy", icon: WRONG_ICON },
  { value: "reserved", label: "Reserved", icon: RIGHT_ICON },
] as const;

// How long after the pointer lands on Post the next late item arrives. Short
// enough to beat most clicks, which is exactly when real content arrives too.
const AMBUSH_DELAY = 150;
// The late items that arrive on their own: the photo, then the banner.
const LATE_ITEMS = 2;

const INPUT =
  "h-10 w-full rounded-lg bg-transparent px-3 text-base shadow-(--custom-shadow) outline-none placeholder:text-muted-foreground/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground aria-invalid:shadow-[0_0_0_1px_var(--color-destructive)] dark:bg-muted/40";

type Box = { left: number; top: number; width: number; height: number };

function relativeBox(element: HTMLElement, parent: HTMLElement): Box {
  const a = element.getBoundingClientRect();
  const b = parent.getBoundingClientRect();
  return {
    left: a.left - b.left,
    top: a.top - b.top,
    width: a.width,
    height: a.height,
  };
}

export function LayoutShiftDemo() {
  const [space, setSpace] = useState<Space>("jumpy");
  const [arrived, setArrived] = useState(0);
  const [error, setError] = useState(false);
  const [reply, setReply] = useState("");
  const [moved, setMoved] = useState(0);
  const [misses, setMisses] = useState(0);
  const [status, setStatus] = useState("");
  const [origin, setOrigin] = useState<Box | null>(null);
  const [run, setRun] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastBox = useRef<Box | null>(null);
  const lastShift = useRef<{ time: number; box: Box } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function reset() {
    window.clearTimeout(timer.current);
    timer.current = undefined;
    lastBox.current = null;
    lastShift.current = null;
    setArrived(0);
    setError(false);
    setReply("");
    setMoved(0);
    setMisses(0);
    setStatus("");
    setOrigin(null);
    setRun((r) => r + 1);
  }

  // Measure Post after every change that can move it. Shifts are instant,
  // like real ones, so one measurement per commit catches each of them.
  useLayoutEffect(() => {
    const card = cardRef.current;
    const button = buttonRef.current;
    if (!card || !button) return;
    const box = relativeBox(button, card);
    const previous = lastBox.current;
    lastBox.current = box;
    if (!previous) {
      setOrigin(box);
      return;
    }
    const distance = Math.round(
      Math.abs(box.top - previous.top) + Math.abs(box.left - previous.left),
    );
    if (distance === 0) return;
    lastShift.current = { time: performance.now(), box: previous };
    setMoved((m) => m + distance);
  }, [arrived, error, space, run]);

  function ambush() {
    if (timer.current !== undefined || arrived >= LATE_ITEMS) return;
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      setArrived((a) => Math.min(LATE_ITEMS, a + 1));
    }, AMBUSH_DELAY);
  }

  // A click that lands where Post just was, but on something else, is a
  // mis-click the shift caused.
  function onPointerDownCapture(event: React.PointerEvent) {
    const card = cardRef.current;
    const shift = lastShift.current;
    if (!card || !shift || performance.now() - shift.time > 1000) return;
    if (buttonRef.current?.contains(event.target as Node)) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const { box } = shift;
    const inside =
      x >= box.left &&
      x <= box.left + box.width &&
      y >= box.top &&
      y <= box.top + box.height;
    if (!inside) return;
    const part =
      (event.target as HTMLElement).closest<HTMLElement>("[data-part]")?.dataset
        .part ?? "card";
    lastShift.current = null;
    setMisses((m) => m + 1);
    setStatus(`Missed. That click landed on the ${part}.`);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (reply.trim() === "") {
      setError(true);
      setStatus("");
      return;
    }
    setReply("");
    setError(false);
    setStatus("Reply posted.");
  }

  const jumpy = space === "jumpy";
  const showPhoto = arrived >= 1;
  const showBanner = arrived >= 2;

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <SegmentedControl
          ariaLabel="Space for late content"
          onChange={(next) => {
            setSpace(next);
            reset();
          }}
          options={SPACE_OPTIONS}
          value={space}
        />
        <Button
          aria-label="Replay"
          onClick={reset}
          size="icon-sm"
          variant="secondary"
        >
          <ArrowCounterClockwiseIcon
            aria-hidden="true"
            className="size-4"
            weight="bold"
          />
        </Button>
      </div>
      <div className="flex w-full max-w-xs flex-col items-center gap-2">
        <dl className="grid w-full grid-cols-2 text-center">
          <div className="flex flex-col gap-0.5">
            <dt className="text-[11px] text-muted-foreground">Post moved</dt>
            <dd className="text-lg font-medium tabular-nums text-foreground">
              {moved}px
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[11px] text-muted-foreground">Missed clicks</dt>
            <dd className="text-lg font-medium tabular-nums text-foreground">
              {misses}
            </dd>
          </div>
        </dl>
        <p
          aria-live="polite"
          className="h-4 text-center text-xs text-muted-foreground"
        >
          {status}
        </p>
      </div>

      {/* Controls sit above the card, and the figure reserves room for the
          card's tallest state, so nothing outside the card ever moves. */}
      <div className="flex min-h-[456px] w-full max-w-xs flex-col gap-4">
        <div
          ref={cardRef}
          className="relative w-full overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)"
          onPointerDownCapture={onPointerDownCapture}
        >
          {jumpy ? (
            showBanner ? (
              <div
                data-part="banner"
                className="flex h-10 items-center justify-between bg-muted px-4 text-xs dark:bg-muted/60"
              >
                <span className="text-foreground">2 new replies</span>
                <span className="text-muted-foreground">Show</span>
              </div>
            ) : null
          ) : (
            <div
              data-part="banner"
              aria-hidden={!showBanner}
              className={cn(
                "pointer-events-none absolute top-4 right-4 z-10 transition-opacity duration-150",
                showBanner ? "opacity-100" : "opacity-0",
              )}
            >
              <span className="pointer-events-auto block rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-md">
                2 new replies
              </span>
            </div>
          )}

          <div className="flex flex-col gap-3 p-4">
            <div data-part="post" className="flex items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
                MC
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">Mira Chen</p>
                <p className="text-[11px] text-muted-foreground">2m ago</p>
              </div>
            </div>
            <p data-part="post" className="text-sm text-foreground">
              Morning light at the pond.
            </p>

            {/* The photo is fetched up front either way; "arriving" is when
                it shows. Jumpy has no box for it until then. */}
            <div
              data-part="photo"
              className={cn(
                "relative aspect-2/1 overflow-hidden rounded-lg bg-muted",
                jumpy && !showPhoto && "hidden",
              )}
            >
              <Image
                alt="Water lilies on a pond"
                className={cn(
                  "object-cover",
                  !jumpy && "transition-opacity duration-200",
                  showPhoto ? "opacity-100" : "opacity-0",
                )}
                fill
                loading="eager"
                placeholder="blur"
                sizes="320px"
                src={waterLiliesImage}
              />
            </div>

            <form
              className="mt-1 flex flex-col gap-1.5"
              noValidate
              onSubmit={onSubmit}
            >
              <label className="sr-only" htmlFor="layout-shift-reply">
                Reply
              </label>
              <input
                aria-describedby="layout-shift-reply-error"
                aria-invalid={error || undefined}
                autoComplete="off"
                className={INPUT}
                data-part="reply box"
                id="layout-shift-reply"
                onChange={(event) => {
                  setReply(event.target.value);
                  if (event.target.value.trim() !== "") setError(false);
                }}
                placeholder="Write a reply"
                value={reply}
              />
              {jumpy ? (
                error ? (
                  <p
                    data-part="error message"
                    className="text-xs leading-5 text-destructive"
                    id="layout-shift-reply-error"
                  >
                    Write something first.
                  </p>
                ) : null
              ) : (
                <p
                  data-part="error message"
                  className="h-5 text-xs leading-5 text-destructive"
                  id="layout-shift-reply-error"
                >
                  {error ? "Write something first." : ""}
                </p>
              )}
              <div className="mt-1.5 flex justify-end">
                <button
                  ref={buttonRef}
                  className="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background outline-none hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground"
                  onFocus={ambush}
                  onPointerEnter={ambush}
                  type="submit"
                >
                  Post
                </button>
              </div>
            </form>
          </div>

          {/* Where Post was before anything arrived. */}
          {origin && moved > 0 ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute z-10 grid place-items-center rounded-full border border-dashed border-sky-500 bg-card/85 text-sm font-medium text-sky-500"
              style={{
                left: origin.left,
                top: origin.top,
                width: origin.width,
                height: origin.height,
              }}
            >
              Post
            </span>
          ) : null}
        </div>
        <p className="mt-auto text-center text-xs text-pretty text-muted-foreground/70">
          Click Post. Late content arrives as you aim.
        </p>
      </div>
    </Demo>
  );
}

/* Web font swap: the same fallback with and without metric overrides. */

type Fallback = "plain" | "adjusted";

const FALLBACK_OPTIONS = [
  { value: "plain", label: "Arial", icon: WRONG_ICON },
  { value: "adjusted", label: "Arial + size-adjust", icon: RIGHT_ICON },
] as const;

// The overrides next/font generated for this site's Inter.
const FALLBACK_FACE = `@font-face {
  font-family: "Critly Inter Fallback";
  src: local("Arial");
  ascent-override: 89.79%;
  descent-override: 22.36%;
  line-gap-override: 0%;
  size-adjust: 107.89%;
}`;

const FALLBACK_STACK: Record<Fallback, string> = {
  plain: "Arial, sans-serif",
  adjusted: '"Critly Inter Fallback", Arial, sans-serif',
};

// How long the fallback shows before the web font "arrives".
const FONT_DELAY = 900;

export function FontSwapDemo() {
  const [fallback, setFallback] = useState<Fallback>("plain");
  const [loaded, setLoaded] = useState(true);
  const [moved, setMoved] = useState<number | null>(null);
  const linkRef = useRef<HTMLSpanElement>(null);
  const fallbackTop = useRef<number | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useLayoutEffect(() => {
    const link = linkRef.current;
    if (!link) return;
    if (!loaded) {
      fallbackTop.current = link.offsetTop;
      return;
    }
    if (fallbackTop.current === null) return;
    setMoved(Math.round(Math.abs(link.offsetTop - fallbackTop.current)));
    fallbackTop.current = null;
  }, [loaded, fallback]);

  function load(next: Fallback = fallback) {
    window.clearTimeout(timer.current);
    setFallback(next);
    setMoved(null);
    setLoaded(false);
    timer.current = window.setTimeout(() => setLoaded(true), FONT_DELAY);
  }

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <style>{FALLBACK_FACE}</style>
      {/* A fixed 260px measure, so the text wraps the same way everywhere, and
          room for the card's tallest state, so the controls never move. */}
      <div className="flex min-h-[232px] w-[300px] max-w-full flex-col">
        <article className="flex flex-col gap-2 rounded-xl bg-card p-5 shadow-(--custom-shadow)">
          <div
            className="flex flex-col gap-2"
            style={{
              fontFamily: loaded ? undefined : FALLBACK_STACK[fallback],
            }}
          >
            <p className="text-xl leading-7 font-semibold text-balance text-foreground">
              A slow afternoon in the water garden
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Monet painted the same pond about 250 times, from the bridge, from
              the bank and from a small boat, chasing the light.
            </p>
          </div>
          <span
            ref={linkRef}
            className="mt-1 text-sm font-medium text-foreground underline decoration-foreground/20 underline-offset-4"
          >
            Continue reading
          </span>
        </article>
      </div>

      <dl className="grid w-full max-w-xs grid-cols-2 text-center">
        <div className="flex flex-col gap-0.5">
          <dt className="text-[11px] text-muted-foreground">Showing</dt>
          <dd className="text-lg font-medium text-foreground">
            {loaded ? "Inter" : "Fallback"}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-[11px] text-muted-foreground">Link moved</dt>
          <dd className="text-lg font-medium tabular-nums text-foreground">
            {moved === null ? "-" : `${moved}px`}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <SegmentedControl
          ariaLabel="Fallback font"
          onChange={(next) => load(next)}
          options={FALLBACK_OPTIONS}
          value={fallback}
        />
        <Button onClick={() => load()} variant="secondary">
          <ArrowCounterClockwiseIcon aria-hidden="true" weight="bold" />
          Load font
        </Button>
      </div>
    </Demo>
  );
}
