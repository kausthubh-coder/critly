---
name: critly-audit
description: 'Audit the design of an existing app or website and optionally fix it, using the Critly design engineering concepts. Works from a running URL (localhost or deployed), the codebase, or both. Use when the user runs /audit, says "audit my app", "audit the design", "what is wrong with this UI", "fix the design", "make this app look and feel better", or hands over a localhost link and asks to improve the design. Checks the system (type scale, spacing, color roles, tokens, dark mode), composition (alignment, whitespace, hierarchy, density, responsive, layout shift), and details (states, focus, hit areas, inputs, overlays, motion, copy, feedback), and times the main actions for performance (load, navigation, typing, scrolling). Also use when the user asks to audit speed, "why is my app slow", or "make the whole app faster".'
metadata:
  author: kausthubh-coder
  source: https://critly.vercel.app
  forked-from: https://github.com/gustavo-fior/craft
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

Then compare against the concepts:

| Look for | Concept |
| --- | --- |
| More than about 6 font sizes, near-duplicates (13 and 14, 15 and 16) | Type Scale |
| Off-scale spacing (5, 7, 10, 13, 18, 22px), every gap the same | Spacing Scale, Whitespace |
| Many greys, untinted neutrals, accent used for decoration | Color Roles, OKLCH |
| Raw values in components instead of named roles | Design Tokens |
| Several radii with no pattern, inner radius equal to outer | Nested Border Radius |
| Borders everywhere, shadows that differ per component | Shadows, Not Borders |
| Inverted dark mode, pure #000, glowing accents | Dark Mode, HTML Background |
| Several easings and durations with no reason | Easings |

## 4. Composition pass

For each screen, at 1280px and 390px, in light and dark:

- **Alignment**: count the distinct left edges. Is text aligned to text?
- **Whitespace and hierarchy**: do groups read without the borders? Is there
  one clear focal point, or is everything bold?
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
- **Glass and effects**: Liquid Glass, Effect Cost, Shadows, Not Borders.

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
- Finish with a short before and after table: what changed, where, and the
  concept. If you ran the inventory before, run it again and show the change
  in distinct values (for example, font sizes 11 to 6).

The code samples in the references use Tailwind v4. Check the project's
Tailwind version or styling approach and translate as needed.
