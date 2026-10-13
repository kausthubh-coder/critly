---
name: critly-audit
description: 'Audit the design of an existing app or website and optionally fix it, using the Critly design engineering concepts. Works from a running URL (localhost or deployed), the codebase, or both. Use when the user runs /audit, says "audit my app", "audit the design", "what is wrong with this UI", "fix the design", "make this app look and feel better", or hands over a localhost link and asks to improve the design. Checks the system (type scale, spacing, color roles, tokens, dark mode), composition (a taste pass: the squint test, boxes and edges, one focal point; alignment, whitespace, hierarchy, density, responsive, layout shift), and details (states, focus, hit areas, inputs, overlays, motion, copy, feedback), and times the main actions for performance (load, navigation, typing, scrolling). Also use when the user asks to audit speed, "why is my app slow", or "make the whole app faster", and to set up the Critly check (critly check, lint:ui, .critly/policy.json) in a project.'
metadata:
  author: kausthubh-coder
  source: https://critly.vercel.app
---

# Audit

Audit an existing interface from the top down: first the intent, then the
system, then the composition of each screen, then the details. Fixing in that
order matters. One token change fixes forty components; polishing a button
before the type scale is settled is wasted work.

This skill uses the concepts in the `critly` skill, which
is installed alongside it. Its index is
`../critly/SKILL.md` and the full concepts are in
`../critly/references/`. Read the reference section for
every concept you cite. Do not cite a concept from its title alone.

## 1. Scope

- **URL given** (e.g. `http://localhost:3000`): use your browser tool. Visit
  the screens, interact with them, and read the code too if the repo is open.
- **Code only**: read the routes, layout and shared components. Say in the
  report that nothing was checked in a browser.
- Pick at most 8 screens for a full audit: the home or landing screen, the
  main working screen, a list or table, a detail view, a form, a settings
  page, an empty or first-run state, and one overlay (menu, modal, drawer).
  Name them before you start.

## 2. Intent

Before judging anything, write down what the product should feel like. Read
**Product Feel** in the references, then answer in one or two lines each:

- Who uses it, how often, and for how long at a time?
- What state of mind are they in (focused, browsing, anxious, playful)?
- Density: compact or comfortable? Pace: instant or animated? Tone: quiet or
  expressive?

Infer this from the product, its copy and its code. State it as an
assumption in the report, and only ask the user if it is genuinely unclear.
Every finding is judged against this intent. A playful bounce is a bug in a
trading terminal and fine in a kids' app.

## 3. System pass

Measure what the app actually uses before reading any component.

