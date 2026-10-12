"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  "English",
  "Dansk",
  "Deutsch",
  "Español",
  "Français",
  "Italiano",
  "Nederlands",
  "Norsk",
  "Polski",
  "Português",
  "Suomi",
  "Svenska",
  "Türkçe",
  "Čeština",
  "Ελληνικά",
  "日本語",
  "한국어",
  "中文",
] as const;

type Containment = "auto" | "contain";

const CONTAINMENT_OPTIONS = [
  { value: "auto", label: "Chains", icon: WRONG_ICON },
  { value: "contain", label: "Contained", icon: RIGHT_ICON },
] as const;

/** Placeholder page that sits behind the overlay. Tall enough to scroll. */
function FakePage() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-5 p-5">
      <div className="flex items-center justify-between">
        <div className="h-2.5 w-14 rounded-full bg-foreground/25" />
        <div className="flex gap-2">
          <div className="h-2 w-8 rounded-full bg-foreground/10" />
          <div className="h-2 w-8 rounded-full bg-foreground/10" />
          <div className="h-2 w-8 rounded-full bg-foreground/10" />
        </div>
      </div>
      {Array.from({ length: 4 }, (_, section) => (
        <div key={section} className="flex flex-col gap-2.5">
          <div className="h-3 w-2/5 rounded-full bg-foreground/20" />
          <div className="h-2 w-full rounded-full bg-foreground/10" />
          <div className="h-2 w-11/12 rounded-full bg-foreground/10" />
          <div className="h-2 w-4/5 rounded-full bg-foreground/10" />
          <div
            className={cn(
              "mt-2 h-24 rounded-lg",
              section % 2 === 0 ? "bg-foreground/8" : "bg-foreground/5"
            )}
          />
          <div className="h-2 w-full rounded-full bg-foreground/10" />
          <div className="h-2 w-2/3 rounded-full bg-foreground/10" />
        </div>
      ))}
    </div>
  );
}

