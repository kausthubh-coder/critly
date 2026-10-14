"use client";

import {
  CheckCircleIcon,
  CheckIcon,
  CircleHalfIcon,
  MinusIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { IBM_Plex_Mono, Nunito, Zilla_Slab } from "next/font/google";
import { useState } from "react";

import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

// Three fictional products with three unrelated looks, so the demo is about
// the words: the look stays put while the headline changes.

const slab = Zilla_Slab({ subsets: ["latin"], weight: "600" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: "500" });
const rounded = Nunito({ subsets: ["latin"], weight: "800" });

type Verdict = "yes" | "partly" | "no";
type Line = "for" | "instead" | "only" | "so";

type Draft = {
  headline: string;
  sub: string;
  uses: Line[];
  picture: [Verdict, string];
  falsify: [Verdict, string];
  only: [Verdict, string];
  /** What happens when the competitor's name goes in front of it. */
  swapped: string;
};

type Product = {
  name: string;
  rival: string;
  look: {
    font: string;
    ground: string;
    ink: string;
    mark: string;
    headline: string;
  };
  message: Record<Line, string>;
  drafts: [Draft, Draft, Draft];
};

const PRODUCTS = {
  quayside: {
    name: "Quayside",
    rival: "Harborly",
    look: {
      font: slab.className,
      ground: "bg-[#0b2545]",
      ink: "text-[#f1f4f8]",
      mark: "text-[#ffd23f]",
      headline: "text-[26px] leading-[1.08] sm:text-[34px]",
    },
    message: {
      for: "Harbormasters at marinas under 200 berths",
      instead: "A paper berth chart and the phone",
      only: "Matches each boat's length to a berth that fits",
      so: "Visiting boats book at 2am without calling",
    },
    drafts: [
      {
        headline: "The all-in-one platform for modern marinas.",
        sub: "Streamline operations and delight your customers.",
        uses: [],
        picture: ["no", "No boat, no berth, no person. A platform isn't a thing you can see."],
        falsify: ["no", "Nothing here could be checked and found untrue."],
        only: ["no", "Every marina tool says this."],
        swapped: "Still reads true. It's Harborly's headline too.",
      },
      {
        headline: "Berth booking software for small marinas.",
        sub: "Manage bookings, payments and your berth plan in one place.",
        uses: ["for"],
        picture: ["yes", "A marina and a booking. You know what it is now."],
        falsify: ["partly", "It is berth booking software or it isn't. That's all it risks."],
        only: ["no", "Harborly sells berth booking to small marinas too."],
        swapped: "Still reads true. It names the category, not the difference.",
      },
      {
        headline: "Boats book a berth that fits their length, at 2am, without calling you.",
        sub: "Berth booking for marinas under 200 berths. It replaces the paper chart and the phone.",
        uses: ["for", "instead", "only", "so"],
        picture: ["yes", "A boat, a berth that fits it, a phone that doesn't ring."],
        falsify: ["yes", "Either a boater can book at 2am with no call, or they can't."],
        only: ["yes", "Harborly books by date and leaves the fitting to you."],
        swapped: "Now false. Harborly books by date, so the line stops being true.",
      },
    ],
  },
  switchyard: {
    name: "Switchyard",
    rival: "Shiftwell",
    look: {
      font: mono.className,
      ground: "bg-[#0d1110]",
      ink: "text-[#d7f5e3]",
      mark: "text-[#3ddc84]",
      headline: "text-[20px] leading-[1.18] sm:text-[26px]",
    },
    message: {
      for: "Teams running Postgres in production",
      instead: "Hand-run SQL scripts and a nervous deploy",
      only: "Rehearses each migration on a copy of production",
      so: "A change that would lock a table fails in rehearsal",
    },
    drafts: [
      {
        headline: "Ship faster with confidence.",
        sub: "The developer platform for the next generation of builders.",
        uses: [],
        picture: ["no", "Faster than what, at what? There's nothing to see."],
        falsify: ["no", "Confidence can't be measured on this page."],
        only: ["no", "Every dev tool has shipped this headline."],
        swapped: "Still reads true. It's Shiftwell's headline too.",
      },
      {
        headline: "Database migrations for modern teams.",
        sub: "Version, review and deploy schema changes with ease.",
        uses: [],
        picture: ["partly", "You can picture a migration if you already know what one is."],
        falsify: ["partly", "It is a migration tool. \"Modern\" and \"ease\" risk nothing."],
        only: ["no", "Shiftwell does migrations for modern teams."],
        swapped: "Still reads true. Two products, one sentence.",
      },
      {
        headline: "Every migration runs on a copy of production before it touches the real one.",
        sub: "Postgres migrations for teams that hand-run SQL today. It flags the change that would lock a table.",
        uses: ["for", "instead", "only", "so"],
        picture: ["yes", "Two databases, one a copy. The change hits the copy first."],
        falsify: ["yes", "It either rehearses on a copy or it doesn't."],
        only: ["yes", "Shiftwell applies changes straight to the database."],
        swapped: "Now false. Shiftwell has no rehearsal step.",
      },
    ],
  },
  crumb: {
    name: "Crumb Ledger",
    rival: "Tallybook",
    look: {
      font: rounded.className,
      ground: "bg-[#ffd9e2]",
      ink: "text-[#3b1f14]",
      mark: "text-[#3b1f14]",
      headline: "text-[26px] leading-[1.1] sm:text-[34px]",
    },
    message: {
      for: "Owners of bakeries with one to five shops",
      instead: "A spreadsheet and the accountant's yearly call",
      only: "Prices every recipe from your supplier invoices",
      so: "You see which bakes lose money, this week",
    },
    drafts: [
      {
        headline: "Accounting that grows with your business.",
        sub: "Powerful tools to help you take control of your finances.",
        uses: [],
        picture: ["no", "No bakery, no loaf, no number."],
        falsify: ["no", "\"Grows with you\" can't be wrong."],
        only: ["no", "Any accounting product could print it."],
        swapped: "Still reads true. It's Tallybook's headline too.",
      },
      {
        headline: "Simple bookkeeping for food businesses.",
        sub: "Invoices, expenses and payroll, all in one easy app.",
        uses: ["for"],
        picture: ["partly", "Food, roughly. Bookkeeping, not really."],
        falsify: ["partly", "\"Simple\" is an opinion. \"Food businesses\" is a start."],
        only: ["no", "Tallybook has a food and drink plan."],
        swapped: "Still reads true. Tallybook could say it tomorrow.",
      },
      {
        headline: "Cost every loaf to the gram of flour, and see which bakes lose money.",
        sub: "Bookkeeping for bakeries. It reads your supplier invoices, so a rise in butter shows on the croissant.",
        uses: ["for", "instead", "only", "so"],
        picture: ["yes", "A loaf, a gram of flour, a bake in the red."],
        falsify: ["yes", "It either costs recipes by the gram or it doesn't."],
        only: ["yes", "Tallybook tracks sales and expenses, not recipes."],
        swapped: "Now false. Tallybook doesn't know what's in a loaf.",
      },
    ],
  },
} satisfies Record<string, Product>;

type ProductKey = keyof typeof PRODUCTS;

const PRODUCT_OPTIONS = [
  { value: "quayside", label: "Quayside" },
  { value: "switchyard", label: "Switchyard" },
  { value: "crumb", label: "Crumb Ledger" },
] as const;

const DRAFT_OPTIONS = [
  { value: "0", label: "Draft 1" },
  { value: "1", label: "Draft 2" },
  { value: "2", label: "Draft 3" },
] as const;

const LINE_LABELS: Record<Line, string> = {
  for: "For",
  instead: "Instead of",
  only: "Only",
  so: "So",
};

const VERDICT_ICON = {
  yes: (
    <CheckCircleIcon
      aria-hidden="true"
      className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
      weight="fill"
    />
  ),
  partly: (
    <CircleHalfIcon
      aria-hidden="true"
      className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
      weight="fill"
    />
  ),
  no: (
    <XCircleIcon
      aria-hidden="true"
      className="size-4 shrink-0 text-destructive"
      weight="fill"
    />
  ),
} as const;

const VERDICT_WORD = { yes: "Yes", partly: "Partly", no: "No" } as const;

export function MessageFirstDemo() {
  const [productKey, setProductKey] = useState<ProductKey>("quayside");
  const [draftIndex, setDraftIndex] = useState<"0" | "1" | "2">("0");
  const [swapped, setSwapped] = useState(false);

  const product: Product = PRODUCTS[productKey];
  const draft = product.drafts[Number(draftIndex)];
  const { look } = product;
  const shownName = swapped ? product.rival : product.name;
  const stillTrue = draft.only[0] !== "yes";

  const tests: { question: string; result: [Verdict, string] }[] = [
    { question: "Can you picture it?", result: draft.picture },
    { question: "Could it turn out false?", result: draft.falsify },
    {
      question: "Could nobody else say it?",
      result: swapped
        ? [stillTrue ? "no" : "yes", draft.swapped]
        : draft.only,
    },
  ];

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <SegmentedControl
          ariaLabel="Product"
          onChange={(value) => {
            setProductKey(value);
            setSwapped(false);
          }}
          options={PRODUCT_OPTIONS}
          value={productKey}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <SegmentedControl
          ariaLabel="Headline draft"
          onChange={setDraftIndex}
          options={DRAFT_OPTIONS}
          value={draftIndex}
        />
        <button
          aria-pressed={swapped}
          className={cn(
            "inline-flex h-8 cursor-pointer items-center rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground max-sm:h-11",
            swapped
              ? "bg-foreground text-background"
              : "bg-muted text-foreground hover:bg-muted/70"
          )}
          onClick={() => setSwapped((value) => !value)}
          type="button"
        >
          Swap in {product.rival}
        </button>
      </div>

      <div
        className={cn(
          "flex min-h-[300px] w-full max-w-xl flex-col justify-center gap-4 rounded-xl px-5 py-7 ring-1 ring-black/5 sm:min-h-[280px] sm:px-8 dark:ring-white/10",
          look.ground,
          look.ink,
          look.font
        )}
      >
        <span className={cn("text-[15px]", look.mark)}>
          {shownName}
          {swapped ? (
            <span className="sr-only"> (the competitor&apos;s name)</span>
          ) : null}
        </span>
        <p className={cn("max-w-[24ch] text-balance", look.headline)}>
          {draft.headline}
        </p>
        <p className="max-w-[46ch] text-[15px] leading-snug opacity-85">
          {draft.sub}
        </p>
      </div>


      <div className="grid w-full max-w-xl gap-5 sm:grid-cols-[1fr_1.15fr] sm:gap-8">
        <div className="grid content-start gap-2">
          <span className="text-xs font-medium text-foreground">
            The message, written first
          </span>
          <dl className="grid gap-1.5 text-xs">
            {(Object.keys(LINE_LABELS) as Line[]).map((line) => {
              const used = draft.uses.includes(line);
              return (
                <div key={line} className="grid grid-cols-[68px_1fr] gap-2">
                  <dt
                    className={cn(
                      "font-medium",
                      used ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {LINE_LABELS[line]}
                  </dt>
                  <dd
                    className={cn(
                      "flex gap-1.5",
                      used ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    <span className="mt-px w-3 shrink-0" aria-hidden="true">
                      {used ? (
                        <CheckIcon className="size-3 text-emerald-700 dark:text-emerald-400" weight="bold" />
                      ) : (
                        <MinusIcon className="size-3 text-muted-foreground/60" weight="bold" />
                      )}
                    </span>
                    <span>
                      {product.message[line]}
                      <span className="sr-only">{used ? " (in this draft)" : " (not in this draft)"}</span>
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
          <span className="text-xs text-muted-foreground">
            Ticked lines made it into this draft.
          </span>
        </div>

        <ul className="grid content-start gap-3" aria-live="polite">
          {tests.map(({ question, result: [verdict, reason] }) => (
            <li key={question} className="grid grid-cols-[16px_1fr] gap-x-2">
              <span className="pt-px">{VERDICT_ICON[verdict]}</span>
              <span className="text-xs font-medium text-foreground">
                {question}{" "}
                <span className="text-muted-foreground">
                  {VERDICT_WORD[verdict]}
                </span>
              </span>
              <span className="col-start-2 text-xs text-muted-foreground">
                {reason}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Demo>
  );
}
