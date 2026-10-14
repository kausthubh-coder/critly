"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { useReducedMotion } from "motion/react";
import { Anton, DM_Serif_Display, Fredoka } from "next/font/google";
import { useState } from "react";

import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

// One face per product that needs one (Tally uses the site's mono), each
// with only the weight it uses.
const rounded = Fredoka({ subsets: ["latin"], weight: "600", display: "swap" });
const poster = Anton({ subsets: ["latin"], weight: "400", display: "swap" });
const serif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/* ------------------------------------------------------------------ */
/* Four fictional budgeting apps                                       */
/* ------------------------------------------------------------------ */

type ProductId = "tally" | "kitty" | "stash" | "fathom";
type SetId = "defaults" | "assets";
type ScreenKind = "home" | "sent";

const PRODUCT_IDS: ProductId[] = ["tally", "kitty", "stash", "fathom"];

const NAMES: Record<ProductId, string> = {
  tally: "Tally",
  kitty: "Kitty",
  stash: "Stash",
  fathom: "Fathom",
};

type Content = {
  label: string;
  amount: string;
  detail: string;
  action: string;
  /** 0 to 1, for whatever the product draws as progress. */
  progress: number;
};

const HOME: Record<ProductId, Content> = {
  tally: {
    label: "You're owed",
    amount: "£42.50",
    detail: "Groceries, 3 housemates",
    action: "Settle up",
    progress: 0.6,
  },
  kitty: {
    label: "Ski trip pot",
    amount: "£1,240",
    detail: "of £2,000, 6 friends",
    action: "Add to the pot",
    progress: 0.62,
  },
  stash: {
    label: "Groceries left",
    amount: "£86",
    detail: "of £300 this month",
    action: "Move money",
    progress: 0.29,
  },
  fathom: {
    label: "Portfolio",
    amount: "£18,420",
    detail: "+4.2% this year",
    action: "Invest",
    progress: 0.7,
  },
};

// The quiz screen is the same for every product, so only the assets can
// tell them apart.
const SENT: Content = {
  label: "Sent",
  amount: "£25.00",
  detail: "to Sam, for Friday",
  action: "Done",
  progress: 1,
};

const QUIZ_ORDER: ProductId[] = ["stash", "tally", "fathom", "kitty"];

const W = 200;
const H = 264;

/* ------------------------------------------------------------------ */
/* Screens                                                             */
/* ------------------------------------------------------------------ */

function DefaultScreen({
  product,
  kind,
}: {
  product: ProductId;
  kind: ScreenKind;
}) {
  const content = kind === "home" ? HOME[product] : SENT;
  return (
    <div
      className="flex h-full flex-col gap-3 p-4 font-sans"
      style={{ backgroundColor: "#FFFFFF", color: "#0F172A" }}
    >
      <div className="flex h-5 items-center gap-1.5">
        <span
          aria-hidden="true"
          className="size-4 rounded-[5px]"
          style={{ backgroundColor: "#2563EB" }}
        />
        {kind === "home" ? (
          <span className="text-[13px] font-semibold">{NAMES[product]}</span>
        ) : null}
      </div>
      <div
        className="flex flex-col gap-1 rounded-[12px] p-3"
        style={{ boxShadow: "inset 0 0 0 1px #E2E8F0" }}
      >
        <span className="text-[11px]" style={{ color: "#64748B" }}>
          {content.label}
        </span>
        <span className="text-[24px] leading-none font-semibold tracking-[-0.02em]">
          {content.amount}
        </span>
        <span className="text-[11px]" style={{ color: "#64748B" }}>
          {content.detail}
        </span>
        <span
          aria-hidden="true"
          className="mt-1.5 h-1.5 overflow-hidden rounded-full"
          style={{ backgroundColor: "#E2E8F0" }}
        >
          <span
            className="block h-full rounded-full"
            style={{
              width: `${content.progress * 100}%`,
              backgroundColor: "#2563EB",
            }}
          />
        </span>
      </div>
      <span
        className="mt-auto grid h-9 place-items-center rounded-[12px] text-[12px] font-medium"
        style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
      >
        {content.action}
      </span>
    </div>
  );
}

