"use client";

import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Contrast, measured from the same OKLCH values the demo paints with.
// Matrices from Björn Ottosson's Oklab post, luminance per WCAG 2.

type Lch = { l: number; c: number; h: number };

function luminance({ l, c, h }: Lch) {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const [r, g, bl] = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ].map((v) => Math.min(1, Math.max(0, v)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}

function contrast(a: Lch, b: Lch) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const css = ({ l, c, h }: Lch) => `oklch(${l} ${c} ${h})`;
const gray = (l: number): Lch => ({ l, c: 0, h: 0 });

// ---------------------------------------------------------------------------

/** The light mode surface shadow this site uses, carried over unchanged. */
const LIGHT_SHADOW =
  "0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06), 0 2px 4px 0 rgba(0,0,0,0.04)";
const LIGHT_LIFT =
  "0 4px 8px -2px rgba(0,0,0,0.08), 0 12px 24px -6px rgba(0,0,0,0.12)";

/** This site's dark `--custom-shadow`: inset highlight and ring, then depth. */
const DARK_SHADOW =
  "inset 0 1px 0 0 rgba(255,255,255,0.03), inset 0 0 0 1px rgba(255,255,255,0.03), 0 0 0 1px rgba(0,0,0,0.1), 0 2px 2px 0 rgba(0,0,0,0.1), 0 4px 4px 0 rgba(0,0,0,0.1), 0 8px 8px 0 rgba(0,0,0,0.1)";
const DARK_LIFT =
  "0 8px 16px -4px rgba(0,0,0,0.3), 0 16px 32px -8px rgba(0,0,0,0.5)";

type Theme = {
  page: Lch;
  card: Lch;
  popover: Lch;
  text: Lch;
  soft: Lch;
  line: string;
  accent: Lch;
  onAccent: Lch;
  danger: Lch;
  chip: string;
  shadow: string;
  lift: string;
};

const THEMES: Record<"inverted" | "designed", Theme> = {
  // Swap white for black and keep everything else from light mode.
  inverted: {
    page: gray(0),
    card: gray(0),
    popover: gray(0),
    text: gray(1),
    soft: gray(0.556),
    line: "rgba(255,255,255,0.1)",
    accent: { l: 0.5, c: 0.25, h: 265 },
    onAccent: gray(1),
    danger: { l: 0.58, c: 0.23, h: 27 },
    chip: "rgba(255,255,255,0.1)",
    shadow: LIGHT_SHADOW,
    lift: LIGHT_LIFT,
  },
  // The values this site uses in dark mode, plus a lighter popover.
  designed: {
    page: gray(0.17),
    card: gray(0.205),
    popover: gray(0.24),
    text: gray(0.945),
    soft: gray(0.66),
    line: "rgba(255,255,255,0.06)",
    accent: { l: 0.72, c: 0.12, h: 265 },
    onAccent: gray(0.17),
    danger: { l: 0.7, c: 0.17, h: 25 },
    chip: "rgba(255,255,255,0.08)",
    shadow: DARK_SHADOW,
    lift: DARK_LIFT,
  },
};

const MODE_OPTIONS = [
  { value: "inverted", label: "Inverted", icon: WRONG_ICON },
  { value: "designed", label: "Designed", icon: RIGHT_ICON },
] as const;

const MEMBERS = [
  { initials: "AL", name: "Ada Lovelace", email: "ada@acme.co", role: "Admin" },
  { initials: "GH", name: "Grace Hopper", email: "grace@acme.co", role: "Editor" },
  { initials: "AT", name: "Alan Turing", email: "alan@acme.co", role: "Viewer" },
] as const;

const ROLES = ["Admin", "Editor", "Viewer"] as const;

function MembersCard({ theme }: { theme: Theme }) {
  return (
    <div className="relative w-full max-w-72">
      <div
        className="w-full rounded-xl"
        style={{ background: css(theme.card), boxShadow: theme.shadow }}
      >
        <div className="px-4 pt-3.5 pb-1">
          <span
            className="text-sm font-medium"
            style={{ color: css(theme.text) }}
          >
            Members
          </span>
        </div>
        <ul className="px-4">
          {MEMBERS.map((member, index) => (
            <li
              key={member.email}
              className="flex h-12 items-center gap-2.5"
              style={{
                borderTop: index > 0 ? `1px solid ${theme.line}` : undefined,
              }}
            >
              <span
                className="grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-medium"
                style={{ background: theme.chip, color: css(theme.soft) }}
              >
                {member.initials}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  className="truncate text-xs font-medium"
                  style={{ color: css(theme.text) }}
                >
                  {member.name}
                </span>
                <span
                  className="truncate text-[11px]"
                  style={{ color: css(theme.soft) }}
                >
                  {member.email}
                </span>
              </span>
              <span
                className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px]"
                style={{
                  color: css(theme.soft),
                  background: index === 1 ? theme.chip : undefined,
                }}
              >
                {member.role}
                <CaretDownIcon aria-hidden="true" className="size-2.5" />
              </span>
            </li>
          ))}
        </ul>
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderTop: `1px solid ${theme.line}` }}
        >
          <span
            className="flex h-7 items-center rounded-full px-3 text-xs font-medium"
            style={{
              background: css(theme.accent),
              color: css(theme.onAccent),
            }}
          >
            Save
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: css(theme.accent) }}
          >
            Invite
          </span>
        </div>
      </div>

      {/* The role menu, open on the second member. */}
      <div
        className="absolute top-[8.25rem] -right-2 w-32 rounded-lg p-1 sm:-right-6"
        style={{
          background: css(theme.popover),
          boxShadow: `${theme.shadow}, ${theme.lift}`,
        }}
      >
        {ROLES.map((role) => (
          <span
            key={role}
            className="flex h-7 items-center justify-between rounded-md px-2 text-[11px]"
            style={{
              color: css(theme.text),
              background: role === "Editor" ? theme.chip : undefined,
            }}
          >
            {role}
            {role === "Editor" ? (
              <CheckIcon
                aria-hidden="true"
                className="size-3"
                style={{ color: css(theme.accent) }}
                weight="bold"
              />
            ) : null}
          </span>
        ))}
        <span
          className="mx-1 my-1 block h-px"
          style={{ background: theme.line }}
        />
        <span
          className="flex h-7 items-center rounded-md px-2 text-[11px]"
          style={{ color: css(theme.danger) }}
        >
          Remove
        </span>
      </div>
    </div>
  );
}

