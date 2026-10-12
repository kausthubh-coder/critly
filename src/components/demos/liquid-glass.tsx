"use client";

import { MusicNotesIcon } from "@phosphor-icons/react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

/*
 * Refraction: an SVG feDisplacementMap. On a real page you would apply it as
 * `backdrop-filter: url(#id)`, which only Chromium renders. This demo
 * refracts a copy of the content under the glass with a plain `filter`
 * instead, which works in every browser.
 */

// Convex squircle surface: flat in the middle, curving down at the rim.
const squircle = (x: number) => Math.pow(Math.max(0, 1 - (1 - x) ** 4), 0.25);

/** Sideways shift (px) across the bezel, from Snell's law with glass n = 1.5. */
function refractionTable(bezel: number, thickness: number, samples = 128) {
  const table = new Float32Array(samples);
  const e = 1e-3;
  for (let i = 0; i < samples; i++) {
    const x = Math.min(Math.max(i / (samples - 1), e), 1 - e);
    const height = squircle(x) * thickness;
    const slope =
      ((squircle(x + e) - squircle(x - e)) / (2 * e)) * (thickness / bezel);
    const incidence = Math.atan(slope);
    const refracted = Math.asin(Math.sin(incidence) / 1.5);
    table[i] = height * Math.tan(incidence - refracted);
  }
  return table;
}

// Signed distance to a rounded rectangle centred on 0,0 (negative inside).
function roundedBoxDistance(
  px: number,
  py: number,
  halfW: number,
  halfH: number,
  r: number
) {
  const qx = Math.abs(px) - halfW + r;
  const qy = Math.abs(py) - halfH + r;
  return (
    Math.min(Math.max(qx, qy), 0) +
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) -
    r
  );
}

/** A displacement map (R = x, G = y, 128 = no shift) and a rim highlight. */
function buildGlassMaps(
  width: number,
  height: number,
  radius: number,
  bezel: number,
  thickness: number
) {
  const halfW = width / 2;
  const halfH = height / 2;
  const r = Math.min(radius, halfW, halfH);
  const table = refractionTable(bezel, thickness);
  const max = Math.max(...table.map(Math.abs)) || 1;
  const displacement = new ImageData(width, height);
  const highlight = new ImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5 - halfW;
      const py = y + 0.5 - halfH;
      const depth = -roundedBoxDistance(px, py, halfW, halfH, r);
      const i = (y * width + x) * 4;
      let vx = 0;
      let vy = 0;
      let rim = 0;
      if (depth > 0 && depth < bezel) {
        const gx =
          roundedBoxDistance(px + 0.5, py, halfW, halfH, r) -
          roundedBoxDistance(px - 0.5, py, halfW, halfH, r);
        const gy =
          roundedBoxDistance(px, py + 0.5, halfW, halfH, r) -
          roundedBoxDistance(px, py - 0.5, halfW, halfH, r);
        const length = Math.hypot(gx, gy) || 1;
        const nx = gx / length;
        const ny = gy / length;
        const k = depth / bezel;
        const shift = table[Math.round(k * (table.length - 1))] / max;
        // Convex glass pulls the edges in toward the centre.
        vx = -nx * shift;
        vy = -ny * shift;
        // Light from the top left: brightest on the rim that faces it.
        const facing = Math.abs(nx * -0.707 + ny * -0.707);
        rim = facing ** 3 * Math.max(0, 1 - k / 0.4);
      }
      displacement.data[i] = Math.round(128 + 127 * vx);
      displacement.data[i + 1] = Math.round(128 + 127 * vy);
      displacement.data[i + 2] = 128;
      displacement.data[i + 3] = 255;
      highlight.data[i] = highlight.data[i + 1] = highlight.data[i + 2] = 255;
      highlight.data[i + 3] = Math.round(255 * Math.min(1, rim * 0.8));
    }
  }

  const toUrl = (image: ImageData) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.putImageData(image, 0, 0);
    return canvas.toDataURL();
  };

  return {
    displacement: toUrl(displacement),
    highlight: toUrl(highlight),
    scale: 2 * max,
  };
}

// Client only: the maps are drawn on a canvas, once per size.
function GlassFilter({
  id,
  width,
  height,
  radius,
}: {
  id: string;
  width: number;
  height: number;
  radius: number;
}) {
  const maps = useMemo(
    () => buildGlassMaps(width, height, radius, 20, 40),
    [width, height, radius]
  );

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height="0"
      style={{ position: "absolute" }}
      width="0"
    >
      <filter
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
        height={height}
        id={id}
        width={width}
        x="0"
        y="0"
      >
        <feImage
          height={height}
          href={maps.displacement}
          preserveAspectRatio="none"
          result="map"
          width={width}
          x="0"
          y="0"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          result="refracted"
          scale={maps.scale}
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feImage
          height={height}
          href={maps.highlight}
          preserveAspectRatio="none"
          result="rim"
          width={width}
          x="0"
          y="0"
        />
        <feBlend in="rim" in2="refracted" mode="screen" />
      </filter>
    </svg>
  );
}

// Fine lines and type show bending far better than a photo would.
function LensBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 bg-card">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div className="absolute inset-x-6 top-6 flex flex-col gap-3">
        <p className="text-2xl leading-tight font-semibold text-foreground">
          Glass bends light at its edges
        </p>
        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
          A blur scatters what is behind it. A lens moves it: lines curve near
          the rim and stay straight in the middle, so the shape reads without
          hiding the content.
        </p>
        <div className="flex gap-2">
          <span className="h-3 w-16 rounded-full bg-[oklch(0.7_0.17_25)]" />
          <span className="h-3 w-10 rounded-full bg-[oklch(0.75_0.15_150)]" />
          <span className="h-3 w-20 rounded-full bg-[oklch(0.7_0.15_250)]" />
        </div>
      </div>
    </div>
  );
}

