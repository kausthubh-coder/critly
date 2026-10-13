# Mobile

## Gestures

> Every gesture that acts needs a visible twin.

- Section: Mobile
- URL: https://critly.vercel.app/gestures
- Published: 2026-10-12
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/mobile/gestures.mdx

A gesture has no label. Nobody sees a swipe or a double tap until they try it,
so a gesture that is the only way to do something is a feature most people
never find. Gestures also cost something you can feel: a double tap makes
every single tap on the same view wait.

Tap each photo once.

> **Interactive demo: Double Tap Delay.** Open https://critly.vercel.app/gestures to try it.

The left photo also listens for a double tap to like. After your first tap it
can't know whether a second one is coming, so it waits out the double-tap
window before it selects. The right photo has no double tap; the heart button
likes it, and the tap answers in a frame.

**Treat every gesture that triggers an action as a shortcut for something people can see and tap; direct manipulation like scrolling, pinching and dragging needs no twin.**

### The vocabulary

People already know what these mean. Use them for the same things, and don't
give a familiar gesture a meaning that only your app has.

| Gesture | What it does | Notes |
|---|---|---|
| Tap | Activate, select | Fires on lift |
| Double tap | Zoom in and out | Delays single taps on the same view |
| Touch and hold | More options: a context menu on iOS, selection on Android | See [Long Press](https://critly.vercel.app/long-press) |
| Swipe | Reveal row actions, dismiss, scroll, switch pages | See [Swipe Actions](https://critly.vercel.app/swipe-actions) |
| Drag | Move an item, pull a sheet | Long press, then drag, reorders |
| Pinch | Zoom, magnify | |
| Rotate | Rotate a selected item | |
| Edge swipe | Back | System owned, see below |

### The double-tap tax

A single tap can't fire until the double tap has failed, and that takes a
fixed window after the finger lifts.

- **Android:** `DOUBLE_TAP_TIMEOUT` is **300 ms**. Compose's
  `detectTapGestures` holds `onTap` back whenever `onDoubleTap` is set, and
  `combinedClickable(onDoubleClick = …)` does the same.
- **React Native Gesture Handler:** `Exclusive(doubleTap, singleTap)` waits up
  to `maxDelay`, **200 ms** by default.
- **iOS:** a single tap that `require(toFail:)` a double tap waits for it.
  Apple doesn't publish the window.
- **Flutter:** a `GestureDetector` with both `onTap` and `onDoubleTap` holds
  the tap until the double tap loses; `kDoubleTapTimeout` is **300 ms**.

So add a double tap only where the single tap does nothing else, or where the
wait doesn't matter, like double tap to zoom a photo that's already open. If
like is the main thing people do in a feed, give it a button.

### System gestures

Some swipes belong to the system. Don't build anything that competes with them.

- **iOS:** swipe in from the leading edge to go back, and since iOS 26 a
  left-to-right pan anywhere in a pushed screen does it too. Leave the bottom
  edge to the home indicator and the top edge to Notification Center and
  Control Center.
- **Android:** back is an inward swipe from **either** edge. You can exclude
  small strips, like a slider thumb, but the system honors at most **200dp**
  of exclusion per edge. Apps can't opt out of the home and quick-switch
  swipes at the bottom.

See [Back Navigation](https://critly.vercel.app/back-navigation) for building back itself, and for
what the iOS 26 swipe means for horizontal gestures in pushed screens.

### Pan against scroll

A horizontal drag inside a vertical list has to decide which way it's going
before it takes the touch. Give it a small dead zone: about 10pt of
horizontal movement before the pan starts, and a fail if the finger moves
10pt vertically first. It's close to the system's own touch slop, so the
list scrolls as people expect, and small enough that the drag still feels
immediate. That's `activeOffsetX` and `failOffsetY` in Gesture Handler.
Compose's `draggable` and `anchoredDraggable` wait for the 8dp touch slop in
their own direction, so a vertical `LazyColumn` still scrolls. In a pushed iOS
26 screen, a left-to-right pan also competes with
[back](https://critly.vercel.app/back-navigation).

### Give every gesture a twin

This is for gestures that do something, like archive, delete or like.
Scrolling a list, pinching a photo or dragging a map is the content
answering the finger, and people try it without being told.

Each gesture in this inbox has a visible equivalent. Use the gestures, then
turn them off and do the same things with the ··· button.

> **Interactive demo: Gesture Twin.** Open https://critly.vercel.app/gestures to try it.

With gestures off, nothing is out of reach. Apple's own rule for context menus
is the same: "Always make context menu items available in the main interface,
too." A gesture makes something faster for people who know it. The visible
button is what makes it possible for everyone else, and for VoiceOver,
TalkBack, Switch Control and keyboards.

### Usage

**SwiftUI**

```swift
// The gesture is a shortcut; the menu is always there.
MailRow(mail)
    .swipeActions(edge: .trailing) {
        Button("Archive", systemImage: "archivebox") { archive(mail) } // iOS 17+ initializer
    }
    .contextMenu { MailActions(mail) }
    .overlay(alignment: .trailing) {
        Menu { MailActions(mail) } label: {
            Image(systemName: "ellipsis").frame(width: 44, height: 44)
        }
        .accessibilityLabel("Actions")
    }
```

**Compose**

```kotlin
// No onDoubleClick on a primary tap target: it delays every onClick.
Box(
    Modifier.combinedClickable(
        onClick = { open(photo) },
        onLongClick = { select(photo) },
        onLongClickLabel = "Select",
    )
) {
    PhotoImage(photo)
    IconButton(onClick = { like(photo) }, Modifier.align(Alignment.BottomEnd)) {
        Icon(Icons.Outlined.FavoriteBorder, contentDescription = "Like")
    }
}
```

**React Native**

```tsx
// Gesture Handler 2.x (Expo SDK 57)
// Double tap to zoom an open photo, where the single-tap wait is fine.
const doubleTap = Gesture.Tap().numberOfTaps(2).onEnd(() => {
  zoom.value = withSpring(zoom.value > 1 ? 1 : 2);
});
const singleTap = Gesture.Tap().onEnd(() => scheduleOnRN(toggleChrome));
const taps = Gesture.Exclusive(doubleTap, singleTap); // single waits up to 200 ms

// A horizontal pan inside a vertical list: decide the axis first.
const pan = Gesture.Pan().activeOffsetX([-10, 10]).failOffsetY([-10, 10]);
```

**Flutter**

```dart
// onDoubleTap makes onTap wait up to kDoubleTapTimeout (300 ms).
// Fine on an open photo, wrong on a feed card people tap all day.
GestureDetector(
  onTap: toggleChrome,
  onDoubleTap: toggleZoom,
  child: PhotoView(photo),
)

// In the feed: tap opens, like is a visible button.
GestureDetector(
  onTap: () => open(photo),
  child: Stack(children: [
    PhotoTile(photo),
    Align(
      alignment: Alignment.bottomRight,
      child: IconButton(
        icon: const Icon(Icons.favorite_border),
        tooltip: 'Like',
        onPressed: () => like(photo),
      ),
    ),
  ]),
)
```

Custom gestures are invisible to assistive tech. VoiceOver and TalkBack replace
touch with their own gestures, so a swipe or a double tap you built does
nothing for them. Expose each one as an accessibility action, and keep the
button on screen.

### Resources

- [Apple HIG: Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures): The standard iOS gestures, and why a custom gesture must never be the only way.
- [Ensure compatibility with gesture navigation](https://developer.android.com/develop/ui/views/touch-and-input/gestures/gesturenav): Android's back and home gestures, exclusion rects and the gesture insets.
- [interactiveContentPopGestureRecognizer](https://developer.apple.com/documentation/uikit/uinavigationcontroller/interactivecontentpopgesturerecognizer): The iOS 26 back swipe that works from anywhere in a pushed screen.
- [Gesture Handler: Tap gesture](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/use-tap-gesture/): Tap defaults in React Native Gesture Handler, including the 200 ms gap between taps.
- [Using Swipe to Trigger Contextual Actions](https://www.nngroup.com/articles/contextual-swipe/): NN/g on why hidden swipe actions are hard to find and need a visible route.
