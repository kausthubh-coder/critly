"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A long page for a fictional product (Stillroom, batch records for craft
// distilleries), drawn as a minimap. The reader reorders its sections against
// the questions a buyer asks, and switches between equal sections and
// sections sized by how much their answer matters.

type SectionKey =
  | "hero"
  | "how"
  | "compare"
  | "features"
  | "proof"
  | "pricing"
  | "faq"
  | "start";

const SECTIONS: Record<
  SectionKey,
  { title: string; question: string; asked: number; weight: number }
> = {
  hero: { title: "Hero", question: "What is it, and is it for me?", asked: 1, weight: 3.2 },
  how: { title: "It at work", question: "Show me it doing my job.", asked: 2, weight: 2.8 },
  compare: { title: "Why switch", question: "Why not keep my spreadsheet?", asked: 3, weight: 1.3 },
  features: { title: "What it covers", question: "Will it handle my excise forms?", asked: 4, weight: 1.6 },
  proof: { title: "Distillers using it", question: "Who else uses it?", asked: 5, weight: 1.2 },
  pricing: { title: "Pricing", question: "What does it cost?", asked: 6, weight: 1.6 },
  faq: { title: "Questions", question: "What if an inspector asks?", asked: 7, weight: 1.1 },
  start: { title: "Start", question: "How do I start?", asked: 8, weight: 0.7 },
};

const TEMPLATE_ORDER: SectionKey[] = [
  "hero",
  "features",
  "proof",
  "faq",
  "pricing",
  "start",
  "compare",
  "how",
];

const QUESTION_ORDER = (Object.keys(SECTIONS) as SectionKey[]).sort(
  (a, b) => SECTIONS[a].asked - SECTIONS[b].asked
);

type Sizing = "equal" | "sized";

const SIZINGS = [
  { value: "equal", label: "Same size, same shape" },
  { value: "sized", label: "Sized by weight" },
] as const;

const MAP_HEIGHT = 480;

