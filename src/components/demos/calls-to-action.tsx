"use client";

import { EyeIcon } from "@phosphor-icons/react";
import { Archivo, Fraunces, Zilla_Slab } from "next/font/google";
import { useState } from "react";

import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

// A hero and a pricing block for three fictional products, each in its own
// look. The reader changes the button label and how many different actions
// get a solid button, and squints to see whether anything still leads.

const slab = Zilla_Slab({ subsets: ["latin"], weight: ["700"] });
const serif = Fraunces({ subsets: ["latin"], weight: ["600"] });
const grotesk = Archivo({ subsets: ["latin"], weight: ["800"] });

type Theme = {
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  onAccent: string;
  surface: string;
  display: string;
  headline: string;
  button: string;
};

type Product = {
  value: string;
  label: string;
  brand: string;
  headline: string;
  sub: string;
  primary: string;
  promise: string;
  reassure: string;
  secondaries: [string, string, string];
  plans: [
    { name: string; price: string; per: string; note: string },
    { name: string; price: string; per: string; note: string; action: string },
  ];
  theme: Theme;
};

const PRODUCTS: Product[] = [
  {
    value: "quayside",
    label: "Harbor booking",
    brand: "Quayside",
    headline: "Berths booked before the boat is tied up.",
    sub: "Online booking and dues for small harbors and marinas.",
    primary: "Start a 14-day trial",
    promise: "Starts a 14-day trial of the harbor desk. No card needed.",
    reassure: "No card needed",
    secondaries: ["Watch the 2-minute tour", "Read the docs", "See a live harbor"],
    plans: [
      { name: "Harbor", price: "$49", per: "/ month", note: "One harbor, up to 300 berths" },
      { name: "Port group", price: "$39", per: "/ harbor / month", note: "Five harbors or more", action: "Talk to sales" },
    ],
    theme: {
      bg: "#e6f0f7",
      fg: "#0d2a3f",
      muted: "#3e5a6e",
      accent: "#0b5e78",
      onAccent: "#ffffff",
      surface: "#ffffff",
      display: slab.style.fontFamily,
      headline: "text-[34px] leading-[1.05] font-bold",
      button: "rounded-md",
    },
  },
  {
    value: "loomline",
    label: "Knitting",
    brand: "Loomline",
    headline: "Every pattern, with a row counter that remembers.",
    sub: "Your patterns, row by row, on your phone or tablet.",
    primary: "Try Maker free for 30 days",
    promise: "Starts 30 days of Maker. Cancel in one tap.",
    reassure: "Cancel in one tap",
    secondaries: ["Browse the patterns", "Gift a subscription", "Read the blog"],
    plans: [
      { name: "Maker", price: "$5", per: "/ month", note: "Unlimited patterns and counters" },
      { name: "Free", price: "$0", per: "", note: "Three patterns at a time", action: "Start free" },
    ],
    theme: {
      bg: "#2b1433",
      fg: "#fbeaf3",
      muted: "#d4b8c8",
      accent: "#ff8fb8",
      onAccent: "#2b1433",
      surface: "#3a1d44",
      display: serif.style.fontFamily,
      headline: "text-[34px] leading-[1.08] font-semibold",
      button: "rounded-full",
    },
  },
  {
    value: "voltyard",
    label: "Fleet charging",
    brand: "Voltyard",
    headline: "Every van charged by 6 a.m., on the cheapest power.",
    sub: "Charge scheduling for depots with 20 to 500 electric vans.",
    primary: "Book a 20-minute demo",
    promise: "You pick a time with a fleet engineer, who runs the numbers on your depot's tariff.",
    reassure: "With a fleet engineer",
    secondaries: ["Calculate your savings", "Watch the tour", "Read the docs"],
    plans: [
      { name: "Depot", price: "$9", per: "/ charger / month", note: "One site, any charger brand" },
      { name: "Network", price: "$7", per: "/ charger / month", note: "Three sites or more", action: "Talk to sales" },
    ],
    theme: {
      bg: "#0b0b0b",
      fg: "#f4f4f4",
      muted: "#a3a3a3",
      accent: "#c6f432",
      onAccent: "#0b0b0b",
      surface: "#1a1a1a",
      display: grotesk.style.fontFamily,
      headline: "text-[30px] leading-[1.02] font-extrabold uppercase tracking-[-0.01em]",
      button: "rounded-none",
    },
  },
];

const VAGUE: Record<string, string> = {
  "Get started":
    "Could be a sign-up form, a tour, a sales call or the pricing page. The reader has to click to find out.",
  "Learn more":
    "More about what? It reads as a way to keep browsing, not a way to begin.",
  "Sign up": "An account form, but for what: a trial, a free plan, a waitlist?",
};

const COUNTS = [
  { value: "1", label: "One" },
  { value: "2", label: "Two" },
  { value: "3", label: "Three" },
  { value: "4", label: "Four" },
] as const;

type Count = (typeof COUNTS)[number]["value"];

function Action({
  children,
  solid,
  theme,
  small,
}: {
  children: React.ReactNode;
  solid: boolean;
  theme: Theme;
  small?: boolean;
}) {
  // A picture of a button, not a real one: nothing on the mock page is meant
  // to be clicked.
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-semibold whitespace-nowrap",
        small ? "h-8 px-3 text-[13px]" : "h-11 px-5 text-[15px]",
        theme.button
      )}
      style={
        solid
          ? { background: theme.accent, color: theme.onAccent }
          : { color: theme.fg, boxShadow: `inset 0 0 0 1px ${theme.muted}` }
      }
    >
      {children}
    </span>
  );
}

