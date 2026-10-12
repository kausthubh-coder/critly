# critly

`critly check` loads your running app in a real browser, measures what it renders, and fails when the interface
breaks a [Critly](https://critly.vercel.app) design concept: text below 4.5:1, a 20px close button on a phone, a font
size that isn't on your scale, a page that scrolls sideways at 390px. Every finding says where it is, what it
measured, the value to use instead, and the concept it comes from.

It's built for coding agents. The exit code is something an agent can't talk its way past, and the fix is in the
finding, so it can act on it in the same turn.

## Quick start

With the app running:

```bash
npx @kausthubh/critly check http://localhost:3000
```

To keep it in the project:

```bash
npm i -D @kausthubh/critly
```

```json
{ "scripts": { "lint:ui": "critly check http://localhost:3000" } }
```

The package is `@kausthubh/critly`; the command it installs is `critly`. It needs Node 20 or later and uses your
installed Google Chrome or Microsoft Edge. Without either, run `npx playwright-core install chromium` once.

Or ask your agent:

> Read https://critly.vercel.app/setup.md and set up the Critly check in this project.

## The policy

Without a policy, `critly check` runs every rule that doesn't need one, at 390×844 and 1440×900, in light and dark
(through `prefers-color-scheme`). Rules that need your design system's values are listed as skipped.

`.critly/policy.json` holds your design system as numbers. It's read from the working directory, or pass
`--policy <file>`.

```json
{
  "fonts": ["Inter", "JetBrains Mono"],
  "typeScale": [12, 14, 16, 20, 24, 48],
  "schemes": { "light": {}, "dark": { "class": "dark", "on": "html" } },
  "pages": ["/", "/settings", "/settings/billing"],
  "exceptions": [
    {
      "selector": ".embed-map *",
      "rules": ["text-contrast"],
      "reason": "Third-party map tiles; we don't control their text."
    }
  ]
}
```

| Field | What it does |
|---|---|
| `fonts` | Font families interface text may use. Turns on `font-family`. Code, kbd, pre and samp are excluded |
| `typeScale` | Allowed font sizes in px. Turns on `type-scale` |
| `typeRoles` | `[{ "selector", "sizes" }]`: text inside a selector that uses its own sizes. First match wins |
| `schemes` | Color schemes and how to switch to each. `{}` is the default; `{ "media": true }` emulates `prefers-color-scheme`; `{ "class": "dark", "on": "html" }` adds a class; `{ "attribute": ["data-theme", "dark"] }` sets an attribute; `{ "storage": ["theme", "dark"] }` sets localStorage before the page loads (next-themes). Keys combine |
| `viewports` | `[{ "width", "height" }]`. Default 390×844 and 1440×900 |
| `pages` | Paths to check, resolved against the URL you pass |
| `tailwind` | `true` to name Tailwind classes in fixes (`text-sm`, `p-3`, `text-muted-foreground`) |
| `lineLength` | Most characters per line for paragraphs. Default 75 |
| `bannedPhrases` | Phrases the UI must not show, on top of lorem ipsum, "John Doe" and TODO |
| `spacing` | Spacing steps in px, for the opt-in `spacing-scale` rule |
| `colorTokens` | Custom properties that are your colors (`"--color-*"` matches a prefix). Default: every color custom property on `:root`, minus Tailwind's palette |
| `rules` | `{ "spacing-scale": "error" }` turns an opt-in rule on; `"off"` turns a rule off |
| `exceptions` | `[{ "selector", "rules", "reason" }]`. Matches the element or any ancestor. `reason` is required. Suppressed findings are counted in every run |
| `ignore` | Selectors to skip entirely, for third-party widgets (chat bubbles, embeds) |
| `note` | One line added to every finding, e.g. "Tokens live in app/globals.css." |
| `ready` | A selector to wait for on every page (same as `--ready`) |
| `maxElements` | Most visible elements per page. Default 5000 |

Validation is strict: an unknown field, an unknown rule id, a missing reason or an invalid selector stops the run
with exit 2 and names the field. `policy.schema.json` in the package gives editors completion:
`"$schema": "../node_modules/@kausthubh/critly/policy.schema.json"` (relative to `.critly/`).

## Output

```
http://localhost:3000/settings/billing

✕ hit-area  error · 390x844 · light, dark
  where   button "Close" in <dialog> "Edit payment method"
  actual  20×20px
  fix     Make it at least 44×44px at ≤ 640px wide: add 12px of padding (p-3), or keep the look and extend the target with a ::after { content: ""; position: absolute; inset: -12px } on the position: relative control.
  concept https://critly.vercel.app/hit-areas

✕ text-contrast  error · 1440x900 · dark
  where   p.hint "Billed yearly, cancel any time" under "Plan"
  actual  3.1:1, #6b6b6b on #1c1c1c
  fix     Use text-muted-foreground (--muted-foreground, 5.2:1); needs 4.5:1.
  concept https://critly.vercel.app/color-roles

checked 3 pages × 2 viewports × 2 schemes · 4,812 elements · 15 rules · skipped: spacing-scale, off-token-color, nested-radius (opt-in)
critly check: 2 errors, 0 review · 3 pages × 2 viewports × 2 schemes · exit 1
```

The last line is the one to quote. `--json` prints the full report: every finding with its selector, the
suppressed findings with their reasons, and coverage per page, viewport and scheme.

A `?` finding is a **review**: the check couldn't measure it (text over an image or gradient, a blend mode, a text
shadow) and says why. A review fails the run like an error. Look at it, then fix it or ask for an exception.

