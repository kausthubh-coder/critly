"use client";

import {
  DotsThreeIcon,
  EyeClosedIcon,
  EyeIcon,
  HoodieIcon,
  TShirtIcon,
  ToteSimpleIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import {
  Compare,
  CompareItem,
  RIGHT_ICON,
  WRONG_ICON,
} from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Three tones and two weights carry the whole hierarchy. In light mode these
// are neutral-900, neutral-600 and neutral-500, all above 4.5:1 on white.
const TONE = {
  primary: "text-foreground",
  secondary: "text-neutral-600 dark:text-neutral-300",
  tertiary: "text-muted-foreground",
} as const;

const PRODUCTS = [
  {
    name: "Linen Shirt",
    variant: "Sand, size M",
    price: "$68",
    stock: "12 left",
    Icon: TShirtIcon,
  },
  {
    name: "Wool Hoodie",
    variant: "Charcoal, size L",
    price: "$145",
    stock: "3 left",
    Icon: HoodieIcon,
  },
  {
    name: "Canvas Tote",
    variant: "Natural",
    price: "$32",
    stock: "40 left",
    Icon: ToteSimpleIcon,
  },
] as const;

type Emphasis = "bold" | "louder" | "quieter";

const EMPHASIS_OPTIONS = [
  { value: "bold", label: "All bold", icon: WRONG_ICON },
  { value: "louder", label: "Louder", icon: WRONG_ICON },
  { value: "quieter", label: "Quieter", icon: RIGHT_ICON },
] as const;

export function VisualHierarchyDemo() {
  const [mode, setMode] = useState<Emphasis>("bold");
  const [squint, setSquint] = useState(false);
  const quiet = mode === "quieter";
  const loud = mode === "louder";

  // "All bold": every line at 600 in the darkest tone. "Louder": the name and
  // price grow to 18px/700 to win the fight. "Quieter": nothing grows; the
  // details step down to 400 and lighter tones instead.
  const primary = cn(
    "truncate leading-6",
    loud ? "text-lg font-bold" : "text-sm",
    quiet ? "font-medium" : !loud && "font-semibold",
    TONE.primary
  );
  const secondary = cn(
    "truncate text-sm leading-5 transition-colors duration-200",
    quiet ? cn("font-normal", TONE.secondary) : cn("font-semibold", TONE.primary)
  );
  const tertiary = cn(
    "text-sm leading-5 tabular-nums transition-colors duration-200",
    quiet ? cn("font-normal", TONE.tertiary) : cn("font-semibold", TONE.primary)
  );

  return (
    <Demo className="gap-8 px-0 sm:px-4">
      <div
        className={cn(
          "w-full max-w-md overflow-hidden rounded-xl bg-card shadow-(--custom-shadow) transition-[filter] duration-200",
          squint && "blur-[4px]"
        )}
      >
        <ul className="divide-y divide-[#E7E7E7] dark:divide-[#1E1E1E]">
          {PRODUCTS.map((product) => (
            <li
              key={product.name}
              className="flex h-17 items-center gap-3 px-3 sm:px-4"
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-lg bg-muted transition-colors duration-200",
                  quiet ? TONE.tertiary : TONE.primary
                )}
              >
                <product.Icon
                  aria-hidden="true"
                  className="size-4.5"
                  weight={quiet ? "regular" : "bold"}
                />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className={primary}>{product.name}</span>
                <span className={secondary}>{product.variant}</span>
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <span className={cn(primary, "tabular-nums")}>
                  {product.price}
                </span>
                <span className={tertiary}>{product.stock}</span>
              </div>
              <span className="flex w-12 shrink-0 justify-end">
                {quiet ? (
                  <Button
                    aria-label={`More actions for ${product.name}`}
                    className="text-muted-foreground"
                    size="icon-xs"
                    variant="ghost"
                  >
                    <DotsThreeIcon aria-hidden="true" weight="bold" />
                  </Button>
                ) : (
                  <Button className="font-semibold" size="xs">
                    Edit
                  </Button>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <SegmentedControl
          ariaLabel="Emphasis"
          onChange={setMode}
          options={EMPHASIS_OPTIONS}
          value={mode}
        />
        <Button
          aria-pressed={squint}
          className="text-xs"
          onClick={() => setSquint((value) => !value)}
          variant={squint ? "secondary" : "ghost"}
        >
          {squint ? (
            <EyeClosedIcon aria-hidden="true" />
          ) : (
            <EyeIcon aria-hidden="true" />
          )}
          Squint
        </Button>
      </div>
    </Demo>
  );
}

function ProductFacts({
  rows,
}: {
  rows: readonly { text: React.ReactNode; className: string }[];
}) {
  return (
    <div className="flex w-full flex-col gap-0.5 rounded-xl bg-card px-3.5 py-3 shadow-(--custom-shadow) sm:px-4">
      {rows.map((row, index) => (
        <span key={index} className={cn("truncate text-sm leading-6", row.className)}>
          {row.text}
        </span>
      ))}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-medium">{children}: </span>;
}

export function HierarchyLabelsDemo() {
  return (
    <Demo className="gap-8 px-0 sm:px-4">
      <Compare>
        <CompareItem verdict="wrong" caption="Label: value">
          <ProductFacts
            rows={[
              {
                text: (
                  <>
                    <Label>Name</Label>Linen Shirt
                  </>
                ),
                className: TONE.primary,
              },
              {
                text: (
                  <>
                    <Label>Color</Label>Sand
                  </>
                ),
                className: TONE.primary,
              },
              {
                text: (
                  <>
                    <Label>Price</Label>$68
                  </>
                ),
                className: cn("tabular-nums", TONE.primary),
              },
              {
                text: (
                  <>
                    <Label>Stock</Label>12
                  </>
                ),
                className: cn("tabular-nums", TONE.primary),
              },
            ]}
          />
        </CompareItem>
        <CompareItem verdict="right" caption="Values explain themselves">
          <ProductFacts
            rows={[
              { text: "Linen Shirt", className: cn("font-medium", TONE.primary) },
              { text: "Sand", className: TONE.secondary },
              { text: "$68", className: cn("tabular-nums", TONE.primary) },
              { text: "12 left", className: cn("tabular-nums", TONE.tertiary) },
            ]}
          />
        </CompareItem>
      </Compare>
    </Demo>
  );
}

type Rank = "same" | "ranked";

const RANK_OPTIONS = [
  { value: "same", label: "Same weight", icon: WRONG_ICON },
  { value: "ranked", label: "Ranked", icon: RIGHT_ICON },
] as const;

export function HierarchyActionsDemo() {
  const [mode, setMode] = useState<Rank>("same");
  const ranked = mode === "ranked";

  return (
    <Demo className="gap-8 px-0 sm:px-4">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-card p-4 shadow-(--custom-shadow)">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">
            Project name
          </span>
          <span className="text-sm text-muted-foreground">
            Shown in the sidebar and on invoices.
          </span>
        </div>
        <div className="flex h-8 items-center rounded-lg bg-muted/60 px-2.5 text-sm text-foreground shadow-(--custom-shadow)">
          Spring catalog
        </div>
        <div className="flex items-center gap-2">
          {/* Same weight: three solid buttons, the destructive one loudest of
              all. Ranked: one solid, one quiet, and delete as plain text that
              only turns red on hover. */}
          <Button
            className={cn(
              "mr-auto",
              ranked
                ? "text-muted-foreground"
                : "bg-destructive text-white shadow-none hover:bg-destructive/90 dark:bg-destructive dark:hover:bg-destructive/90"
            )}
            size="sm"
            variant={ranked ? "ghost-destructive" : "default"}
          >
            Delete
          </Button>
          <Button size="sm" variant={ranked ? "secondary" : "default"}>
            Cancel
          </Button>
          <Button size="sm">Save</Button>
        </div>
      </div>

      <SegmentedControl
        ariaLabel="Action hierarchy"
        onChange={setMode}
        options={RANK_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}