/** Four strokes and a strike, the way you keep count on paper. */
function TallyMarks({ count, className }: { count: number; className?: string }) {
  const strokes = Math.min(4, count);
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="3"
      viewBox="0 0 44 32"
    >
      {Array.from({ length: strokes }, (_, i) => (
        <path key={i} d={`M${8 + i * 9} 4 V28`} />
      ))}
      {count >= 5 ? <path d="M3 24 L41 8" /> : null}
    </svg>
  );
}

function TallyScreen({ kind }: { kind: ScreenKind }) {
  const content = kind === "home" ? HOME.tally : SENT;
  return (
    <div
      className="flex h-full flex-col gap-3 p-4 font-mono"
      style={{ backgroundColor: "#0F2A1F", color: "#A7C7B5" }}
    >
      <div className="flex h-5 items-center gap-1.5" style={{ color: "#7CF2B0" }}>
        <TallyMarks className="h-4 w-5" count={5} />
        {kind === "home" ? (
          <span className="text-[13px] font-semibold">tally</span>
        ) : null}
      </div>
      <span className="text-[11px] uppercase">{content.label}</span>
      <span className="text-[26px] leading-none font-semibold" style={{ color: "#7CF2B0" }}>
        {content.amount}
      </span>
      <span className="text-[11px]">{content.detail}</span>
      <div className="flex gap-1.5" style={{ color: "#7CF2B0" }}>
        <TallyMarks className="h-6 w-8" count={5} />
        <TallyMarks className="h-6 w-8" count={kind === "home" ? 3 : 5} />
      </div>
      <span
        className="mt-auto grid h-9 place-items-center rounded-[3px] text-[12px] font-semibold uppercase"
        style={{ backgroundColor: "#7CF2B0", color: "#0F2A1F" }}
      >
        {content.action}
      </span>
    </div>
  );
}

function KittyScreen({ kind }: { kind: ScreenKind }) {
  const content = kind === "home" ? HOME.kitty : SENT;
  const r = 30;
  const length = 2 * Math.PI * r;
  return (
    <div
      className={cn(rounded.className, "flex h-full flex-col items-center gap-2 p-4 text-center")}
      style={{ backgroundColor: "#FF4F9A", color: "#2B0A1E" }}
    >
      <div className="flex h-5 items-center gap-1.5 self-start">
        <span
          aria-hidden="true"
          className="size-4 rounded-full"
          style={{ boxShadow: "inset 0 0 0 3px #2B0A1E" }}
        />
        {kind === "home" ? <span className="text-[15px]">kitty</span> : null}
      </div>
      <span className="relative grid size-[76px] place-items-center">
        <svg aria-hidden="true" className="absolute inset-0 -rotate-90" viewBox="0 0 76 76">
          <circle cx="38" cy="38" fill="none" r={r} stroke="rgb(43 10 30 / 0.2)" strokeWidth="8" />
          <circle
            cx="38"
            cy="38"
            fill="none"
            r={r}
            stroke="#2B0A1E"
            strokeDasharray={length}
            strokeDashoffset={length * (1 - content.progress)}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>
        {kind === "sent" ? (
          <CheckIcon aria-hidden="true" className="size-6" weight="bold" />
        ) : null}
      </span>
      <span className="text-[12px]">{content.label}</span>
      <span className="text-[24px] leading-none">{content.amount}</span>
      <span className="text-[12px]">{content.detail}</span>
      <span
        className="mt-auto grid h-9 w-full place-items-center rounded-full text-[13px]"
        style={{ backgroundColor: "#2B0A1E", color: "#FF4F9A" }}
      >
        {content.action}
      </span>
    </div>
  );
}

function StashScreen({ kind }: { kind: ScreenKind }) {
  const content = kind === "home" ? HOME.stash : SENT;
  return (
    <div
      className="flex h-full flex-col font-sans"
      style={{ backgroundColor: "#FFD400", color: "#000000" }}
    >
      <span
        aria-hidden="true"
        className="h-14 shrink-0"
        style={{
          backgroundColor: "#000000",
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
        }}
      />
      <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4">
        <div className="flex h-5 items-center">
          {kind === "home" ? (
            <span className={cn(poster.className, "text-[16px] uppercase")}>
              Stash
            </span>
          ) : null}
        </div>
        <span className={cn(poster.className, "text-[13px] uppercase")}>
          {content.label}
        </span>
        <span className={cn(poster.className, "text-[40px] leading-none")}>
          {content.amount}
        </span>
        <span className="text-[11px] font-medium">{content.detail}</span>
        <span
          className={cn(
            poster.className,
            "mt-auto grid h-9 place-items-center text-[14px] uppercase"
          )}
          style={{ backgroundColor: "#000000", color: "#FFD400" }}
        >
          {content.action}
        </span>
      </div>
    </div>
  );
}