## The taste pass

Some of what makes a screen feel off can't fail a rule. `critly taste` runs a
[taste pass](https://critly.vercel.app/taste-pass) on the first screen of each page, at each viewport:

- **Squint.** It blurs a screenshot (6px, `--blur` to change it) and measures what still stands out from the
  background, in OKLab.
- **Boxes and edges.** It counts every box drawn with a border, ring, shadow or tinted background, how deep they
  nest, the divider lines, and the distinct left edges where things start, with near misses 2 to 8px apart.
- **One focal point.** It ranks what reads first and compares the lead with the runner-up, counts solid buttons
  per area, and the share of text set in bold.

```bash
npx @kausthubh/critly taste http://localhost:3000
```

```
http://localhost:3000/settings/billing · 1440x900

  squint  .critly/taste/settings-billing-1440.squint.png  (darkest: button.solid "Add seats")
  lead    button.solid "Add seats" leads, only just, 1.42× over button.solid "Upgrade plan"
  boxes   4 (4 border), 0 divider lines, nested 3 deep
  edges   6 left edges (3 for text), 1 near miss
  overlay .critly/taste/settings-billing-1440.taste.png
  look    2 solid buttons in one group (button.solid "Add seats", button.solid "Upgrade plan"). Keep the one that does the main job solid, and make the others secondary or plain.
          https://critly.vercel.app/visual-hierarchy
  look    A box in a box in a box (3 deep): section.panel > div.card > div.row, and 1 more like it. Let the inner group sit on its parent's surface and separate it with space.
          https://critly.vercel.app/whitespace

critly taste: 10 things to look at · 2 screens · images in .critly/taste · exit 0
```

It writes two images per screen to `.critly/taste/` (`--out` to change it): `<page>-<width>.squint.png`, the
blurred screen, and `<page>-<width>.taste.png`, the screen with the boxes, edges and the top two weights marked.
Open them; they're the point. Add `.critly/taste/` to `.gitignore`.

It never fails a page. It exits 0 when it ran and 2 when it couldn't. Its looks are things to look at, and a
screen can have a reason for any of them. It reads `pages`, `viewports`, `schemes`, `ready` and `ignore` from the
policy and uses the first scheme (`--scheme dark` for another).

| Look | Concept | Shown when |
|---|---|---|
| `no-lead` | [visual-hierarchy](https://critly.vercel.app/visual-hierarchy) | The two heaviest things are within 1.2× of each other |
| `weak-lead` | [visual-hierarchy](https://critly.vercel.app/visual-hierarchy) | The lead is under 1.5× the runner-up |
| `solid-actions` | [visual-hierarchy](https://critly.vercel.app/visual-hierarchy) | Two solid buttons share an area (Atlassian), or more than two are on screen (Apple) |
| `all-bold` | [visual-hierarchy](https://critly.vercel.app/visual-hierarchy) | Over 30% of the text is 600 or heavier |
| `deep-boxes` | [whitespace](https://critly.vercel.app/whitespace) | Boxes nest three deep |
| `nested-borders` | [shadows-not-borders](https://critly.vercel.app/shadows-not-borders) | A bordered box sits inside a bordered box |
| `double-edge` | [shadows-not-borders](https://critly.vercel.app/shadows-not-borders) | A box sits 4px or less inside another and both draw an edge |
| `near-miss-edge` | [alignment](https://critly.vercel.app/alignment) | Two content edges are 2 to 8px apart |
| `drawn-groups` | [whitespace](https://critly.vercel.app/whitespace) | Six or more boxes, mostly bordered, with as many divider lines |

The 1.2× and 1.5× lead thresholds and the 2 to 8px near-miss range are Critly's own starting points, not
published numbers. The button limits come from Atlassian and Apple, and the 6px blur from Nielsen Norman Group's
blur test. `--json` prints every count, the ranked leads with their boxes, and each look's selectors.

In a browser tool, paste `@kausthubh/critly/taste.js` (also `scripts/taste.js` in the `critly-audit` skill):

```js
const report = await window.__critlyTaste();      // or { root: "dialog" } for one part of the page
window.__critlyTaste.overlay(report);              // mark the boxes, edges and lead on the page
window.__critlyTaste.squint(true);                 // blur the page for your own screenshot
window.__critlyTaste.clear();
```

Without a screenshot it estimates the squint from styles instead of pixels. On Critly's site and the fixtures,
the two methods agree on the lead to within about 15%.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Passed |
| `1` | Findings: errors, or reviews without an exception |
| `2` | Couldn't run: server down, page not found, bad URL, bad policy, no browser. Not a pass |

## Rules

<!-- rules:begin (generated from src/rules.json by npm run readme:rules) -->
| Rule | Concept | Default | Fails when |
|---|---|---|---|
| `text-contrast` | [color-roles](https://critly.vercel.app/color-roles) | on | Text is below 4.5:1 against what's behind it (3:1 for large text), in every color scheme. Text over images, gradients or blends is reported for review instead of guessed. |
| `hit-area` | [hit-areas](https://critly.vercel.app/hit-areas) | on | A button, standalone link or input is smaller than 24px, or 44px on screens 640px wide or less. Links inside a sentence are exempt. |
| `icon-button-name` | [icons](https://critly.vercel.app/icons) | on | A button that shows only an icon has no accessible name. |
| `input-details` | [input-details](https://critly.vercel.app/input-details) | on | An input has no label, or its text is under 16px on a phone, which makes iOS zoom in on focus. |
| `overflow` | [responsive](https://critly.vercel.app/responsive) | on | Something is wider than the screen at 390px, text is clipped, or a fixed element or open dialog sits off-screen. |
| `type-scale` | [type-scale](https://critly.vercel.app/type-scale) | on, needs policy | A font size isn't one of the sizes in the policy's type scale. |
| `font-family` | [design-tokens](https://critly.vercel.app/design-tokens) | on, needs policy | Interface text uses a font that isn't in the policy (code, kbd and pre are excluded). |
| `line-length` | [line-length](https://critly.vercel.app/line-length) | on | A paragraph runs wider than 75 characters (or the policy's limit). |
| `letter-spacing` | [letter-spacing](https://critly.vercel.app/letter-spacing) | on | All-caps text has no positive tracking, or display text (32px and up) has positive tracking. |
| `tabular-numbers` | [tabular-numbers](https://critly.vercel.app/tabular-numbers) | on | Numbers in table cells (or marked data-critly-number) don't use tabular figures, or a numeric column isn't end-aligned. |
| `html-background` | [html-background](https://critly.vercel.app/html-background) | on | The html element has no background, or it differs from the body's, so overscroll shows a different color. |
| `transition-all` | [effect-cost](https://critly.vercel.app/effect-cost) | on | An element uses transition: all. |
| `layout-animation` | [smooth-animation](https://critly.vercel.app/smooth-animation) | on | An animation or transition moves width, height, top, left, margin or padding instead of transform and opacity. |
| `image-dimensions` | [image-loading](https://critly.vercel.app/image-loading) | on | An image has no width and height or aspect-ratio, so the page jumps when it loads, or a large image above the fold is lazy-loaded. |
| `placeholder-content` | [real-content](https://critly.vercel.app/real-content) | on | The page shows lorem ipsum, "John Doe", TODO, or a phrase the policy bans. |
| `spacing-scale` | [spacing-scale](https://critly.vercel.app/spacing-scale) | opt-in, needs policy | A gap or padding isn't on the policy's spacing scale. Opt-in until it's proven quiet on real apps. |
| `off-token-color` | [design-tokens](https://critly.vercel.app/design-tokens) | opt-in, needs policy | A text, background or border color matches none of the app's color tokens. Opt-in until it's proven quiet on real apps. |
| `nested-radius` | [nested-border-radius](https://critly.vercel.app/nested-border-radius) | opt-in | A rounded surface inside another, at an even inset, doesn't use outer radius minus inset. Opt-in until it's proven quiet on real apps. |
| `focus-ring` | [focus-rings](https://critly.vercel.app/focus-rings) | opt-in (CLI) | Tabbing to a control changes nothing visible, or the focused control is covered. |

Coming later (they need an interaction plan): `reduced-motion`, `layout-shift`, `overlay-focus`.
<!-- rules:end -->

## Fix the UI, not the policy

Findings never suggest editing the policy. When a value isn't on your scale, the fix names the two nearest steps;
when a color fails, it names the tokens that pass. Changing `.critly/policy.json`, adding an exception or turning a
rule off is a design decision for the person who owns the design, not a way to get to exit 0. If you work with
agents, put that in AGENTS.md:

```markdown
- UI work: use the `critly` skill. Read `.critly/policy.json` before choosing spacing, type or color, use only its values, and never edit it to pass.
- After any UI change, run `npm run lint:ui` and fix every error until it exits 0. Exit 2 means it couldn't run; say so, it is not a pass.
```

## Adopting it on an existing app

`--update-baseline` writes `.critly/baseline.json` with the count of findings per rule. After that, `--baseline`
fails only when a rule's count goes up, so CI can gate on day one while you fix the backlog. Lower the counts as you
go by running `--update-baseline` again.

## Playwright

Check whatever state a test reached: an open dialog, an error, a signed-in page.

```ts
import { test } from "@playwright/test";
import { expectCritly } from "@kausthubh/critly/playwright";

test("billing page passes the Critly check", async ({ page }, testInfo) => {
  await page.goto("/settings/billing");
  await expectCritly(page, testInfo);
});
```

`expectCritly(page, testInfo?, { policy?, policyPath?, scheme? })` reads `.critly/policy.json` unless you pass a
policy, attaches the JSON report to the test, and throws an assertion error listing every finding.
`checkPage(page, policy?)` returns `{ findings, coverage, suppressed }` without throwing. Both check the page at its
current viewport and scheme; switch them in the test.

From Node: `import { check } from "@kausthubh/critly"`, then `await check(["http://localhost:3000"])` returns the
same report as `--json`.

## In a browser tool

The rules are one dependency-free script, `@kausthubh/critly/check.js` (also in the `critly-audit` skill as
`scripts/check.js`). An agent with a browser tool that evaluates JavaScript (Claude's browser, a preview pane,
DevTools) can paste the file, then run:

```js
await window.__critlyCheck({ fonts: ["Inter"], typeScale: [12, 14, 16, 20, 24] }, { scheme: "light" })
```

It returns `{ findings, coverage, suppressed }` for the page as it is: set the viewport and color scheme first. It
reads `window.__critlyPolicy` when you don't pass a policy. It only reads the page.

## CI

GitHub's Ubuntu runners have Chrome.

```yaml
- run: npm ci
- run: npm run build && (npm start &) && npx wait-on http://localhost:3000
- run: npx critly check http://localhost:3000
```

## Limits

The check measures one render per page, viewport and scheme. It can't judge copy or whether the design is
good; the taste pass points at hierarchy and whitespace, and the call stays with a review.

- **Contrast** measures text against the backgrounds the browser paints behind it, including translucent layers,
  opacity and boxes positioned underneath. Text over an image, a gradient, a clip-path shape or a translucent
  surface with `backdrop-filter` passes only if it would pass over both black and white; otherwise it's a review.
  Blend modes, filters, text shadows and text stroke are always reviews. Disabled controls and `aria-hidden` text are
  skipped.
- **Hit areas** count the element's box, a positioned `::before`/`::after` that extends it, and the label of a
  checkbox or radio. A larger clickable parent, or JavaScript that widens the target, isn't seen.
- **Animations** are checked as declared and as running, with reduced motion on. Animations driven from JavaScript
  frame by frame (not CSS or the Web Animations API) aren't seen.
- **Line length** estimates characters from the font's average letter width, within a few percent.
- **Shadow DOM and iframes** aren't entered. Pages over 5,000 visible elements exit 2.
- Opt-in rules (`spacing-scale`, `off-token-color`, `nested-radius`) infer intent from layout and stay off until the
  policy turns them on. `focus-ring` is opt-in too: the CLI presses Tab through the page, so it needs `critly check`,
  not the browser script.

## Credits

`src/check.js` ports helpers from [lintapple](https://github.com/gholtzap/lintapple) by Gavin Holtzapple and
[@shadcn/lint](https://github.com/shadcn-ui/lint) by shadcn, both MIT. See [NOTICE.md](NOTICE.md).

MIT. Source: [kausthubh-coder/critly](https://github.com/kausthubh-coder/critly).
