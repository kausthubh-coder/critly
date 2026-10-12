# Layout

## Nested Border Radius

> Inner radius is outer minus padding.

- Section: Layout
- URL: https://critly.vercel.app/nested-border-radius
- Published: 2026-07-14
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/layout/nested-border-radius.mdx

Rounded corners look best when one curve follows the other. If a box sits
inside another box, using the same radius on both usually makes the gap wider
near the corner.

This is one of those little things that makes an interface feel off.

> **Interactive demo: Nested Radius.** Open https://critly.vercel.app/nested-border-radius to try it.

The fix is a simple relationship:

> **outer radius = inner radius + inset**

The inset is the distance between the two edges. It is often the parent’s
padding. If the parent has a border, include its width too.

In the demo, the inner radius is `16px` and the inset is `12px`. That makes the
outer radius `28px`.

### Start from the outer radius

Design systems usually start with a radius on the outer component. In that
case, reverse the formula:

> **inner radius = outer radius − inset**

> **Interactive demo: Radius Calculator.** Open https://critly.vercel.app/nested-border-radius to try it.

The inner radius cannot go below zero. If the inset is larger than the outer
radius, use a square inner corner. In CSS, `max()` can handle that limit for
you.

### Real components

The difference is easier to see in a card or a menu than in an empty diagram.

> **Interactive demo: Nested Radius Examples.** Open https://critly.vercel.app/nested-border-radius to try it.

The card has a `16px` outer radius and an `8px` inset, so its media uses `8px`.
The menu has a `12px` outer radius and a `4px` inset, so its highlighted item
uses `8px`.

### When to adjust it

The formula is a strong starting point, not a rule for every shape. Tune the
result by eye when the inset changes around the component, the inner element
does not reach the corner, or the surfaces use different corner shapes.

The fancy name for this is **concentric corners**: nested corners whose curves
share the same center.

### Resources