export function CallsToActionDemo() {
  const [productValue, setProductValue] = useState(PRODUCTS[0].value);
  const [labelChoice, setLabelChoice] = useState<string>("Get started");
  const [count, setCount] = useState<Count>("3");
  const [squint, setSquint] = useState(false);

  const product = PRODUCTS.find((p) => p.value === productValue)!;
  const t = product.theme;
  const solid = Number(count);
  const specific = labelChoice === "specific";
  const label = specific ? product.primary : labelChoice;
  const promise = specific ? product.promise : VAGUE[labelChoice];
  // Different actions in the hero that wear a solid button. The nav and the
  // recommended plan repeat the primary, and the same action twice doesn't
  // compete with itself. When the hero ties, the pricing block usually does too.
  const planSolid = solid >= 2;

  const labels = [
    ...Object.keys(VAGUE).map((v) => ({ value: v, text: v })),
    { value: "specific", text: product.primary },
  ];

  return (
    <Demo className="gap-6 px-0 sm:px-6">
      <SegmentedControl
        ariaLabel="Product"
        onChange={(value) => setProductValue(value)}
        options={PRODUCTS.map((p) => ({ value: p.value, label: p.label }))}
        value={productValue}
      />

      <div className="w-full max-w-2xl overflow-hidden rounded-xl ring-1 ring-border">
        <div
          aria-label={`${product.brand} landing page mockup`}
          className="flex flex-col gap-8 p-5 transition-[filter] duration-300 motion-reduce:transition-none sm:p-8"
          role="img"
          style={{
            background: t.bg,
            color: t.fg,
            filter: squint ? "blur(6px)" : "none",
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-[17px] font-bold" style={{ fontFamily: t.display }}>
              {product.brand}
            </span>
            <span className="flex items-center gap-5 text-[13px]">
              <span className="max-sm:hidden" style={{ color: t.muted }}>
                Product
              </span>
              <span className="max-sm:hidden" style={{ color: t.muted }}>
                Pricing
              </span>
              <Action small solid theme={t}>
                {label}
              </Action>
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <p className={cn("max-w-[16em]", t.headline)} style={{ fontFamily: t.display }}>
              {product.headline}
            </p>
            <p className="max-w-[36ch] text-[15px] leading-relaxed" style={{ color: t.muted }}>
              {product.sub}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Action solid theme={t}>
                {label}
              </Action>
              {product.secondaries.map((s, i) => (
                <Action key={s} solid={i + 1 < solid} theme={t}>
                  {s}
                </Action>
              ))}
            </div>
            <p className="text-[13px]" style={{ color: t.muted }}>
              {product.reassure}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {product.plans.map((plan, i) => (
              <div
                key={plan.name}
                className="flex flex-col gap-3 rounded-lg p-4"
                style={{
                  background: t.surface,
                  boxShadow: i === 0 ? `inset 0 0 0 2px ${t.accent}` : undefined,
                }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[15px] font-semibold">{plan.name}</span>
                  {i === 0 ? (
                    <span className="text-[12px] font-semibold" style={{ color: t.muted }}>
                      Recommended
                    </span>
                  ) : null}
                </div>
                <p className="flex items-baseline gap-1">
                  <span className="text-[28px] font-bold tabular-nums" style={{ fontFamily: t.display }}>
                    {plan.price}
                  </span>
                  <span className="text-[13px]" style={{ color: t.muted }}>
                    {plan.per}
                  </span>
                </p>
                <p className="text-[13px]" style={{ color: t.muted }}>
                  {plan.note}
                </p>
                <Action solid={i === 0 || planSolid} theme={t}>
                  {i === 0 ? label : "action" in plan ? plan.action : ""}
                </Action>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-2xl flex-col items-center gap-4 px-4 sm:px-0">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">Button label</span>
          <div
            aria-label="Button label"
            className="flex flex-wrap justify-center gap-2"
            role="group"
          >
            {labels.map((l) => (
              <button
                key={l.value}
                aria-pressed={labelChoice === l.value}
                className={cn(
                  "inline-flex h-8 cursor-pointer items-center rounded-full px-3 text-xs font-medium transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 max-sm:h-11",
                  labelChoice === l.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground ring-1 ring-border hover:text-foreground"
                )}
                onClick={() => setLabelChoice(l.value)}
                type="button"
              >
                {l.text}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Solid buttons in the hero</span>
            <SegmentedControl
              ariaLabel="Solid buttons in the hero"
              onChange={setCount}
              options={COUNTS}
              value={count}
            />
          </div>
          <button
            aria-pressed={squint}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 max-sm:h-11",
              squint
                ? "bg-foreground text-background"
                : "text-muted-foreground ring-1 ring-border hover:text-foreground"
            )}
            onClick={() => setSquint((s) => !s)}
            type="button"
          >
            <EyeIcon aria-hidden="true" className="size-4" />
            Squint
          </button>
        </div>

        <dl
          aria-live="polite"
          className="grid w-full max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm"
        >
          <dt className="text-muted-foreground">Promises</dt>
          <dd className={specific ? "text-foreground" : "text-muted-foreground"}>
            {promise}
          </dd>
          <dt className="text-muted-foreground">Leads</dt>
          <dd className={solid === 1 ? "text-foreground" : "text-muted-foreground"}>
            {solid === 1
              ? `“${label}”, everywhere it appears. The other actions are still there, quieter.`
              : `Nothing. ${solid} different actions wear the same solid button, so the reader has to pick one before knowing what any of them does.`}
          </dd>
        </dl>
      </div>
    </Demo>
  );
}