function Ratio({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {label}
      <span
        className={cn(
          "tabular-nums",
          value < 4.5 ? "text-destructive" : "text-foreground"
        )}
      >
        {value.toFixed(1)}:1
      </span>
    </span>
  );
}

export function DarkModeDemo() {
  const [mode, setMode] = useState<"inverted" | "designed">("inverted");
  const theme = THEMES[mode];

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="flex w-full max-w-md flex-col items-center gap-5">
        <div
          aria-hidden="true"
          className="flex w-full justify-center overflow-hidden rounded-2xl px-6 pt-6 pb-10 shadow-(--custom-shadow) sm:px-10 sm:pb-12"
          inert
          style={{ background: css(theme.page) }}
        >
          <MembersCard theme={theme} />
        </div>
        <div className="flex items-center gap-5">
          <Ratio label="Text" value={contrast(theme.text, theme.card)} />
          <Ratio label="Link" value={contrast(theme.accent, theme.card)} />
        </div>
      </div>
      <SegmentedControl
        ariaLabel="Dark theme"
        onChange={setMode}
        options={MODE_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}

// ---------------------------------------------------------------------------
// Elevation by lightness. Every layer keeps the same shadow; only the step
// between surfaces changes.

const PAGE_L = 0.17;

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : value;
}

function Layer({
  name,
  lightness,
  className,
  shadow,
  children,
}: {
  name: string;
  lightness: number;
  className?: string;
  shadow?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn("absolute rounded-xl p-3", className)}
      style={{ background: css(gray(lightness)), boxShadow: shadow }}
    >
      <span className="flex items-center justify-between gap-2 font-mono text-[10px] text-white/45 tabular-nums">
        {name}
        <span>{lightness.toFixed(3)}</span>
      </span>
      {children}
    </div>
  );
}

export function DarkElevationDemo() {
  const [thousandths, setThousandths] = useState(0);
  const step = thousandths / 1000;

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div
        aria-hidden="true"
        className="relative h-56 w-full max-w-sm overflow-hidden rounded-2xl shadow-(--custom-shadow)"
        style={{ background: css(gray(PAGE_L)) }}
      >
        <span className="absolute top-3 left-3 flex w-[calc(100%-1.5rem)] justify-between font-mono text-[10px] text-white/45 tabular-nums">
          Page
          <span>{PAGE_L.toFixed(3)}</span>
        </span>
        <Layer
          className="top-10 right-14 bottom-6 left-4 sm:right-20 sm:left-6"
          lightness={PAGE_L + step}
          name="Card"
          shadow={DARK_SHADOW}
        >
          <div className="mt-4 flex flex-col gap-2">
            <span className="h-1.5 w-2/3 rounded-full bg-white/15" />
            <span className="h-1.5 w-4/5 rounded-full bg-white/8" />
            <span className="h-1.5 w-1/2 rounded-full bg-white/8" />
          </div>
        </Layer>
        <Layer
          className="right-4 bottom-4 h-24 w-36 sm:right-6"
          lightness={PAGE_L + step * 2}
          name="Menu"
          shadow={`${DARK_SHADOW}, ${DARK_LIFT}`}
        >
          <div className="mt-3 flex flex-col gap-2">
            <span className="h-1.5 w-3/4 rounded-full bg-white/15" />
            <span className="h-1.5 w-1/2 rounded-full bg-white/8" />
          </div>
        </Layer>
      </div>

      <label className="grid w-full max-w-xs gap-2.5">
        <span className="flex items-center justify-between text-xs text-muted-foreground">
          Lightness per level
          <span className="tabular-nums text-foreground">
            +{step.toFixed(3)}
          </span>
        </span>
        <Slider
          aria-label="Lightness per level"
          max={70}
          min={0}
          onValueChange={(value) => setThousandths(getSliderValue(value))}
          step={5}
          value={[thousandths]}
        />
      </label>
    </Demo>
  );
}
