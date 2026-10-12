"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

import waterLiliesImage from "@/assets/claude-monet-water-lilies.jpg";
import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

const MIN_WIDTH = 160;
const MAX_WIDTH = 480;

/**
 * A box you can resize from its right edge. The box is the query container,
 * drawn with a dashed sky edge, and its width is read out above it.
 */
function ResizableFrame({
  width,
  onWidthChange,
  children,
  label = "Container width",
  minHeight,
}: {
  width: number;
  onWidthChange: (width: number) => void;
  children: React.ReactNode;
  label?: string;
  /** Room for the tallest state, so the controls below never move. */
  minHeight: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(MAX_WIDTH);
  const drag = useRef<{ x: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver(([entry]) =>
      setAvailable(Math.round(entry.contentRect.width)),
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  const max = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, available));
  const current = Math.min(max, Math.max(MIN_WIDTH, width));

  function set(next: number) {
    onWidthChange(Math.round(Math.min(max, Math.max(MIN_WIDTH, next))));
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const step = event.shiftKey ? 40 : 8;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowUp"
        ? current + step
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? current - step
          : event.key === "Home"
            ? MIN_WIDTH
            : event.key === "End"
              ? max
              : null;
    if (next === null) return;
    event.preventDefault();
    set(next);
  }

  return (
    <div
      ref={wrapperRef}
      className="flex w-full max-w-[480px] flex-col items-center justify-center gap-2"
      style={{ minHeight }}
    >
      <div
        className="flex items-center justify-between text-[11px] text-muted-foreground"
        style={{ width: current }}
      >
        <span>Container</span>
        <span className="font-medium tabular-nums text-foreground">
          {current}px
        </span>
      </div>
      <div className="relative" style={{ width: current }}>
        <div className="@container overflow-hidden rounded-xl bg-card shadow-(--custom-shadow) outline-1 outline-offset-4 outline-sky-500/60 outline-dashed">
          {children}
        </div>
        <div
          aria-label={label}
          aria-orientation="horizontal"
          aria-valuemax={max}
          aria-valuemin={MIN_WIDTH}
          aria-valuenow={current}
          aria-valuetext={`${current} pixels`}
          className="group/handle absolute inset-y-0 -right-4 flex w-6 cursor-ew-resize touch-none items-center justify-center outline-none"
          onKeyDown={onKeyDown}
          onLostPointerCapture={() => {
            drag.current = null;
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.focus();
            drag.current = { x: event.clientX, width: current };
          }}
          onPointerMove={(event) => {
            if (!drag.current) return;
            // The frame is centered, so its edge moves half as far as its
            // width changes. Doubling the delta keeps the handle under the pointer.
            set(drag.current.width + (event.clientX - drag.current.x) * 2);
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          role="slider"
          tabIndex={0}
        >
          <span className="h-10 w-1.5 rounded-full bg-muted-foreground/40 transition-colors group-hover/handle:bg-muted-foreground/70 group-focus-visible/handle:bg-foreground group-focus-visible/handle:outline-2 group-focus-visible/handle:outline-offset-2 group-focus-visible/handle:outline-foreground group-focus-visible/handle:outline-solid" />
        </div>
      </div>
    </div>
  );
}

type Query = "viewport" | "container";

const QUERY_OPTIONS = [
  { value: "viewport", label: "Viewport query", icon: WRONG_ICON },
  { value: "container", label: "Container query", icon: RIGHT_ICON },
] as const;

// The same card twice. Tailwind needs whole class names in the source, so the
// two versions are spelled out rather than built from a prefix.
const CARD = {
  viewport: {
    root: "flex flex-col gap-3 md:flex-row md:items-center",
    media: "h-20 w-full md:size-14",
    button: "w-full md:w-auto",
  },
  container: {
    root: "flex flex-col gap-3 @3xs:flex-row @3xs:items-center",
    media: "h-20 w-full @3xs:size-14",
    button: "w-full @3xs:w-auto",
  },
} as const;

export function ContainerQueryDemo() {
  const [query, setQuery] = useState<Query>("viewport");
  const [width, setWidth] = useState(180);
  const card = CARD[query];

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <ResizableFrame minHeight={228} onWidthChange={setWidth} width={width}>
        <div className={cn("p-3", card.root)}>
          <div
            className={cn(
              "relative shrink-0 overflow-hidden rounded-lg",
              card.media,
            )}
          >
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="480px"
              src={waterLiliesImage}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              Water Lilies, evening effect
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Claude Monet, 1897
            </p>
          </div>
          <button
            className={cn(
              "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium whitespace-nowrap text-background outline-none hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground",
              card.button,
            )}
            type="button"
          >
            Save
          </button>
        </div>
      </ResizableFrame>

      <SegmentedControl
        ariaLabel="Breakpoint source"
        onChange={setQuery}
        options={QUERY_OPTIONS}
        value={query}
      />
    </Demo>
  );
}

type TypeScale = "fixed" | "fluid";

const TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed 40px", icon: WRONG_ICON },
  { value: "fluid", label: "clamp()", icon: RIGHT_ICON },
] as const;

// 20px up to a 200px container, 40px from 450px, scaling in between.
const FLUID_SIZE = "clamp(1.25rem, 0.25rem + 8cqi, 2.5rem)";

export function FluidTypeDemo() {
  const [scale, setScale] = useState<TypeScale>("fixed");
  const [width, setWidth] = useState(220);
  const [fontSize, setFontSize] = useState(40);
  const headingRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    setFontSize(Math.round(parseFloat(getComputedStyle(heading).fontSize)));
  }, [scale, width]);

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <ResizableFrame minHeight={236} onWidthChange={setWidth} width={width}>
        <div className="flex flex-col gap-2 p-4">
          <p
            ref={headingRef}
            className="font-semibold leading-[1.1] tracking-tight text-balance text-foreground"
            style={{ fontSize: scale === "fixed" ? 40 : FLUID_SIZE }}
          >
            Impressionism, explained
          </p>
          <p className="text-sm text-muted-foreground">
            How a handful of painters left the studio to catch light as it
            moved.
          </p>
        </div>
      </ResizableFrame>

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[11px] text-muted-foreground">
          Heading font-size
        </span>
        <span className="text-lg font-medium tabular-nums text-foreground">
          {fontSize}px
        </span>
      </div>

      <SegmentedControl
        ariaLabel="Heading size"
        onChange={setScale}
        options={TYPE_OPTIONS}
        value={scale}
      />
    </Demo>
  );
}
