"use client";

import {
  ClockCounterClockwiseIcon,
  FolderIcon,
  GlobeIcon,
  LifebuoyIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

const MOTION = "duration-300 ease-snappy motion-reduce:transition-none";

/* Opaque on purpose: lines that land on the same x stack into one line. The
   wrapper fades them as a group, so overlaps never get darker. */
const EDGE_LINE =
  "absolute w-0 border-l border-dashed border-sky-400 transition-[left] dark:border-sky-500";

/* Page section: header, usage card, member list and invite form. */

type Layout = "near" | "aligned";

const LAYOUT_OPTIONS = [
  { value: "near", label: "Near misses", icon: WRONG_ICON },
  { value: "aligned", label: "Aligned", icon: RIGHT_ICON },
] as const;

const EDGE_VIEW_OPTIONS = [
  { value: "hidden", label: "Normal" },
  { value: "shown", label: "Show edges" },
] as const;

/* The left edge of every element, measured from the section's content box.
   Avatars and the card icon are 24px wide, so `name - avatar - 24` is the
   gap between them. Each component in the near-miss version brought its own
   padding: px-3.5 on the card, px-2 on the rows, px-2.5 in the input. */
const EDGES: Record<
  Layout,
  {
    header: number;
    cardBox: number;
    cardIcon: number;
    cardText: number;
    avatar: number;
    name: number;
    label: number;
    inputBox: number;
    inputText: number;
  }
> = {
  near: {
    header: 0,
    cardBox: 0,
    cardIcon: 14,
    cardText: 46,
    avatar: 8,
    name: 44,
    label: 0,
    inputBox: 0,
    inputText: 10,
  },
  aligned: {
    header: 12,
    cardBox: 0,
    cardIcon: 12,
    cardText: 44,
    avatar: 12,
    name: 44,
    label: 12,
    inputBox: 0,
    inputText: 12,
  },
};

function countEdges(layout: Layout) {
  return new Set(Object.values(EDGES[layout])).size;
}

const MEMBERS = [
  { initials: "AL", name: "Ada Lovelace", role: "Owner" },
  { initials: "GH", name: "Grace Hopper", role: "Admin" },
  { initials: "AT", name: "Alan Turing", role: "Member" },
] as const;

function PageSection({ layout, show }: { layout: Layout; show: boolean }) {
  const e = EDGES[layout];

  return (
    <div className="w-full rounded-xl bg-card p-5 text-left shadow-(--custom-shadow)">
      <div className="relative flex flex-col gap-4">
        <div
          className={cn("flex flex-col gap-0.5 transition-[padding]", MOTION)}
          style={{ paddingLeft: e.header }}
        >
          <p className="text-sm font-medium text-foreground">Members</p>
          <p className="text-xs text-muted-foreground">
            Invite people to this workspace.
          </p>
        </div>

        <div
          className={cn(
            "flex items-center rounded-lg bg-muted/70 py-3 pr-3 transition-[padding,gap] dark:bg-muted/50",
            MOTION
          )}
          style={{ paddingLeft: e.cardIcon, gap: e.cardText - e.cardIcon - 24 }}
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-background text-muted-foreground shadow-(--custom-shadow)">
            <UsersIcon aria-hidden="true" className="size-3.5" weight="bold" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="truncate font-medium text-foreground">
                Pro plan
              </span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                3 of 5 seats
              </span>
            </div>
            <span className="h-1 overflow-hidden rounded-full bg-background dark:bg-muted">
              <span className="block h-full w-3/5 rounded-full bg-foreground/70" />
            </span>
          </div>
        </div>

        <div className="-my-1 flex flex-col">
          {MEMBERS.map((member) => (
            <div
              key={member.name}
              className={cn(
                "flex h-8 items-center pr-2 text-xs transition-[padding,gap]",
                MOTION
              )}
              style={{ paddingLeft: e.avatar, gap: e.name - e.avatar - 24 }}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[9px] dark:bg-foreground/10 font-medium text-muted-foreground">
                {member.initials}
              </span>
              <span className="min-w-0 flex-1 truncate text-foreground">
                {member.name}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {member.role}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <span
            className={cn(
              "text-xs text-muted-foreground transition-[padding]",
              MOTION
            )}
            style={{ paddingLeft: e.label }}
          >
            Invite by email
          </span>
          <div className="flex gap-2">
            <span
              className={cn(
                "flex h-8 min-w-0 flex-1 items-center rounded-md bg-background text-xs text-muted-foreground shadow-(--custom-shadow) transition-[padding] dark:bg-muted/50",
                MOTION
              )}
              style={{ paddingLeft: e.inputText }}
            >
              <span className="truncate">name@company.com</span>
            </span>
            <span className="flex h-8 shrink-0 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
              Invite
            </span>
          </div>
        </div>

        {/* One line per element. Shared edges sit on top of each other and
            read as a single line. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -inset-y-5 inset-x-0 transition-opacity duration-200",
            show ? "opacity-70" : "opacity-0"
          )}
        >
          {Object.entries(e).map(([role, x]) => (
            <span
              key={role}
              className={cn(EDGE_LINE, "inset-y-0", MOTION)}
              style={{ left: x }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AlignmentDemo() {
  const [layout, setLayout] = useState<Layout>("near");
  const [view, setView] = useState<"hidden" | "shown">("shown");
  const edges = countEdges(layout);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div aria-hidden="true" className="flex w-full max-w-80 flex-col" inert>
        <PageSection layout={layout} show={view === "shown"} />
      </div>
      <p
        aria-live="polite"
        className="-mt-2 text-xs text-muted-foreground tabular-nums"
      >
        <span className="font-medium text-foreground">{edges}</span> left edges
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <SegmentedControl
          ariaLabel="Alignment"
          onChange={setLayout}
          options={LAYOUT_OPTIONS}
          value={layout}
        />
        <SegmentedControl
          ariaLabel="Edge overlay"
          onChange={setView}
          options={EDGE_VIEW_OPTIONS}
          value={view}
        />
      </div>
    </Demo>
  );
}

/* Icon rows under a heading: indent the text, or hang the icons. */

type IconLayout = "indented" | "hanging";

const ICON_OPTIONS = [
  { value: "indented", label: "Indented", icon: WRONG_ICON },
  { value: "hanging", label: "Hanging", icon: RIGHT_ICON },
] as const;

const FEATURES = [
  { label: "Unlimited projects", Icon: FolderIcon },
  { label: "Version history", Icon: ClockCounterClockwiseIcon },
  { label: "Custom domains", Icon: GlobeIcon },
  { label: "Priority support", Icon: LifebuoyIcon },
] as const;

/* A 16px icon plus an 8px gap: how far the text moves in, or the icon out. */
const ICON_SLOT = 24;

export function AlignmentIconsDemo() {
  const [layout, setLayout] = useState<IconLayout>("indented");
  const hanging = layout === "hanging";

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div
        aria-hidden="true"
        className="relative w-full max-w-60 pl-6 text-left"
        inert
      >
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <span className={cn(EDGE_LINE, "-inset-y-3 left-0", MOTION)} />
            <span
              className={cn(EDGE_LINE, "-inset-y-3", MOTION)}
              style={{ left: hanging ? 0 : ICON_SLOT }}
            />
          </div>
          <p className="text-sm font-medium text-foreground">
            What&apos;s included
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Everything in Free, plus:
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {FEATURES.map(({ label, Icon }) => (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-2 text-xs text-foreground transition-transform",
                  MOTION
                )}
                style={{
                  transform: `translateX(${hanging ? -ICON_SLOT : 0}px)`,
                }}
              >
                <Icon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <span className="truncate">{label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground tabular-nums">
            $12 per month, billed yearly.
          </p>
        </div>
      </div>
      <SegmentedControl
        ariaLabel="Icon alignment"
        onChange={setLayout}
        options={ICON_OPTIONS}
        value={layout}
      />
    </Demo>
  );
}
