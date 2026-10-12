"use client";

import {
  ArchiveIcon,
  CircleHalfIcon,
  FolderSimpleIcon,
  LinkSimpleIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PlusIcon,
  SidebarSimpleIcon,
  SunIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { Command as CommandPrimitive, defaultFilter } from "cmdk";
import { useRef, useState, useSyncExternalStore } from "react";

import { Compare, CompareItem, RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

type Shortcut = { mod?: boolean; shift?: boolean; key: string };

type CommandId =
  | "theme"
  | "new-project"
  | "sidebar"
  | "archive"
  | "invite"
  | "copy-link";

type CommandDef = {
  id: CommandId;
  title: string;
  keywords: string[];
  shortcut?: Shortcut;
  Icon: typeof CircleHalfIcon;
};

const COMMANDS: CommandDef[] = [
  {
    id: "theme",
    title: "Change theme",
    keywords: ["dark mode", "light mode", "appearance", "colors"],
    shortcut: { mod: true, shift: true, key: "l" },
    Icon: CircleHalfIcon,
  },
  {
    id: "new-project",
    title: "New project",
    keywords: ["create", "add", "start"],
    shortcut: { key: "c" },
    Icon: PlusIcon,
  },
  {
    id: "sidebar",
    title: "Toggle sidebar",
    keywords: ["panel", "navigation", "hide", "show"],
    shortcut: { mod: true, key: "b" },
    Icon: SidebarSimpleIcon,
  },
  {
    id: "archive",
    title: "Archive project",
    keywords: ["delete", "remove", "trash"],
    shortcut: { key: "e" },
    Icon: ArchiveIcon,
  },
  {
    id: "invite",
    title: "Invite teammate",
    keywords: ["share", "people", "member", "add user"],
    shortcut: { key: "i" },
    Icon: UserPlusIcon,
  },
  {
    id: "copy-link",
    title: "Copy project link",
    keywords: ["url", "share", "clipboard"],
    Icon: LinkSimpleIcon,
  },
];

// cmdk's fuzzy scorer returns tiny scores for letters scattered across
// unrelated words. Below this they are noise, not matches.
const MIN_SCORE = 0.1;

function keywordScore(value: string, search: string, keywords?: string[]) {
  const score = defaultFilter(value, search, keywords);
  return score >= MIN_SCORE ? score : 0;
}

function substringScore(value: string, search: string) {
  return value.toLowerCase().includes(search.trim().toLowerCase()) ? 1 : 0;
}

const subscribeNoop = () => () => {};

function useIsMac() {
  return useSyncExternalStore(
    subscribeNoop,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => true
  );
}

function shortcutKeys(shortcut: Shortcut, mac: boolean) {
  const keys: string[] = [];
  if (shortcut.mod) keys.push(mac ? "⌘" : "Ctrl");
  if (shortcut.shift) keys.push(mac ? "⇧" : "Shift");
  keys.push(shortcut.key === "," ? "," : shortcut.key.toUpperCase());
  return keys;
}

function matchesShortcut(event: React.KeyboardEvent, shortcut: Shortcut) {
  const mod = event.metaKey || event.ctrlKey;
  return (
    event.key.toLowerCase() === shortcut.key &&
    mod === !!shortcut.mod &&
    event.shiftKey === !!shortcut.shift &&
    !event.altKey
  );
}

function Keys({
  shortcut,
  className,
}: {
  shortcut: Shortcut;
  className?: string;
}) {
  const mac = useIsMac();
  return (
    <KbdGroup className={className}>
      {shortcutKeys(shortcut, mac).map((key) => (
        <Kbd key={key} className="h-4.5 min-w-4.5 px-1 text-[10px]">
          {key}
        </Kbd>
      ))}
    </KbdGroup>
  );
}

const ITEM =
  "flex h-8 cursor-default items-center gap-2.5 rounded-lg px-2.5 text-xs text-muted-foreground select-none data-[selected=true]:bg-muted data-[selected=true]:text-foreground";

const GROUP =
  "**:[[cmdk-group-heading]]:px-2.5 **:[[cmdk-group-heading]]:pt-2 **:[[cmdk-group-heading]]:pb-1 **:[[cmdk-group-heading]]:text-[11px] **:[[cmdk-group-heading]]:text-muted-foreground/70";

const DIVIDER = "border-[#E7E7E7] dark:border-[#1E1E1E]";

const PROJECT_NAMES = [
  "Website redesign",
  "Q4 launch",
  "Mobile app",
  "Hiring plan",
  "Brand refresh",
];

const TEAM = ["KS", "AM", "JL", "RP"];

type Status = { text: string; hint?: Shortcut };

export function CommandMenuDemo() {
  const mac = useIsMac();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState<CommandId[]>(["theme", "new-project"]);
  const [status, setStatus] = useState<Status | null>(null);
  const [dark, setDark] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const [projects, setProjects] = useState(PROJECT_NAMES.slice(0, 3));
  const [team, setTeam] = useState(1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  function openMenu() {
    setSearch("");
    setOpen(true);
  }

  function closeMenu() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function run(command: CommandDef, via: "menu" | "shortcut") {
    let text = "";
    switch (command.id) {
      case "theme":
        text = `Switched to ${dark ? "light" : "dark"} theme`;
        setDark(!dark);
        break;
      case "new-project": {
        const next = PROJECT_NAMES.find((name) => !projects.includes(name));
        if (next) setProjects([...projects, next]);
        text = next ? `Created “${next}”` : "That's enough projects for now";
        break;
      }
      case "sidebar":
        text = sidebar ? "Sidebar hidden" : "Sidebar shown";
        setSidebar(!sidebar);
        break;
      case "archive": {
        const last = projects.at(-1);
        if (last) setProjects(projects.slice(0, -1));
        text = last ? `Archived “${last}”` : "Nothing left to archive";
        break;
      }
      case "invite":
        text =
          team < TEAM.length ? "Invite sent" : "Everyone is already here";
        setTeam(Math.min(TEAM.length, team + 1));
        break;
      case "copy-link":
        text = "Link copied";
        break;
    }
    setRecent((prev) =>
      [command.id, ...prev.filter((id) => id !== command.id)].slice(0, 2)
    );
    setStatus({
      text,
      hint: via === "menu" ? command.shortcut : undefined,
    });
  }

  // Keys are only handled while focus is inside this demo, and stopped
  // there, so the site's own Cmd+K menu never sees them. React's root is the
  // document here, the same node the site menu listens on, so plain
  // stopPropagation isn't enough.
  function claim(event: React.KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const mod = event.metaKey || event.ctrlKey;
    if (mod && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "k") {
      claim(event);
      if (open) closeMenu();
      else openMenu();
      return;
    }
    if (open) return;
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, [contenteditable]")) return;
    const command = COMMANDS.find(
      (item) => item.shortcut && matchesShortcut(event, item.shortcut)
    );
    if (!command) return;
    claim(event);
    run(command, "shortcut");
  }

  function onBlur(event: React.FocusEvent) {
    if (!open) return;
    const next = event.relatedTarget as Node | null;
    if (!next || !windowRef.current?.contains(next)) setOpen(false);
  }

  const recentCommands = recent
    .map((id) => COMMANDS.find((command) => command.id === id))
    .filter((command): command is CommandDef => !!command);
  const otherCommands = COMMANDS.filter(
    (command) => !recent.includes(command.id)
  );

  function renderItem(command: CommandDef) {
    return (
      <CommandPrimitive.Item
        key={command.id}
        className={ITEM}
        keywords={command.keywords}
        onSelect={() => {
          closeMenu();
          run(command, "menu");
        }}
        value={command.title}
      >
        <command.Icon aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="truncate">{command.title}</span>
        {command.shortcut ? (
          <Keys className="ml-auto shrink-0" shortcut={command.shortcut} />
        ) : null}
      </CommandPrimitive.Item>
    );
  }

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div
        ref={windowRef}
        className="relative flex h-80 w-full max-w-md flex-col overflow-hidden rounded-xl bg-card shadow-(--custom-shadow) outline-none"
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        // Clicking anywhere in the window gives it focus, so its keys work.
        tabIndex={-1}
      >
        <div
          className={cn(
            "flex h-11 shrink-0 items-center gap-2 border-b px-2",
            DIVIDER
          )}
        >
          <button
            ref={triggerRef}
            aria-expanded={open}
            className="flex h-7 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg bg-muted/70 pr-1.5 pl-2.5 text-xs text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none sm:max-w-60"
            onClick={() => (open ? closeMenu() : openMenu())}
            type="button"
          >
            <MagnifyingGlassIcon aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate">Search commands</span>
            <Keys className="ml-auto shrink-0" shortcut={{ mod: true, key: "k" }} />
          </button>
          <div className="ml-auto flex shrink-0 items-center gap-2.5">
            {dark ? (
              <MoonIcon aria-label="Dark theme" className="size-3.5 text-muted-foreground" />
            ) : (
              <SunIcon aria-label="Light theme" className="size-3.5 text-muted-foreground" />
            )}
            <div className="flex -space-x-1.5">
              {TEAM.slice(0, team).map((initials) => (
                <span
                  key={initials}
                  className="grid size-5.5 place-items-center rounded-full bg-muted text-[9px] font-medium text-foreground ring-2 ring-card"
                >
                  {initials}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          {sidebar ? (
            <ul
              className={cn(
                "flex w-28 shrink-0 flex-col gap-0.5 border-r p-1.5 max-sm:w-24",
                DIVIDER
              )}
            >
              {["Inbox", "Projects", "Team"].map((label) => (
                <li
                  key={label}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-xs",
                    label === "Projects"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="min-w-0 flex-1 p-1.5">
            <p className="px-2 pt-1 pb-1.5 text-xs font-medium text-foreground">
              Projects
            </p>
            <ul className="flex flex-col">
              {projects.map((name) => (
                <li
                  key={name}
                  className="flex h-8 items-center gap-2 px-2 text-xs text-muted-foreground"
                >
                  <FolderSimpleIcon aria-hidden="true" className="size-3.5 shrink-0" />
                  <span className="truncate">{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          aria-live="polite"
          className={cn(
            "flex h-9 shrink-0 items-center justify-between gap-2 border-t px-3.5 text-[11px] text-muted-foreground",
            DIVIDER
          )}
        >
          {status ? (
            <>
              <span className="truncate text-foreground">{status.text}</span>
              {status.hint ? (
                <span className="flex shrink-0 items-center gap-1.5">
                  Next time
                  <Keys shortcut={status.hint} />
                </span>
              ) : null}
            </>
          ) : (
            <span className="truncate">
              Click the window, then press {mac ? "⌘K" : "Ctrl K"}
            </span>
          )}
        </div>

        {open ? (
          <div className="absolute inset-0 z-10 bg-background/40">
            <div
              aria-hidden="true"
              className="absolute inset-0"
              onMouseDown={(event) => {
                event.preventDefault();
                closeMenu();
              }}
            />
            <CommandPrimitive
              className="relative mx-auto mt-2 w-[calc(100%-1rem)] max-w-xs overflow-hidden rounded-xl bg-popover shadow-lg ring-1 ring-border"
              filter={keywordScore}
              label="Command menu"
              loop
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  claim(event);
                  closeMenu();
                }
              }}
              vimBindings={false}
            >
              <div className={cn("flex h-10 items-center gap-2 border-b px-3", DIVIDER)}>
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
                <CommandPrimitive.Input
                  autoFocus
                  className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-xs"
                  onValueChange={setSearch}
                  placeholder="Type a command"
                  value={search}
                />
              </div>
              <CommandPrimitive.List className="max-h-64 scroll-py-1 overflow-y-auto overscroll-contain p-1 pt-0">
                <CommandPrimitive.Empty className="px-2.5 py-6 text-center text-xs text-muted-foreground">
                  No commands match “{search.trim()}”
                </CommandPrimitive.Empty>
                {recentCommands.length > 0 ? (
                  <CommandPrimitive.Group className={GROUP} heading="Recent">
                    {recentCommands.map(renderItem)}
                  </CommandPrimitive.Group>
                ) : null}
                <CommandPrimitive.Group className={GROUP} heading="Commands">
                  {otherCommands.map(renderItem)}
                </CommandPrimitive.Group>
              </CommandPrimitive.List>
            </CommandPrimitive>
          </div>
        ) : null}
      </div>
    </Demo>
  );
}

const SUGGESTIONS = ["dark", "url", "add"] as const;

function matchedKeyword(command: CommandDef, search: string) {
  if (command.title.toLowerCase().includes(search.toLowerCase())) return null;
  return (
    command.keywords.find((keyword) =>
      keyword.toLowerCase().includes(search.toLowerCase())
    ) ?? null
  );
}

function ResultList({
  results,
  search,
  showKeyword,
}: {
  results: CommandDef[];
  search: string;
  showKeyword: boolean;
}) {
  return (
    <div className="h-27 w-full rounded-xl bg-card p-1 shadow-(--custom-shadow)">
      {results.length > 0 ? (
        <ul className="flex flex-col">
          {results.slice(0, 3).map((command, index) => {
            const keyword = showKeyword ? matchedKeyword(command, search) : null;
            return (
              <li
                key={command.id}
                className={cn(
                  "flex h-8 min-w-0 items-center gap-2 rounded-lg px-2 text-xs",
                  index === 0 ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
              >
                <command.Icon aria-hidden="true" className="size-3.5 shrink-0 max-sm:hidden" />
                <span className="max-w-full shrink-0 truncate">{command.title}</span>
                {keyword ? (
                  <span className="ml-auto min-w-0 truncate text-[10px] text-muted-foreground">
                    {keyword}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="grid h-full place-items-center text-xs text-muted-foreground">
          No results
        </div>
      )}
    </div>
  );
}

export function CommandSearchDemo() {
  const [search, setSearch] = useState("dark");
  const term = search.trim();

  const exact = term
    ? COMMANDS.filter((command) => substringScore(command.title, term) > 0)
    : COMMANDS;
  const fuzzy = term
    ? COMMANDS.map((command) => ({
        command,
        score: keywordScore(command.title, term, command.keywords),
      }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.command)
    : COMMANDS;

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="flex w-full max-w-lg flex-col items-center gap-3">
        <div className="flex h-10 w-full max-w-xs items-center gap-2 rounded-xl bg-card px-3 shadow-(--custom-shadow)">
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="size-3.5 shrink-0 text-muted-foreground"
          />
          <input
            aria-label="Search commands"
            autoComplete="off"
            className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-xs"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Type a command"
            spellCheck={false}
            value={search}
          />
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          Try
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              aria-pressed={term === suggestion}
              className={cn(
                "h-6 cursor-pointer rounded-md px-2 font-mono text-[11px] focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                term === suggestion
                  ? "bg-muted text-foreground"
                  : "hover:text-foreground"
              )}
              onClick={() => setSearch(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <Compare>
        <CompareItem verdict="wrong" label="Exact title">
          <ResultList results={exact} search={term} showKeyword={false} />
        </CompareItem>
        <CompareItem verdict="right" label="Keywords">
          <ResultList results={fuzzy} search={term} showKeyword />
        </CompareItem>
      </Compare>
    </Demo>
  );
}

type ShortcutMode = "hidden" | "shown";

const SHORTCUT_MODES = [
  { value: "hidden", label: "Hidden", icon: WRONG_ICON },
  { value: "shown", label: "Shown", icon: RIGHT_ICON },
] as const;

export function CommandShortcutsDemo() {
  const [mode, setMode] = useState<ShortcutMode>("hidden");
  const [active, setActive] = useState(0);
  const listed = COMMANDS.filter((command) => command.shortcut);

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <ul
        className="w-full max-w-xs rounded-xl bg-card p-1 shadow-(--custom-shadow)"
        onMouseLeave={() => setActive(0)}
      >
        {listed.map((command, index) => (
          <li
            key={command.id}
            className={cn(
              "flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-xs",
              index === active ? "bg-muted text-foreground" : "text-muted-foreground"
            )}
            onMouseEnter={() => setActive(index)}
          >
            <command.Icon aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate">{command.title}</span>
            {mode === "shown" && command.shortcut ? (
              <Keys className="ml-auto shrink-0" shortcut={command.shortcut} />
            ) : null}
          </li>
        ))}
      </ul>

      <SegmentedControl
        ariaLabel="Shortcuts in results"
        onChange={setMode}
        options={SHORTCUT_MODES}
        value={mode}
      />
    </Demo>
  );
}
