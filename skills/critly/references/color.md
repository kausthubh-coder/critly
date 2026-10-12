# Color

## OKLCH

> Lightness values that look equal.

- Section: Color
- URL: https://critly.vercel.app/oklch
- Published: 2026-07-14
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/color/oklch.mdx

In HSL, lightness is a number the math likes and your eyes don't. A yellow at
65% looks bright and a blue at 65% looks far darker. **OKLCH** defines lightness the
way people see it, so one value looks about as light on every hue.

**Pick colors in OKLCH, so equal lightness numbers actually look equally
light.**

> **Interactive demo: Oklch.** Open https://critly.vercel.app/oklch to try it.

Switch to lightness only and the HSL row turns into uneven grays, while the
OKLCH row stays flat. That unevenness is why text passes contrast on one hue
and fails on the next, and why some badges look louder than others.

### The three numbers

`oklch(L C H)` is lightness, chroma and hue. Lightness runs from `0` (black)
to `1` (white). Chroma is how colorful it is, from `0` (gray) up to about
`0.32` in sRGB and `0.36` on a P3 screen. Hue is an angle: around `25` is
red, `145` green and `250` blue.

Change one number and only that thing changes. Set chroma to `0` and any hue
becomes a gray at the same lightness.

### Gradients

The color space also decides what happens between two colors. In sRGB, a
gradient between opposite hues runs straight through gray. In OKLCH it keeps
its chroma and turns through the hues in between.

> **Interactive demo: Oklch Gradient.** Open https://critly.vercel.app/oklch to try it.

You get this with one keyword: `linear-gradient(in oklch, ...)`.

### Palettes

Because lightness is reliable, a tonal scale is just a list of lightness
values on one hue. Drag the hue and the ramp keeps its shape.

> **Interactive demo: Oklch Palette.** Open https://critly.vercel.app/oklch to try it.

White text on the 700 step stays between 6.1:1 and 7.1:1 contrast on every
hue. White on `hsl(h 70% 50%)` swings from 1.5:1 to 8.9:1.

Hues can't all hold the same chroma, though. At lightness `0.93`, sRGB fits
a green with almost four times the chroma of a blue. The demo caps every step
at what sRGB can show, which is why some hues come out softer.

### Usage

Tailwind v4 already defines its palette in OKLCH, and the color tokens on
this site are all OKLCH too.

**Tailwind**

```html
<button class="bg-[oklch(0.48_0.13_250)] text-white hover:bg-[oklch(0.38_0.1_250)]">
  Continue
</button>

<span class="bg-[oklch(0.93_0.05_145)] text-[oklch(0.48_0.12_145)]">
  Shipped
</span>
```

**CSS**

```css
:root {
  --brand-200: oklch(0.93 0.03 250);
  --brand-700: oklch(0.48 0.13 250);
  --brand-800: oklch(0.38 0.1 250);
}

.button {
  background: var(--brand-700);
}

.button:hover {
  background: var(--brand-800);
}

.hero {
  background: linear-gradient(in oklch, oklch(0.6 0.16 260), oklch(0.75 0.16 70));
}
```

