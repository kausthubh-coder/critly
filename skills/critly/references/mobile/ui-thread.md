# Mobile

## UI Thread

> Run gestures where the frames are drawn.

- Section: Mobile
- URL: https://critly.vercel.app/ui-thread
- Published: 2026-10-12
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/mobile/ui-thread.mdx

A phone draws a new frame 60 to 120 times a second. When a frame isn't ready
in time, the old one stays on screen and the motion stutters. In React Native
the risk has a specific shape: your React code runs on the JS thread, the
screen is drawn on the UI thread, and anything that crosses from one to the
other every frame waits whenever JS is busy.

Drag the card on each thread with the JS thread busy.

> **Interactive demo: Thread Jank.** Open https://critly.vercel.app/ui-thread to try it.

On the JS thread, each move waits for a 40 to 60 ms render to finish, so the
card trails the finger (the dashed ring) and jumps in steps. On the UI thread,
the gesture writes the position where the frame is drawn, and the busy JS
thread can't hold it back. The two strips are the two numbers React Native's
Perf Monitor shows, UI FPS and JS FPS, because each thread drops frames on its
own.

**Compute anything that follows the finger on the thread that draws the frames, and keep every frame inside the budget of a 120 Hz screen.**

### The budget

| Refresh rate | Frame budget |
|---|---|
| 60 Hz | 16.7 ms |
| 90 Hz | 11.1 ms |
| 120 Hz | 8.3 ms |

That budget covers the whole frame, the system's work included. Android's docs
round it to 16, 11 and 8 ms and note that missing it by even 1 ms drops the
frame. ProMotion iPhones switch between 10 and 120 Hz and can be capped by Low
Power Mode or heat, so don't assume any one rate. A frame that is fine at 60 Hz
can be late at 120.

> **Interactive demo: Frame Budget.** Open https://critly.vercel.app/ui-thread to try it.

