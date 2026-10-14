# Craft

## Performance Is Design

> How fast it feels is a design choice.

- Section: Craft
- URL: https://critly.vercel.app/performance-is-design
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/craft/performance-is-design.mdx

Two apps can fetch the same data in the same time, and one will still feel
faster. The difference is what each one shows you while you wait.

**What you show during a wait shapes how long it feels.** That makes
waiting a design problem, and usually a cheaper one to fix than the network.

Press load. Both cards take the same 1.2 seconds.

> **Interactive demo: Perceived Performance.** Open https://critly.vercel.app/performance-is-design to try it.

The spinner says "please wait". The skeleton shows the shape of what is
coming, so your eye already has somewhere to go. Whether that makes the same
wait feel shorter is less settled than it looks. A 2018 study found people
rated skeleton pages faster, while
[Viget's test](https://www.viget.com/articles/a-bone-to-pick-with-skeleton-screens)
with 136 people found the skeleton felt like the longest wait of the three it
tried. What a skeleton does reliably is hold the layout, so nothing jumps when
the content lands.

### Match the wait

How long a wait can run before it needs feedback, and what kind, is set out
in [Responsiveness](https://critly.vercel.app/responsiveness). The short wait is the one people get
wrong. A skeleton that lives for 300ms is not reassurance. It is a flash.

> **Interactive demo: Loading Flash.** Open https://critly.vercel.app/performance-is-design to try it.

### Don't make people watch the round trip

Most actions succeed. When you already know what the result will look like,
show it right away and let the request catch up. If it fails, roll it back and
say so.

> **Interactive demo: Optimistic.** Open https://critly.vercel.app/performance-is-design to try it.

The left list is honest about the network. The right one is honest about the
outcome, which is the part people care about. React ships this pattern as
[`useOptimistic`](https://react.dev/reference/react/useOptimistic).

### Even the spinner has a speed

When a spinner is the right call, how fast it turns matters. As
[Emil Kowalski](https://emilkowal.ski/ui/you-dont-need-animations) points out,
a faster spinner makes the same load feel quicker.

> **Interactive demo: Spinner Speed.** Open https://critly.vercel.app/performance-is-design to try it.

### The best loading state

None of this replaces being fast. The best loading state is the one you
deleted: cache the data, render it on the server, prefetch on hover. Then the
interface gets to do the most confident thing it can, which is to just show
the thing.

### Resources

- [Response time limits](https://www.nngroup.com/articles/response-times-3-important-limits/): Jakob Nielsen's 0.1, 1 and 10 second thresholds, and what feedback each one needs.
- [Skeleton Screens 101](https://www.nngroup.com/articles/skeleton-screens/): When a skeleton beats a spinner, and why neither belongs on a load under a second.
- [You don't need animations](https://emilkowal.ski/ui/you-dont-need-animations): Emil Kowalski on speed and frequency, including the faster spinner that makes the same load feel quicker.
- [useOptimistic](https://react.dev/reference/react/useOptimistic): React's hook for showing the result of an action before the server confirms it.
- [Performance is not a technical problem](https://shud.in/thoughts/performance-is-not-a-technical-problem): Shu Ding on why apps keep getting slower, after about 400 performance pull requests at Vercel.


## How to Get References

> Great work starts with great inputs.

- Section: Craft
- URL: https://critly.vercel.app/how-to-get-references
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/craft/how-to-get-references.mdx

If all your references are other interfaces, your work drifts toward the
average of everything on Dribbble. The work that feels like it came from
somewhere usually pulls from outside the discipline.

Shu Ding keeps a list of [the best things](https://shud.in/thoughts/the-best-things)
he has found. It has Kurosawa, Pink Floyd, Borges and Feynman on it, and almost
no software.

**Collect references from outside your field, and borrow how they work, not
how they look.**

### Where to look

**Film.** Editors were guiding the eye through a change long before screens
had transitions. Rauno Freiberg's essay on
[designing depth](https://rauno.me/craft/depth) starts with film composition
and ends at the backdrop behind an overlay, which he blurs the way a lens would.

> **Interactive demo: Depth Of Field.** Open https://critly.vercel.app/how-to-get-references to try it.

Flat only dims. Depth pushes the page back and softens it, so the dialog sits
in front the way a face sits in front of a blurred street. Nothing about that
is native to screens. It was borrowed.

**Print.** Grids, rhythm and restraint were worked out on paper. Vercel says
its [Geist](https://vercel.com/font) typeface draws on the Swiss design
movement.

**Music.** Easing is phrasing. Stagger is rhythm. The copy sound on this site
is a rising C-E-G-C arpeggio, because music already knew what "done" sounds
like.

**Physical things.** Pick up a well-made tool and notice how it stops moving.

### Translate, don't transplant

Copy what a reference looks like and you get a costume. Copy what it does and
you get a mechanism.

Lists on the iPhone don't look like rubber. They behave like it: pull past the
end and the list gives way less and less the further you go, then snaps back.
Drag both lists down.

> **Interactive demo: Rubber Band.** Open https://critly.vercel.app/how-to-get-references to try it.

The hard stop ignores you. The rubber band answers: you were heard, and there
is nothing more here.

Paco Coursey [argues](https://paco.me/writing/creative-output) that anything
new in design is old work reworked in new ways. That is fine, as long as what
you rework is the mechanism and not the pixels.

### Make it a practice

**Capture them.** A folder, an [Are.na](https://www.are.na) channel, a camera
roll of door handles and ticket stubs.

**Name what each one does.** Write one line on how it directs attention, how
it builds tension, or what it leaves out. If you can explain what a reference
taught you without showing it to anyone, it was a good one.

### Train your eye

References only help if you can see what they're doing, and that is a skill.
Nobody's sense of whether an easing is right came pre-installed. [Emil
Kowalski](https://emilkowal.ski/ui/developing-taste) calls taste "a trained
instinct": surround yourself with great work, work out why you like it, and
practice.

**Use good software slowly.** Open the same menu three times. Ask what the
shadow is doing, why the exit is faster than the entrance, what the hover
state is not doing.

**Rebuild it, then compare.** Put your copy next to the original. The gap
between them is the curriculum.

**Judge in pairs.** Two options side by side are far easier to judge than one
on its own. Keep the component fixed and change a single variable.

> **Interactive demo: Pair Judgement.** Open https://critly.vercel.app/how-to-get-references to try it.

Once you can tell 150ms from 400ms without thinking, you have a reference
point you did not have before. When a tool can generate a plausible interface
in seconds, making one stops being the hard part. Picking the right one out of
five is the job, so make the five different on purpose, then compare them two
at a time.

### Resources

- [Designing Depth](https://rauno.me/craft/depth): Rauno Freiberg takes "dirtying the frame" from film and turns it into blurred backdrops, layering and choreography.
- [Contrasting Aesthetics](https://rauno.me/craft/contrasting-aesthetics): Why novelty is usually found where unrelated disciplines and styles meet.
- [Creative Output](https://paco.me/writing/creative-output): Paco Coursey on whether work built from other people's ideas still counts as your own.
- [The Best Things](https://shud.in/thoughts/the-best-things): Shu Ding's list of favourite work, from Kurosawa to Borges, with almost no software in it.
- [Are.na](https://www.are.na): A quiet place to collect references without an algorithm deciding what you see next.
- [Developing taste](https://emilkowal.ski/ui/developing-taste): Emil Kowalski on taste as a trained instinct, and the three habits that train it.
- [Train your judgement](https://emilkowal.ski/ui/train-your-judgement): Pairs of animations side by side. Pick the better one, say why, then read the breakdown.


## Novelty Budget

> Save delight for the rare moments.

- Section: Craft
- URL: https://critly.vercel.app/novelty-budget
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/craft/novelty-budget.mdx

Say a word twenty times in a row and it stops meaning anything. Rauno Freiberg
[points out](https://rauno.me/craft/novelty) that interfaces do the same thing:
the flourish that delighted you on day one is invisible by day ten and in the
way by day one hundred.

He borrows a rule from film, where around 10% of the frame is the accent
color, and suggests making 90% of an experience familiar and 10% novel. Think
of that 10% as a **novelty budget**. The question isn't whether to spend it,
but where.

Finish a few tasks and clear a list, in both modes.

> **Interactive demo: Novelty Budget.** Open https://critly.vercel.app/novelty-budget to try it.

When everything animates, nothing stands out and the whole app feels slower.
When only clearing the list animates, that moment lands.

### Spend by frequency

**The rarer the moment, the more of people's time and attention its expression can take. Color, type, shape and voice cost no time, so frequency doesn't limit them.** Benji Taylor calls
this the [Delight-Impact Curve](https://benji.org/family-values): the potential
for delight goes up as the frequency of use goes down.

Hovering, switching tabs and checking a box happen all day, so they stay
instant; [Hover Restraint](https://critly.vercel.app/hover-restraint) sets out the whole scale. The
budget goes to the rare moments: finishing onboarding, clearing your inbox, a
yearly recap.

The same goes for whole surfaces. A landing page is seen once or twice, so it
can spend far more than the dashboard behind it: large type, the product's
[signature move](https://critly.vercel.app/signature-move) at full size, a field of the brand color.
The dashboard keeps the same typefaces and palette and spends its budget on
the rare moments inside it.

Some moments should only happen once. On Rauno's Devouring Details, the
welcome transition plays right after you log in and never on a reload.

### Count the cost

Small delays compound. Drag the sliders.

> **Interactive demo: Animation Cost.** Open https://critly.vercel.app/novelty-budget to try it.

A 300ms transition you see 200 times a day costs about six hours a year. That
is a lot of waiting to spend on something you stopped noticing in week one.

### Novelty taxes learning too

New interaction patterns cost more than new visuals, because people have to
learn them before they can use them. Rauno calls this the novelty tax, and
points to Arc: a browser its fans loved, that most people found too much to
learn.

None of this means "no delight", or a plain look. It means the frequent moments
never make you wait, so the rare loud one has something to stand against. A
bold palette or a distinctive typeface costs nobody any time.

### Resources

- [Novelty](https://rauno.me/craft/novelty): Rauno Freiberg on the 90% familiar, 10% novel split, and the novelty tax.
- [Family Values](https://benji.org/family-values): Benji Taylor on the Delight-Impact Curve and where Family puts its most expressive moments.
- [You don't need animations](https://emilkowal.ski/ui/you-dont-need-animations): Emil Kowalski on frequency of use, and why Raycast opens with no animation at all.
- [Invisible Details of Interaction Design](https://rauno.me/craft/interaction-design): Where Rauno first wrote about how frequency wears novelty down.
- [Semantic satiation](https://en.wikipedia.org/wiki/Semantic_satiation): The effect where repetition drains a word of its meaning.


## Taste Pass

> Squint, count the boxes, find the one thing.

- Section: Craft
- URL: https://critly.vercel.app/taste-pass
- Published: 2026-10-12
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/craft/taste-pass.mdx

A screen can pass every rule and still feel off. Every group sits in its own
box, the text starts in five slightly different places, and two buttons shout
at once. No lint fails it. A designer spots it in a few seconds, with three
habits.

**Before you call a screen done, squint at it: the first thing the eye lands on should be what the screen is for, and every box and edge should be doing grouping work.**

> **Interactive demo: Taste Pass.** Open https://critly.vercel.app/taste-pass to try it.

Both versions show the same plan, the same numbers and the same two actions.
Turn on each lens, then switch versions. The counts and the outlines come from
`critly taste`, measured live on the screen above.

### Squint

Painters squint to lose the detail and see the big shapes. On a screen,
blurring does the same. Blur a screenshot until you can't read the body text:
6px is enough at desktop size, and Nielsen Norman Group blurs at 5 and 10.
What's left is roughly what people take in first, since we see the coarse
layout before the details.

Ask two questions of the blurred screen. Do the groups still read as groups?
And is the darkest or most colorful shape the thing that matters? In the
draft, the boxes turn into stacked outlines and the two buttons are the same
dark weight. After the pass, one shape is left.

### Count the boxes

Every border, ring, shadow and tinted background draws one more edge. Count
them, and count how deep they nest. A box in a box in a box is the usual
mistake: each component brought its own frame, and nobody took any away.

Group with space first, then with one background tone, and keep lines for
where space can't do it. That is what [whitespace](https://critly.vercel.app/whitespace) and
[edges and elevation](https://critly.vercel.app/edges-and-elevation) are about. There's no right
number of boxes. For each one, ask what it groups. If space already does that
job, the box is one more edge to read for nothing. In a study of 450 sites
seen for half a second, the amount of text and the number of separate text and
image groups best predicted how complex a page looked, and the most complex
pages were liked least. That study counted content groups, not borders. A box
adds to the load when it splits content into one more group, and helps when it
holds a real group together.

### Count the edges

Then count where things start. Each distinct left edge is a line the eye has
to find. Near misses come first: two edges 2 to 8px apart look like a mistake,
because they usually are. The draft insets its buttons 4px past the text above
them. See [alignment](https://critly.vercel.app/alignment) for lining things up.

### Find the one thing

Say in a few words what the screen is for. Then check that it's the heaviest
shape when you squint. If two things weigh about the same, nothing leads, and
the fix is to make one clearly win. Quieting the other is usually the cheaper
move, since making the lead louder tends to raise the whole screen, but either
works if the lead ends up obvious (see [visual hierarchy](https://critly.vercel.app/visual-hierarchy)). Buttons follow the same rule: one solid
button per area, as Atlassian puts it, and at most one or two per view, as
Apple does.

### Run it on the real screen

`critly taste` opens each page at phone and desktop width and runs the pass on
the first screen. For each screen it writes a squint image and an overlay with
the boxes, edges and lead marked, then lists what to look at. Each finding links
the concept behind it.

**Terminal**

```bash
npx @kausthubh/critly taste http://localhost:3000
```

**Browser tool**

```js
// Paste taste.js from @kausthubh/critly (or the critly-audit skill), then:
const report = await window.__critlyTaste();
window.__critlyTaste.overlay(report); // boxes, edges and lead on the page
window.__critlyTaste.squint(true);    // blur the page for your own screenshot
```

```text
http://localhost:3000/settings/billing · 1440x900

  squint  .critly/taste/settings-billing-1440.squint.png
  lead    button "Add seats" leads, only just, 1.44× over button "Upgrade plan"
  boxes   4 (4 border), 0 divider lines, nested 3 deep
  edges   6 left edges (3 for text), 1 near miss
  overlay .critly/taste/settings-billing-1440.taste.png
  look    2 solid buttons in one group (button "Add seats", button "Upgrade plan"). Keep the one that does the main job solid, and make the others secondary or plain.
          https://critly.vercel.app/visual-hierarchy
  look    A box in a box in a box (3 deep): section.panel > div.card > div.row. Let the inner group sit on its parent's surface and separate it with space.
          https://critly.vercel.app/whitespace

critly taste: 5 things to look at · 2 screens · images in .critly/taste · exit 0
```

It never fails a page. The [check](https://critly.vercel.app/check) fails what can be measured as
wrong; the taste pass points your eyes at what needs judging. Its numbers are
starting points. One solid button per area and the 6px blur come from the
sources below. The rest are ours: a lead under 1.2× its runner-up counts as a
tie, under 1.5× as weak, and edges 2 to 8px apart as a near miss.

### What it can't tell you

It can find the heaviest shape, but not whether that's the right one. That
depends on what the screen is for, which only you and the people using it
know. It also sees one screen in one state, so open the menu, fill the form and
run it again. Then look at the images yourself. Taste gets better with
[reps](https://critly.vercel.app/how-to-get-references#train-your-eye), and this is one.

### Resources

- [Visual hierarchy in UX](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/): Nielsen Norman Group on the blur test, with one screen blurred at 5, 10 and 20px, and why when everything is contrasted nothing stands out.
- [The squint test](https://www.nngroup.com/videos/squint-test/): A two-minute video from Nielsen Norman Group on squinting to find what catches attention first.
- [Refactoring UI](https://www.refactoringui.com/): Adam Wathan and Steve Schoger on using fewer borders, and grouping with space, background color and shadow instead.
- [Avoiding clutter](https://docs.appian.com/suite/help/25.1/sail/ux-avoiding-clutter.html): Appian's design system on why a card inside a card adds clutter instead of structure.
- [Predicting users' first impressions of website aesthetics](https://kgajos.seas.harvard.edu/papers/reinecke13aesthetics.pdf): Reinecke and colleagues on 450 sites seen for half a second each. The amount of text and the number of text and image groups predicted how complex a page looked, and the most complex pages were liked least.
- [Button usage](https://atlassian.design/components/button/usage): Atlassian's rule of one primary button per page or area.
- [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons): Apple's guidelines, which keep prominent buttons to one or two per view.


## Timelessness

> Surface ages fast. Structure doesn't.

- Section: Craft
- URL: https://critly.vercel.app/timelessness
- Published: 2026-07-16
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/craft/timelessness.mdx

You can carbon date an interface. Stitched leather means 2011. Long shadows
mean 2014. Frosted glass means 2021. Every look that arrives as a wave leaves
as one.

Here is one button wearing four eras. The shape, size and label never change.

> **Interactive demo: Surface Eras.** Open https://critly.vercel.app/timelessness to try it.

Only the surface moves, and the surface is what gives the date away.
**Surface ages fast. Structure ages slowly, so get the structure right and pick the surface on purpose, for this brand and this moment.**

### Long-lasting

One of Dieter Rams's
[ten principles](https://www.vitsoe.com/us/about/good-design) is that good
design is long-lasting, and his definition is blunt: "It avoids being
fashionable and therefore never appears antiquated." The shelving system he
designed for Vitsœ in 1960 is still sold today.

Paul Graham [makes the same point](https://paulgraham.com/taste.html) from the
other side. Fashions change by definition, so anything that still looks good
far in the future must be getting its appeal from merit. Shu Ding
[puts it](https://shud.in/thoughts/good-design) as wanting to "disentangle
time" from his design process.

### What ages well

**Structure.** Hierarchy, spacing, alignment and rhythm read the same in any
decade. Switch the surface and watch which card survives.

> **Interactive demo: Structure Eras.** Open https://critly.vercel.app/timelessness to try it.

A dated surface makes the right card look old. It never makes it hard to read.
The left card is hard to read in every era, including this one.

**Function.** Choices with a reason behind them, like a visible focus ring or
a hit area that fits a fingertip, don't date, because the reason doesn't.

**Restraint.** Every effect is one more thing that can date, so the fewer you
stack, the slower the whole ages. That isn't the same as monochrome. A plain,
type-led look is a surface too, and it comes and goes in waves like any other.

### Not a ban on style

Timelessness isn't beige. It is one question, asked before adopting anything:
would this still make sense if the trend around it vanished tomorrow?

A trend is a good reason to examine a technique. On its own it isn't a reason
to use one. If it fits the brand and passes that question, use it, and expect
to refresh the surface in a few years.

### Resources

- [Dieter Rams, ten principles for good design](https://www.vitsoe.com/us/about/good-design): The list itself, from the company that still makes the shelving he designed in 1960.
- [Taste for Makers](https://paulgraham.com/taste.html): Paul Graham on why aiming at timelessness is a way to escape the grip of fashion.
- [Good Design](https://shud.in/thoughts/good-design): Shu Ding on trends as a moving target, and taking time out of the design process.
- [On Dynamic Island](https://shud.in/thoughts/on-dynamic-island): Shu Ding on why a clever, flashy compromise is still not built to last.


## Product Feel

> Decide the feel before the numbers.

- Section: Craft
- URL: https://critly.vercel.app/product-feel
- Published: 2026-10-03
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/craft/product-feel.mdx

Ask for a task app, a banking app and a habit tracker, and you often get the
same app three times: 16px padding, 8px corners, a 200ms fade on everything.
Each value is defensible. Together they don't feel like anything, because
nobody decided what the product should feel like before picking them.

AI agents make this worse. They usually know what the product does, but not
how it should feel, so they reach for the average.

**How often and in what state of mind people use it decides the feel: density and pace. What the brand is decides its identity. Make both decisions, then let them pick the numbers.**

Same tasks, three feels. Tick a task, add one, then switch.

> **Interactive demo: Product Feel.** Open https://critly.vercel.app/product-feel to try it.

None of the three is wrong. What makes each one work is that every value in
it came from the same decision, so they agree with each other.

### Three dials

Most of a feel comes down to three dials. Set them first and the values
mostly follow.

**Density: compact or comfortable.** How often and how long people use the
screen sets this one, as [density](https://critly.vercel.app/density) explains. Radius tends to
follow: 6px reads precise, 16px reads soft.

**Pace: instant or animated.** Frequency sets this one, as with
[hover restraint](https://critly.vercel.app/hover-restraint). The tool answers in 150ms with a strong
ease-out, calm takes 300ms on a gentler [easing](https://critly.vercel.app/easings), and playful uses
a spring that overshoots.

**Tone: quiet or expressive.** How much the interface performs while you
use it. Quiet stays out of the way: no sound, no celebration, nothing that
holds up the next action. Expressive reacts, with springs, a sound or a moment
when you finish something. Even then, keep the loudest moments for the rare
actions. That is the [novelty budget](https://critly.vercel.app/novelty-budget).

None of the three dials picks a palette or a typeface. That is identity: the
type, color, imagery, shapes and voice that say what the brand is. It is a
separate decision, and a quiet tool can have a strong one. See
[how to get references](https://critly.vercel.app/how-to-get-references) for where it comes from.

### Archetypes

**A tool people keep open all day**, like an issue tracker or a launcher:
compact, instant, quiet. Emil Kowalski
[uses Raycast](https://emilkowal.ski/ui/you-dont-need-animations) hundreds of
times a day, and points out that it opens with no animation at all.

**A calm app you visit a few times a day**, like a bank, a journal or a
reader: comfortable, unhurried, quiet. Trust matters more than speed.

**A playful app you choose to open**, like a habit tracker or a language
course: comfortable, springy, expressive. Delight is part of the job.

These describe how each one behaves, not how it looks. A quiet bank can still
have a bold color and its own typeface.

### Mismatch

A bland app is forgettable. A mismatched one feels broken. Here is a dense
table, the kind you scan fifty times a day, wearing the playful feel. Sort
it, pick a few rows, then match it.

> **Interactive demo: Feel Mismatch.** Open https://critly.vercel.app/product-feel to try it.

Every animation in the mismatched version would be fine in a habit tracker.
Here, each sort makes you wait about a second for numbers you wanted to read
now.

### Before you design

Answer these first, and put them in the prompt if an agent is building it:

- Who uses it, and are they experts or first-timers?
- How often: all day, daily, or a few times a year?
- In what state of mind: focused, rushed, relaxed, anxious?
- What should it feel like, in three words?
- What is the brand, and what should make it recognizable?

"A pro tool used all day: compact, instant, quiet" changes more values than
any list of values would.

### Resources

- [You don't need animations](https://emilkowal.ski/ui/you-dont-need-animations): Emil Kowalski on letting purpose and frequency decide whether something animates at all.
- [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui): Linear's team on testing everything from very condensed to spacious, and details you only feel after a few minutes.
- [The Four Dimensions of Tone of Voice](https://www.nngroup.com/articles/tone-of-voice-dimensions/): NN/g's dials for writing tone, a useful model for naming the feel of the rest of the interface.
- [Family Values](https://benji.org/family-values): Benji Taylor on simplicity, fluidity and delight as the principles behind Family, an intentionally expressive product.


## Design Tokens

> Name the role, not the value.

- Section: Craft
- URL: https://critly.vercel.app/design-tokens
- Published: 2026-10-03
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/craft/design-tokens.mdx

A product makes the same few decisions hundreds of times: which blue, how
round, how quiet the secondary text is. Write the answer into each component
and changing it means finding every copy. You never find every copy.

**Name the role, not the value, and let components use only the names.**

Both cards started out identical. Pick a new accent, or drag the radius.

> **Interactive demo: Design Tokens.** Open https://critly.vercel.app/design-tokens to try it.

The hardcoded card had its blue in four places, written three ways:
`#2563eb`, `#2563EB` and `rgb(37 99 235)`. A find-and-replace caught the
button. The token card asks for `--accent` everywhere, so one edit reaches all
four, and the same goes for `--radius-control`.

### Roles, not values

`--gray-100` and `--blue-600` say what a value is. `--surface-sunken`,
`--text-muted` and `--radius-control` say what it is for, so the value can
change without the name becoming a lie. Switch the theme.

> **Interactive demo: Token Roles.** Open https://critly.vercel.app/design-tokens to try it.

`--gray-100` can't turn dark, so dark mode needs an override in every
component, and the ones nobody wrote stay bright. The roles just point at new
values. The [product feel](https://critly.vercel.app/product-feel) demo works the same way: three
feels are three sets of values for the same roles.

A raw palette is fine as the layer underneath. Components only ever see the
roles.

### A few per category

Tokens help for the same reason a [spacing scale](https://critly.vercel.app/spacing-scale) does: they
cut choices. Each category needs a handful, not dozens.

- Surface: `surface`, `surface-raised`, `surface-sunken`.
- Text: `text`, `text-muted`, `text-faint`.
- Radius: `radius-control`, and `radius-card` as the control radius plus the
  card's padding, so [nested corners](https://critly.vercel.app/nested-border-radius) stay concentric.
- Elevation: `shadow-raised` and `shadow-overlay`, or a `border` and
  `border-strong` pair if the brand separates surfaces with lines. Either way,
  every level comes from these (see [how surfaces separate](https://critly.vercel.app/edges-and-elevation)).

When a component needs a value no token has, that is a design conversation,
not a new hex code.

### Usage

**Tailwind**

```css
/* --brand-hue is your accent's OKLCH hue (0-360): set it once in :root. */
@import "tailwindcss";

@theme {
  --color-*: initial;
  --color-surface: oklch(0.985 0 0);
  --color-surface-raised: oklch(1 0 0);
  --color-fg: oklch(0.205 0 0);
  --color-fg-muted: oklch(0.556 0 0);
  --color-accent: oklch(0.546 0.215 var(--brand-hue));
  --radius-control: 8px;
  --radius-card: calc(var(--radius-control) + 8px);
}

.dark {
  --color-surface: oklch(0.17 0 0);
  --color-surface-raised: oklch(0.205 0 0);
  --color-fg: oklch(0.945 0 0);
  --color-fg-muted: oklch(0.66 0 0);
}

/* <div class="rounded-card bg-surface-raised p-2">
     <button class="rounded-control bg-accent">Save</button>
   </div> */
```

**CSS**

```css
/* --brand-hue is your accent's OKLCH hue (0-360): set it once in :root. */
:root {
  --surface: oklch(0.985 0 0);
  --surface-raised: oklch(1 0 0);
  --text: oklch(0.205 0 0);
  --text-muted: oklch(0.556 0 0);
  --accent: oklch(0.546 0.215 var(--brand-hue));
  --radius-control: 8px;
  --radius-card: calc(var(--radius-control) + 8px);
}

.dark {
  --surface: oklch(0.17 0 0);
  --surface-raised: oklch(0.205 0 0);
  --text: oklch(0.945 0 0);
  --text-muted: oklch(0.66 0 0);
}

.card {
  padding: 8px;
  border-radius: var(--radius-card);
  background: var(--surface-raised);
}

.button {
  border-radius: var(--radius-control);
  background: var(--accent);
}
```

In Tailwind v4 the namespace decides the class: `--color-*` makes `bg-`,
`text-` and `border-` utilities, `--radius-*` makes `rounded-*`. `--text-*` is
already taken by font sizes, which is why the text roles here are `fg` and
`fg-muted` (`text-fg-muted`). `--color-*: initial` removes the default
palette, so a stray `bg-blue-600` generates nothing instead of quietly
drifting.

### Resources

- [Tailwind theme variables](https://tailwindcss.com/docs/theme): How theme variables turn into utilities, which namespace makes which class, and how to reset one.
- [Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties): MDN on declaring, inheriting and overriding the variables every token system is built on.
- [Primer token names](https://primer.style/product/primitives/token-names/): GitHub's naming convention, which separates base values from the functional tokens components use.
- [Design Tokens Format Module](https://www.designtokens.org/tr/2025.10/format/): The W3C community group's format for moving tokens between design tools and code.
