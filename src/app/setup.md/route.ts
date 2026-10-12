import { SITE_URL } from "@/lib/site";

// The guide an agent follows when the user says "Read <site>/setup.md and set
// up the Critly check in this project." Written for agents, served as Markdown.

export const dynamic = "force-static";

const GUIDE = `# Set up the Critly check

You are setting up Critly's check in this project. It loads the running app, measures what it renders, and fails when the interface breaks a Critly concept (${SITE_URL}/check). Follow the steps in order. Where a step says to ask the user, stop and ask.

## 1. Inspect

- Find the package manager (from the lockfile), the dev server command and the URL it serves on, and the main routes or screens.
- Find the design tokens: a Tailwind v4 \`@theme\` block, CSS custom properties on \`:root\` and the dark selector, and the fonts the app loads.
- Find how dark mode switches: the \`prefers-color-scheme\` media query, a class on \`<html>\` (next-themes uses class \`dark\` and the storage key \`theme\`), or a data attribute.
- If the project contains a copied Critly skill (\`.agents/skills/critly\` or \`.claude/skills/critly\` that is not a link to a global install), tell the user it will go stale and suggest \`npx skills add kausthubh-coder/critly -g\` instead.

## 2. Install

Add the check as a dev dependency with the project's package manager, for example \`npm i -D @kausthubh/critly\`. The package is scoped; the command it installs is \`critly\`.

## 3. Write the policy

Create \`.critly/policy.json\`: the app's design system as numbers. Fill it from what you found in step 1, not from what the app happens to render: the fonts, the type scale, how dark mode switches, the pages to check. See the field reference in the package README (https://www.npmjs.com/package/@kausthubh/critly).

Show the policy to the user and ask them to approve it before you continue. Don't loosen a value so the app passes; a finding means the interface should change.

## 4. Add the script

Add \`"lint:ui": "critly check <dev server URL>"\` to \`package.json\`. The dev server has to be running when it runs.

## 5. Add two lines to AGENTS.md

Add these to the project's AGENTS.md (create it if needed). If the project has a CLAUDE.md that doesn't import AGENTS.md, add \`@AGENTS.md\` to it.

\`\`\`markdown
- UI work: use the \`critly\` skill. Read \`.critly/policy.json\` before choosing spacing, type or color, use only its values, and never edit it to pass.
- After any UI change, run \`npm run lint:ui\` and fix every error until it exits 0. Exit 2 means it couldn't run; say so, it is not a pass. Then screenshot each changed screen at 390 and 1440 and look at it before saying it's done.
\`\`\`

Use the project's package manager in the command.

## 6. Run it once

Start the dev server and run \`npm run lint:ui\`. Exit 0 passes, 1 means findings, 2 means it couldn't run.

If there are many findings, ask the user whether to fix them now or record a baseline: \`critly check <url> --update-baseline\` writes \`.critly/baseline.json\`, and \`--baseline\` in the script then fails only when a rule's count goes up.

## 7. Offer CI

Offer a job that builds the app, starts it, and runs the check. GitHub's Ubuntu runners already have Chrome:

\`\`\`yaml
- run: npm ci
- run: npm run build && (npm start &) && npx wait-on http://localhost:3000
- run: npx critly check http://localhost:3000  # the devDependency's bin
\`\`\`

## 8. Source lint (React + Tailwind v4 only)

The check measures the rendered page. For the source side (arbitrary values, raw palette colors, restyled components), offer @shadcn/lint: https://github.com/shadcn-ui/lint/blob/main/SETUP.md. Don't set it up without asking.

## 9. Hand off

Tell the user what you changed, how to run the check, and where the policy lives, and quote the check's last line.

## Rules

- Fix the interface, not the policy. Never edit \`.critly/policy.json\` or add an exception without the user's OK. Every exception needs a \`reason\`.
- A finding marked \`review\` is not a pass. Look at it, then fix it or ask the user.
- Never turn on stricter or opt-in rules without asking.
`;

export function GET() {
  return new Response(GUIDE, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
