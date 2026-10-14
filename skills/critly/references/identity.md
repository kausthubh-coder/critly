# Identity

## Direction First

> Decide what it is like before how it looks.

- Section: Identity
- URL: https://critly.vercel.app/direction-first
- Published: 2026-10-14
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/identity/direction-first.mdx

Ask a model for a landing page and nothing else, and you get the page it has
seen most often. Ask again for something distinctive and the page changes, but
it changes the same way for everyone who asks. The average moves somewhere
new and is still an average.

**Before you choose a font, a color or a shape, decide what the product is like (its subject, the one thing only it can claim, and the move people should remember) and trace every value back to them, because with no direction every choice drifts to the average of the category.**

> **Interactive demo: Direction First.** Open https://critly.vercel.app/direction-first to try it.

The brief and the page structure are the same in all four. With no direction,
every value is a category default and could belong to any transit app. Each
route starts from a different source, and every value names where it came
from. Then turn on the thumbnail test.

### Why the average wins

A model predicts what is likely. Anthropic calls the result
[distributional convergence](https://claude.com/blog/improving-frontend-design-through-skills):
safe choices fill the training data, so with no direction the model samples
from the middle. Preference tuning narrows it further. The authors of
[Verbalized Sampling](https://arxiv.org/abs/2510.01171) trace this to
typicality bias: the people who rate outputs favor what looks familiar, and
the model learns to give it to them.

It has been measured for interfaces.
[Design Creativity Bench](https://arxiv.org/html/2610.11539) scored fifteen
models against human designers. The best model fit the brief slightly better
than the humans did (99.2% against 98.0%), but the models' range across
different briefs was far lower (0.58 against 0.90). In the authors' words,
"differentiating the prompt does not differentiate the design."

Telling a model to be distinctive doesn't fix this, because distinctive has an
average too. Anthropic found that steering a model off one overused typeface
landed it on another. In Critly's own test builds, pages told to stand out all
arrived at the same new look. A rule about what to avoid moves the center. It
doesn't give the page a subject.

That much is measured. What follows is method: how studios and brand
strategists make the choice somewhere other than the middle. It is reasoning,
not a tested cause of better pages.

### Three things, decided first

The subject comes first, as concrete nouns from its world: tools, artifacts,
places, numbers, the words its people use. For a night bus app, that is the
destination blind, the stop flag, the timetable, the last bus. Adjectives
like "modern" or "friendly" don't count, because every competitor uses them.
[Borrow From the Subject](https://critly.vercel.app/borrow-from-the-subject) is about finding these.

Next comes the only line. Marty Neumeier's
[onliness statement](https://www.peachpit.com/articles/article.aspx?p=2437847)
has two blanks: "Our brand is the only ___ that ___." The first is the
category, the second the difference. If the nearest competitor could sign the
sentence, it isn't done.

Last is the move people should remember, one [signature](https://critly.vercel.app/signature-move)
taken from what the product does.

Then sketch three routes, each from a different source: one from the
subject's nouns, one from a constraint (one typeface and two colors, or a
grid taken from the domain), one from a world outside software whose way of
working fits. Mark each as common, unusual or rare for the category. This is
close to what the Verbalized Sampling authors tested: asking for several
answers and how likely each one is raised diversity 1.6 to 2.1 times in their
creative writing tasks. Pick by fit to the subject, not by novelty. A common
route is right when you can say why it suits this brief better than the
others.

### Familiar structure, specific materials

A direction is not a license to reinvent the page. In a Google study,
[Tuch and colleagues](https://research.google/pubs/the-role-of-visual-complexity-and-prototypicality-regarding-first-impression-of-websites-working-towards-understanding-aesthetic-judgments/)
showed people websites for 50 milliseconds. The pages they liked best were
simple and typical of their kind. Layout, navigation and controls that work
the way people expect are part of being typical.

So the identity goes into the materials: type, color, shape, the content
itself ([real content](https://critly.vercel.app/real-content), [microcopy](https://critly.vercel.app/microcopy)), and one
signature. Rauno Freiberg [puts it](https://rauno.me/craft/novelty) as about
90% familiar and 10% new. In the demo, only the materials change between
routes. The header, the headline, the next bus and the one button stay where
people look for them.

Write the three decisions down where the next screen will see them. The
second page should trace back to the same nouns as the first, which is how a
look becomes [one people recognize](https://critly.vercel.app/ownable-assets).

### Review: can you still tell?

Shrink the finished page to a thumbnail and cover the name. Can you tell
which product it is? Can you tell what it's about? If not, the materials came
from the category instead of the subject. More decoration won't fix that. Go
back to the nouns and strengthen the choices that came from them.

### Resources

- [Improving frontend design through Skills](https://claude.com/blog/improving-frontend-design-through-skills): Anthropic on distributional convergence, and why a model with no direction samples the safe middle of web design.
- [Verbalized Sampling: How to Mitigate Mode Collapse and Unlock LLM Diversity](https://arxiv.org/abs/2510.01171): Traces mode collapse to typicality bias in the people who rate model outputs, and shows that asking for several answers at once widens the range.
- [Design Creativity Bench: Measuring creativity in LLM-Generated UI](https://arxiv.org/html/2610.11539): Fifteen models against human designers. The models fit the brief as well as people did, with far less range between briefs.
- [The Brand Flip: An Interview with Marty Neumeier](https://www.peachpit.com/articles/article.aspx?p=2437847): Where the onliness statement comes from, and why the word "only" makes it hard to fill in.
- [Visual complexity and prototypicality in first impressions of websites](https://research.google/pubs/the-role-of-visual-complexity-and-prototypicality-regarding-first-impression-of-websites-working-towards-understanding-aesthetic-judgments/): Tuch and colleagues at Google, 2012. Within 50ms, simple pages that looked typical of their kind were liked best.
- [Novelty](https://rauno.me/craft/novelty): Rauno Freiberg on keeping about 90% of an interface familiar and spending the rest on what is new.


## Borrow From the Subject

> Take the look from the thing itself.

- Section: Identity
- URL: https://critly.vercel.app/borrow-from-the-subject
- Published: 2026-10-14
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/identity/borrow-from-the-subject.mdx

Most interfaces borrow from other interfaces. The card came from a component
library, the gradient from a landing page someone liked, the type from
whatever was default. Put together, they say "software" and nothing about
what this software is for.

The subject has material of its own lying around. A seed library has packets,
stencilled sacks and plot stakes. A climbing gym has colored holds and the
setter's tape. A darkroom has a safelight and the code printed along the edge
of the film.

**Take type, color and shape from the subject's own world (its tools, artifacts, places, era, numbers and the words its people use) rather than from other software, because only material from the subject can say what the product is about.**

> **Interactive demo: Borrow From The Subject.** Open https://critly.vercel.app/borrow-from-the-subject to try it.

Each screen starts generic. Pull each material in from its noun and the
screen becomes about seeds, or climbing, or film. Hover a row to see which
part of the screen it changed.

### Where it came from in practice

These are case studies: what studios say they did, not tests of what caused
results. They are useful because they show where the material came from, and
that part you can copy.

Duolingo's typeface, Feather Bold, was drawn by Johnson Banks and Fontsmith
from the brand's owl. The studio
[looked at](https://www.monotype.com/resources/duolingo-custom-font-inspired-their-owl-mascot-duo)
"how to incorporate the shape and spirit of an owl's wing into every
conceivable letterform." Duolingo's art team
[describes](https://blog.duolingo.com/shape-language-duolingos-art-style/) the
same move in the app: from "flat, pointy shapes" to rounded buttons and
rounded illustration.

Spotify's duotone came from music, not from software. Collins
[describes it](https://www.wearecollins.com/work/spotify/) as drawn "from the
duotone screen-printing used throughout music's history," and uses it to make
any artist's photo look like Spotify.

For the Public Theater in New York, Paula Scher used
[street typography and Victorian wood type](https://www.pentagram.com/work/the-public-theater),
the lettering of the city outside and of old theater bills. It was
distinctive enough that other theaters in the city copied it.

Michael Bierut gives the reason in an
[interview](https://99percentinvisible.org/episode/655-exit-interview-with-michael-bierut/transcript/):
design "can't invent that weight out of nothing." It needs a reference that
already carries the meaning. A noun from the subject is that reference.

### Borrow how it works, not the costume

There are two ways to take something from a subject. One copies how it looks.
Wood grain on a carpentry app or a torn paper edge on a notes app are
costumes: they show the subject without doing anything with it. The other
copies how it works. Spotify's duotone is a printer's method, two inks and
high contrast. Because it is a method rather than a picture, it works on any
photo an artist sends.

In the demo, the darkroom's time slots are set as a test strip, because a test
strip is how a printer chooses an exposure time: steps that get darker as they
get longer. [How to Get
References](https://critly.vercel.app/how-to-get-references#translate-dont-transplant) makes the same
point for references from outside the field: translate, don't transplant.

A test for each borrowed thing is whether you can say what it does in the
product. If the answer is only "it looks like the subject", it is a costume.

### Finding the nouns

List 8 to 12 things a person could photograph or hold: tools, materials,
printed things, places, the era, the numbers people track, and the words they
use that outsiders don't. Read the forums the users read. Look at the
paperwork of the job. Prefer the nouns that would never appear in a
competitor's brief, since those are the ones that set you apart.

Then take one material from each of a few nouns: a palette sampled from a real
object ([palette from the world](https://critly.vercel.app/palette-from-the-world)), a typeface that
shares the lettering of the subject ([typeface as voice](https://critly.vercel.app/typeface-as-voice)),
one motif used as the [signature](https://critly.vercel.app/signature-move). Keep the layout and
controls standard. [Direction First](https://critly.vercel.app/direction-first) covers why the
structure stays familiar while the materials change.

### Resources

- [The Duolingo Font: Exploring Feather](https://www.monotype.com/resources/duolingo-custom-font-inspired-their-owl-mascot-duo): How Johnson Banks and Fontsmith drew Feather Bold from the shape of an owl's wing.
- [Shape language: Duolingo's art style](https://blog.duolingo.com/shape-language-duolingos-art-style/): Duolingo's own account of moving from flat, pointy shapes to the rounded style its app now uses.
- [Spotify, by Collins](https://www.wearecollins.com/work/spotify/): The case study behind Spotify's duotone, drawn from the screen printing used throughout music's history.
- [The Public Theater, by Pentagram](https://www.pentagram.com/work/the-public-theater): Paula Scher's identity for the theater, built from street typography and Victorian wood type.
- [Exit Interview with Michael Bierut](https://99percentinvisible.org/episode/655-exit-interview-with-michael-bierut/transcript/): Bierut on why design needs a reference that carries meaning, and can't invent it from nothing.


## Ownable Assets

> Own a few things, and repeat them.

- Section: Identity
- URL: https://critly.vercel.app/ownable-assets
- Published: 2026-10-14
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/identity/ownable-assets.mdx

Cover the names on five budgeting apps and most of them turn into the same
app: the same white card, the same blue button, the same rounded corners.
Each team chose those values for good reasons. None of the values belongs to
any of them.

**Pick two or three things nobody else in your category uses (a shape, a color pairing, a way of drawing progress or setting numbers) and use them the same way on every screen, because people recognize what is both unique and repeated.**

> **Interactive demo: Ownable Assets.** Open https://critly.vercel.app/ownable-assets to try it.

Look at the four apps, then take the names off and identify each one from a
screen you haven't seen. Do it with the category defaults, then with each
app's own assets.

### What the brand research found

Brand researchers call these distinctive assets: the colors, shapes,
characters and type that bring a brand to mind without its name. Jenni
Romaniuk of the Ehrenberg-Bass Institute
[sets out two tests](https://marketingscience.info/news-and-insights/brands-of-distinction).
An asset has to be famous (people know it) and unique (it brings to mind only
one brand), and "of these two, uniqueness is most important." She also calls
inconsistency "the enemy of distinctive asset building." An asset that
changes from one place to the next never gets learned.

Some kinds of asset are much harder to own than others. Ipsos and the agency
JKR tested over 5,000 assets with over 26,000 people and graded how well each
one brought its brand to mind on its own. Only 15% reached the top tier.
[By type](https://www.marketingweek.com/15-brand-assets-truly-distinctive-finds-research/),
31% of products made it, 19% of logos, 16% of characters, 6% of slogans, and
4% of colors. A
[2024 study of UK car brands](https://ideas.repec.org/a/pal/jobman/v31y2024i1d10.1057_s41262-023-00329-6.html)
found the same pattern: fonts, slogans and colors scored low on uniqueness,
and logos were the most ownable.

So a brand color alone rarely does the job, because a color is easy to share
with half the category. A pairing does better, or a shape, or a character, or
a color that always appears with a particular shape. Mastercard is the
well-known case: in its own research,
[81% of people recognized](https://www.pentagram.com/work/mastercard) the two
circles without the name. That is a case study, from the brand's side.

### Applying it to interfaces

This research is about ads, packaging and logos, not product screens.
Applying it to UI is our extrapolation, and it hasn't been tested there. The
reasoning carries over to a product people use often: every screen is another
chance to repeat an asset, or to break it.

In an interface, an asset might be a shape that shows up in buttons, progress
and empty states. It might be a color pairing, a way of setting numbers, a way of
drawing progress, or a sound. A typeface alone is weak, for the same reason a
color is: many brands can use it. In the demo each app has two or three: Tally
counts in tally marks and sets money in a mono face, Kitty draws everything as
a round pot, Stash puts an envelope flap on every screen, and Fathom reads
progress off a depth gauge. None of them changed the layout.

Pick assets that come from the subject ([Borrow From the
Subject](https://critly.vercel.app/borrow-from-the-subject)), since those are least likely to be
shared. Before adopting one, check the category. Julian Major's
[advice](https://www.thedrum.com/opinion/2013/09/05/five-tips-identifying-and-managing-your-brand-assets)
is to "check if any competitors have associations with it." Then put the assets in
[tokens](https://critly.vercel.app/design-tokens) and components, so a new screen gets them by default
instead of by memory. Spend them where people pause, as in [Signature
Move](https://critly.vercel.app/signature-move), and keep frequent controls quiet ([Novelty
Budget](https://critly.vercel.app/novelty-budget)).

### Why you can't judge your own

The people who make a brand are the worst at telling how distinctive it is.
Ehrenberg-Bass
[found](https://www.marketingweek.com/marketers-judgement-strength-brand-assets-rarely-accurate/)
that marketers overestimate how well known their assets are and underestimate
how distinctive they are, because they see far more of their category than
their customers do.

So test it the way the demo does. Show someone outside the team a screen with
the name removed and ask whose it is. If they can't tell, the assets aren't
unique yet, or they aren't repeated enough to be learned. Changing them for
variety would only make that worse.

### Resources

- [Brands of Distinction](https://marketingscience.info/news-and-insights/brands-of-distinction): Jenni Romaniuk of the Ehrenberg-Bass Institute on distinctive assets, why uniqueness matters more than fame, and why inconsistency undoes both.
- [Only 15% of brand assets are "truly distinctive", study finds](https://www.marketingweek.com/15-brand-assets-truly-distinctive-finds-research/): Ipsos and JKR tested over 5,000 assets with over 26,000 people. Products and logos reached the top tier most often, colors least.
- [Exploring the uniqueness of distinctive brand assets within the UK automotive industry](https://ideas.repec.org/a/pal/jobman/v31y2024i1d10.1057_s41262-023-00329-6.html): Fiocchi and Seyed Esfahani, 2024. Fonts, slogans and colors scored low on uniqueness; logos were the most ownable.
- [Five tips for identifying and managing your brand assets](https://www.thedrum.com/opinion/2013/09/05/five-tips-identifying-and-managing-your-brand-assets): Check what competitors already own before you adopt an element, and don't change it from campaign to campaign.
- [Marketers' judgement of brand asset strength "rarely accurate"](https://www.marketingweek.com/marketers-judgement-strength-brand-assets-rarely-accurate/): Ehrenberg-Bass research on why the people closest to a brand misjudge how distinctive it is.
- [Mastercard, by Pentagram](https://www.pentagram.com/work/mastercard): The case for dropping the name from the mark, after 81% of people recognized the circles alone.


## Typeface as Voice

> People hear the type before the words.

- Section: Identity
- URL: https://critly.vercel.app/typeface-as-voice
- Published: 2026-10-14
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/identity/typeface-as-voice.mdx

Set the same headline in a slab serif and in a soft rounded sans. Before
anyone reads a word, one sounds like a seed catalogue and the other like a
children's dentist. Most products never make this choice. They ship the
framework's default face, which tells people only that nobody chose one.

**People read a typeface's personality before its words, so let a display face carry the brand and a text face carry the reading, both chosen for this subject.**

Pick a brief, then try each face on its headline. Change the brief and watch
the best fit move.

> **Interactive demo: Typeface Voice.** Open https://critly.vercel.app/typeface-as-voice to try it.

No face here is good or bad in general. The slab that suits a seed catalogue
fights a dentist's booking page, and the rounded face that welcomes a nervous
child makes a payroll tool look unserious. The fit lives in the pair: this
face, this subject.

### What the research shows

The effect is measured. In [Shaikh, Chaparro and Fox (2006)](https://portfolio.erau.edu/en/publications/perception-of-fonts-perceived-personality-traits-and-uses/),
people rated 20 fonts on 15 pairs of adjectives and picked uses for each. The
personalities they gave grouped by family (serif, sans serif, modern,
monospace, script), and they matched those personalities to uses. In
[Hazlett and colleagues (2013)](https://portfolio.erau.edu/en/publications/two-studies-on-how-a-typeface-congruent-with-content-can-enhance-/),
people recognized emotion words faster when the face's personality matched
the word, and their snap judgment of a page's tone changed with its typeface.
The authors conclude that readers take in a typeface's personality instantly.

That is the limit of the evidence. These are lab studies of short words and
quick ratings, run on the screen fonts of their time. They show that a face
speaks before the text does. They can't tell you which face suits your
product. That part is judgement, and the rest of this page is reasoning
rather than measurement.

### Two jobs, two faces

The display face is for headlines, the wordmark, a big number in the hero:
large, short and seen for a moment, so it can carry character. The text face
is for paragraphs, labels, tables and forms: small, long and read for
minutes, so it needs open shapes, a calm rhythm and clear figures at 14 to
16px. One face rarely does both jobs well.

Linear [moved its headings](https://linear.app/now/how-we-redesigned-the-linear-ui)
to Inter Display "to add more expression" and kept regular Inter for the
rest. Figma asked Grilli Type for [Figma Sans](https://www.figma.com/blog/the-story-of-creating-figma-sans/),
a family with text, display, condensed and mono cuts, and gave the i a
rectangular dot because a round one could read as childish. Both put
the voice in the large sizes and kept the small sizes plain.

Pair the two by contrast in one way. Let them differ clearly in one thing
(serif against sans, condensed against normal width, heavy against regular)
and agree in the rest: proportions, era, mood. Two faces that differ a little
in everything look like an accident. Two that differ in one way look chosen.

Take the voice from the subject's world: the lettering on its tools, signs,
labels and paperwork, and the era it belongs to ([Borrow From the
Subject](https://critly.vercel.app/borrow-from-the-subject) shows how). A face you would pick for any
product says nothing about this one, and Matthew Butterick's point about
[system fonts](https://practicaltypography.com/system-fonts.html) holds for
any face that is everywhere: it can't make you look like yourself. A
ubiquitous face is still a sound default for the text role, and for a dense
tool where people's own content should lead ([Product Feel](https://critly.vercel.app/product-feel)),
as long as the [direction](https://critly.vercel.app/direction-first) says why.

### Before you ship it

- **License.** Fonts under the [SIL Open Font License](https://openfontlicense.org/),
  which covers most of Google Fonts, can be used on websites and in apps.
  Read any other license before shipping. Free trials from type foundries are
  often for testing only.
- **Weights.** Load only the ones you use, usually regular and one heavier
  weight for text and a single weight for display. Each one is another file
  to download ([Font Loading](https://critly.vercel.app/font-loading)).
- **Figures.** If the product shows prices, times or tables, check that the
  text face has tabular figures before you commit to it.
  `font-variant-numeric: tabular-nums` does nothing in a face that lacks them
  ([Tabular Numbers](https://critly.vercel.app/tabular-numbers)).
- **Size.** The display face sets the top of the [type scale](https://critly.vercel.app/type-scale).
  Test it with the real headline at full size, on a phone too.

Name the faces by role, so the voice can change in one place:

```css
:root {
  --font-display: "Display Face", var(--font-text);
  --font-text: "Text Face", system-ui, sans-serif;
}

h1, h2, .hero-figure { font-family: var(--font-display); }
body { font-family: var(--font-text); }
td, .amount { font-variant-numeric: tabular-nums; }
```

### Resources

- [Two studies on how a typeface congruent with content can enhance onscreen communication](https://portfolio.erau.edu/en/publications/two-studies-on-how-a-typeface-congruent-with-content-can-enhance-/): Hazlett, Larson, Shaikh and Chaparro (2013) on readers taking in a typeface's personality at a glance.
- [Perception of fonts: perceived personality traits and uses](https://portfolio.erau.edu/en/publications/perception-of-fonts-perceived-personality-traits-and-uses/): Shaikh, Chaparro and Fox (2006) on how people rate 20 fonts, and why the ratings group by family.
- [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui): Linear moved its headings to Inter Display for more expression and kept regular Inter for everything else.
- [The story of creating Figma Sans](https://www.figma.com/blog/the-story-of-creating-figma-sans/): Figma and Grilli Type on a family with text, display, condensed and mono cuts, and a square dot on the i.
- [System fonts](https://practicaltypography.com/system-fonts.html): Matthew Butterick on why a face that comes with every computer can't make anything look like itself.
- [SIL Open Font License](https://openfontlicense.org/): What the OFL lets you do with a font, including using it on websites and in apps.


## Palette From the World

> Hue from the subject, contrast from the steps.

- Section: Identity
- URL: https://critly.vercel.app/palette-from-the-world
- Published: 2026-10-14
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/identity/palette-from-the-world.mdx

Ask a color-psychology chart for "trust" and it says blue. Ask for "energy"
and it says orange. Charts like this are part of why so many banks, clouds
and health apps share one blue, and why none of them can be told apart by
their color.

**Take hues from the subject's own world rather than from color-psychology charts, set energy with chroma and weight with lightness, and build every ramp on shared lightness steps so text and buttons keep their contrast in any hue.**

Pick a subject. Each hue comes from something in its world. Then push the
chroma, switch the ground, and watch the contrast numbers.

> **Interactive demo: Palette World.** Open https://critly.vercel.app/palette-from-the-world to try it.

Six subjects, six brands, and the body text, the link and the button pass in
every one. Nothing was tuned by hand. Each step sits at the same lightness in
every hue (with one exception, below), so a step means the same contrast
whatever color it wears.

### The charts are weaker than they look

Andrew Elliot's [2015 review](https://www.frontiersin.org/articles/10.3389/fpsyg.2015.00368/full)
of color psychology calls the field early. Much of the research is
underpowered, and he expects every effect to depend on conditions: culture,
gender, age, the task, the exact shade. He calls it premature to make
"impassioned calls for application". A chart that says blue means trust is
that kind of call.

[Labrecque and Milne (2012)](https://link.springer.com/article/10.1007/s11747-010-0245-y)
is the study most often cited for brand color. Across four studies, they
mapped hues onto brand personality traits, and their second study found that
saturation and value (how vivid and how light a color is) strengthened those
traits. Hue mattered, but so did how much of it there was and how light or
dark it sat. That is one paper, tested on logos, so read it as support for a
way of working, not as a formula.

The practical reading: no hue carries a fixed meaning you can look up, and
if everyone in a category picks the hue a chart gave them, it stops telling
anyone apart. Color alone is also hard to own ([Ownable
Assets](https://critly.vercel.app/ownable-assets)), which is one more reason to tie it to something
only this product has.

### Where the hue comes from

From the subject's nouns ([Borrow From the Subject](https://critly.vercel.app/borrow-from-the-subject)):
the tiles of a public pool, a courier's hi-vis vest, ripe plums, a
chanterelle, glacier ice. A hue taken from a thing comes with a reason you
can say out loud, and the reason tells you how to use it. Hi-vis yellow
belongs where something must be seen, not on every border.

Then set two levers by the [direction](https://critly.vercel.app/direction-first), not by the hue.
**Chroma sets energy.** Vivid reads loud and quick; grayed reads quiet and
serious. **Lightness sets weight.** A dark ground with deep colors feels heavy
and close; a light ground with pale tints feels open. The same plum can be a
loud consumer app or a quiet co-op ledger depending on these two alone.

### Build every ramp on the same steps

Stripe rebuilt its colors in a perceptually uniform space so that
[contrast is uniform across hues](https://stripe.com/blog/accessible-color-systems).
In their scale, any two colors five levels apart pass for small text, and four apart for icons
and large text. Radix gives each of its 12 steps
[a job](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale):
1 and 2 for backgrounds, 3 to 5 for component fills, 6 to 8 for borders, 9
and 10 for solid fills, 11 and 12 for text.

Do both in [OKLCH](https://critly.vercel.app/oklch). Fix the lightness of each step, let chroma rise
toward the solid step and fall again for text, and change only the hue
between ramps. The exception is the bright hues. Yellow and lime only turn
vivid when they're light, and at the usual solid lightness they go olive, so
their solid steps sit high and take dark text. Radix does the same for its
sky, mint, lime, yellow and amber. Try the bike courier. Keep chroma inside what the screen can show, or the browser
clips it and two steps can come out the same. Tint the neutrals with a trace
of the brand hue on the same steps. For dark mode, write a second set of
lightness steps and keep the hues.

```css
/* --seed-hue and --seed-chroma come from the direction note */
:root {
  --brand-2: oklch(0.98 calc(var(--seed-chroma) * 0.12) var(--seed-hue));
  --brand-9: oklch(0.54 var(--seed-chroma) var(--seed-hue));
  --brand-11: oklch(0.46 calc(var(--seed-chroma) * 0.9) var(--seed-hue));
  --gray-11: oklch(0.46 0.012 var(--seed-hue));

  --accent: var(--brand-9);
  --link: var(--brand-11);
  --text-muted: var(--gray-11);
}
```

Change the seed and every role follows, still legible. Linear builds whole
themes this way, from [three inputs](https://linear.app/now/how-we-redesigned-the-linear-ui):
a base color, an accent and a contrast level. The palette can then be as
loud as the direction wants, as long as [Color Roles](https://critly.vercel.app/color-roles) still
holds: one color for the next action, and status colors that keep their
meaning.

### Resources

- [Color and psychological functioning](https://www.frontiersin.org/articles/10.3389/fpsyg.2015.00368/full): Andrew Elliot's 2015 review of color psychology, and why most of its findings are still preliminary.
- [Exciting red and competent blue](https://link.springer.com/article/10.1007/s11747-010-0245-y): Labrecque and Milne (2012), four studies on hue, saturation and value in how a brand's personality reads.
- [Designing accessible color systems](https://stripe.com/blog/accessible-color-systems): Stripe rebuilt its palette on perceptual lightness levels so contrast is the same in every hue.
- [Understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale): Radix gives each of its 12 steps a job, from app background to high-contrast text.
- [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui): Linear generates whole themes from three inputs (base color, accent and contrast) in LCH.


## Signature Move

> One move, at full size, where people stop.

- Section: Identity
- URL: https://critly.vercel.app/signature-move
- Published: 2026-10-14
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/identity/signature-move.mdx

Plenty of products have a signature that nobody sees. It's a 12px squiggle in
the footer, a wave in the logo that never appears again, or a gradient
border on every input until it reads as noise. From across the room, the
screen looks like any other app in its category.

**Give the product one recognizable move, taken from what it does or from its world, use it the same way every time, and spend it at full size where people pause (the first screen, empty states, success moments), not as a corner detail and not on every control.**

Tidewell is a fictional tide-times app for sea swimmers. Its move is the tide
curve. Put it nowhere, everywhere, tiny in a corner, or at full size in the
pauses, and step back from your screen each time.

> **Interactive demo: Signature Move.** Open https://critly.vercel.app/signature-move to try it.

With the move nowhere, Tidewell could be any weather app. Everywhere, the
curve is on every button and divider, and you stop seeing it within seconds.
In the corner, it's there, but you'd never describe it to a friend. In the
pauses, the curve is the first thing on the first screen, it's the empty
state, and it rises to fill the success moment, while the list you use every
day stays plain.

### A move comes from the product

A signature move is a shape, a line, a graphic device, a way of setting
numbers or a transition that this product can claim because of what it does.
Figma's brand [takes its moves from work on the canvas](https://www.figma.com/blog/figma-on-figma-evolving-our-visual-language/)
(shapes that overlap, a selection that reveals what's underneath), and its
jumbo nodes, "large squares fixed to the corner of bounding boxes", blow up
the act of selecting. Pentagram built Slack's logo from a speech
bubble and a lozenge, shapes that [can be pulled out](https://www.pentagram.com/work/slack)
and used as graphic elements, and the speech bubble became the basis of its
icons and illustrations.

Both moves come out of the product: selecting things, talking. A reason like
that also tells you how to use the move, which keeps it consistent. Use the
same shape, weight, direction and motion every time. A move that changes each
time is several moves, and none of them gets learned ([Ownable
Assets](https://critly.vercel.app/ownable-assets)).

It also has to stay yours. Figma moved away from cursors in its everyday brand
work once there were
[more and more of them on other websites](https://www.itsnicethat.com/features/figma-brand-refresh-graphic-design-spotlight-160924).
A move the whole category uses can't point to one product.

### Spend it where people pause

Rauno Freiberg suggests making an experience
[90% familiar and 10% novel](https://rauno.me/craft/novelty), and putting the
novel part in rare moments such as onboarding and first loads ([Novelty
Budget](https://critly.vercel.app/novelty-budget)). The pauses in a product are those moments: the
first screen, the first run, an [empty state](https://critly.vercel.app/empty-states), a finished
task. Nobody is racing through a job there, so a large move has room and
time, and Benji Taylor's [delight-impact curve](https://benji.org/family-values)
puts the most expression exactly where people go least often.

Controls are the opposite. A button you press forty times a day needs to
read as a button, and a table needs to show the person's data, not the
brand. On operate screens the move can appear in small doses, a section
header or the app icon, while the controls stay standard.

### Big enough to see

A signature too small to see from across the room does nothing. Recognition
starts with noticing, and a small mark in a corner reads as decoration, so
the eye skips it with everything else. At full size the move is the main
shape of the moment: it fills the hero, it is the empty state's picture, it
carries the success. One curve at that size does more than twenty at icon
size.

None of this is measured for interfaces. It comes from brand practice and
case studies, so test it the cheap way. Step back from the screen or squint
([Taste Pass](https://critly.vercel.app/taste-pass)), cover the name, and ask whether you can still
tell whose product it is. If you can't point to the move, it's too small or
in the wrong place.

### Resources

- [Figma on Figma: evolving our visual language](https://www.figma.com/blog/figma-on-figma-evolving-our-visual-language/): How Figma turned canvas actions, like selecting with a jumbo node, into the moves of its brand.
- [Figma's brand refresh](https://www.itsnicethat.com/features/figma-brand-refresh-graphic-design-spotlight-160924): Why Figma stopped leaning on cursors once they were floating about on many other websites.
- [Slack](https://www.pentagram.com/work/slack): Pentagram on a logo built from a speech bubble and a lozenge, and carrying those shapes into icons and illustration.
- [Novelty](https://rauno.me/craft/novelty): Rauno Freiberg on 90% familiar and 10% novel, and where the novel part belongs.
- [Family Values](https://benji.org/family-values): Benji Taylor on putting the most expressive moments where people go least often.