export function SectionsFollowQuestionsDemo() {
  const [order, setOrder] = useState<SectionKey[]>(TEMPLATE_ORDER);
  const [sizing, setSizing] = useState<Sizing>("equal");

  function move(index: number, by: -1 | 1) {
    const target = index + by;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  }

  // A section is early when a question asked before it is answered further down.
  const early = order.map((key, index) =>
    order.slice(index + 1).some((later) => SECTIONS[later].asked < SECTIONS[key].asked)
  );
  const inOrder = early.every((value) => !value);
  const firstEarly = early.indexOf(true);
  const blocking =
    firstEarly === -1
      ? null
      : order
          .slice(firstEarly + 1)
          .reduce((min, key) =>
            SECTIONS[key].asked < SECTIONS[min].asked ? key : min
          );

  const weights = order.map((key) => (sizing === "equal" ? 1 : SECTIONS[key].weight));

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <SegmentedControl
        ariaLabel="Section sizing"
        onChange={setSizing}
        options={SIZINGS}
        value={sizing}
      />

      <div className="grid w-full max-w-xl items-start gap-6 sm:grid-cols-[1fr_168px] sm:gap-8">
        <div className="grid gap-3">
          <ol className="grid gap-1" aria-label="Page sections, top to bottom">
            {order.map((key, index) => {
              const section = SECTIONS[key];
              return (
                <li
                  key={key}
                  className="grid grid-cols-[20px_1fr_auto] items-center gap-x-2 py-1"
                >
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {index + 1}
                  </span>
                  <span className="grid min-w-0">
                    <span className="flex flex-wrap items-center gap-x-1.5 text-xs font-medium text-foreground">
                      {section.title}
                      {early[index] ? (
                        <span className="inline-flex items-center gap-0.5 whitespace-nowrap text-amber-700 dark:text-amber-400">
                          <WarningCircleIcon aria-hidden="true" className="size-3.5" weight="fill" />
                          too early
                        </span>
                      ) : null}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {section.question}
                    </span>
                  </span>
                  <span className="flex gap-0.5">
                    <Button
                      aria-label={`Move ${section.title} up`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      size="icon-xs"
                      variant="ghost"
                    >
                      <ArrowUpIcon weight="bold" />
                    </Button>
                    <Button
                      aria-label={`Move ${section.title} down`}
                      disabled={index === order.length - 1}
                      onClick={() => move(index, 1)}
                      size="icon-xs"
                      variant="ghost"
                    >
                      <ArrowDownIcon weight="bold" />
                    </Button>
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setOrder(QUESTION_ORDER)}
              size="sm"
              variant="outline"
            >
              Follow the questions
            </Button>
            <Button
              onClick={() => setOrder(TEMPLATE_ORDER)}
              size="sm"
              variant="ghost"
            >
              Template order
            </Button>
          </div>

          <p
            aria-live="polite"
            className="flex min-h-[3lh] items-start gap-1.5 text-xs text-muted-foreground"
          >
            {inOrder ? (
              <>
                <CheckCircleIcon
                  aria-hidden="true"
                  className="mt-px size-3.5 shrink-0 text-emerald-700 dark:text-emerald-400"
                  weight="fill"
                />
                Each answer arrives just after its question would.
              </>
            ) : (
              <>
                <WarningCircleIcon
                  aria-hidden="true"
                  className="mt-px size-3.5 shrink-0 text-amber-700 dark:text-amber-400"
                  weight="fill"
                />
                <span>
                  {`${SECTIONS[order[firstEarly]].title} answers "${SECTIONS[order[firstEarly]].question}" before the page has answered "${SECTIONS[blocking!].question}"`}
                </span>
              </>
            )}
          </p>
        </div>

        <div
          aria-label="Minimap of the page"
          role="img"
          className="mx-auto flex w-[168px] flex-col gap-[3px] overflow-hidden rounded-lg bg-[#d3e6e1] p-[6px] dark:bg-[#10292c] ring-1 ring-black/10 dark:ring-white/15"
          style={{ height: MAP_HEIGHT }}
        >
          {order.map((key, index) => (
            <div
              key={key}
              className="flex min-h-0 flex-col overflow-hidden rounded-[3px] bg-white/40 dark:bg-white/[0.04] p-[6px]"
              style={{ flex: `${weights[index]} 1 0` }}
            >
              {sizing === "equal" ? <EqualSection /> : <SizedSection kind={key} />}
            </div>
          ))}
        </div>
      </div>

      <span className="text-xs text-muted-foreground">
        {sizing === "equal"
          ? "8 sections, each a heading over three cards, all the same height."
          : "Each section takes the room its answer deserves, and no two share a shape."}
      </span>
    </Demo>
  );
}

const INK = "bg-[#10292c] dark:bg-[#f3ead8]";
const DIM = "bg-[#10292c]/30 dark:bg-[#f3ead8]/35";
const ACCENT = "bg-[#c46a2a] dark:bg-[#e0975a]";

function Bar({ w, h = 3, className = DIM }: { w: string; h?: number; className?: string }) {
  return <span className={cn("block shrink-0 rounded-full", className)} style={{ width: w, height: h }} />;
}

function EqualSection() {
  return (
    <div className="flex h-full flex-col items-center gap-[4px]">
      <Bar className={DIM} h={3} w="50%" />
      <div className="grid w-full flex-1 grid-cols-3 gap-[3px]">
        {[0, 1, 2].map((card) => (
          <span key={card} className="flex flex-col gap-[2px] rounded-[2px] bg-[#10292c]/[0.07] dark:bg-white/[0.06] p-[3px]">
            <Bar h={2} w="80%" />
            <Bar h={2} w="60%" />
          </span>
        ))}
      </div>
    </div>
  );
}

function SizedSection({ kind }: { kind: SectionKey }) {
  switch (kind) {
    case "hero":
      return (
        <div className="flex h-full flex-col gap-[4px]">
          <Bar className={INK} h={7} w="90%" />
          <Bar className={INK} h={7} w="65%" />
          <Bar h={2} w="70%" />
          <Bar className={ACCENT} h={6} w="34%" />
          <span className="mt-[2px] min-h-0 flex-1 rounded-[3px] bg-[#10292c]/75 dark:bg-[#f3ead8]/80 p-[4px]">
            <span className="grid h-full grid-cols-4 gap-[2px]">
              {Array.from({ length: 8 }, (_, cell) => (
                <span key={cell} className={cn("rounded-[1px]", cell === 5 ? ACCENT : "bg-white/30 dark:bg-[#10292c]/25")} />
              ))}
            </span>
          </span>
        </div>
      );
    case "how":
      return (
        <div className="flex h-full flex-col gap-[4px]">
          <Bar className={INK} h={4} w="60%" />
          <span className="min-h-0 flex-1 rounded-[3px] bg-[#10292c]/75 dark:bg-[#f3ead8]/80" />
          <span className="flex justify-between">
            {[0, 1, 2].map((step) => (
              <span key={step} className="flex items-center gap-[3px]">
                <span className={cn("size-[6px] rounded-full", ACCENT)} />
                <Bar h={2} w="24px" />
              </span>
            ))}
          </span>
        </div>
      );
    case "compare":
      return (
        <div className="flex h-full flex-col gap-[3px]">
          <Bar className={INK} h={3} w="55%" />
          {[0, 1, 2].map((row) => (
            <span key={row} className="grid grid-cols-[2fr_1fr_1fr] gap-[3px]">
              <Bar h={2} w="90%" />
              <Bar className={ACCENT} h={2} w="40%" />
              <Bar h={2} w="40%" />
            </span>
          ))}
        </div>
      );
    case "features":
      return (
        <div className="flex h-full flex-col gap-[3px]">
          <Bar className={INK} h={3} w="50%" />
          <span className="grid flex-1 grid-cols-3 grid-rows-2 gap-x-[5px] gap-y-[3px]">
            {Array.from({ length: 6 }, (_, cell) => (
              <span key={cell} className="flex flex-col gap-[2px]">
                <span className={cn("size-[5px] rounded-[1px]", ACCENT)} />
                <Bar h={2} w="90%" />
              </span>
            ))}
          </span>
        </div>
      );
    case "proof":
      return (
        <div className="flex h-full flex-col justify-center gap-[4px]">
          <Bar className={INK} h={5} w="85%" />
          <Bar className={INK} h={5} w="55%" />
          <span className="flex gap-[4px]">
            {[0, 1, 2, 3, 4].map((logo) => (
              <Bar key={logo} h={3} w="16%" />
            ))}
          </span>
        </div>
      );
    case "pricing":
      return (
        <div className="flex h-full flex-col gap-[3px]">
          <Bar className={INK} h={3} w="35%" />
          <span className="grid flex-1 grid-cols-3 gap-[3px]">
            {[0, 1, 2].map((plan) => (
              <span
                key={plan}
                className={cn(
                  "flex flex-col gap-[2px] rounded-[2px] p-[3px]",
                  plan === 1 ? "ring-1 ring-[#c46a2a] dark:ring-[#e0975a]" : "bg-[#10292c]/[0.07] dark:bg-white/[0.06]"
                )}
              >
                <Bar className={INK} h={4} w="60%" />
                <Bar h={2} w="80%" />
                <Bar h={2} w="70%" />
              </span>
            ))}
          </span>
        </div>
      );
    case "faq":
      return (
        <div className="flex h-full flex-col justify-center gap-[4px]">
          {[0, 1, 2, 3].map((row) => (
            <span key={row} className="flex items-center justify-between">
              <Bar h={2} w={`${70 - row * 8}%`} />
              <span className={cn("size-[4px] rounded-full", DIM)} />
            </span>
          ))}
        </div>
      );
    case "start":
      return (
        <div className="flex h-full items-center justify-center gap-[6px]">
          <Bar className={INK} h={3} w="36%" />
          <Bar className={ACCENT} h={6} w="26%" />
        </div>
      );
  }
}
