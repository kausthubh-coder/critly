"use client";

import { useState } from "react";

import {
  Compare,
  CompareItem,
} from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : value;
}

/* ------------------------------------------------------------------ */
/* Change one token                                                    */
/* ------------------------------------------------------------------ */

const ACCENTS = [
  { name: "Blue", value: "#2563eb" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Green", value: "#059669" },
  { name: "Orange", value: "#ea580c" },
] as const;

const START_ACCENT = ACCENTS[0].value;
const START_RADIUS = 8;

type Source = "hardcoded" | "tokens";

/**
 * The same settings card twice. The token version reads the accent and the
 * control radius everywhere. The hardcoded version was edited by hand: the
 * button picked up the change, the switch, link, badge and input kept the
 * values they were written with.
 */
function SettingsCard({
  source,
  accent,
  radius,
}: {
  source: Source;
  accent: string;
  radius: number;
}) {
  const tokens = source === "tokens";
  const elsewhere = tokens ? accent : START_ACCENT;
  const elsewhereRadius = tokens ? radius : START_RADIUS;

  return (
    <div
      aria-hidden="true"
      className="flex w-full flex-col gap-3 bg-card p-3 text-left shadow-(--custom-shadow)"
      style={{ borderRadius: 16 }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-foreground">Alerts</span>
          <span
            className="px-1.5 py-px text-[10px] font-medium transition-[border-radius] duration-150"
            style={{
              color: elsewhere,
              backgroundColor: `color-mix(in oklab, ${elsewhere} 12%, transparent)`,
              borderRadius: Math.max(0, elsewhereRadius - 2),
            }}
          >
            Pro
          </span>
        </div>
        <span className="text-[11px] leading-snug text-muted-foreground">
          Email me about replies.
        </span>
      </div>

      <div
        className="flex h-7 items-center bg-muted px-2 text-[11px] text-muted-foreground dark:bg-muted/60"
        style={{ borderRadius: elsewhereRadius }}
      >
        you@example.com
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-foreground">Weekly digest</span>
        <span
          className="relative h-4 w-7 shrink-0 rounded-full"
          style={{ backgroundColor: elsewhere }}
        >
          <span className="absolute top-0.5 right-0.5 size-3 rounded-full bg-white shadow-sm" />
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <span
          className="text-[11px] font-medium underline decoration-1 underline-offset-2"
          style={{ color: elsewhere }}
        >
          Learn more
        </span>
        <span
          className="grid h-7 place-items-center px-3 text-[11px] font-medium text-white"
          style={{ backgroundColor: accent, borderRadius: radius }}
        >
          Save
        </span>
      </div>
    </div>
  );
}

export function DesignTokensDemo() {
  const [accent, setAccent] = useState<string>(START_ACCENT);
  const [radius, setRadius] = useState(START_RADIUS);

  // Hand-edited values that no longer match the button: switch, link and
  // badge for the accent; input and badge for the radius.
  const drift =
    (accent !== START_ACCENT ? 3 : 0) + (radius !== START_RADIUS ? 2 : 0);

  return (
    <Demo className="gap-10 px-4 sm:px-8">
      <Compare className="max-w-md">
        <CompareItem
          verdict="wrong"
          label="Hardcoded"
          caption={
            <span className="tabular-nums">
              {drift === 0 ? "In sync" : `${drift} values drifted`}
            </span>
          }
        >
          <SettingsCard source="hardcoded" accent={accent} radius={radius} />
        </CompareItem>
        <CompareItem verdict="right" label="Tokens" caption="In sync">
          <SettingsCard source="tokens" accent={accent} radius={radius} />
        </CompareItem>
      </Compare>

      <div className="mb-2 grid w-full max-w-xs gap-5">
        <div className="grid gap-2.5">
          <span className="flex items-center justify-between text-xs text-muted-foreground">
            Accent
            <span className="font-mono text-[10px] text-foreground">
              --accent: {accent}
            </span>
          </span>
          <div
            aria-label="Accent"
            className="flex items-center gap-2.5"
            role="group"
          >
            {ACCENTS.map((option) => {
              const active = option.value === accent;
              return (
                <button
                  key={option.value}
                  aria-label={option.name}
                  aria-pressed={active}
                  className={cn(
                    "size-6 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active &&
                      "shadow-[0_0_0_2px_var(--background),0_0_0_3.5px_var(--foreground)]"
                  )}
                  onClick={() => setAccent(option.value)}
                  style={{ backgroundColor: option.value }}
                  type="button"
                />
              );
            })}
          </div>
        </div>
        <label className="grid gap-2.5">
          <span className="flex items-center justify-between text-xs text-muted-foreground">
            Radius
            <span className="font-mono text-[10px] tabular-nums text-foreground">
              --radius-control: {radius}px
            </span>
          </span>
          <Slider
            aria-label="Control radius"
            max={14}
            min={0}
            onValueChange={(value) => setRadius(getSliderValue(value))}
            step={1}
            value={[radius]}
          />
        </label>
      </div>
    </Demo>
  );
}

/* ------------------------------------------------------------------ */
/* Roles survive a theme change                                        */
/* ------------------------------------------------------------------ */

type Theme = "light" | "dark";

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

const PALETTE = {
  light: {
    page: "#f5f5f5",
    raised: "#ffffff",
    sunken: "#f0f0f0",
    border: "#e5e5e5",
    text: "#171717",
    muted: "#737373",
  },
  dark: {
    page: "#0a0a0a",
    raised: "#1c1c1c",
    sunken: "#121212",
    border: "#2e2e2e",
    text: "#f5f5f5",
    muted: "#a3a3a3",
  },
} as const;

/**
 * Value names can only point at their own value, so in dark mode each
 * component needs an override. The page, card and title got one; the input,
 * the divider and the secondary text did not.
 */
function ThemedCard({ named, theme }: { named: "value" | "role"; theme: Theme }) {
  const p = PALETTE[theme];
  const light = PALETTE.light;
  const role = named === "role";

  const sunken = role ? p.sunken : light.sunken;
  const border = role ? p.border : light.border;
  const muted = role ? p.muted : light.muted;

  const tokens = role
    ? [
        ["--surface-sunken", sunken],
        ["--border", border],
        ["--text-muted", muted],
      ]
    : [
        ["--gray-100", sunken],
        ["--gray-200", border],
        ["--gray-500", muted],
      ];

  return (
    <div className="flex w-full flex-col gap-4">
      <div
        aria-hidden="true"
        className="rounded-xl p-3 shadow-(--custom-shadow)"
        style={{ backgroundColor: p.page }}
      >
        <div
          className="flex flex-col gap-2.5 rounded-lg p-3"
          style={{
            backgroundColor: p.raised,
            boxShadow:
              theme === "light"
                ? "0 0 0 1px rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06), 0 2px 4px rgb(0 0 0 / 0.04)"
                : "inset 0 0 0 1px rgb(255 255 255 / 0.04), 0 2px 4px rgb(0 0 0 / 0.3)",
          }}
        >
          <div className="flex flex-col gap-0.5">
            <span
              className="text-xs font-medium"
              style={{ color: p.text }}
            >
              Profile
            </span>
            <span className="text-[11px]" style={{ color: muted }}>
              Shown on your posts.
            </span>
          </div>
          <div
            className="flex h-7 items-center rounded-md px-2 text-[11px]"
            style={{ backgroundColor: sunken, color: muted }}
          >
            Ada Lovelace
          </div>
          <div className="h-px" style={{ backgroundColor: border }} />
          <span className="text-[11px]" style={{ color: muted }}>
            Joined 2024
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 self-center">
        {tokens.map(([name, value]) => (
          <li
            key={name}
            className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-[3px] shadow-[0_0_0_1px_rgb(0_0_0/0.1)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.15)]"
              style={{ backgroundColor: value }}
            />
            <span className="text-foreground">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TokenRolesDemo() {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    <Demo className="gap-10 px-4 sm:px-8">
      <Compare className="max-w-md">
        <CompareItem verdict="wrong" label="By value">
          <ThemedCard named="value" theme={theme} />
        </CompareItem>
        <CompareItem verdict="right" label="By role">
          <ThemedCard named="role" theme={theme} />
        </CompareItem>
      </Compare>

      <SegmentedControl
        ariaLabel="Theme"
        onChange={setTheme}
        options={THEME_OPTIONS}
        value={theme}
      />
    </Demo>
  );
}
