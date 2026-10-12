"use client";

import {
  BellIcon,
  GearSixIcon,
  HouseIcon,
  LinkSimpleIcon,
  MagnifyingGlassIcon,
  ShareNetworkIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useId, useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Button } from "@/components/ui/button";
import { springFromFeel } from "@/lib/spring";
import { cn } from "@/lib/utils";

// Every demo here is started by the reader and the motion is the point, so
// none of them drop to zero for reduced motion.

// A tap has no momentum, so the surface settles with almost no bounce.
const MORPH = { type: "spring" as const, ...springFromFeel(0.4, 0.1) };

const SHARE_ROWS = [
  { label: "Copy link", Icon: LinkSimpleIcon },
  { label: "Invite people", Icon: UsersIcon },
] as const;

function ShareRows() {
  return (
    <ul className="flex flex-col">
      {SHARE_ROWS.map((row) => (
        <li
          key={row.label}
          className="flex items-center gap-2 rounded-md px-1 py-1 text-[11px] text-muted-foreground"
        >
          <row.Icon aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{row.label}</span>
        </li>
      ))}
    </ul>
  );
}

const TRIGGER =
  "flex h-8 items-center gap-1.5 bg-card px-3 text-xs font-medium text-foreground shadow-(--custom-shadow)";
const PANEL_W = 160;

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="relative h-40 w-full overflow-hidden rounded-xl bg-muted shadow-(--custom-shadow) dark:bg-muted/40"
    >
      {children}
    </div>
  );
}

// Wrong: the panel is a second surface that fades in over the button.
function TeleportShare({ open }: { open: boolean }) {
  return (
    <Stage>
      <div className={cn(TRIGGER, "absolute bottom-3 left-3 rounded-2xl")}>
        <ShareNetworkIcon aria-hidden="true" className="size-3.5" />
        Share
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-3 left-3 origin-center bg-card p-2.5 shadow-(--custom-shadow)"
            exit={{ opacity: 0, scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.9 }}
            style={{ width: PANEL_W, borderRadius: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <p className="mb-1.5 px-1 text-xs font-medium text-foreground">Share</p>
            <ShareRows />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Stage>
  );
}

// Right: one surface. The button becomes the panel and the label travels.
function MorphShare({ open }: { open: boolean }) {
  const id = useId();

  return (
    <Stage>
      <LayoutGroup id={id}>
        <AnimatePresence initial={false} mode="popLayout">
          {open ? (
            <motion.div
              key="panel"
              className="absolute bottom-3 left-3 bg-card p-2.5 shadow-(--custom-shadow)"
              layoutId="surface"
              // Radius lives in style so Motion can correct it while scaling.
              style={{ width: PANEL_W, borderRadius: 16 }}
              transition={MORPH}
            >
              <motion.p
                className="mb-1.5 px-1 text-xs font-medium text-foreground"
                layout="position"
                layoutId="label"
                transition={MORPH}
              >
                Share
              </motion.p>
              <motion.div
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.18, delay: 0.06 }}
              >
                <ShareRows />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="trigger"
              className={cn(TRIGGER, "absolute bottom-3 left-3")}
              layoutId="surface"
              // The real half-height, not 9999px, so the corners interpolate.
              style={{ borderRadius: 16 }}
              transition={MORPH}
            >
              <ShareNetworkIcon aria-hidden="true" className="size-3.5" />
              <motion.span layout="position" layoutId="label" transition={MORPH}>
                Share
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </Stage>
  );
}

export function MorphDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="A second surface appears" verdict="wrong">
          <TeleportShare open={open} />
        </CompareItem>
        <CompareItem caption="The button becomes the menu" verdict="right">
          <MorphShare open={open} />
        </CompareItem>
      </Compare>

      <Button
        aria-pressed={open}
        className="min-w-24"
        onClick={() => setOpen((value) => !value)}
        variant="secondary"
      >
        {open ? "Close" : "Share"}
      </Button>
    </Demo>
  );
}

const TABS = [
  { label: "Home", Icon: HouseIcon },
  { label: "Search", Icon: MagnifyingGlassIcon },
  { label: "Alerts", Icon: BellIcon },
  { label: "Settings", Icon: GearSixIcon },
] as const;

const TAB = 44;
const DOT = 36;

