"use client";

import {
  ArrowUUpLeftIcon,
  CopyIcon,
  LinkIcon,
  PencilSimpleIcon,
  TextBIcon,
  TextItalicIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type Overlay = "hidden" | "shown";

const OVERLAY_OPTIONS = [
  { value: "hidden", label: "Normal" },
  { value: "shown", label: "Show hit areas" },
] as const;

/* Painted onto the real clickable box so the reader can see it. */
const PAINT =
  "bg-rose-500/10 outline-1 outline-dashed outline-rose-500/60 -outline-offset-1";

const PAINT_AFTER =
  "after:bg-rose-500/10 after:outline-1 after:outline-dashed after:outline-rose-500/60 after:-outline-offset-1";

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : value;
}

/* Toolbar: the same icons in the same places, two different targets. Both
   toolbars measure 136 x 40 and put every icon centre 32px apart, so they
   look identical until the hit areas are shown or hovered. */

const TOOLS = [
  { label: "Bold", Icon: TextBIcon },
  { label: "Italic", Icon: TextItalicIcon },
  { label: "Link", Icon: LinkIcon },
  { label: "Undo", Icon: ArrowUUpLeftIcon },
] as const;

function Toolbar({ padded, paint }: { padded: boolean; paint: boolean }) {
  return (
    <div
      aria-label={padded ? "Toolbar with 32px targets" : "Toolbar with 16px targets"}
      className={cn(
        "flex items-center rounded-xl bg-card shadow-(--custom-shadow)",
        padded ? "p-1" : "gap-4 px-3 py-3"
      )}
      role="group"
    >
      {TOOLS.map(({ label, Icon }) => (
        <button
          key={label}
          aria-label={label}
          className={cn(
            "grid shrink-0 cursor-pointer place-items-center text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 active:bg-muted",
            padded ? "size-8 rounded-md" : "size-4 rounded-xs",
            paint && PAINT
          )}
          type="button"
        >
          <Icon aria-hidden="true" className="size-4" weight="bold" />
        </button>
      ))}
    </div>
  );
}

export function HitAreasToolbarDemo() {
  const [overlay, setOverlay] = useState<Overlay>("hidden");
  const paint = overlay === "shown";

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem
          caption={<span className="tabular-nums">16 × 16px targets</span>}
          verdict="wrong"
        >
          <Toolbar padded={false} paint={paint} />
        </CompareItem>
        <CompareItem
          caption={<span className="tabular-nums">32 × 32px targets</span>}
          verdict="right"
        >
          <Toolbar padded paint={paint} />
        </CompareItem>
      </Compare>
      <SegmentedControl
        ariaLabel="Hit area overlay"
        onChange={setOverlay}
        options={OVERLAY_OPTIONS}
        value={overlay}
      />
    </Demo>
  );
}

/* Chips: a 14px close button whose ::after reaches past its edges. */

const FILTERS = ["Design", "Engineering", "Product"] as const;
const CLOSE_SIZE = 14;

export function HitAreasExpandDemo() {
  const [target, setTarget] = useState(30);
  const [removed, setRemoved] = useState<string[]>([]);
  const visible = FILTERS.filter((filter) => !removed.includes(filter));
  const extend = (target - CLOSE_SIZE) / 2;
  const belowMinimum = target < 24;

  return (
    <Demo className="gap-10 px-4 sm:px-8">
      <div className="flex min-h-16 w-full max-w-sm flex-wrap content-center items-center justify-center gap-x-1.5 gap-y-2">
        {visible.map((filter) => (
          <span
            key={filter}
            className="flex h-7 items-center gap-1 rounded-full bg-card pr-1.5 pl-2.5 text-xs font-medium text-foreground shadow-(--custom-shadow)"
          >
            {filter}
            <button
              aria-label={`Remove ${filter}`}
              className={cn(
                "relative grid size-3.5 cursor-pointer place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                "after:absolute after:inset-(--extend) after:rounded-full",
                PAINT_AFTER
              )}
              onClick={() => setRemoved((list) => [...list, filter])}
              style={{ "--extend": `${-extend}px` } as React.CSSProperties}
              type="button"
            >
              <XIcon aria-hidden="true" className="size-2.5" weight="bold" />
            </button>
          </span>
        ))}
        {visible.length === 0 && (
          <button
            className="h-7 cursor-pointer rounded-full px-2.5 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() => setRemoved([])}
            type="button"
          >
            Reset filters
          </button>
        )}
      </div>

      <label className="grid w-full max-w-xs gap-2.5">
        <span className="flex items-center justify-between text-xs text-muted-foreground">
          Hit area
          <span className="tabular-nums">
            <span
              className={cn(
                "mr-2 text-[10px]",
                belowMinimum ? "text-destructive" : "text-muted-foreground/70"
              )}
            >
              {belowMinimum ? "Below 24px" : `Button ${CLOSE_SIZE}px`}
            </span>
            <span className="text-foreground">{target}px</span>
          </span>
        </span>
        <Slider
          aria-label="Hit area size"
          max={34}
          min={CLOSE_SIZE}
          onValueChange={(value) => setTarget(getSliderValue(value))}
          step={2}
          value={[target]}
        />
      </label>
    </Demo>
  );
}

/* Menu: gaps between items are dead zones, padding is not. Both menus are
   152px tall with rows 36px apart, so only the hit areas differ. */

const MENU = [
  { label: "Rename", Icon: PencilSimpleIcon },
  { label: "Duplicate", Icon: CopyIcon },
  { label: "Copy link", Icon: LinkIcon },
  { label: "Delete", Icon: TrashIcon },
] as const;

function Menu({ gapped, paint }: { gapped: boolean; paint: boolean }) {
  return (
    <div
      aria-label={gapped ? "Menu with gaps" : "Menu without gaps"}
      className={cn(
        "flex w-full flex-col rounded-xl bg-card shadow-(--custom-shadow)",
        gapped ? "gap-2 px-1 py-2" : "p-1"
      )}
      role="group"
    >
      {MENU.map(({ label, Icon }) => (
        <button
          key={label}
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-left text-xs font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
            gapped ? "h-7" : "h-9",
            label === "Delete" && "text-destructive hover:bg-destructive/10",
            paint && PAINT
          )}
          type="button"
        >
          <Icon aria-hidden="true" className="size-3.5 shrink-0" weight="duotone" />
          <span className="truncate">{label}</span>
        </button>
      ))}
    </div>
  );
}

export function HitAreasGapDemo() {
  const [overlay, setOverlay] = useState<Overlay>("hidden");
  const paint = overlay === "shown";

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem verdict="wrong">
          <Menu gapped paint={paint} />
        </CompareItem>
        <CompareItem verdict="right">
          <Menu gapped={false} paint={paint} />
        </CompareItem>
      </Compare>
      <SegmentedControl
        ariaLabel="Hit area overlay"
        onChange={setOverlay}
        options={OVERLAY_OPTIONS}
        value={overlay}
      />
    </Demo>
  );
}