function FathomScreen({ kind }: { kind: ScreenKind }) {
  const content = kind === "home" ? HOME.fathom : SENT;
  return (
    <div
      className="relative flex h-full flex-col gap-2 p-4 pr-9 font-sans"
      style={{ backgroundColor: "#0B1E3A", color: "#9DB0C8" }}
    >
      <div className="flex h-5 items-center">
        {kind === "home" ? (
          <span className={cn(serif.className, "text-[17px]")} style={{ color: "#E8EEF6" }}>
            Fathom
          </span>
        ) : null}
      </div>
      <span className="text-[11px]">{content.label}</span>
      <span className={cn(serif.className, "text-[30px] leading-none")} style={{ color: "#E8EEF6" }}>
        {content.amount}
      </span>
      <span className="text-[11px]" style={{ color: "#5FD4C8" }}>
        {content.detail}
      </span>
      {/* Depth gauge down the right edge, the marker at how far along it is. */}
      <span aria-hidden="true" className="absolute top-4 right-3 bottom-4 w-3">
        {Array.from({ length: 11 }, (_, i) => (
          <span
            key={i}
            className="absolute right-0 h-px"
            style={{
              top: `${i * 10}%`,
              width: i % 5 === 0 ? 12 : 6,
              backgroundColor: "#9DB0C8",
            }}
          />
        ))}
        <span
          className="absolute right-0 size-2.5 translate-y-[-50%] rotate-45"
          style={{ top: `${content.progress * 100}%`, backgroundColor: "#5FD4C8" }}
        />
      </span>
      <span
        className="mt-auto grid h-9 place-items-center rounded-full text-[12px] font-medium"
        style={{ backgroundColor: "#5FD4C8", color: "#0B1E3A" }}
      >
        {content.action}
      </span>
    </div>
  );
}

function ProductScreen({
  set,
  product,
  kind,
}: {
  set: SetId;
  product: ProductId;
  kind: ScreenKind;
}) {
  if (set === "defaults") return <DefaultScreen kind={kind} product={product} />;
  if (product === "tally") return <TallyScreen kind={kind} />;
  if (product === "kitty") return <KittyScreen kind={kind} />;
  if (product === "stash") return <StashScreen kind={kind} />;
  return <FathomScreen kind={kind} />;
}

