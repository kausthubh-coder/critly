"use client";

import {
  ListIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  PaperPlaneTiltIcon,
  StarIcon,
  TrayIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Phone, PHONE_INSETS, PHONE_WIDTH } from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

type Layout = "top" | "bottom";
type Reach = "off" | "right" | "left";

const LAYOUT_OPTIONS = [
  { value: "top", label: "Top bar", icon: WRONG_ICON },
  { value: "bottom", label: "Bottom bar", icon: RIGHT_ICON },
] as const;

const REACH_OPTIONS = [
  { value: "off", label: "No overlay" },
  { value: "right", label: "Right thumb" },
  { value: "left", label: "Left thumb" },
] as const;

const HEIGHT = 460;
const INSET = PHONE_INSETS.ios;
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset";
/* 30px icons with 44px targets (an ::after, so the look doesn't change). */
const ICON_BUTTON = cn(
  "relative grid size-[30px] cursor-pointer place-items-center rounded-full text-foreground active:bg-foreground/10",
  "after:absolute after:-inset-[7px]",
  FOCUS
);

const MAIL = [
  { from: "Maya Chen", subject: "Notes from Thursday" },
  { from: "Studio Rent", subject: "Your invoice for October" },
  { from: "Jonas", subject: "Trip photos are up" },
  { from: "Linear", subject: "3 issues assigned to you" },
  { from: "Priya Patel", subject: "Re: launch checklist" },
  { from: "Bookshop", subject: "Your order has shipped" },
  { from: "Sam", subject: "Dinner on Friday?" },
  { from: "Calendar", subject: "Design review moved to 3pm" },
] as const;

