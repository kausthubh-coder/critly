# Performance

## Measuring Performance

> Measure the wait people feel, more than once.

- Section: Performance
- URL: https://critly.vercel.app/measuring-performance
- Published: 2026-10-08
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/performance/measuring-performance.mdx

Most performance work goes wrong before any code changes. It measures the
wrong moment, on the wrong machine, once, and then a fix that changed
nothing gets shipped, or a real win gets reverted as noise.

Load the page and watch where each signal lands on the timeline.

> **Interactive demo: Ready Signal.** Open https://critly.vercel.app/measuring-performance to try it.

The browser's `load` event fires at 260ms, so a test that waits for it
reports a fast page. The person sees nothing useful until the real content
arrives at 1,500ms. The number that matters is when the page is ready for
them, and the browser can't know that unless you tell it.

**Measure the wait a person feels, on the kind of device they use, more than
once, before and after every change.**

### Name the moment

Write each action down as a start and a finish people can see: "click Play
→ video playing", "open Home → first row of real titles", "type in search →
results for that text". Then make the finish explicit in the app, with an
attribute like `data-ready` set when the real content renders, so a test
waits for that instead of guessing from images or spinners. Check that the
attribute exists, not that it's truthy: an empty string is still "ready".

### Measure where it's slow

- **A production build.** Development mode adds checks that can double the
  time of everything.
- **Realistic data.** A page that's fast with 10 items can be slow with 800.
- **A phone profile.** Use DevTools' calibrated mid-tier mobile CPU preset
  and a slow network, and also check desktop.
- **The real GPU, for blur, glass and video.** CPU throttling doesn't slow
  the GPU, and software rendering in a headless browser makes cheap effects
  look expensive and expensive ones look cheap. Use a real phone or the
  machine's actual GPU.
- **Server and browser time apart.** If an action waits on an API, record
  the request time separately, so you know whether to fix the server or the
  page.

### Run it more than once

Do it again.

> **Interactive demo: Repeat Runs.** Open https://critly.vercel.app/measuring-performance to try it.

One run can land anywhere: a cold cache, a background task or garbage
collection can add half a second. Take the median of at least three cold and
three warm runs, with nothing else running on the machine. If two versions
are within the noise, the change did nothing.

### Find the cause, then fix one thing

When something is slow and you don't know why, take things away. Turn off
one suspect at a time (the blur, the shadows, the transitions, one
component) and measure again; the biggest drop is the cause. Then change
one thing, measure it the same way, and write down the result:

| Action | Before | After | Runs | Setup |
| --- | --- | --- | --- | --- |
| Open Home (phone) | 8.5s | 2.3s | 5 cold | prod build, mid-tier CPU, slow 4G |

Measure each fix on its own, so you know which one helped. And never say
tests pass until you've run the same checks CI runs.

### Usage

**Ready signal**

```tsx
// In the app: mark the moment the real content renders.
useEffect(() => {
  if (!items) return;
  document.body.dataset.ready = "home";
  performance.mark("home-ready");
}, [items]);

// In a Playwright test: wait for it, not for "load".
const start = Date.now();
await page.goto("/home");
await page.waitForSelector('body[data-ready="home"]');
console.log("Home ready in", Date.now() - start, "ms");
```

**Field data**

```ts
import { onCLS, onINP, onLCP } from "web-vitals/attribution";

// Good: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1, at the 75th percentile.
onLCP(send);
onINP(send);
onCLS(send);

function send(metric) {
  navigator.sendBeacon("/vitals", JSON.stringify({
    name: metric.name,
    value: metric.value,
    attribution: metric.attribution,
  }));
}
```

**Quick checks**

```ts
// How many elements is the page rendering?
document.querySelectorAll("*").length;

// How many elements are paying for a blur?
[...document.querySelectorAll("*")].filter(
  (el) => getComputedStyle(el).backdropFilter !== "none"
).length;
```

In the lab, the DevTools Performance panel shows live LCP, INP and CLS as you
use the page, with each interaction split into input delay, processing and
presentation. In production, `web-vitals` reports what real visitors get,
which is the number that counts. A fast laptop hides almost everything, so
treat a result from one as a best case, not a measurement.

### Resources