export function OverlayScrollDemo() {
  const [mode, setMode] = useState<Containment>("auto");
  const [pageOffset, setPageOffset] = useState(0);
  const pageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const titleId = useId();

  function changeMode(next: Containment) {
    setMode(next);
    // Start every attempt from the top so the difference is easy to repeat.
    pageRef.current?.scrollTo({ top: 0 });
    listRef.current?.scrollTo({ top: 0 });
    setPageOffset(0);
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="relative h-72 w-full max-w-md overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)">
        {/* The fake page's scroller. `contain` here keeps the demo from ever
            scrolling the real article, so it behaves like a root viewport. */}
        <div
          ref={pageRef}
          className="scrollbar-hidden h-full overflow-y-auto overscroll-contain"
          onScroll={(event) =>
            setPageOffset(Math.round(event.currentTarget.scrollTop))
          }
        >
          {/* The overlay lives inside the page scroller so the list chains to
              it, and sticks to the top so it stays put like a fixed layer. */}
          <div className="sticky top-0 z-10 -mb-72 flex h-72 items-center justify-center bg-black/20 p-4 dark:bg-black/30">
            <div
              aria-labelledby={titleId}
              className="w-full max-w-64 overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)"
              role="dialog"
            >
              <p
                id={titleId}
                className="px-4 py-2.5 text-xs font-medium text-foreground"
              >
                Language
              </p>
              <ul
                ref={listRef}
                aria-labelledby={titleId}
                className={cn(
                  "h-44 overflow-y-auto border-t border-border p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  mode === "contain" ? "overscroll-contain" : "overscroll-auto"
                )}
                tabIndex={0}
              >
                {LANGUAGES.map((language, index) => (
                  <li
                    key={language}
                    className={cn(
                      "flex h-8 items-center justify-between rounded-lg px-3 text-xs",
                      index === 0
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {language}
                    {index === 0 ? (
                      <CheckIcon
                        aria-hidden="true"
                        className="size-3.5"
                        weight="bold"
                      />
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <FakePage />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Page behind moved{" "}
        <span
          className={cn(
            "tabular-nums",
            pageOffset > 0 ? "text-destructive" : "text-foreground"
          )}
        >
          {pageOffset}px
        </span>
      </p>

      <SegmentedControl
        ariaLabel="Overscroll behavior"
        onChange={changeMode}
        options={CONTAINMENT_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}

type FocusMode = "lost" | "managed";

const FOCUS_OPTIONS = [
  { value: "lost", label: "Unmanaged", icon: WRONG_ICON },
  { value: "managed", label: "Managed", icon: RIGHT_ICON },
] as const;

const FIELDS = [
  { id: "name", label: "Name", action: "Rename", title: "Rename project" },
  { id: "domain", label: "Domain", action: "Edit", title: "Edit domain" },
  { id: "owner", label: "Owner", action: "Change", title: "Change owner" },
] as const;

type FieldId = (typeof FIELDS)[number]["id"];

// `focus:` rather than `focus-visible:` on purpose: the demo is about where
// focus goes, so the ring shows even after a mouse click.
const FOCUS_RING =
  "outline-none focus:outline-2 focus:outline-offset-2 focus:outline-solid focus:outline-foreground";

export function OverlayFocusDemo() {
  const [mode, setMode] = useState<FocusMode>("lost");
  const [openField, setOpenField] = useState<FieldId | null>(null);
  const [values, setValues] = useState<Record<FieldId, string>>({
    name: "Critly",
    domain: "craft.dev",
    owner: "Ada Lovelace",
  });
  const [draft, setDraft] = useState("");
  const [focusLabel, setFocusLabel] = useState("Page body");
  const [closedOnce, setClosedOnce] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const openRef = useRef(false);
  const restoreFocusRef = useRef(false);
  const titleId = useId();
  const managed = mode === "managed";
  const field = FIELDS.find((item) => item.id === openField);

  const readFocus = useCallback(() => {
    const element = document.activeElement as HTMLElement | null;
    const frame = frameRef.current;
    if (!element || element === document.body) {
      setFocusLabel("Page body");
    } else if (frame?.contains(element)) {
      const label = element.dataset.focusLabel ?? "Demo";
      const behind = openRef.current && element.closest("[data-page]");
      setFocusLabel(behind ? `${label}, behind the dialog` : label);
    } else {
      setFocusLabel("Outside the demo");
    }
  }, []);

  useEffect(() => {
    // Removing a focused node does not reliably fire focusout, so also read
    // on the next frame after anything that might have moved focus.
    const later = () => requestAnimationFrame(readFocus);
    document.addEventListener("focusin", readFocus);
    document.addEventListener("focusout", later);
    return () => {
      document.removeEventListener("focusin", readFocus);
      document.removeEventListener("focusout", later);
    };
  }, [readFocus]);

  useEffect(() => {
    openRef.current = openField !== null;
    if (openField && managed) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    // Runs after the page behind is no longer inert, so the trigger can
    // take focus again.
    if (!openField && restoreFocusRef.current) {
      restoreFocusRef.current = false;
      triggerRef.current?.focus();
    }
    requestAnimationFrame(readFocus);
  }, [openField, managed, readFocus]);

  const close = useCallback(
    (save: boolean) => {
      if (save && openField) {
        const next = draft.trim();
        if (next) setValues((current) => ({ ...current, [openField]: next }));
      }
      restoreFocusRef.current = managed;
      setOpenField(null);
      setClosedOnce(true);
    },
    [draft, managed, openField]
  );

  useEffect(() => {
    if (!openField || !managed) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, managed, openField]);

  function open(id: FieldId, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setDraft(values[id]);
    setOpenField(id);
  }

  function changeMode(next: FocusMode) {
    restoreFocusRef.current = false;
    setOpenField(null);
    setClosedOnce(false);
    setMode(next);
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div
        ref={frameRef}
        className="relative h-64 w-full max-w-md overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)"
      >
        <div
          className="flex h-full flex-col p-4 sm:p-5"
          data-page
          inert={managed && openField !== null}
        >
          <p className="text-sm font-medium text-foreground">Project</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            General settings
          </p>
          <div className="mt-4 divide-y divide-border">
            {FIELDS.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="truncate text-xs text-foreground">
                    {values[item.id]}
                  </p>
                </div>
                <button
                  className={cn(
                    "h-7 shrink-0 cursor-pointer rounded-full bg-secondary px-3 text-xs font-medium text-secondary-foreground shadow-(--custom-shadow-secondary) hover:bg-secondary/80 dark:hover:bg-muted-foreground/25",
                    FOCUS_RING
                  )}
                  data-focus-label={`${item.action} button`}
                  onClick={(event) => open(item.id, event.currentTarget)}
                  type="button"
                >
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {field ? (
          <div
            className="absolute inset-0 z-10 flex animate-in items-center justify-center bg-black/20 p-4 duration-150 fade-in-0 dark:bg-black/30"
            onClick={(event) => {
              if (managed && event.target === event.currentTarget) close(false);
            }}
          >
            <div
              aria-labelledby={titleId}
              aria-modal={managed || undefined}
              className="w-full max-w-64 animate-in rounded-xl bg-card p-4 shadow-(--custom-shadow) duration-150 fade-in-0 zoom-in-[0.97]"
              onKeyDown={(event) => {
                // Keep Tab cycling inside the dialog, as showModal() would.
                if (!managed || event.key !== "Tab") return;
                const items =
                  event.currentTarget.querySelectorAll<HTMLElement>(
                    "input, button"
                  );
                const first = items[0];
                const last = items[items.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                  event.preventDefault();
                  last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                  event.preventDefault();
                  first?.focus();
                }
              }}
              role="dialog"
            >
              <p
                id={titleId}
                className="text-xs font-medium text-foreground"
              >
                {field.title}
              </p>
              <form
                className="mt-3 flex flex-col gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  close(true);
                }}
              >
                <input
                  ref={inputRef}
                  aria-label={field.label}
                  className={cn(
                    "h-8 w-full rounded-lg bg-muted px-2.5 text-base text-foreground sm:text-xs",
                    FOCUS_RING
                  )}
                  data-focus-label={`${field.label} field, in the dialog`}
                  onChange={(event) => setDraft(event.target.value)}
                  spellCheck={false}
                  value={draft}
                />
                <div className="flex justify-end gap-2">
                  <button
                    className={cn(
                      "h-7 cursor-pointer rounded-full px-3 text-xs font-medium text-muted-foreground hover:text-foreground",
                      FOCUS_RING
                    )}
                    data-focus-label="Cancel, in the dialog"
                    onClick={() => close(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className={cn(
                      "h-7 cursor-pointer rounded-full bg-neutral-800 px-3 text-xs font-medium text-primary-foreground shadow-(--custom-shadow-primary) hover:bg-primary/80 dark:bg-neutral-200 dark:hover:bg-primary/90",
                      FOCUS_RING
                    )}
                    data-focus-label="Save, in the dialog"
                    type="submit"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Focus is on{" "}
        <span
          className={
            focusLabel.endsWith("behind the dialog") ||
            (closedOnce && focusLabel === "Page body")
              ? "text-destructive"
              : "text-foreground"
          }
        >
          {focusLabel}
        </span>
      </p>

      <SegmentedControl
        ariaLabel="Focus handling"
        onChange={changeMode}
        options={FOCUS_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}
