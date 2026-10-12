"use client";

import { GlobeSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// One brand hue (265, an indigo). The neutrals take `--nc` chroma toward it
// (half that on the near-white card, where a little chroma shows a lot);
// the accent is the only saturated color, lighter and softer in dark mode.
// Status colors exist only to mean something.

const HUE = 265;

const PALETTE = [
  "[--n-page:oklch(0.965_var(--nc)_var(--nh))] dark:[--n-page:oklch(0.17_var(--nc)_var(--nh))]",
  "[--n-card:oklch(0.99_calc(var(--nc)*0.5)_var(--nh))] dark:[--n-card:oklch(0.205_var(--nc)_var(--nh))]",
  "[--n-muted:oklch(0.95_var(--nc)_var(--nh))] dark:[--n-muted:oklch(0.25_var(--nc)_var(--nh))]",
  "[--n-line:oklch(0.92_var(--nc)_var(--nh))] dark:[--n-line:oklch(0.27_var(--nc)_var(--nh))]",
  "[--n-text:oklch(0.21_var(--nc)_var(--nh))] dark:[--n-text:oklch(0.945_var(--nc)_var(--nh))]",
  "[--n-soft:oklch(0.52_var(--nc)_var(--nh))] dark:[--n-soft:oklch(0.68_var(--nc)_var(--nh))]",
  "[--accent:oklch(0.52_0.18_265)] dark:[--accent:oklch(0.72_0.12_265)]",
  "[--accent-tint:oklch(0.52_0.18_265/0.1)] dark:[--accent-tint:oklch(0.72_0.12_265/0.16)]",
  "[--on-accent:oklch(1_0_0)] dark:[--on-accent:oklch(0.17_0_0)]",
  "[--ok:oklch(0.62_0.15_150)] dark:[--ok:oklch(0.75_0.14_150)]",
  "[--warn:oklch(0.75_0.15_75)] dark:[--warn:oklch(0.8_0.13_80)]",
  "[--bad:oklch(0.58_0.2_27)] dark:[--bad:oklch(0.7_0.17_25)]",
].join(" ");

function paletteStyle(chroma: number) {
  return { "--nc": chroma, "--nh": HUE } as React.CSSProperties;
}

type Roles = "everywhere" | "one";

const ROLE_OPTIONS = [
  { value: "everywhere", label: "Accent everywhere", icon: WRONG_ICON },
  { value: "one", label: "One accent", icon: RIGHT_ICON },
] as const;

const TABS = ["Overview", "Logs", "Analytics"] as const;

const DEPLOYS = [
  { branch: "main", time: "2m ago", status: "Ready", tone: "bg-(--ok)" },
  { branch: "billing", time: "18m ago", status: "Building", tone: "bg-(--warn)" },
  { branch: "auth-fix", time: "1h ago", status: "Failed", tone: "bg-(--bad)" },
] as const;

/*
 * How many elements wear each role in the card below. Everywhere: icon,
 * title, 3 tabs, 2 stats, the change, 3 branches, 3 statuses, the link and
 * the button. One accent: the selected tab and the button.
 */
const COUNTS: Record<Roles, { accent: number; status: number }> = {
  everywhere: { accent: 16, status: 0 },
  one: { accent: 2, status: 3 },
};

function DashboardCard({ roles }: { roles: Roles }) {
  const loud = roles === "everywhere";
  const accentText = loud ? "text-(--accent)" : "text-(--n-text)";

  return (
    <div className="w-full overflow-hidden rounded-xl bg-(--n-card) text-left shadow-(--custom-shadow)">
      <div className="flex items-center gap-2.5 px-4 pt-4">
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg",
            loud
              ? "bg-(--accent) text-(--on-accent)"
              : "bg-(--n-muted) text-(--n-soft)"
          )}
        >
          <GlobeSimpleIcon aria-hidden="true" className="size-4" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className={cn("truncate text-sm font-medium", accentText)}>
            Acme web
          </span>
          <span className="truncate text-xs text-(--n-soft)">Production</span>
        </span>
      </div>

      <div className="mt-3 flex gap-1 border-b border-(--n-line) px-3">
        {TABS.map((tab, index) => {
          const selected = index === 0;
          return (
            <span
              key={tab}
              className={cn(
                "relative px-1.5 py-2 text-xs font-medium",
                loud
                  ? "text-(--accent)"
                  : selected
                    ? "text-(--n-text)"
                    : "text-(--n-soft)"
              )}
            >
              <span
                className={cn(
                  "rounded-md px-1.5 py-1",
                  loud && selected && "bg-(--accent-tint)"
                )}
              >
                {tab}
              </span>
              {!loud && selected ? (
                <span className="absolute inset-x-1.5 -bottom-px h-0.5 rounded-full bg-(--accent)" />
              ) : null}
            </span>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pt-3.5">
        <span className="flex flex-col">
          <span className="text-[11px] text-(--n-soft)">Requests</span>
          <span className="flex items-baseline gap-1.5">
            <span
              className={cn("text-base font-semibold tabular-nums", accentText)}
            >
              2.4M
            </span>
            <span
              className={cn(
                "text-[11px] tabular-nums",
                loud ? "text-(--accent)" : "text-(--n-soft)"
              )}
            >
              +12%
            </span>
          </span>
        </span>
        <span className="flex flex-col">
          <span className="text-[11px] text-(--n-soft)">Uptime</span>
          <span
            className={cn("text-base font-semibold tabular-nums", accentText)}
          >
            99.98%
          </span>
        </span>
      </div>

      <ul className="mt-3 px-4">
        {DEPLOYS.map((deploy) => (
          <li
            key={deploy.branch}
            className="flex h-9 items-center gap-2 border-t border-(--n-line) text-xs first:border-t-0"
          >
            <span className={cn("min-w-0 truncate font-mono", accentText)}>
              {deploy.branch}
            </span>
            <span className="shrink-0 text-(--n-soft) tabular-nums">
              {deploy.time}
            </span>
            {loud ? (
              <span className="ml-auto shrink-0 rounded-full bg-(--accent-tint) px-2 py-0.5 text-[11px] font-medium text-(--accent)">
                {deploy.status}
              </span>
            ) : (
              <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[11px] text-(--n-soft)">
                <span className={cn("size-1.5 rounded-full", deploy.tone)} />
                {deploy.status}
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-(--n-line) px-4 py-3">
        <span
          className={cn(
            "text-xs font-medium",
            loud ? "text-(--accent)" : "text-(--n-soft)"
          )}
        >
          View all
        </span>
        <span className="flex h-7 items-center rounded-full bg-(--accent) px-3 text-xs font-medium text-(--on-accent)">
          Deploy
        </span>
      </div>
    </div>
  );
}

function RoleCount({
  swatch,
  label,
  count,
}: {
  swatch: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {swatch}
      {label}
      <span className="w-4 text-foreground tabular-nums">{count}</span>
    </span>
  );
}

export function ColorRolesDemo() {
  const [roles, setRoles] = useState<Roles>("everywhere");
  const counts = COUNTS[roles];

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div
        className={cn("flex w-full max-w-72 flex-col items-center gap-5", PALETTE)}
        style={paletteStyle(0.01)}
      >
        <div aria-hidden="true" className="w-full" inert>
          <DashboardCard roles={roles} />
        </div>
        <div className="flex items-center gap-5">
          <RoleCount
            count={counts.accent}
            label="Accent"
            swatch={<span className="size-2 rounded-full bg-(--accent)" />}
          />
          <RoleCount
            count={counts.status}
            label="Status"
            swatch={
              <span className="flex -space-x-0.5">
                <span className="size-2 rounded-full bg-(--ok) ring-1 ring-card" />
                <span className="size-2 rounded-full bg-(--warn) ring-1 ring-card" />
                <span className="size-2 rounded-full bg-(--bad) ring-1 ring-card" />
              </span>
            }
          />
        </div>
      </div>
      <SegmentedControl
        ariaLabel="Color roles"
        onChange={setRoles}
        options={ROLE_OPTIONS}
        value={roles}
      />
    </Demo>
  );
}

// ---------------------------------------------------------------------------

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : value;
}

function tintLabel(chroma: number) {
  if (chroma === 0) return "Pure gray";
  if (chroma < 0.005) return "Barely there";
  if (chroma <= 0.015) return "Tinted";
  return "Blue";
}

export function ColorTintDemo() {
  const [thousandths, setThousandths] = useState(0);
  const chroma = thousandths / 1000;

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div
        className={cn(
          "w-full max-w-sm rounded-2xl bg-(--n-page) p-4 shadow-(--custom-shadow) sm:p-6",
          PALETTE
        )}
        style={paletteStyle(chroma)}
      >
        <div aria-hidden="true" className="mx-auto max-w-72" inert>
          <DashboardCard roles="one" />
        </div>
      </div>

      <label className="grid w-full max-w-xs gap-2.5">
        <span className="flex items-center justify-between text-xs text-muted-foreground">
          Neutral chroma
          <span className="flex items-center gap-2">
            <span>{tintLabel(chroma)}</span>
            <span className="tabular-nums text-foreground">
              {chroma.toFixed(3)}
            </span>
          </span>
        </span>
        <Slider
          aria-label="Neutral chroma"
          max={30}
          min={0}
          onValueChange={(value) => setThousandths(getSliderValue(value))}
          step={1}
          value={[thousandths]}
        />
      </label>
    </Demo>
  );
}
