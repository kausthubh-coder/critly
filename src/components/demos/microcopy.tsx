"use client";

import {
  CreditCardIcon,
  FileImageIcon,
  SpinnerGapIcon,
  WarningCircleIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Copy = "generic" | "specific";

const COPY_OPTIONS = [
  { value: "generic", label: "Generic", icon: WRONG_ICON },
  { value: "specific", label: "Specific", icon: RIGHT_ICON },
] as const;

const DIVIDER = "border-[#E7E7E7] dark:border-[#1E1E1E]";

const INPUT =
  "h-9 w-full min-w-0 rounded-lg bg-transparent px-3 text-base text-foreground shadow-(--custom-shadow) outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground aria-invalid:shadow-[0_0_0_1px_var(--color-destructive)] sm:text-sm dark:bg-muted/40";

const PROJECT = "Website redesign";

/* Every string in the card changes between the two modes. */
const SETTINGS_COPY = {
  generic: {
    title: "Project Settings",
    nameLabel: "What do you want to call it?",
    nameError: "Invalid input",
    notifyLabel: "Enable Notifications?",
    notifyHint: "Toggle on/off",
    remove: "Remove",
    discard: "Cancel",
    save: "OK",
    saving: "Loading...",
    saved: "Success!",
    confirmTitle: () => "Are you sure?",
    confirmBody: "This workspace will be deleted.",
    confirmNo: "No",
    confirmYes: "Yes",
    deleted: () => "Done!",
  },
  specific: {
    title: "Project settings",
    nameLabel: "Project name",
    nameError: "Enter a project name",
    notifyLabel: "Email notifications",
    notifyHint: "A daily summary of this project",
    remove: "Delete project",
    discard: "Discard",
    save: "Save changes",
    saving: "Saving…",
    saved: "Saved",
    confirmTitle: (name: string) => `Delete “${name}”?`,
    confirmBody: "Its 12 files are deleted too. You can’t undo this.",
    confirmNo: "Cancel",
    confirmYes: "Delete project",
    deleted: (name: string) => `“${name}” deleted`,
  },
} as const;

type Phase = "idle" | "saving" | "saved" | "confirm" | "deleted";

export function MicrocopyDemo() {
  const [mode, setMode] = useState<Copy>("generic");
  const [name, setName] = useState(PROJECT);
  const [notify, setNotify] = useState(true);
  const [error, setError] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  const removeRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const copy = SETTINGS_COPY[mode];
  const shownName = name.trim() || PROJECT;

  function clearTimers() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }

  useEffect(() => clearTimers, []);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  function reset() {
    clearTimers();
    setName(PROJECT);
    setNotify(true);
    setError(false);
    setPhase("idle");
  }

  function save() {
    if (phase === "saving") return;
    if (name.trim() === "") {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    clearTimers();
    setPhase("saving");
    later(() => setPhase("saved"), 900);
    later(() => setPhase("idle"), 2400);
  }

  function askToDelete() {
    clearTimers();
    setPhase("confirm");
    requestAnimationFrame(() => keepRef.current?.focus());
  }

  function cancelDelete() {
    setPhase("idle");
    requestAnimationFrame(() => removeRef.current?.focus());
  }

  function confirmDelete() {
    setPhase("deleted");
    requestAnimationFrame(() => removeRef.current?.focus());
    later(reset, 1800);
  }

  const status =
    phase === "saving"
      ? copy.saving
      : phase === "saved"
        ? copy.saved
        : phase === "deleted"
          ? copy.deleted(shownName)
          : "";

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="w-full max-w-sm rounded-xl bg-card shadow-(--custom-shadow)">
        <div
          className={cn("flex h-11 items-center border-b px-4", DIVIDER)}
        >
          <span className="truncate text-xs font-medium text-foreground">
            {copy.title}
          </span>
        </div>

        <div className="h-40 p-4">
          {phase === "confirm" ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <WarningIcon
                aria-hidden="true"
                className="size-5 text-destructive"
              />
              <p className="max-w-full truncate text-sm font-medium text-foreground">
                {copy.confirmTitle(shownName)}
              </p>
              {copy.confirmBody ? (
                <p className="max-w-60 text-xs text-pretty text-muted-foreground">
                  {copy.confirmBody}
                </p>
              ) : null}
            </div>
          ) : phase === "deleted" ? (
            <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
              <span className="max-w-full truncate">{status}</span>
            </div>
          ) : (
            <div className="flex flex-col">
              <label
                className="mb-1.5 text-xs text-muted-foreground"
                htmlFor={`${id}-name`}
              >
                {copy.nameLabel}
              </label>
              <input
                ref={inputRef}
                id={`${id}-name`}
                aria-describedby={error ? `${id}-error` : undefined}
                aria-invalid={error || undefined}
                autoComplete="off"
                className={INPUT}
                onChange={(event) => {
                  setName(event.target.value);
                  if (event.target.value.trim() !== "") setError(false);
                }}
                spellCheck={false}
                value={name}
              />
              <p
                id={`${id}-error`}
                className="mt-1.5 h-4 text-xs text-destructive"
              >
                {error ? copy.nameError : ""}
              </p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <label
                    className="truncate text-xs font-medium text-foreground"
                    htmlFor={`${id}-notify`}
                  >
                    {copy.notifyLabel}
                  </label>
                  <span className="truncate text-xs text-muted-foreground">
                    {copy.notifyHint}
                  </span>
                </div>
                <Switch
                  checked={notify}
                  id={`${id}-notify`}
                  onCheckedChange={setNotify}
                />
              </div>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex h-14 items-center gap-1 border-t px-2.5 [&_button]:text-xs",
            DIVIDER
          )}
        >
          {phase === "confirm" ? (
            <>
              <Button
                ref={keepRef}
                className="ml-auto"
                onClick={cancelDelete}
                size="sm"
                variant="ghost"
              >
                {copy.confirmNo}
              </Button>
              <Button onClick={confirmDelete} size="sm" variant="destructive">
                {copy.confirmYes}
              </Button>
            </>
          ) : (
            <>
              <Button
                ref={removeRef}
                className="-ml-1"
                disabled={phase === "deleted"}
                onClick={askToDelete}
                size="sm"
                variant="ghost-destructive"
              >
                {copy.remove}
              </Button>
              <Button
                className="ml-auto"
                disabled={phase === "deleted"}
                onClick={reset}
                size="sm"
                variant="ghost"
              >
                {copy.discard}
              </Button>
              <Button
                className="min-w-26"
                disabled={phase === "deleted"}
                onClick={save}
                size="sm"
              >
                {phase === "saving" ? (
                  <SpinnerGapIcon
                    aria-hidden="true"
                    className="animate-spin motion-reduce:animate-none"
                  />
                ) : null}
                {phase === "saving"
                  ? copy.saving
                  : phase === "saved"
                    ? copy.saved
                    : copy.save}
              </Button>
            </>
          )}
        </div>
        <span aria-live="polite" className="sr-only">
          {status}
        </span>
      </div>

      <SegmentedControl
        ariaLabel="Copy"
        onChange={(next) => {
          setMode(next);
          reset();
        }}
        options={COPY_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}

/* Three errors, each said vaguely and then specifically. */

const ERRORS = [
  {
    key: "upload",
    Icon: FileImageIcon,
    title: "beach-day.heic",
    meta: "24 MB",
    generic: "An error occurred.",
    specific: "This photo is 24 MB. Choose one under 10 MB.",
  },
  {
    key: "card",
    Icon: CreditCardIcon,
    title: "Visa •••• 4242",
    meta: "$68.00",
    generic: "Error 402: Payment Required",
    specific: "Your bank declined this card. Try another card or call your bank.",
  },
  {
    key: "username",
    Icon: null,
    title: "@jane",
    meta: "Username",
    generic: "You entered an invalid username!",
    specific: "@jane is taken. Try @jane-cooper or @janec.",
  },
] as const;

export function ErrorMessagesDemo() {
  const [mode, setMode] = useState<Copy>("generic");

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <ul className="flex w-full max-w-sm flex-col rounded-xl bg-card shadow-(--custom-shadow)">
        {ERRORS.map(({ key, Icon, title, meta, ...messages }, index) => (
          <li
            key={key}
            className={cn(
              "flex flex-col gap-2 px-4 py-3.5",
              index > 0 && cn("border-t", DIVIDER)
            )}
          >
            <div className="flex items-center gap-2.5">
              {Icon ? (
                <Icon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid size-4 shrink-0 place-items-center rounded-full bg-muted text-[9px] font-medium text-muted-foreground"
                >
                  J
                </span>
              )}
              <span className="min-w-0 truncate text-xs font-medium text-foreground">
                {title}
              </span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                {meta}
              </span>
            </div>
            <p className="flex min-h-8 gap-1.5 text-xs leading-4 text-destructive">
              <WarningCircleIcon
                aria-hidden="true"
                className="size-4 shrink-0"
                weight="fill"
              />
              <span className="text-pretty">{messages[mode]}</span>
            </p>
          </li>
        ))}
      </ul>

      <SegmentedControl
        ariaLabel="Error messages"
        onChange={setMode}
        options={COPY_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}

/* Counts: string concatenation vs Intl.PluralRules + Intl.NumberFormat. */

type Counting = "naive" | "plural";

const COUNTING_OPTIONS = [
  { value: "naive", label: "Hard-coded", icon: WRONG_ICON },
  { value: "plural", label: "Intl.PluralRules", icon: RIGHT_ICON },
] as const;

const COUNTS = ["0", "1", "2", "24", "1284"] as const;
type Count = (typeof COUNTS)[number];

const plural = new Intl.PluralRules("en-US");
const number = new Intl.NumberFormat("en-US");
const FILE_FORMS: Partial<Record<Intl.LDMLPluralRule, string>> = {
  one: "file",
  other: "files",
};

function files(count: number) {
  const form = FILE_FORMS[plural.select(count)] ?? FILE_FORMS.other;
  return `${number.format(count)} ${form}`;
}

const COUNT_OPTIONS = COUNTS.map((value) => ({
  value,
  label: number.format(Number(value)),
}));

export function PluralCountDemo() {
  const [mode, setMode] = useState<Counting>("naive");
  const [count, setCount] = useState<Count>("1");
  const n = Number(count);
  const right = mode === "plural";

  const selected = right
    ? n === 0
      ? "No files selected"
      : `${files(n)} selected`
    : `${n} files selected`;
  const action = right ? (n === 0 ? "Delete" : `Delete ${files(n)}`) : `Delete ${n} files`;
  const upload = right
    ? n === 0
      ? "Nothing to upload"
      : `Uploading ${files(n)}…`
    : `Uploading ${n} files...`;

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="w-full max-w-sm rounded-xl bg-card shadow-(--custom-shadow)">
        <div
          className={cn(
            "flex h-12 items-center justify-between gap-3 border-b pr-2 pl-4",
            DIVIDER
          )}
        >
          <span className="min-w-0 truncate text-xs font-medium text-foreground tabular-nums">
            {selected}
          </span>
          <Button
            disabled={right && n === 0}
            onClick={() => setCount("0")}
            size="sm"
            variant="destructive"
            className="tabular-nums"
          >
            {action}
          </Button>
        </div>
        <div className="flex h-11 items-center gap-2 px-4 text-xs text-muted-foreground">
          {n > 0 ? (
            <SpinnerGapIcon
              aria-hidden="true"
              className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none"
            />
          ) : null}
          <span className="truncate tabular-nums">{upload}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <SegmentedControl
          ariaLabel="Number of files"
          className="tabular-nums"
          onChange={setCount}
          options={COUNT_OPTIONS}
          value={count}
        />
        <SegmentedControl
          ariaLabel="Counting"
          onChange={setMode}
          options={COUNTING_OPTIONS}
          value={mode}
        />
      </div>
    </Demo>
  );
}