const TABS = [
  { id: "inbox", label: "Inbox", Icon: TrayIcon },
  { id: "starred", label: "Starred", Icon: StarIcon },
  { id: "sent", label: "Sent", Icon: PaperPlaneTiltIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

function MailList() {
  return (
    <ul aria-label="Messages" className="flex flex-col">
      {MAIL.map((mail, i) => (
        <li key={mail.from} className="flex items-center gap-2.5 px-3 py-[7px]">
          <span
            aria-hidden="true"
            className="size-[22px] shrink-0 rounded-full"
            style={{ background: `oklch(0.8 0.06 ${(i * 53) % 360})` }}
          />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[10.5px] font-semibold">{mail.from}</span>
            <span className="truncate text-[9.5px] text-muted-foreground">{mail.subject}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* An approximate one-handed reach map after Josh Clark's thumb zone, scaled
   to this 248 x 460 screen. The thumb pivots from just off the lower side
   edge: easy under the arc, a stretch past it and right next to the palm,
   hard at the far top. People shift their grip for the hard zone; it is
   slower and less accurate, not out of reach. */
function ReachOverlay({ hand }: { hand: "right" | "left" }) {
  const w = PHONE_WIDTH;
  const px = hand === "right" ? w + 8 : -8;
  const py = HEIGHT - 30;
  const mirror = (x: number) => (hand === "right" ? x : w - x);
  const labels = [
    { text: "Hard", x: 84, y: 110 },
    { text: "Stretch", x: 34, y: 300 },
    { text: "Easy", x: 150, y: 330 },
  ];
  return (
    <motion.div
      animate={{ opacity: 1 }}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <svg className="absolute inset-0 size-full" viewBox={`0 0 ${w} ${HEIGHT}`}>
        {/* Group opacity, so the zones don't mix where they overlap. */}
        <g opacity={0.2}>
          <rect className="fill-rose-500" height={HEIGHT} width={w} />
          <circle className="fill-amber-400" cx={px} cy={py} r={285} />
          <circle className="fill-emerald-500" cx={px} cy={py} r={210} />
          <circle className="fill-amber-400" cx={px} cy={py} r={56} />
        </g>
        <g className="stroke-foreground/35" fill="none" strokeDasharray="4 4">
          <circle cx={px} cy={py} r={285} />
          <circle cx={px} cy={py} r={210} />
        </g>
      </svg>
      {labels.map((label) => (
        <span
          key={label.text}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/90 px-1.5 py-px text-[9px] font-semibold shadow-(--custom-shadow)"
          style={{ left: mirror(label.x), top: label.y }}
        >
          {label.text}
        </span>
      ))}
    </motion.div>
  );
}

function TopBarScreen() {
  const reduced = useReducedMotion();
  const [drawer, setDrawer] = useState(false);
  return (
    <div className="absolute inset-0" style={{ paddingTop: INSET.top }}>
      {/* Everything you tap all day, as far from the thumb as it gets. */}
      <div className="flex h-[36px] items-center justify-between px-2">
        <button
          aria-expanded={drawer}
          aria-label="Open menu"
          className={ICON_BUTTON}
          onClick={() => setDrawer(true)}
          type="button"
        >
          <ListIcon aria-hidden="true" className="size-[16px]" weight="bold" />
        </button>
        <p className="text-[12px] font-semibold">Inbox</p>
        <span className="flex gap-3.5">
          <button aria-label="Search" className={ICON_BUTTON} type="button">
            <MagnifyingGlassIcon aria-hidden="true" className="size-[16px]" weight="bold" />
          </button>
          <button aria-label="Compose" className={ICON_BUTTON} type="button">
            <NotePencilIcon aria-hidden="true" className="size-[16px]" weight="bold" />
          </button>
        </span>
      </div>
      <MailList />

      <AnimatePresence>
        {drawer ? (
          <motion.div
            key="drawer"
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 bg-black/30"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) setDrawer(false);
            }}
            transition={{ duration: 0.2 }}
          >
            <motion.nav
              animate={{ x: 0 }}
              aria-label="Mailboxes"
              className="flex h-full w-[68%] flex-col gap-0.5 bg-background px-2 shadow-lg"
              exit={{ x: reduced ? 0 : "-100%" }}
              initial={{ x: reduced ? 0 : "-100%" }}
              style={{ paddingTop: INSET.top + 8 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className={cn(
                    "flex h-[44px] cursor-pointer items-center gap-2 rounded-lg px-2 text-left text-[11px] active:bg-foreground/10",
                    FOCUS
                  )}
                  onClick={() => setDrawer(false)}
                  type="button"
                >
                  <Icon aria-hidden="true" className="size-[14px]" />
                  {label}
                </button>
              ))}
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function BottomBarScreen() {
  const [tab, setTab] = useState<TabId>("inbox");
  const title = TABS.find((t) => t.id === tab)?.label ?? "Inbox";
  return (
    <div className="absolute inset-0" style={{ paddingTop: INSET.top }}>
      {/* Rare actions can stay at the top. */}
      <div className="flex h-[24px] items-center justify-end px-3">
        <button
          className={cn(
            "relative cursor-pointer rounded-md px-1 text-[11px] text-indigo-600 after:absolute after:-inset-x-2 after:top-1/2 after:h-[44px] after:-translate-y-1/2 dark:text-indigo-400",
            FOCUS
          )}
          type="button"
        >
          Edit
        </button>
      </div>
      <p className="px-3 pb-1 text-[21px] leading-tight font-bold tracking-tight">{title}</p>
      <MailList />

      {/* Floating tab bar with search at the trailing end (iOS 26), and the
          main action right above it. */}
      <button
        aria-label="Compose"
        className={cn(
          "absolute right-3 z-10 grid size-[34px] cursor-pointer place-items-center rounded-full bg-background/90 shadow-(--custom-shadow) backdrop-blur-md active:scale-95 after:absolute after:-inset-[5px]",
          FOCUS
        )}
        style={{ bottom: INSET.bottom + 46 }}
        type="button"
      >
        <NotePencilIcon aria-hidden="true" className="size-[16px]" weight="bold" />
      </button>
      <div
        className="absolute inset-x-3 z-10 flex items-center gap-2"
        style={{ bottom: INSET.bottom - 4 }}
      >
        <div
          aria-label="Mailboxes"
          className="flex h-[38px] flex-1 items-center rounded-full bg-background/90 p-[3px] shadow-(--custom-shadow) backdrop-blur-md"
          role="group"
        >
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              aria-pressed={tab === id}
              className={cn(
                "relative flex h-full flex-1 cursor-pointer flex-col items-center justify-center gap-px rounded-full text-[8px] font-medium after:absolute after:inset-x-0 after:-inset-y-[6px]",
                FOCUS,
                tab === id
                  ? "bg-foreground/8 text-indigo-600 dark:text-indigo-400"
                  : "text-foreground"
              )}
              onClick={() => setTab(id)}
              type="button"
            >
              <Icon aria-hidden="true" className="size-[14px]" weight={tab === id ? "fill" : "regular"} />
              {label}
            </button>
          ))}
        </div>
        <button
          aria-label="Search"
          className={cn(
            "relative grid size-[38px] shrink-0 cursor-pointer place-items-center rounded-full bg-background/90 shadow-(--custom-shadow) backdrop-blur-md active:scale-95 after:absolute after:-inset-[3px]",
            FOCUS
          )}
          type="button"
        >
          <MagnifyingGlassIcon aria-hidden="true" className="size-[16px]" weight="bold" />
        </button>
      </div>
    </div>
  );
}

export function ThumbReachDemo() {
  const [layout, setLayout] = useState<Layout>("top");
  const [reach, setReach] = useState<Reach>("right");

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone height={HEIGHT} label="Mail app with its controls at the top or bottom" platform="ios">
        {layout === "top" ? <TopBarScreen /> : <BottomBarScreen />}
        <AnimatePresence>
          {reach !== "off" ? <ReachOverlay key={reach} hand={reach} /> : null}
        </AnimatePresence>
      </Phone>
      <div className="flex flex-col items-center gap-2">
        <SegmentedControl
          ariaLabel="Where the controls are"
          onChange={setLayout}
          options={LAYOUT_OPTIONS}
          value={layout}
        />
        <SegmentedControl
          ariaLabel="Reach overlay"
          onChange={setReach}
          options={REACH_OPTIONS}
          value={reach}
        />
      </div>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        Approximate one-handed reach. People shift their grip to tap the hard
        zone, so it is slower and less accurate, not out of reach.
      </p>
    </Demo>
  );
}
