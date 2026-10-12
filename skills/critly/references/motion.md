# Motion

## Icon Morph

> Blur, scale and fade between icons.

- Section: Motion
- URL: https://critly.vercel.app/icon-morph
- Published: 2026-07-14
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/motion/icon-morph.mdx

When an icon changes state, like copy to check or play to pause, the default
is a hard swap. One frame shows the old icon, the next frame shows the new
one, and the eye registers a jump.

**Don't swap icons. Blur, scale and fade between them.** Click either button.

> **Interactive demo: Icon Morph.** Open https://critly.vercel.app/icon-morph to try it.

The old icon shrinks and goes out of focus while the new one grows and
sharpens. Neither shape is crisp while they overlap, so it reads as one icon
changing rather than two icons trading places. The whole move takes about
300ms.

### Tuning it

Two numbers matter: how much blur, and how small the icons get. Switch to slow
motion and drag the sliders.

> **Interactive demo: Icon Morph Tuning.** Open https://critly.vercel.app/icon-morph to try it.

At `0px` blur you see both icons at once, sharp and stacked on top of each
other. At `4px` the overlap turns into a soft blend. A start scale of `0.25`
gives the new icon somewhere to come from. At `1` it is a plain crossfade, and
at `0` the icon grows out of a single point, which looks like an effect.

Drive it with a spring that has no bounce. Icon swaps should snap into place,
not wobble.

### When the shapes are related

A hamburger and a close icon are both made of lines, so you can move the
lines instead of crossfading the icons. The top and bottom bars rotate into an
X while the middle one shrinks away.

> **Interactive demo: Hamburger Morph.** Open https://critly.vercel.app/icon-morph to try it.

This only pays off when the shapes really are related. Turning a copy icon
into a check would mean animating path data, and the blur crossfade gets you
most of the effect for a fraction of the work.

### Usage

**Tailwind**

```tsx
<button data-copied={copied} className="group grid size-10 place-items-center">
  <CopyIcon className="col-start-1 row-start-1 transition-[opacity,scale,filter] duration-300 ease-out group-data-[copied=true]:scale-25 group-data-[copied=true]:opacity-0 group-data-[copied=true]:blur-xs" />
  <CheckIcon className="col-start-1 row-start-1 scale-25 opacity-0 blur-xs transition-[opacity,scale,filter] duration-300 ease-out group-data-[copied=true]:scale-100 group-data-[copied=true]:opacity-100 group-data-[copied=true]:blur-none" />
</button>
```

**Motion**

```tsx
import { AnimatePresence, motion } from "motion/react";

<span className="relative inline-flex">
  <AnimatePresence mode="popLayout" initial={false}>
    <motion.span
      key={copied ? "check" : "copy"}
      initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </motion.span>
  </AnimatePresence>
</span>
```

In the Motion version, `mode="popLayout"` takes the leaving icon out of the
layout so the two overlap instead of stacking, which is why the wrapper is
`relative`. `initial={false}` skips the animation on first render, when there
is nothing to morph from. The copy buttons in this site's header use exactly
this component.

### Resources

