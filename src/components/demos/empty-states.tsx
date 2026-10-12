"use client";

import {
  FolderSimpleIcon,
  FoldersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "blank" | "designed";

const MODES = [
  { value: "blank", label: "No data.", icon: WRONG_ICON },
  { value: "designed", label: "Designed", icon: RIGHT_ICON },
] as const;

const SEARCH_MODES = [
  { value: "blank", label: "No results.", icon: WRONG_ICON },
  { value: "designed", label: "Designed", icon: RIGHT_ICON },
] as const;

const DIVIDER = "border-[#E7E7E7] dark:border-[#1E1E1E]";

const PROJECT_NAMES = [
  "Website redesign",
  "Q4 launch",
  "Mobile app",
  "Hiring plan",
] as const;

export function EmptyStatesDemo() {
  const [mode, setMode] = useState<Mode>("blank");
  const [projects, setProjects] = useState<string[]>([]);
  const addRef = useRef<HTMLButtonElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const designed = mode === "designed";
  const full = projects.length === PROJECT_NAMES.length;

  function add() {
    const next = PROJECT_NAMES.find((name) => !projects.includes(name));
    if (!next) return;
    const wasEmpty = projects.length === 0;
    setProjects((prev) => [...prev, next]);
    // The empty-state button disappears with the empty state, so keep
    // keyboard focus somewhere sensible.
    if (wasEmpty) requestAnimationFrame(() => addRef.current?.focus());
  }

  function remove(name: string) {
    const remaining = projects.filter((project) => project !== name);
    setProjects(remaining);
    requestAnimationFrame(() => {
      if (remaining.length === 0 && designed) ctaRef.current?.focus();
      else addRef.current?.focus();
    });
  }

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="w-full max-w-sm rounded-xl bg-card shadow-(--custom-shadow)">
        <div
          className={cn(
            "flex h-11 items-center justify-between border-b pr-2 pl-3.5",
            DIVIDER
          )}
        >
          <span className="flex items-center gap-2 text-xs font-medium text-foreground">
            Projects
            <span className="text-muted-foreground tabular-nums">
              {projects.length}
            </span>
          </span>
          <Button
            ref={addRef}
            aria-label="New project"
            disabled={full}
            onClick={add}
            size="icon-xs"
            variant="ghost"
          >
            <PlusIcon weight="bold" />
          </Button>
        </div>

        <div className="h-48 p-1.5">
          {projects.length > 0 ? (
            <ul className="flex flex-col">
              {projects.map((name) => (
                <li
                  key={name}
                  className="flex h-9 items-center gap-2.5 rounded-lg pr-1 pl-2.5 text-xs text-foreground hover:bg-muted"
                >
                  <FolderSimpleIcon
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-muted-foreground"
                  />
                  <span className="truncate">{name}</span>
                  <Button
                    aria-label={`Delete ${name}`}
                    className="ml-auto text-muted-foreground"
                    onClick={() => remove(name)}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <XIcon weight="bold" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : designed ? (
            <div className="flex h-full flex-col items-center justify-center gap-3.5 px-6 text-center">
              <span className="grid size-9 place-items-center rounded-xl bg-muted">
                <FoldersIcon
                  aria-hidden="true"
                  className="size-4.5 text-muted-foreground"
                />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-foreground">
                  No projects yet
                </p>
                <p className="max-w-56 text-xs text-pretty text-muted-foreground">
                  A project keeps tasks, files and people in one place.
                </p>
              </div>
              <Button ref={ctaRef} onClick={add} size="sm">
                <PlusIcon aria-hidden="true" weight="bold" />
                New project
              </Button>
            </div>
          ) : (
            <div className="grid h-full place-items-center text-xs text-muted-foreground">
              No data.
            </div>
          )}
        </div>
      </div>

      <SegmentedControl
        ariaLabel="Empty state"
        onChange={setMode}
        options={MODES}
        value={mode}
      />
    </Demo>
  );
}

type Scope = "active" | "all";

const SEARCHABLE = [
  { name: "Website redesign", archived: false },
  { name: "Q4 launch", archived: false },
  { name: "Mobile app", archived: false },
  { name: "Hiring plan", archived: false },
  { name: "Brand refresh", archived: true },
] as const;

const SCOPES = [
  { value: "active", label: "Active" },
  { value: "all", label: "All" },
] as const;

export function EmptySearchDemo() {
  const [mode, setMode] = useState<Mode>("blank");
  const [scope, setScope] = useState<Scope>("active");
  const [query, setQuery] = useState("brand");
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const term = query.trim().toLowerCase();
  const matching = SEARCHABLE.filter((project) =>
    project.name.toLowerCase().includes(term)
  );
  const results = matching.filter(
    (project) => scope === "all" || !project.archived
  );
  const hiddenByScope = matching.length - results.length;

  function clearSearch() {
    setQuery("");
    inputRef.current?.focus();
  }

  function searchAll() {
    setScope("all");
    requestAnimationFrame(() => resultsRef.current?.focus());
  }

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="w-full max-w-sm rounded-xl bg-card shadow-(--custom-shadow)">
        <div
          className={cn(
            "flex h-11 items-center gap-2 border-b pr-2 pl-3.5",
            DIVIDER
          )}
        >
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="size-3.5 shrink-0 text-muted-foreground"
          />
          <input
            ref={inputRef}
            aria-label="Search projects"
            autoComplete="off"
            className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-xs [&::-webkit-search-cancel-button]:appearance-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects"
            spellCheck={false}
            type="search"
            value={query}
          />
          <div className="flex shrink-0 gap-0.5" role="group" aria-label="Show">
            {SCOPES.map((option) => (
              <button
                key={option.value}
                aria-pressed={scope === option.value}
                className={cn(
                  "h-6 cursor-pointer rounded-md px-2 text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                  scope === option.value
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setScope(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={resultsRef}
          aria-live="polite"
          className="h-48 p-1.5 outline-none"
          tabIndex={-1}
        >
          {results.length > 0 ? (
            <ul className="flex flex-col">
              {results.map((project) => (
                <li
                  key={project.name}
                  className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-xs text-foreground hover:bg-muted"
                >
                  <FolderSimpleIcon
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-muted-foreground"
                  />
                  <span className="truncate">{project.name}</span>
                  {project.archived ? (
                    <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                      Archived
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : mode === "designed" ? (
            <div className="flex h-full flex-col items-center justify-center gap-3.5 px-6 text-center">
              <div className="flex max-w-full flex-col gap-1">
                <p className="text-xs font-medium break-words text-foreground">
                  No {scope === "active" ? "active " : ""}projects match “
                  {query.trim()}”
                </p>
                <p className="text-xs text-pretty text-muted-foreground">
                  {hiddenByScope > 0
                    ? `${hiddenByScope} archived ${hiddenByScope === 1 ? "project does" : "projects do"}.`
                    : "Check the spelling, or try a shorter word."}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {hiddenByScope > 0 ? (
                  <Button onClick={searchAll} size="sm">
                    Search all projects
                  </Button>
                ) : null}
                <Button
                  onClick={clearSearch}
                  size="sm"
                  variant={hiddenByScope > 0 ? "ghost" : "secondary"}
                >
                  Clear search
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid h-full place-items-center text-xs text-muted-foreground">
              No results.
            </div>
          )}
        </div>
      </div>

      <SegmentedControl
        ariaLabel="No results state"
        onChange={setMode}
        options={SEARCH_MODES}
        value={mode}
      />
    </Demo>
  );
}
