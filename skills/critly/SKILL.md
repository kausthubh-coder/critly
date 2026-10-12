---
name: critly
description: 'Design engineering concepts from Critly (critly.vercel.app) for the details that make interfaces feel right and fast - typography, color, spacing and layout, interaction states, focus, forms, motion, sound, data, and web performance. Use when building, polishing or reviewing UI: buttons, hover/press/focus/disabled states, inputs and forms, menus, modals and drawers, empty and loading states, cards, borders, shadows, glass and blur, border radius, icons, numbers, tables, lists and feeds, charts, images, video, animations, springs, easings, transitions. Also use for performance work: slow pages, load times, laggy typing, janky or stuttering animation, slow navigation, heavy images or video, big lists, bundle size. Triggers include "make it feel better", "polish this", "something feels off", "review my UI", "make it faster", "why is this slow", "smooth this out", or questions about taste, whitespace, hierarchy, or design details.'
metadata:
  author: kausthubh-coder
  source: https://critly.vercel.app
  version: "2026-10-09"
  forked-from: https://github.com/gustavo-fior/craft
---

# Critly

A collection of design engineering concepts, forked from Gustavo Fior's
Craft and extended. Each concept is a short explainer with a rule you can
apply directly, plus the CSS, Tailwind, or React to do it. The live site
pairs every concept with an interactive demo.

`references/rules.md` lists every concept's rule in one line. It is short on
purpose: re-read it whenever you start a new piece of work and before you
finish. Open the full reference for any rule you are about to apply.

## How to use this skill

There are two modes. Pick the one that matches the request. To audit or fix
a whole existing app (a URL or a repo), use the `critly-audit` skill instead;
it runs a full top-down pass with these concepts.

### Build mode: writing or changing UI

1. Start from the feel. Before picking any value, decide in one line who uses
   this, how often, and how it should feel: compact or comfortable, instant
   or animated, quiet or expressive. Read **Product Feel** for how each
   choice maps to values. If the project already has tokens (spacing scale,
   type scale, color roles, radii), use them instead of adding new ones.
2. Map the work to concepts with the table in **What to open** below, and
   skim `references/rules.md`.
3. Read the matching sections in `references/` before writing code. Each
   concept there has the full reasoning, the rule, and the code. Do not apply
   a concept from its one-line summary alone.
4. Apply the rule, and prefer the exact values from the reference (durations,
   easings, scales, radii, opacities, spacing steps) over inventing your own.
   Reuse the same few values everywhere instead of tuning each component.
5. **Come back when the work changes shape.** What you read at the start only
   covers what you planned. The moment the work grows a new kind of thing (you
   add a blur, an animation, a long list, an image or video, a slow action, a
   drag), stop and open the concepts for that row of the table before writing
   that code.
6. **Check before you say it's done.** Re-read `references/rules.md` and, for
   every concept your change touched, confirm the rule holds in the code you
   wrote. Check the states, not just the resting one. For anything that
   affects speed or smoothness, measure it as **Measuring Performance**
   describes and report before and after numbers with the environment. Never
   say tests or checks pass unless you ran them. If what you built differs
   from an approved mockup or design, say what changed and why before the
   user finds it.
7. Mention the concepts you applied in one line at the end, so the user can
   look them up.

### What to open

| When the work involves | Open |
| --- | --- |
| Any animation or transition | Easings, Springs, Interruptibility, Smooth Animation, Reduced Motion |
| Animating size, position or layout | Smooth Animation, Shared Layout, Liquid Motion |
| Drags, swipes, sheets, carousels | Momentum, Springs, Interruptibility |
| Blur, glass, `backdrop-filter`, big shadows, filters | Liquid Glass, Effect Cost, Shadows, Not Borders |
| Lists, grids, feeds or rows of cards | Long Lists, Responsiveness, Density |
| Images | Image Loading, Layout Shift, Image Outlines |
| Video, iframes, maps, widgets | Video and Embeds, Instant Navigation |
| Fonts or text rendering | Font Loading, Layout Shift, Type Scale |
| A click, keystroke or route that waits on work or the network | Responsiveness, Instant Navigation, Performance Is Design |
| "Slow", "laggy", "janky", load times, bundle size | Measuring Performance first, then JavaScript Cost and the matching rows |
| Hover effects and previews | Hover Restraint, Interaction States |
| Menus, modals, drawers, popovers | Overlays, Scale Entrances, Exit Animations, Focus Rings |
| Forms and inputs | Input Details, Focus Rings, Microcopy |
| Empty, loading and error states | Empty States, Performance Is Design, Real Content |

### Review mode: "review", "polish" or "what feels off" on a component or page