- [Details that make interfaces feel better](https://jakub.kr/writing/details-that-make-interfaces-feel-better): Jakub Krehel's list of small fixes, including animating icons with opacity, scale and blur.
- [7 practical animation tips](https://emilkowal.ski/ui/7-practical-animation-tips): Emil Kowalski's short rules for interface motion, ending with using blur when nothing else works.
- [AnimatePresence](https://motion.dev/docs/react-animate-presence): The Motion component that keeps an element around long enough to animate it out.
- [Spring transitions](https://motion.dev/docs/react-transitions#spring): The duration and bounce options used in the recipe below.


## Button Press

> Scale down on press so it feels real.

- Section: Motion
- URL: https://critly.vercel.app/button-press
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/motion/button-press.mdx

A real button moves when you push it. A button on screen can borrow that with
one rule: **scale it down a little while it is pressed.** It tells you the
click landed before anything else has happened.

Press and hold both buttons.

> **Interactive demo: Button Press.** Open https://critly.vercel.app/button-press to try it.

The right one shrinks to `0.97` while your finger is down and comes back when
you let go. On a 120px button that is less than 2px per edge. You feel it more
than you see it, which is exactly what you want from press feedback. Every
button on this site does this.

### Finding the amount

Two numbers matter: how far the button shrinks and how quickly it gets there.
Drag the sliders and keep pressing.

> **Interactive demo: Press Amount.** Open https://critly.vercel.app/button-press to try it.

Around `0.97` the press feels physical. Below about `0.92` it turns into an
effect, and you notice the animation instead of the click. Keep the duration
near `100ms`. A quick click is over in about that long, so at 300ms the
button is still shrinking when you let go and never seems to land.

Scale runs on the compositor, so the press costs nothing, and the label and
icon shrink with the button for free.

### Not just buttons

Anything you can press can do the same: cards, tiles, chips. Toggle the
feedback and press the tiles.

> **Interactive demo: Press Everywhere.** Open https://critly.vercel.app/button-press to try it.

Larger surfaces want less. At `0.97` a 600px card pulls each edge in by 9px,
which starts to look like a zoom. Try `0.98` or `0.99` on anything wider than
a tile.

### Usage

**Tailwind**

```html
<button class="transition-transform duration-100 ease-out active:scale-[0.97]">
  Save changes
</button>
```

**CSS**

```css
.button {
  transition: transform 100ms ease-out;
}

.button:active {
  transform: scale(0.97);
}
```

Transition `transform` only, not `all`. A button usually changes color on
hover too, and you don't want the press timing to leak into that.

### Resources

- [7 practical animation tips](https://emilkowal.ski/ui/7-practical-animation-tips): Emil Kowalski's short list of rules for interface motion, starting with a 0.97 scale on press.
- [Great animations](https://emilkowal.ski/ui/great-animations): Why speed and purpose matter more than how much something moves.
- [The :active pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:active): When the browser considers an element pressed.
- [Animations guide](https://web.dev/articles/animations-guide): Why transform and opacity are the cheapest properties to animate.


## Easings

> Ease-out for anything the user triggers.

- Section: Motion
- URL: https://critly.vercel.app/easings
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/motion/easings.mdx

An **easing** is the speed profile of an animation: how fast it starts and how
it settles. Duration says how long a menu takes to open. Easing decides
whether it opened for you or at you.

Both menus below take 250ms. Open them.

> **Interactive demo: Easings.** Open https://critly.vercel.app/easings to try it.

The left one eases in. It starts slow and reaches full speed at the very end,
so the menu hesitates, then slams into place. The right one eases out. It
starts fast and slows as it lands, the way most physical things come to rest.

**Use ease-out for anything that appears because the user did something.**
They clicked, so the interface should move at once and then settle. Ease-in
has one good use: things that are leaving, where nobody needs to watch them
settle. [Exit animations](https://critly.vercel.app/exit-animations) covers that.

### Reading a curve

Time runs left to right and progress runs bottom to top. The dot and the ball
share one clock, slowed down to one second so you can follow them.

> **Interactive demo: Easing Curve.** Open https://critly.vercel.app/easings to try it.

Linear is a straight diagonal: the same speed the whole way, which reads as
mechanical. Ease-in bends down, ease-out bends up. In-out does both, and suits
something already on screen that moves to a new spot, rather than something
appearing.

### Stronger than the defaults

The browser's `ease-out` is `cubic-bezier(0, 0, 0.58, 1)`, and it is too
gentle. This site uses `cubic-bezier(0.23, 1, 0.32, 1)` instead, saved as
`--ease-snappy`. Scrub through the same 250ms.

> **Interactive demo: Strong Easing.** Open https://critly.vercel.app/easings to try it.

At 60ms, `ease-out` has covered 36% of the distance and `ease-snappy` has
covered 76%. Snappy is 90% of the way there at 90ms. Ease-out needs 185ms to
reach the same point. The duration is identical, but snappy does almost all
of its work in the first third and spends the rest settling, so it feels
twice as fast.

For a little overshoot, CSS can fake a spring with `linear()`, a list of
points the browser joins with straight lines. The site's `--ease-spring`
overshoots by 16% before it settles. Pick two or three curves like these and
use them everywhere. Consistent easing does more for a product than any single
animation.

### Usage

**Tailwind**

```css
@theme {
  --ease-snappy: cubic-bezier(0.23, 1, 0.32, 1);
}

/* Then: class="duration-250 ease-snappy" */
```

**CSS**

```css
:root {
  --ease-snappy: cubic-bezier(0.23, 1, 0.32, 1);
}

.menu {
  transition:
    opacity 250ms var(--ease-snappy),
    transform 250ms var(--ease-snappy);
}
```

Tailwind's own `ease-out` class is not the CSS keyword. It is
`cubic-bezier(0, 0, 0.2, 1)`, which is already stronger and reaches 90% at
150ms of a 250ms animation. Snappy still gets there 60ms sooner, which is why
it gets its own name.

### Resources

- [Great animations](https://emilkowal.ski/ui/great-animations): Emil Kowalski on why ease-out is the right curve for most interface motion.
- [7 practical animation tips](https://emilkowal.ski/ui/7-practical-animation-tips): Short rules for interface motion, including why the built-in curves are not strong enough.
- [Easing functions cheat sheet](https://easings.net): Every common curve, drawn out, with the cubic-bezier values ready to copy.
- [The easing-function type](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function): The full CSS syntax, including cubic-bezier(), steps() and linear().
- [Linear easing generator](https://linear-easing-generator.netlify.app/): Jake Archibald's tool for turning a spring or any JavaScript easing into CSS linear().


## Springs

> Tune motion by feel, then convert it.

- Section: Motion
- URL: https://critly.vercel.app/springs
- Published: 2026-10-08
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/motion/springs.mdx

An [easing](https://critly.vercel.app/easings) bends a fixed amount of time. A **spring** has no clock.
It pulls a value toward its target, and the pull and the friction decide how
long it takes. That's why springs handle interruptions well, and why their
raw settings (stiffness, damping, mass) are almost impossible to tune by eye.

Apple's fix was to describe a spring with two numbers people can feel:
**duration**, how long it takes to look finished, and **bounce**, how far it
overshoots. Change them and press play.

> **Interactive demo: Spring Tuner.** Open https://critly.vercel.app/springs to try it.

At bounce 0 the spring is critically damped. It's the fastest way to arrive
without ever passing the target. The overshoot climbs slowly at first, then
fast:

- Bounce 0.15 overshoots by 0.6%, about 2px on a 300px move. Nobody sees it.
- Bounce 0.3 overshoots by 4.6%. Clearly bouncy.
- Bounce 0.4 overshoots by 9.5%, and Apple advises caution above it.

Notice the settle time too. A 0.5s spring takes about 740ms to come fully to
rest, so never wait for a spring to finish before letting people act.

### Bounce has to be earned

Both sheets open from the same click. Open and close them a few times.

> **Interactive demo: Spring Bounce.** Open https://critly.vercel.app/springs to try it.

The bouncy one wobbles. Nothing threw it, so the overshoot reads as sloppy,
not physical. Apple Music opens Now Playing on a tap with no bounce, and
dismisses it after a swipe with a bounce of 0.2. The swipe gave the sheet
energy, and the bounce gives it back.

**Start every spring at bounce 0. Add bounce only when a gesture gave the
motion momentum.**

Bounce also never belongs on an exit, and never on opacity or color. Opacity
can't go past 1, so the overshoot becomes a flat pause before the fade ends.
Give those a short tween, as Material does with its "effects" springs, which
are always critically damped.

### A few springs, everywhere

Pick three or four springs and name them, the same way you name
[easings](https://critly.vercel.app/easings): fast (0.25s, bounce 0) for small controls, default (0.4s,
bounce 0) for panels and sheets, and one playful spring (0.5s, bounce 0.3)
for celebrations and thrown things. A product with a dozen hand-tuned springs
feels like a dozen products.

### Usage

**Motion**

```tsx
import { motion } from "motion/react";

// Apple's duration + bounce, converted to physics (mass 1):
// stiffness = (2π / duration)², damping = 4π × (1 - bounce) / duration
function spring(duration: number, bounce = 0) {
  return {
    type: "spring" as const,
    stiffness: (2 * Math.PI / duration) ** 2,
    damping: (4 * Math.PI * (1 - bounce)) / duration,
  };
}

<motion.div
  animate={{ y: open ? 0 : "100%", opacity: open ? 1 : 0 }}
  transition={{
    default: spring(0.4),
    opacity: { duration: 0.15, ease: "easeOut" },
  }}
/>
```

**CSS**

```css
:root {
  /* A 0.3s spring with no bounce, sampled into linear().
     The duration is the full settle time, not the visual one. */
  --spring-smooth: linear(0, 0.1061, 0.3018, 0.4922, 0.6466, 0.7613,
    0.8422, 0.8975, 0.9342, 0.9582, 0.9737, 0.9836, 0.9898, 0.9937,
    0.9961, 0.9976, 0.9985, 0.9991, 1, 1);
}

.sheet {
  transition:
    translate 600ms var(--spring-smooth),
    opacity 150ms ease-out;
}
```

Motion also accepts `duration` (or `visualDuration`) and `bounce` directly,
but there are two catches. Since version 12.34.3, those springs ignore the
velocity they inherit, so a drag release or an interruption starts from
zero. And Motion's `visualDuration` runs 1.2 times faster than Apple's
duration, so `visualDuration: 0.42` matches SwiftUI's 0.5. The physics form
above has neither problem.

CSS `linear()` can draw a spring's shape in every browser, but it's a
recording: a fixed duration, no velocity when interrupted, and in Safari
it's not run on the [compositor](https://critly.vercel.app/smooth-animation). It's still a good fit for
hover and open/close motion, where reversing from the current position is
enough. Use JavaScript springs where velocity matters, like drags and flicks.

JavaScript springs run on the main thread, so they stutter while the page is
busy, for example during a route change. To get both, compute the spring's
positions once in JavaScript and play them as `transform` keyframes with the
Web Animations API, which the browser can run off the main thread. On
interruption, read the current position and velocity and compute a new set.

If the brand or the person asks for overshoot, a small bounce (0.2 to 0.25)
on an open is fine. Keep closes and opacity flat.

### Resources

- [Animate with springs](https://developer.apple.com/videos/play/wwdc2023/10158/): Apple's WWDC23 session on describing springs by duration and bounce, and when bounce belongs.
- [A friendly introduction to spring physics](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/): Josh Comeau on mass, tension and friction, with springs you can pull on.
- [Effortless UI spring animations](https://www.kvin.me/posts/effortless-ui-spring-animations): Kevin Grajeda's guide to perceptual springs, with the corrected conversion formulas.
- [Transitions in Motion](https://motion.dev/docs/react-transitions): Spring options in Motion, including stiffness, damping, visualDuration and bounce.
- [Customize animations in Compose](https://developer.android.com/develop/ui/compose/animation/customize): Android's spring constants, and why springs stay smooth when their target changes.


## Stagger

> Turn one block into a sequence.

- Section: Motion
- URL: https://critly.vercel.app/stagger
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/motion/stagger.mdx

When a list appears all at once, it reads as one block. When each row arrives
a moment after the one above, it reads as a list. **Stagger** is that small
offset between siblings.

Drag the slider. Every row fades and rises the same way. Only the gap between
them changes.

> **Interactive demo: Stagger.** Open https://critly.vercel.app/stagger to try it.

**Keep the gap between 30ms and 60ms.** That is enough for your eye to pick up
a direction, top to bottom. Past 100ms the last row is still arriving after
you have started reading the first, and the detail turns into a wait.

### Block vs sequence

The same list with and without a stagger. The animation on each row is
identical.

> **Interactive demo: Stagger Compare.** Open https://critly.vercel.app/stagger to try it.

The staggered list is not faster. It is easier to follow, because your eye
gets a starting point and a direction. The block gives you five things at
once.

### Long lists

Stagger adds up. A 60ms gap is fine on five rows and terrible on twenty, where
the last row starts 1,140ms after the first. For lists that can grow, cap the
total instead of fixing the step.

> **Interactive demo: Stagger Cap.** Open https://critly.vercel.app/stagger to try it.

A good cap is about 300ms from the first row to the last. Divide that by the
number of gaps and you have your step: 33ms for ten rows. For very long lists,
stagger only the rows on screen and show the rest at once.

The rows are content, not decoration. Animate only `opacity` and `transform`
so every row holds its space from the first frame, and keep rows clickable
while they fade in.

### Usage

**CSS**

```css
/* <li style="--index: 0">, <li style="--index: 1">, ... */
@keyframes rise-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.list > li {
  animation: rise-in 360ms cubic-bezier(0.23, 1, 0.32, 1) both;
  animation-delay: calc(var(--index) * 40ms);
}
```

**Motion**

```tsx
import { motion, stagger } from "motion/react";

const list = {
  visible: { transition: { delayChildren: stagger(0.04) } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: [0.23, 1, 0.32, 1] },
  },
};

<motion.ul initial="hidden" animate="visible" variants={list}>
  {rows.map((row) => (
    <motion.li key={row.id} variants={item}>
      {row.title}
    </motion.li>
  ))}
</motion.ul>
```

Keep `both` in the CSS shorthand. It sets `animation-fill-mode`, which holds
each row at its first frame during the delay. Without it, rows flash at full
opacity, disappear, then fade in. It is the most common stagger bug, and you
only notice it once the delays get long.

### Resources

- [Details that make interfaces feel better](https://jakub.kr/writing/details-that-make-interfaces-feel-better): Jakub Krehel on splitting entering content into parts and staggering them.
- [Depth](https://rauno.me/craft/depth): Rauno Freiberg on choreographing elements so they don't all appear at once.
- [stagger()](https://motion.dev/docs/stagger): Motion's helper for spreading delays across children, used in the recipe below.
- [animation-delay](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay): The property behind a CSS stagger, and how negative and long delays behave.


## Interruptibility

> Animation that can change its mind.

- Section: Motion
- URL: https://critly.vercel.app/interruptibility
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/motion/interruptibility.mdx

People change their mind halfway through an animation. They open a sheet and
close it before it lands, or hit a toggle twice in a row. An
**interruptible** animation turns around from wherever it is. One that isn't
jumps to a fixed frame and starts over.

Open the sheets, then close them before they arrive. Do it a few times
quickly. Both are slowed to 600ms so you can catch them mid-flight.

> **Interactive demo: Interruptibility.** Open https://critly.vercel.app/interruptibility to try it.

The left sheet uses CSS keyframes. A keyframe animation is a fixed clip with
its own start and end, so every click restarts it and the sheet teleports.
The right sheet uses a CSS transition, which animates from the current value
to the new one. It just turns around.

**If something can be triggered again before it finishes, animate it toward a
target instead of playing a clip.**

Keyframes are still fine for one-shots that nothing interrupts, like a
spinner or a shake on a wrong password.

### Springs keep their speed

A transition fixes the jump, but it restarts its easing curve on every new
target. Reverse it at full speed and it stops dead, then ramps up again. A
spring carries its velocity into the new target, so the reversal reads as one
motion instead of two.

Toggle twice quickly and watch each dot turn around.

> **Interactive demo: Spring Velocity.** Open https://critly.vercel.app/interruptibility to try it.

For anything people flick back and forth, like a switch, a drawer or a drag
handle, a spring is the safer default.

### New targets mid-flight

Reversing is not the only interruption. In a toast stack, every new toast
gives the others a new place to be. Add a few quickly.

> **Interactive demo: Toast Stack.** Open https://critly.vercel.app/interruptibility to try it.

On the left each toast only has a keyframe entrance, so the older ones jump
to their new spots. On the right Motion's `layout` prop moves them there from
wherever they are, even if the last move hasn't finished.
[Sonner](https://emilkowal.ski/ui/building-a-toast-component) started with
keyframes and switched to transitions for exactly this reason.

### Usage

**Tailwind**

```html
<div class="translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] data-open:translate-y-0">
  ...
</div>
```

**CSS**

```css
.sheet {
  transform: translateY(100%);
  transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1);
}

.sheet[data-open] {
  transform: translateY(0);
}
```

**Motion**

```tsx
import { motion } from "motion/react";

<motion.div
  animate={{ y: open ? 0 : "100%" }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
/>
```

Watch for keyframes hiding in utility classes. The `animate-in` and
`animate-out` classes from tw-animate-css are keyframes, so a popover built
with them restarts when it is closed mid-open. To check any component, open
and close it as fast as you can ten times. If anything flashes or jumps, it
isn't interruptible yet.

### Resources

- [Building a Toast Component](https://emilkowal.ski/ui/building-a-toast-component): Emil Kowalski on moving Sonner from keyframes to transitions so toasts could be retargeted mid-flight.
- [Base UI animation handbook](https://base-ui.com/react/handbook/animation): Why Base UI recommends transitions over keyframes for anything that opens and closes.
- [Using CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions/Using_CSS_transitions): The MDN guide to transitions, the CSS tool that animates toward a target.
- [Transitions in Motion](https://motion.dev/docs/react-transitions): How physics-based springs carry the velocity of an animation that is already running.


## Momentum

> Finish the throw people started.

- Section: Motion
- URL: https://critly.vercel.app/momentum
- Published: 2026-10-08
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/motion/momentum.mdx

When you let go of something you're dragging, it's still moving. Whatever
animation takes over has to start at that speed, or there's a seam: the
object brakes to a stop the instant you let go, then starts moving again on
its own.

Throw each knob to the other end, hard.

> **Interactive demo: Velocity Handoff.** Open https://critly.vercel.app/momentum to try it.

The top knob finishes with a curve. Curves start from zero speed, so a fast
throw hits a wall at the moment of release. The bottom one finishes with a
[spring](https://critly.vercel.app/springs) that's given the release velocity, so the throw just
continues and settles.

**Hand the release velocity to the animation that finishes the gesture, and
aim for where the throw was going, not where it was let go.**

### Aim where it was going

A quick flick toward a corner is usually released closer to where it
started. Snap to the nearest corner from there and the window goes back.
Flick both windows.

> **Interactive demo: Projection.** Open https://critly.vercel.app/momentum to try it.

The right one projects the throw forward first. The dot shows where the
flick would have come to rest if it coasted like a scroll view, and the
window snaps to the corner nearest that point. Apple's projection uses
the scroll deceleration rate of 0.998 per millisecond, which works out to
about half a second of travel at the release speed: a 1000px/s flick
projects about 500px. Use 0.99 for a precise, less throwy feel, about a
tenth of a second.

### Velocity or distance

To dismiss a sheet or a toast, accept a short fast flick or a long slow
drag. Vaul dismisses a drawer at 0.4px/ms, or once it's dragged a quarter of
its height. Sonner dismisses a toast at 0.11px/ms or 45px. Requiring distance
alone makes things feel heavy.

### Give at the edges

Past a boundary, don't stop dead. Let the content follow less and less, then
spring back. The common iOS-style curve moves at 55% of the finger's speed at
first and never passes the container's own size.

> **Interactive demo: Rubber Band.** Open https://critly.vercel.app/momentum to try it.

### Usage

**Motion**

```tsx
import { animate, motion, useMotionValue } from "motion/react";

// Where a flick would come to rest (px/s in, px out).
const project = (velocity: number, rate = 0.998) =>
  ((velocity / 1000) * rate) / (1 - rate);

const x = useMotionValue(0);

<motion.div
  drag="x"
  dragMomentum={false} // the release is ours
  style={{ x }}
  onDragEnd={(_, info) => {
    const aim = x.get() + project(info.velocity.x);
    const target = aim > 160 ? 320 : 0;
    // A physics spring keeps the velocity it's given.
    animate(x, target, {
      type: "spring",
      stiffness: 247,
      damping: 31.4,
      velocity: info.velocity.x,
    });
  }}
/>
```

**Rubber band**

```ts
// How far content moves when pulled `over` px past an edge.
// `size` is the container's size; c = 0.55 is the iOS-like feel.
function rubberBand(over: number, size: number, c = 0.55) {
  return (1 - 1 / ((Math.abs(over) * c) / size + 1)) * size * Math.sign(over);
}
```

Animate x and y as two springs, each with its own velocity, so a diagonal
throw curves naturally. Pass `stiffness` and `damping`, not `duration` and
`bounce`: Motion drops the velocity of springs defined by time. Under
[reduced motion](https://critly.vercel.app/reduced-motion), keep dragging one-to-one with the finger,
and settle the release with no bounce and no long coast.

### Resources

- [Designing Fluid Interfaces](https://developer.apple.com/videos/play/wwdc2018/803/): Apple's WWDC18 talk on velocity handoff, momentum projection and rubber banding.
- [Fluid interfaces sample code](https://github.com/nathangitter/fluid-interfaces): Nathan Gitter's open-source recreation of the WWDC18 examples, including the projection function.
- [Building a drawer component](https://emilkowal.ski/ui/building-a-drawer-component): Emil Kowalski on Vaul's velocity-based dismissal and damped over-drag.
- [Drag in Motion](https://motion.dev/docs/react-drag): Drag gestures, release velocity, momentum and elastic constraints.


## Hover Restraint

> Frequent interactions should be instant.

- Section: Motion
- URL: https://critly.vercel.app/hover-restraint
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/motion/hover-restraint.mdx

Hover fires more than any other interaction. When you sweep the cursor across a nav
you can cross ten items in a second. If each one fades in, the
interface is always a few frames behind the pointer, and it reads as slow
even when nothing is.

**The more often something happens, the less
animation it can afford.**

> **Interactive demo: Hover Restraint.** Open https://critly.vercel.app/hover-restraint to try it.

The right one switches its highlight on with no transition at all. Instant
is the correct default for hover.

### Tooltips

Tooltips are one hover case where a delay helps. Without one they pop
up while you are just passing through on the way to something else.

So the first tooltip should wait, around 400ms to 700ms, and then its neighbors
should appear at once. You have already shown you want the labels, and
making you wait again for each one is frustrating.

> **Interactive demo: Hover Tooltip.** Open https://critly.vercel.app/hover-restraint to try it.

The same rule covers anything heavier that opens on hover: a preview card, an
expanding tile, a video. That isn't a hover state, it's a decision, so it
waits for the pointer to rest (about 500ms to 700ms, and only if it has
stopped moving), opens neighbors quickly once one is open, and closes after a
short grace period so the pointer can cross gaps without flicker. Don't
start it on touch screens, which have no hover.

### Keyboard actions

The same thinking applies away from the pointer.

> **Interactive demo: Keyboard Action.** Open https://critly.vercel.app/hover-restraint to try it.

Someone toggling a sidebar with a shortcut is your fastest user. They are
not looking for the panel to arrive from somewhere. They already know what
the shortcut does, and a 250ms slide is like a speeding ticket.

The line to draw is by frequency and intent, not by input device. A modal
that opens once a session can animate. A panel you flip forty times a day
should not.

Notable examples of interactions that would be worse if animated:

- [Raycast launcher](https://www.raycast.com/): Opens and closes with no transition, every time.
- [macOS Alt+Tab](https://rauno.me/craft/interaction-design): Rauno Freiberg on why the app switcher appears instantly.

### Resources

- [You don't need animations](https://emilkowal.ski/ui/you-dont-need-animations): Emil Kowalski on when animation helps and when it gets in the way, with hover as the main case.
- [7 practical animation tips](https://emilkowal.ski/ui/7-practical-animation-tips): Short, concrete rules for interface motion, including how tooltips should behave.
- [Base UI Tooltip](https://base-ui.com/react/components/tooltip): The tooltip used on this site, with the delay and instant-open behavior built in.
- [The :hover pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:hover): What counts as hover across mouse, pen and touch, and why it is unreliable on touch.


## Shared Layout

> One element moving beats two swapping.

- Section: Motion
- URL: https://critly.vercel.app/shared-layout
- Published: 2026-07-16
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/motion/shared-layout.mdx

When a tab highlight jumps from one tab to the next, your eye has to find it
again. When it slides, you never lose it. A **shared layout** animation
treats two elements in two places as one element that moves.

Click the tabs. Both rows follow the same state.

> **Interactive demo: Shared Layout.** Open https://critly.vercel.app/shared-layout to try it.

On the left the highlight disappears from one tab and appears under another.
On the right it travels, so it tells you where you are and where you came
from.

**If two elements are the same thing to the user, move one instead of
swapping two.**

In Motion you give both elements the same `layoutId`. When one unmounts and
the other mounts, Motion measures where the old one was and animates the new
one from there with a transform. This is the FLIP technique.

### From list to detail

The same idea carries further than tabs. Open a project, go back, then switch
to Shared and do it again.

> **Interactive demo: Shared Layout Detail.** Open https://critly.vercel.app/shared-layout to try it.

With a swap, the whole view is replaced and you have to re-read it to check
you landed in the right place. With a shared layout, the thumbnail and title
carry over and only the rest is new.

Keep it quick. Both demos use a spring with no bounce that settles in 300ms.

### Where it goes wrong

Shared layout scales elements to move them, and scale distorts corners and
shadows. Motion corrects `borderRadius` and `boxShadow`, but only when they
are set through `style`, not a class. Text inside a box that changes shape
can stretch, so the title above uses `layout="position"` to move without
scaling.

### Usage

**Motion**

```tsx
import { motion } from "motion/react";

{tabs.map((tab) => (
  <button key={tab} className="relative" onClick={() => setActive(tab)}>
    {tab === active && (
      <motion.span
        className="absolute inset-0 bg-white"
        layoutId="tab-indicator"
        style={{ borderRadius: 6 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0 }}
      />
    )}
    <span className="relative">{tab}</span>
  </button>
))}
```

**CSS**

```css
/* Names must be unique, so name only the clicked thumbnail, in JS:
   thumb.style.viewTransitionName = "project-thumb";
   document.startViewTransition(() => openProject(id)); */

.detail-header {
  view-transition-name: project-thumb;
}

::view-transition-group(project-thumb) {
  animation-duration: 300ms;
  animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}
```

Without React, the View Transition API does this natively. Same-document view
transitions work in Chrome, Edge, Safari and Firefox. They are not
interruptible, though: starting a new one skips the one in progress, so a
fast second click makes the morph snap to its end instead of turning around.

### Resources

- [How I Use Shared Layout Animations](https://jakub.kr/work/shared-layout-animations): Jakub Krehel on layoutId, with interactive examples of where morphs make sense.
- [Layout animations in Motion](https://motion.dev/docs/react-layout-animations): The official guide to layout and layoutId, including how to fix scale distortion.
- [FLIP Your Animations](https://aerotwist.com/blog/flip-your-animations/): Paul Lewis's original write-up of the First, Last, Invert, Play technique behind shared layout.
- [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API): The native way to morph elements between two states of the page, without a library.


## Liquid Motion

> One surface that changes shape.

- Section: Motion
- URL: https://critly.vercel.app/liquid-motion
- Published: 2026-10-08
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/motion/liquid-motion.mdx

The Dynamic Island doesn't open a window. It grows. Apple's newer controls
pop open into menus right where you tapped, and the Family wallet's tray
reshapes itself instead of swapping screens. They feel liquid because the
thing you touched is the thing that changes.

Open the share menu in both.

> **Interactive demo: Morph.** Open https://critly.vercel.app/liquid-motion to try it.

On the left a second surface fades in over the button, so your eye has to
find it. On the right the button itself becomes the menu: the corners
round off, the label slides up into the title, and the rows fade in once
the surface is moving. As Benji Taylor puts it, fly instead of teleport.

**Morph the surface the user touched instead of fading in a new one, and
close it back to where it came from.**

A few details decide whether a morph looks liquid or broken. Put the corner
radius in `style`, so Motion can correct it while the box scales. Use the
pill's real half-height, not `9999px`, or the corners stay round until the
last frame and then snap. Give text inside `layout="position"` so it moves
instead of squashing. And move focus into the menu and back, because a
morph changes nothing about what a dialog has to do.

### Pour, don't slide

A gooey filter makes nearby shapes melt together. Switch tabs and watch the
indicators.

> **Interactive demo: Gooey Tabs.** Open https://critly.vercel.app/liquid-motion to try it.

The second bar blurs two dots, one fast and one trailing, then cuts the
blur off at a sharp edge. Where the blurs overlap they add up, so the dots
grow a bridge, stretch out of one tab and pool into the next. It's a filter
redrawn on every frame, so keep it on a small layer of shapes. Never put
text through it.

### Stretch with speed

Liquid things deform when they move fast. Drag both thumbs quickly, then
past the end.

> **Interactive demo: Stretch.** Open https://critly.vercel.app/liquid-motion to try it.

The liquid thumb stretches along its motion in proportion to its speed,
capped at 1.25 times, and squashes the other way by the same factor so its
area stays the same. Past the end it gives a little instead of stopping
dead. More than about 1.25 stops looking like material and starts looking
like a cartoon.

### Spend it once

Liquid motion is loud. Use it where it explains something (where this came
from, that it's the same thing, that it can be dragged) and on actions
people don't repeat a hundred times a day. One liquid signature per screen
is plenty; see [Novelty Budget](https://critly.vercel.app/novelty-budget). Under [reduced
motion](https://critly.vercel.app/reduced-motion), turn morphs into short crossfades and remove every
stretch and wobble. Apple does the same with Liquid Glass.

### Usage

**Motion**

```tsx
import { AnimatePresence, motion } from "motion/react";

const spring = { type: "spring", stiffness: 247, damping: 28 } as const;

<AnimatePresence initial={false} mode="popLayout">
  {open ? (
    <motion.div
      key="menu"
      layoutId="share"
      style={{ borderRadius: 16 }}
      transition={spring}
    >
      <motion.h3 layoutId="share-label" layout="position">Share</motion.h3>
      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18, delay: 0.06 }}
      >
        ...
      </motion.ul>
    </motion.div>
  ) : (
    <motion.button
      key="button"
      layoutId="share"
      style={{ borderRadius: 16 }} // half of a 32px-tall button
      transition={spring}
      onClick={() => setOpen(true)}
    >
      <motion.span layoutId="share-label" layout="position">Share</motion.span>
    </motion.button>
  )}
</AnimatePresence>
```

**Gooey**

```html
<svg width="0" height="0" aria-hidden="true">
  <filter id="goo" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
    <!-- alpha × 18 − 7: blurred edges snap back to a sharp outline -->
    <feColorMatrix type="matrix"
      values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
  </filter>
</svg>

<!-- Shapes only: labels sit in a separate layer on top. -->
<div style="filter: url(#goo)">
  <span class="dot"></span>
  <span class="dot trailing"></span>
</div>
```

View Transitions can morph elements too, and they're the right tool for
moving between pages and views. For controls people poke at, prefer Motion:
starting a new view transition skips the running one instead of turning it
around, and the page can't be clicked while one plays.

### Resources

- [Family Values](https://benji.org/family-values): Benji Taylor on the Family wallet's morphing tray, "fly instead of teleport", and spending delight where it counts.
- [Layout animations in Motion](https://motion.dev/docs/react-layout-animations): layout and layoutId, scale correction for radius and shadows, and layout="position" for text.
- [The Gooey Effect](https://css-tricks.com/gooey-effect/): Lucas Bebber's original SVG filter for shapes that merge like liquid.
- [Squash and Stretch](https://www.joshwcomeau.com/animation/squash-and-stretch/): Josh Comeau on stretching with velocity while keeping the area constant.
- [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/): Apple on controls that morph as one floating plane, and turning elasticity off for Reduce Motion.


## Exit Animations

> Leave faster and quieter than you came.

- Section: Motion
- URL: https://critly.vercel.app/exit-animations
- Published: 2026-07-16
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/motion/exit-animations.mdx

The lazy exit is the entrance played backwards: same distance, same
duration, same curve. It looks tidy, but it gives a goodbye as much time as a
hello. **Something leaving deserves less ceremony than something arriving.**

Dismiss the toasts and watch them go.

> **Interactive demo: Exit Animations.** Open https://critly.vercel.app/exit-animations to try it.

Both enter the same way, rising 12px over 240ms. The left one leaves by doing
that again in reverse. The right one fades out in half the time, 120ms, with
2px of blur, no travel and an ease-in.

An entrance has a job. Something new is here, and the motion shows you where
it came from. An exit has none. The user has already moved on, and anything
that makes them watch is in the way. So exits get about half the duration and
less movement. They are also the one place ease-in fits, since the element is
speeding away and nobody needs to watch it settle.

In React, an element removed from the tree is gone before it can animate.
Motion's `AnimatePresence` keeps it mounted until its `exit` animation
finishes.

### Exits that keep layout steady

The exit people forget most is a row leaving a list. Without one, the row
vanishes and everything below it jumps up in a single frame. Delete a few
tasks on each side.

> **Interactive demo: Exit List.** Open https://critly.vercel.app/exit-animations to try it.

On the right the row collapses its height while it fades, so the rows beneath
slide up instead of teleporting. It takes 160ms, short enough that you barely
notice it, and long enough that your eye can follow the list.

### Usage

**Motion**

```tsx
import { AnimatePresence, motion } from "motion/react";

<AnimatePresence initial={false}>
  {open && (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(0px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{
        opacity: 0,
        filter: "blur(2px)",
        transition: { duration: 0.12, ease: "easeIn" },
      }}
      transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
    >
      Changes saved
    </motion.div>
  )}
</AnimatePresence>
```

**CSS**

```css
.toast {
  display: block;
  transition:
    opacity 240ms cubic-bezier(0.23, 1, 0.32, 1),
    translate 240ms cubic-bezier(0.23, 1, 0.32, 1),
    display 240ms allow-discrete;

  @starting-style {
    opacity: 0;
    translate: 0 12px;
  }
}

.toast[hidden] {
  display: none;
  opacity: 0;
  filter: blur(2px);
  transition:
    opacity 120ms ease-in,
    filter 120ms ease-in,
    display 120ms allow-discrete;
}
```

In CSS, the transition that runs is the one declared on the state you are
moving to. So the entrance timing lives on `.toast`, the exit timing lives on
`.toast[hidden]`, and `allow-discrete` holds off `display: none` until the
fade has finished.

### Resources

- [Details that make interfaces feel better](https://jakub.kr/writing/details-that-make-interfaces-feel-better): Jakub Krehel's collection of small motion decisions, including why exits should be subtler than entrances.
- [AnimatePresence](https://motion.dev/docs/react-animate-presence): How Motion keeps a removed React element mounted until its exit animation finishes.
- [@starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style): The CSS rule that gives an element something to transition from when it first appears.
- [transition-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior): How allow-discrete lets an element fade out before display none removes it.


## Scale Entrances

> Grow from the trigger, not from zero.

- Section: Motion
- URL: https://critly.vercel.app/scale-entrances
- Published: 2026-07-16
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/motion/scale-entrances.mdx

Menus, popovers and dialogs often enter with a bit of scale, so they seem to
arrive instead of switching on. But a **scale entrance** that starts at zero
looks like a cartoon zoom. One that starts at `0.95` looks like a small
settle.

Open both menus. Same duration, same easing, different starting scale.

> **Interactive demo: Scale Entrances.** Open https://critly.vercel.app/scale-entrances to try it.

The left menu spends the start of its animation as an unreadable smudge,
because the text scales with the box. The right one is readable from the
first frame. The scale is a hint of movement, not the movement itself.

**Start a scale entrance between 0.9 and 0.97, fade it in, and grow it from
the thing that opened it.**

### Grow from the trigger

By default an element scales from its center. That suits a dialog in the
middle of the screen. A menu under a button in the corner should grow out of
that corner, so it looks attached to what you clicked. The dot marks the
origin.

> **Interactive demo: Transform Origin.** Open https://critly.vercel.app/scale-entrances to try it.

Same `0.9` start, same timing. The only change is `transform-origin`.

A positioning library already knows where the trigger is. Base UI exposes it
on every anchored popup as `--transform-origin`, so one line covers every side
the menu can open on. Radix has a variable for each component, like
`--radix-dropdown-menu-content-transform-origin`.

### Find your number

Drag the slider to change where the menu starts. It is slowed to 480ms so you
can see the shape of it.

> **Interactive demo: Starting Scale.** Open https://critly.vercel.app/scale-entrances to try it.

Below `0.8` it starts to read as a zoom. Above `0.98` you may as well drop the
scale and keep the fade.

### Usage

**Tailwind**

```tsx
<Popover.Popup
  className="origin-(--transform-origin) transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]
    data-starting-style:scale-95 data-starting-style:opacity-0
    data-ending-style:scale-95 data-ending-style:opacity-0 data-ending-style:duration-100"
>
  ...
</Popover.Popup>
```

**CSS**

```css
.popup {
  transform-origin: var(--transform-origin);
  transition:
    opacity 200ms cubic-bezier(0.23, 1, 0.32, 1),
    scale 200ms cubic-bezier(0.23, 1, 0.32, 1);
}

.popup[data-starting-style],
.popup[data-ending-style] {
  opacity: 0;
  scale: 0.95;
}

.popup[data-ending-style] {
  transition-duration: 100ms;
}
```

`--transform-origin` only exists inside Base UI's anchored popups. For a
menu you place yourself, set the origin to the corner nearest the trigger,
like `origin-top-right` for a menu that opens below a right-aligned button.

### Resources

- [7 Practical Animation Tips](https://emilkowal.ski/ui/7-practical-animation-tips): Emil Kowalski's list, including why popovers should not start from scale(0) and should grow from their trigger.
- [CSS Transforms](https://emilkowal.ski/ui/css-transforms): An interactive walk through scale, translate and transform-origin.
- [Base UI animation handbook](https://base-ui.com/react/handbook/animation): The starting and ending style attributes, and the transform origin variable on anchored popups.
- [transform-origin](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin): The MDN reference for the property that decides where a scale grows from.


## Reduced Motion

> Reduce motion, keep meaning.

- Section: Motion
- URL: https://critly.vercel.app/reduced-motion
- Published: 2026-10-02
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/motion/reduced-motion.mdx

Movement on screen can make some people dizzy or sick. Sliding panels, zooms
and parallax are the usual triggers, which is why every major operating system
has a setting to reduce motion. The browser exposes it as
`prefers-reduced-motion: reduce`.

The tempting fix is to set every duration to 0. That removes the movement, but
it also removes whatever the motion was telling you. Press the button and flip
between the three.

> **Interactive demo: Reduced Motion.** Open https://critly.vercel.app/reduced-motion to try it.

**Reduced motion means less movement, not no animation.** Swap translates,
scales and parallax for a short opacity fade, and keep the feedback that shows
what changed.

### What to keep

Things traveling across the screen are the problem. A fade or a color change
doesn't move anything, so it can stay. In the reduced version the new row fades
in over 150ms and its highlight still fades out, so you can see which message
arrived. At 0ms the row just appears and the highlight is gone before it's ever
painted.

Zero also breaks code. A transition with no duration never starts, so
`transitionend` never fires, and anything waiting for it, like unmounting a
closed sheet, waits forever. If you need to flatten a transition, use 1ms.

### In React

Wrap the app in `<MotionConfig reducedMotion="user">` and every motion
component drops transform and layout animations when the setting is on, while
opacity and color keep animating. For anything else, `useReducedMotion()`
returns the preference so you can choose a different animation yourself.

### On this site

The index thumbnails stop their hover animations and cut transitions to 1ms
rather than 0. Some demos, like [icon morph](https://critly.vercel.app/icon-morph) and
[stagger](https://critly.vercel.app/stagger), keep their fade and drop the scale or the rise. Others
still drop to 0ms. A demo you press to watch, like the one above, always plays,
because watching it is the point.

### Usage

**Tailwind**

```html
<div
  class="transition-opacity duration-150 data-closed:opacity-0
    motion-safe:transition-[opacity,translate] motion-safe:duration-300
    motion-safe:data-closed:translate-y-4"
></div>
```

**React**

```tsx
import { MotionConfig, motion } from "motion/react";

<MotionConfig reducedMotion="user">
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
  />
</MotionConfig>
```

`MotionConfig` only reaches motion components. CSS transitions, keyframes and
autoplaying video in the same app still need the media query, and the fade
keeps the original duration, so shorten long ones yourself.

### Resources

- [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion): The media feature that reads the operating system's reduce motion setting, on MDN.
- [prefers-reduced-motion: Sometimes less movement is more](https://web.dev/articles/prefers-reduced-motion): Why the setting exists and how to design a calmer version instead of a blank one.
- [Understanding WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html): The success criterion on motion triggered by interaction, and what counts as essential.
- [Motion accessibility](https://motion.dev/docs/react-accessibility): How MotionConfig and useReducedMotion handle the setting in React.
- [Accessible animations in React](https://www.joshwcomeau.com/react/prefers-reduced-motion/): Josh Comeau on building the preference into components from the start.
