"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Renders a page at its real pixel size (say 1440 x 900) and scales it down
 * to fit the box it sits in, so type sizes, the fold and proportions are the
 * real ones. The outer box keeps its size from `aspect` so nothing moves while
 * the scale is measured; the page stays hidden until then.
 */
export function ScaledPage({
  width,
  height,
  fit = "width",
  className,
  label,
  children,
}: {
  width: number;
  height: number;
  /** Scale to the box's width, or to its height (for a phone in a wide box). */
  fit?: "width" | "height";
  className?: string;
  label?: string;
  children: React.ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      setScale(fit === "width" ? w / width : h / height);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, [fit, width, height]);

  return (
    <div
      ref={boxRef}
      aria-label={label}
      className={cn("relative overflow-hidden", className)}
      role={label ? "group" : undefined}
      style={
        fit === "width"
          ? { aspectRatio: `${width} / ${height}`, width: "100%" }
          : { aspectRatio: `${width} / ${height}`, height: "100%" }
      }
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width,
          height,
          transform: `scale(${scale ?? 0})`,
          visibility: scale === null ? "hidden" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