- [Web Vitals](https://web.dev/articles/vitals): The three field metrics for loading, responsiveness and visual stability, and their thresholds.
- [Chrome DevTools performance reference](https://developer.chrome.com/docs/devtools/performance/reference): The Frames, Interactions and Animations tracks, and how to read a trace.
- [Calibrated CPU throttling](https://developer.chrome.com/blog/devtools-grounded-real-world): DevTools presets that match low-tier and mid-tier phones, and why they don't slow the GPU.
- [web-vitals](https://github.com/GoogleChrome/web-vitals): The library for measuring LCP, INP and CLS in real sessions, with attribution.
- [Long Animation Frames API](https://developer.chrome.com/docs/web-platform/long-animation-frames): Finding which scripts and layout work made a frame late.


## Responsiveness

> Answer every input on the next frame.

- Section: Performance
- URL: https://critly.vercel.app/responsiveness
- Published: 2026-10-08
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/performance/responsiveness.mdx

People don't feel how long the work takes. They feel how long the screen
takes to answer. A tap that changes something within about 50ms feels like
a physical button; at 150ms it feels like software; past a few hundred it
feels broken.

Type quickly into the box in both modes. Every row costs a little rendering
time, like a real row with a few components in it.

> **Interactive demo: Typing Lag.** Open https://critly.vercel.app/responsiveness to try it.

In Blocking mode, every keystroke waits for the whole list to re-render
before the letter appears, so the text stutters and lags behind your
fingers. In Deferred mode, the letter appears at once and the list catches
up behind it, dimmed for a moment while it's out of date.

**Answer every input on the next frame. Finish the work afterwards.**

The browser can only paint between tasks. Whatever runs in your click or
keystroke handler, plus the render it triggers, sits between the input and
the next frame. Chrome measures that gap as Interaction to Next Paint: under
200ms is "good", over 500ms is "poor". Treat 200ms as the failure line, not
the goal. Aim for 100ms at most, and well under that for typing.

### Paint first, then work

Both buttons do the same 600ms of work. Press each one.

> **Interactive demo: Paint First.** Open https://critly.vercel.app/responsiveness to try it.

The left button does the work, then updates, so for over half a second
nothing seems to happen and the page is frozen. The right button switches
to "Saving…" first, lets the browser paint that frame, then does the work in
40ms pieces, yielding in between so the page keeps responding.

1. Change the visible state first: pressed, optimistic, "Saving…".
2. Yield, so the browser can paint it.
3. Do the work in pieces under 50ms, or move it to a Web Worker.

### Feedback that matches the wait

- **Under 100ms:** just the state change. A pressed button, a checked box,
  the typed letter.
- **Up to about 400ms:** nothing more. A spinner that flashes for 200ms
  reads as a glitch.
- **400ms to 1s:** a quiet cue, like dimming the old content or a button
  label that says "Saving…".
- **Over 1s:** a real loading state; past 10 seconds, progress and a way
  out. See [Performance Is Design](https://critly.vercel.app/performance-is-design).

To stop double submits, switch the button to a pending state that ignores
repeat presses, instead of a silent `disabled` that greys it out and drops
focus.

### Usage

**JavaScript**

```ts
function yieldToMain() {
  if (globalThis.scheduler?.yield) return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

button.addEventListener("click", async () => {
  button.dataset.state = "saving"; // 1. answer
  await yieldToMain();             // 2. let it paint

  let last = performance.now();
  for (const item of items) {      // 3. work in pieces
    process(item);
    if (performance.now() - last > 40) {
      await yieldToMain();
      last = performance.now();
    }
  }
});
```

**React**

```tsx
import { memo, useDeferredValue, useState } from "react";

function Search({ items }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const stale = query !== deferredQuery;

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <div style={{ opacity: stale ? 0.6 : 1 }}>
        <Results items={items} query={deferredQuery} />
      </div>
    </>
  );
}

// Must be memoized (or compiled by React Compiler) to skip urgent renders.
const Results = memo(function Results({ items, query }) { ... });
```

Never put a text input's own value behind a transition, a debounce or an
`await`: the letter has to echo immediately. Debounce network requests, not
rendering. `scheduler.yield()` runs in Chrome and Firefox; the `setTimeout`
fallback covers Safari. Test with DevTools' CPU throttling set to mid-tier
mobile, because a fast laptop hides almost all of this.

### Resources

- [Interaction to Next Paint](https://web.dev/articles/inp): The metric for how quickly a page answers clicks, taps and key presses, with its 200ms and 500ms thresholds.
- [Optimize long tasks](https://web.dev/articles/optimize-long-tasks): Why tasks over 50ms block input, and how to break them up by yielding.
- [Use scheduler.yield()](https://developer.chrome.com/blog/use-scheduler-yield): The Chrome team on giving feedback first and yielding before the slow part.
- [useDeferredValue](https://react.dev/reference/react/useDeferredValue): React's way to keep typing instant while an expensive part of the screen catches up.
- [Slow Software](https://inkandswitch.com/slow-software/): Ink & Switch on how little latency people notice when they touch, click and type.


## Instant Navigation

> Start loading before the click lands.

- Section: Performance
- URL: https://critly.vercel.app/instant-navigation
- Published: 2026-10-08
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/performance/instant-navigation.mdx

Moving between screens is the most common thing people do in an app, and
they decide whether it feels fast in the first tenth of a second. Most of
that time can be spent before they even click.

Both apps take 600ms to load each page. Move your pointer onto a page name
the way you normally would, then click.

> **Interactive demo: Prefetch.** Open https://critly.vercel.app/instant-navigation to try it.

The left app starts loading when you click, so every page shows a skeleton
for 600ms. The right one starts loading when you show intent: hovering for
65ms, pressing down, or focusing with the keyboard. By the time the click
lands, most of the wait is already over.

**Start loading on intent, not on click, and never show a blank screen while
you wait.**

### How much head start you get

People hover on a link for a while before they click it. instant.page's
measurements found that after 65ms of hover, half of users go on to click,
with over 300ms still to go. Pressing the button gives about 80ms more
before the click fires, and on touch screens `touchstart` gives about 90ms.
That's why the right app also loads on press: it's free and wastes nothing.

Match the head start to the cost. A short hover (about 65ms) is right for
cheap, read-only work like fetching a page's data. Expensive or side-effecting
work, like starting a video, a stream or a server job, should wait for a
longer rest (about 300ms) and cancel when the pointer leaves. Prefetch the
data as well as the code, and let a click join the request already in flight
instead of starting a new one. On touch screens there's
no hover, so prefetch only the few links people are most likely to tap,
such as the first items in a list.

### What to show while it loads

- **Under 100ms:** nothing. Keep the old screen, show the pressed link, then
  swap.
- **Longer, and you know the next layout:** show the destination's skeleton
  straight away, filled with what you already know, like the title from the
  link.
- **Longer, and you don't:** keep the old screen and dim it after about
  100ms.

Spinners need the same care. Load each panel a few times.

> **Interactive demo: Spinner Delay.** Open https://critly.vercel.app/instant-navigation to try it.

Most loads take about 100ms. The left spinner appears for every one of them,
so the panel blinks. The right one only appears if the load is still going
after 150ms, and then stays for at least 300ms, so fast loads look instant
and slow ones look steady.

### Usage

**React**

```tsx
const inflight = new Map();
const prefetch = (key, load) => {
  if (!inflight.has(key)) inflight.set(key, load());
  return inflight.get(key);
};

function IntentLink({ href, load, children }) {
  let timer;
  return (
    <a
      href={href}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") timer = setTimeout(() => prefetch(href, load), 65);
      }}
      onPointerLeave={() => clearTimeout(timer)}
      onPointerDown={() => prefetch(href, load)}
      onFocus={() => prefetch(href, load)}
    >
      {children}
    </a>
  );
}
```

**HTML**

```html
<!-- Chromium: prerender same-site links after 200ms of hover or on press -->
<script type="speculationrules">
{
  "prerender": [{
    "where": {
      "and": [
        { "href_matches": "/*" },
        { "not": { "href_matches": ["/logout", "/cart/*"] } }
      ]
    },
    "eagerness": "moderate"
  }]
}
</script>
```

Frameworks already do much of this. Next.js prefetches links as they scroll
into view, and a dynamic route only prefetches down to its `loading.js`, so
give every dynamic route one. React Router has `prefetch="intent"`, and
TanStack Router preloads on a 50ms hover. Speculation Rules only run in
Chromium, so treat them as a bonus. Never prefetch links that change
something, like logout or add to cart.

Make Back instant too. Remove every `unload` listener, since it keeps the
browser from restoring the page from memory, and in single-page apps
restore the previous screen and its scroll position from cache.

### Resources

- [instant.page](https://instant.page/): The measurements behind hover prefetching, including how long people hover before they click.
- [Prerender pages in Chrome](https://developer.chrome.com/docs/web-platform/prerender-pages): The Speculation Rules API, its eagerness levels and exactly when each one fires.
- [Prefetching in Next.js](https://nextjs.org/docs/app/guides/prefetching): How Next.js prefetches links, and how to prefetch only on hover for long lists.
- [Back/forward cache](https://web.dev/articles/bfcache): How browsers make Back instant, and what stops them.
- [spin-delay](https://github.com/smeijer/spin-delay): A small hook for spinners that only show after a delay and then stay long enough not to flicker.


## Image Loading

> Hold the space, then fade in.

- Section: Performance
- URL: https://critly.vercel.app/image-loading
- Published: 2026-10-08
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/performance/image-loading.mdx

Images are usually the heaviest thing on a page and the last thing to
arrive. How they arrive is part of the design: they can drop into an empty
gap and shove the page around, or settle into a space that was waiting for
them.

Replay both cards. The network is simulated, so each image takes a moment.

> **Interactive demo: Image Arrival.** Open https://critly.vercel.app/image-loading to try it.

The left image has no size and no placeholder, so there's nothing, then the
picture appears all at once and pushes the text down while you're reading
it. The right one reserves its box from the first frame, fills it with the
photo's average colour, and fades the picture in over 240ms.

**Give every image its space and a placeholder before it loads, then fade it
in. Except the hero: load that one first and show it at once.**

### What fills the box

Switch between the placeholder and the loaded image.

> **Interactive demo: Placeholder.** Open https://critly.vercel.app/image-loading to try it.

A grey box is safe but tells you nothing. The average colour hints at the
photo for a few bytes. A tiny preview looks like the real image, but only if
it's blurred: stretched without blur, it looks like a broken JPEG.
BlurHash and ThumbHash encode a smooth preview in about 25 bytes. In dark
mode, mix the colour with the page's surface so placeholders don't flash
bright.

Don't fade images that are already in the cache, or every revisit flickers.
Crossfade with `opacity` over a still placeholder, and never animate the blur
itself.

### The hero is different

The main image at the top is usually what Chrome measures as Largest
Contentful Paint, which should land within 2.5 seconds. The download is
rarely what makes it late. On slow sites, the browser waits about four times
longer to *start* downloading the hero than it spends downloading it.

- Put the hero in the HTML as a real `<img>`, not a CSS background or an
  image added by JavaScript.
- Mark it `fetchpriority="high"`, and only it.
- Never lazy-load it. Lazy-load everything below the fold instead.
- Don't fade it in from invisible. Paints at opacity 0 don't count, so a
  reveal animation can delay it by seconds.

### Usage

**HTML**

```html
<!-- The hero: first in line, shown at once -->
<img src="/hero-1600.avif" width="1600" height="900" alt="…"
     fetchpriority="high">

<!-- Everything else: sized, lazy, sized to its slot -->
<img src="/card-640.avif" width="640" height="400" alt="…"
     loading="lazy" decoding="async"
     srcset="/card-320.avif 320w, /card-640.avif 640w, /card-960.avif 960w"
     sizes="auto, (min-width: 40rem) 45vw, 92vw"
     style="background: var(--placeholder)">
```

**Next.js**

```tsx
import Image from "next/image";
import hero from "./hero.jpg";

// next/image lazy-loads by default, so the hero must opt out.
<Image src={hero} alt="…" fetchPriority="high" loading="eager"
       sizes="100vw" placeholder="blur" />

// Below the fold: lazy by default, with a blurred placeholder.
<Image src={photo} alt="…" sizes="(min-width: 40rem) 45vw, 92vw"
       placeholder="blur" />
```

Serve AVIF with WebP and JPEG fallbacks, or let an image CDN pick, and stop
at 2× pixel density: the extra pixels on 3× screens are rarely visible. Next.js 16
deprecated `priority` in favour of `preload`, but its docs recommend
`fetchPriority="high"` for most heroes. Always set `width` and `height`;
see [Layout Shift](https://critly.vercel.app/layout-shift).

### Resources

- [Optimize Largest Contentful Paint](https://web.dev/articles/optimize-lcp): The four parts of a slow hero image, and the share of time each should take.
- [Fetch Priority API](https://web.dev/articles/fetch-priority): How fetchpriority="high" moves the hero image to the front of the queue.
- [The performance effects of too much lazy loading](https://web.dev/articles/lcp-lazy-loading): WordPress's test showing that lazy-loading above-the-fold images makes pages slower.
- [ThumbHash](https://evanw.github.io/thumbhash/): A tiny encoding of an image's colours and shape, for placeholders that look like the photo.
- [Remove image transitions to improve LCP](https://performance.shopify.com/en-ca/blogs/blog/improve-largest-contentful-paint-lcp-by-removing-image-transitions): Shopify on how a fade-in reveal on the hero image delayed it by seconds.


## Font Loading

> Text first, in a fallback that fits.

- Section: Performance
- URL: https://critly.vercel.app/font-loading
- Published: 2026-10-08
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/performance/font-loading.mdx

A web font is a file the page has to wait for. While it's on its way, the
browser has two choices: hide the text, or show it in a fallback and swap
later. Both can go wrong. Hidden text means nothing to read; a swap means
every line can rewrap under the reader's eyes.

Load the font and watch all three paragraphs.

> **Interactive demo: Font Race.** Open https://critly.vercel.app/font-loading to try it.

The first paragraph stays invisible until the font arrives (by default,
browsers hide text for up to three seconds). The second appears at once in
Arial, but Arial is narrower than the brand font, so when the font lands the
lines rewrap and the paragraph grows. The third uses a fallback tuned to take
up the same space, so the letters change and the lines stay where they are.

**Show text immediately in a fallback that takes up the same space as the
web font, and load as few font files as you can.**

### Fallbacks that fit

A swap moves text because the fallback's letters have different widths and
heights. Four `@font-face` descriptors fix that on a local font: `size-adjust`
scales its width to match, and `ascent-override`, `descent-override` and
`line-gap-override` match its line height. Don't work the values out by
hand: `next/font` generates them automatically, and Fontaine and Capsize do
the same for other setups. In one test, Fontaine cut layout shift from 0.24
to 0.05.

Safari supports `size-adjust` but still ignores the three overrides, so also
set a unitless `line-height`, which keeps lines the same height whichever
font is showing.

### Pick the display behaviour on purpose

- **`swap`**: text at once, swapped whenever the font arrives. Safe only
  with a matched fallback. Half the web uses it anyway.
- **`fallback`**: swaps only if the font arrives within about 3 seconds,
  then keeps the fallback. Good for body text.
- **`optional`**, with a preload: uses the font only if it's ready almost
  immediately, and never moves anything. First visits on slow connections
  get the fallback; later visits get the cached font.
- **`block`**: only for icon fonts, and SVG icons are better.

### Load less

- **Self-host.** Browsers no longer share a font cache between sites, so a
  font CDN gives no head start, only one more connection.
- **WOFF2, subset, variable.** One variable file replaces several weights,
  and `unicode-range` subsets mean a page in English doesn't download
  Cyrillic. Aim for two families and about 100 KB of fonts on first load.
- **Preload one or two files,** the ones the first screen uses, with
  `crossorigin` even on your own domain, or the font downloads twice.
- **Consider system fonts** for interface text. `system-ui` costs nothing
  and looks native everywhere.

### Usage

**CSS**

```css
@font-face {
  font-family: "Brand";
  src: url("/fonts/brand-latin-var.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+2000-206F;
}

/* A local font tuned to occupy the same space as Brand.
   Generate these numbers with a tool, don't guess them. */
@font-face {
  font-family: "Brand Fallback";
  src: local("Arial"), local("Roboto");
  size-adjust: 107.4%;
  ascent-override: 90.2%;
  descent-override: 22.5%;
  line-gap-override: 0%;
}

body {
  font-family: "Brand", "Brand Fallback", system-ui, sans-serif;
  line-height: 1.5;
}
```

**HTML**

```html
<!-- Only the file the first screen needs. crossorigin is required. -->
<link rel="preload" href="/fonts/brand-latin-var.woff2"
      as="font" type="font/woff2" crossorigin>
```

**Next.js**

```tsx
import { Inter } from "next/font/google";

// Self-hosted at build time, preloaded, with a matched fallback generated.
const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }) {
  return <html className={inter.className}>{children}</html>;
}
```

Include Roboto in sans-serif fallbacks, because Android has no Arial. Never
load fonts with CSS `@import`, which hides them from the browser until the
stylesheet arrives. If code measures text, wait for `document.fonts.ready`
first. To check your page, record a cold, throttled load in DevTools and
look at the layout-shift entries around the moment the font arrives; see
[Layout Shift](https://critly.vercel.app/layout-shift).

### Resources

- [Best practices for fonts](https://web.dev/articles/font-best-practices): Loading, delivery and rendering advice for web fonts, from font-display to subsetting.
- [Improved font fallbacks](https://developer.chrome.com/blog/font-fallbacks): How size-adjust and the metric overrides make a fallback take up the same space as the web font.
- [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display): The block, swap, fallback and optional values, and what each does while a font loads.
- [Fontaine](https://github.com/unjs/fontaine): A tool that generates metric-matched fallback fonts automatically.
- [A comprehensive guide to font loading strategies](https://www.zachleat.com/web/comprehensive-webfonts/): Zach Leatherman's survey of how to load fonts without invisible or jumping text.


## Video and Embeds

> Load the player when someone wants it.

- Section: Performance
- URL: https://critly.vercel.app/video-and-embeds
- Published: 2026-10-08
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/performance/video-and-embeds.mdx

A video player is one of the heaviest things you can put on a page, and
often nobody presses play. A single YouTube embed downloads about a megabyte
of script and keeps a phone's main thread busy for over a second, before
anyone clicks. Maps and social embeds are not much lighter.

Look at what each card has loaded before you touch it, then click both.

> **Interactive demo: Embed Facade.** Open https://critly.vercel.app/video-and-embeds to try it.

The left card embeds the player with the page, so every visitor pays for it
up front: about 1.1 MB, 20 requests and 1.4 seconds of script on a phone. The
right card is a facade: a thumbnail and a play button that cost 27 KB. It
loads the real player when clicked, warming the connection when the pointer
arrives, so the wait after the click stays short.

**Don't load a player until someone asks for it, and choose a video format
that starts fast for anything that plays on its own.**

### Pick the medium first

- **Background loops, previews, product clips:** a short MP4 on your own
  server, encoded with `-movflags +faststart` so it can start playing from
  the first bytes, with no audio track if it's silent. One request, no
  third-party controls, full control of when it appears.
- **Long videos people choose to watch:** a streaming service with adaptive
  quality is worth its extra setup.
- **Videos that live on YouTube or Vimeo:** behind a facade that loads on
  click. Their players show a title bar for the first few seconds that you're
  not allowed to hide or cover, so they don't suit autoplaying previews.
- **Animated GIFs:** replace them with a muted looping video, often a tenth
  of the size.

### Show it when there's something to show

Fading a video in on a timer is a guess. Switch to a slow network and replay.

> **Interactive demo: Video Reveal.** Open https://critly.vercel.app/video-and-embeds to try it.

The left tile fades at 900ms whether or not the video has arrived, so on a
slow network it fades into a black box. The right tile keeps the poster
underneath and fades only when the first frame is on screen, using
`requestVideoFrameCallback`. On a fast network both look the same; on a
slow one, only the right one still looks finished.

### Play responsibly

- **Muted and inline.** Muted autoplay with `playsinline` is allowed
  everywhere, but it can still be refused, for example in Low Power Mode on
  iPhone. Handle the rejected `play()` and leave the poster as a complete
  state.
- **One at a time.** Pause other videos when one starts, pause videos that
  scroll out of view or sit in a hidden tab, and don't autoplay for people
  who ask for reduced motion or less data.
- **Give it a pause button** if it moves for more than five seconds.
- **Reserve the space and set a poster,** treated like a hero image.

### Usage

**HTML**

```html
<video width="960" height="540" poster="/clip-poster.avif"
       autoplay muted playsinline loop preload="metadata">
  <source src="/clip.webm" type="video/webm">
  <source src="/clip.mp4" type="video/mp4">
</video>

<!-- Encode: index at the front, no audio, web-safe pixels -->
<!-- ffmpeg -i in.mov -an -c:v libx264 -crf 24 -pix_fmt yuv420p \
       -movflags +faststart clip.mp4 -->
```

**React**

```tsx
// A facade: a real button until someone clicks.
function YouTube({ id, title }) {
  const [live, setLive] = useState(false);
  const warm = () => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://www.youtube-nocookie.com";
    document.head.append(link);
  };

  if (live) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        style={{ aspectRatio: "16 / 9", width: "100%", border: 0 }}
      />
    );
  }
  return (
    <button onPointerEnter={warm} onFocus={warm} onClick={() => setLive(true)}
            style={{ aspectRatio: "16 / 9", backgroundImage: `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)` }}>
      <span className="sr-only">Play video: {title}</span>
    </button>
  );
}
```

On iPhone, a click doesn't always carry through to the new iframe, so a
facade can need a second tap; lite-youtube-embed works around this by loading
YouTube's player API and calling `playVideo()` itself. For maps, show a
static image linked to the real map. Preconnect to two to four origins at
most, because unused connections close after about 10 seconds; for embeds,
preconnect on hover instead. In React, also set the `muted` attribute in an
effect, since React only sets the property and some browsers check the
attribute.

### Resources

- [lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed): Paul Irish's YouTube facade, which loads the real player only when someone clicks.
- [Best practices for embeds](https://web.dev/articles/embed-best-practices): Loading videos, maps and social posts without slowing the page, including facades.
- [Autoplay policy in Chrome](https://developer.chrome.com/blog/autoplay): When video may play on its own, and why muted autoplay is allowed.
- [requestVideoFrameCallback](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback): A callback for the moment a video frame actually reaches the screen.
- [Replace animated GIFs with video](https://web.dev/articles/replace-gifs-with-videos): How much smaller a muted looping video is than the same GIF.


## JavaScript Cost

> Ship less script, load the rest on intent.

- Section: Performance
- URL: https://critly.vercel.app/javascript-cost
- Published: 2026-10-08
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/performance/javascript-cost.mdx

Every kilobyte of JavaScript costs more than a kilobyte of anything else. An
image is downloaded and decoded mostly off to the side. A script is
downloaded, then parsed, compiled and run on the main thread, and while it
runs the page can't answer a tap. The median mobile page now ships about
650 KB of it, compressed, and about 250 KB of what it loads never runs.

Reload, then tap both buttons as soon as you see them. Try each device.

> **Interactive demo: Hydration Gap.** Open https://critly.vercel.app/javascript-cost to try it.

Both pages look ready at once, because the HTML arrived. But the buttons
only work once their script has booted. On a fast laptop the gap is short.
On a mid-range phone, which runs script about 3.5 times slower than a
current iPhone, the typical page ignores your taps for two seconds; on a
budget phone, for five. A page that looks ready but ignores taps feels
broken, not slow.

**Ship the least JavaScript that makes the first screen work. Load the rest
when someone is about to need it.**

### Make the first screen work early

- **Hydrate less.** Content pages don't need every component to be
  interactive: render on the server and add script only where something
  responds, as islands (Astro) or Server Components (Next.js) do.
- **Make key controls work before script.** A real `<a href>`, a
  `<form action>`, `<details>` and `<dialog>` work the moment the HTML
  arrives, so a slow boot makes them slower instead of broken.
- **Keep the first bundle to the shell and the current route.** Every
  modern router splits by route; check that yours does.

### Load heavy things on intent

Editors, charts, maps, video players, date pickers and payment SDKs are
often hundreds of kilobytes each and used by a fraction of visitors. Load
them when someone shows intent, or when they scroll near.

> **Interactive demo: Load On Intent.** Open https://critly.vercel.app/javascript-cost to try it.

Loading everything upfront makes the editor open instantly but puts 340 KB
in front of every visitor. Loading on intent ships 40 KB, starts fetching
the editor when the pointer reaches the box, and by the click most of the
wait is gone. Click without hovering (with the keyboard, say) and you see
the short skeleton instead. Google Docs saved 500 KB by loading its share
dialog this way.

### Watch the third parties

Analytics, tag managers, chat widgets and A/B tools account for over half
of all script execution on the web. A YouTube embed alone averages about 6
seconds of main-thread work. Load them after the page is interactive or on
first interaction, replace widgets with a facade that loads the real thing
on click, and remove the ones nobody looks at.

### Set a budget and enforce it

For a phone to load a page in about 3 seconds, Alex Russell's 2026
numbers allow roughly 300 KB of compressed JavaScript on the critical path.
A good default is 150 KB for content pages and 300 KB for app shells, no
single chunk over 100 KB, and a check in CI that fails the build when a
change goes over. Set the limit at today's size and lower it with every win.

### Usage

**React**

```tsx
import { lazy, Suspense, useState } from "react";

// One promise, cached by the module system. Declare outside components.
const loadEditor = () => import("./RichEditor");
const RichEditor = lazy(loadEditor);

function CommentBox() {
  const [open, setOpen] = useState(false);
  if (open) {
    return (
      <Suspense fallback={<EditorSkeleton />}>
        <RichEditor autoFocus />
      </Suspense>
    );
  }
  return (
    <button
      onPointerEnter={loadEditor} // warm it before the click
      onFocus={loadEditor}        // keyboard users too
      onClick={() => setOpen(true)}
    >
      Write a comment
    </button>
  );
}
```

**Budget**

```ts
// .size-limit.json — fails CI when a bundle grows past its budget.
[
  { "path": "dist/assets/index-*.js", "limit": "150 KB" },
  { "path": "dist/assets/vendor-*.js", "limit": "100 KB" }
]

// package.json
// "scripts": { "size": "size-limit" }
```

To see what you ship, open DevTools' Coverage panel and reload: red is code
that downloaded but never ran, the first candidates for lazy loading. A
bundle analyzer (`npx vite-bundle-visualizer`, `npx next analyze`) shows
what's inside each chunk; look for duplicate libraries, whole utility
libraries imported for one function, and polyfills modern browsers don't
need. Then measure on a real mid-range Android: as
[Measuring Performance](https://critly.vercel.app/measuring-performance) explains, a laptop hides
almost all of this.

### Resources

- [The Performance Inequality Gap, 2026](https://infrequently.org/2025/11/performance-inequality-gap-2026/): Alex Russell's budgets for how much JavaScript a page can afford on the phones most people own.
- [Rendering on the Web](https://web.dev/articles/rendering-on-the-web): Server rendering, hydration and its uncanny valley, and the options in between.
- [Reduce JavaScript payloads with code splitting](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting): Splitting by route and loading the rest when it's needed.
- [Coverage panel](https://developer.chrome.com/docs/devtools/coverage): Finding the JavaScript a page downloads but never runs.
- [Import on interaction](https://www.patterns.dev/vanilla/import-on-interaction/): Loading heavy features when someone is about to use them, with real-world savings.


## Long Lists

> Render what's on screen, not everything.

- Section: Performance
- URL: https://critly.vercel.app/long-lists
- Published: 2026-10-08
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/performance/long-lists.mdx

Feeds, tables, chat logs and search results grow until they're the slowest
thing in the app. Every row is a handful of elements, and the browser has to
style and lay out every one of them, even the thousands nobody can see.

Re-sort the list in both modes and watch the time under it.

> **Interactive demo: Long List.** Open https://critly.vercel.app/long-lists to try it.

With all 5,000 rows rendered, every re-sort touches 5,000 rows and takes a
visible beat; on a phone it takes several. With only the visible rows
rendered (plus a few above and below), the list looks and scrolls the same,
but a re-sort only touches about a dozen, and it's instant at any length.

**Render only the rows people can see. Keep the rest as space, not as
elements.**

### Three ways to keep it light

Count elements, not rows. A "row" can be one line of text or a card with an
image, buttons, menus and hooks, and a page of horizontal rows multiplies
rows by cards. Lighthouse warns at about 800 DOM elements and flags 1,400.
Check with `document.querySelectorAll("*").length`.

- **A few hundred simple rows, well under 1,400 elements:** just render them.
- **Long, mostly static content** (articles, docs, a long settings page):
  add `content-visibility: auto` to each section. The browser skips laying
  out and painting what's off screen, and find-in-page still works. In one
  test, 10,000 rows went from about 436ms to 247ms.
- **Thousands of elements, or anything filtered, sorted or updated live:**
  virtualize. Only the visible rows exist, so the cost stays flat, around 5
  to 20ms whether there are a thousand rows or a million.

Rows of cards inside a long page (a home screen of carousels) are the same
problem in two directions. Render rows as they approach the screen, keep
off-screen rows as reserved space with `content-visibility`, and mount each
card's heavy parts (menus, previews, video, per-card listeners) only when
someone interacts with it.

Virtualization has costs to plan for. Find-in-page can't see rows that don't
exist, so offer your own search. Screen readers need `aria-setsize` and
`aria-posinset` to know where they are, and the focused row has to stay
mounted. Search engines and printing only see what's rendered.

### Keep the reader's place

Chats and feeds that load older content above you have a second problem.
Scroll up a little in both chats, then load older messages.

> **Interactive demo: Chat Anchor.** Open https://critly.vercel.app/long-lists to try it.

On the left, the new messages push everything down and you lose the line you
were reading. On the right, the scroll position moves by exactly the height
that was added, so the same message stays under your eyes. Browsers do this
automatically with scroll anchoring, except at the very top of the list,
which is exactly where "load older" usually fires. Start loading a little
before the top, or correct the position yourself.

### Infinite scroll or "Load more"

Infinite scroll suits feeds people browse without a goal. For search
results, products and anything people compare, use pagination or a "Load
more" button: people can reach the footer, and Back can return them to the
same place. Put the page in the URL, and after a few automatic loads switch
to a button.

### Usage

**CSS**

```css
/* Long, mostly static sections: skip rendering what's off screen.
   The size is a guess the browser replaces once it has rendered it. */
.feed-item {
  content-visibility: auto;
  contain-intrinsic-size: auto 120px;
}
```

**React**

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function Activity({ rows }) {
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 6,
  });

  return (
    <div ref={parentRef} style={{ height: 400, overflowY: "auto" }}>
      <ul style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((item) => (
          <li
            key={rows[item.index].id}
            aria-posinset={item.index + 1}
            aria-setsize={rows.length}
            style={{ position: "absolute", top: item.start, height: item.size, width: "100%" }}
          >
            {rows[item.index].text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Key rows by their data id, never their index. Prefer fixed row heights for
tables and logs; when heights vary, overestimate the guess. Typing into a
filter over a long list still needs [Responsiveness](https://critly.vercel.app/responsiveness):
virtualize so each render is small, and defer it so typing stays instant.
Use a library for chat lists rather than hand-written scroll math.

### Resources

- [How large DOM sizes affect interactivity](https://web.dev/articles/dom-size-and-interactivity): Why every extra node makes style, layout and every interaction slower.
- [content-visibility](https://web.dev/articles/content-visibility): Letting the browser skip rendering off-screen sections, with measured savings.
- [TanStack Virtual](https://tanstack.com/virtual/latest): A headless virtualization library for lists, grids and chats of any length.
- [Infinite scrolling tips](https://www.nngroup.com/articles/infinite-scrolling-tips/): Nielsen Norman Group on when infinite scroll helps and when it gets in the way.
- [overflow-anchor](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-anchor): Scroll anchoring, which keeps your place when content is added above it.


## Smooth Animation

> Animate what the compositor can run.

- Section: Performance
- URL: https://critly.vercel.app/smooth-animation
- Published: 2026-10-08
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/performance/smooth-animation.mdx

A browser tab does almost everything on one thread: your JavaScript, React,
style, layout and paint. Smooth motion needs a new frame every 16ms at 60Hz
and every 8ms at 120Hz. When that thread is busy, anything that needs it
misses frames.

Some animations don't need it. The browser can hand them to the compositor,
a separate thread that only moves and fades layers that are already painted.
Press play, then switch to a busy page, which blocks the main thread for 70ms
out of every 100, about what a big re-render does on a mid-range phone.

> **Interactive demo: Main Thread.** Open https://critly.vercel.app/smooth-animation to try it.

All three dots run the same motion. The JavaScript loop needs the main
thread to compute every frame, and the `left` animation needs it to lay out
the page every frame, so both stutter. The `transform` animation was handed
to the compositor once, so it keeps gliding while the page is stuck.

**Animate `transform` and `opacity`, and let CSS or the Web Animations API
run them.**

### What each property costs

- **Composited everywhere:** `transform`, `translate`, `scale`, `rotate`,
  `opacity`.
- **Depends on the browser:** `filter`, `backdrop-filter`, `clip-path` and
  `background-color` run on the compositor in some engines and on the main
  thread in others. Treat them as expensive.
- **Paint every frame:** `box-shadow`, `border-radius`, `color`,
  `filter: blur()` in Chrome.
- **Layout every frame:** `width`, `height`, `top`, `left`, `margin`,
  `padding`. Moving one box can move every box after it.

For size changes, animate a transform and measure once ([shared
layout](https://critly.vercel.app/shared-layout) does this for you). For shadows and blur, paint the
end state once and fade it in. Lift both cards, then try it on a busy page.

> **Interactive demo: Shadow Lift.** Open https://critly.vercel.app/smooth-animation to try it.

The left card animates `box-shadow`, which repaints the shadow on every
frame on the main thread, so it stutters with the page. The right card fades
the opacity of a layer that already has the big shadow painted, so it stays
smooth.

### JavaScript animation

JavaScript engines compute each frame on the main thread, so they're only as
smooth as the page around them. In Motion, `x`, `y` and `scale` run that
way. A full `transform` string can be handed to the browser instead. Springs
handed over this way become `linear()` curves, which Safari runs on the main
thread anyway. In React, never animate through state: a re-render per frame
is exactly the main-thread work that causes the stutter. Use motion values,
refs or CSS.

A few more habits keep frames steady:

- Start the animation first, then do the heavy work after a frame or two.
- Don't run JavaScript entrance animations while the page is hydrating.
- Set `will-change` just before an animation and remove it afterwards.
  Every layer costs GPU memory.
- Pause loops that are off screen.

Effects also cost when nothing moves. A blur, a `backdrop-filter` or a
`will-change` keeps its own layer even at opacity 0, so hundreds of hidden
glass buttons cost hundreds of layers. See [Effect Cost](https://critly.vercel.app/effect-cost).

### Measure it

In Chrome DevTools, record a trace and open the Animations track. A red
triangle marks an animation that wasn't composited, and the summary says
why. CPU throttling shows main-thread problems, but it doesn't slow the GPU,
so check blur and glass on a real phone. Measure a production build, more
than once, before and after; [Measuring Performance](https://critly.vercel.app/measuring-performance)
has the full method.

### Usage

**CSS**

```css
/* Fade a pre-painted shadow instead of animating box-shadow. */
.card {
  position: relative;
  transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1);
}

.card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 0 18px 36px -12px rgb(0 0 0 / 0.35);
  opacity: 0;
  transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}

.card:hover {
  transform: translateY(-4px);
}

.card:hover::after {
  opacity: 1;
}
```

**Motion**

```tsx
import { motion } from "motion/react";

// Runs in JavaScript every frame:
<motion.div animate={{ x: 100 }} />

// Can be handed to the browser and keep running when the page is busy:
<motion.div animate={{ transform: "translateX(100px)" }} />
```

Composited motion keeps animating while the page is blocked, but the page
still can't respond to a click until the work finishes. Smooth animation
hides a slow page; it doesn't fix one. See [Performance Is
Design](https://critly.vercel.app/performance-is-design).

### Resources

- [Stick to compositor-only properties](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count): Why transform and opacity are cheap, and what every extra layer costs.
- [Motion animation performance guide](https://motion.dev/docs/performance): Which values Motion can hardware-accelerate, and why x and scale aren't among them.
- [How to animate box-shadow](https://tobiasahlin.com/blog/how-to-animate-box-shadow/): Tobias Ahlin's technique of fading a pre-rendered shadow instead of animating it.
- [Chrome DevTools performance reference](https://developer.chrome.com/docs/devtools/performance/reference): The Frames and Animations tracks, including why an animation wasn't composited.
- [Scroll-driven animation performance](https://developer.chrome.com/blog/scroll-animation-performance-case-study): A case study of a CSS animation that stays smooth while JavaScript is busy.


## Effect Cost

> Budget effects by how many, not how they look.

- Section: Performance
- URL: https://critly.vercel.app/effect-cost
- Published: 2026-10-08
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/performance/effect-cost.mdx

A blur, a big shadow or a glass surface looks like a styling choice, but each
one is work the browser repeats. A blur redraws every time anything behind it
moves. A promoted layer holds GPU memory. And neither stops costing just
because you can't see it.

Hover the cards, then switch between the two versions. Each card has a
small row of actions that appears on hover.

> **Interactive demo: Effect Count.** Open https://critly.vercel.app/effect-cost to try it.

With glass on every card, you only ever see one blur, but the page is
paying for all of them: the hidden ones sit at opacity 0 and still blur the
moving background on every frame. Budgeted, the actions use a plain dark
backing and the only blur is the toolbar. On a fast laptop the frame time
may barely move; on a phone, dozens of hidden blurs are the difference
between smooth scrolling and stutter.

**Budget expensive effects by how many are on the page, not by how one looks.
Keep blur and heavy shadows to a few small floating surfaces, and remove them
when they're hidden.**

### Where the count comes from

The usual cause isn't one ambitious design. It's a shared component. Glass
added to the default button, or a layered shadow on the card component, is
repeated by every list, grid and menu that uses it. In one real app, a glass
icon button repeated on every poster put about 1,500 blurred elements on a
single page.

- **Count instances.** Run the quick check from
  [Measuring Performance](https://critly.vercel.app/measuring-performance) in the console: how many
  elements have a `backdrop-filter`? More than a handful is a red flag.
- **Hidden counts.** Opacity 0, `visibility: hidden` and off-screen but
  mounted elements still create layers. Apply the effect when the thing is
  shown, not before.
- **Per-item controls get a scrim.** A dark translucent backing reads just
  as well over images and costs nothing to keep.

### Other quiet costs

- **Blur behind a modal.** When an overlay covers the page, turn off the
  page's blurs; nobody can see them, and the modal's own blur now has to
  sample them.
- **Blur under an opaque fill.** Above about 90% opacity a blur is
  invisible, but still paid for.
- **Things moving inside glass.** Animating `width` or `left` of something
  inside a blurred surface redraws the blur every frame. Move it with
  `transform` on its own layer.
- **Shadow stacks.** A three-layer shadow on one card is nothing; on
  hundreds of items, or on glass, keep to one or two.
- **`will-change` left on.** It promotes the element for as long as it's
  set. Add it just before an animation and remove it after.

### Usage

**CSS**

```css
/* Per-item controls: a scrim, not a blur. */
.card-actions {
  background: rgb(0 0 0 / 0.55);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.12);
}

/* Glass is a variant you opt into, never the default. */
.button[data-variant="glass"] {
  backdrop-filter: blur(12px) saturate(170%);
}

/* No page blurs while a modal covers them. */
html:has(dialog:modal) .glass:not(dialog *) {
  backdrop-filter: none;
}
```

**React**

```tsx
// Only blur while the element is actually shown.
<div
  className="card-actions"
  style={{ backdropFilter: open ? "blur(12px)" : "none" }}
/>
```

To see layers, open DevTools' Layers panel or turn on Rendering → Layer
borders. To see the cost, record a trace while scrolling the busiest page on
a real phone, then remove one effect at a time and record again. GPU cost
doesn't show up under CPU throttling, so a laptop can't tell you this one.
See [Liquid Glass](https://critly.vercel.app/liquid-glass) for where glass belongs at all.

### Resources

- [Manage layer count](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count): Why every promoted layer costs GPU memory and upload time.
- [backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter): How the browser blurs what's behind an element, and what limits the area it can see.
- [will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change): MDN on using will-change as a last resort, and only around an animation.
- [Rendering performance](https://web.dev/articles/rendering-performance): The pixel pipeline, and which kinds of change cost layout, paint or only compositing.
- [Chrome DevTools Layers panel](https://developer.chrome.com/docs/devtools/layers): Seeing how many layers a page creates and why each one exists.
