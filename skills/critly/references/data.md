# Data

## Living Charts

> Charts that flow instead of jump.

- Section: Data
- URL: https://critly.vercel.app/living-charts
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/data/living-charts.mdx

Live data arrives in steps. A server sends a number every second or so, and
if the chart draws each one the moment it lands, the whole line jumps.

A **living chart** never teleports. Each new value eases in over a few
hundred milliseconds, so the chart moves the way the data feels like it
should.

> **Interactive demo: Living Charts.** Open https://critly.vercel.app/living-charts to try it.

Both cards get the same value every 1.5 seconds. The left one redraws on
the spot: every point hops one slot to the left and the counter flips to a
new number. The right one spends `900ms` on the same change with an
ease-out curve. The line slides left, the new point comes in from the
right edge, and the dot and the counter ride up or down the new segment
with it.

**Animate the change, not the data.** The tween finishes well before the
next value arrives, so at every update both cards agree.

### The number is part of the chart

A counter that flips from 620 to 790 reads as two separate facts. One that
counts up reads as a change, which is what it is. Use `tabular-nums` so the
digits don't shift sideways while they count.

### Ranked lists

When live values change order, the reorder is the interesting part. A
snapped list swaps rows between frames, and you have to read the labels
again to work out what moved.

> **Interactive demo: Living Bars.** Open https://critly.vercel.app/living-charts to try it.

With animation on, each row slides to its new place over `600ms` while its
bar and number ease to the new value. You can follow a single source as it
climbs or falls without reading anything.

### Usage

The hook eases a progress value from 0 to 1 every time a new point arrives.
Everything else is derived from it.

```tsx
import { useEffect, useState } from "react";

// Eases from 0 to 1 over `duration` ms every time `key` changes.
export function useProgress(key: number, duration = 900) {
  const [state, setState] = useState({ key, t: 1 });

  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setState({ key, t: 1 - (1 - p) ** 3 }); // ease-out
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [key, duration]);

  // A new key starts at 0 before the first frame runs.
  return state.key === key ? state.t : 0;
}

// values keeps one extra point past the left edge, clipped away.
const t = useProgress(tick);
const x = (i: number) => (i - t) * slot;
const head = previous + (latest - previous) * t;
```

Keep the y axis fixed to a known range while data streams in, or the chart
rescales on every update and undoes the calm. When `prefers-reduced-motion`
is set, return 1 from the hook and the chart steps like the left card.

### Resources

- [Liveline](https://benji.org/liveline): A React component for real-time line charts that eases toward every new value instead of jumping.
- [Layout animations in Motion](https://motion.dev/docs/react-layout-animations): The layout prop the ranked list uses to slide rows into their new places.
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame): The per-frame loop that drives the tween in the first demo.
- [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion): The media query for people who would rather the chart stepped than moved.


## Curve Smoothing

> Smooth lines that don't invent data.

- Section: Data
- URL: https://critly.vercel.app/curve-smoothing
- Published: 2026-07-16
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/data/curve-smoothing.mdx

A line chart joins points, and the way it joins them says something about
the values in between. Straight segments are honest but jagged. Smooth
curves read more calmly, but some of them draw values that were never in
the data.

Switch between four common curves. The dashed line marks the highest value
in the data.

> **Interactive demo: Curve Smoothing.** Open https://critly.vercel.app/curve-smoothing to try it.

**A smooth line should never go higher or lower than the points it
connects.**

Catmull-Rom passes through every point, but it swings past them on sharp
turns. Here it peaks at 97 when nothing in the data is above 90. Basis does
the opposite. It never touches the inner points, so it shaves the peak to 86
and flattens the spike at 62 down to 51. Monotone passes through every
point and stays between each pair of neighbors, so it tops out at exactly 90.

### Why monotone holds

The shape of each segment comes from the slope the line has as it leaves
one point and arrives at the next. Catmull-Rom copies that slope from the
neighbors, so a point next to a steep drop leaves at a steep angle and the
curve bulges to make the turn.

A monotone curve limits those slopes. Where the data turns from rising to
falling, the slope at that point is zero, so the line flattens there
instead of sailing past. Everywhere else the slope is capped by the
segments on either side. Fritsch and Carlson described the method in 1980.
d3's `curveMonotoneX` uses a later variant by Steffen.

### Bounded data

Overshoot does the most damage when the data has hard limits. A percentage
cannot go above 100 or below zero, and readers trust the line before they
check the axis.

> **Interactive demo: Curve Overshoot.** Open https://critly.vercel.app/curve-smoothing to try it.

Both charts plot the same twelve CPU readings. The Catmull-Rom line
reaches 112% and dips to -8% around the flat stretches. The monotone line
rests on the bounds and still reads as a curve.

### Usage

**d3**

```ts
import { curveMonotoneX, line } from "d3-shape";

const path = line<{ x: number; y: number }>()
  .x((p) => p.x)
  .y((p) => p.y)
  .curve(curveMonotoneX);

// <path d={path(points)} fill="none" stroke="currentColor" />
```

**React**

```tsx
type Point = { x: number; y: number };

// Steffen's monotone cubic, the same curve as d3's curveMonotoneX.
export function monotonePath(p: Point[]) {
  const n = p.length;
  if (n < 3) return p.map((q, i) => `${i ? "L" : "M"}${q.x},${q.y}`).join("");

  const h: number[] = [];
  const s: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    h[i] = p[i + 1].x - p[i].x;
    s[i] = (p[i + 1].y - p[i].y) / h[i];
  }

  // Slope at each point: zero where the data turns, capped elsewhere.
  const m: number[] = [];
  for (let i = 1; i < n - 1; i++) {
    const mid = (s[i - 1] * h[i] + s[i] * h[i - 1]) / (h[i - 1] + h[i]);
    const limit = Math.min(2 * Math.abs(s[i - 1]), 2 * Math.abs(s[i]), Math.abs(mid));
    m[i] = s[i - 1] * s[i] > 0 ? Math.sign(mid) * limit : 0;
  }
  m[0] = (3 * s[0] - m[1]) / 2;
  m[n - 1] = (3 * s[n - 2] - m[n - 2]) / 2;

  let d = `M${p[0].x},${p[0].y}`;
  for (let i = 1; i < n; i++) {
    const a = p[i - 1];
    const b = p[i];
    const t = (b.x - a.x) / 3;
    d += `C${a.x + t},${a.y + t * m[i - 1]} ${b.x - t},${b.y - t * m[i]} ${b.x},${b.y}`;
  }
  return d;
}

// <path d={monotonePath(points)} fill="none" stroke="currentColor" />
```

Monotone assumes x only ever increases, which holds for any time series.
While you build the chart, keep the data dots visible. Overshoot is easy to
miss on a bare line and obvious once you can see where the real values are.

### Resources

- [d3-shape curves](https://d3js.org/d3-shape/curve): Every curve d3 ships, drawn on the same points, including curveMonotoneX.
- [Monotone cubic interpolation](https://en.wikipedia.org/wiki/Monotone_cubic_interpolation): The Fritsch and Carlson method, with the tangent rules that stop a cubic from overshooting.
- [Adaptive Polynomial Curve Fitting](https://shud.in/thoughts/adaptive-polynomial-curve-fitting): Shu Ding on smoothing Vercel Analytics charts by fitting a curve to the trend instead of through every point.
- [The SVG path d attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d): The cubic Bezier command each curve here is made of.
