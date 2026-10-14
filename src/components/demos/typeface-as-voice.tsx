"use client";

import {
  CheckCircleIcon,
  MinusCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import {
  Barlow_Condensed,
  DM_Serif_Display,
  Nunito,
  Zilla_Slab,
} from "next/font/google";
import { useState } from "react";

import { Demo } from "@/components/app/demo";
import { cn } from "@/lib/utils";

// Four faces load here, one weight each. Grotesk (Inter) and mono
// (JetBrains Mono) are already on the site.
const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400" });
const slab = Zilla_Slab({ subsets: ["latin"], weight: "700" });
const rounded = Nunito({ subsets: ["latin"], weight: "800" });
const condensed = Barlow_Condensed({ subsets: ["latin"], weight: "700" });

type FaceId = "grotesk" | "serif" | "slab" | "rounded" | "condensed" | "mono";

type Face = {
  id: FaceId;
  label: string;
  className: string;
  /** Headline size. Condensed faces run small and mono runs wide. */
  size?: string;
  style?: React.CSSProperties;
  says: string;
};

const FACES: Face[] = [
  {
    id: "grotesk",
    label: "Grotesk",
    className: "font-sans font-semibold tracking-[-0.025em]",
    says: "Neutral, current, competent. It says little on its own: right for a tool that should stay out of the way, thin for a brand.",
  },
  {
    id: "serif",
    label: "Serif",
    className: serif.className,
    says: "Literary, established, unhurried. It sounds like print and long reading.",
  },
  {
    id: "slab",
    label: "Slab",
    className: slab.className,
    says: "Sturdy, practical, a little old-fashioned. It sounds like stamped labels, catalogues and workshop signs.",
  },
  {
    id: "rounded",
    label: "Rounded",
    className: rounded.className,
    style: { letterSpacing: "-0.01em" },
    says: "Soft, warm, safe. It sounds like it's for everyone, and sometimes like it's for children.",
  },
  {
    id: "condensed",
    label: "Condensed",
    className: condensed.className,
    size: "text-[38px] sm:text-[48px]",
    style: { letterSpacing: "0.005em" },
    says: "Loud, urgent, packed tight. It sounds like a poster, a scoreboard or a departures board.",
  },
  {
    id: "mono",
    label: "Mono",
    className: "font-mono font-semibold tracking-[-0.03em]",
    size: "text-[27px] sm:text-[34px]",
    says: "Exact, technical, machine-made. It sounds like a terminal, a receipt or a spec sheet.",
  },
];

type Fit = "fits" | "maybe" | "fights";

type Brief = {
  id: string;
  label: string;
  product: string;
  headline: string;
  body: string;
  action: string;
  wants: string;
  fit: Record<FaceId, Fit>;
};

const BRIEFS: Brief[] = [
  {
    id: "seeds",
    label: "Seed catalogue",
    product: "Furrow Seed Co.",
    headline: "Heirloom seed, sold by the ounce.",
    body: "Forty-two bean varieties, each grown on our own rows before it ships.",
    action: "Browse beans",
    wants: "sturdy, practical, rooted in old catalogues",
    fit: {
      grotesk: "maybe",
      serif: "maybe",
      slab: "fits",
      rounded: "fights",
      condensed: "maybe",
      mono: "fights",
    },
  },
  {
    id: "dentist",
    label: "Kids' dentist",
    product: "Little Molars",
    headline: "Brave teeth get a sticker.",
    body: "Book a check-up in two taps. Most visits take twenty minutes.",
    action: "Book a visit",
    wants: "gentle and safe, to a nervous child and a busy parent",
    fit: {
      grotesk: "maybe",
      serif: "fights",
      slab: "maybe",
      rounded: "fits",
      condensed: "fights",
      mono: "fights",
    },
  },
  {
    id: "deploy",
    label: "Deploy tool",
    product: "Shipyard CLI",
    headline: "Deploy from one command.",
    body: "Push a branch and get a preview link before the tests finish.",
    action: "Read the docs",
    wants: "exact, technical, at home in a terminal",
    fit: {
      grotesk: "maybe",
      serif: "fights",
      slab: "maybe",
      rounded: "fights",
      condensed: "maybe",
      mono: "fits",
    },
  },
  {
    id: "fiction",
    label: "Fiction quarterly",
    product: "Margins Quarterly",
    headline: "Twelve stories nobody else would print.",
    body: "Every issue is read cover to cover by two editors before a word is cut.",
    action: "Subscribe",
    wants: "literary, considered, in no hurry",
    fit: {
      grotesk: "maybe",
      serif: "fits",
      slab: "maybe",
      rounded: "fights",
      condensed: "fights",
      mono: "maybe",
    },
  },
  {
    id: "tickets",
    label: "Match tickets",
    product: "Terrace",
    headline: "Saturday, 3pm. North Stand.",
    body: "Season ticket holders get first pick until Thursday noon.",
    action: "Pick seats",
    wants: "loud and quick, about the crowd and the clock",
    fit: {
      grotesk: "maybe",
      serif: "fights",
      slab: "maybe",
      rounded: "fights",
      condensed: "fits",
      mono: "fights",
    },
  },
  {
    id: "payroll",
    label: "Payroll",
    product: "Tally Payroll",
    headline: "Payroll that closes on time.",
    body: "Run every employee in one pass, with each figure checked against last month.",
    action: "Start a run",
    wants: "calm and precise, out of the way of the numbers",
    fit: {
      grotesk: "fits",
      serif: "maybe",
      slab: "maybe",
      rounded: "fights",
      condensed: "fights",
      mono: "maybe",
    },
  },
];

const FIT_COPY: Record<Fit, { label: string; icon: React.ReactNode }> = {
  fits: {
    label: "Fits this brief",
    icon: <CheckCircleIcon aria-hidden="true" className="size-4" weight="fill" />,
  },
  maybe: {
    label: "Could work, says less",
    icon: <MinusCircleIcon aria-hidden="true" className="size-4" />,
  },
  fights: {
    label: "Says the wrong thing here",
    icon: <XCircleIcon aria-hidden="true" className="size-4" />,
  },
};

const CHIP =
  "inline-flex h-8 cursor-pointer items-center rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 max-sm:h-11";

function Chip({
  active,
  children,
  className,
  onClick,
  style,
}: {
  active: boolean;
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        CHIP,
        active
          ? "bg-primary/7 text-foreground shadow-(--custom-shadow) dark:bg-muted"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={onClick}
      style={style}
      type="button"
    >
      {children}
    </button>
  );
}

export function TypefaceVoiceDemo() {
  const [briefId, setBriefId] = useState("seeds");
  const [faceId, setFaceId] = useState<FaceId>("grotesk");

  const brief = BRIEFS.find((b) => b.id === briefId) ?? BRIEFS[0];
  const face = FACES.find((f) => f.id === faceId) ?? FACES[0];
  const fit = FIT_COPY[brief.fit[face.id]];

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="grid w-full max-w-lg gap-2">
        <span className="text-xs text-muted-foreground" id="tv-brief">
          Brief
        </span>
        <div
          aria-labelledby="tv-brief"
          className="-ml-3 flex flex-wrap gap-1"
          role="group"
        >
          {BRIEFS.map((b) => (
            <Chip
              key={b.id}
              active={b.id === brief.id}
              onClick={() => setBriefId(b.id)}
            >
              {b.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-(--custom-shadow) sm:p-8">
        <span
          className={cn("block text-sm text-foreground", face.className)}
          style={face.style}
        >
          {brief.product}
        </span>
        <div className="mt-5 flex min-h-[6.5rem] items-end sm:min-h-[6.5rem]">
          <p
            className={cn(
              face.size ?? "text-[32px] sm:text-[40px]",
              "leading-[1.08] text-foreground [text-wrap:balance]",
              face.className
            )}
            style={face.style}
          >
            {brief.headline}
          </p>
        </div>
        <p className="mt-4 min-h-12 max-w-sm font-sans text-sm leading-6 text-muted-foreground">
          {brief.body}
        </p>
        <span className="mt-6 inline-flex h-9 items-center rounded-lg bg-primary px-4 font-sans text-sm font-medium text-primary-foreground">
          {brief.action}
        </span>
      </div>

      <div className="grid w-full max-w-lg gap-2">
        <span className="text-xs text-muted-foreground" id="tv-face">
          Headline face
        </span>
        <div
          aria-labelledby="tv-face"
          className="-ml-3 flex flex-wrap gap-1"
          role="group"
        >
          {FACES.map((f) => (
            <Chip
              key={f.id}
              active={f.id === face.id}
              className={cn("text-[13px]", f.className)}
              onClick={() => setFaceId(f.id)}
              style={f.style}
            >
              {f.label}
            </Chip>
          ))}
        </div>
      </div>

      <dl
        aria-live="polite"
        className="grid w-full max-w-lg gap-3 text-sm leading-6 sm:min-h-36"
      >
        <div>
          <dt className="text-xs text-muted-foreground">
            {face.label} says
          </dt>
          <dd className="text-foreground">{face.says}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">This brief wants</dt>
          <dd className="text-foreground">{brief.wants}</dd>
        </div>
        <div className="flex items-center gap-2 font-medium text-foreground">
          {fit.icon}
          {fit.label}
        </div>
      </dl>
    </Demo>
  );
}
