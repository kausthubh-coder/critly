"use client";

import {
  CheckCircleIcon,
  CheckIcon,
  MinusIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { Bricolage_Grotesque, Young_Serif } from "next/font/google";
import { useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

// One pricing block, written two ways, for two fictional products in two
// different looks. The billing toggle works in both versions: in the clear
// one it changes every price and states the saving in money.

const grotesk = Bricolage_Grotesque({ subsets: ["latin"], weight: ["800"] });
const serif = Young_Serif({ subsets: ["latin"], weight: ["400"] });

type Billing = "monthly" | "yearly";
type Version = "confusing" | "clear";

type Theme = {
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  onAccent: string;
  surface: string;
  line: string;
  display: string;
  heading: string;
};

type Plan = {
  name: string;
  monthly: number;
  yearly: number;
  for: string;
  plus: string | null;
  diffs: string[];
};

type Product = {
  value: string;
  label: string;
  brand: string;
  unit: string;
  plans: [Plan, Plan, Plan];
  recommend: string;
  // The same product, priced the confusing way.
  messy: {
    name: string;
    monthly: number | null;
    yearly: number | null;
    badge?: string;
    has: (0 | 1 | 2)[];
  }[];
  features: string[];
  theme: Theme;
};

const PRODUCTS: Product[] = [
  {
    value: "fieldnote",
    label: "Field surveys",
    brand: "Fieldnote",
    unit: "per person",
    plans: [
      {
        name: "Solo",
        monthly: 12,
        yearly: 10,
        for: "One surveyor",
        plus: null,
        diffs: ["5 projects", "Offline maps", "Export to CSV"],
      },
      {
        name: "Team",
        monthly: 30,
        yearly: 25,
        for: "Crews of 2 to 50",
        plus: "Everything in Solo, plus",
        diffs: ["Unlimited projects", "Shared species lists", "Review and sign-off"],
      },
      {
        name: "Institution",
        monthly: 18,
        yearly: 15,
        for: "25 people or more",
        plus: "Everything in Team, plus",
        diffs: ["Single sign-on", "Data kept in the EU or US", "Pay by invoice"],
      },
    ],
    recommend: "Team",
    messy: [
      { name: "Free", monthly: 0, yearly: 0, has: [1, 1, 0, 0, 0, 0, 0, 0] },
      { name: "Starter", monthly: 12, yearly: 10, has: [1, 1, 1, 0, 0, 0, 0, 0] },
      { name: "Pro", monthly: 30, yearly: 25, badge: "Most popular", has: [2, 1, 1, 1, 1, 0, 0, 0] },
      { name: "Business", monthly: 54, yearly: 54, badge: "Best value", has: [2, 1, 1, 1, 1, 1, 0, 1] },
      { name: "Enterprise", monthly: null, yearly: null, has: [2, 1, 1, 1, 1, 1, 1, 1] },
    ],
    features: [
      "Projects",
      "Offline maps",
      "CSV export",
      "Shared lists",
      "Sign-off",
      "SSO",
      "Data residency",
      "Invoicing",
    ],
    theme: {
      bg: "#fff6d6",
      fg: "#2a2111",
      muted: "#5e5236",
      accent: "#2b50aa",
      onAccent: "#ffffff",
      surface: "#ffffff",
      line: "#e2d6a8",
      display: grotesk.style.fontFamily,
      heading: "text-[28px] leading-[1.05] font-extrabold tracking-[-0.02em]",
    },
  },
  {
    value: "scorebook",
    label: "Orchestra rehearsals",
    brand: "Scorebook",
    unit: "per ensemble",
    plans: [
      {
        name: "Ensemble",
        monthly: 18,
        yearly: 15,
        for: "Up to 30 players",
        plus: null,
        diffs: ["Rehearsal calendar", "Part downloads", "Attendance"],
      },
      {
        name: "Orchestra",
        monthly: 42,
        yearly: 35,
        for: "30 to 120 players",
        plus: "Everything in Ensemble, plus",
        diffs: ["Section seating", "Deputy booking", "Concert programs"],
      },
      {
        name: "Society",
        monthly: 96,
        yearly: 80,
        for: "Several ensembles",
        plus: "Everything in Orchestra, plus",
        diffs: ["Shared music library", "Member dues", "Board reports"],
      },
    ],
    recommend: "Orchestra",
    messy: [
      { name: "Free", monthly: 0, yearly: 0, has: [1, 1, 0, 0, 0, 0, 0, 0] },
      { name: "Basic", monthly: 18, yearly: 15, has: [1, 1, 1, 0, 0, 0, 0, 0] },
      { name: "Plus", monthly: 42, yearly: 35, badge: "Most popular", has: [1, 1, 1, 1, 1, 0, 0, 0] },
      { name: "Premium", monthly: 96, yearly: 96, badge: "Best value", has: [1, 1, 1, 1, 1, 1, 1, 0] },
      { name: "Custom", monthly: null, yearly: null, has: [1, 1, 1, 1, 1, 1, 1, 1] },
    ],
    features: [
      "Calendar",
      "Parts",
      "Attendance",
      "Seating",
      "Deputies",
      "Programs",
      "Library",
      "Dues",
    ],
    theme: {
      bg: "#0e2a2c",
      fg: "#e8f3f1",
      muted: "#a6c2be",
      accent: "#ffb547",
      onAccent: "#0e2a2c",
      surface: "#143a3c",
      line: "#2c5557",
      display: serif.style.fontFamily,
      heading: "text-[28px] leading-[1.1]",
    },
  },
];

const VERSIONS = [
  { value: "confusing", label: "Confusing", icon: WRONG_ICON },
  { value: "clear", label: "Clear", icon: RIGHT_ICON },
] as const;

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

function BillingToggle({
  billing,
  onChange,
  theme,
  yearlyLabel,
}: {
  billing: Billing;
  onChange: (b: Billing) => void;
  theme: Theme;
  yearlyLabel: string;
}) {
  return (
    <div
      aria-label="Billing period"
      className="inline-flex rounded-full p-1"
      role="group"
      style={{ boxShadow: `inset 0 0 0 1px ${theme.line}` }}
    >
      {(["monthly", "yearly"] as const).map((b) => {
        const active = billing === b;
        return (
          <button
            key={b}
            aria-pressed={active}
            className="inline-flex h-8 cursor-pointer items-center rounded-full px-3 text-[13px] font-semibold transition-[background-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 max-sm:h-11"
            onClick={() => onChange(b)}
            style={{
              background: active ? theme.surface : "transparent",
              color: active ? theme.fg : theme.muted,
              boxShadow: active ? `inset 0 0 0 1px ${theme.line}` : undefined,
              outlineColor: theme.accent,
            }}
            type="button"
          >
            {b === "monthly" ? "Monthly" : yearlyLabel}
          </button>
        );
      })}
    </div>
  );
}

function Clear({
  product,
  billing,
  setBilling,
}: {
  product: Product;
  billing: Billing;
  setBilling: (b: Billing) => void;
}) {
  const t = product.theme;
  const yearly = billing === "yearly";
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className={t.heading} style={{ fontFamily: t.display }}>
          {product.brand} pricing
        </p>
        <BillingToggle
          billing={billing}
          onChange={setBilling}
          theme={t}
          yearlyLabel="Yearly, 2 months free"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {product.plans.map((plan) => {
          const recommended = plan.name === product.recommend;
          const price = yearly ? plan.yearly : plan.monthly;
          const saving = (plan.monthly - plan.yearly) * 12;
          return (
            <div
              key={plan.name}
              className="flex flex-col gap-4 rounded-lg p-4"
              style={{
                background: t.surface,
                boxShadow: recommended
                  ? `inset 0 0 0 2px ${t.accent}`
                  : `inset 0 0 0 1px ${t.line}`,
              }}
            >
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-semibold">{plan.name}</span>
                <span
                  className={cn("text-[13px] sm:min-h-[2lh]", recommended && "font-semibold")}
                  style={{ color: recommended ? t.accent : t.muted }}
                >
                  {recommended ? `Recommended for ${plan.for.toLowerCase()}` : plan.for}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[32px] leading-none font-semibold tabular-nums">
                  {usd(price)}
                </span>
                <span className="text-[13px]" style={{ color: t.muted }}>
                  {product.unit} / month
                </span>
                <span className="text-[13px] tabular-nums" style={{ color: t.muted }}>
                  {yearly
                    ? `${usd(plan.yearly * 12)} billed yearly, saves ${usd(saving)}`
                    : "Billed monthly, cancel any time"}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-[13px]">
                {plan.plus ? (
                  <span style={{ color: t.muted }}>{plan.plus}</span>
                ) : null}
                <ul className="flex flex-col gap-1.5">
                  {plan.diffs.map((d) => (
                    <li key={d} className="flex items-start gap-2">
                      <CheckIcon
                        aria-hidden="true"
                        className="mt-0.5 size-3.5 shrink-0"
                        style={{ color: t.accent }}
                        weight="bold"
                      />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Confusing({
  product,
  billing,
  setBilling,
}: {
  product: Product;
  billing: Billing;
  setBilling: (b: Billing) => void;
}) {
  const t = product.theme;
  const yearly = billing === "yearly";
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className={t.heading} style={{ fontFamily: t.display }}>
          Simple, transparent pricing
        </p>
        <BillingToggle
          billing={billing}
          onChange={setBilling}
          theme={t}
          yearlyLabel="Annual (save up to 20%*)"
        />
      </div>

      <div
        aria-label="Plans, scrolls sideways"
        className="overflow-x-auto"
        role="region"
        tabIndex={0}
      >
        <div className="grid min-w-[700px] grid-cols-5 gap-2">
          {product.messy.map((plan) => {
            const price = yearly ? plan.yearly : plan.monthly;
            return (
              <div
                key={plan.name}
                className="flex flex-col gap-3 rounded-lg p-3"
                style={{
                  background: t.surface,
                  boxShadow: plan.badge
                    ? `inset 0 0 0 2px ${t.accent}`
                    : `inset 0 0 0 1px ${t.line}`,
                }}
              >
                <span className="flex min-h-5 items-center">
                  {plan.badge ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
                      style={{ background: t.accent, color: t.onAccent }}
                    >
                      {plan.badge}
                    </span>
                  ) : null}
                </span>
                <span className="text-[14px] font-semibold">{plan.name}</span>
                <span className="text-[26px] leading-none font-semibold">
                  {price === null ? "Let's talk" : usd(price)}
                </span>
                <ul className="flex flex-col gap-1 text-[12px]">
                  {product.features.map((f, i) => (
                    <li key={f} className="flex items-center gap-1.5">
                      {plan.has[i] ? (
                        <CheckIcon
                          aria-label="Included"
                          className="size-3 shrink-0"
                          weight="bold"
                        />
                      ) : (
                        <MinusIcon
                          aria-label="Not included"
                          className="size-3 shrink-0"
                          style={{ color: t.muted }}
                        />
                      )}
                      <span style={{ color: plan.has[i] ? t.fg : t.muted }}>
                        {f}
                        {plan.has[i] === 2 ? "*" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-[12px]" style={{ color: t.muted }}>
        *Discount applies to select plans. Limits may apply.
      </p>
    </div>
  );
}

export function PricingPagesDemo() {
  const [version, setVersion] = useState<Version>("confusing");
  const [productValue, setProductValue] = useState(PRODUCTS[0].value);
  const [billing, setBilling] = useState<Billing>("monthly");

  const product = PRODUCTS.find((p) => p.value === productValue)!;
  const t = product.theme;
  const clear = version === "clear";

  const messyPriced = product.messy.filter((p) => p.monthly !== null);
  const messyChanging = messyPriced.filter((p) => p.monthly !== p.yearly && p.monthly !== 0);
  const facts = clear
    ? [
        { ok: true, text: "Every price says per what and per how long" },
        { ok: true, text: "3 plans, each one somebody should buy" },
        { ok: true, text: `1 recommendation, with who it's for` },
        { ok: true, text: "The yearly toggle changes all 3 prices and states the saving in dollars" },
        { ok: true, text: "Plans stack on a phone, nothing scrolls sideways" },
      ]
    : [
        { ok: false, text: `No price says per what or per how long, and 1 of ${product.messy.length} has no price` },
        { ok: false, text: `${product.messy.length} plans and 8 rows to compare in each` },
        { ok: false, text: "2 badges, so neither one recommends anything" },
        {
          ok: false,
          text: `The yearly toggle changes ${messyChanging.length} of ${messyPriced.length - 1} paid prices, and the saving is "up to"`,
        },
        { ok: false, text: "Scrolls sideways, on a phone and here" },
      ];

  return (
    <Demo className="gap-6 px-0 sm:px-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <SegmentedControl
          ariaLabel="Version"
          onChange={setVersion}
          options={VERSIONS}
          value={version}
        />
        <SegmentedControl
          ariaLabel="Product"
          onChange={(value) => setProductValue(value)}
          options={PRODUCTS.map((p) => ({ value: p.value, label: p.label }))}
          value={productValue}
        />
      </div>

      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl p-5 ring-1 ring-border sm:p-7"
        style={{ background: t.bg, color: t.fg }}
      >
        {clear ? (
          <Clear billing={billing} product={product} setBilling={setBilling} />
        ) : (
          <Confusing billing={billing} product={product} setBilling={setBilling} />
        )}
      </div>

      <ul className="flex w-full max-w-md flex-col gap-1.5 px-4 sm:px-0">
        {facts.map((f) => (
          <li key={f.text} className="flex items-start gap-2 text-sm text-muted-foreground">
            {f.ok ? (
              <CheckCircleIcon
                aria-label="Good"
                className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400"
                weight="fill"
              />
            ) : (
              <XCircleIcon
                aria-label="Problem"
                className="mt-0.5 size-4 shrink-0 text-destructive"
                weight="fill"
              />
            )}
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
    </Demo>
  );
}
