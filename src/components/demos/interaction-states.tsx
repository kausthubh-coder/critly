"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import {
  Compare,
  CompareItem,
  RIGHT_ICON,
  WRONG_ICON,
} from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/* One button, six faces. */

type Face = "rest" | "hover" | "pressed" | "focus" | "disabled" | "loading";

const FACES: { face: Face; label: string }[] = [
  { face: "rest", label: "Rest" },
  { face: "hover", label: "Hover" },
  { face: "pressed", label: "Pressed" },
  { face: "focus", label: "Focus" },
  { face: "disabled", label: "Disabled" },
  { face: "loading", label: "Loading" },
];

const BUTTON =
  "relative inline-flex h-9 min-w-20 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background select-none";

const FACE_CLASS: Record<Face, string> = {
  rest: "",
  hover: "bg-foreground/85",
  pressed: "bg-foreground/80 scale-[0.97]",
  focus: "outline-2 outline-offset-2 outline-solid outline-foreground",
  disabled: "opacity-40",
  loading: "",
};

function ButtonLabel({
  loading,
  done = false,
}: {
  loading: boolean;
  done?: boolean;
}) {
  return (
    <>
      {/* The label keeps its width while the spinner is up, so nothing moves. */}
      <span className={cn((loading || done) && "invisible")}>Save</span>
      {loading ? (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner aria-hidden="true" role={undefined} className="size-4" />
        </span>
      ) : null}
      {done ? (
        <span className="absolute inset-0 grid place-items-center">
          <CheckIcon aria-hidden="true" className="size-4" weight="bold" />
        </span>
      ) : null}
    </>
  );
}

export function InteractionStatesDemo() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  function save() {
    if (status !== "idle") return;
    setStatus("loading");
    timers.current.push(
      window.setTimeout(() => setStatus("done"), 1200),
      window.setTimeout(() => setStatus("idle"), 2400)
    );
  }

  const live: Face =
    status === "loading"
      ? "loading"
      : pressed
        ? "pressed"
        : focused
          ? "focus"
          : hovered
            ? "hover"
            : "rest";

  return (
    <Demo className="gap-10 px-4 sm:px-8">
      <div
        aria-hidden="true"
        className="grid w-full max-w-xl grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-6"
      >
        {FACES.map(({ face, label }) => (
          <div key={face} className="flex flex-col items-center gap-3">
            <span className={cn(BUTTON, FACE_CLASS[face])}>
              <ButtonLabel loading={face === "loading"} />
            </span>
            <span
              className={cn(
                "text-xs",
                live === face && status !== "done"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-xl bg-card px-6 py-6 shadow-(--custom-shadow)">
        <button
          aria-busy={status === "loading"}
          className={cn(
            BUTTON,
            "cursor-pointer transition-transform duration-100 ease-out hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.97] active:bg-foreground/80 motion-reduce:transition-none",
            status !== "idle" && "cursor-default"
          )}
          onBlur={() => setFocused(false)}
          onClick={save}
          onFocus={(event) =>
            setFocused(event.currentTarget.matches(":focus-visible"))
          }
          onPointerDown={() => setPressed(true)}
          onPointerEnter={(event) =>
            setHovered(event.pointerType === "mouse")
          }
          onPointerLeave={() => {
            setHovered(false);
            setPressed(false);
          }}
          onPointerUp={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") setPressed(true);
          }}
          onKeyUp={() => setPressed(false)}
          type="button"
        >
          <ButtonLabel
            loading={status === "loading"}
            done={status === "done"}
          />
        </button>
        <span className="text-xs text-muted-foreground">
          Hover, press, tab to it, click it
        </span>
      </div>
    </Demo>
  );
}

/* Hover that changes font-weight vs hover that changes color. */

const TABS = ["Overview", "Activity", "Settings"] as const;

function Tabs({ bold }: { bold: boolean }) {
  return (
    <div className="flex w-full items-center rounded-xl bg-card p-1 shadow-(--custom-shadow)">
      <div className="flex items-center border-r border-dashed border-sky-400 pr-1 dark:border-sky-500">
        {TABS.map((tab, index) => (
          <button
            key={tab}
            className={cn(
              "h-8 cursor-pointer rounded-lg px-2.5 text-sm whitespace-nowrap outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground",
              index === 0 ? "text-foreground" : "text-muted-foreground",
              bold
                ? "hover:font-bold hover:text-foreground"
                : "hover:bg-muted hover:text-foreground"
            )}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HoverShiftDemo() {
  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <Compare className="max-w-xs grid-cols-1 gap-8 sm:grid-cols-1">
        <CompareItem caption="Hover changes weight" verdict="wrong">
          <Tabs bold />
        </CompareItem>
        <CompareItem caption="Hover changes color" verdict="right">
          <Tabs bold={false} />
        </CompareItem>
      </Compare>
    </Demo>
  );
}

/* A silent disabled button vs one that stays enabled and explains. */

type DisabledMode = "disabled" | "explains";

const DISABLED_OPTIONS = [
  { value: "disabled", label: "Disabled", icon: WRONG_ICON },
  { value: "explains", label: "Explains", icon: RIGHT_ICON },
] as const;

export function DisabledReasonDemo() {
  const [mode, setMode] = useState<DisabledMode>("disabled");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<"" | "missing" | "published">("");
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function changeMode(next: DisabledMode) {
    setMode(next);
    setTitle("");
    setMessage("");
  }

  function publish(event: React.FormEvent) {
    event.preventDefault();
    if (title.trim() === "") {
      setMessage("missing");
      inputRef.current?.focus();
      return;
    }
    setMessage("published");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setTitle("");
      setMessage("");
    }, 1600);
  }

  const silent = mode === "disabled";
  const blocked = silent && title.trim() === "";

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <form
        className="flex w-full max-w-xs flex-col gap-3 rounded-xl bg-card p-4 shadow-(--custom-shadow)"
        noValidate
        onSubmit={publish}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Post title</span>
          <input
            ref={inputRef}
            aria-describedby="disabled-reason-message"
            aria-invalid={message === "missing" || undefined}
            className={cn(
              "h-9 w-full rounded-lg bg-transparent px-2.5 text-base shadow-(--custom-shadow) outline-none placeholder:text-muted-foreground/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground dark:bg-muted/40",
              message === "missing" &&
                "shadow-[0_0_0_1px_var(--color-destructive)]"
            )}
            onChange={(event) => {
              setTitle(event.target.value);
              if (message === "missing") setMessage("");
            }}
            placeholder="Untitled"
            value={title}
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <span
            id="disabled-reason-message"
            aria-live="polite"
            className={cn(
              "min-w-0 text-xs",
              message === "missing"
                ? "text-destructive"
                : message === "published"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
            )}
          >
            {message === "missing"
              ? "Add a title to publish."
              : message === "published"
                ? "Published"
                : ""}
          </span>
          <button
            className="inline-flex h-8 shrink-0 cursor-pointer items-center rounded-full bg-foreground px-3.5 text-xs font-medium text-background transition-transform duration-100 ease-out outline-none hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 disabled:hover:bg-foreground motion-reduce:transition-none"
            disabled={blocked}
            type="submit"
          >
            Publish
          </button>
        </div>
      </form>
      <SegmentedControl
        ariaLabel="Disabled button comparison"
        onChange={changeMode}
        options={DISABLED_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}