1. Read the code (and screenshots, if you can take them) with
   `references/rules.md` and the index open.
   Check every state, not just the resting one: hover, pressed, focus,
   disabled, loading, empty, error, light and dark, narrow and wide. Read
   only the reference sections for concepts the code actually touches.
2. For each problem, confirm it against the reference before reporting it.
3. Report one table, most important first:

   | Severity | Where | Before | After | Concept |
   | --- | --- | --- | --- | --- |
   | High | `button.tsx:14` | `transition: all 300ms` on hover | Instant hover, `transition: transform 100ms ease-out` for press only | [Hover Restraint](https://critly.vercel.app/hover-restraint) |

   - **Severity**: High means people will notice it or it breaks access
     (focus, hit areas, contrast, layout shift). Medium means it reads as
     unpolished. Low is a refinement.
   - **Where** is `file:line` or the component name.
   - **Before / After** are concrete: values or code, not adjectives.
   - **Concept** links one concept, or two when they fix the same row
     together (Whitespace and Spacing Scale, Easings and Scale Entrances).
   - A review of one component or file is quick: at most 5 rows. A page, a
     flow, or "review my UI" is full: at most 15. Merge repeats of the same
     issue into one row, and drop Low rows first when you hit the cap.
4. If something matters but no concept covers it, add it after the table
   under **Outside Critly**, one line each, with no concept link.
5. End with one line offering to apply the fixes. Don't apply them unless
   asked.

The code samples in the references use Tailwind v4 (`outline-hidden`,
`shadow-(--var)`, `@theme`). Check the project's Tailwind version, and
translate to plain CSS or v3 syntax when it differs. Only cite a concept that
is in the index.

## Principles

- Details that nobody notices still compound. Correct defaults on radius,
  spacing, easing, and contrast are what make an interface feel finished.
- Consistency beats novelty. Reuse the same two or three easings, one spacing
  scale, the same radius ratios, and one shadow recipe across the product.
- Space and tone before decoration. Group with whitespace before borders, and
  quiet secondary content before making the primary thing louder.
- Motion has to earn its place. Frequent, intentional interactions should be
  instant; rare or spatial ones can animate. Reduce motion, don't remove meaning.
- Every control has more than one face. Design hover, pressed, focus,
  disabled, loading and empty states, not just the resting one.
- Respect physical intuition. Nothing appears from nothing, nested corners
  share a center, and light comes from above.

## Concept index

<!-- concepts:start -->
### Craft

- **Performance Is Design**: How fast it feels is a design choice. ([reference](references/craft.md#performance-is-design), [demo](https://critly.vercel.app/performance-is-design))
- **How to Get References**: Great work starts with great inputs. ([reference](references/craft.md#how-to-get-references), [demo](https://critly.vercel.app/how-to-get-references))
- **Novelty Budget**: Save delight for the rare moments. ([reference](references/craft.md#novelty-budget), [demo](https://critly.vercel.app/novelty-budget))
- **Taste Is Trained**: Taste is a skill, and it takes reps. ([reference](references/craft.md#taste-is-trained), [demo](https://critly.vercel.app/taste-is-trained))
- **Timelessness**: Surface ages fast. Structure doesn't. ([reference](references/craft.md#timelessness), [demo](https://critly.vercel.app/timelessness))
- **Product Feel**: Decide the feel before the numbers. ([reference](references/craft.md#product-feel), [demo](https://critly.vercel.app/product-feel))
- **Design Tokens**: Name the role, not the value. ([reference](references/craft.md#design-tokens), [demo](https://critly.vercel.app/design-tokens))

### Typography

- **Letter Spacing**: Tighten big text, loosen small text. ([reference](references/typography.md#letter-spacing), [demo](https://critly.vercel.app/letter-spacing))
- **Text Wrapping**: Balanced headings, no lonely last words. ([reference](references/typography.md#text-wrapping), [demo](https://critly.vercel.app/text-wrapping))
- **Tabular Numbers**: Steady digits for values that change. ([reference](references/typography.md#tabular-numbers), [demo](https://critly.vercel.app/tabular-numbers))
- **Optical Alignment**: Center for the eye, not the math. ([reference](references/typography.md#optical-alignment), [demo](https://critly.vercel.app/optical-alignment))
- **Icons**: One set, one weight, sized to the text. ([reference](references/typography.md#icons), [demo](https://critly.vercel.app/icons))
- **Font Smoothing**: Light text on dark renders heavier. ([reference](references/typography.md#font-smoothing), [demo](https://critly.vercel.app/font-smoothing))
- **Visual Hierarchy**: Quiet the rest so one thing leads. ([reference](references/typography.md#visual-hierarchy), [demo](https://critly.vercel.app/visual-hierarchy))
- **Line Length**: Lines short enough to find the next one. ([reference](references/typography.md#line-length), [demo](https://critly.vercel.app/line-length))
- **Type Scale**: A few sizes, each with a job. ([reference](references/typography.md#type-scale), [demo](https://critly.vercel.app/type-scale))

### Color

- **OKLCH**: Lightness values that look equal. ([reference](references/color.md#oklch), [demo](https://critly.vercel.app/oklch))
- **Noise**: Grain hides banding and adds texture. ([reference](references/color.md#noise), [demo](https://critly.vercel.app/noise))
- **Shadows, Not Borders**: Layered shadows give edge and depth. ([reference](references/color.md#shadows-not-borders), [demo](https://critly.vercel.app/shadows-not-borders))
- **Image Outlines**: A faint inner edge that frames images. ([reference](references/color.md#image-outlines), [demo](https://critly.vercel.app/image-outlines))
- **Color Roles**: Gray does the work, color has a job. ([reference](references/color.md#color-roles), [demo](https://critly.vercel.app/color-roles))
- **Dark Mode**: A second design, not an inverted one. ([reference](references/color.md#dark-mode), [demo](https://critly.vercel.app/dark-mode))
- **Liquid Glass**: A lens for controls, never for content. ([reference](references/color.md#liquid-glass), [demo](https://critly.vercel.app/liquid-glass))

### Layout

- **Nested Border Radius**: Inner radius is outer minus padding. ([reference](references/layout.md#nested-border-radius), [demo](https://critly.vercel.app/nested-border-radius))
- **Hit Areas**: Make the target bigger than the icon. ([reference](references/layout.md#hit-areas), [demo](https://critly.vercel.app/hit-areas))
- **HTML Background**: Paint the canvas behind your page. ([reference](references/layout.md#html-background), [demo](https://critly.vercel.app/html-background))
- **Clip-Path**: Reveal by clipping, not resizing. ([reference](references/layout.md#clip-path), [demo](https://critly.vercel.app/clip-path))
- **Scroll Fades**: Fade the edge that has more to scroll. ([reference](references/layout.md#scroll-fades), [demo](https://critly.vercel.app/scroll-fades))
- **Squircles**: Corners that ease into the edge. ([reference](references/layout.md#squircles), [demo](https://critly.vercel.app/squircles))
- **Whitespace**: Space is how things group. ([reference](references/layout.md#whitespace), [demo](https://critly.vercel.app/whitespace))
- **Spacing Scale**: A few spaces, used everywhere. ([reference](references/layout.md#spacing-scale), [demo](https://critly.vercel.app/spacing-scale))
- **Alignment**: Fewer edges, less to read. ([reference](references/layout.md#alignment), [demo](https://critly.vercel.app/alignment))
- **Density**: Fit the space to how often it's used. ([reference](references/layout.md#density), [demo](https://critly.vercel.app/density))
- **Layout Shift**: Hold the space for what arrives late. ([reference](references/layout.md#layout-shift), [demo](https://critly.vercel.app/layout-shift))
- **Responsive**: Fit the space you're given. ([reference](references/layout.md#responsive), [demo](https://critly.vercel.app/responsive))

### Interaction

- **Interaction States**: Every control has more than one face. ([reference](references/interaction.md#interaction-states), [demo](https://critly.vercel.app/interaction-states))
- **Focus Rings**: Show keyboard users where they are. ([reference](references/interaction.md#focus-rings), [demo](https://critly.vercel.app/focus-rings))
- **Input Details**: Small attributes that make typing easy. ([reference](references/interaction.md#input-details), [demo](https://critly.vercel.app/input-details))
- **Empty States**: Say why it's empty and what to do next. ([reference](references/interaction.md#empty-states), [demo](https://critly.vercel.app/empty-states))
- **Command Menu**: One shortcut to reach everything. ([reference](references/interaction.md#command-menu), [demo](https://critly.vercel.app/command-menu))
- **Overlays**: Keep scroll and focus inside the layer. ([reference](references/interaction.md#overlays), [demo](https://critly.vercel.app/overlays))
- **Toasts**: News from somewhere else. ([reference](references/interaction.md#toasts), [demo](https://critly.vercel.app/toasts))
- **Destructive Actions**: Undo instead of asking. ([reference](references/interaction.md#destructive-actions), [demo](https://critly.vercel.app/destructive-actions))

### Content

- **Microcopy**: Buttons say what they do. ([reference](references/content.md#microcopy), [demo](https://critly.vercel.app/microcopy))
- **Real Content**: Design for the data you'll actually get. ([reference](references/content.md#real-content), [demo](https://critly.vercel.app/real-content))

### Motion

- **Icon Morph**: Blur, scale and fade between icons. ([reference](references/motion.md#icon-morph), [demo](https://critly.vercel.app/icon-morph))
- **Button Press**: Scale down on press so it feels real. ([reference](references/motion.md#button-press), [demo](https://critly.vercel.app/button-press))
- **Easings**: Ease-out for anything the user triggers. ([reference](references/motion.md#easings), [demo](https://critly.vercel.app/easings))
- **Springs**: Tune motion by feel, then convert it. ([reference](references/motion.md#springs), [demo](https://critly.vercel.app/springs))
- **Stagger**: Turn one block into a sequence. ([reference](references/motion.md#stagger), [demo](https://critly.vercel.app/stagger))
- **Interruptibility**: Animation that can change its mind. ([reference](references/motion.md#interruptibility), [demo](https://critly.vercel.app/interruptibility))
- **Momentum**: Finish the throw people started. ([reference](references/motion.md#momentum), [demo](https://critly.vercel.app/momentum))
- **Hover Restraint**: Frequent interactions should be instant. ([reference](references/motion.md#hover-restraint), [demo](https://critly.vercel.app/hover-restraint))
- **Shared Layout**: One element moving beats two swapping. ([reference](references/motion.md#shared-layout), [demo](https://critly.vercel.app/shared-layout))
- **Liquid Motion**: One surface that changes shape. ([reference](references/motion.md#liquid-motion), [demo](https://critly.vercel.app/liquid-motion))
- **Exit Animations**: Leave faster and quieter than you came. ([reference](references/motion.md#exit-animations), [demo](https://critly.vercel.app/exit-animations))
- **Scale Entrances**: Grow from the trigger, not from zero. ([reference](references/motion.md#scale-entrances), [demo](https://critly.vercel.app/scale-entrances))
- **Reduced Motion**: Reduce motion, keep meaning. ([reference](references/motion.md#reduced-motion), [demo](https://critly.vercel.app/reduced-motion))

### Performance

- **Measuring Performance**: Measure the wait people feel, more than once. ([reference](references/performance.md#measuring-performance), [demo](https://critly.vercel.app/measuring-performance))
- **Responsiveness**: Answer every input on the next frame. ([reference](references/performance.md#responsiveness), [demo](https://critly.vercel.app/responsiveness))
- **Instant Navigation**: Start loading before the click lands. ([reference](references/performance.md#instant-navigation), [demo](https://critly.vercel.app/instant-navigation))
- **Image Loading**: Hold the space, then fade in. ([reference](references/performance.md#image-loading), [demo](https://critly.vercel.app/image-loading))
- **Font Loading**: Text first, in a fallback that fits. ([reference](references/performance.md#font-loading), [demo](https://critly.vercel.app/font-loading))
- **Video and Embeds**: Load the player when someone wants it. ([reference](references/performance.md#video-and-embeds), [demo](https://critly.vercel.app/video-and-embeds))
- **JavaScript Cost**: Ship less script, load the rest on intent. ([reference](references/performance.md#javascript-cost), [demo](https://critly.vercel.app/javascript-cost))
- **Long Lists**: Render what's on screen, not everything. ([reference](references/performance.md#long-lists), [demo](https://critly.vercel.app/long-lists))
- **Smooth Animation**: Animate what the compositor can run. ([reference](references/performance.md#smooth-animation), [demo](https://critly.vercel.app/smooth-animation))
- **Effect Cost**: Budget effects by how many, not how they look. ([reference](references/performance.md#effect-cost), [demo](https://critly.vercel.app/effect-cost))

### Sound

- **Interface SFX**: Quiet sounds that confirm actions. ([reference](references/sound.md#interface-sfx), [demo](https://critly.vercel.app/interface-sfx))
- **Layering Sounds**: Stack short sources into one full cue. ([reference](references/sound.md#layering-sounds), [demo](https://critly.vercel.app/layering-sounds))

### Data

- **Living Charts**: Charts that flow instead of jump. ([reference](references/data.md#living-charts), [demo](https://critly.vercel.app/living-charts))
- **Curve Smoothing**: Smooth lines that don't invent data. ([reference](references/data.md#curve-smoothing), [demo](https://critly.vercel.app/curve-smoothing))
<!-- concepts:end -->

## Keeping this skill current

This copy is dated by `version` above. The live index is
https://critly.vercel.app/llms.txt. If a concept named in this file or on the
live site is missing from `references/`, this copy is out of date: tell the
user once, and suggest `npx skills update -g` to update it (or
`npx skills add kausthubh-coder/craft -g` if it wasn't installed that way).
Don't keep a vendored copy inside a project; install it globally so every
project gets updates.

The concept index, `references/` and `rules.md` are generated from the
site's content with `bun run build:skill` in the Critly repository. Edit the
articles, not the references.
