"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { CompareLabel, RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const BASE_FONT = 14;
const BAND = [45, 75] as const;

const PARAGRAPH =
  "Your eyes do not glide along a line of text. They jump a few words at a time, then make one long sweep back to the left to find the next line. Short lines break that rhythm with constant returns. Long lines make the sweep so long that it is easy to land on the wrong line.";

const LONG_PARAGRAPH =
  "Reading is a series of small jumps. Your eyes land on a word, take in a few letters on either side, and hop forward to the next spot. At the end of the line they make one long jump back to the left and down, and that return is the part that fails first. The further the eye has to travel, the flatter that diagonal gets, and the easier it is to drop onto the line below the one you meant, or to read the same line twice. Nobody notices this as a problem with the layout. They just feel that the page is tiring and start to skim.";

function unwrap(value: number | readonly number[]) {
  return Array.isArray(value) ? value[0] : (value as number);
}

type Line = { count: number; left: number; right: number; mid: number };

/** Groups every character of a paragraph's text node into rendered lines. */
function measureLines(paragraph: HTMLElement, origin: DOMRect): Line[] {
  const node = paragraph.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return [];
  const text = node as Text;
  const range = document.createRange();
  const lines: (Line & { top: number })[] = [];

  for (let i = 0; i < text.length; i++) {
    range.setStart(text, i);
    range.setEnd(text, i + 1);
    const rect = range.getClientRects()[0];
    if (!rect) continue;
    const last = lines[lines.length - 1];
    if (last && Math.abs(rect.top - last.top) < rect.height / 2) {
      last.count += 1;
      if (rect.width > 0 && text.data[i] !== " ") {
        last.right = Math.max(last.right, rect.right - origin.left);
      }
    } else {
      lines.push({
        top: rect.top,
        count: 1,
        left: rect.left - origin.left,
        right: rect.right - origin.left,
        mid: rect.top + rect.height / 2 - origin.top,
      });
    }
  }
  return lines;
}

/** Average characters per line, ignoring the short last line. */
function averageCount(lines: Line[]) {
  const full = lines.length > 1 ? lines.slice(0, -1) : lines;
  if (full.length === 0) return 0;
  return Math.round(full.reduce((sum, line) => sum + line.count, 0) / full.length);
}

/**
 * Measures the available width and the font's average character width (as a
 * fraction of the font size), so a measure in characters can be turned into
 * pixels. Text that would not fit at 14px is set smaller instead, so very long
 * measures still show on a narrow column - they just zoom out.
 */
function useCharacterBox(text: string) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<{ available: number; perChar: number } | null>(
    null
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    const probe = probeRef.current;
    if (!wrap || !probe) return;
    let cancelled = false;

    const update = () => {
      if (cancelled) return;
      const perChar = probe.getBoundingClientRect().width / text.length / BASE_FONT;
      setBox({ available: wrap.clientWidth, perChar });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrap);
    document.fonts?.ready.then(update);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [text]);

  // Clipped to zero height so the long single line never causes overflow.
  const probe = (
    <span
      aria-hidden="true"
      className="pointer-events-none invisible absolute inset-x-0 top-0 h-0 overflow-hidden"
    >
      <span
        ref={probeRef}
        className="whitespace-nowrap"
        style={{ fontSize: BASE_FONT }}
      >
        {text}
      </span>
    </span>
  );

  /** Font size and width for a measure of `chars`, fitted to the column. */
  const fit = useCallback(
    (chars: number, fitChars = chars) => {
      if (!box) {
        return { fontSize: BASE_FONT, width: `min(100%, ${chars * 0.5}em)` };
      }
      const fontSize = Math.min(
        BASE_FONT,
        box.available / ((fitChars + 2) * box.perChar)
      );
      // Two characters of slack: words that don't fit wrap whole, so lines
      // come out a little short of the box.
      return { fontSize, width: (chars + 2) * box.perChar * fontSize };
    },
    [box]
  );

  return { wrapRef, probe, fit, box };
}

function Guide({ x, label }: { x: number; label: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -top-5 bottom-0 border-l border-dashed border-sky-400 dark:border-sky-500"
      style={{ left: x }}
    >
      <span className="absolute top-0 left-1 text-[9px] leading-none text-sky-400 tabular-nums dark:text-sky-500">
        {label}
      </span>
    </span>
  );
}

