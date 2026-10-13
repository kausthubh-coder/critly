---
name: worktree-critly
description: Make a Critly checkout ready to work in, on its own port. Use at the start of every task in a new worktree, when deps, port or the skills link look wrong, and before giving a helper agent its own checkout.
---

# Worktree setup for Critly

## Setup and doctor

```
bun run setup    # installs what's missing, picks this checkout's port, links skills, then runs the doctor
bun run doctor   # checks only, and prints the fix for each failure
```

Setup is safe to rerun and takes a few seconds when nothing is missing. A fresh worktree spends about two minutes installing. It:

- installs the site's deps with `bun install --frozen-lockfile` and the package's deps (`packages/critly`) with `npm ci`, each only when its lockfile changed since the last install;
- writes `PORT=<n>` to `.env.local`. The main checkout gets 3000; a worktree gets 3100-3899 from a hash of its path, skipping ports another checkout claimed or something else holds;
- links `.claude/skills` to `.agents/skills` (a junction on Windows).

A healthy doctor ends with one line:

```
critly ready: http://localhost:3412 · worktree · deps ok · no backend · 0 commits behind origin/main
```

Then `bun run dev` serves on that port, and `bun run lint:ui` and `bun run taste:ui` check that same port. Run them through `bun run` so they read the port; plain `next dev` falls back to 3000.

There is no backend, database or secret. The site is static, so nothing is shared between checkouts and no env is copied. The main checkout's `.env.local` only holds a Vercel CLI token that nothing reads.

## The main checkout

`C:\Users\kaust\OneDrive\Documents\dev\critly\craft`. Work only in worktrees and leave it alone: its `skills/critly` and `skills/critly-audit` are linked into every agent on this machine, so an edit there goes live everywhere at once. It often holds another thread's uncommitted work. Only `ship-critly` touches it, and only with a fast-forward pull.

## Helpers

One worktree per helper agent, never two agents in one checkout:

```
git -C C:\Users\kaust\OneDrive\Documents\dev\critly\craft fetch origin
git -C C:\Users\kaust\OneDrive\Documents\dev\critly\craft worktree add C:\Users\kaust\.t3\worktrees\critly\<name> -b <name> origin/main
cd C:\Users\kaust\.t3\worktrees\critly\<name>
bun run setup
```

Give the helper the path and its port from the doctor line.

## Cleanup

- Stop only the processes you started, by PID. Other worktrees' dev servers are someone else's.
- Remove a worktree only when its work is merged or I say so, and never one another live thread is using (check `t3_thread_list` for its path). Remove with `git -C <main> worktree remove <path>`, then `git -C <main> branch -D <branch>` once its PR is merged.