function TabBar({ gooey, active }: { gooey: boolean; active: number }) {
  const filterId = `goo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const x = active * TAB + (TAB - DOT) / 2;

  return (
    <div
      className="relative rounded-full bg-muted p-1 shadow-(--custom-shadow) dark:bg-muted/60"
      style={{ width: TABS.length * TAB + 8 }}
    >
      {gooey ? (
        <svg aria-hidden="true" height="0" style={{ position: "absolute" }} width="0">
          <filter
            colorInterpolationFilters="sRGB"
            height="200%"
            id={filterId}
            width="140%"
            x="-20%"
            y="-50%"
          >
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="5" />
            {/* Alpha x18 - 7: solid above ~0.44, gone below ~0.39. Overlapping
                blurs add up, so nearby shapes grow a bridge and merge. */}
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            />
          </filter>
        </svg>
      ) : null}

      {/* Only the indicator shapes go through the filter, never the icons. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-1"
        style={gooey ? { filter: `url(#${filterId})` } : undefined}
      >
        <motion.div
          animate={{ x }}
          className="absolute top-1/2 left-0 -mt-[18px] rounded-full bg-foreground"
          initial={false}
          style={{ width: DOT, height: DOT }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        />
        {gooey ? (
          // A slower twin that trails behind; the filter melts the two together.
          <motion.div
            animate={{ x }}
            className="absolute top-1/2 left-0 -mt-[14px] ml-1 rounded-full bg-foreground"
            initial={false}
            style={{ width: DOT - 8, height: DOT - 8 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          />
        ) : null}
      </div>

      <div className="relative flex">
        {TABS.map((tab, index) => (
          <span
            key={tab.label}
            aria-hidden="true"
            className={cn(
              "grid h-11 place-items-center transition-colors duration-200",
              index === active ? "text-background" : "text-muted-foreground"
            )}
            style={{ width: TAB }}
          >
            <tab.Icon className="size-4" weight={index === active ? "fill" : "regular"} />
          </span>
        ))}
      </div>
    </div>
  );
}

export function GooeyTabsDemo() {
  const [active, setActive] = useState(0);

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <div className="flex flex-col items-center gap-5">
        <CompareItem caption="Slides">
          <TabBar active={active} gooey={false} />
        </CompareItem>
        <CompareItem caption="Pours">
          <TabBar active={active} gooey />
        </CompareItem>
      </div>

      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Tabs">
        {TABS.map((tab, index) => (
          <Button
            key={tab.label}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
            size="sm"
            variant={active === index ? "secondary" : "ghost"}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </Demo>
  );
}

const TRACK = 200;
const THUMB = 28;
const RANGE = TRACK - THUMB - 8;

function SliderThumb({ liquid }: { liquid: boolean }) {
  const x = useMotionValue(RANGE / 2);
  const velocity = useVelocity(x);
  // Stretch along the motion, capped at 1.25x, smoothed by a spring so the
  // jittery pointer velocity doesn't flicker.
  const target = useTransform(velocity, [-2000, 0, 2000], [1.25, 1, 1.25], {
    clamp: true,
  });
  const stretch = useSpring(target, { stiffness: 700, damping: 35 });
  // Squash the other axis by the same amount, so the area stays constant.
  const squash = useTransform(stretch, (s) => 1 / s);

  return (
    <div
      className="relative h-11 rounded-full bg-muted p-1 shadow-(--custom-shadow) dark:bg-muted/60"
      style={{ width: TRACK }}
    >
      <motion.div
        aria-label={liquid ? "Liquid slider thumb" : "Rigid slider thumb"}
        className="absolute top-1/2 left-1 -mt-[14px] cursor-grab touch-none rounded-full bg-foreground active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: RANGE }}
        dragElastic={liquid ? 0.2 : 0}
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 400, bounceDamping: 30 }}
        role="img"
        style={{
          x,
          scaleX: liquid ? stretch : 1,
          scaleY: liquid ? squash : 1,
          width: THUMB,
          height: THUMB,
        }}
      />
    </div>
  );
}

export function StretchDemo() {
  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="Rigid: stops dead">
          <SliderThumb liquid={false} />
        </CompareItem>
        <CompareItem caption="Liquid: stretches, gives at the ends">
          <SliderThumb liquid />
        </CompareItem>
      </Compare>
      <p className="text-xs text-muted-foreground">
        Drag each thumb quickly, then past the end.
      </p>
    </Demo>
  );
}
