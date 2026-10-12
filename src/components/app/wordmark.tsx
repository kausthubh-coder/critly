"use client";

import Link from "next/link";

import { playSound } from "@/lib/sounds";

/** Critly's mark: two screens, the original in outline and the chosen one solid. */
export function CritlyMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect
        height="14.5"
        rx="2.25"
        stroke="currentColor"
        strokeWidth="1.5"
        width="8"
        x="2.75"
        y="4.75"
      />
      <rect fill="currentColor" height="16" rx="2.75" width="9.5" x="13" y="4" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <Link
      className="group flex items-center gap-1.5 text-base font-semibold tracking-[-0.01em] text-foreground"
      href="/"
      onClick={() => playSound("tick")}
    >
      {/* A small tilt on hover, the only flourish in the header. */}
      <CritlyMark className="size-[18px] transition-transform duration-300 ease-snappy group-hover:-rotate-3" />
      Critly
    </Link>
  );
}
