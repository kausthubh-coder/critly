"use client";

import {
  animate,
  motion,
  useMotionValue,
  type PanInfo,
} from "motion/react";
import { useRef, useState } from "react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { projectMomentum, springFromFeel } from "@/lib/spring";

// Snap after a drag: 0.4s, no bounce, with the release velocity passed in.
// A physics spring (stiffness/damping) is used because Motion drops the
// velocity of springs defined by duration and bounce.
const SNAP = springFromFeel(0.4, 0);

const STAGE_H = 176;
const PIP_W = 56;
const PIP_H = 40;
const INSET = 8;

type Point = { x: number; y: number };

function nearest(points: Point[], to: Point) {
  return points.reduce((best, point) =>
    Math.hypot(point.x - to.x, point.y - to.y) <
    Math.hypot(best.x - to.x, best.y - to.y)
      ? point
      : best
  );
}

function PipStage({ projected }: { projected: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const x = useMotionValue(INSET);
  const y = useMotionValue(INSET);
  const [ghost, setGhost] = useState<Point | null>(null);

  function corners(): Point[] {
    const width = stage.current?.offsetWidth ?? 200;
    const right = width - PIP_W - INSET;
    const bottom = STAGE_H - PIP_H - INSET;
    return [
      { x: INSET, y: INSET },
      { x: right, y: INSET },
      { x: INSET, y: bottom },
      { x: right, y: bottom },
    ];
  }

  function release(_: PointerEvent, info: PanInfo) {
    const now = { x: x.get(), y: y.get() };
    const aim = projected
      ? {
          x: now.x + projectMomentum(info.velocity.x),
          y: now.y + projectMomentum(info.velocity.y),
        }
      : now;
    const target = nearest(corners(), aim);
    setGhost(projected ? aim : null);

    // Each axis is its own spring, carrying its own velocity.
    animate(x, target.x, { type: "spring", ...SNAP, velocity: info.velocity.x });
    animate(y, target.y, { type: "spring", ...SNAP, velocity: info.velocity.y });
  }

  return (
    <div
      ref={stage}
      className="relative w-full overflow-hidden rounded-xl bg-muted shadow-(--custom-shadow) dark:bg-muted/40"
      style={{ height: STAGE_H }}
    >
      {ghost ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute size-2 rounded-full bg-sky-500/70"
          style={{
            left: Math.max(4, Math.min(ghost.x + PIP_W / 2, (stage.current?.offsetWidth ?? 200) - 4)) - 4,
            top: Math.max(4, Math.min(ghost.y + PIP_H / 2, STAGE_H - 4)) - 4,
          }}
        />
      ) : null}
      <motion.div
        aria-label="Picture in picture window. Flick it toward a corner."
        className="absolute top-0 left-0 cursor-grab touch-none rounded-lg bg-foreground shadow-md active:cursor-grabbing"
        drag
        dragMomentum={false}
        onDragEnd={release}
        onDragStart={() => setGhost(null)}
        style={{ x, y, width: PIP_W, height: PIP_H }}
      />
    </div>
  );
}

export function ProjectionDemo() {
  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="Nearest to where you let go" verdict="wrong">
          <PipStage projected={false} />
        </CompareItem>
        <CompareItem caption="Nearest to where it was going" verdict="right">
          <PipStage projected />
        </CompareItem>
      </Compare>
      <p className="text-xs text-muted-foreground">
        Flick the windows toward a corner with a short, quick throw.
      </p>
    </Demo>
  );
}

const TRACK_W = 224;
const KNOB = 36;
const TRAVEL = TRACK_W - KNOB - 8;

function FlickTrack({
  label,
  keepVelocity,
}: {
  label: string;
  keepVelocity: boolean;
}) {
  const x = useMotionValue(0);
  const [on, setOn] = useState(false);

  function settle(target: number, velocity: number) {
    setOn(target === TRAVEL);
    if (keepVelocity) {
      animate(x, target, { type: "spring", ...springFromFeel(0.35, 0), velocity });
    } else {
      // A fixed curve starts from zero speed, whatever the finger was doing.
      animate(x, target, { duration: 0.35, ease: [0.23, 1, 0.32, 1] });
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
        {label}
      </span>
      <div
        className="relative h-11 rounded-full bg-muted p-1 shadow-(--custom-shadow) dark:bg-muted/60"
        style={{ width: TRACK_W }}
      >
        <motion.button
          aria-label={`${label}: ${on ? "on" : "off"}. Flick it, or press to toggle.`}
          aria-pressed={on}
          className="block cursor-grab touch-none rounded-full bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: TRAVEL }}
          dragElastic={0.1}
          dragMomentum={false}
          // Taps and the keyboard toggle; drags are handled on release. Both
          // handlers aim at the same end, so a double call is harmless.
          onClick={(event) => {
            if (event.detail === 0) settle(on ? 0 : TRAVEL, 0);
          }}
          onTap={() => settle(on ? 0 : TRAVEL, 0)}
          onDragEnd={(_, info) => {
            const aim = x.get() + projectMomentum(info.velocity.x, 0.99);
            settle(aim > TRAVEL / 2 ? TRAVEL : 0, info.velocity.x);
          }}
          style={{ x, width: KNOB, height: KNOB }}
          type="button"
        />
      </div>
    </div>
  );
}

export function VelocityHandoffDemo() {
  return (
    <Demo className="gap-6">
      <div className="flex flex-col gap-4">
        <FlickTrack keepVelocity={false} label="Curve" />
        <FlickTrack keepVelocity label="Spring" />
      </div>
      <p className="text-xs text-muted-foreground">
        Throw each knob to the other end.
      </p>
    </Demo>
  );
}
