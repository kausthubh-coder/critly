"use client";

import { useReducedMotion } from "motion/react";
import { Barlow_Condensed, Stardos_Stencil } from "next/font/google";
import { useState } from "react";

import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

// Two faces loaded here, each pulled from a noun in its brief. The darkroom
// brief uses the site's mono, because film edge print is a fixed-width code.
const stencil = Stardos_Stencil({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});
const tape = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

/* ------------------------------------------------------------------ */
/* Briefs and the nouns each material came from                        */
/* ------------------------------------------------------------------ */

type BriefId = "seeds" | "climbing" | "darkroom";
type Material = "palette" | "type" | "motif";

const MATERIALS: Material[] = ["palette", "type", "motif"];

const MATERIAL_LABEL: Record<Material, string> = {
  palette: "Palette",
  type: "Type",
  motif: "Motif",
};

type Pull = { noun: string; result: string; swatches?: string[] };

type Brief = {
  label: string;
  brief: string;
  nouns: string[];
  pulls: Record<Material, Pull>;
};

const BRIEFS: Record<BriefId, Brief> = {
  seeds: {
    label: "Seed library",
    brief:
      "Seedshare: an allotment seed library. Members borrow seeds in spring and bring saved seed back in autumn.",
    nouns: [
      "seed packet",
      "stencilled sack",
      "plot stake",
      "frost date",
      "twine",
      "rain gauge",
      "trowel",
    ],
    pulls: {
      palette: {
        noun: "seed packet",
        result: "Kraft ground, leaf-green ink, the marigold printed on the front",
        swatches: ["#D2B48C", "#1E3B22", "#F2A900"],
      },
      type: {
        noun: "stencilled sack",
        result: "A stencil serif for headings, as sprayed on the seed sacks",
      },
      motif: {
        noun: "plot stake",
        result: "Lot numbers on a pointed stake, the way plots are marked",
      },
    },
  },
  climbing: {
    label: "Climbing gym",
    brief:
      "Topout: route setting for a bouldering gym. Setters log new problems and climbers tick off what they send.",
    nouns: [
      "coloured holds",
      "setter's tape",
      "chalk",
      "grade scale",
      "crash pad",
      "brush",
      "topo sketch",
    ],
    pulls: {
      palette: {
        noun: "coloured holds",
        result: "Chalk-grey ground, one loud color per circuit, as the holds are",
        swatches: ["#EDEDEA", "#FF3D8B", "#9BE000", "#00B3E6"],
      },
      type: {
        noun: "setter's tape",
        result: "A narrow grotesk, so a grade fits on a strip of tape",
      },
      motif: {
        noun: "setter's tape",
        result: "Each grade on a torn strip of tape in its circuit color",
      },
    },
  },
  darkroom: {
    label: "Darkroom",
    brief:
      "Fixer: bookings and lab notes for a shared film darkroom. Members book an enlarger and log their exposures.",
    nouns: [
      "safelight",
      "film edge print",
      "test strip",
      "contact sheet",
      "grease pencil",
      "enlarger",
      "fixer timer",
    ],
    pulls: {
      palette: {
        noun: "safelight",
        result: "Black ground and the safelight's red-orange, nothing brighter",
        swatches: ["#0D0A0A", "#FF5A36", "#BFB3AE"],
      },
      type: {
        noun: "film edge print",
        result: "A mono face for times and frame numbers, like the film's edge",
      },
      motif: {
        noun: "test strip",
        result: "Time slots as the steps of a test strip, darker as they get longer",
      },
    },
  },
};

const BRIEF_IDS = Object.keys(BRIEFS) as BriefId[];
const BRIEF_OPTIONS = BRIEF_IDS.map((id) => ({
  value: id,
  label: BRIEFS[id].label,
}));

/* ------------------------------------------------------------------ */
/* The screen: generic until a noun is pulled in                       */
/* ------------------------------------------------------------------ */

// Neutral starting values: what the screen looks like with no noun applied.
// Site tokens, so it reads as "any app" in light and dark.
const GENERIC = {
  ground: "var(--card)",
  ink: "var(--foreground)",
  muted: "var(--muted-foreground)",
  accent: "var(--primary)",
  accentInk: "var(--primary-foreground)",
  fill: "var(--muted)",
};

type Applied = Record<Material, boolean>;

