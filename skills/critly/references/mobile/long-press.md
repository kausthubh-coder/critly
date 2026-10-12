# Mobile

## Long Press

> Show the hold, then open the menu.

- Section: Mobile
- URL: https://critly.vercel.app/long-press
- Published: 2026-10-12
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/mobile/long-press.mdx

A long press asks the finger to wait half a second with nothing to look at.
If the screen stays still, people can't tell a hold from a tap that didn't
register, so they lift early or press again. When the menu finally appears out
of nowhere, it isn't clear which item it belongs to.

Press and hold a note in both modes.

> **Interactive demo: Long Press.** Open https://critly.vercel.app/long-press to try it.

In the abrupt mode nothing moves for 500 ms, then a menu pops up in the middle
of the screen. In the shown mode the note shrinks while you hold, so you can
see the press working. When the hold completes, the haptic fires, the note
lifts out of a dimmed, blurred background and the menu opens right under it.
Lifting your finger keeps the menu open.

**Show the hold progressing, mark the moment it completes, and open the menu
attached to the thing you pressed.**

### Timing

| | iPhone | Android |
|---|---|---|
| Hold | **0.5 s** for a long-press gesture; moving more than **10pt** cancels. Context menus use a system timing Apple doesn't publish. | **400 ms** by default since Android 11 (500 ms before) |
| User setting | | Touch & hold delay: **400 / 1000 / 1500 ms** |
| Haptic | The system plays it when a context menu opens | `combinedClickable` plays it in Compose foundation 1.8+ |

Never hardcode the Android value. Some people set the delay to 1.5 seconds
because they need it, and a hardcoded 400 ms ignores that. In Compose, read
`LocalViewConfiguration.current.longPressTimeoutMillis`, or let
`combinedClickable` handle it.

Don't add a second haptic either. iOS plays its own when a context menu opens,
and since foundation 1.8, `combinedClickable` already performs
`HapticFeedbackType.LongPress` when `onLongClick` fires. Android's own docs
sample still calls `performHapticFeedback` inside `onLongClick`, which fires it
twice. See [Haptics](https://critly.vercel.app/haptics) for the rest.

### What the hold opens

On iPhone a long press opens a context menu with a preview. On Android, a long
press on an item in a list or grid enters selection mode, and a contextual top
bar holds the actions for everything selected. Try both.

> **Interactive demo: Context Menu.** Open https://critly.vercel.app/long-press to try it.

The menu itself follows a few rules from Apple's guidelines:

- Keep it short, in about three groups at most.
- Put the most frequent items nearest the finger.
- Put destructive items **last**, in red.
- Hide items that don't apply instead of dimming them.
- Make every item reachable somewhere else too, in a toolbar or a ··· button.
  A long press is a shortcut, as [Gestures](https://critly.vercel.app/gestures) explains.

In Android selection mode, a tap toggles an item instead of opening it, and
Back leaves selection mode before it leaves the screen.

In Expo, use the native menus where you can. On iOS, Expo Router's
`Link.Preview` and `Link.Menu` give a real context menu with a preview (iOS
only, SDK 54+; only push navigation works). On Android, build selection mode
yourself. For a custom hold, use Gesture Handler's `LongPress` and drive the
shrink with Reanimated, as below.

### Usage

**SwiftUI**

```swift
NoteRow(note)
    // Match the lift to the visible corners
    .contentShape(.contextMenuPreview, .rect(cornerRadius: 12))
    .contextMenu {
        Button("Pin", systemImage: "pin") { pin(note) }
        Button("Share", systemImage: "square.and.arrow.up") { share(note) }
        Section {
            Button("Delete", systemImage: "trash", role: .destructive) { delete(note) }
        }
    } preview: {                       // iOS 16+
        NotePreview(note)
    }
// No .sensoryFeedback here: the system already plays one.
```

**Compose**

```kotlin
PhotoCell(
    photo, isSelected,
    Modifier.combinedClickable(
        onClick = { if (selecting) toggle(photo.id) else open(photo) },
        onLongClick = { select(photo.id) }, // haptic already fired (foundation 1.8+)
        onLongClickLabel = "Select",
    ),
)
if (selecting) SelectionTopBar(count = selected.size, onClear = ::clearSelection)
BackHandler(enabled = selecting) { clearSelection() } // Back exits selection first
```

**React Native**

```tsx
// Gesture Handler 2.x + Reanimated 4 + expo-haptics, for a custom hold.
const scale = useSharedValue(1);
const hold = Gesture.LongPress()
  .minDuration(500) // the RNGH default
  .maxDistance(10)  // moving 10pt cancels
  .onBegin(() => {
    scale.value = withTiming(0.97, { duration: 500 }); // show the hold working
  })
  .onStart(() => {
    scale.value = withSpring(1);
    scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Medium);
    scheduleOnRN(openMenu, note.id);
  })
  .onFinalize((_e, success) => {
    if (!success) scale.value = withSpring(1);
  });
const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

<GestureDetector gesture={hold}>
  <Animated.View
    style={style}
    accessibilityActions={[{ name: "longpress", label: "Show actions" }]}
    onAccessibilityAction={() => openMenu(note.id)}
  >
    <NoteRow note={note} />
  </Animated.View>
</GestureDetector>
```

Give the long press a name for assistive tech. In Compose, `onLongClickLabel`
becomes the action TalkBack reads. A hold you build from raw touch events is
invisible to VoiceOver and TalkBack, so add an accessibility action for it by
hand, and keep the visible ··· route. With
Reduce Motion on, drop the shrink and lift and keep the dim, the haptic and the
anchored menu.

### Resources

- [Apple HIG: Context menus](https://developer.apple.com/design/human-interface-guidelines/context-menus): How many items, which go first, why destructive goes last, and the preview.
- [contextMenu(menuItems:preview:)](https://developer.apple.com/documentation/swiftui/view/contextmenu(menuitems:preview:)): The SwiftUI modifier for a context menu with a custom preview, iOS 16 and later.
- [Tap and press (Compose)](https://developer.android.com/develop/ui/compose/touch-input/pointer-input/tap-and-press): combinedClickable with onLongClick and its accessibility label.
- [Expo Router: Link preview](https://docs.expo.dev/router/reference/link-preview/): Link.Preview and Link.Menu for native iOS context menus in React Native.
- [Gesture Handler: Long press gesture](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/use-long-press-gesture/): The 500 ms and 10pt defaults, and cancelling when the finger moves away.