`oklch()` has worked in every major browser since 2023, so it needs no
fallback. The catch is gamut. A value the screen can't show gets mapped back
in, and its lightness can shift on the way, so check new colors at
[oklch.com](https://oklch.com/) before you ship them.

### Resources

- [OKLCH in CSS, why we moved from RGB and HSL](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl): The case for OKLCH, with side by side palettes that make the HSL problem obvious.
- [OKLCH color picker](https://oklch.com/): Pick colors by lightness, chroma and hue, and see where the sRGB and P3 gamuts end.
- [oklch()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch): Syntax, ranges and browser support for the CSS function.
- [A perceptual color space for image processing](https://bottosson.github.io/posts/oklab/): Björn Ottosson's post that introduced Oklab, the space OKLCH is built on.


## Noise

> Grain hides banding and adds texture.

- Section: Color
- URL: https://critly.vercel.app/noise
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/color/noise.mdx

When the UI feels too flat, sometimes I like to add noise to some components to give them some texture.

**Noise** is a layer of random light and dark pixels laid over the surface. It breaks the steps up and gives the color some texture.

> **Interactive demo: Noise.** Open https://critly.vercel.app/noise to try it.

### Grain size

The `baseFrequency` attribute controls how fine the noise is. Low values give big soft blobs, whle high values give the tight speckle of film grain.

> **Interactive demo: Noise Frequency.** Open https://critly.vercel.app/noise to try it.

### Usage

Put the filter in one SVG anywhere on the page, then reference it from an overlay. The overlay is an empty element, so it costs nothing in markup and can be dropped onto any positioned container.

**Tailwind**

```html
<svg class="absolute size-0" aria-hidden="true">
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
    <feColorMatrix type="saturate" values="0" />
  </filter>
</svg>

<div class="relative isolate overflow-hidden rounded-2xl bg-violet-600">
  <div class="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay filter-[url(#grain)]" aria-hidden="true"></div>
  <!-- content -->
</div>
```

**CSS**

```css
.surface {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.surface::after {
  content: "";
  position: absolute;
  inset: 0;
  filter: url(#grain);
  opacity: 0.08;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

The `isolate` on the container matters. Without it, `mix-blend-mode` blends the grain with everything behind the card, including the page background, and the effect changes depending on where the card sits. With it, the grain only ever blends with the surface it belongs to.

### Performance

The filter is not free. `feTurbulence` is generated per pixel and re-rendered whenever the element repaints. On a card that is a few hundred pixels wide you will never notice. Stretched across a full-screen hero, especially one that scrolls or animates, it can drop a page to a handful of frames per second on a phone or a low-end laptop.

The fix is to render the noise once and tile it. With `stitchTiles="stitch"` and the filter region pinned to the tile, a small tile repeats seamlessly, and a tiled image costs the browser almost nothing after the first paint. The result looks the same for static grain. The only thing you give up is tuning `baseFrequency` live, since the frequency is baked into the tile.

You do not even need an image file. Put the filter inside an SVG data URI and let the browser rasterize it once per tile:

**Tailwind**

```html
<div class="relative isolate min-h-screen overflow-hidden bg-violet-600">
  <div
    class="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay bg-size-[200px_200px] bg-repeat"
    style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E&quot;)"
    aria-hidden="true"
  ></div>
  <!-- content -->
</div>
```

**CSS**

```css
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
  background-repeat: repeat;
  opacity: 0.08;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

A 200px tile is small enough to be cheap and large enough that the repeat is invisible under the blend. If you can see the seams, export the tile as a PNG at 2x instead and use that as the `background-image`.

As a rule: use the live filter on small surfaces and in demos where you want to tweak the grain. Use a tiled image anywhere the overlay is large or the page is expected to move.

### Resources

- [feTurbulence](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence): The SVG filter primitive that generates the noise. Everything here is built on it.
- [Grainy Gradients](https://css-tricks.com/grainy-gradients/): A thorough walkthrough of noise on gradients, with the color matrix tricks explained.
- [mix-blend-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode): How the grain layer combines with the color underneath it.


## Shadows, Not Borders

> Layered shadows give edge and depth.

- Section: Color
- URL: https://critly.vercel.app/shadows-not-borders
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/color/shadows-not-borders.mdx

A 1px border is the default way to give a card an edge. It works, but every
border is a line, and a screen full of lines starts to look like a
spreadsheet. A **layered shadow** draws the same edge with a faint ring, then
adds a hint of depth below it.

**Give surfaces their edge with a faint shadow, not a border.**

> **Interactive demo: Shadows Not Borders.** Open https://critly.vercel.app/shadows-not-borders to try it.

The shadow is just as sharp at the edge. The difference is that the card now
sits slightly above the page instead of being drawn on it, so you can stack a
card inside a panel inside a page without the lines piling up.

### Three layers

The recipe this site uses has three layers, and each does one job. Step
through them.

> **Interactive demo: Shadow Layers.** Open https://critly.vercel.app/shadows-not-borders to try it.

- The **ring** is a `0 0 0 1px` shadow at 6% black. It is the edge, and
  unlike a border it takes up no space.
- The **contact** layer sits 1px down with a 2px blur at 6%. It darkens the
  pixels right under the bottom edge, where the card touches the page.
- The **ambient** layer sits 2px down with a 4px blur at 4%. It suggests light
  from above without becoming a smudge.

In light mode no layer goes above 6%. If you can consciously see the shadow,
it is too strong.

### Elevation

Elevation is adding layers on top of the same base. Hover adds a mid blur,
and a popover adds a long, soft one on top of that.

> **Interactive demo: Shadow Elevation.** Open https://critly.vercel.app/shadows-not-borders to try it.

All three levels start from the same token. That is what makes them read as
the same material at different heights, instead of three different styles.

Layers have a price when they multiply. A stack on one card is nothing; the
same stack on hundreds of list items, on elements that animate, or on a
blurred glass surface adds paint time to every frame. On glass, keep to a
light rim and one drop shadow. See [Effect Cost](https://critly.vercel.app/effect-cost).

### Dark mode

A dark shadow on a dark background is invisible. Here is the light mode
shadow on a dark surface, next to the version this site uses in dark mode.

> **Interactive demo: Shadow Dark Mode.** Open https://critly.vercel.app/shadows-not-borders to try it.

In dark mode the edge comes from light. A 1px inset ring at 3% white draws
the outline from the inside, and a 1px inset highlight along the top suggests
light hitting the surface. The black shadows below, at 10% each, only
separate the card from what is behind it.

### Usage

These are the `--custom-shadow` values from this site's `globals.css`.

**Tailwind**

```html
<div class="rounded-xl bg-card shadow-(--custom-shadow)">
  <!-- content -->
</div>
```

**CSS**

```css
:root {
  --custom-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.06),
    0 1px 2px -1px rgba(0, 0, 0, 0.06),
    0 2px 4px 0 rgba(0, 0, 0, 0.04);
}

.dark {
  --custom-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.03),
    inset 0 0 0 1px rgba(255, 255, 255, 0.03),
    0 0 0 1px rgba(0, 0, 0, 0.1),
    0 2px 2px 0 rgba(0, 0, 0, 0.1),
    0 4px 4px 0 rgba(0, 0, 0, 0.1),
    0 8px 8px 0 rgba(0, 0, 0, 0.1);
}

.card {
  border-radius: 0.75rem;
  box-shadow: var(--custom-shadow);
}
```

Borders still have a place. Inputs, table rows and dividers want a plain
line, because they are not surfaces and should not look raised. Save the
shadow for things that hold other things.

### Resources

- [Designing Beautiful Shadows in CSS](https://www.joshwcomeau.com/css/designing-shadows/): Josh Comeau on layered shadows and why one big blur looks wrong.
- [Details that make interfaces feel better](https://jakub.kr/writing/details-that-make-interfaces-feel-better): Jakub Krehel's list of small fixes, including the three-layer shadow this site uses.
- [Smoother and sharper shadows with layered box-shadows](https://tobiasahlin.com/blog/layered-smooth-box-shadows/): Tobias Ahlin shows how stacking several soft shadows beats a single one.
- [box-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/box-shadow): The syntax on MDN, including the inset and spread values the recipe relies on.


## Image Outlines

> A faint inner edge that frames images.

- Section: Color
- URL: https://critly.vercel.app/image-outlines
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/color/image-outlines.mdx

Images do not know what is behind them. A pale sky on a white card has no
edge at all, and a photo with a bright corner blends into the page.

An **inset outline** fixes that with one line, drawn just inside the image at
around 10% opacity.

The outline's visibility can vary based on light or dark mode and the image content.

> **Interactive demo: Image Outline.** Open https://critly.vercel.app/image-outlines to try it.

The line is too faint to read as a border. What you notice instead is that
every image suddenly has a shape.

I basically learned this trick from
[Jakub](https://jakub.kr/writing/details-that-make-interfaces-feel-better).
It is one of those details you cannot unsee once someone points it out.

### Why not a border

A `border` sits between the padding and the margin, so it takes up space.
Adding one pushes content around and changes the size of the box.

**Paint the line over the image, not around it.** An `outline` with a
negative `outline-offset`, or an inset `box-shadow`, sits on top of the
outermost pixels.

### How strong

Ten percent is a good default, but I like to tune it differently for light and dark mode sometimes.

> **Interactive demo: Image Outline Strength.** Open https://critly.vercel.app/image-outlines to try it.

Below about 5% the line disappears against the pale sky. Above about 20%
it starts to look like a frame, and the eye reads it as a design element
instead of a fix. Stay in between.

### Avatars

Avatars are where this matters most. They are small, round, and often mostly
white: an initial on a light background, a pale logo, a photo of someone
against a wall. Without an edge they float on the surface.

> **Interactive demo: Image Outline Avatar.** Open https://critly.vercel.app/image-outlines to try it.

### Usage

Set the outline color per theme. Black at 10% on light, white at 10% on dark.

**Tailwind**

```html
<img
  class="rounded-lg outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
  src="/cover.jpg"
  alt="Album cover"
/>
```

**CSS**

```css
img {
  border-radius: 8px;
  outline: 1px solid rgb(0 0 0 / 0.1);
  outline-offset: -1px;
}

.dark img {
  outline-color: rgb(255 255 255 / 0.1);
}
```

### Resources

- [Details that make interfaces feel better](https://jakub.kr/writing/details-that-make-interfaces-feel-better): Jakub Krehel's list of small touches, including the inset image outline this page is about.
- [outline-offset](https://developer.mozilla.org/en-US/docs/Web/CSS/outline-offset): The property that pulls an outline inside the box instead of around it.
- [box-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow): The inset form is the other way to draw the same line, with full support for rounded corners.
- [color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color-mix): Handy for mixing the outline color into the current text color so it adapts to any theme.


## Color Roles

> Gray does the work, color has a job.

- Section: Color
- URL: https://critly.vercel.app/color-roles
- Published: 2026-10-03
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/color/color-roles.mdx

Give the brand color to everything that could take it, and it stops meaning
anything. The title is blue, the tabs are blue, the numbers, links and status
badges are blue, and the one button you want people to press is just another
blue thing.

**Let neutrals do almost all the work. Use the accent only for the main
action and the current selection, and use green, amber and red only when they
mean something.**

> **Interactive demo: Color Roles.** Open https://critly.vercel.app/color-roles to try it.

In the first card the accent is on 16 elements. "Ready", "Building" and
"Failed" wear the same blue pill, so the statuses carry no meaning at all. In
the second, the accent is on two: the selected tab and Deploy. Each status
gets a small dot, and the failed build is the first thing you notice after the
button.

This is [visual hierarchy](https://critly.vercel.app/visual-hierarchy) applied to color. Every colored
element competes for attention, so only color the ones that should win.

### Three roles

- **Neutrals** are backgrounds, surfaces, lines, text and icons. They are
  nearly everything on screen.
- **The accent** marks what you can do next and where you are: the primary
  button, the selected tab, a checked box. One hue.
- **Status colors** report state: success, warning, danger. They never
  decorate. If something is red, something went wrong.

### Tinted neutrals

Pure gray is chroma `0` in [OKLCH](https://critly.vercel.app/oklch). Next to a saturated accent it can
look flat and unrelated. Add a trace of the brand hue to every neutral and the
grays and the accent start to look like one palette.

> **Interactive demo: Color Tint.** Open https://critly.vercel.app/color-roles to try it.

Between `0.005` and `0.015` the grays still read as gray, just cooler, toward
the indigo accent. By `0.03` the whole card has turned blue.

Not everyone tints. Radix ships plain gray, which works with any accent, next
to grays pre-tinted toward each hue. Linear's redesign went the other way and
cut back the blue in its neutrals. I'd tint, and stay under `0.015`.
This site has no brand hue, so its own grays sit at `0`.

### Usage

**Tailwind**

```css
@import "tailwindcss";

@theme {
  --color-page: oklch(0.965 0.01 265);
  --color-surface: oklch(0.99 0.005 265);
  --color-line: oklch(0.92 0.01 265);
  --color-ink: oklch(0.21 0.01 265);
  --color-ink-soft: oklch(0.52 0.01 265);
  --color-accent: oklch(0.52 0.18 265);
  --color-success: oklch(0.62 0.15 150);
  --color-warning: oklch(0.75 0.15 75);
  --color-danger: oklch(0.58 0.2 27);
}

/* <button class="bg-accent text-white">Deploy</button> */
```

**CSS**

```css
:root {
  --hue: 265;
  --tint: 0.01;

  --page: oklch(0.965 var(--tint) var(--hue));
  --surface: oklch(0.99 calc(var(--tint) / 2) var(--hue));
  --line: oklch(0.92 var(--tint) var(--hue));
  --ink: oklch(0.21 var(--tint) var(--hue));
  --ink-soft: oklch(0.52 var(--tint) var(--hue));

  --accent: oklch(0.52 0.18 var(--hue));
  --success: oklch(0.62 0.15 150);
  --warning: oklch(0.75 0.15 75);
  --danger: oklch(0.58 0.2 27);
}
```

If your brand hue is red or green, it will collide with danger or success.
Keep the brand for the accent, and move the status color far enough along the
hue wheel, or add an icon, so nobody mistakes your logo color for an error.

### Resources

- [Composing a palette](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette): Radix on pairing an accent with plain gray or with a gray tinted toward its hue.
- [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui): Linear rebuilt its themes from a base color, an accent and a contrast value, with less blue in the neutrals.
- [Material 3 color roles](https://m3.material.io/styles/color/roles): A full system of named roles, from surfaces and outlines to primary and error.
- [Using color to enhance your design](https://www.nngroup.com/articles/color-enhance-design/): Nielsen Norman Group on small palettes, the 60-30-10 rule, and keeping one color for calls to action.


## Dark Mode

> A second design, not an inverted one.

- Section: Color
- URL: https://critly.vercel.app/dark-mode
- Published: 2026-10-03
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/color/dark-mode.mdx

The quickest dark mode is an inversion: white backgrounds turn black, black
text turns white, and everything else stays. It looks wrong in ways that are
hard to name. Cards vanish into the page, the menu has no edge, and the brand
blue buzzes against the black.

**Design dark mode as its own theme: lift surfaces with lightness, soften the
extremes, and recheck every color.**

> **Interactive demo: Dark Mode.** Open https://critly.vercel.app/dark-mode to try it.

Inverted, the page, the card and the menu are all `#000`, and the light mode
shadows have nothing left to darken. Text is pure white at 21:1, so bright it
glows, while the light mode link drops to 3.2:1. The designed version uses
this site's values: a `0.17` page, a `0.205` card, text at `0.945`, plus a
`0.24` menu and an accent raised to `0.72` lightness with about half the chroma.
Text lands at 15.3:1 and the link at 7.1:1.

Apple puts it simply: dark colors "aren't necessarily inversions of their
light counterparts."

### Lighter means closer

In light mode, shadows show what sits on top. On a dark page there is little
left to darken, so elevation comes from the surface instead: the higher a
layer, the lighter it gets. Material's dark theme and Apple's base and
elevated backgrounds both work this way.

> **Interactive demo: Dark Elevation.** Open https://critly.vercel.app/dark-mode to try it.

At `+0.000` only shadows separate the layers, and they barely do. At
`+0.035` per level, the step this site takes from page to card, every layer
reads at a glance. Push past `+0.05` and the menu starts to look gray rather
than dark. Keep the shadows anyway: here they carry a faint inset highlight
along the top edge, as in [shadows, not borders](https://critly.vercel.app/shadows-not-borders).

### Recheck the rest

- **Accents:** saturated colors vibrate on dark backgrounds. Raise the
  lightness, lower the chroma, and measure contrast again, because a color
  that passed on white can fail on dark gray.
- **Text weight:** light text on dark renders heavier on macOS. See
  [font smoothing](https://critly.vercel.app/font-smoothing).
- **The canvas:** paint the root background too, or overscroll shows a white
  strip. See [HTML background](https://critly.vercel.app/html-background).
- **Browser UI:** `color-scheme: dark` makes scrollbars, form controls and the
  default canvas dark as well.

### Usage

**Tailwind**

```css
@import "tailwindcss";

@theme {
  --color-page: oklch(0.985 0 0);
  --color-card: oklch(1 0 0);
  --color-popover: oklch(1 0 0);
  --color-ink: oklch(0.205 0 0);
  --color-accent: oklch(0.52 0.18 265);
}

:root {
  color-scheme: light;

  @variant dark {
    color-scheme: dark;
    --color-page: oklch(0.17 0 0);     /* not #000 */
    --color-card: oklch(0.205 0 0);    /* one step up */
    --color-popover: oklch(0.24 0 0);  /* two steps up */
    --color-ink: oklch(0.945 0 0);     /* not #fff */
    --color-accent: oklch(0.72 0.12 265);
  }
}

/* <body class="bg-page text-ink antialiased"> */
```

**CSS**

```css
:root {
  color-scheme: light dark;
  --page: oklch(0.985 0 0);
  --card: oklch(1 0 0);
  --popover: oklch(1 0 0);
  --ink: oklch(0.205 0 0);
  --accent: oklch(0.52 0.18 265);
}

@media (prefers-color-scheme: dark) {
  :root {
    --page: oklch(0.17 0 0);
    --card: oklch(0.205 0 0);
    --popover: oklch(0.24 0 0);
    --ink: oklch(0.945 0 0);
    --accent: oklch(0.72 0.12 265);
  }
}

html {
  background: var(--page);
  color: var(--ink);
}
```

With a manual theme toggle, set `color-scheme` from the same switch that swaps
your colors, or a dark page ships with light scrollbars. next-themes, which
this site uses, writes it on the root element for you.

### Resources

- [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode): Apple's guidance, including base and elevated backgrounds and why dark colors are not inversions.
- [Material dark theme](https://m2.material.io/design/color/dark-theme.html): Google's dark theme guide, with a dark gray base, lighter surfaces as elevation rises, and desaturated colors.
- [Improved dark mode default styling with color-scheme](https://web.dev/articles/color-scheme): Thomas Steiner on what the color-scheme property and meta tag change in the browser's own UI.
- [color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme): Syntax, values and browser support on MDN.


## Liquid Glass

> A lens for controls, never for content.

- Section: Color
- URL: https://critly.vercel.app/liquid-glass
- Published: 2026-10-08
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/color/liquid-glass.mdx

Frosted glass scatters light: everything behind it turns to fog. Apple's
Liquid Glass, introduced in 2025, bends light instead. It acts like a lens:
the middle stays clear, and content curves as it passes under the edges, so
the shape reads without hiding what's behind it.

Drag the glass across the text and switch between the two.

> **Interactive demo: Liquid Glass.** Open https://critly.vercel.app/liquid-glass to try it.

With blur, the panel is a smudge. With refraction, the lines bend at the
rim and stay straight in the middle, and the edges catch a highlight. Same
size, same position, much lighter.

**Use glass only for controls that float above content, and make them
readable over the worst background they can cross.**

### Readable first

Apple spent a year walking Liquid Glass back. Testers called it hard to
read, iOS 26.1 added a Tinted setting that makes it more opaque, and the
2026 update added more diffusion, a darkened edge and a slider from clear to
tinted. Switch the toolbar between Clear and Tinted.

> **Interactive demo: Glass Legibility.** Open https://critly.vercel.app/liquid-glass to try it.

Clear glass reads over some backgrounds and disappears over others, and a
real page has all of them. Tinted glass gives up some transparency and
reads everywhere. Check text against the busiest content that can scroll
under it, not the background in your mockup. Apple's own rule for clear
glass over bright media is a 35% dark dimming layer.

Give the edge two lines: a light inner highlight and a dark outer hairline.
That's what keeps the shape visible over both white and black.

### One layer

Glass is for the layer that floats above content: tab bars, toolbars,
floating buttons, media controls. Lists, cards and articles stay solid.
Never stack glass on glass; things that sit on glass get plain fills.

On the web this is also a rendering rule. A `backdrop-filter` only sees
what's painted up to the nearest ancestor with `opacity`, `filter`, `mask`
or `will-change: opacity`. Nest glass inside glass and the inner one only
sees its parent. Fade a wrapper with `opacity` and the blur vanishes until
the fade ends.

### Build it in rungs

- **Solid** in every browser, and when people ask for less transparency.
- **Frosted** with `backdrop-filter: blur() saturate()`, which works in
  every current browser.
- **Refraction** with an SVG displacement map used as a `backdrop-filter`.
  Only Chromium renders it. Safari and Firefox accept the CSS and silently
  draw nothing, so `@supports` can't detect it: check for Chromium in
  JavaScript. When you control what's behind the glass, you can instead
  refract a copy of it with a plain `filter`, which works everywhere. The
  demo above does that.

`prefers-reduced-transparency` only works in Chromium, so offer a "solid
surfaces" setting of your own, the web version of Apple's Tinted option.

Glass is expensive. The browser re-renders the backdrop every time anything
under it changes, including every scroll frame. Keep glass small and use
three or four glass elements per screen at most. Count elements in the page,
not designs: glass in a shared button component, repeated on every card in a
list, can quietly put a thousand blurs on one screen, and hidden ones still
count. Turn page glass off while a modal covers it, and drop the blur from
anything over about 90% opaque, where nobody can see it. See
[Effect Cost](https://critly.vercel.app/effect-cost).

Glass also needs something behind it. Over a flat background it reads as a
plain grey card, so let imagery or content run underneath, or don't use it.
If an approved mockup used refraction and the build will ship the frosted
fallback, say so before building. Never animate the blur radius;
animate the glass element's transform and opacity instead, and build
displacement maps once per size.

### Usage

**CSS**

```css
.glass {
  border-radius: 9999px;
  background: rgb(246 246 248 / 0.96); /* solid rung */
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.5), /* light inner rim */
    0 0 0 0.5px rgb(0 0 0 / 0.14),        /* dark outer edge */
    0 8px 24px rgb(0 0 0 / 0.14);
}

@supports (backdrop-filter: blur(1px)) {
  .glass {
    background: rgb(255 255 255 / 0.6); /* tinted, not clear */
    backdrop-filter: blur(12px) saturate(170%);
  }
}

@media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
  .glass {
    background: rgb(246 246 248 / 0.96);
    backdrop-filter: none;
  }
}

:root[data-surfaces="solid"] .glass {
  background: rgb(246 246 248 / 0.96);
  backdrop-filter: none;
}
```

**Refraction**

```html
<!-- Chromium only. The map is drawn once per size: red shifts x,
     green shifts y, 128 means no shift. -->
<svg width="0" height="0" aria-hidden="true">
  <filter id="lens" x="0" y="0" width="184" height="72"
          filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feImage href="displacement-map.png" width="184" height="72"
             preserveAspectRatio="none" result="map" />
    <feDisplacementMap in="SourceGraphic" in2="map" scale="40"
                       xChannelSelector="R" yChannelSelector="G" />
  </filter>
</svg>

<style>
  .glass.refract {
    backdrop-filter: url(#lens) blur(0.5px) saturate(150%);
  }
</style>
```

The displacement map comes from the glass's shape. For each pixel near the
edge, take the slope of a rounded surface, bend a ray through it with
Snell's law (glass is about 1.5), and store how far it moved. The middle is
flat, so it doesn't move at all. kube.io's deep dive walks through the math.

### Resources

- [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/): Apple's WWDC25 introduction to lensing, highlights, the regular and clear variants, and avoiding glass on glass.
- [Materials in the Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/materials): Apple's rules for where Liquid Glass belongs, including the 35% dimming layer over bright media.
- [Liquid Glass in the browser](https://kube.io/blog/liquid-glass-css-svg/): A deep dive into refraction with SVG displacement maps, built from Snell's law.
- [Liquid Glass is cracked](https://www.nngroup.com/articles/liquid-glass/): Nielsen Norman Group's critique of Liquid Glass legibility in iOS 26.
- [Next-level frosted glass](https://www.joshwcomeau.com/css/backdrop-filter/): Josh Comeau on making backdrop-filter look right at the edges.
