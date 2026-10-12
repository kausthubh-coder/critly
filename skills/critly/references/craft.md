# Craft

## Performance Is Design

> How fast it feels is a design choice.

- Section: Craft
- URL: https://critly.vercel.app/performance-is-design
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/craft/performance-is-design.mdx

Two apps can fetch the same data in the same time, and one will still feel
faster. The difference is what each one shows you while you wait.

**What you show during a wait decides how long it feels.** That makes
waiting a design problem, and usually a cheaper one to fix than the network.

Press load. Both cards take the same 1.2 seconds.

> **Interactive demo: Perceived Performance.** Open https://critly.vercel.app/performance-is-design to try it.

The spinner says "please wait". The skeleton shows the shape of what is
coming, so your eye already has somewhere to go. Same wait, and the second one
feels shorter.

### Match the wait

Jakob Nielsen's
[response time limits](https://www.nngroup.com/articles/response-times-3-important-limits/)
are still the best guide:

- Under 100ms feels instant. Just show the result.
- Under 1 second, people notice the delay but keep their train of thought. Show nothing, and hold the space so the layout does not jump.
- Past 1 second, show that something is happening, with a skeleton or a spinner.
- Past 10 seconds, show progress and an estimate.

The second row is the one people get wrong. A skeleton that lives for 300ms is
not reassurance. It is a flash.

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
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/craft/how-to-get-references.mdx

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

### Resources

- [Designing Depth](https://rauno.me/craft/depth): Rauno Freiberg takes "dirtying the frame" from film and turns it into blurred backdrops, layering and choreography.
- [Contrasting Aesthetics](https://rauno.me/craft/contrasting-aesthetics): Why novelty is usually found where unrelated disciplines and styles meet.
- [Creative Output](https://paco.me/writing/creative-output): Paco Coursey on whether work built from other people's ideas still counts as your own.
- [The Best Things](https://shud.in/thoughts/the-best-things): Shu Ding's list of favourite work, from Kurosawa to Borges, with almost no software in it.
- [Are.na](https://www.are.na): A quiet place to collect references without an algorithm deciding what you see next.


## Novelty Budget

> Save delight for the rare moments.

- Section: Craft
- URL: https://critly.vercel.app/novelty-budget
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/craft/novelty-budget.mdx

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

**The rarer the moment, the more expressive it can be.** Benji Taylor calls
this the [Delight-Impact Curve](https://benji.org/family-values): the potential
for delight goes up as the frequency of use goes down.

- Hovering, switching tabs, checking a box. These happen constantly. Spend nothing here.
- Opening a dialog, sending a message. Occasional. A short, quiet transition is plenty.
- Finishing onboarding, clearing your inbox, a yearly recap. Rare. This is where the budget goes.

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

None of this means "no delight". It means a calm baseline, so the one loud
moment has something to stand against.

### Resources

- [Novelty](https://rauno.me/craft/novelty): Rauno Freiberg on the 90% familiar, 10% novel split, and the novelty tax.
- [Family Values](https://benji.org/family-values): Benji Taylor on the Delight-Impact Curve and where Family puts its most expressive moments.
- [You don't need animations](https://emilkowal.ski/ui/you-dont-need-animations): Emil Kowalski on frequency of use, and why Raycast opens with no animation at all.
- [Invisible Details of Interaction Design](https://rauno.me/craft/interaction-design): Where Rauno first wrote about how frequency wears novelty down.
- [Semantic satiation](https://en.wikipedia.org/wiki/Semantic_satiation): The effect where repetition drains a word of its meaning.


## Taste Is Trained

> Taste is a skill, and it takes reps.

- Section: Craft
- URL: https://critly.vercel.app/taste-is-trained
- Published: 2026-07-16
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/craft/taste-is-trained.mdx

Taste gets talked about like a gift. Some people have the eye, and the rest
of us install a component library. It is a comfortable story, because it
excuses not practicing.

Nobody's sense of whether an easing is right came pre-installed. The people
we call tasteful have noticed more things, more carefully, for longer.
**Taste is a skill, and it takes reps.**

One of these cards has three small mistakes. Click anything that looks off,
then reveal.

> **Interactive demo: Spot The Difference.** Open https://critly.vercel.app/taste-is-trained to try it.

If you found all three, good. If you found none, also good. You can only fix
what you can see, and seeing gets better with practice.

### The training loop

[Emil Kowalski](https://emilkowal.ski/ui/developing-taste) calls taste "a
trained instinct", and his recipe is to surround yourself with great work,
work out why you like it, and practice. In concrete terms:

**Use good software slowly.** Open the same menu three times. Ask what the
shadow is doing, why the exit is faster than the entrance, what the hover
state is not doing.

**Name what you notice.** "This feels nice" trains nothing. "The popover
scales from its trigger, not its center" is a rep.

**Rebuild it, then compare.** Put your copy next to the original. The gap
between them is the curriculum.

### Change one thing at a time

Judging two options side by side is far easier than judging one on its own.
Keep the component fixed and change a single variable. Press play a few times
for each pair.

> **Interactive demo: Pair Judgement.** Open https://critly.vercel.app/taste-is-trained to try it.

Once you can tell 150ms from 400ms without thinking, you have a reference
point you did not have before. Do the same for easing, origin, shadow and
spacing. Emil's [Train your judgement](https://emilkowal.ski/ui/train-your-judgement)
is a whole page of pairs like these.

### Why it matters more now

When a tool can generate a plausible interface in seconds, making one stops
being the hard part. Picking the right one out of five is the job. As Emil
puts it, AI "can write animation code. What it can't do is know what feels
right."

### Resources

- [Developing taste](https://emilkowal.ski/ui/developing-taste): Emil Kowalski on taste as a trained instinct, and the three habits that train it.
- [Train your judgement](https://emilkowal.ski/ui/train-your-judgement): Pairs of animations side by side. Pick the better one, say why, then read the breakdown.
- [The concept of taste](https://www.raphaelsalaja.com/library/the-concept-of-taste): Raphael Salaja on taste from Hume to Bourdieu, and why it is built rather than inherited.
- [Taste for Makers](https://paulgraham.com/taste.html): Paul Graham argues taste is not just preference, and lists what good design shares across fields.
- [Invisible Details of Interaction Design](https://rauno.me/craft/interaction-design): A long, patient look at the small decisions that make interfaces feel right.


## Timelessness

> Surface ages fast. Structure doesn't.

- Section: Craft
- URL: https://critly.vercel.app/timelessness
- Published: 2026-07-16
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/craft/timelessness.mdx

You can carbon date an interface. Stitched leather means 2011. Long shadows
mean 2014. Frosted glass means 2021. Every look that arrives as a wave leaves
as one.

Here is one button wearing four eras. The shape, size and label never change.

> **Interactive demo: Surface Eras.** Open https://critly.vercel.app/timelessness to try it.

Only the surface moves, and the surface is what gives the date away.
**Surface ages fast. Structure ages slowly.**

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

**Restraint.** A monochrome, type-led interface is very hard to date. That is
a big part of why terminal aesthetics keep coming back.

### Not a ban on style

Timelessness isn't beige. It is one question, asked before adopting anything:
would this still make sense if the trend around it vanished tomorrow?

A trend is a good reason to examine a technique. It is never a reason to use
one.

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
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/craft/product-feel.mdx

Ask for a task app, a banking app and a habit tracker, and you often get the
same app three times: 16px padding, 8px corners, a 200ms fade on everything.
Each value is defensible. Together they don't feel like anything, because
nobody decided what the product should feel like before picking them.

AI agents make this worse. They usually know what the product does, but not
how it should feel, so they reach for the average.

**Decide how it should feel, then let that pick the numbers.**

Same tasks, three feels. Tick a task, add one, then switch.

> **Interactive demo: Product Feel.** Open https://critly.vercel.app/product-feel to try it.

None of the three is wrong. What makes each one work is that every value in
it came from the same decision, so they agree with each other.

### Three dials

Most of a feel comes down to three dials. Set them first and the values
mostly follow.

**Density: compact or comfortable.** The tool uses 32px rows and 8px of
padding, the calm version 48px rows and 16px. Both come from the same
[spacing scale](https://critly.vercel.app/spacing-scale). Density only decides which end of it you
live at. Radius tends to follow: 6px reads precise, 16px reads soft.

**Pace: instant or animated.** Frequency sets this one, as with
[hover restraint](https://critly.vercel.app/hover-restraint). The tool answers in 150ms with a strong
ease-out, calm takes 300ms on a gentler [easing](https://critly.vercel.app/easings), and playful uses
a spring that overshoots.

**Tone: quiet or expressive.** Weight, color and sound. Quiet means 400 and
500, a neutral palette and silence. Expressive means 600, a saturated accent,
pill shapes and a sound when you finish something. Even then, keep the
loudest moments for the rare actions. That is the
[novelty budget](https://critly.vercel.app/novelty-budget).

### Archetypes

**A tool people keep open all day**, like an issue tracker or a launcher:
compact, instant, quiet. Emil Kowalski
[uses Raycast](https://emilkowal.ski/ui/you-dont-need-animations) hundreds of
times a day, and points out that it opens with no animation at all.

**A calm app you visit a few times a day**, like a bank, a journal or a
reader: comfortable, unhurried, quiet. Trust matters more than speed.

**A playful app you choose to open**, like a habit tracker or a language
course: comfortable, springy, expressive. Delight is part of the job.

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
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/craft/design-tokens.mdx

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
- Shadow: `shadow-raised` and `shadow-overlay`, layered as in
  [shadows, not borders](https://critly.vercel.app/shadows-not-borders).

When a component needs a value no token has, that is a design conversation,
not a new hex code.

### Usage

**Tailwind**

```css
@import "tailwindcss";

@theme {
  --color-*: initial;
  --color-surface: oklch(0.985 0 0);
  --color-surface-raised: oklch(1 0 0);
  --color-fg: oklch(0.205 0 0);
  --color-fg-muted: oklch(0.556 0 0);
  --color-accent: oklch(0.546 0.215 262.9);
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
:root {
  --surface: oklch(0.985 0 0);
  --surface-raised: oklch(1 0 0);
  --text: oklch(0.205 0 0);
  --text-muted: oklch(0.556 0 0);
  --accent: oklch(0.546 0.215 262.9);
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