export function LineLengthDemo() {
  const [chars, setChars] = useState(90);
  const [count, setCount] = useState(chars);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const { wrapRef, probe, fit, box } = useCharacterBox(PARAGRAPH);
  const { fontSize, width } = fit(chars);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const paragraph = paragraphRef.current;
    if (!wrap || !paragraph || !box) return;
    setCount(averageCount(measureLines(paragraph, wrap.getBoundingClientRect())));
  }, [box, chars, fontSize, wrapRef]);

  const verdict =
    count < BAND[0] ? "Too short" : count > BAND[1] ? "Too long" : "Comfortable";
  const scaled = fontSize < BASE_FONT - 0.01;

  return (
    <Demo className="gap-6 px-0 sm:px-4">
      <label className="grid w-full max-w-xs gap-2.5">
        <span className="flex justify-between text-xs text-muted-foreground">
          Line length
          <span className="text-foreground tabular-nums">
            {count} characters
          </span>
        </span>
        <Slider
          aria-label="Line length in characters"
          max={120}
          min={25}
          onValueChange={(next) => setChars(unwrap(next))}
          step={1}
          value={[chars]}
        />
      </label>

      <div className="w-full rounded-xl bg-card px-4 pt-9 pb-5 shadow-(--custom-shadow) sm:px-5">
        <div ref={wrapRef} className="relative">
          {probe}
          {box
            ? BAND.map((band) => {
                const x = band * box.perChar * fontSize;
                return x <= box.available ? (
                  <Guide key={band} label={String(band)} x={x} />
                ) : null;
              })
            : null}
          <p
            ref={paragraphRef}
            className="text-foreground"
            style={{ fontSize, lineHeight: 1.5, width }}
          >
            {PARAGRAPH}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <CompareLabel verdict={verdict === "Comfortable" ? "right" : "wrong"}>
          {verdict}
        </CompareLabel>
        <span
          className={cn(
            "text-[10px] text-muted-foreground transition-opacity",
            scaled ? "opacity-100" : "opacity-0"
          )}
          aria-hidden={!scaled}
        >
          Zoomed out to fit
        </span>
      </div>
    </Demo>
  );
}

type Measure = "long" | "comfortable";

const MEASURE_OPTIONS = [
  { value: "long", label: "120 characters", icon: WRONG_ICON },
  { value: "comfortable", label: "65 characters", icon: RIGHT_ICON },
] as const;

const MEASURE_CHARS: Record<Measure, number> = { long: 120, comfortable: 65 };

export function LineReturnDemo() {
  const [mode, setMode] = useState<Measure>("long");
  const [sweeps, setSweeps] = useState<Line[]>([]);
  const refs = useRef<Record<Measure, HTMLParagraphElement | null>>({
    long: null,
    comfortable: null,
  });
  const { wrapRef, probe, fit, box } = useCharacterBox(LONG_PARAGRAPH);
  // Both measures share one font size, set so 120 characters fit the column.
  const fontSize = fit(120).fontSize;
  const sweep =
    sweeps.length > 2 ? { from: sweeps[1], to: sweeps[2] } : null;

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const paragraph = refs.current[mode];
    if (!wrap || !paragraph || !box) return;
    setSweeps(measureLines(paragraph, wrap.getBoundingClientRect()));
  }, [box, fontSize, mode, wrapRef]);

  return (
    <Demo className="gap-8 px-0 sm:px-4">
      <div className="w-full rounded-xl bg-card px-4 py-5 shadow-(--custom-shadow) sm:px-5">
        <div ref={wrapRef} className="relative grid place-items-center">
          {probe}
          {(Object.keys(MEASURE_CHARS) as Measure[]).map((measure) => (
            <p
              key={measure}
              ref={(node) => {
                refs.current[measure] = node;
              }}
              aria-hidden={measure !== mode}
              className={cn(
                "[grid-area:1/1] text-muted-foreground",
                measure !== mode && "invisible"
              )}
              style={{
                fontSize,
                lineHeight: 1.5,
                width: fit(MEASURE_CHARS[measure], 120).width,
              }}
            >
              {LONG_PARAGRAPH}
            </p>
          ))}
          {/* One return sweep, from the end of the second line to the start
              of the third: long and flat at 120, short and steep at 65. */}
          {sweep ? (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full overflow-visible"
            >
              <line
                className="stroke-sky-400 dark:stroke-sky-500"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                x1={sweep.from.right}
                x2={sweep.to.left}
                y1={sweep.from.mid}
                y2={sweep.to.mid}
              />
              <circle
                className="fill-sky-400 dark:fill-sky-500"
                cx={sweep.from.right}
                cy={sweep.from.mid}
                r={2.5}
              />
              <circle
                className="fill-sky-400 dark:fill-sky-500"
                cx={sweep.to.left}
                cy={sweep.to.mid}
                r={2.5}
              />
            </svg>
          ) : null}
        </div>
      </div>

      <SegmentedControl
        ariaLabel="Line length"
        onChange={setMode}
        options={MEASURE_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}

export function LineHeightDemo() {
  const [lineHeight, setLineHeight] = useState(1.2);
  const { wrapRef, probe, fit } = useCharacterBox(PARAGRAPH);
  const { fontSize, width } = fit(65);

  return (
    <Demo className="gap-6 px-0 sm:px-4">
      <label className="grid w-full max-w-xs gap-2.5">
        <span className="flex justify-between text-xs text-muted-foreground">
          Line height
          <span className="text-foreground tabular-nums">
            {lineHeight.toFixed(2)}
          </span>
        </span>
        <Slider
          aria-label="Line height"
          max={2}
          min={1}
          onValueChange={(next) => setLineHeight(unwrap(next))}
          step={0.05}
          value={[lineHeight]}
        />
      </label>

      <div className="flex w-full justify-center rounded-xl bg-card px-4 py-5 shadow-(--custom-shadow) sm:px-5">
        <div ref={wrapRef} className="relative flex w-full justify-center">
          {probe}
          <p
            className="text-pretty text-foreground"
            style={{ fontSize, lineHeight, width }}
          >
            {PARAGRAPH}
          </p>
        </div>
      </div>
    </Demo>
  );
}