function Highlight({
  on,
  children,
  className,
}: {
  on: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[3px] outline-2 outline-offset-2",
        on ? "outline-sky-500 outline-dashed" : "outline-transparent",
        className
      )}
    >
      {children}
    </div>
  );
}

function SeedScreen({ applied, focus }: { applied: Applied; focus: Material | null }) {
  const c = applied.palette
    ? { ground: "#D2B48C", ink: "#1E3B22", muted: "#4A3A22", accent: "#F2A900", accentInk: "#1E3B22", fill: "#C4A57B" }
    : GENERIC;
  const heading = applied.type ? stencil.className : "font-sans font-semibold";
  return (
    <div className="flex h-full flex-col gap-3 p-4 font-sans" style={{ backgroundColor: c.ground, color: c.ink }}>
      <div className="flex items-center justify-between text-[12px]">
        <Highlight on={focus === "type"}>
          <span className={cn(heading, "text-[16px]")}>Seedshare</span>
        </Highlight>
        <span style={{ color: c.muted }}>Spring 2027</span>
      </div>
      <div className="flex items-start justify-between gap-3">
        <Highlight on={focus === "type"} className="min-w-0">
          <p className={cn(heading, "text-[22px] leading-[1.1]")}>
            Gardener&apos;s Delight tomato
          </p>
        </Highlight>
        <Highlight on={focus === "motif"} className="shrink-0">
          {applied.motif ? (
            <span
              className={cn(heading, "grid h-16 w-11 place-items-start justify-center pt-2 text-[13px] leading-none")}
              style={{
                backgroundColor: "#F4ECDD",
                color: "#1E3B22",
                clipPath: "polygon(0 0, 100% 0, 100% 72%, 50% 100%, 0 72%)",
              }}
            >
              <span className="text-center">
                LOT
                <br />
                14
              </span>
            </span>
          ) : (
            <span
              className="rounded-[6px] px-2 py-1 text-[11px] font-medium"
              style={{ backgroundColor: c.fill, color: c.ink }}
            >
              Lot 14
            </span>
          )}
        </Highlight>
      </div>
      <p className="text-[12px] leading-snug" style={{ color: c.muted }}>
        Sow indoors March to April, 6mm deep. Bring back 20 seeds by October.
      </p>
      <span
        className="mt-auto grid h-10 place-items-center rounded-[6px] text-[13px] font-semibold"
        style={{ backgroundColor: c.accent, color: c.accentInk }}
      >
        Borrow a packet
      </span>
    </div>
  );
}

const CLIMBS = [
  { name: "Cave arete", grade: "V3", color: "#FF3D8B" },
  { name: "Slab traverse", grade: "V1", color: "#9BE000" },
  { name: "The pinch", grade: "V5", color: "#00B3E6" },
];

function ClimbScreen({ applied, focus }: { applied: Applied; focus: Material | null }) {
  const c = applied.palette
    ? { ground: "#EDEDEA", ink: "#161616", muted: "#5A5A55", accent: "#161616", accentInk: "#EDEDEA", fill: "#DADAD5" }
    : GENERIC;
  const face = applied.type ? cn(tape.className, "uppercase") : "font-sans";
  return (
    <div className="flex h-full flex-col gap-3 p-4 font-sans" style={{ backgroundColor: c.ground, color: c.ink }}>
      <div className="flex items-center justify-between text-[12px]">
        <Highlight on={focus === "type"}>
          <span className={cn(face, "text-[16px] font-bold")}>Topout</span>
        </Highlight>
        <span style={{ color: c.muted }}>The cave</span>
      </div>
      <Highlight on={focus === "type"}>
        <p className={cn(face, applied.type ? "text-[28px] leading-[0.95] font-bold" : "text-[20px] leading-[1.15] font-semibold")}>
          14 new problems this week
        </p>
      </Highlight>
      <ul className="flex flex-col">
        {CLIMBS.map((climb) => (
          <li
            key={climb.name}
            className="flex items-center justify-between gap-2 border-t py-1.5 text-[13px]"
            style={{ borderColor: applied.palette ? "#D0D0CA" : "var(--border)" }}
          >
            <span>{climb.name}</span>
            <Highlight on={focus === "motif"}>
              {applied.motif ? (
                <span
                  className={cn(face, "block -rotate-2 px-2.5 py-0.5 text-[14px] font-bold")}
                  style={{
                    backgroundColor: applied.palette ? climb.color : c.fill,
                    color: "#161616",
                    clipPath:
                      "polygon(0 8%, 6% 0, 12% 10%, 100% 0, 96% 50%, 100% 100%, 8% 92%, 0 100%, 4% 50%)",
                  }}
                >
                  {climb.grade}
                </span>
              ) : (
                <span
                  className={cn(face, "rounded-[6px] px-2 py-0.5 text-[12px] font-semibold")}
                  style={{
                    backgroundColor: applied.palette ? climb.color : c.fill,
                    color: applied.palette ? "#161616" : c.ink,
                  }}
                >
                  {climb.grade}
                </span>
              )}
            </Highlight>
          </li>
        ))}
      </ul>
      <span
        className={cn(face, "mt-auto grid h-10 place-items-center rounded-[6px] text-[13px] font-semibold")}
        style={{ backgroundColor: c.accent, color: c.accentInk }}
      >
        Tick a send
      </span>
    </div>
  );
}