- With a browser: run `references/inventory.js` on each screen in light and
  dark (paste it into the console or your browser tool's evaluate). It
  returns every distinct font size, weight, text color, background, radius,
  shadow, spacing value and easing, with counts.
- Code only: grep the styles. Collect Tailwind classes (`text-*`, `p-*`,
  `gap-*`, `rounded-*`, `shadow-*`, arbitrary `[...]` values), CSS custom
  properties and the theme config.

Then run the check, which measures the rendered app against the concepts:

- If the project has `lint:ui` or `.critly/policy.json`, run that.
- Otherwise run `npx @kausthubh/critly check <url>` (with no policy it runs
  every rule that doesn't need one), or, in a browser tool, paste
  `scripts/check.js` and call `window.__critlyCheck({})`.

Its findings already name the fix and the concept; put them in the report.
Then compare the inventory against the concepts:

| Look for | Concept |
| --- | --- |
| More than about 6 font sizes, near-duplicates (13 and 14, 15 and 16) | Type Scale |
| Off-scale spacing (5, 7, 10, 13, 18, 22px), every gap the same | Spacing Scale, Whitespace |
| Many greys, untinted neutrals, accent used for decoration | Color Roles, OKLCH |
| Raw values in components instead of named roles | Design Tokens |
| Several radii with no pattern, inner radius equal to outer | Nested Border Radius |
| Edges (borders, shadows) that differ per component, or boxes that group nothing | Edges and Elevation |
| Inverted dark mode, pure #000, glowing accents | Dark Mode, HTML Background |
| Several easings and durations with no reason | Easings |

## 4. Composition pass

Start with the taste pass on every screen you named: squint, count the boxes
and edges, find the one thing (read **Taste Pass** in the references).

- `npx @kausthubh/critly taste <url>` reads `pages` and `viewports` from the
  policy. It writes a squint image and an overlay per screen to
  `.critly/taste/` and lists its looks: nothing leads, solid buttons
  competing, everything bold, boxes nested three deep, doubled or nested
  borders, near-miss edges. Open every image. In a browser tool, paste
  `scripts/taste.js`, run `await window.__critlyTaste()`, then
  `window.__critlyTaste.overlay(report)` and take a screenshot.
- Write down what each screen leads with, and whether that's what the intent
  from step 2 says it should lead with. That line goes in the report.
- Each look becomes a Composition finding unless the screen has a reason for
  it; if so, give the reason. Put the counts (boxes, depth, left edges, lead
  ratio) in **Before**, so the fix can show them going down.

Then, for each screen, at 1280px and 390px, in light and dark:

- **Alignment**: is text aligned to text, beyond the near misses the taste
  pass found?
- **Whitespace and hierarchy**: do groups read without the borders? Does the
  lead hold in dark mode and at 390?
- **Density**: does it match the intent from step 2?
- **Line length** of any running text.
- **Responsive**: does the layout change at narrow widths, or just shrink?
  Any horizontal overflow?
- **Layout shift**: trigger the late content (errors, images, async data,
  conditional buttons). Does anything below move?

## 5. Details pass

Interact with every control you can reach. Hover, press, Tab through with
the keyboard, submit forms empty and wrong, open and close every overlay,
empty a list, and switch on reduced motion. Check against the matching
concepts:

- **Controls**: Interaction States, Button Press, Hover Restraint, Hit Areas,
  Focus Rings.
- **Forms**: Input Details, Microcopy, Layout Shift.
- **Overlays and menus**: Overlays, Scale Entrances, Exit Animations,
  Command Menu.
- **Feedback**: Toasts, Destructive Actions, Empty States, Performance Is
  Design.
- **Motion**: Easings, Interruptibility, Shared Layout, Stagger, Reduced
  Motion.
- **Content**: Microcopy, Real Content, Tabular Numbers, Text Wrapping.
- **Images and icons**: Image Outlines, Icons, Optical Alignment.
- **Glass and effects**: Liquid Glass, Effect Cost, Edges and Elevation.

Also note where a screen looks like an unmodified template instead of this
product: a leftover default accent color, everything boxed in identical
cards, decoration that has nothing to do with the intent. Only report it when
it works against the intent.

## 6. Performance pass

Design includes how fast it feels. Follow **Measuring Performance** in
`../critly/references/performance.md` for the method, then time the three to
five actions people do most (open the main page, open an item, search,
navigate between sections, start the main task), on a production build, on a
throttled phone profile and on desktop. For each action, write down the wait
in milliseconds and what the person sees while waiting. Then check against:

- **Waiting**: Responsiveness, Instant Navigation, Performance Is Design.
- **Weight**: JavaScript Cost, Image Loading, Font Loading, Video and Embeds.
- **Rendering**: Long Lists, Smooth Animation, Effect Cost.

Report each slow action as one finding, with the number in **Before** (for
example "phone Home 8.5s, 42,000 DOM nodes"). Skip this pass only if you
can't run the app, and say so in the summary.

## 7. Report

Write the report in this order and keep it scannable.

1. **Summary**: the assumed intent in one line, an overall verdict in one
   sentence, and the three changes that would help most.
2. **Scorecard**:

   | Area | Grade | Why |
   | --- | --- | --- |
   | System | Needs work | 11 font sizes, 23 spacing values, 3 radii on cards |
   | Composition | Needs work | Settings: nothing leads (1.1×), boxes 3 deep, 9 left edges |

   Use the areas System, Composition, Interaction, Motion, Performance and
   Content, with
   the grades Good, Needs work or Poor.
3. **Findings**, most severe first, at most 25 rows:

   | # | Severity | Screen | Where | Before | After | Concept |
   | --- | --- | --- | --- | --- | --- | --- |

   - **Severity**: High means people notice it or it blocks access (focus,
     hit areas, contrast, layout shift, broken mobile). Medium reads as
     unpolished. Low is a refinement.
   - **Where** is `file:line` when you have the code, otherwise a selector or
     a description of the element.
   - **Before and After** are concrete values or code, not adjectives.
   - A systemic issue is one row with "everywhere" and a count, not twenty
     rows.
   - Put anything that matters but has no matching concept under
     **Outside Critly** after the table, one line each.
4. **Fix plan** in batches, in this order: System (tokens and scales
   first, since every later fix builds on them), then Composition, then
   Details, then Performance. One line of scope per batch and the files it touches.

## 8. Fixing

If the user asked you to fix the design ("fix the design", "make it
better"), apply the plan after the report without asking again. Otherwise
ask whether to apply all batches, only the first, or none.

When applying:

- Go batch by batch, in plan order. Introduce or clean up tokens first, then
  move components onto them.
- Keep behaviour, data and copy meaning unchanged unless a finding is about
  them. Don't redesign the brand or invent a new visual style. Make the
  existing intent consistent and finished.
- Use the exact values from the references (durations, easings, scales,
  radii, spacing steps) instead of inventing new ones.
- After each batch, re-check the affected screens in the browser if you have
  one, at both widths and in both themes, and run the project's typecheck or
  build.
- For performance fixes, measure again the same way and put before and
  after numbers side by side. Measure each fix on its own, so you know which
  one helped. Run the exact checks CI runs before saying anything passes.
- Run the check again after each batch and keep going until it exits 0.
  Never edit the policy or add an exception to get there without asking.
- Finish with a short before and after table: what changed, where, and the
  concept. If you ran the inventory before, run it again and show the change
  in distinct values (for example, font sizes 11 to 6). Quote the check's
  last line before and after, and run the taste pass again: show boxes, depth,
  left edges and the lead ratio before and after for each screen you changed.

## 9. Set up the check

At the end of an audit, if the project has no `.critly/policy.json`, offer to
set up the check so the fixes stay fixed. When the user agrees, follow
https://critly.vercel.app/setup.md step by step. In short:

1. Install it: `npm i -D @kausthubh/critly` (the command is `critly`).
2. Write `.critly/policy.json` from the app's tokens and the inventory: fonts,
   type scale, how dark mode switches, the pages to check. Show it to the user
   and get their OK before going on.
3. Add `"lint:ui": "critly check <dev server URL>"` and
   `"taste:ui": "critly taste <dev server URL>"` to `package.json`, and add
   `.critly/taste/` to `.gitignore` (every run rewrites the images).
4. Add these two lines to AGENTS.md (and `@AGENTS.md` to a CLAUDE.md that
   doesn't import it). AGENTS.md is in context for every task and survives
   compaction; this skill isn't and doesn't.

   ```markdown
   - UI work: use the `critly` skill. Read `.critly/policy.json` before choosing spacing, type or color, use only its values, and never edit it to pass.
   - After any UI change, run `npm run lint:ui` and fix every error until it exits 0. Exit 2 means it couldn't run; say so, it is not a pass. Then run `npm run taste:ui`, open the squint and overlay images for each changed screen, and fix each look or say why the screen needs it before saying it's done.
   ```
5. Run it once. With many findings, ask whether to fix them now or record a
   baseline (`--update-baseline`, then `--baseline` in the script).
6. If the project vendors an old copy of the Critly skills, suggest
   `npx skills add kausthubh-coder/critly -g` instead.

The code samples in the references use Tailwind v4. Check the project's
Tailwind version or styling approach and translate as needed.