- [The math behind nesting rounded corners](https://cloudfour.com/thinks/the-math-behind-nesting-rounded-corners/): Cloud Four’s explanation of the radius formula with practical CSS examples.
- [border-radius](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/border-radius): MDN’s reference for the CSS border-radius property.
- [CSS corner shaping](https://www.w3.org/TR/css-backgrounds-3/#corners): The specification for outer, padding, and content edge radii.


## Hit Areas

> Make the target bigger than the icon.

- Section: Layout
- URL: https://critly.vercel.app/hit-areas
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/layout/hit-areas.mdx

A **hit area** is the part of an element that responds to a click or tap. It
does not have to match what you can see. A 16px icon can sit in a 32px
button, and nobody notices the extra space until it is missing.

> **Interactive demo: Hit Areas Toolbar.** Open https://critly.vercel.app/hit-areas to try it.

The two toolbars look the same. Hover across them, then show the hit areas.
The left one asks you to land on the icon itself.

**Make the hit area bigger than the thing you can see.**

### How big

The numbers most guidance agrees on:

- **24 × 24px:** the WCAG 2.2 minimum (2.5.8, level AA). A smaller target
  only passes if it has enough empty space around it.
- **44 × 44px:** the enhanced level (2.5.5, AAA). Apple uses the same 44 by
  44 points as the default size for iOS controls.
- **48 × 48dp:** what Android and Material ask for on touch.

I treat 24px as the floor for anything clickable and 32px as a comfortable
size for icon buttons on desktop. On touch, aim for 44px.

### Extend the target, not the icon

Sometimes a bigger button would look wrong, like the close button on a chip.
Keep the visible circle small and stretch an invisible pseudo-element over
it. Drag the slider and try to hit the close buttons.

> **Interactive demo: Hit Areas Expand.** Open https://critly.vercel.app/hit-areas to try it.

The button is 14px. An `::after` with `inset: -8px` turns it into a 30px
target, and the chip looks exactly the same.

### Gaps are dead zones

The space between two targets belongs to neither. Move slowly down the left
menu and the highlight drops out between items. A click there does nothing.

> **Interactive demo: Hit Areas Gap.** Open https://critly.vercel.app/hit-areas to try it.

On the right the items touch. The breathing room comes from padding inside
each item, so every pixel of the menu does something.

### Usage

**Tailwind**

```html
<!-- A 16px icon in a 32px button -->
<button class="grid size-8 place-items-center" aria-label="Bold">
  <svg class="size-4">...</svg>
</button>

<!-- A 14px button with a 30px target -->
<button class="relative size-3.5 after:absolute after:-inset-2" aria-label="Remove">
  <svg class="size-2.5">...</svg>
</button>
```

**CSS**

```css
.close {
  position: relative;
  width: 14px;
  height: 14px;
}

/* Invisible, but it takes the click */
.close::after {
  content: "";
  position: absolute;
  inset: -8px;
}
```

Don't let an extended area spill onto a neighbor. Where two hit areas
overlap, the one painted on top wins, and a click meant for one lands on the
other.

### Resources

- [Understanding 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): The WCAG 2.2 AA rule of 24 by 24 CSS pixels, and how the spacing exception works.
- [Understanding 2.5.5: Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html): The stricter AAA level of 44 by 44 CSS pixels.
- [Apple Human Interface Guidelines on control sizes](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility): Default and minimum control sizes for every Apple platform, from 44 by 44 points on iOS up.
- [Make apps more accessible](https://developer.android.com/guide/topics/ui/accessibility/apps): Android's guidance that every touch target should be at least 48 by 48dp.
- [Invisible Details of Interaction Design](https://rauno.me/craft/interaction-design): Rauno Freiberg on Fitts's law and why big, close targets are faster to hit.


## HTML Background

> Paint the canvas behind your page.

- Section: Layout
- URL: https://critly.vercel.app/html-background
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/layout/html-background.mdx

Pull past the top of a dark page in Safari and a white strip can appear behind
it. The app is dark, but the document canvas is still white.

The canvas is the surface the browser paints behind the page.

> **Interactive demo: Html Background.** Open https://critly.vercel.app/html-background to try it.

### The document canvas

A wrapper only paints its own box. When it moves during overscroll, the canvas
shows through. Set the background on the root element to paint that surface
too.

Browsers normally use the `body` background when `html` is transparent.
Setting it on `html` directly makes the intended canvas color clear and does
not rely on that behavior.

### Other edges

- **Theme color:** The `theme-color` meta tag can tint supported browser UI to
  match the page. Keep it in sync when the theme changes.
- **Overscroll:** `overscroll-behavior: none` can remove the bounce and stop
  scroll chaining. Use it carefully. The bounce is a familiar part of the
  platform.
- **Both themes:** The root background must follow the active theme, or the
  white flash can return in one mode.

### Usage

**Tailwind**

```html
<html class="bg-background">
```

**CSS**

```css
html {
  background-color: var(--background);
}
```

Use the same background token for the root and the app. If the theme changes,
that token should change with it.

### Resources

- [HTML vs Body in CSS](https://css-tricks.com/html-vs-body-in-css/): A practical look at how the root and body elements behave.
- [Canvas backgrounds](https://www.w3.org/TR/css-backgrounds-3/#special-backgrounds): How browsers paint the document canvas from the root or body.
- [overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior): Control what happens when scrolling reaches a boundary.
- [theme-color](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/theme-color): Match supported browser chrome to the page background.


## Clip-Path

> Reveal by clipping, not resizing.

- Section: Layout
- URL: https://critly.vercel.app/clip-path
- Published: 2026-07-16
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/layout/clip-path.mdx

`clip-path` hides part of an element without touching its layout. The box
keeps its size and the text keeps its wrapping. Only the visible window
changes.

> **Interactive demo: Clip Path Reveal.** Open https://critly.vercel.app/clip-path to try it.

The left card animates its width, so its text gets squeezed into an ellipsis
on every frame. The right card is clipped, so it wipes away in one piece.

**Animate the window, not the box.** A width change makes the browser
recalculate layout on every frame. A clip change skips layout, but most
browsers still repaint the clipped element each frame (Chrome can run basic
shapes like `inset()` off the main thread). That is cheap for a small,
one-off wipe. For a large or frequent reveal, slide two layers with
`transform` instead: an outer one that clips and an inner one that moves the
opposite way. See [Smooth Animation](https://critly.vercel.app/smooth-animation).

### Tabs

A segmented control has a pill that slides between options, and the label
under it changes color. If you transition each label's `color`, one label
fades out while the next fades in, and for a moment both are half gray.

Instead, render the tabs twice. The copy on top has inverted colors and is
clipped down to the pill. Then animate the clip.

> **Interactive demo: Clip Path Tabs.** Open https://critly.vercel.app/clip-path to try it.

The text on the right switches color exactly at the pill's edge. The
segmented controls on this site work the same way.

### Hold to delete

A destructive action can ask for a short hold. Render the red state on top,
clipped to zero width, and reveal it while the button is held.

> **Interactive demo: Clip Path Hold.** Open https://critly.vercel.app/clip-path to try it.

The reveal runs for `1.5s` with a linear curve, so the progress reads as
time. Letting go snaps it back in `200ms` with an ease-out. Nobody wants to
wait for a cancel.

### Comparison slider

Stack two images of the same size and clip the top one. Moving the clip edge
gives you a before and after slider. Neither image moves or stretches.

> **Interactive demo: Clip Path Compare.** Open https://critly.vercel.app/clip-path to try it.

### Usage

**Tailwind**

```html
<div
  class="transition-[clip-path] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] [clip-path:inset(0_0_0_0)] data-hidden:[clip-path:inset(0_100%_0_0)]"
>
  ...
</div>
```

**CSS**

```css
.card {
  /* top right bottom left */
  clip-path: inset(0 0 0 0);
  transition: clip-path 500ms cubic-bezier(0.23, 1, 0.32, 1);
}

.card[data-hidden] {
  clip-path: inset(0 100% 0 0);
}
```

`clip-path` cuts off everything outside the box, including shadows and focus
rings. Negative values give them room. The card in the first demo goes from
`inset(-16px)` to `inset(-16px calc(100% + 16px) -16px -16px)`.

### Resources

- [The Magic of Clip Path](https://emilkowal.ski/ui/the-magic-of-clip-path): Emil Kowalski walks through tabs, hold-to-delete buttons, and comparison sliders built with a single property.
- [clip-path](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/clip-path): MDN's reference for every shape clip-path accepts, and how they animate.
- [inset()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/basic-shape/inset): The shape you will use most, including the round keyword for rounded corners.
- [How to create high-performance CSS animations](https://web.dev/articles/animations-guide): Why animating width and height is expensive, and which properties are cheaper.


## Scroll Fades

> Fade the edge that has more to scroll.

- Section: Layout
- URL: https://critly.vercel.app/scroll-fades
- Published: 2026-07-16
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/layout/scroll-fades.mdx

A list cut off by a hard edge looks like it ends there. A **scroll fade**
dissolves the last visible row into the background, so the reader knows there
is more without looking for a scrollbar.

> **Interactive demo: Scroll Fades.** Open https://critly.vercel.app/scroll-fades to try it.

The fade is a `mask-image` gradient. Where the gradient is transparent the
content is hidden, and where it is black the content shows. Because it is a
mask and not an overlay, it works on any background and never blocks a click.

### Follow the scroll

A static mask fades the first row while you are at the top, and the last row
when there is nothing below it. That last one lies. The final item looks like
something is still hiding under it.

**Fade an edge only when there is more to scroll past it.**

> **Interactive demo: Scroll Fades Edge.** Open https://critly.vercel.app/scroll-fades to try it.

Scroll both lists to the top and the bottom. The right list grows each fade
over the first `40px` of scroll in that direction, so it follows the scroll
instead of popping in.

### With scroll-driven animations

This needs no JavaScript. `animation-timeline: scroll(self)` ties an animation
to the element's own scroll position, and `animation-range` limits it to the
first and last `40px`. The two fade sizes are custom properties registered
with `@property`, so they can animate.

The same rule works sideways with `scroll(self x)`.

> **Interactive demo: Scroll Fades Horizontal.** Open https://critly.vercel.app/scroll-fades to try it.

### Usage

**Tailwind**

```html
<!-- Static fade, 40px at both ends -->
<div
  class="h-44 overflow-y-auto mask-[linear-gradient(to_bottom,transparent,black_40px,black_calc(100%-40px),transparent)]"
>
  ...
</div>
```

**CSS**

```css
@property --fade-start {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

@property --fade-end {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

@keyframes fade-start {
  from { --fade-start: 0px; }
  to { --fade-start: 40px; }
}

@keyframes fade-end {
  from { --fade-end: 40px; }
  to { --fade-end: 0px; }
}

.list {
  overflow-y: auto;
  --fade-start: 40px;
  --fade-end: 40px;
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black var(--fade-start),
    black calc(100% - var(--fade-end)),
    transparent
  );
}

@supports (animation-timeline: scroll()) {
  .list {
    --fade-start: 0px;
    --fade-end: 0px;
    animation: fade-start linear both, fade-end linear both;
    animation-timeline: scroll(self);
    animation-range: 0 40px, calc(100% - 40px) 100%;
  }
}
```

Scroll-driven animations work in Chrome and Edge 115+ and Safari 26+. As of
October 2026, Firefox only has them in Nightly, so the `@supports` block keeps
the static fade there. If you need the scroll-linked fade in Firefox too, set
the two properties from a `scroll` listener, as the demos on this page do.

### Resources

- [mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-image): MDN's reference for the property that does the fading.
- [scroll()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline/scroll): The function that ties an animation to a scroll container's position.
- [Animate elements on scroll with scroll-driven animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations): The Chrome team's guide to scroll and view timelines, with live demos.
- [Detect if an element can scroll or not](https://www.bram.us/2023/09/16/solved-by-css-scroll-driven-animations-detect-if-an-element-can-scroll-or-not/): Bramus Van Damme on using a scroll timeline to style a container only when it overflows.
- [@property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property): How to register a custom property so it can animate.


## Squircles

> Corners that ease into the edge.

- Section: Layout
- URL: https://critly.vercel.app/squircles
- Published: 2026-09-14
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/layout/squircles.mdx

A normal rounded corner is a quarter circle. The straight edge runs along,
then the arc starts, and there is a point where one turns into the other. You
can feel that point even when you cannot see it.

A squircle removes it. The curve starts earlier and eases into the edge, so
the corner has no clear beginning or end. It is the shape of an iOS app icon,
and it is why those icons look softer than a box with the same radius.

> **Interactive demo: Squircle Compare.** Open https://critly.vercel.app/squircles to try it.

Both tiles use the same `28px` radius. Only the corner shape changes.

**Keep the radius, change the shape.** `border-radius` still sets how big the
corner is, and `corner-shape` sets the curve that fills it. Because the shape
belongs to the box, the background, border, outline, shadow and
`overflow: hidden` all follow it.

### How much curve

The keywords are named points on one scale, `superellipse()`. Drag the slider
to move along it. The dashed line is a plain round corner with the same
radius.

> **Interactive demo: Squircle Curvature.** Open https://critly.vercel.app/squircles to try it.

`1` is `round`, `2` is `squircle` and `0` is a flat `bevel`. Negative values
scoop inwards. Past `2` the curve hugs the corner more and more, until it
looks square again.

Notice that at the same radius a squircle covers more of the corner than a
round one does. If you swap the shape on an existing component and the
corner suddenly looks smaller, raise the radius until it feels as soft.

### Where it shows

The effect scales with the radius. A big radius on a small box, like an
avatar or an app icon, changes character completely. A small radius on a
button barely moves, and that is fine.

> **Interactive demo: Squircle Examples.** Open https://critly.vercel.app/squircles to try it.

The shape is not inherited, so set it on nested boxes too, and keep the outer
radius equal to the inner radius plus the inset. The card above uses `24px`
outside, `16px` inside and an `8px` inset.

### Usage

**Tailwind**

```html
<div class="rounded-[28px] corner-squircle">
```

**CSS**

```css
.icon {
  border-radius: 28px;
  corner-shape: squircle;
}
```

The Tailwind utility comes from the
[corner-shape plugin](https://github.com/toolwind/corner-shape). As of October
2026, `corner-shape` ships in Chrome and Edge 139+. Firefox and Safari only
have it in preview builds. Everywhere else the property is ignored and you get
the plain round corner from `border-radius`, which is fine for most UI. If the
shape is part of the brand, like an app icon, generate the path with
`figma-squircle` and apply it as a mask inside
`@supports not (corner-shape: squircle)`.

### Resources

- [corner-shape](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/corner-shape): MDN's reference for the property, its keywords and the superellipse() function.
- [CSS Borders 4, corner shaping](https://www.w3.org/TR/css-borders-4/#corner-shaping): The specification for corner-shape and how the curve is defined.
- [The corner cases of implementing CSS corner-shape in Blink](https://developer.chrome.com/blog/implementing-corner-shape): How Chrome draws borders and shadows that follow a superellipse.
- [Desperately seeking squircles](https://www.figma.com/blog/desperately-seeking-squircles/): Figma's story of reverse-engineering Apple's icon curve, and why it feels smoother.
- [figma-squircle](https://github.com/phamfoo/figma-squircle): Generates squircle SVG paths for browsers without corner-shape.


## Whitespace

> Space is how things group.

- Section: Layout
- URL: https://critly.vercel.app/whitespace
- Published: 2026-10-02
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/layout/whitespace.mdx

Before borders, cards or dividers, space is how you group things. We read
elements that sit close together as one unit and elements that sit apart as
separate ones. When every gap is the same, nothing belongs to anything.

**Gaps inside a group should be about half the gaps between groups, or less.**

> **Interactive demo: Whitespace.** Open https://critly.vercel.app/whitespace to try it.

With equal spacing, each label is 16px from its own field and 16px from the
field above it, so it belongs to neither. The grouped version uses three
gaps: 8px from label to field, 16px between fields and 32px between sections.
Each level doubles the last, and that is enough for the eye to read the
structure without a single line.

### Headings belong below

A heading names what comes after it, so it should sit closer to that content.
Give it about twice as much space above as below. In the demo, Notifications
has 32px above it and 16px below.

### Space before lines

Dividers and cards are the usual fix for a layout that reads as one long list.
They work, but often they are doing a job the spacing should have done.
Remove the lines and see what is left.

> **Interactive demo: Whitespace Dividers.** Open https://critly.vercel.app/whitespace to try it.

On the left, every row is 12px apart and the dividers carry all the grouping.
Without them it is five equal rows. On the right, the lines are optional. Get
the spacing right first, then add a line or a [shadow](https://critly.vercel.app/shadows-not-borders)
only where it still helps.

### Squint

Blur a layout, or squint at it, and the text turns into blocks. Good spacing
leaves a few clear clusters. Equal spacing leaves a ladder of stripes.

> **Interactive demo: Whitespace Squint.** Open https://critly.vercel.app/whitespace to try it.

It is the same blur test as in [optical alignment](https://critly.vercel.app/optical-alignment),
applied to a whole screen.

### Usage

Put the spacing on the parent with `gap`, one container per group. The
nesting in the markup then matches the grouping on screen.

**Tailwind**

```html
<form class="flex flex-col gap-8">
  <section class="flex flex-col gap-4">
    <h2>Profile</h2>
    <label class="flex flex-col gap-2">
      Name
      <input />
    </label>
    <label class="flex flex-col gap-2">
      Email
      <input />
    </label>
  </section>
  <section class="flex flex-col gap-4">...</section>
</form>
```

**CSS**

```css
form,
section,
label {
  display: flex;
  flex-direction: column;
}

form {
  gap: 32px;
}

section {
  gap: 16px;
}

label {
  gap: 8px;
}
```

Padding counts as space too. A 32px menu item with a 16px line of text
already has 8px of padding above and below it, so a 4px gap between groups
barely shows. Compare
the space between the text, not between the boxes. The values themselves come
from a [spacing scale](https://critly.vercel.app/spacing-scale).

### Resources

- [Proximity Principle in Visual Design](https://www.nngroup.com/articles/gestalt-proximity/): Nielsen Norman Group on why things that sit close together read as one group.
- [Form Design Quick Fix](https://www.nngroup.com/articles/form-design-white-space/): How grouping a long form into sections with white space makes it feel shorter.
- [Law of Proximity](https://lawsofux.com/law-of-proximity/): A one-page summary of the principle with its origins and takeaways.
- [gap](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/gap): The property that puts spacing on the group instead of on each child.


## Spacing Scale

> A few spaces, used everywhere.

- Section: Layout
- URL: https://critly.vercel.app/spacing-scale
- Published: 2026-10-02
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/layout/spacing-scale.mdx

Spacing drifts. One card gets 14px of padding, the next one 16px, a third
18px because it looked tight that day. Nobody sees the 2px, but people feel
that the page is slightly off, and every new screen adds another value.

**Pick every space from a small scale, and let the steps grow as the gaps do.**

> **Interactive demo: Spacing Scale.** Open https://critly.vercel.app/spacing-scale to try it.

The two cards look almost the same. The one-off version uses seven values,
each picked by eye, and the check marks sit at three different distances from
their text. The scale version uses four: 4, 8, 16 and 24. Things that should
line up now do, and the next person to build a card has four answers instead
of seven guesses.

### Steps that grow

Start from 4px: 4, 8, 12, 16, 24, 32, 48, 64. The steps are 4px apart at the
bottom, then 8, then 16.

> **Interactive demo: Spacing Steps.** Open https://critly.vercel.app/spacing-scale to try it.

We notice spacing in proportion. Going from 8px to 12px adds 50% and is easy
to see. Going from 48px to 52px adds 8% and nobody would notice, so it should
not be a separate choice. Each step here is between 1.33x and 2x the one below.

The 8-point grid allows only multiples of 8. I find that too coarse for dense
interfaces: 4px and 12px come up constantly for icon gaps and compact rows.
Atlassian builds on 8px too, but adds half steps like 4, 6 and 12 for the same
reason. A 4px base covers them and still lands on every multiple of 8.

### In Tailwind

Tailwind v4 derives every spacing utility from one variable,
`--spacing: 0.25rem`, so `gap-3` is 12px and `p-6` is 24px. That is a 4px
base, but not a scale: `gap-5`, `p-13` and `mt-4.5` all work too. Reset the
namespace and name only the steps you allow.

### Usage

**Tailwind**

```css
@import "tailwindcss";

@theme {
  --spacing-*: initial;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-12: 48px;
  --spacing-16: 64px;
}
```

**CSS**

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
}

.card {
  padding: var(--space-6);
  gap: var(--space-2);
}
```

Sizing utilities like `w-64` and `size-10` read the same namespace, so the
reset removes them too, and arbitrary values like `gap-[13px]` still compile.
If that is too strict for your codebase, keep the defaults and treat 1, 2, 3,
4, 6, 8, 12 and 16 as the only numbers you type. The scale decides which
values exist. [Whitespace](https://critly.vercel.app/whitespace) decides where the big ones go.

### Resources

- [Atlassian spacing](https://atlassian.design/foundations/spacing): A production spacing scale with guidance on which range to use for what.
- [The 8-Point Grid](https://spec.fm/specifics/8-pt-grid): The case for multiples of 8, paired with a 4pt baseline grid for text.
- [Tailwind theme variables](https://tailwindcss.com/docs/theme): How the spacing namespace works and how to replace the default values.
- [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4): Why every spacing utility in v4 is derived from a single variable.


## Alignment

> Fewer edges, less to read.

- Section: Layout
- URL: https://critly.vercel.app/alignment
- Published: 2026-10-03
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/layout/alignment.mdx

Every element starts somewhere, and the eye notices where. When a card's
content starts at 14px, the list below it at 8px and the input text at 10px,
nobody can say what is wrong, but the section looks unfinished.

**Line things up to as few edges as possible. Every new left edge is one more
thing the eye has to resolve.**

> **Interactive demo: Alignment.** Open https://critly.vercel.app/alignment to try it.

Both versions use the same components. The near-miss one has 6 left edges,
because each component brought its own padding: 14px in the card, 8px in the
rows, 10px in the input. The aligned one has 3: the boxes at 0, everything
else at 12px, and the text after an icon or avatar at 44px.

### Text aligns to text

When a heading sits above a card, it can line up with the card's border or
with the text inside it. Pick the text. We read down the left edge of the
words, not the faint boxes around them. In the demo, Members, Invite by email
and the placeholder all start at 12px.

Atlassian's grid aligns the containers and leaves what's inside to spacing
tokens. That keeps the frame tidy, but the text inside can still drift. I'd
give every box in a section the same inset, so the words line up too.

Within a column, keep one axis. The avatars and the card icon share a 24px
slot, so the text after them shares an edge too. Apple's guidelines note
that we read indented items as subordinate, so an accidental indent says
something you didn't mean.

### Hang the icons

Icon rows under a heading have the same choice.

> **Interactive demo: Alignment Icons.** Open https://critly.vercel.app/alignment to try it.

Indented, the icons sit on the heading's edge and the text starts 24px in,
a second edge for the reader to find. Hanging, the icons move out into the
margin and the text continues the heading's line. The icons work like
bullets, which is what they are.

Hanging needs room on the left. Inside a card with 16px of padding there
often isn't any, so indent there, the same way on every row.

### Usage

Share one inset across the boxes in a section, and hang icons by their own
width plus the gap.

**Tailwind**

```html
<section class="flex flex-col gap-4 [--inset:12px]">
  <h2 class="px-(--inset)">Members</h2>
  <div class="rounded-lg px-(--inset) py-3">...</div>
  <input class="px-(--inset)" />
</section>

<!-- 16px icon + 8px gap = 24px of hang -->
<ul>
  <li class="-ms-6 flex items-center gap-2">
    <svg class="size-4" />
    Unlimited projects
  </li>
</ul>
```

**CSS**

```css
section {
  --inset: 12px;
}

section h2,
section .card,
section input {
  padding-inline: var(--inset);
}

/* 16px icon + 8px gap = 24px of hang */
li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-inline-start: -24px;
}
```

Aligned by the numbers is not always aligned to the eye. A round icon or a
capital T sits slightly inside its box and may need a nudge, which is what
[optical alignment](https://critly.vercel.app/optical-alignment) is for. Alignment groups things
across, the way [whitespace](https://critly.vercel.app/whitespace) groups them down.

### Resources

- [Apple Human Interface Guidelines on layout](https://developer.apple.com/design/human-interface-guidelines/layout): Why aligned items read as related and indented items read as subordinate.
- [Atlassian grid](https://atlassian.design/foundations/grid): A production grid that aligns top-level containers and leaves the inside to spacing tokens.
- [Grids](https://practicaltypography.com/grids.html): Matthew Butterick on grids as a tool for consistency, not a guarantee of good layout.
- [What is Visual Alignment?](https://ixdf.org/literature/topics/visual-alignment): An overview of edge, center and left alignment and why fewer alignment lines read calmer.


## Density

> Fit the space to how often it's used.

- Section: Layout
- URL: https://critly.vercel.app/density
- Published: 2026-10-03
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/layout/density.mdx

The same list can show 6 rows or 9 in the same space. Neither is right on its
own. Someone triaging issues all day wants to see as much as possible, and
someone picking a plan once wants room to think.

**Choose density from how often and how long people use the screen.**

> **Interactive demo: Density.** Open https://critly.vercel.app/density to try it.

In the 288px window, comfortable shows 6 of 12 issues and compact shows 9.
Everything steps down at once: rows from 48 to 32px, padding from 16 to 8,
gaps from 12 to 8, text from 14 to 13px and icons from 20 to 16px.

### Who earns compact

Tools people keep open all day earn compact: issue trackers, inboxes, admin
tables, editors. People learn them, scan them, and pay for every extra
scroll. Compact means more rows, smaller gaps, smaller type and no decorative
space.

Rare or emotional flows earn comfortable: onboarding, checkout, a failed
payment. There the space is for reading carefully, and a little air helps
people slow down. Density is one of the three dials in
[product feel](https://critly.vercel.app/product-feel).

When both kinds of people use the same screen, let them choose. Cloudscape
ships both modes and defaults to comfortable.

### A system, not less padding

The tempting shortcut is to cut the padding and keep everything else.

> **Interactive demo: Density Padding.** Open https://critly.vercel.app/density to try it.

The left list keeps the comfortable 14px text and 20px icons and cuts the
padding until the rows are 28px. It fits more rows and it is worse: the text
crowds the icons, and every target shrinks to the size of its icon. The right
list steps everything down together. Its rows are 32px, and the 16px icons
sit in 24px buttons, so every target stays at the 24px floor from
[hit areas](https://critly.vercel.app/hit-areas).

Cloudscape describes its compact mode as the spacing scale reduced in 4px
steps. I'd go one step further and bring the type and icons down a size with
it, so the proportions survive.

### Usage

Switch the whole set of values with one attribute on the container.

**Tailwind**

```html
<!-- In your CSS:
@custom-variant compact (&:where([data-density="compact"] *)); -->
<ul data-density="compact">
  <li
    class="flex h-12 items-center gap-3 px-4 text-sm
      compact:h-8 compact:gap-2 compact:px-2 compact:text-[13px]"
  >
    <svg class="size-5 compact:size-4" />
    Fix login redirect loop
    <button class="size-8 compact:size-6">...</button>
  </li>
</ul>
```

**CSS**

```css
.list {
  --row: 48px;
  --pad: 16px;
  --gap: 12px;
  --text: 14px;
  --icon: 20px;
}

.list[data-density="compact"] {
  --row: 32px;
  --pad: 8px;
  --gap: 8px;
  --text: 13px;
  --icon: 16px;
}

.row {
  display: flex;
  align-items: center;
  height: var(--row);
  padding-inline: var(--pad);
  gap: var(--gap);
  font-size: var(--text);
}

.row svg {
  width: var(--icon);
  height: var(--icon);
}
```

Compact is for a mouse. A 32px row is fine to click and too small to tap, so
under `@media (pointer: coarse)` go back to the comfortable values. Take both
sets from your [spacing scale](https://critly.vercel.app/spacing-scale), not from new one-off numbers.

### Resources

- [UI Density](https://mattstromawn.com/writing/ui-density/): Matt Ström-Awn on density as the value a screen delivers for the time and space it takes.
- [Cloudscape content density](https://cloudscape.design/foundation/visual-foundation/content-density/): AWS's comfortable and compact modes, with compact meant for data-heavy views and chosen by the user.
- [Carbon data table style](https://carbondesignsystem.com/components/data-table/style/): Five table row heights from 24px to 64px, with the header row always matching.
- [Understanding 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): The 24 by 24 CSS pixel minimum that still applies when rows get tight.


## Layout Shift

> Hold the space for what arrives late.

- Section: Layout
- URL: https://critly.vercel.app/layout-shift
- Published: 2026-10-03
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/layout/layout-shift.mdx

You go to press a button, and just before you click, something loads above it
and the button slides away. You hit whatever moved into its place.

**Anything that arrives late should land in space that was already waiting for
it.**

> **Interactive demo: Layout Shift.** Open https://critly.vercel.app/layout-shift to try it.

In the jumpy card, a photo, a banner and an error each push Post down. In the
reserved card, the photo fills a box that was there from the start, the banner
floats over the post, and the error has its own line.

### Where shifts come from

- **Images and video:** set `width` and `height`, or an `aspect-ratio`, so the
  browser can size the box before the file arrives.
- **Async content:** give the [skeleton](https://critly.vercel.app/performance-is-design) the final
  dimensions, or the container a fixed height.
- **Validation messages:** reserve the line under the field, as in
  [input details](https://critly.vercel.app/input-details).
- **Conditional buttons and badges:** keep their slot, or overlay them. A
  number that changes width as it ticks is a small shift too, which
  [tabular numbers](https://critly.vercel.app/tabular-numbers) fixes.
- **Scrollbars:** on Windows, a scrollbar appearing narrows the page and
  everything centered jumps sideways. `scrollbar-gutter: stable` keeps room
  for it.

### Web fonts

With `font-display: swap`, text renders first in a fallback font, then in the
web font. If the two have different widths, lines rewrap and everything below
them moves.

> **Interactive demo: Font Swap.** Open https://critly.vercel.app/layout-shift to try it.

Both fall back to Arial. Plain Arial is narrower, so the paragraph loses a
line and the link jumps 24px when Inter arrives. The adjusted one scales Arial
with `size-adjust: 107.89%` and matches its ascent and descent, so nothing
moves. next/font generates these overrides for every font it loads.

### CLS

Chrome measures this as Cumulative Layout Shift, one of the Core Web Vitals.
0.1 or less is good, over 0.25 is poor. Shifts within 500ms of a click or key press
don't count, so the error that pushes Post down right after you press it costs
nothing in CLS. It still costs the person pressing again.

### Usage

**Tailwind**

```html
<img src="/pond.jpg" width="1200" height="600" class="h-auto w-full" alt="" />

<div class="aspect-2/1 rounded-lg bg-muted">...</div>

<p class="h-5 text-sm text-red-600">{error}</p>

<html class="[scrollbar-gutter:stable]">
```

**CSS**

```css
img {
  height: auto;
}

.photo {
  aspect-ratio: 2 / 1;
}

.field-error {
  height: 1.25rem;
}

html {
  scrollbar-gutter: stable;
}

@font-face {
  font-family: "Inter Fallback";
  src: local("Arial");
  size-adjust: 107.89%;
  ascent-override: 89.79%;
  descent-override: 22.36%;
  line-gap-override: 0%;
}

body {
  font-family: "Inter", "Inter Fallback", sans-serif;
}
```

Safari supports `size-adjust` but not yet the ascent and descent overrides.
Give text an explicit `line-height` and the line boxes stay the same height
there anyway.

### Resources

- [Cumulative Layout Shift (CLS)](https://web.dev/articles/cls): How Chrome scores unexpected movement, where the 0.1 and 0.25 thresholds come from, and which shifts are excluded.
- [Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls): The usual causes, from images without dimensions to late embeds and web fonts, with a fix for each.
- [Improved font fallbacks](https://developer.chrome.com/blog/font-fallbacks): How size-adjust and the metric overrides make a fallback font take up the same space as the web font.
- [scrollbar-gutter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-gutter): Keep room for a scrollbar so content does not move sideways when one appears.


## Responsive

> Fit the space you're given.

- Section: Layout
- URL: https://critly.vercel.app/responsive
- Published: 2026-10-03
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/layout/responsive.mdx

A component doesn't know where it will end up. The same card sits in a wide
column, a narrow sidebar and a phone. Media queries ask how big the screen is,
which is the wrong question for anything smaller than the page.

**A component should respond to the space it is given, not to the size of the
screen.**

> **Interactive demo: Container Query.** Open https://critly.vercel.app/responsive to try it.

Drag the edge. The container query card stacks below 256px and goes back to a
row above it. The viewport card asks whether the window is 768px wide, so on a
laptop it stays a row in any container and squeezes its title to nothing. On a
phone it stays stacked even when there is room.

### Change the layout, not just the size

At narrow widths, don't shrink everything until it fits. Stack the row, give
actions their own line, drop what is secondary. Here the 56px thumbnail
becomes a banner and the button goes full width.

When a row stays a row, give its text `min-width: 0`. Flex children won't
shrink below their content by default, so the title pushes the button out
instead of truncating.

### Fluid type

Type and spacing can scale with the space too, within limits.

> **Interactive demo: Fluid Type.** Open https://critly.vercel.app/responsive to try it.

The fluid heading uses `clamp(1.25rem, 0.25rem + 8cqi, 2.5rem)`: 20px in
containers up to 200px wide, 40px from 450px. `cqi` is 1% of the container's
width, so it follows the card, not the window. Keep a `rem` in the middle
value. Sizes in `vw` alone don't grow when people zoom.

### On phones

Use `100dvh` for full-height layouts. On phones, `100vh` is the height with the
toolbars hidden, so it runs under them when they show. And grow targets to the
44px from [hit areas](https://critly.vercel.app/hit-areas) on touch screens, with Tailwind's
`pointer-coarse:` variant.

### Usage

In Tailwind v4, `@container` marks the container and `@3xs:` applies from 16rem
(256px) up. `@min-[...]:` takes any value.

**Tailwind**

```html
<div class="@container">
  <article class="flex flex-col gap-3 @3xs:flex-row @3xs:items-center">
    <img class="h-20 w-full object-cover @3xs:size-14" src="..." alt="" />
    <div class="min-w-0 flex-1">
      <p class="truncate">Water Lilies, evening effect</p>
    </div>
    <button class="h-9 w-full @3xs:w-auto pointer-coarse:h-11">Save</button>
  </article>
</div>

<h1 class="text-[length:clamp(1.25rem,0.25rem+8cqi,2.5rem)]">...</h1>

<main class="min-h-dvh">...</main>
```

**CSS**

```css
.card-wrapper {
  container-type: inline-size;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@container (width >= 16rem) {
  .card {
    flex-direction: row;
    align-items: center;
  }
}

.card-text {
  min-width: 0;
}

h1 {
  font-size: clamp(1.25rem, 0.25rem + 8cqi, 2.5rem);
}

main {
  min-height: 100dvh;
}
```

An element can't query its own size, only its ancestors'. Put `@container` on
a wrapper around the card, not on the card you want to change.

### Resources

- [CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries): MDN's guide to container-type, @container and the container query length units.
- [Tailwind responsive design](https://tailwindcss.com/docs/responsive-design): Breakpoints and the built-in @container variants, including the size of each one.
- [A friendly introduction to container queries](https://www.joshwcomeau.com/css/container-queries-introduction/): Josh Comeau on how container queries work and the containment that makes them possible.
- [Modern fluid typography using CSS clamp](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/): How to build a fluid type scale with clamp(), and why to test it with zoom.
- [The large, small and dynamic viewport units](https://web.dev/blog/viewport-units): Why 100vh is too tall on mobile and which of svh, lvh and dvh to use instead.