const STEPS = ["1h", "1.5h", "2h", "3h", "4h"];
const STEP_MIX = [8, 20, 62, 76, 90];

function DarkroomScreen({ applied, focus }: { applied: Applied; focus: Material | null }) {
  const c = applied.palette
    ? { ground: "#0D0A0A", ink: "#FF5A36", muted: "#BFB3AE", accent: "#FF5A36", accentInk: "#0D0A0A", fill: "#2A1A16" }
    : GENERIC;
  const mono = applied.type ? "font-mono uppercase" : "font-sans";
  return (
    <div className="flex h-full flex-col gap-3 p-4 font-sans" style={{ backgroundColor: c.ground, color: c.ink }}>
      <Highlight on={focus === "type"}>
        <div className={cn(mono, "flex items-center justify-between text-[11px]")} style={{ color: c.muted }}>
          <span>{applied.type ? "▸ 14" : "Thu 12 Nov"}</span>
          <span>{applied.type ? "FIXER 400" : "Fixer"}</span>
          <span>{applied.type ? "▸ 14A" : "Room 2"}</span>
        </div>
      </Highlight>
      <p className={cn("text-[22px] leading-[1.15] font-semibold", applied.type && "font-mono text-[20px] font-medium")}>
        Book enlarger 2
      </p>
      <p className="text-[12px] leading-snug" style={{ color: c.muted }}>
        Thursday evening. Pick how long you need it.
      </p>
      <Highlight on={focus === "motif"}>
        <div
          className={cn("grid grid-cols-5 overflow-hidden", applied.motif ? "gap-0" : "gap-1.5")}
          role="presentation"
        >
          {STEPS.map((step, index) => {
            const motif = applied.motif;
            // Test strip: each step darker than the last, as a longer exposure prints.
            const bg = motif
              ? applied.palette
                ? `color-mix(in oklab, #FF5A36 ${46 - index * 9}%, #0D0A0A)`
                : `color-mix(in oklab, var(--foreground) ${STEP_MIX[index]}%, var(--card))`
              : c.fill;
            const ink = motif
              ? applied.palette
                ? "#F3E9E6"
                : index > 1
                  ? "var(--background)"
                  : "var(--foreground)"
              : c.ink;
            return (
              <span
                key={step}
                className={cn(
                  "grid h-10 place-items-center text-[12px]",
                  motif ? "rounded-none" : "rounded-[6px]",
                  applied.type && "font-mono"
                )}
                style={{ backgroundColor: bg, color: ink }}
              >
                {step}
              </span>
            );
          })}
        </div>
      </Highlight>
      <span
        className={cn(
          "mt-auto grid h-10 place-items-center rounded-[6px] text-[13px] font-semibold",
          applied.type && "font-mono font-medium uppercase"
        )}
        style={{ backgroundColor: c.accent, color: c.accentInk }}
      >
        Hold 19:00 to 21:00
      </span>
    </div>
  );
}

function BriefScreen({
  brief,
  applied,
  focus,
}: {
  brief: BriefId;
  applied: Applied;
  focus: Material | null;
}) {
  if (brief === "climbing") return <ClimbScreen applied={applied} focus={focus} />;
  if (brief === "darkroom") return <DarkroomScreen applied={applied} focus={focus} />;
  return <SeedScreen applied={applied} focus={focus} />;
}

