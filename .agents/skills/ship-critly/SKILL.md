---
name: ship-critly
description: Take verified Critly work to production (the site, the npm package, the global skills) and leave main and the worktree list clean. Use only when I say ship, deploy, release, or merge and deploy.
---

# Ship Critly

Critly ships to three places, all from `main` on `kausthubh-coder/critly`:

- **Site.** critly.vercel.app. Vercel's Git integration deploys every push to `main`, and each PR gets a preview.
- **Package.** `@kausthubh/critly` on npm, from `packages/critly`. It ships only when its `version` is newer than npm's.
- **Skills.** `skills/critly` and `skills/critly-audit`, linked into every agent from the main checkout. They go live when the main checkout pulls them.

The repo is public, so changes land through a PR. `<main>` below is `C:\Users\kaust\OneDrive\Documents\dev\critly\craft`.

**Rules.** Production needs my go in this conversation. Stop at the first failure. Never force-push, never skip checks, never edit `.critly/policy.json` to pass. Write the rollback (end of this file) into your notes before step 3.

## 1. Ready

1. `git fetch origin`, then `git status --short` prints nothing. If `git rev-list --count HEAD..origin/main` isn't 0, `git merge origin/main` and resolve.
2. Regenerate what CI would otherwise regenerate after the merge: `bun run build:skill` and `node packages/critly/scripts/sync-skill.mjs`. Commit anything they change.
3. `bun run check` exits 0. It builds the site, runs the package tests, and fails if `skills/critly-audit/scripts` drifted from the package.
4. For UI changes, with `bun run dev` running: `bun run lint:ui` exits 0, and you looked at the `bun run taste:ui` images for each changed screen. There is no `verify-critly` skill yet, so this output and screenshots of the changed pages are the evidence.
5. If `packages/critly` changed, its `version` must be newer than `npm view @kausthubh/critly version`, or the package doesn't ship.
6. List what's going out: `git log --oneline origin/main..HEAD`.

## 2. Land

```
git push -u origin <branch>
gh pr create --fill --base main
gh pr checks <pr> --watch --fail-fast      # the Vercel preview; give up after 15 minutes
```

Then stop and wait for my review. Merge only when I say so:

```
gh pr merge <pr> --squash
```

Leave out `--delete-branch`: gh would try to switch this worktree to `main`, which the main checkout already has. Step 6 deletes the branch.

## 3. Deploy

1. **Package first,** when it's shipping, because the site and skills tell people to run `npx @kausthubh/critly`. Publish right after my go, from this worktree:
   ```
   cd packages/critly
   npm publish --access public --dry-run   # check the file list and version
   npm publish --access public
   ```
   npm opens a browser for my passkey. Tell me it's waiting; the approval window is a few minutes.
2. **Site.** Vercel deploys the merge commit on its own. Watch its status, at most 10 minutes:
   ```
   gh pr view <pr> --json mergeCommit -q .mergeCommit.oid
   gh api repos/kausthubh-coder/critly/commits/<sha>/status -q ".statuses[] | select(.context==\"Vercel\") | .state"
   ```
   Done at `success`; stop at `failure` or `error`. GitHub's deployments list updates late, so read this status instead.
3. **Build skill workflow.** The same push runs `.github/workflows/build-skill.yml`. Wait for it: `gh run list --workflow build-skill.yml --commit <sha>`, then `gh run watch <id> --exit-status`. If it committed a "Regenerate agent skill" commit, step 2 missed something; that commit deploys too.

## 4. Check production

Read only:

- `curl -s -o /dev/null -w "%{http_code}" https://critly.vercel.app/<changed page>` returns 200, and the page HTML contains a string from the change.
- If the package shipped: `npm view @kausthubh/critly version` shows the new version.

## 5. Update the main checkout

This is what makes the skills live.

- If `git -C <main> status --short` prints nothing and it's on `main`: `git -C <main> pull --ff-only`, then `bun run setup` in `<main>`.
- If it's dirty or on another branch, leave it and tell me: the global `critly` skills stay on the old version until it's pulled.
- If a folder under `skills/` was added, renamed or removed, run `node scripts/link.mjs` in `C:\Users\kaust\OneDrive\Documents\dev\agent-skills` (try `--dry-run` first).

## 6. Clean up

- `git push origin --delete <branch>` if the remote branch is still there.
- If no thread needs this worktree anymore (check `t3_thread_list`): `git -C <main> worktree remove <path>`, then `git -C <main> branch -D <branch>`. If it's the worktree this thread runs in, leave it and tell me it can go.

## 7. Report

A few lines: the PR, the merge commit, what went live where (site URL, package version, skills pulled or not), the evidence, and anything skipped or left.

## Rollback

- **Site:** promote the previous production deployment in the Vercel dashboard (critly project, Deployments), then revert the PR with `gh pr revert <pr>`, or `git revert` on a branch and a new PR.
- **Package:** `npm dist-tag add @kausthubh/critly@<previous> latest`, then publish a fixed patch. Don't unpublish.
- **Skills:** they follow `main`. Revert on `main`, then pull the main checkout.
