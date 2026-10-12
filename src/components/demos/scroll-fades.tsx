"use client";

import { CheckCircleIcon, CircleIcon } from "@phosphor-icons/react";
import { type UIEvent, useCallback, useRef, useState } from "react";

import { Compare, CompareItem, CompareLabel } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { cn } from "@/lib/utils";

const TASKS = [
  { title: "Review pull request #482", done: true },
  { title: "Update onboarding copy", done: true },
  { title: "Fix focus ring on the date picker", done: false },
  { title: "Write release notes for 2.4", done: false },
  { title: "Reply to the design review thread", done: false },
  { title: "Migrate icons to the new set", done: false },
  { title: "Check contrast on the dark theme", done: false },
  { title: "Prepare the roadmap for Q4", done: false },
  { title: "Book the offsite venue", done: false },
  { title: "Archive the old marketing site", done: false },
] as const;

/** How far each fade reaches, and how much scroll it takes to grow in. */
const FADE_PX = 40;

const STATIC_FADE_Y = `linear-gradient(to bottom, transparent, black ${FADE_PX}px, black calc(100% - ${FADE_PX}px), transparent)`;

/*
 * The scroll-linked fade, in plain CSS. Each fade size is a registered custom
 * property driven by the element's own scroll position: the start fade grows
 * over the first 40px of scroll and the end fade shrinks over the last 40px.
 * Without scroll-driven animations the declared 40px values apply, which is
 * the static fade, and the demo's scroll listener takes over.
 */
const SCROLL_FADE_CSS = `
@property --fade-start { syntax: "<length>"; inherits: false; initial-value: 0px; }
@property --fade-end { syntax: "<length>"; inherits: false; initial-value: 0px; }
@keyframes scroll-fade-start { from { --fade-start: 0px; } to { --fade-start: ${FADE_PX}px; } }
@keyframes scroll-fade-end { from { --fade-end: ${FADE_PX}px; } to { --fade-end: 0px; } }
.scroll-fade-y, .scroll-fade-x { --fade-start: ${FADE_PX}px; --fade-end: ${FADE_PX}px; }
.scroll-fade-y { mask-image: linear-gradient(to bottom, transparent, black var(--fade-start), black calc(100% - var(--fade-end)), transparent); }
.scroll-fade-x { mask-image: linear-gradient(to right, transparent, black var(--fade-start), black calc(100% - var(--fade-end)), transparent); }
@supports (animation-timeline: scroll()) {
  .scroll-fade-y, .scroll-fade-x {
    --fade-start: 0px;
    --fade-end: 0px;
    animation: scroll-fade-start linear both, scroll-fade-end linear both;
    animation-range: 0 ${FADE_PX}px, calc(100% - ${FADE_PX}px) 100%;
  }
  .scroll-fade-y { animation-timeline: scroll(self y); }
  .scroll-fade-x { animation-timeline: scroll(self x); }
}
`;

function ScrollFadeStyles() {
  return (
    <style href="craft-scroll-fade" precedence="default">
      {SCROLL_FADE_CSS}
    </style>
  );
}

/**
 * Fallback for browsers without scroll-driven animations (Firefox, as of
 * October 2026): write the same two properties from a scroll listener.
 */
function useScrollFadeFallback(axis: "x" | "y") {
  return useCallback(
    (node: HTMLElement | null) => {
      if (!node || CSS.supports("animation-timeline: scroll()")) return;

      const update = () => {
        const position = axis === "y" ? node.scrollTop : node.scrollLeft;
        const size = axis === "y" ? node.clientHeight : node.clientWidth;
        const total = axis === "y" ? node.scrollHeight : node.scrollWidth;
        const remaining = Math.max(0, total - size - position);
        node.style.setProperty(
          "--fade-start",
          `${Math.min(FADE_PX, Math.max(0, position))}px`
        );
        node.style.setProperty(
          "--fade-end",
          `${Math.min(FADE_PX, remaining)}px`
        );
      };

      update();
      node.addEventListener("scroll", update, { passive: true });
      const observer = new ResizeObserver(update);
      observer.observe(node);
      return () => {
        node.removeEventListener("scroll", update);
        observer.disconnect();
      };
    },
    [axis]
  );
}

/* Keeps two scrollers at the same position so both edges can be compared. */
function useSyncedScroll() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const callbacks = useRef<((node: HTMLDivElement | null) => void)[]>([]);
  const lock = useRef(false);

  // Cached per index, so the ref callbacks stay stable across renders.
  const register = useCallback((index: number) => {
    callbacks.current[index] ??= (node: HTMLDivElement | null) => {
      refs.current[index] = node;
    };
    return callbacks.current[index];
  }, []);

  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    if (lock.current) return;
    lock.current = true;
    const source = event.currentTarget;
    for (const node of refs.current) {
      if (node && node !== source) {
        node.scrollTop = source.scrollTop;
        node.scrollLeft = source.scrollLeft;
      }
    }
    requestAnimationFrame(() => {
      lock.current = false;
    });
  }, []);

  return { register, onScroll };
}

/* One stable ref callback that registers for syncing and attaches the
   fallback listener. */
