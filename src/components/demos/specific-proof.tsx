"use client";

import { CheckCircleIcon, CircleIcon, UserIcon } from "@phosphor-icons/react";
import { Barlow_Condensed, IBM_Plex_Mono, Nunito } from "next/font/google";
import { useState } from "react";

import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

// Three fictional products, each with its own look, so the lesson is about
// the details in the quote and not about one way of styling a testimonial.

const condensed = Barlow_Condensed({ subsets: ["latin"], weight: ["600"] });
const rounded = Nunito({ subsets: ["latin"], weight: ["400", "800"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"] });

type Detail = "name" | "role" | "number" | "baseline" | "timeframe";

const DETAILS: { value: Detail; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "role", label: "Role and company" },
  { value: "number", label: "Number" },
  { value: "baseline", label: "Baseline" },
  { value: "timeframe", label: "Timeframe" },
];

type Product = {
  value: string;
  label: string;
  brand: string;
  claim: string;
  sub: string;
  // The result phrase for each mix of number and baseline.
  result: { neither: string; baseline: string; number: string; both: string };
  timeframe: string;
  person: string;
  initials: string;
  role: string;
  theme: {
    bg: string;
    fg: string;
    muted: string;
    accent: string;
    onAccent: string;
    display: string;
    body: string;
    claimSize: string;
    radius: string;
  };
};

const PRODUCTS: Product[] = [
  {
    value: "haulwise",
    brand: "Haulwise",
    label: "Freight",
    claim: "Plan loads so trucks don't run empty.",
    sub: "Dispatch for regional fleets of 10 to 200 trucks.",
    result: {
      neither: "made a real difference to our empty miles",
      baseline: "made a real difference to our empty miles, which ran at 31% of trips",
      number: "got our empty miles down to 18% of trips",
      both: "cut our empty miles from 31% to 18% of trips",
    },
    timeframe: " in our first quarter on it",
    person: "Dana Okafor",
    initials: "DO",
    role: "Dispatch lead, Ridgeline Freight, 42 trucks",
    theme: {
      bg: "#0f1d2b",
      fg: "#f1ece2",
      muted: "#a9b4c0",
      accent: "#f2a93b",
      onAccent: "#0f1d2b",
      display: condensed.style.fontFamily,
      body: "inherit",
      claimSize: "text-[32px] leading-[1.05] uppercase tracking-[0.01em]",
      radius: "rounded-md",
    },
  },
  {
    value: "crumbook",
    brand: "Crumbook",
    label: "Bakery books",
    claim: "Month-end in days, not weeks.",
    sub: "Bookkeeping for bakeries, from flour invoices to the till.",
    result: {
      neither: "made month-end so much easier",
      baseline: "made month-end so much easier, when it used to take us 9 days",
      number: "gets our books closed in 2 days",
      both: "took our month-end close from 9 days to 2",
    },
    timeframe: " every month since we switched in March",
    person: "Priya Raman",
    initials: "PR",
    role: "Owner, Crumb & Co., 3 bakeries",
    theme: {
      bg: "#e3f4e8",
      fg: "#12392a",
      muted: "#3d6150",
      accent: "#1b7a43",
      onAccent: "#ffffff",
      display: rounded.style.fontFamily,
      body: rounded.style.fontFamily,
      claimSize: "text-[30px] leading-[1.1] font-extrabold",
      radius: "rounded-3xl",
    },
  },
  {
    value: "testkite",
    brand: "Testkite",
    label: "Test runner",
    claim: "Know if the build is green before your coffee is.",
    sub: "Splits your test suite across machines, by timing.",
    result: {
      neither: "made our CI dramatically faster",
      baseline: "made our CI dramatically faster than the 14 minutes it used to take",
      number: "runs our full suite in 3 min 40 s",
      both: "cut our full test run from 14 minutes to 3 min 40 s",
    },
    timeframe: " in the first week",
    person: "Tomás Ruiz",
    initials: "TR",
    role: "Staff engineer, Kitebase, 200 engineers",
    theme: {
      bg: "#ffffff",
      fg: "#17141a",
      muted: "#5c5663",
      accent: "#b0136b",
      onAccent: "#ffffff",
      display: mono.style.fontFamily,
      body: mono.style.fontFamily,
      claimSize: "text-[24px] leading-[1.2] font-semibold tracking-[-0.01em]",
      radius: "rounded-none",
    },
  },
];

// What each detail lets a doubtful reader do.
const CHECKS: { label: string; needs: Detail[] }[] = [
  { label: "Look the person up", needs: ["name", "role"] },
  { label: "Tell if they're like me", needs: ["role"] },
  { label: "Size the result", needs: ["number", "baseline"] },
  { label: "Know when to expect it", needs: ["timeframe"] },
];

export function SpecificProofDemo() {
  const [productValue, setProductValue] = useState(PRODUCTS[0].value);
  const [on, setOn] = useState<Set<Detail>>(() => new Set());
  const product = PRODUCTS.find((p) => p.value === productValue)!;
  const t = product.theme;

  const has = (d: Detail) => on.has(d);
  const toggle = (d: Detail) =>
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });

  const key =
    has("number") && has("baseline")
      ? "both"
      : has("number")
        ? "number"
        : has("baseline")
          ? "baseline"
          : "neither";
  const specific = key !== "neither";
  const brand = product.brand;

  const who = has("name") ? product.person : has("role") ? null : "A happy customer";
  const passed = CHECKS.filter((c) => c.needs.every(has)).length;

  return (
    <Demo className="gap-6 px-0 sm:px-6">
      <SegmentedControl
        ariaLabel="Product"
        onChange={(value) => setProductValue(value)}
        options={PRODUCTS.map((p) => ({ value: p.value, label: p.label }))}
        value={productValue}
      />

      <div
        className="grid w-full max-w-2xl gap-6 overflow-hidden rounded-xl p-6 ring-1 ring-border sm:grid-cols-[1fr_1.15fr] sm:p-8"
        style={{ background: t.bg, color: t.fg, fontFamily: t.body }}
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold" style={{ color: t.accent }}>
            {brand}
          </p>
          <p className={t.claimSize} style={{ fontFamily: t.display }}>
            {product.claim}
          </p>
          <p className="text-[14px] leading-relaxed" style={{ color: t.muted }}>
            {product.sub}
          </p>
        </div>

        <blockquote className="flex flex-col sm:min-h-48 justify-between gap-5">
          <p className="text-[17px] leading-[1.5]">
            &ldquo;{brand}{" "}
            <span
              className={cn(specific && "font-semibold")}
              style={specific ? { color: t.accent } : undefined}
            >
              {product.result[key]}
            </span>
            {has("timeframe") ? product.timeframe : null}
            .&rdquo;
          </p>
          <footer className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "grid size-10 shrink-0 place-items-center text-[13px] font-semibold",
                t.radius
              )}
              style={
                has("name")
                  ? { background: t.accent, color: t.onAccent }
                  : { boxShadow: `inset 0 0 0 1px ${t.muted}`, color: t.muted }
              }
            >
              {has("name") ? product.initials : <UserIcon className="size-4" />}
            </span>
            <span className="flex min-w-0 flex-col text-[14px] leading-snug">
              {who ? <span className="font-semibold">{who}</span> : null}
              {has("role") ? (
                <span style={{ color: who ? t.muted : t.fg }} className={cn(!who && "font-semibold")}>
                  {product.role}
                </span>
              ) : null}
            </span>
          </footer>
        </blockquote>
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-4 px-4 sm:px-0">
        <div
          aria-label="Details in the quote"
          className="flex flex-wrap justify-center gap-2"
          role="group"
        >
          {DETAILS.map((d) => (
            <button
              key={d.value}
              aria-pressed={has(d.value)}
              className={cn(
                "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 max-sm:h-11",
                has(d.value)
                  ? "bg-foreground text-background"
                  : "text-muted-foreground ring-1 ring-border hover:text-foreground"
              )}
              onClick={() => toggle(d.value)}
              type="button"
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">
            What a doubtful reader can do with this quote:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {passed} of {CHECKS.length}
            </span>
          </p>
          <ul className="grid w-full max-w-md grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {CHECKS.map((c) => {
              const ok = c.needs.every(has);
              return (
                <li
                  key={c.label}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    ok ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {ok ? (
                    <CheckCircleIcon
                      aria-hidden="true"
                      className="size-4 shrink-0 text-emerald-700 dark:text-emerald-400"
                      weight="fill"
                    />
                  ) : (
                    <CircleIcon
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                  )}
                  <span>
                    {c.label}
                    <span className="sr-only">{ok ? " (yes)" : " (not yet)"}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Demo>
  );
}
