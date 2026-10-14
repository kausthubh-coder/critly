# Direction

The direction is the decision about what this product looks and sounds like:
its typefaces, palette, shape, imagery and voice. Critly's concepts make any
direction clear, consistent and well made; they don't choose one.

Choose it by looking, not by arguing. A story about where a color came from is
easy to write and says nothing about whether the screen works. Two rendered
screens side by side do. The familiar, well-made version of a category is a
real option, and often the right one for screens people use daily; a
direction has to beat it on the screen, not in the note.

The direction lives in `.critly/direction.md` in the project. Saving it is what
keeps the look the same across screens and sessions.

## Pick the path

| The project has | Do |
| --- | --- |
| `.critly/direction.md` | Read it. It owns the look. Go back to the skill. |
| A design of its own (a custom theme or tokens, brand fonts or colors, finished screens) but no note | **Describe** it: write the note from what is there (below). Keep the look. |
| No design, only a component library's starter theme, or the user asks for a new look or a redesign | **Set** a direction: the steps below. |

A starter theme is one nobody chose: the library's default palette and
radius, the framework's default font. When a project has only that and the
task is design work (a new page, "make it look good"), set a direction and say
so in one line. When the task is a small fix, describe what is there instead
and keep going.

## Set a direction

1. **Collect the material.** Write down what is true: what the product does
   and for whom, the one job of the most important screen, the facts and
   numbers the brief gives, and the assets that exist (logo, product screens,
   photos, real customers). Write the real headline and the real product
   content that screen will show. No theme yet.
2. **Look at two or three references**: real, excellent products or pages
   that solve a similar screen, at least one outside the category (How to Get
   References). For each, write one thing it teaches about composition, type,
   imagery or density. Take the lesson, not the look. Without a browser, name
   ones you know well and say what you remember of them.
3. **Build two first screens.** Make two rough versions of the first view of
   the most important screen, with the real headline and content, at desktop
   (1440×900) and phone (390×844). Make them differ in composition, not just
   in font and color: where the product sits and how big, type-led or
   image-led, light or dark ground, dense or open. Let one be the clearest
   familiar version of this kind of screen, and one follow an idea from the
   product or its world. Only the first view: no full page, no states yet.
   Build them as two throwaway pages (or one page with a switch), screenshot
   both, and delete the one you don't keep.
4. **Compare them side by side at real size** and keep the better one,
   judged in this order:
   - It says what it is and shows the product at first glance.
   - It suits the people and the subject.
   - It makes the thing look desirable or trustworthy, as the brief needs.
   - It is well made: one thing leads, spacing groups, type is set well.

   Distinctiveness only breaks a tie. If neither is good, build a third
   rather than polishing the weaker one. When the user is in the
   conversation, show them both screenshots and let them choose.
5. **Write the note** from the version that won, then turn it into tokens
   (**From the note to tokens**) and build the rest of the screen and the
   page.

## The note

`.critly/direction.md`, 25 lines or fewer. It records what won, so the next
screen and the next session match it.

```markdown
# Direction

Subject: <what it is and who it's for, one line>
Job: <what the most important screen must get across first>
Kept: <the version that won and why, one line>. Also tried: <the other>.
References: <each one, and what it taught>

## Materials
- Type: <faces and their roles>
- Palette: <ground, ink, accent, any others, as values>
- Shape: <radius, line weight, how surfaces separate>
- Imagery: <what is pictured (the product, the thing itself), how it's cropped and framed>
- Signature: <a detail that recurs, or "none yet">
- Voice: <three traits>. Errors and money: plain and calm.
- Density and pace: <per surface: compact or comfortable, instant or animated>

## Standard
Layout, navigation, controls and states follow the platform and Critly's concepts.
```

A reason can be what you saw ("the condensed face kept the headline to two
lines", "the dark ground made the product screenshot lead"). It doesn't need
a story.

**Type.** One family, well set, is a valid direction: weight, size and
spacing do most of the work. Add a second face only for a job the first can't
do: headlines with more character, or a mono for code, ids and money columns.
Keep an expressive face on headlines; body text and controls stay plainly
readable. Test every face with the real headline and the longest real strings
before keeping it. Check the license (Google Fonts and OFL faces are safe to
ship), the weights you need, and tabular figures if the product shows
numbers (`tabular-nums` does nothing otherwise).

**Palette.** Decide the ground first, because it covers most of the screen:
light, dark, or a field of the brand color. Chroma sets energy and lightness
sets weight; these are better supported than hue meanings ("blue means
trust" rests on weak research), so set them on purpose. Bright hues (yellow,
lime) keep their solid step light and take dark text, or they turn olive. One
accent stays reserved for the next action and where you are, and status
colors keep their meaning. Pick colors by how they look together on the real
screen.

**Imagery.** The strongest material is usually the product itself: its real
screens, the thing it sells, the people who use it. Show it large and cropped
to the part that matters (Show the Product). When there are no real assets,
draw a clear, honest picture of the product working, mark in the code where
photos or screenshots should go, and list them in your summary; don't fill the
gap with decoration.

**Signature** is optional and earned. If a detail from the winning version
does a job and recurs well (the way numbers are set, a drawing style, a
recurring shape, the product view itself), keep it and use it the same way
every time. Size it by the reading order: on a first screen the headline, the
product and the action come first. Don't dress the software in its subject's
world: signage type, stencils, paper and stamps on every section read as a
costume, not a brand. A few recurring details, kept consistent over time, are
what make a product recognizable; one screen can't prove that.

## Surfaces

The same direction serves every screen. What changes is the dose.

- **Persuade** surfaces (landing, marketing, pricing, first run, empty and
  success moments) get the fuller direction: larger type, the imagery at its
  biggest. Keep the page shape familiar (people judge a page in under a
  second, and pages that look typical of their kind are liked best) and make
  the content specific: a headline that says what it is and who it's for, the
  product shown doing its job, and proof next to the claim it backs (a named
  person with role and company, or a number with its baseline and timeframe;
  when it isn't in yet, use the proof you have, mark the spot in the code and
  list it in your summary; never invent it, and never show readers a to-do
  note). One primary action, named for what happens after the click, repeated
  where readers decide; every other action is visibly quieter. Give each
  section one idea and size it by how much it matters, so the page has a pace.
  Open the Marketing concept for the question in front of you (the first
  screen, proof, the call to action, pricing).
- **Operate** surfaces (dashboards, tables, editors, settings, anything used
  daily) take the type and palette and stay quiet. Layout, navigation and
  controls stay standard, and the chrome steps back so the person's own
  content leads. The best dashboard is usually the clearest familiar one,
  finished well.

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
as they are, `Kept: the existing design`, and `Signature: none yet` if there
isn't one. Describing changes nothing in the app. Problems you find (low
contrast, a missing state) are fixes for the build, made within the
direction, not changes to it.

## Review: is it better than the obvious version?

After the build, with the screenshots open:

- **Real size, first screen.** At 1440×900 and 390×844, not shrunk: what does
  the eye land on first, second and third? It should be the order the screen
  needs, usually headline, product, action.
- **Against the version you didn't keep**, or the plain familiar version of
  this screen: is this one clearly better to use or to buy from, not just
  different? If not, say so and take the better one.
- **Look for costume.** Any material that dresses the software in its
  subject's world without doing a job (themed type on every heading, textures,
  props, decorative borders): quiet it or remove it.
- **Check the proof.** Every testimonial, logo and number is real and
  checkable. What's missing is listed in your summary, not shown on the page
  as a placeholder or a note.
- **Use it like its category.** Navigation, controls and states still work the
  way people expect from this kind of product.