function useScrollFadeRef(
  register: (node: HTMLDivElement | null) => void,
  axis: "x" | "y"
) {
  const fallback = useScrollFadeFallback(axis);
  return useCallback(
    (node: HTMLDivElement | null) => {
      register(node);
      const cleanup = fallback(node);
      return () => {
        register(null);
        cleanup?.();
      };
    },
    [register, fallback]
  );
}

function TaskList() {
  return (
    <ul className="divide-y divide-[#E7E7E7] dark:divide-[#1E1E1E]">
      {TASKS.map((task) => (
        <li
          key={task.title}
          className="flex items-center gap-2 px-3 py-2 text-xs text-foreground"
        >
          {task.done ? (
            <CheckCircleIcon
              aria-hidden="true"
              className="size-3.5 shrink-0 text-emerald-500"
              weight="fill"
            />
          ) : (
            <CircleIcon
              aria-hidden="true"
              className="size-3.5 shrink-0 text-muted-foreground/60"
              weight="regular"
            />
          )}
          <span
            className={cn(
              "truncate",
              task.done && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ListFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full rounded-xl bg-card shadow-(--custom-shadow)">
      {children}
    </div>
  );
}

const LIST_CLASS = "h-44 overflow-y-auto overscroll-contain";

/* Hard edge versus a static mask. */

export function ScrollFadesDemo() {
  const { register, onScroll } = useSyncedScroll();

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare>
        <CompareItem caption="Hard edge" verdict="wrong">
          <ListFrame>
            <div
              aria-label="Tasks, hard edge"
              className={LIST_CLASS}
              onScroll={onScroll}
              ref={register(0)}
              tabIndex={0}
            >
              <TaskList />
            </div>
          </ListFrame>
        </CompareItem>
        <CompareItem caption="40px fade" verdict="right">
          <ListFrame>
            <div
              aria-label="Tasks, faded edges"
              className={LIST_CLASS}
              onScroll={onScroll}
              ref={register(1)}
              style={{ maskImage: STATIC_FADE_Y }}
              tabIndex={0}
            >
              <TaskList />
            </div>
          </ListFrame>
        </CompareItem>
      </Compare>
    </Demo>
  );
}

/* Static fade versus a fade linked to the scroll position. */

export function ScrollFadesEdgeDemo() {
  const { register, onScroll } = useSyncedScroll();
  const linkedRef = useScrollFadeRef(register(1), "y");

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <ScrollFadeStyles />
      <Compare>
        <CompareItem caption="Always faded" verdict="wrong">
          <ListFrame>
            <div
              aria-label="Tasks, static fade"
              className={LIST_CLASS}
              onScroll={onScroll}
              ref={register(0)}
              style={{ maskImage: STATIC_FADE_Y }}
              tabIndex={0}
            >
              <TaskList />
            </div>
          </ListFrame>
        </CompareItem>
        <CompareItem caption="Follows the scroll" verdict="right">
          <ListFrame>
            <div
              aria-label="Tasks, scroll-linked fade"
              className={cn(LIST_CLASS, "scroll-fade-y")}
              onScroll={onScroll}
              ref={linkedRef}
              tabIndex={0}
            >
              <TaskList />
            </div>
          </ListFrame>
        </CompareItem>
      </Compare>
    </Demo>
  );
}

/* Horizontal: a row of filter chips. */

const TOPICS = [
  "All",
  "Design",
  "Engineering",
  "Product",
  "Marketing",
  "Research",
  "Support",
  "Finance",
  "Legal",
  "People",
] as const;

function ChipRow({
  scrollRef,
  onScroll,
  className,
  label,
}: {
  scrollRef: (node: HTMLDivElement | null) => void;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  className?: string;
  label: string;
}) {
  const [active, setActive] = useState<string>("All");

  return (
    <div
      aria-label={label}
      className={cn(
        "flex w-full gap-1.5 overflow-x-auto overscroll-x-contain px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
      onScroll={onScroll}
      ref={scrollRef}
      role="group"
    >
      {TOPICS.map((topic) => (
        <button
          key={topic}
          aria-pressed={active === topic}
          className={cn(
            "h-7 shrink-0 cursor-pointer rounded-full px-3 text-xs font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
            active === topic
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActive(topic)}
          type="button"
        >
          {topic}
        </button>
      ))}
    </div>
  );
}

export function ScrollFadesHorizontalDemo() {
  const { register, onScroll } = useSyncedScroll();
  const linkedRef = useScrollFadeRef(register(1), "x");

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <ScrollFadeStyles />
      <div className="flex w-full max-w-md flex-col gap-2">
        <CompareLabel verdict="wrong" />
        <ListFrame>
          <ChipRow
            label="Topics, hard edge"
            onScroll={onScroll}
            scrollRef={register(0)}
          />
        </ListFrame>
      </div>
      <div className="flex w-full max-w-md flex-col gap-2">
        <CompareLabel verdict="right" />
        <ListFrame>
          <ChipRow
            className="scroll-fade-x"
            label="Topics, scroll-linked fade"
            onScroll={onScroll}
            scrollRef={linkedRef}
          />
        </ListFrame>
      </div>
    </Demo>
  );
}
