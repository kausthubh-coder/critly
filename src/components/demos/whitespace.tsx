"use client";

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

type Spacing = "equal" | "grouped";

const SPACING_OPTIONS = [
  { value: "equal", label: "Equal", icon: WRONG_ICON },
  { value: "grouped", label: "Grouped", icon: RIGHT_ICON },
] as const;

const GAP_VIEW_OPTIONS = [
  { value: "hidden", label: "Normal" },
  { value: "shown", label: "Show gaps" },
] as const;

const MOTION =
  "duration-300 ease-snappy motion-reduce:transition-none";

/*
 * The whitespace is a real element here, so it can be painted on demand and
 * its size always matches the label. `divider` draws a line through the
 * middle of the gap without adding any space.
 */
function Gap({
  size,
  show = false,
  divider = false,
}: {
  size: number;
  show?: boolean;
  divider?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative shrink-0 transition-[height]", MOTION)}
      style={{ height: size }}
    >
      <span
        className={cn(
          "absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border transition-opacity duration-200",
          divider ? "opacity-100" : "opacity-0"
        )}
      />
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-end border-y border-dashed border-sky-400/80 bg-sky-500/8 pr-1 transition-opacity duration-150 dark:border-sky-500/70 dark:bg-sky-500/10",
          show ? "opacity-100" : "opacity-0"
        )}
      >
        <span className="rounded-[3px] bg-card px-0.5 text-[9px] leading-[10px] tabular-nums text-sky-500">
          {size}px
        </span>
      </span>
    </div>
  );
}

/* Settings form: label to field, field to field, section to section. */

const GAPS: Record<
  Spacing,
  { label: number; field: number; section: number }
> = {
  equal: { label: 16, field: 16, section: 16 },
  grouped: { label: 8, field: 16, section: 32 },
};

function Field({ value }: { value: string }) {
  return (
    <div className="flex h-8 items-center rounded-md bg-background px-2.5 text-xs text-foreground shadow-(--custom-shadow) dark:bg-muted/50">
      <span className="truncate">{value}</span>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4.5 w-8 shrink-0 items-center rounded-full p-0.5",
        on ? "bg-primary" : "bg-input dark:bg-input/80"
      )}
    >
      <span
        className={cn(
          "size-3.5 rounded-full",
          on
            ? "translate-x-3.5 bg-background dark:bg-primary-foreground"
            : "bg-background dark:bg-foreground"
        )}
      />
    </span>
  );
}

function SettingsForm({
  spacing,
  showGaps = false,
  squint,
  className,
}: {
  spacing: Spacing;
  showGaps?: boolean;
  squint?: boolean;
  className?: string;
}) {
  const gap = GAPS[spacing];

  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-xl bg-card p-4 text-left shadow-(--custom-shadow) sm:p-6",
        // Blur the contents, not the card, so only the grouping is left. Only
        // the squint demo passes `squint`; elsewhere the gaps keep their own
        // height transition.
        squint !== undefined &&
          "*:transition-[filter] *:duration-300 *:ease-out motion-reduce:*:transition-none",
        squint && "*:blur-[3px]",
        className
      )}
    >
      <p className="text-sm font-medium text-foreground">Profile</p>
      <Gap size={gap.field} show={showGaps} />
      <p className="text-xs text-muted-foreground">Name</p>
      <Gap size={gap.label} show={showGaps} />
      <Field value="Ada Lovelace" />
      <Gap size={gap.field} show={showGaps} />
      <p className="text-xs text-muted-foreground">Email</p>
      <Gap size={gap.label} show={showGaps} />
      <Field value="ada@lovelace.dev" />
      <Gap size={gap.section} show={showGaps} />
      <p className="text-sm font-medium text-foreground">Notifications</p>
      <Gap size={gap.field} show={showGaps} />
      <div className="flex items-center justify-between gap-2 text-xs text-foreground">
        <span className="truncate">Product news</span>
        <Toggle on />
      </div>
      <Gap size={gap.field} show={showGaps} />
      <div className="flex items-center justify-between gap-2 text-xs text-foreground">
        <span className="truncate">Weekly digest</span>
        <Toggle on={false} />
      </div>
      <Gap size={gap.section} show={showGaps} />
      <div className="flex justify-end gap-2">
        <span className="flex h-7 items-center rounded-md px-2.5 text-xs font-medium text-muted-foreground">
          Cancel
        </span>
        <span className="flex h-7 items-center rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground">
          Save
        </span>
      </div>
    </div>
  );
}