/* ------------------------------------------------------------------ */
/* Demo                                                                */
/* ------------------------------------------------------------------ */

const NONE: Applied = { palette: false, type: false, motif: false };
const ALL: Applied = { palette: true, type: true, motif: true };

export function BorrowFromTheSubjectDemo() {
  const [brief, setBrief] = useState<BriefId>("seeds");
  const [applied, setApplied] = useState<Applied>(NONE);
  const [focus, setFocus] = useState<Material | null>(null);
  const reduceMotion = useReducedMotion();
  const current = BRIEFS[brief];
  const pulledNouns = new Set(
    MATERIALS.filter((m) => applied[m]).map((m) => current.pulls[m].noun)
  );
  const count = MATERIALS.filter((m) => applied[m]).length;

  return (
    <Demo className="items-stretch gap-6 px-4 sm:px-6">
      <div className="flex flex-col gap-2.5">
        <p className="max-w-[56ch] text-[13px] leading-snug text-foreground">
          <span className="text-muted-foreground">Brief.</span>{" "}{current.brief}
        </p>
        <ul aria-label="Nouns from the subject" className="flex flex-wrap gap-1.5">
          {current.nouns.map((noun) => (
            <li
              key={noun}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px]",
                !reduceMotion && "transition-colors duration-200",
                pulledNouns.has(noun)
                  ? "bg-sky-500/15 font-medium text-sky-800 dark:text-sky-200"
                  : "bg-muted text-foreground/75"
              )}
            >
              {noun}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div
          className={cn(
            "h-[300px] w-full max-w-[280px] shrink-0 overflow-hidden rounded-lg",
            focus === "palette"
              ? "ring-2 ring-sky-500"
              : "ring-1 ring-black/10 dark:ring-white/10"
          )}
          aria-label={`${current.label} screen, ${count} of 3 materials pulled from the subject`}
          role="img"
        >
          <BriefScreen applied={applied} brief={brief} focus={focus} />
        </div>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-2">
          <span className="text-[11px] text-muted-foreground">
            Pull each material from its noun
          </span>
          <ul className="flex flex-col gap-1.5">
            {MATERIALS.map((material) => {
              const pull = current.pulls[material];
              const on = applied[material];
              return (
                <li key={material}>
                  <button
                    aria-pressed={on}
                    className={cn(
                      "flex min-h-11 w-full cursor-pointer flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      !reduceMotion && "transition-colors duration-150",
                      on ? "bg-muted" : "hover:bg-muted/60"
                    )}
                    onBlur={() => setFocus(null)}
                    onClick={() =>
                      setApplied((prev) => ({ ...prev, [material]: !prev[material] }))
                    }
                    onFocus={() => setFocus(material)}
                    onMouseEnter={() => setFocus(material)}
                    onMouseLeave={() => setFocus(null)}
                    type="button"
                  >
                    <span className="flex w-full items-center justify-between gap-2 text-[12px]">
                      <span className="font-medium text-sky-700 dark:text-sky-300">
                        {pull.noun}
                      </span>
                      <span className="text-muted-foreground">
                        {on ? `${MATERIAL_LABEL[material]} pulled` : `Pull ${MATERIAL_LABEL[material].toLowerCase()}`}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "text-[13px] leading-snug",
                        on ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {pull.result}
                    </span>
                    {pull.swatches ? (
                      <span aria-hidden="true" className="mt-1 flex gap-1">
                        {pull.swatches.map((swatch) => (
                          <span
                            key={swatch}
                            className="size-3.5 rounded-full ring-1 ring-black/10 dark:ring-white/15"
                            style={{ backgroundColor: swatch }}
                          />
                        ))}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            className="h-8 cursor-pointer self-start rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 max-sm:h-11"
            onClick={() => setApplied(count === 3 ? NONE : ALL)}
            type="button"
          >
            {count === 3 ? "Back to generic" : "Pull all three"}
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <SegmentedControl
          ariaLabel="Brief"
          onChange={(value) => {
            setBrief(value);
            setApplied(NONE);
            setFocus(null);
          }}
          options={BRIEF_OPTIONS}
          value={brief}
        />
      </div>
    </Demo>
  );
}
