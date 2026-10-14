# Direction

The direction is the decision about what this product looks and sounds like:
its typefaces, palette, shape, signature and voice, and where each came from.
Critly's concepts make any direction clear, consistent and well made; they
don't choose one. A model with no direction drifts to the average interface
of its category, so set one before choosing any visual value.

The direction lives in `.critly/direction.md` in the project. Saving it is what
keeps the look the same across screens and sessions, and repetition is what
makes a look recognizable.

## Pick the path

| The project has | Do |
| --- | --- |
| `.critly/direction.md` | Read it. It owns every visual value. Go back to the skill. |
| A design of its own (a custom theme or tokens, brand fonts or colors, finished screens) but no note | **Describe** it: write the note from what is there (below). Keep the look. |
| No design, only a component library's starter theme, or the user asks for a new look or a redesign | **Set** a direction: the five steps below. |

A starter theme is one nobody chose: the library's default palette and
radius, the framework's default font. When a project has only that and the
task is design work (a new page, "make it look good"), set a direction and say
so in one line. When the task is a small fix, describe what is there instead
and keep going.

## Set a direction

1. **List the subject's world.** Write 8 to 12 concrete nouns from the brief
   and the subject: its tools, materials, artifacts, places, era, numbers, and
   the words its people use. Things a person could photograph or hold, not
   adjectives. Done when most of them would never appear in a competitor's
   brief.
2. **Write the only line.** "The only [category] that [difference], for
   [who]." Put the nearest competitor's name in it. If it still reads true,
   sharpen the difference until it doesn't.
3. **Sketch three routes**, one sentence each, each from a different source:
   - one built from the subject's nouns (a material, an artifact, a printed
     thing from that world),
   - one built from a constraint (one typeface, two colors, a grid or rhythm
     taken from the domain),
   - one built from a world outside software whose way of working fits (a
     field manual, a train timetable, a seed packet).

   Mark each as common, unusual or rare for this category. Pick the one that
   fits the subject and the people using it best. A common route is right
   only when you can say why it suits this brief better than the others.
   When the user is in the conversation and this is a whole product or brand,
   show the three routes in a few lines and ask which. Otherwise pick, and
   name the other two in your summary so the user can switch.
4. **Write the note** in the format below.
5. **Turn it into tokens** in the order under **From the note to tokens**.
   Then build the most important screen first, look at it, and adjust the
   note if a choice doesn't hold up before building the rest.

## The note

`.critly/direction.md`, 25 lines or fewer. Every value says which noun, word
or constraint it came from.

```markdown
# Direction

Subject: <what it is, one line>
Only: the only <category> that <difference>, for <who>.
From: <the nouns this draws on>
Route: <the chosen route, one sentence>. Also considered: <the other two>.

## Materials
- Type: <display face, text face, mono if any>. Why: <source>
- Palette: <ground, ink, accent, any brand hues, as values>. Why: <source>
- Shape: <radius, line weight, how surfaces separate>. Why: <source>
- Signature: <the one thing people should remember>. Where: <2 or 3 places>
- Voice: <three traits>. Errors and money: plain and calm.
- Density and pace: <per surface: compact or comfortable, instant or animated>

## Standard
Layout, navigation, controls and states follow the platform and Critly's concepts.
```

**Type** carries the identity faster than anything else: people read a
typeface's personality before its words. Let a display face with character
carry headings and the brand, and a text face carry reading. Choose both for
this subject; a face you would choose for any product says nothing about this
one. Check the license (Google Fonts and OFL faces are safe to ship), the
weights you need, and tabular figures if the product shows numbers.

**Palette** comes from the subject's nouns, not from color psychology charts
(the research behind "blue means trust" is weak). Chroma sets energy and
lightness sets weight. One accent stays reserved for the next action and
where you are, and status colors keep their meaning; beyond that, color is as
free as the direction wants.

**Signature** is one move taken from what the product does or from its world,
used the same way every time: a shape, a texture, a way numbers are set, a
transition, a graphic device. Put it where people pause (the hero, empty
states, success moments, the first screen of an app), not on every control.
Two or three such assets, repeated everywhere, are what make a product
recognizable; more than that fragments it.

## Surfaces

The same direction serves every screen. What changes is the dose.

- **Persuade** surfaces (landing, marketing, pricing, first run, empty and
  success moments) get the full direction: large type, the signature at its
  biggest, imagery from the subject. Keep the page shape familiar (people
  judge a page in under a second, and pages that look typical of their kind
  are liked best) and make the content specific: a headline that says what it
  is and who it's for, the product shown doing its job, proof with names and
  numbers.
- **Operate** surfaces (dashboards, tables, editors, settings, anything used
  daily) take the type, palette, density and a small dose of the signature.
  Layout, navigation and controls stay standard, and the chrome stays quiet so
  the person's own content leads.

## From the note to tokens

Each step feeds the next, so keep the order.

1. **Text face, then base size.** Dense tools 14 to 16px; reading and
   marketing 17 to 20px.
2. **Type scale by surface.** Operate: a ratio of 1.125 to 1.2. Persuade: 1.25
   to 1.5 at desktop, fluid with `clamp()` so phones step down to about 1.2.
   The top step must fit the real headline at full size.
3. **Spacing from the base.** Multiples of the base from 0.25× to 8×, plus
   section gaps for page rhythm (96 to 160px, or fluid pairs).
4. **Neutrals.** A 10 to 12 step OKLCH ramp with the note's tint (warm, cool
   or none). Give each step a job: page, subtle fill, component fills, borders,
   solid, muted text, text.
5. **Accent and status ramps on the same lightness steps** as the neutrals, so
   a step has the same contrast in every hue. Text at 4.5:1, large text and UI
   edges at 3:1. Generate dark mode from the ramps instead of picking it by
   hand.
6. **Shape and elevation** from the note: radius, line weight, how surfaces
   separate (line, shadow, fill or space), one light source. Nested radius is
   the outer radius minus the padding.
7. **Motion.** One productive curve and three or four durations for
   everything people do often. An expressive curve only if the note asks for
   it, and only on persuade moments.
8. **Write the tokens** as CSS variables in two layers, raw values and roles
   (`--bg`, `--surface`, `--text`, `--text-muted`, `--border`, `--accent`,
   `--accent-fg`, `--focus`, `--danger`, `--success`, `--warning`, the font
   families, the type and space steps). With Tailwind, put them in `@theme`
   and clear the defaults (`--color-*: initial`, `--font-*: initial`) so only
   these values exist. When the project uses the check, write the fonts and
   type scale into `.critly/policy.json`.

For a one-page site or an early prototype, the raw values plus about a dozen
roles are enough.

## Describe an existing design

Read the theme or tokens, the font imports, the logo, and two or three main
screens. Write the note in the same format, describing what is there: values
as they are, the "why" as best you can infer it, and `Signature: none yet`
if there isn't one. Describing changes nothing in the app. Problems you find
(low contrast, a missing state) are fixes for the build, made within the
direction, not changes to it.

## Review: whose page is this?

After the build, with the screenshots open:

- **Cover the name and logo.** Could the nearest competitor ship this screen
  as it is? Then the materials came from the category, not the subject.
  Strengthen the subject-derived choices and the signature; adding more
  decoration doesn't fix it.
- **Trace every choice.** Each typeface, color and shape names its source in
  the note. Change any that can't.
- **Fill what you removed.** Where restraint left a section empty, put
  something from the subject there: real content, the product working, a
  field of the brand color, a picture of the thing itself.
- **Use it like its category.** Navigation, controls and states still work the
  way people expect from this kind of product.
