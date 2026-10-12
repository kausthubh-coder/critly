"use client";

import type { IconWeight } from "@phosphor-icons/react";
import {
  ArchiveIcon,
  CalendarBlankIcon,
  FoldersIcon,
  LinkSimpleIcon,
  SunIcon,
  TextBIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
  TrayIcon,
} from "@phosphor-icons/react";
import { IconItalic, IconLink, IconStrikethrough } from "@tabler/icons-react";
import { useState } from "react";

import {
  Compare,
  CompareItem,
  RIGHT_ICON,
  WRONG_ICON,
} from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Inbox", Icon: TrayIcon, count: 12 },
  { label: "Today", Icon: SunIcon, count: 4 },
  { label: "Upcoming", Icon: CalendarBlankIcon, count: 9 },
  { label: "Projects", Icon: FoldersIcon },
  { label: "Archive", Icon: ArchiveIcon },
] as const;

const WEIGHT_OPTIONS = [
  { value: "thin", label: "Thin" },
  { value: "regular", label: "Regular" },
  { value: "bold", label: "Bold" },
  { value: "duotone", label: "Duotone" },
] as const satisfies readonly { value: IconWeight; label: string }[];

type WeightOption = (typeof WEIGHT_OPTIONS)[number]["value"];

export function IconWeightsDemo() {
  const [weight, setWeight] = useState<WeightOption>("thin");

  return (
    <Demo className="gap-8">
      <div className="w-full max-w-56 rounded-xl bg-card p-1.5 shadow-(--custom-shadow)">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item, index) => (
            <li
              key={item.label}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium",
                index === 0
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.Icon
                aria-hidden="true"
                className="mb-px size-4 shrink-0"
                weight={weight}
              />
              <span className="flex-1">{item.label}</span>
              {"count" in item ? (
                <span className="text-[10px] tabular-nums text-muted-foreground/70">
                  {item.count}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      <SegmentedControl
        ariaLabel="Icon weight"
        onChange={setWeight}
        options={WEIGHT_OPTIONS}
        value={weight}
      />
    </Demo>
  );
}

function ToolbarButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-label={label}
      className="grid size-8 place-items-center rounded-full text-foreground"
      role="img"
    >
      {children}
    </span>
  );
}

export function IconMixDemo() {
  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare className="grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 sm:gap-10">
        <CompareItem verdict="wrong">
          <div className="flex items-center gap-0.5 rounded-full bg-card p-0.5 shadow-(--custom-shadow)">
            <ToolbarButton label="Bold">
              <TextBIcon aria-hidden="true" className="size-4" weight="bold" />
            </ToolbarButton>
            <ToolbarButton label="Italic">
              <IconItalic aria-hidden="true" className="size-5" stroke={2} />
            </ToolbarButton>
            <ToolbarButton label="Underline">
              <TextUnderlineIcon
                aria-hidden="true"
                className="size-4"
                weight="thin"
              />
            </ToolbarButton>
            <ToolbarButton label="Strikethrough">
              <IconStrikethrough
                aria-hidden="true"
                className="size-4"
                stroke={1.25}
              />
            </ToolbarButton>
            <ToolbarButton label="Link">
              <IconLink aria-hidden="true" className="size-[18px]" stroke={2} />
            </ToolbarButton>
          </div>
        </CompareItem>
        <CompareItem verdict="right">
          <div className="flex items-center gap-0.5 rounded-full bg-card p-0.5 shadow-(--custom-shadow)">
            <ToolbarButton label="Bold">
              <TextBIcon aria-hidden="true" className="size-4" />
            </ToolbarButton>
            <ToolbarButton label="Italic">
              <TextItalicIcon aria-hidden="true" className="size-4" />
            </ToolbarButton>
            <ToolbarButton label="Underline">
              <TextUnderlineIcon aria-hidden="true" className="size-4" />
            </ToolbarButton>
            <ToolbarButton label="Strikethrough">
              <TextStrikethroughIcon aria-hidden="true" className="size-4" />
            </ToolbarButton>
            <ToolbarButton label="Link">
              <LinkSimpleIcon aria-hidden="true" className="size-4" />
            </ToolbarButton>
          </div>
        </CompareItem>
      </Compare>
    </Demo>
  );
}

type IconScale = "same" | "larger";

const SCALE_OPTIONS = [
  { value: "same", label: "Same as text", icon: WRONG_ICON },
  { value: "larger", label: "A little larger", icon: RIGHT_ICON },
] as const;

export function IconTextSizeDemo() {
  const [scale, setScale] = useState<IconScale>("same");
  const larger = scale === "larger";

  return (
    <Demo className="gap-8">
      <div className="w-full max-w-56 rounded-xl bg-card p-1.5 shadow-(--custom-shadow)">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.slice(0, 4).map((item, index) => (
            <li
              key={item.label}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium",
                index === 1
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.Icon
                aria-hidden="true"
                className={cn(
                  "shrink-0 transition-[width,height] duration-200 ease-out motion-reduce:transition-none",
                  larger ? "mb-px size-[1.15em]" : "size-[1em]"
                )}
              />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
      <SegmentedControl
        ariaLabel="Icon size relative to text"
        onChange={setScale}
        options={SCALE_OPTIONS}
        value={scale}
      />
    </Demo>
  );
}