/** Drawn at full size, scaled by the `--s` custom property on the wrapper. */
function Scaled({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg ring-1 ring-black/10 dark:ring-white/10",
        className
      )}
      style={{ width: `calc(${W}px * var(--s))`, height: `calc(${H}px * var(--s))` }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: W, height: H, transform: "scale(var(--s))" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Demo                                                                */
/* ------------------------------------------------------------------ */

const SET_OPTIONS = [
  { value: "defaults", label: "Category defaults" },
  { value: "assets", label: "Own assets" },
] as const;

type Phase = "look" | "quiz" | "done";

const PILL =
  "inline-flex h-8 cursor-pointer items-center justify-center rounded-full px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 max-sm:h-11";

export function OwnableAssetsDemo() {
  const [set, setSet] = useState<SetId>("defaults");
  const [phase, setPhase] = useState<Phase>("look");
  const [step, setStep] = useState(0);
  const [guesses, setGuesses] = useState<(ProductId | null)[]>([null, null, null, null]);
  const [scores, setScores] = useState<Partial<Record<SetId, number>>>({});
  const reduceMotion = useReducedMotion();

  const answer = QUIZ_ORDER[step];
  const guess = guesses[step];
  const right = guesses.filter((g, i) => g === QUIZ_ORDER[i]).length;

  function reset(nextSet = set) {
    setSet(nextSet);
    setPhase("look");
    setStep(0);
    setGuesses([null, null, null, null]);
  }

  function choose(product: ProductId) {
    if (guess) return;
    const next = [...guesses];
    next[step] = product;
    setGuesses(next);
  }

  function advance() {
    if (step < QUIZ_ORDER.length - 1) {
      setStep(step + 1);
      return;
    }
    setScores((prev) => ({ ...prev, [set]: right }));
    setPhase("done");
  }

  const other: SetId = set === "defaults" ? "assets" : "defaults";

  return (
    <Demo className="items-stretch gap-6 px-4 sm:px-6">
      <p className="min-h-10 text-center text-[13px] leading-snug text-foreground">
        {phase === "look"
          ? "Four budgeting apps. Look at each one, then take the names off."
          : phase === "quiz"
            ? `Names off, and a screen you haven't seen. ${step + 1} of 4: which app is this?`
            : set === "defaults"
              ? `${right} of 4. With the category defaults the four screens were identical, so only the name told them apart.`
              : `${right} of 4. Each app kept its shape, color and type on a screen you hadn't seen.`}
      </p>

      {phase === "look" ? (
        <div className="grid grid-cols-2 justify-items-center gap-3 [--s:0.8] sm:grid-cols-4 sm:[--s:0.6]">
          {PRODUCT_IDS.map((product) => (
            <Scaled key={product} className="">
              <ProductScreen kind="home" product={product} set={set} />
            </Scaled>
          ))}
        </div>
      ) : null}

      {phase === "quiz" ? (
        <div className="flex flex-col items-center gap-4">
          <Scaled className="[--s:1]">
            <ProductScreen kind="sent" product={answer} set={set} />
          </Scaled>
          <div
            aria-label="Which app is this?"
            className="grid w-full max-w-sm grid-cols-2 gap-2 sm:grid-cols-4"
            role="group"
          >
            {PRODUCT_IDS.map((product) => {
              const picked = guess === product;
              const correct = guess !== null && product === answer;
              return (
                <button
                  key={product}
                  aria-pressed={picked}
                  className={cn(
                    PILL,
                    !reduceMotion && "transition-colors duration-150",
                    correct
                      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                      : picked
                        ? "bg-red-500/15 text-red-800 dark:text-red-200"
                        : "bg-muted text-foreground hover:bg-muted/70",
                    guess !== null && !picked && !correct && "text-muted-foreground"
                  )}
                  disabled={guess !== null && !picked && !correct}
                  onClick={() => choose(product)}
                  type="button"
                >
                  {NAMES[product]}
                </button>
              );
            })}
          </div>
          <p className="min-h-5 text-[13px] text-foreground" aria-live="polite">
            {guess === null
              ? ""
              : guess === answer
                ? `Right, that's ${NAMES[answer]}.`
                : `That was ${NAMES[answer]}.`}
          </p>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="flex flex-col items-center gap-2 text-[13px] text-foreground">
          {SET_OPTIONS.map((option) => (
            <span key={option.value} className="flex w-48 justify-between">
              <span className="text-muted-foreground">{option.label}</span>
              <span className="tabular-nums">
                {scores[option.value] === undefined
                  ? "not tried"
                  : `${scores[option.value]} of 4`}
              </span>
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <SegmentedControl
          ariaLabel="What the four apps are built from"
          onChange={(value) => reset(value)}
          options={SET_OPTIONS}
          value={set}
        />
        {phase === "look" ? (
          <button
            className={cn(PILL, "bg-foreground text-background hover:bg-foreground/90")}
            onClick={() => setPhase("quiz")}
            type="button"
          >
            Take the names off
          </button>
        ) : null}
        {phase === "quiz" ? (
          <button
            className={cn(
              PILL,
              "bg-foreground text-background hover:bg-foreground/90 disabled:cursor-default disabled:opacity-40"
            )}
            disabled={guess === null}
            onClick={advance}
            type="button"
          >
            {step < QUIZ_ORDER.length - 1 ? "Next" : "See the score"}
          </button>
        ) : null}
        {phase === "done" ? (
          <button
            className={cn(PILL, "bg-foreground text-background hover:bg-foreground/90")}
            onClick={() => reset(scores[other] === undefined ? other : set)}
            type="button"
          >
            {scores[other] === undefined
              ? `Try ${other === "assets" ? "own assets" : "category defaults"}`
              : "Look again"}
          </button>
        ) : null}
      </div>
    </Demo>
  );
}
