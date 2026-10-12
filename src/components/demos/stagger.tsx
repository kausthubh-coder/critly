"use client";

import { ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { useInView } from "motion/react";
import { useRef, useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const ITEM_MS = 360;

const INBOX = [
  { from: "Linear", domain: "linear.app", subject: "Cycle 42 starts Monday", time: "9:12" },
  { from: "Vercel", domain: "vercel.com", subject: "Deployment ready for review", time: "8:47" },
  { from: "Raycast", domain: "raycast.com", subject: "Your extension was approved", time: "8:20" },
  { from: "Notion", domain: "notion.so", subject: "Weekly digest for Design", time: "7:55" },
  { from: "Figma", domain: "figma.com", subject: "Ana left 3 comments", time: "7:31" },
] as const;

const LONG_LIST = [
  ...INBOX,
  { from: "GitHub", domain: "github.com", subject: "PR #812 approved", time: "7:04" },
  { from: "Stripe", domain: "stripe.com", subject: "Payout of $4,210 sent", time: "6:48" },
  { from: "Slack", domain: "slack.com", subject: "New message in #design", time: "6:30" },
  { from: "Loom", domain: "loom.com", subject: "Sam shared a recording", time: "6:02" },
  { from: "Resend", domain: "resend.com", subject: "Domain verified", time: "5:40" },
] as const;

type Mail = (typeof LONG_LIST)[number];

function getSliderValue(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : (value as number);
}

// Reduced motion keeps the stagger, which is the point of every demo here,
// but drops the 8px rise and only fades.
function StaggerStyles() {
  return (
    <style>{`
      @keyframes craft-stagger-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes craft-stagger-fade {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        .craft-stagger-row { animation-name: craft-stagger-fade !important; }
      }
    `}</style>
  );
}

/**
 * Holds the rows at their first frame until the list scrolls into view, so
 * the first run is one the reader actually sees. `run` restarts it.
 */
function useStaggerRun() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [run, setRun] = useState(0);
  const replay = () => setRun((n) => n + 1);
  return { ref, run, replay, paused: !inView };
}

function MailRow({
  mail,
  delay,
  paused,
  compact,
}: {
  mail: Mail;
  delay: number;
  paused: boolean;
  compact?: boolean;
}) {
  return (
    <li
      className={cn(
        "craft-stagger-row flex items-center gap-2.5 px-3",
        compact ? "py-1.5" : "py-2"
      )}
      style={{
        animation: `craft-stagger-in ${ITEM_MS}ms ${EASE_OUT} ${delay}ms both`,
        animationPlayState: paused ? "paused" : "running",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="size-4 shrink-0 rounded-sm"
        height={16}
        src={`https://www.google.com/s2/favicons?domain=${mail.domain}&sz=64`}
        width={16}
      />
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-xs font-medium text-foreground">
          {mail.from}
        </span>
        {!compact && (
          <span className="truncate text-[11px] text-muted-foreground">
            {mail.subject}
          </span>
        )}
      </span>
      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
        {mail.time}
      </span>
    </li>
  );
}

function MailList({
  items,
  step,
  run,
  paused,
  compact,
  className,
}: {
  items: readonly Mail[];
  step: number;
  run: number;
  paused: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <ul
      key={run}
      className={cn(
        "w-full divide-y divide-[#E7E7E7] rounded-xl bg-card py-1 shadow-(--custom-shadow) dark:divide-[#1E1E1E]",
        className
      )}
    >
      {items.map((mail, index) => (
        <MailRow
          key={mail.from}
          compact={compact}
          delay={index * step}
          mail={mail}
          paused={paused}
        />
      ))}
    </ul>
  );
}

function ReplayButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} variant="secondary">
      <ArrowsClockwiseIcon aria-hidden="true" weight="bold" />
      Replay
    </Button>
  );
}

export function StaggerDemo() {
  const { ref, run, replay, paused } = useStaggerRun();
  const [step, setStep] = useState(40);

  return (
    <Demo className="gap-8">
      <StaggerStyles />
      <div ref={ref} className="w-full max-w-xs">
        <MailList items={INBOX} paused={paused} run={run} step={step} />
      </div>

      <div className="flex w-full max-w-xs flex-col items-center gap-5">
        <label className="grid w-full gap-2.5">
          <span className="flex justify-between text-xs text-muted-foreground">
            Delay between items
            <span className="tabular-nums text-foreground">{step}ms</span>
          </span>
          <Slider
            aria-label="Delay between items"
            max={120}
            min={0}
            onValueChange={(value) => {
              setStep(getSliderValue(value));
              replay();
            }}
            step={10}
            value={[step]}
          />
        </label>
        <ReplayButton onClick={replay} />
      </div>
    </Demo>
  );
}

export function StaggerCompareDemo() {
  const { ref, run, replay, paused } = useStaggerRun();

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <StaggerStyles />
      <div ref={ref} className="flex w-full justify-center">
        <Compare>
          <CompareItem verdict="wrong" label="Block">
            <MailList compact items={INBOX} paused={paused} run={run} step={0} />
          </CompareItem>
          <CompareItem verdict="right" label="40ms stagger">
            <MailList
              compact
              items={INBOX}
              paused={paused}
              run={run}
              step={40}
            />
          </CompareItem>
        </Compare>
      </div>
      <ReplayButton onClick={replay} />
    </Demo>
  );
}

const CAP_MODES = [
  { value: "fixed", label: "Fixed step" },
  { value: "capped", label: "Capped total" },
] as const;
type CapMode = (typeof CAP_MODES)[number]["value"];

const FIXED_STEP = 60;
const TOTAL_CAP = 300;

export function StaggerCapDemo() {
  const { ref, run, replay, paused } = useStaggerRun();
  const [mode, setMode] = useState<CapMode>("fixed");
  const step =
    mode === "fixed" ? FIXED_STEP : TOTAL_CAP / (LONG_LIST.length - 1);
  const lastStart = Math.round(step * (LONG_LIST.length - 1));

  return (
    <Demo className="gap-8">
      <StaggerStyles />
      <div ref={ref} className="flex w-full max-w-xs flex-col items-end gap-2">
        <MailList
          compact
          items={LONG_LIST}
          paused={paused}
          run={run}
          step={step}
        />
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {Math.round(step)}ms step, last row starts at {lastStart}ms
        </span>
      </div>

      <div className="flex flex-col items-center gap-5">
        <SegmentedControl
          ariaLabel="Stagger strategy"
          onChange={(value) => {
            setMode(value);
            replay();
          }}
          options={CAP_MODES}
          value={mode}
        />
        <ReplayButton onClick={replay} />
      </div>
    </Demo>
  );
}
