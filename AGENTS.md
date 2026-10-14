<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Critly

Design engineering concepts for people building with AI agents. One repo, three things that ship:

- **Site:** critly.vercel.app. Next.js App Router, fully static, deployed by Vercel on every push to `main`.
- **Package:** `@kausthubh/critly` on npm (`packages/critly`). The `critly check` and `critly taste` CLI that measures a running app.
- **Skills:** `skills/critly` and `skills/critly-audit`. Installed by others with `npx skills add kausthubh-coder/critly`, and linked into every agent on this machine from the main checkout.

The repo is public: changes land through a PR to `main`.

## Worktrees and shipping

```
bun run setup    # deps, this checkout's port, skills link; ends with the doctor
bun run doctor   # read-only check, prints the fix for each failure
bun run dev      # http://localhost:<PORT from .env.local>
bun run check    # site build + package tests + skill copy drift; run before calling work done
```

- Every task in a new worktree starts with `worktree-critly`.
- Ship only with `ship-critly`, when I say so.
- Leave the main checkout (`C:\Users\kaust\OneDrive\Documents\dev\critly`) alone. It also holds local folders that aren't in git (`plan/` for plans and research, `eval/`, `prototype/`, `craft-tools/`), listed in `LOCAL.md` there. Its `skills/` is live in every agent on this machine.

## Where things live

| What | Where |
|---|---|
| Concept articles (one `.mdx` per concept) | `content/<section>/` |
| Which concepts are live in production | `LAUNCH_CONCEPT_SLUGS` in `src/lib/concepts.ts` (dev shows all) |
| Section order and names | `src/lib/sections.ts` |
| Interactive demos | `src/components/demos/`, registered in `src/components/app/mdx.tsx` |
| Site shell, sidebar, command menu, phone frame | `src/components/app/` |
| Pages: concept, markdown, OG image, llms.txt | `src/app/[slug]`, `src/app/md`, `src/app/og`, `src/app/llms*.txt` |
| Check and taste engine, CLI, rules | `packages/critly/src`, `packages/critly/bin/critly.js`, `packages/critly/src/rules.json` |
| The site's own design policy | `.critly/policy.json` |
| Skill generator | `scripts/build-skill.ts` |
| Dev port and setup | `scripts/port.mjs`, `scripts/setup.mjs` |

## Generated files

Edit the source, then regenerate. Never hand-edit the output.

- `skills/critly/references/`, `references/rules.md` and the concept index in `skills/critly/SKILL.md` come from `content/` via `bun run build:skill`. The rest of `skills/critly/SKILL.md` and all of `skills/critly-audit/SKILL.md` are hand-written.
- `skills/critly-audit/scripts/check.js` and `taste.js` are copies of `packages/critly/src/`, and the `RULES` table in `check.js` comes from `rules.json`. Run `node packages/critly/scripts/sync-skill.mjs` after changing either; `bun run check` fails when they drift.
- CI (`.github/workflows/build-skill.yml`) reruns `build:skill` on every push to `main` and commits the result if you forgot.

## Adding a concept

Add `content/<section>/<slug>.mdx` with `title`, `description`, `section`, `order` and `publishedAt` frontmatter. Put a demo in `src/components/demos/` and register it in `mdx.tsx`. Add the slug to `LAUNCH_CONCEPT_SLUGS` to publish it, then `bun run build:skill`.

## Package

`packages/critly` is plain Node ESM with no build step, its own npm lockfile and its own `node_modules`. Tests: `cd packages/critly && node --test`. It finds the installed Chrome or Edge and never downloads a browser. Bump `version` in its `package.json` to release it; `ship-critly` publishes it.

# Critly checks itself

- UI work: use the `critly` skill. Read `.critly/policy.json` before choosing spacing, type or color, use only its values, and never edit it to pass.
- After any UI change, run `bun run lint:ui` (with `bun run dev` running; both use this checkout's port) and fix every error until it exits 0. Exit 2 means it couldn't run; say so, it is not a pass. Then run `bun run taste:ui`, open the squint and overlay images for each changed screen, and fix each look or say why the screen needs it before saying it's done.
