"use client";

import { GearSixIcon, LinkSimpleIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import {
  Compare,
  CompareItem,
  RIGHT_ICON,
  WRONG_ICON,
} from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Kbd } from "@/components/ui/kbd";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : value;
}

/* Removed vs :focus vs :focus-visible, in a little share card. */

type RingMode = "removed" | "focus" | "visible";

const RING_OPTIONS = [
  { value: "removed", label: "Removed", icon: WRONG_ICON },
  { value: "focus", label: ":focus" },
  { value: "visible", label: ":focus-visible", icon: RIGHT_ICON },
] as const;

const RING_CLASS: Record<RingMode, string> = {
  removed: "outline-none",
  focus:
    "outline-none focus:outline-2 focus:outline-offset-2 focus:outline-solid focus:outline-foreground",
  visible:
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground",
};

const RING_NOTE: Record<RingMode, string> = {
  removed: "Tab still moves, but you can't see where.",
  focus: "Clicking a button with the mouse rings it too.",
  visible: "Rings for the keyboard, not for clicks.",
};

const GHOST =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground";

export function FocusRingsDemo() {
  const [mode, setMode] = useState<RingMode>("removed");
  const ring = RING_CLASS[mode];

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        Click the card, then press
        <Kbd>Tab</Kbd>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-xl bg-card p-4 shadow-(--custom-shadow)">
        <span className="text-xs text-muted-foreground">Invite to project</span>
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            aria-label="Email"
            autoComplete="off"
            className={cn(
              "h-9 min-w-0 flex-1 rounded-lg bg-transparent px-2.5 text-base shadow-(--custom-shadow) placeholder:text-muted-foreground/60 dark:bg-muted/40",
              ring
            )}
            placeholder="name@example.com"
            spellCheck={false}
            type="email"
          />
          <button
            className={cn(
              "inline-flex h-9 shrink-0 cursor-pointer items-center rounded-full bg-foreground px-4 text-xs font-medium text-background hover:bg-foreground/85",
              ring
            )}
            type="submit"
          >
            Invite
          </button>
        </form>
        <div className="-mx-1 flex items-center justify-between">
          <button className={cn(GHOST, ring)} type="button">
            <LinkSimpleIcon aria-hidden="true" className="size-3.5" />
            Copy link
          </button>
          <button className={cn(GHOST, ring)} type="button">
            <GearSixIcon aria-hidden="true" className="size-3.5" />
            Settings
          </button>
        </div>
      </div>
      <p className="h-4 text-xs text-muted-foreground">{RING_NOTE[mode]}</p>
      <SegmentedControl
        ariaLabel="Focus style"
        onChange={setMode}
        options={RING_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}

/* outline-offset playground: the ring follows each element's radius. */

const RING_STATIC = "outline-2 outline-solid outline-foreground";

export function FocusOffsetDemo() {
  const [offset, setOffset] = useState(2);
  const style = { outlineOffset: offset } as React.CSSProperties;

  return (
    <Demo className="gap-12 px-4 sm:px-8">
      <div
        aria-hidden="true"
        className="flex w-full flex-wrap items-center justify-center gap-8"
      >
        <span
          className={cn(
            "inline-flex h-9 items-center rounded-full bg-foreground px-4 text-xs font-medium text-background",
            RING_STATIC
          )}
          style={style}
        >
          Invite
        </span>
        <span
          className={cn(
            "inline-flex h-9 w-40 items-center rounded-lg bg-card px-2.5 text-sm text-muted-foreground/60 shadow-(--custom-shadow) dark:bg-muted/40",
            RING_STATIC
          )}
          style={style}
        >
          name@example.com
        </span>
        <span
          className={cn(
            "grid size-5 place-items-center rounded-[5px] bg-foreground",
            RING_STATIC
          )}
          style={style}
        >
          <svg viewBox="0 0 12 12" className="size-3 text-background">
            <path
              d="M2.5 6.5 5 9l4.5-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
            />
          </svg>
        </span>
      </div>

      <label className="mb-2 grid w-full max-w-xs gap-2.5">
        <span className="flex items-center justify-between text-xs text-muted-foreground">
          outline-offset
          <span className="font-mono text-[10px] tabular-nums text-foreground">
            {offset}px
          </span>
        </span>
        <Slider
          aria-label="Outline offset"
          max={6}
          min={-2}
          onValueChange={(value) => setOffset(getSliderValue(value))}
          step={1}
          value={[offset]}
        />
      </label>
    </Demo>
  );
}

/* Forced colors: box-shadow rings are dropped, outlines are repainted. */

type Colors = "normal" | "forced";

const COLOR_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "forced", label: "Forced colors" },
] as const;