export function WhitespaceDemo() {
  const [spacing, setSpacing] = useState<Spacing>("equal");
  const [view, setView] = useState<"hidden" | "shown">("hidden");

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      {/* An invisible grouped copy reserves the taller height, so toggling
          never moves the controls or the page below. */}
      <div
        aria-hidden="true"
        className="grid w-full max-w-72 *:col-start-1 *:row-start-1"
        inert
      >
        <SettingsForm className="invisible" spacing="grouped" />
        <SettingsForm
          className="self-start"
          showGaps={view === "shown"}
          spacing={spacing}
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <SegmentedControl
          ariaLabel="Spacing"
          onChange={setSpacing}
          options={SPACING_OPTIONS}
          value={spacing}
        />
        <SegmentedControl
          ariaLabel="Gap overlay"
          onChange={setView}
          options={GAP_VIEW_OPTIONS}
          value={view}
        />
      </div>
    </Demo>
  );
}

/* Order summary: the same rows, grouped by lines or by space. */

const ORDER_GROUPS = [
  [
    { label: "Shirt", value: "$68.00" },
    { label: "Tote bag", value: "$24.00" },
  ],
  [
    { label: "Subtotal", value: "$92.00" },
    { label: "Shipping", value: "$8.00" },
  ],
  [{ label: "Total", value: "$100.00", strong: true }],
] as const;

function OrderSummary({
  inside,
  between,
  lines,
}: {
  inside: number;
  between: number;
  lines: boolean;
}) {
  return (
    <div className="flex w-full flex-col rounded-xl bg-card p-4 text-xs shadow-(--custom-shadow)">
      {ORDER_GROUPS.map((group, groupIndex) => (
        <div key={groupIndex} className="contents">
          {groupIndex > 0 && <Gap divider={lines} size={between} />}
          {group.map((row, rowIndex) => (
            <div key={row.label} className="contents">
              {rowIndex > 0 && <Gap size={inside} />}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "truncate",
                    "strong" in row
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {row.label}
                </span>
                <span
                  className={cn(
                    "tabular-nums text-foreground",
                    "strong" in row && "font-medium"
                  )}
                >
                  {row.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const LINE_OPTIONS = [
  { value: "lines", label: "Dividers" },
  { value: "none", label: "No dividers" },
] as const;

export function WhitespaceDividersDemo() {
  const [lines, setLines] = useState<"lines" | "none">("lines");
  const showLines = lines === "lines";

  return (
    <Demo className="gap-8 px-0 sm:px-8">
      <Compare className="items-start">
        <CompareItem caption="12px everywhere" verdict="wrong">
          <OrderSummary between={12} inside={12} lines={showLines} />
        </CompareItem>
        <CompareItem caption="8px in, 24px between" verdict="right">
          <OrderSummary between={24} inside={8} lines={showLines} />
        </CompareItem>
      </Compare>
      <SegmentedControl
        ariaLabel="Dividers"
        onChange={setLines}
        options={LINE_OPTIONS}
        value={lines}
      />
    </Demo>
  );
}

const SQUINT_OPTIONS = [
  { value: "sharp", label: "Sharp" },
  { value: "squint", label: "Squint" },
] as const;

export function WhitespaceSquintDemo() {
  const [view, setView] = useState<"sharp" | "squint">("sharp");

  return (
    <Demo className="gap-8 px-0 sm:px-8">
      <Compare className="items-start">
        {(["equal", "grouped"] as const).map((spacing) => (
          <CompareItem
            key={spacing}
            verdict={spacing === "equal" ? "wrong" : "right"}
            label={spacing === "equal" ? "Equal" : "Grouped"}
          >
            <div aria-hidden="true" className="w-full" inert>
              <SettingsForm spacing={spacing} squint={view === "squint"} />
            </div>
          </CompareItem>
        ))}
      </Compare>
      <SegmentedControl
        ariaLabel="Squint"
        onChange={setView}
        options={SQUINT_OPTIONS}
        value={view}
      />
    </Demo>
  );
}
