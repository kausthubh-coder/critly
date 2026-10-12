# Typography

## Letter Spacing

> Tighten big text, loosen small text.

- Section: Typography
- URL: https://critly.vercel.app/letter-spacing
- Published: 2026-07-14
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/typography/letter-spacing.mdx

Most typefaces are spaced for text sizes. Scale one up to a headline and the
gaps between letters grow with it, until the word reads as a row of letters.
Set it small in capitals and the letters crowd together.

**Tighten letter spacing as text gets bigger, and loosen it for small
uppercase.**

> **Interactive demo: Letter Spacing.** Open https://critly.vercel.app/letter-spacing to try it.

The second word follows the formula Rasmus Andersson published for Inter 3.
Around body size it barely moves. From 24px up it settles near `-0.02em`,
which pulls "Headline" in by about 8px at 48px. The dashed line marks where
the tracked word ends. The untouched one runs past it.

### Fonts with optical sizes

Some fonts already do this for you. Inter 4, the version this site uses, has
an [optical size](https://critly.vercel.app/optical-alignment) axis, and browsers apply it on their own
through `font-optical-sizing: auto`. From 32px up you get the display design,
which sets "Headline" about 13px narrower at 48px than the text design does.
The demo pins the text design so you can see the problem.

So check your font before you add tracking. If it has optical sizes, a
headline may need little or none, and `-0.02em` on top of the display design
starts to look cramped.

### Uppercase

Capitals are spaced to sit next to lowercase letters. Set a whole label in
caps and they look jammed together, and the smaller the label, the worse it
gets.

> **Interactive demo: Uppercase Tracking.** Open https://critly.vercel.app/letter-spacing to try it.

Small uppercase labels like section headers and status pills want extra room,
somewhere between `0.05em` and `0.1em`.

### Usage

**Tailwind**

```html
<h1 class="text-5xl font-semibold tracking-[-0.02em]">Launch week</h1>

<span class="text-xs font-semibold uppercase tracking-wider">Pinned</span>
```

**CSS**

```css
h1 {
  font-size: 3rem;
  letter-spacing: -0.02em;
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

Always write tracking in `em`. It scales with the font size, so one value
keeps working when the text grows or shrinks, while a pixel value is only
right at the size you tested.

### Resources

- [Inter dynamic metrics](https://d.rsms.me/inter-website/v3/dynmetrics/): Rasmus Andersson's tracking formula for Inter 3, the one the first demo follows.
- [letter-spacing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/letter-spacing): The property reference, with syntax and examples on MDN.
- [font-optical-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-optical-sizing): How browsers pick an optical size for fonts that ship one.
- [Letter spacing in Tailwind](https://tailwindcss.com/docs/letter-spacing): The tracking utilities and how to set your own values.


## Text Wrapping

> Balanced headings, no lonely last words.

- Section: Typography
- URL: https://critly.vercel.app/text-wrapping
- Published: 2026-07-14
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/typography/text-wrapping.mdx

Browsers wrap text greedily. Each line takes as many words as fit, then
breaks. That is fast, but it often leaves one word alone on the last line of a
heading.

**Balance short text and make long text pretty.**

> **Interactive demo: Text Balance.** Open https://critly.vercel.app/text-wrapping to try it.

`text-wrap: balance` looks at the whole block and picks breaks that make every
line about the same length. Use it on headings, card titles, toasts and empty
states. Chrome only balances blocks of six lines or fewer and Firefox ten, so
it is not meant for long text anyway.

### Paragraphs

Balancing a paragraph would leave a ragged block with short lines everywhere.
`text-wrap: pretty` keeps the normal wrapping and only steps in to avoid a
very short last line.

> **Interactive demo: Text Pretty.** Open https://critly.vercel.app/text-wrapping to try it.

The two browsers that support it go about it differently. Chrome adjusts the
last four lines of a paragraph. Safari, since version 26, evaluates the whole
paragraph and also evens out the rag. Firefox does not support `pretty` yet,
so both paragraphs above look the same there.

Every paragraph on this site uses it.

### Usage

**Tailwind**

```html
<h2 class="text-balance">Your export is ready to download</h2>

<p class="text-pretty">
  Exports now run in the background, so you can keep working.
</p>
```

**CSS**

```css
h1, h2, h3 {
  text-wrap: balance;
}

p, li {
  text-wrap: pretty;
}
```

Both values are progressive enhancement. A browser that does not understand
them falls back to normal wrapping, so you can set them once in your base
styles and stop thinking about them.

### Resources

- [CSS text-wrap balance](https://developer.chrome.com/docs/css-ui/css-text-wrap-balance): Chrome's write-up of how balancing works and where it stops.
- [Better typography with text-wrap pretty](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/): WebKit on how Safari's pretty looks at the whole paragraph, and how that differs from Chrome.
- [text-wrap-style](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-wrap-style): The values, their line limits, and browser support on MDN.
- [Details that make interfaces feel better](https://jakub.kr/writing/details-that-make-interfaces-feel-better): Jakub Krehel's list of small fixes, which opens with these two values.


## Tabular Numbers

> Steady digits for values that change.

- Section: Typography
- URL: https://critly.vercel.app/tabular-numbers
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/typography/tabular-numbers.mdx

Digits can have two kinds of widths.

**Proportional figures** use the natural width of each shape: `1` is narrow,
while `8` is wide. **Tabular figures** give every digit the same width.

> **Interactive demo: Tabular Nums.** Open https://critly.vercel.app/tabular-numbers to try it.

Use proportional figures when numbers sit inside a sentence. They read more
naturally. Use tabular figures when changing values need to stay steady or
align vertically.

### Changing values

A timer made with proportional figures changes width as it runs. Everything
beside it moves too. Watch the blue edge:

> **Interactive demo: Tabular Timer.** Open https://critly.vercel.app/tabular-numbers to try it.

Tabular figures turn every character into a stable slot. Use them for clocks, counters, scores, prices, and live
metrics.

The usual instinct here is to switch to a monospace font, but you don't need to. A mono font changes the whole voice of
the interface. Often, you just need to use tabular figures.

### Tables

In a numeric column, equal-width digits create a vertical grid. Repeated
places line up, so differences are easier to scan. It feels much better to see data this way.

> **Interactive demo: Tabular Table.** Open https://critly.vercel.app/tabular-numbers to try it.

Right-align numeric columns as well. Right alignment keeps numbers with different lengths anchored to the same
edge.

### Usage

**Tailwind**

```html
<span class="tabular-nums">12:45</span>
```

**CSS**

```css
.numeric-column {
  font-variant-numeric: tabular-nums;
}
```

The font must include tabular figures for this to work. If `tabular-nums`
makes no visible difference, drop the font file into
[Wakamai Fondue](https://wakamaifondue.com) and check whether it lists `tnum`
among its features.

### Resources

- [Details that make interfaces feel better](https://jakub.kr/writing/details-that-make-interfaces-feel-better): A practical collection of small interface improvements.
- [font-variant-numeric](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric): Syntax, examples, and browser support on MDN.
- [CSS Fonts Module Level 4 — Numerical formatting](https://www.w3.org/TR/css-fonts-4/#font-variant-numeric-prop): The specification behind proportional and tabular figures.
- [OpenType tabular figures](https://learn.microsoft.com/en-us/typography/opentype/otspec190/features_pt#tag-tnum): How the tnum font feature maps digits to uniform widths.
- [Wakamai Fondue](https://wakamaifondue.com): Drop in a font file to see every OpenType feature it supports.


## Optical Alignment

> Center for the eye, not the math.

- Section: Typography
- URL: https://critly.vercel.app/optical-alignment
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/typography/optical-alignment.mdx

Aligning icons exactly by their edges doesn't always look right. A tiny shift is often needed because different shapes feel heavier or lighter to the eye.

**Optical alignment** means nudging things until they look right, then keeping
the nudge.

> **Interactive demo: Optical Alignment.** Open https://critly.vercel.app/optical-alignment to try it.

The play icon moves left, because a triangle pointing right has most of its area on the
left. The star and the download icon move up a bit. The amounts are tiny and
specific to each icon, so this is a per icon decision, not a global rule.

#### How to align the icon

A good test is to blur the icon. Add a heavy `filter: blur()` to it in
the inspector, or squint at it, and the shape collapses into a soft blob of
ink.

The blob sits where the icon's visual weight is, not where its bounding
box is, so if it lands off the center of the button the nudge you need is
the distance back. Sharp edges hide this, because your eye reads the outline
and trusts it. Blur removes the outline and leaves only the weight.

### Buttons with icons

The same thing happens with padding. An icon has air inside its box, and
that air adds to the padding next to it. Equal padding on both sides ends up
looking heavier on the icon side.

> **Interactive demo: Optical Button.** Open https://critly.vercel.app/optical-alignment to try it.

Shave a few pixels off the padding on the side that holds the icon.

### Shape weight

Different shapes have varying visual weight. For example, when a circle or triangle is drawn inside the same box as a square, it appears smaller to the eye.

> **Interactive demo: Optical Weight.** Open https://critly.vercel.app/optical-alignment to try it.

### Optical sizes

Type has the same problem across sizes. Strokes that are sturdy at 14px look
clumsy at 40px. Some typefaces ship an **optical size** axis that redraws the
letters for the size they are set at.

> **Interactive demo: Optical Sizing.** Open https://critly.vercel.app/optical-alignment to try it.

Browsers turn this on automatically through `font-optical-sizing: auto`, so
you usually get the right design for free. The demo forces the text design
onto a display size so you can see what you would be missing.

### Hanging punctuation

A quote that starts with a quotation mark looks indented, because the mark is
mostly whitespace. Hanging it into the margin lines the first letter up with
the text below.

> **Interactive demo: Hanging Punctuation.** Open https://critly.vercel.app/optical-alignment to try it.

Safari supports `hanging-punctuation: first`. Elsewhere a small negative
`text-indent` gets the same result for a known opening character.

### Usage

**Tailwind**

```html
<button class="grid size-12 place-items-center rounded-full">
    <PlayIcon class="size-5 translate-x-px" weight="fill" />
</button>

<blockquote class="indent-[-0.42em]">
    “Good design is as little design as possible.”
</blockquote>
```

**CSS**

```css
.play-icon {
  transform: translateX(1px);
}

blockquote {
  hanging-punctuation: first;
}

@supports not (hanging-punctuation: first) {
  blockquote {
    text-indent: -0.42em;
  }
}
```

### Resources

- [Apple Human Interface Guidelines on icons](https://developer.apple.com/design/human-interface-guidelines/icons): Apple's rules for optical balance inside an icon's bounding shape.
- [Details that make interfaces feel better](https://jakub.kr/writing/details-that-make-interfaces-feel-better): A short list of fixes, several of which are optical adjustments like these.
- [hanging-punctuation](https://www.w3.org/TR/css-inline-3/#hanging-punctuation-property): The CSS spec for letting quotes hang outside the text box.
- [Inter features](https://rsms.me/inter/#features): What the optical size axis of Inter actually changes.


## Icons

> One set, one weight, sized to the text.

- Section: Typography
- URL: https://critly.vercel.app/icons
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/typography/icons.mdx

Icons are part of the type. A set has a voice, like a typeface does: the
stroke width, the corner radius, the grid it was drawn on. Next to text, that
voice either agrees with the letters or fights them.

**Pick one set, use one weight, and size icons a little larger than the text
beside them.**

> **Interactive demo: Icon Weights.** Open https://critly.vercel.app/icons to try it.

The labels are medium weight. Thin icons look like they came from a lighter
product, and bold ones shout over the words. Regular sits well with regular
and medium text, which is why it is usually the default. This site uses
regular in the header and duotone, with its faint filled layer, for the
section icons.

### One set

Mixing icon libraries reads like switching typefaces mid-sentence. The grids,
strokes and corners stop matching, and you notice even when you can't say why.

> **Interactive demo: Icon Mix.** Open https://critly.vercel.app/icons to try it.

The wrong toolbar mixes two libraries, four stroke weights and three sizes.
The right one uses one library at one weight and one size.

Before you commit to a set, list the icons your product needs and check that
it covers them. Running out halfway and borrowing from a second library is how
the wrong toolbar happens.

### Size

Icons are drawn with padding inside their box. Lucide, for example, keeps at
least 1px clear on a 24px canvas. So an icon set to the same size as the text
looks smaller than the capitals next to it.

> **Interactive demo: Icon Text Size.** Open https://critly.vercel.app/icons to try it.

Somewhere between `1.1em` and `1.25em` usually balances. Writing the size in
`em` keeps that ratio when the text size changes. Flexbox centers the icon's
box, not its shape, so check the vertical position too. A 1px nudge is
common.

### Usage

**React**

```tsx
import { TrayIcon } from "@phosphor-icons/react";

<a className="flex items-center gap-2 text-sm font-medium">
  <TrayIcon className="mb-px size-[1.15em]" />
  Inbox
</a>
```

**CSS**

```css
.nav-item svg {
  width: 1.15em;
  height: 1.15em;
  margin-bottom: 1px;
}
```

A quick check for any screen: line up every icon on it in one row. If one of
them looks like it was drawn by someone else, it probably was.

### Resources

- [Phosphor Icons](https://phosphoricons.com): The set used on this site, with six weights per icon drawn on the same grid.
- [Lucide design principles](https://lucide.dev/contribute/icons/design-principles): The rules every icon in Lucide follows, from the 24px canvas to the 2px stroke.
- [Tabler Icons](https://tabler.io/icons): Another consistent set, drawn on a 24px grid with an adjustable stroke.
- [SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols): How Apple matches symbol weight and scale to the text beside them.


## Font Smoothing

> Light text on dark renders heavier.

- Section: Typography
- URL: https://critly.vercel.app/font-smoothing
- Published: 2026-07-16
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/typography/font-smoothing.mdx

On a Mac, browsers draw text a little bolder than the font says. macOS
thickens every glyph slightly, and on a dark background that extra weight
blooms. White text ends up looking heavier than the same text in dark ink.

**On macOS, turn the thickening off so text renders at the weight you
chose.**

> **Interactive demo: Font Smoothing.** Open https://critly.vercel.app/font-smoothing to try it.

The difference is easy to see on the dark card and hard to see on the light
one. That is why this usually comes up when a product ships a dark mode, and
every heading suddenly feels half a weight heavier than in the design file.

### What it does

Macs used to render text with subpixel antialiasing, using the red, green and
blue parts of each pixel to sharpen edges. To make up for how thin that
looked, macOS also thickened each glyph. macOS Mojave (10.14) turned subpixel
antialiasing off in 2018 but kept the thickening, and browsers still apply it
by default.

`-webkit-font-smoothing: antialiased` switches to plain grayscale
antialiasing, without the thickening. Firefox's version is
`-moz-osx-font-smoothing: grayscale`. Windows, Linux, iOS and Android ignore
both, so if you are not on a Mac, the demos fake the default with a hairline
stroke.

### Thin weights

The thickening also props up light weights. Without it, 300 and below can
turn wispy on dark surfaces.

> **Interactive demo: Font Smoothing Weights.** Open https://critly.vercel.app/font-smoothing to try it.

Most interfaces use 400 and up, where antialiased is a clear improvement. If
you set small text in a light weight, check it on a Mac before turning this
on everywhere.

### Usage

**Tailwind**

```html
<body class="antialiased">
```

**CSS**

```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

Both properties are non-standard, and they only do anything on macOS. That is
fine, because the extra weight is a macOS problem. Set them once on the
`body`, like this site does, and every element inherits them.

### Resources

- [font-smooth](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-smooth): MDN on the non-standard smoothing properties, their values, and the macOS-only support.
- [What's the deal with WebKit font smoothing?](https://dbushell.com/2024/11/05/webkit-font-smoothing/): David Bushell tests the property across operating systems and finds it only matters on macOS.
- [Details that make interfaces feel better](https://jakub.kr/writing/details-that-make-interfaces-feel-better): Jakub Krehel's list of small fixes, including antialiased text.
- [A modern CSS reset](https://www.joshwcomeau.com/css/custom-css-reset/): Josh Comeau's reset, which sets antialiased on the body and explains why.
- [Font smoothing in Tailwind](https://tailwindcss.com/docs/font-smoothing): The antialiased utility, which sets both properties at once.


## Visual Hierarchy

> Quiet the rest so one thing leads.

- Section: Typography
- URL: https://critly.vercel.app/visual-hierarchy
- Published: 2026-10-02
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/typography/visual-hierarchy.mdx

Every screen has one thing it wants you to see first. When every line is bold
and dark, nothing gets to be that thing, and you have to read each word to find
it.

The instinct is to make the important part louder. That starts an arms race:
a bigger name, a bolder price, and now the row is loud in two places instead of
one.

**Quiet the rest instead of making the important thing louder.**

> **Interactive demo: Visual Hierarchy.** Open https://critly.vercel.app/visual-hierarchy to try it.

Step through the three versions, then press Squint. The quiet one never
changes a size. Names and prices stay at 14px and 500; the details drop to 400
and lighter tones. Blurred, the bold list is a grey stripe per row, while the
quiet one still leads with what matters. It is the same blur test as in
[optical alignment](https://critly.vercel.app/optical-alignment), aimed at emphasis.

### Tone and weight before size

Size is the bluntest tool. It costs space, breaks alignment, and needs its own
[letter spacing](https://critly.vercel.app/letter-spacing). Color and weight do most of the work for
less. Three text tones are enough: one for the thing, one for its details, one
for metadata. Two weights, 400 and 500, cover almost everything else.

Keep even the quietest tone at 4.5:1 or more. Here it is `neutral-500` on
white, which lands at 4.7:1.

### Labels are a last resort

A label is more text to read before you reach the value. Formatted well, most
values explain themselves. "12 left" says what "Stock: 12" says, in one glance.

> **Interactive demo: Hierarchy Labels.** Open https://critly.vercel.app/visual-hierarchy to try it.

### Actions have ranks

Buttons follow the same rule. One solid primary action, a quiet secondary one,
and a destructive action that is not the main job can be plain text that turns
red on hover. Save the big red button for the confirmation step.

> **Interactive demo: Hierarchy Actions.** Open https://critly.vercel.app/visual-hierarchy to try it.

### Usage

**Tailwind**

```html
<li class="flex items-center justify-between text-sm">
  <div>
    <p class="font-medium text-neutral-900">Linen Shirt</p>
    <p class="text-neutral-600">Sand, size M</p>
  </div>
  <div class="text-right tabular-nums">
    <p class="font-medium text-neutral-900">$68</p>
    <p class="text-neutral-500">12 left</p>
  </div>
</li>
```

**CSS**

```css
:root {
  --text-primary: #171717;   /* the thing */
  --text-secondary: #525252; /* its details */
  --text-tertiary: #737373;  /* metadata, 4.7:1 on white */
}

.title {
  font-weight: 500;
  color: var(--text-primary);
}

.meta {
  font-weight: 400;
  color: var(--text-tertiary);
}
```

These greys are tuned for a white surface. On a colored background, grey text
looks washed out and can fall under 4.5:1. Pick lighter or darker shades of the
background's own hue instead.

### Resources

- [Refactoring UI](https://www.refactoringui.com/): Adam Wathan and Steve Schoger's book, with chapters on de-emphasizing to emphasize and why labels are a last resort.
- [Visual hierarchy in UX](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/): Nielsen Norman Group on color, scale and grouping, including the blur test.
- [5 principles of visual design in UX](https://www.nngroup.com/articles/principles-visual-design/): Where hierarchy sits next to scale, balance, contrast and Gestalt.
- [Understanding contrast (minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): The 4.5:1 floor that even your quietest text tone has to clear.


## Line Length

> Lines short enough to find the next one.

- Section: Typography
- URL: https://critly.vercel.app/line-length
- Published: 2026-10-02
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/typography/line-length.mdx

Long lines are tiring in a way people rarely put into words. Your eyes jump
along a line a few words at a time, then sweep back to the left to find the
next one. The longer the line, the longer that sweep, and the easier it is to
land on the wrong line.

**Keep body text between 45 and 75 characters per line.**

> **Interactive demo: Line Length.** Open https://critly.vercel.app/line-length to try it.

Sources disagree at the edges. Butterick allows up to 90 characters, Baymard
recommends 50 to 75, and WCAG caps lines at 80. 45 to 75 is where they all
overlap, so that is the band I use.

### Finding the next line

The cost of a long line shows up at the return. The dashed line traces one,
from the end of a line to the start of the next.

> **Interactive demo: Line Return.** Open https://critly.vercel.app/line-length to try it.

At 120 characters the return is a long, almost flat diagonal, and a small slip
drops you a line too low. At 65 it is short and steep. Both are set small here
so that 120 characters fit in this column.

### Line height

Line length and line height move together. More space between lines gives the
return a bigger target, so longer lines need more of it. For body text, start
at 1.5.

> **Interactive demo: Line Height.** Open https://critly.vercel.app/line-length to try it.

Butterick suggests 1.2 to 1.45, WCAG asks for at least 1.5. On screens I side
with 1.5. This page is a good reference: its column is 576px, about 85
characters of 14px Inter, so it runs past the band and makes up for it with a
1.8 line height.

### Usage

`1ch` is the width of the `0` glyph, which makes it the natural unit for a
measure. Tailwind's `max-w-prose` is `65ch`. But a zero is wider than the
average letter in most interface fonts. In Inter, `65ch` holds about 85
characters and `55ch` about 70.

**Tailwind**

```html
<p class="max-w-[55ch] leading-normal text-pretty">
    Exports now run in the background, so you can keep working.
</p>
```

**CSS**

```css
p {
  max-inline-size: 55ch;
  line-height: 1.5;
}
```

Pick the `ch` value for your font, then count a few lines. Anything that
changes letter widths changes the result, including
[letter spacing](https://critly.vercel.app/letter-spacing). A narrower column also strands more single
words at the end of paragraphs, which [text-wrap: pretty](https://critly.vercel.app/text-wrapping)
cleans up.

### Resources

- [Line length](https://practicaltypography.com/line-length.html): Matthew Butterick's case for 45 to 90 characters, and the easy ways to get there.
- [Readability - the optimal line length](https://baymard.com/blog/line-length-readability): Baymard Institute's research summary, which lands on 50 to 75 characters.
- [Understanding visual presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html): The WCAG criterion that caps lines at 80 characters and asks for 1.5 line spacing.
- [Axioms](https://every-layout.dev/rudiments/axioms/): Every Layout on setting a measure in ch once and letting the whole site inherit it.
- [CSS length units](https://developer.mozilla.org/en-US/docs/Web/CSS/length): How ch is defined, as the advance width of the 0 glyph.


## Type Scale

> A few sizes, each with a job.

- Section: Typography
- URL: https://critly.vercel.app/type-scale
- Published: 2026-10-03
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/typography/type-scale.mdx

Font sizes drift the same way spacing does. A heading gets 22px because 20
looked small, a value gets 17px so it stands out from the 16px next to it, and
soon one card holds nine sizes. Some of them are a pixel apart, and two sizes
a pixel apart don't read as a choice. They read as a mistake.

**Pick about five sizes from a scale, give each one a job, and use nothing
else.**

> **Interactive demo: Type Scale.** Open https://critly.vercel.app/type-scale to try it.

The card set by eye uses 9 sizes, from 13 to 26, including both 15 and 15.5.
The scale version uses 5: 12, 14, 16, 20 and 24. Hover a size to see where it
is used. Nothing in the second card got plainer, but every difference that is
left is one you can actually see.

### One ratio

A scale is a base size multiplied by the same ratio, step after step. Start at
14px, multiply by 1.2, round to an even pixel, and you get 12, 14, 16, 20 and
24. Those happen to be Tailwind's `text-xs`, `sm`, `base`, `xl` and `2xl`.

> **Interactive demo: Type Scale Ratio.** Open https://critly.vercel.app/type-scale to try it.

For app interfaces I'd stay between 1.2 and 1.25. Dense screens need small
steps, but each step still has to be visible. At 1.1 and below, neighbouring
steps round to the same size and the scale stops being one. Marketing pages,
with a few big words per screen, can go to 1.333 or 1.5.

Name the steps by their job: caption, body, subhead, title, display. The name
tells the next person which one to reach for. A button or form label doesn't
need a sixth size; it is body size at a heavier weight, as in
[visual hierarchy](https://critly.vercel.app/visual-hierarchy).

### Sizes come in sets

A size isn't finished until it has a line height and letter spacing. Here line
heights sit on a 4px grid and get relatively tighter as text grows: 20px on
14px body, 32px on a 24px display. Tracking follows
[letter spacing](https://critly.vercel.app/letter-spacing): none at body size, `-0.01em` from 18px,
`-0.02em` from 24px. Store the three together, so nobody sets a heading with a
body line height.

### Usage

**Tailwind**

```css
@import "tailwindcss";

@theme {
  --text-*: initial;
  --text-caption: 0.75rem;
  --text-caption--line-height: 1rem;
  --text-body: 0.875rem;
  --text-body--line-height: 1.25rem;
  --text-subhead: 1rem;
  --text-subhead--line-height: 1.5rem;
  --text-title: 1.25rem;
  --text-title--line-height: 1.75rem;
  --text-title--letter-spacing: -0.01em;
  --text-display: 1.5rem;
  --text-display--line-height: 2rem;
  --text-display--letter-spacing: -0.02em;
}

/* <h2 class="text-title font-semibold">Billing</h2> */
```

**CSS**

```css
:root {
  --text-caption: 0.75rem/1rem;   /* 12/16 */
  --text-body: 0.875rem/1.25rem;  /* 14/20 */
  --text-subhead: 1rem/1.5rem;    /* 16/24 */
  --text-title: 1.25rem/1.75rem;  /* 20/28 */
  --text-display: 1.5rem/2rem;    /* 24/32 */
}

.title {
  font: 600 var(--text-title) Inter, sans-serif;
  letter-spacing: -0.01em;
}
```

Keep sizes and line heights in `rem`. Someone who raises their browser's
default font size then gets the whole scale bigger, still in proportion. The
`--text-*: initial` line removes Tailwind's default sizes, so `text-sm` stops
existing and only the five roles are left to choose from.

### Resources

- [Type Scale](https://typescale.com/): Pick a base size and a ratio and preview the whole scale in your own font.
- [Modular scale](https://every-layout.dev/rudiments/modular-scale/): Every Layout on deriving sizes from one ratio, and why sticking to it matters more than which one you pick.
- [Material 3 type scale tokens](https://m3.material.io/styles/typography/type-scale-tokens): A production scale where every size is a named role with its own line height and tracking.
- [Font size in Tailwind](https://tailwindcss.com/docs/font-size): The text utilities, and how to give a custom size its own line height and letter spacing.
