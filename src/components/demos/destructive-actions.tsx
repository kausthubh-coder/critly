"use client";

import {
  ArrowCounterClockwiseIcon,
  FileTextIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const UNDO_MS = 5000;
const ROW_H = 36;

const FILES = [
  { name: "Invoice 0412.pdf", size: "84 KB" },
  { name: "Brand assets.zip", size: "12 MB" },
  { name: "Q4 report.pdf", size: "2.1 MB" },
  { name: "Team photo.jpg", size: "3.4 MB" },
  { name: "Notes.md", size: "6 KB" },
] as const;

type FileName = (typeof FILES)[number]["name"];

/** Keep Tab cycling inside a dialog, as showModal() would. */
function trapTab(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") return;
  const items = event.currentTarget.querySelectorAll<HTMLElement>("button");
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}

type DeleteMode = "confirm" | "undo";

const DELETE_OPTIONS = [
  { value: "confirm", label: "Are you sure?", icon: WRONG_ICON },
  { value: "undo", label: "Undo", icon: RIGHT_ICON },
] as const;

export function DeleteUndoDemo() {
  const [mode, setMode] = useState<DeleteMode>("confirm");
  const [files, setFiles] = useState<FileName[]>(FILES.map((f) => f.name));
  // Soft-deleted: gone from the list, still restorable until the toast ends.
  const [pending, setPending] = useState<FileName[]>([]);
  const [toastKey, setToastKey] = useState(0);
  const [asking, setAsking] = useState<FileName | null>(null);
  const [clicks, setClicks] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const listRef = useRef<HTMLUListElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);
  const okRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const deleted = FILES.length - files.length;

  /** After a row goes, keep keyboard focus on a neighbouring delete button. */
  const focusNear = useCallback((index: number) => {
    requestAnimationFrame(() => {
      const buttons =
        listRef.current?.querySelectorAll<HTMLButtonElement>(
          "button[data-delete]:not([data-leaving])"
        ) ?? [];
      const target = buttons[Math.min(index, buttons.length - 1)];
      (target ?? resetRef.current)?.focus();
    });
  }, []);

  function remove(name: FileName) {
    const index = files.indexOf(name);
    setFiles((current) => current.filter((file) => file !== name));
    return index;
  }

  function onDelete(name: FileName, trigger: HTMLButtonElement) {
    setClicks((count) => count + 1);
    if (mode === "confirm") {
      setAsking(name);
      return;
    }
    trigger.dataset.leaving = "";
    const index = remove(name);
    setPending((current) => [...current, name]);
    // A new delete restarts the clock on the same toast.
    setToastKey((key) => key + 1);
    focusNear(index);
  }

  function answer(ok: boolean) {
    setClicks((count) => count + 1);
    const name = asking;
    setAsking(null);
    if (!name) return;
    const index = files.indexOf(name);
    if (ok) {
      const row = listRef.current?.querySelector<HTMLButtonElement>(
        `button[data-name="${name}"]`
      );
      if (row) row.dataset.leaving = "";
      remove(name);
      focusNear(index);
    } else {
      requestAnimationFrame(() =>
        listRef.current
          ?.querySelector<HTMLButtonElement>(`button[data-name="${name}"]`)
          ?.focus()
      );
    }
  }

  function undo() {
    setClicks((count) => count + 1);
    setFiles((current) =>
      FILES.map((f) => f.name).filter(
        (name) => current.includes(name) || pending.includes(name)
      )
    );
    setPending([]);
  }

  function reset() {
    setFiles(FILES.map((f) => f.name));
    setPending([]);
    setAsking(null);
    setClicks(0);
  }

  function changeMode(next: DeleteMode) {
    reset();
    setMode(next);
  }

  useEffect(() => {
    if (asking) okRef.current?.focus();
  }, [asking]);

  const paused = hovered || focused;

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <style>{`
        @keyframes craft-undo-timer {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
      <MotionConfig reducedMotion="user">
        <div className="relative h-72 w-full max-w-sm overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)">
          <div className="flex h-full flex-col" inert={asking !== null}>
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-border pr-2 pl-3.5">
              <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                Files
                <span className="text-muted-foreground tabular-nums">
                  {files.length}
                </span>
              </span>
              <Button
                ref={resetRef}
                className={cn(
                  "text-muted-foreground",
                  deleted === 0 && "invisible"
                )}
                onClick={() => {
                  reset();
                  requestAnimationFrame(() =>
                    listRef.current
                      ?.querySelector<HTMLButtonElement>("button[data-delete]")
                      ?.focus()
                  );
                }}
                size="xs"
                variant="ghost"
              >
                <ArrowCounterClockwiseIcon aria-hidden="true" weight="bold" />
                Reset
              </Button>
            </div>

            <ul ref={listRef} className="flex flex-col p-1.5">
              <AnimatePresence initial={false}>
                {files.map((name) => {
                  const file = FILES.find((f) => f.name === name)!;
                  return (
                    <motion.li
                      key={name}
                      animate={{ height: ROW_H, opacity: 1 }}
                      className="overflow-hidden"
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: { duration: 0.18, ease: "easeIn" },
                      }}
                      initial={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                    >
                      <div className="flex h-9 items-center gap-2.5 rounded-lg pr-1 pl-2.5 text-xs text-foreground hover:bg-muted">
                        <FileTextIcon
                          aria-hidden="true"
                          className="size-3.5 shrink-0 text-muted-foreground"
                        />
                        <span className="truncate">{name}</span>
                        <span className="ml-auto shrink-0 text-muted-foreground tabular-nums">
                          {file.size}
                        </span>
                        <Button
                          aria-label={`Delete ${name}`}
                          className="text-muted-foreground"
                          data-delete=""
                          data-name={name}
                          onClick={(event) =>
                            onDelete(name, event.currentTarget)
                          }
                          size="icon-xs"
                          variant="ghost-destructive"
                        >
                          <TrashIcon weight="bold" />
                        </Button>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </div>

          {/* Undo toast: polite live region, never takes focus. */}
          <div
            className="absolute inset-x-3 bottom-3 z-20"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setFocused(false);
              }
            }}
            onFocus={() => setFocused(true)}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setHovered(true);
            }}
            onPointerLeave={() => setHovered(false)}
            role="status"
          >
            <AnimatePresence>
              {pending.length > 0 ? (
                <motion.div
                  key="undo"
                  animate={{ y: 0, opacity: 1 }}
                  className="relative flex h-10 items-center gap-2 overflow-hidden rounded-lg bg-card pr-1.5 pl-3 text-xs text-foreground shadow-(--custom-shadow)"
                  exit={{
                    opacity: 0,
                    scale: 0.96,
                    transition: { duration: 0.15, ease: "easeIn" },
                  }}
                  initial={{ y: 52, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                >
                  <TrashIcon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {pending.length === 1
                      ? `Deleted “${pending[0]}”`
                      : `Deleted ${pending.length} files`}
                  </span>
                  <Button
                    className="h-6 px-2.5 text-xs"
                    onClick={undo}
                    size="xs"
                    variant="secondary"
                  >
                    Undo
                  </Button>
                  <span
                    key={toastKey}
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-foreground/15"
                    onAnimationEnd={() => setPending([])}
                    style={{
                      animation: `craft-undo-timer ${UNDO_MS}ms linear forwards`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {asking ? (
            <div
              className="absolute inset-0 z-30 flex animate-in items-center justify-center bg-black/20 p-4 duration-150 fade-in-0 dark:bg-black/30"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  answer(false);
                }
              }}
            >
              <div
                aria-labelledby={titleId}
                aria-modal="true"
                className="w-full max-w-56 animate-in rounded-xl bg-card p-4 shadow-(--custom-shadow) duration-150 fade-in-0 zoom-in-[0.97]"
                onKeyDown={trapTab}
                role="alertdialog"
              >
                <p
                  id={titleId}
                  className="text-xs font-medium text-foreground"
                >
                  Are you sure?
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    onClick={() => answer(false)}
                    className="text-xs"
                    size="sm"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    ref={okRef}
                    className="text-xs"
                    onClick={() => answer(true)}
                    size="sm"
                  >
                    OK
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </MotionConfig>

      <p className="text-xs text-muted-foreground">
        <span className="text-foreground tabular-nums">{clicks}</span>{" "}
        {clicks === 1 ? "click" : "clicks"} to delete{" "}
        <span className="text-foreground tabular-nums">{deleted}</span>{" "}
        {deleted === 1 ? "file" : "files"}
      </p>

      <SegmentedControl
        ariaLabel="Deleting"
        onChange={changeMode}
        options={DELETE_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}

type DialogMode = "vague" | "specific";

const DIALOG_OPTIONS = [
  { value: "vague", label: "Vague", icon: WRONG_ICON },
  { value: "specific", label: "Specific", icon: RIGHT_ICON },
] as const;

const FOCUS_RING =
  "focus:outline-2 focus:outline-offset-2 focus:outline-solid focus:outline-foreground";

export function ConfirmDialogDemo() {
  const [mode, setMode] = useState<DialogMode>("vague");
  const [open, setOpen] = useState(false);
  const [deletedProject, setDeletedProject] = useState(false);
  const [focusOnDelete, setFocusOnDelete] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();
  const specific = mode === "specific";

  useEffect(() => {
    if (!open) return;
    // The vague dialog does what a native confirm() does: focus on OK.
    // The specific one starts on Cancel, so a stray Enter is harmless.
    (specific ? cancelRef : confirmRef).current?.focus();
  }, [open, specific]);

  function close(confirmed: boolean) {
    setOpen(false);
    if (confirmed) {
      setDeletedProject(true);
      requestAnimationFrame(() => restoreRef.current?.focus());
    } else {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }

  function changeMode(next: DialogMode) {
    setOpen(false);
    setDeletedProject(false);
    setMode(next);
  }

  let status: React.ReactNode;
  if (open) {
    status = focusOnDelete ? (
      <>
        Enter would <span className="text-destructive">delete the project</span>
      </>
    ) : (
      <>
        Enter would <span className="text-foreground">cancel</span>
      </>
    );
  } else if (deletedProject) {
    status = <span className="text-destructive">Project deleted</span>;
  } else {
    status = "Open the dialog, then press Enter";
  }

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="relative h-64 w-full max-w-md overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)">
        <div
          className="flex h-full flex-col p-4 sm:p-5"
          inert={open}
        >
          <p className="text-sm font-medium text-foreground">Critly website</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Project settings
          </p>
          <div className="mt-3 divide-y divide-border">
            {[
              ["Domain", "craft.dev"],
              ["Deployments", "214"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground tabular-nums">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between gap-4 rounded-lg bg-muted/60 p-3">
            {deletedProject ? (
              <>
                <p className="text-xs text-muted-foreground">
                  Critly website was deleted.
                </p>
                <Button
                  ref={restoreRef}
                  onClick={() => {
                    setDeletedProject(false);
                    requestAnimationFrame(() => triggerRef.current?.focus());
                  }}
                  className="text-xs"
                  size="sm"
                  variant="secondary"
                >
                  Restore demo
                </Button>
              </>
            ) : (
              <>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    Delete project
                  </p>
                  <p className="mt-0.5 text-xs text-pretty text-muted-foreground">
                    Removes the project and everything in it.
                  </p>
                </div>
                <Button
                  ref={triggerRef}
                  onClick={() => setOpen(true)}
                  className="text-xs"
                  size="sm"
                  variant="destructive"
                >
                  Delete…
                </Button>
              </>
            )}
          </div>
        </div>

        {open ? (
          <div
            className="absolute inset-0 z-10 flex animate-in items-center justify-center bg-black/20 p-4 duration-150 fade-in-0 dark:bg-black/30"
            onFocus={(event) =>
              setFocusOnDelete(
                (event.target as HTMLElement) === confirmRef.current
              )
            }
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                close(false);
              }
            }}
          >
            <div
              aria-describedby={bodyId}
              aria-labelledby={titleId}
              aria-modal="true"
              className="w-full max-w-72 animate-in rounded-xl bg-card p-4 shadow-(--custom-shadow) duration-150 fade-in-0 zoom-in-[0.97]"
              onKeyDown={trapTab}
              role="alertdialog"
            >
              <p id={titleId} className="text-sm font-medium text-foreground">
                {specific ? "Delete “Critly website”?" : "Are you sure?"}
              </p>
              <p
                id={bodyId}
                className="mt-1.5 text-xs text-pretty text-muted-foreground"
              >
                {specific
                  ? "This permanently deletes 214 deployments, 3 environments and the craft.dev domain."
                  : "This action cannot be undone."}
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  ref={cancelRef}
                  className={cn(FOCUS_RING, "text-xs")}
                  onClick={() => close(false)}
                  size="sm"
                  variant={specific ? "secondary" : "ghost"}
                >
                  Cancel
                </Button>
                <Button
                  ref={confirmRef}
                  className={cn(FOCUS_RING, "text-xs")}
                  onClick={() => close(true)}
                  size="sm"
                  variant={specific ? "destructive" : "default"}
                >
                  {specific ? "Delete project" : "OK"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">{status}</p>

      <SegmentedControl
        ariaLabel="Dialog"
        onChange={changeMode}
        options={DIALOG_OPTIONS}
        value={mode}
      />
    </Demo>
  );
}