export function FocusForcedColorsDemo() {
  const [colors, setColors] = useState<Colors>("normal");
  const forced = colors === "forced";

  const surface = cn(
    "grid h-28 w-full place-items-center rounded-xl",
    forced
      ? "bg-black ring-1 ring-white"
      : "bg-card shadow-(--custom-shadow)"
  );
  const button = cn(
    "inline-flex h-9 items-center rounded-full px-4 text-xs font-medium",
    forced
      ? "border border-white bg-black text-white"
      : "border border-transparent bg-foreground text-background"
  );

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="box-shadow ring" verdict="wrong">
          <div className={surface}>
            <span
              className={cn(
                button,
                !forced &&
                  "shadow-[0_0_0_2px_var(--color-card),0_0_0_4px_var(--color-foreground)]"
              )}
            >
              Invite
            </span>
          </div>
        </CompareItem>
        <CompareItem caption="outline" verdict="right">
          <div className={surface}>
            <span
              className={cn(
                button,
                "outline-2 outline-offset-2 outline-solid",
                forced ? "outline-white" : "outline-foreground"
              )}
            >
              Invite
            </span>
          </div>
        </CompareItem>
      </Compare>
      <SegmentedControl
        ariaLabel="Color mode"
        onChange={setColors}
        options={COLOR_OPTIONS}
        value={colors}
      />
    </Demo>
  );
}

/* A sticky header hides the focused row unless the scroller pads for it. */

const MESSAGES = [
  "Ana Lima",
  "Ben Ortiz",
  "Chloe Park",
  "Dev Shah",
  "Eli Novak",
  "Femi Adé",
  "Gus Moreau",
  "Hana Ito",
  "Ivo Petrov",
  "June Kim",
] as const;

const HEADER_HEIGHT = 36;

function Inbox({
  padded,
  current,
  onCurrent,
  listRef,
}: {
  padded: boolean;
  current: number;
  onCurrent: (index: number) => void;
  listRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={listRef}
      className="relative h-44 w-full overflow-y-auto overscroll-contain rounded-xl bg-card shadow-(--custom-shadow) [scrollbar-width:none]"
      style={{ scrollPaddingTop: padded ? HEADER_HEIGHT + 4 : 0 }}
    >
      <div
        className="sticky top-0 z-10 flex items-center border-b border-[#E7E7E7] bg-card/80 px-3 text-xs font-medium backdrop-blur-sm dark:border-[#1E1E1E]"
        style={{ height: HEADER_HEIGHT }}
      >
        Inbox
      </div>
      <div className="flex flex-col p-1">
        {MESSAGES.map((name, index) => (
          <button
            key={name}
            data-current={current === index || undefined}
            className="flex h-8 shrink-0 cursor-pointer items-center rounded-lg px-2 text-left text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground data-current:text-foreground data-current:outline-2 data-current:-outline-offset-2 data-current:outline-solid data-current:outline-foreground"
            onFocus={() => onCurrent(index)}
            type="button"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FocusObscuredDemo() {
  const last = MESSAGES.length - 1;
  const [current, setCurrent] = useState(last);
  const wrongRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    for (const list of [wrongRef.current, rightRef.current]) {
      if (list) list.scrollTop = list.scrollHeight;
    }
  }, []);

  // Real Tab focus scrolls only the list it lands in, so mirror the move in
  // both. "nearest" is the same scroll the browser does when focus moves,
  // and it honours the scroller's scroll-padding.
  function moveTo(index: number) {
    setCurrent(index);
    for (const list of [wrongRef.current, rightRef.current]) {
      list
        ?.querySelectorAll("button")
        [index]?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  function step() {
    moveTo(current === 0 ? last : current - 1);
  }

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="No scroll padding" verdict="wrong">
          <Inbox
            current={current}
            listRef={wrongRef}
            onCurrent={moveTo}
            padded={false}
          />
        </CompareItem>
        <CompareItem caption="scroll-padding-top: 40px" verdict="right">
          <Inbox
            current={current}
            listRef={rightRef}
            onCurrent={moveTo}
            padded
          />
        </CompareItem>
      </Compare>
      <button
        className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-full bg-secondary px-3 text-sm font-medium text-secondary-foreground shadow-(--custom-shadow-secondary) transition-transform duration-100 ease-out outline-none hover:bg-secondary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground active:scale-[0.97] motion-reduce:transition-none"
        onClick={step}
        type="button"
      >
        Move focus up
        <Kbd className="bg-transparent text-muted-foreground shadow-none dark:border-none dark:bg-transparent">
          ⇧Tab
        </Kbd>
      </button>
    </Demo>
  );
}