If you treat 16 ms as the budget, a 120 Hz phone shows every frame between 8.3
and 16.7 ms as a hitch. On iPhone, UIKit, SwiftUI and Core Animation run at
ProMotion rates on their own. Custom `CADisplayLink` or `CAAnimation`
frame-rate hints above 60 Hz need `CADisableMinimumFrameDurationOnPhone` set to
true in Info.plist ([Apple](https://developer.apple.com/documentation/quartzcore/optimizing-iphone-and-ipad-apps-to-support-promotion-displays)).
React Native sets it by default since 0.82.

### How much jank is too much

Both platforms publish numbers:

- Apple's hitch time ratio is milliseconds of late frames per second of
  motion. Under 5 ms/s is good, from 5 to 10 people start to notice, and at 10
  or more Apple says to act now.
- Apple wants main-thread work under 100 ms so taps feel instant. Instruments
  reports 250 ms as a micro hang and 500 ms as a hang.
- Android vitals flags slow rendering when more than 50% of a session's frames
  miss the deadline, and frozen frames (over 700 ms) when they pass 0.1% of
  frames.

Judge all of it in release builds on a mid-range phone. React Native's dev
mode runs JS much slower, and Flutter's debug mode is JIT-compiled, so
measure every stack on a release or profile build.

### Per stack

#### React Native

Drive gestures with Gesture Handler and Reanimated shared
values. Gesture callbacks and `useAnimatedStyle` run as worklets on the UI
thread. Call back into React with `scheduleOnRN`, which replaces the
deprecated `runOnJS`, and only when something is decided, like a dismiss.
Never `setState` from a gesture or `onScroll` on every frame, and don't read
`.value` during render, which blocks JS while the threads sync. Core
`Animated` with `useNativeDriver: true` also runs on the UI thread, but only
for `transform` and `opacity`. Layout props on the native driver are still
experimental, so animate transforms. Reanimated 4's default `withSpring` no
longer bounces (stiffness 900, damping 120, mass 4); see [Springs](https://critly.vercel.app/springs)
and pass the release velocity as in [Momentum](https://critly.vercel.app/momentum). For feeds, see
[Native Lists](https://critly.vercel.app/native-lists).

#### Compose

Read fast-changing state in the layout or draw phase:
`Modifier.offset { }` and `graphicsLayer { }` instead of `offset(x = ...)` or
`alpha(...)`, which recompose every frame. Give lazy list items a stable
`key`. A Baseline Profile makes code run about 30% faster from the first
launch.

#### SwiftUI

The main thread is the UI thread. Keep `body` cheap, and move
decoding, parsing and image work off the main actor.

#### Flutter

Your Dart code runs on the UI thread, which builds a layer tree and hands it
to the raster thread to draw. Keep `build` cheap: `const` widgets, and
`AnimatedBuilder` with the static subtree passed as `child`. Move heavy work
to an isolate with `Isolate.run`. Profile in profile mode, since debug builds
run JIT-compiled code with extra checks. New projects already set the
ProMotion key; older ones are capped at 60 Hz on iPhone until you add it.

### Usage

**SwiftUI**

```swift
@MainActor @Observable
final class Gallery {
    var thumbnails: [Thumbnail] = []

    func load(_ photos: [Photo]) async {
        // The decode runs off the main actor; only the assignment hops back.
        thumbnails = await Self.decode(photos)
    }

    @concurrent // Swift 6.2: always runs on the background executor
    static func decode(_ photos: [Photo]) async -> [Thumbnail] {
        photos.map { Thumbnail(decoding: $0.data) }
    }
}

struct GalleryView: View {
    @State private var gallery = Gallery()
    let photos: [Photo]

    var body: some View {
        ThumbnailGrid(gallery.thumbnails)   // body stays cheap
            .task(id: photos) { await gallery.load(photos) }
    }
}
```

**Compose**

```kotlin
@Composable
fun DraggableCard() {
    var offset by remember { mutableStateOf(Offset.Zero) }
    Box(
        Modifier
            // Lambda version: read in layout, so dragging skips recomposition
            .offset { IntOffset(offset.x.roundToInt(), offset.y.roundToInt()) }
            .pointerInput(Unit) {
                detectDragGestures { change, drag ->
                    change.consume()
                    offset += drag
                }
            }
            .size(120.dp)
    )
}

// A header that fades with scroll: read it in the draw phase.
Header(Modifier.graphicsLayer {
    alpha = 1f - (listState.firstVisibleItemScrollOffset / 300f).coerceIn(0f, 1f)
})
```

**React Native**

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

function DraggableCard({ onDrop }: { onDrop: (x: number, y: number) => void }) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const pan = Gesture.Pan()
    .onChange((e) => {               // a worklet, on the UI thread
      x.value += e.changeX;
      y.value += e.changeY;
    })
    .onEnd((e) => {
      x.value = withSpring(0, { velocity: e.velocityX });
      y.value = withSpring(0, { velocity: e.velocityY });
      scheduleOnRN(onDrop, e.absoluteX, e.absoluteY); // tell React once
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ width: 120, height: 160 }, style]} />
    </GestureDetector>
  );
}
```

**Flutter**

```dart
class SpinningBadge extends StatelessWidget {
  const SpinningBadge({super.key, required this.turns});
  final Animation<double> turns;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: turns,
      // Built once, not on every frame.
      child: const Badge(label: Text('New')),
      builder: (context, child) =>
          Transform.rotate(angle: turns.value * 2 * pi, child: child),
    );
  }
}

// Heavy work goes to another isolate, off the UI thread.
final thumbnails = await Isolate.run(() => decodeAll(photoBytes));
```

With Reduce Motion on, keep the drag itself one-to-one with the finger; Apple
lists tracking gestures directly as a way to reduce motion. Reanimated
animations follow the system setting by default (`ReduceMotion.System`), so
`withSpring` and `withTiming` jump to their end, and the card lands without
the settle.

### Resources

- [Eliminate animation hitches with XCTest](https://developer.apple.com/videos/play/wwdc2020/10077/): Apple's WWDC20 session that defines the hitch time ratio and its 5 and 10 ms/s thresholds.
- [Analyze hangs with Instruments](https://developer.apple.com/videos/play/wwdc2023/10248/): Why main-thread work should stay under 100 ms, and where micro hangs and hangs start.
- [Slow rendering](https://developer.android.com/topic/performance/vitals/render): Android's frame budgets at 60, 90 and 120 fps, and how slow and frozen frames are counted.
- [Reanimated performance guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/): Shared values on the UI thread, non-layout props, and how many views to animate at once.
- [Compose performance best practices](https://developer.android.com/develop/ui/compose/performance/bestpractices): Deferring state reads with lambda modifiers, lazy list keys, and derivedStateOf.
