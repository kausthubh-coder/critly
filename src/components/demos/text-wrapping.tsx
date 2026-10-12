"use client";

import { CheckCircleIcon } from "@phosphor-icons/react";

import { Compare, CompareItem } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";

type TextWrap = React.CSSProperties["textWrap"];

/**
 * The widths in this file are fixed on purpose. Wrapping depends on the
 * exact measure, and at these widths the default wrap strands the last word
 * on its own line (measured in Inter, the site font).
 */
function Toast({ textWrap }: { textWrap: TextWrap }) {
  return (
    <div className="flex w-full max-w-60 gap-3 rounded-xl bg-card px-4 py-3.5 shadow-(--custom-shadow)">
      <CheckCircleIcon
        aria-hidden="true"
        className="size-5 shrink-0 text-emerald-500"
        weight="fill"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <span
          className="text-sm leading-snug font-medium text-foreground"
          style={{ textWrap }}
        >
          Your export is ready to download
        </span>
        <span className="text-xs leading-relaxed text-muted-foreground">
          The link works for 24 hours.
        </span>
      </div>
    </div>
  );
}

export function TextBalanceDemo() {
  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare className="grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 sm:gap-10">
        <CompareItem
          className="w-full max-w-60"
          verdict="wrong"
          caption="text-wrap: wrap"
        >
          <Toast textWrap="wrap" />
        </CompareItem>
        <CompareItem
          className="w-full max-w-60"
          verdict="right"
          caption="text-wrap: balance"
        >
          <Toast textWrap="balance" />
        </CompareItem>
      </Compare>
    </Demo>
  );
}

const PARAGRAPH =
  "Exports now run in the background, so you can keep working while we prepare the file. We will send you a link when it is ready.";

function ParagraphCard({ textWrap }: { textWrap: TextWrap }) {
  return (
    <div className="w-65 rounded-xl bg-card px-4 py-3.5 shadow-(--custom-shadow)">
      <p className="text-sm leading-relaxed text-foreground" style={{ textWrap }}>
        {PARAGRAPH}
      </p>
    </div>
  );
}

export function TextPrettyDemo() {
  return (
    <Demo className="gap-7 px-4">
      <Compare className="w-fit max-w-none grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
        <CompareItem verdict="wrong" caption="text-wrap: wrap">
          <ParagraphCard textWrap="wrap" />
        </CompareItem>
        <CompareItem verdict="right" caption="text-wrap: pretty">
          <ParagraphCard textWrap="pretty" />
        </CompareItem>
      </Compare>
    </Demo>
  );
}