type LensMode = "blur" | "lens";

const LENS_OPTIONS = [
  { value: "blur", label: "Blur" },
  { value: "lens", label: "Refraction" },
] as const;

const STAGE_H = 240;
const LENS_W = 184;
const LENS_H = 72;
const LENS_R = 36;

const GLASS_EDGE =
  "inset 0 1px 0 rgb(255 255 255 / 0.5), inset 0 0 0 1px rgb(255 255 255 / 0.12), 0 0 0 0.5px rgb(0 0 0 / 0.14), 0 8px 24px rgb(0 0 0 / 0.14)";

export function LiquidGlassDemo() {
  const [mode, setMode] = useState<LensMode>("lens");
  const [stageWidth, setStageWidth] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const filterId = `glass-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const x = useMotionValue(0);
  const y = useMotionValue(STAGE_H - LENS_H - 24);
  // The copy under the glass moves the other way, so it lines up with the page.
  const copyX = useTransform(x, (value) => -value);
  const copyY = useTransform(y, (value) => -value);
  const refracting = mode === "lens";

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setStageWidth(el.offsetWidth);
      if (!dragged.current) x.set((el.offsetWidth - LENS_W) / 2);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [x]);

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div
        ref={stage}
        className="relative w-full max-w-lg overflow-hidden rounded-xl shadow-(--custom-shadow)"
        style={{ height: STAGE_H }}
      >
        <LensBackdrop />
        {stageWidth ? (
          <GlassFilter height={LENS_H} id={filterId} radius={LENS_R} width={LENS_W} />
        ) : null}
        <motion.div
          aria-label="Glass lens. Drag it over the text."
          className="absolute top-0 left-0 cursor-grab touch-none active:cursor-grabbing"
          drag
          dragConstraints={stage}
          dragElastic={0.12}
          onDragStart={() => {
            dragged.current = true;
          }}
          role="img"
          style={{
            x,
            y,
            width: LENS_W,
            height: LENS_H,
            borderRadius: LENS_R,
            background: refracting ? undefined : "rgb(255 255 255 / 0.14)",
            backdropFilter: refracting ? undefined : "blur(10px) saturate(170%)",
            WebkitBackdropFilter: refracting ? undefined : "blur(10px) saturate(170%)",
            boxShadow: GLASS_EDGE,
          }}
        >
          {refracting && stageWidth ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 overflow-hidden"
              style={{ borderRadius: LENS_R, filter: `url(#${filterId})` }}
            >
              <motion.div
                className="absolute top-0 left-0"
                style={{ x: copyX, y: copyY, width: stageWidth, height: STAGE_H }}
              >
                <LensBackdrop />
              </motion.div>
            </div>
          ) : null}
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <SegmentedControl
          ariaLabel="Glass effect"
          onChange={setMode}
          options={LENS_OPTIONS}
          value={mode}
        />
        <p className="text-center text-xs text-muted-foreground">
          Drag the glass across the text.
        </p>
      </div>
    </Demo>
  );
}

type GlassLook = "clear" | "tinted";

const LOOK_OPTIONS = [
  { value: "clear", label: "Clear", icon: WRONG_ICON },
  { value: "tinted", label: "Tinted", icon: RIGHT_ICON },
] as const;

const BACKGROUNDS = [
  {
    label: "Light page",
    className: "bg-neutral-50",
    lines: "bg-neutral-300",
  },
  {
    label: "Photo",
    className:
      "bg-[conic-gradient(from_200deg_at_30%_60%,oklch(0.8_0.15_80),oklch(0.65_0.2_20),oklch(0.45_0.15_280),oklch(0.85_0.1_200),oklch(0.8_0.15_80))]",
    lines: "bg-white/70",
  },
  {
    label: "Dark page",
    className: "bg-neutral-900",
    lines: "bg-neutral-700",
  },
] as const;

export function GlassLegibilityDemo() {
  const [look, setLook] = useState<GlassLook>("clear");

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="grid w-full max-w-lg grid-cols-3 gap-2 sm:gap-3">
        {BACKGROUNDS.map((background) => (
          <figure key={background.label} className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "relative flex h-32 w-full items-end justify-center overflow-hidden rounded-xl p-2 shadow-(--custom-shadow)",
                background.className
              )}
            >
              <div aria-hidden="true" className="absolute inset-x-3 top-3 flex flex-col gap-1.5">
                <span className={cn("h-1.5 w-4/5 rounded-full", background.lines)} />
                <span className={cn("h-1.5 w-3/5 rounded-full", background.lines)} />
                <span className={cn("h-1.5 w-2/3 rounded-full", background.lines)} />
              </div>
              <div
                className={cn(
                  "relative flex h-8 max-w-full items-center gap-1.5 rounded-full px-3 text-[11px] font-medium",
                  look === "clear"
                    ? "bg-white/10 text-foreground backdrop-blur-[3px]"
                    : "bg-neutral-100/85 text-neutral-900 backdrop-blur-xl dark:bg-neutral-800/85 dark:text-neutral-50"
                )}
                style={{ boxShadow: GLASS_EDGE }}
              >
                <MusicNotesIcon aria-hidden="true" className="size-3.5 shrink-0" weight="fill" />
                <span className="truncate">Now playing</span>
              </div>
            </div>
            <figcaption className="text-xs text-muted-foreground">
              {background.label}
            </figcaption>
          </figure>
        ))}
      </div>

      <SegmentedControl
        ariaLabel="Glass look"
        onChange={setLook}
        options={LOOK_OPTIONS}
        value={look}
      />
    </Demo>
  );
}
