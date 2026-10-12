# Mobile

## Swipe Actions

> Reveal on a short swipe, commit on a long one.

- Section: Mobile
- URL: https://critly.vercel.app/swipe-actions
- Published: 2026-10-12
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/mobile/swipe-actions.mdx

A swipe on a list row has two jobs. A short swipe shows a few buttons and
waits. A long swipe runs the first one straight away. Everything depends on
the line between the two: if people can't see where it is, a peek deletes a
message, or a deliberate swipe does nothing.

> **Interactive demo: Swipe Actions.** Open https://critly.vercel.app/swipe-actions to try it.

**Let a short swipe reveal the actions and a long swipe commit the first one,
and make the moment it switches impossible to miss.**

### Which side does what

Mail set the convention, and Apple's documentation uses it as its example.
The leading edge (swipe right) toggles read. The trailing edge (swipe left)
holds Delete and Flag. Actions line up from the edge the swipe starts at, so
the first one sits at the screen edge, and a full swipe runs it. Give it the
destructive role and it turns red.

|  | iPhone | Android |
|---|---|---|
| Built in | `swipeActions` on `List` rows since iOS 15, on any row in iOS 27 with `swipeActionsContainer()` | `SwipeToDismissBox` dismisses; a row that reveals buttons needs `anchoredDraggable` |
| Full swipe | Runs the first action, nearest the edge | Material: runs the primary action, the last one at the end |
| Undo | Your own, for anything destructive | A Snackbar with one Undo action that stays until used |

Keep one meaning per direction, the same across the app. Nielsen Norman Group
found that apps disagree about what each direction does, so people forget
which is which. Two destructive actions on opposite edges guarantee mistakes.
Deletes that run on a full swipe get an Undo, never an alert (see
[Destructive Actions](https://critly.vercel.app/destructive-actions)).

### Announce the commit point

Compose's `SwipeToDismissBox` dismisses after a fixed 56dp drag, or a fling of
125dp/s, whatever the row's width. On a 400dp row that's 14% of the way
across. Try a short drag with each setting.

> **Interactive demo: Swipe Threshold.** Open https://critly.vercel.app/swipe-actions to try it.

With the default, a peek is a delete, and nothing on screen tells you you've
crossed the line until the row is gone. Set the threshold to a fraction of
the row instead, 40 to 50%, and change three things at the moment it arms:
the icon lets go of the edge and jumps to the finger, the colour fills, and a
[haptic](https://critly.vercel.app/haptics) fires. Drag back and it all reverses. Nothing commits
until the finger lifts.

I don't let a fast flick commit a destructive swipe. A flick opens or closes
the row. Only a release past the line you were shown deletes.

### Get the physics right

- **Lock the axis**. Claim the drag only after about 10pt of mostly
  horizontal travel (Android's touch slop is 8dp), and hand the touch back to
  the list if it goes vertical first. In Gesture Handler that's
  `activeOffsetX` plus `failOffsetY`.
- **Let velocity decide**. On release, project the flick forward (see
  [Momentum](https://critly.vercel.app/momentum)) and snap open or shut with a
  [spring](https://critly.vercel.app/springs) that starts at the finger's speed.
- **Give at the end**. With full swipe off, rubber band past the last
  button instead of stopping dead.
- **Keep one row open**. Opening another row, scrolling, or tapping
  elsewhere closes the open one. iOS 27's `swipeActionsContainer()` does
  exactly this for custom rows.

### The back swipe wants the same gesture

Since iOS 26, a pushed screen pops on a left-to-right pan anywhere in its
content, not only from the edge (see [Back Navigation](https://critly.vercel.app/back-navigation)).
So a leading swipe action on a row inside a pushed screen competes with
back. In UIKit, make `interactiveContentPopGestureRecognizer` wait for your
recognizer with `require(toFail:)`. I found no SwiftUI modifier for it, so on
pushed screens I keep row actions on the trailing edge. On Android, back owns
both screen edges, so start row swipes inside the `systemGestures` insets.

### Usage

**SwiftUI**

```swift
List(messages) { message in
    MessageRow(message)
        .swipeActions(edge: .leading, allowsFullSwipe: false) {
            Button { toggleRead(message) } label: {
                Label(message.isUnread ? "Read" : "Unread", systemImage: "envelope.open")
            }
            .tint(.blue)
        }
        .swipeActions(edge: .trailing) {      // full swipe runs the first: Delete
            Button(role: .destructive) { delete(message) } label: {
                Label("Delete", systemImage: "trash")
            }
            Button { archive(message) } label: {
                Label("Archive", systemImage: "archivebox")
            }
            Button { flag(message) } label: {
                Label("Flag", systemImage: "flag")
            }
            .tint(.orange)
        }
        .contextMenu { MessageActions(message) } // the same actions, no swipe
}

// iOS 27: custom rows outside List, one open at a time, closed on scroll.
// ScrollView { LazyVStack { rows.swipeActions { … } } }.swipeActionsContainer()
```

**Compose**

```kotlin
val state = rememberSwipeToDismissBoxState(
    positionalThreshold = { width -> width * 0.5f }, // not the fixed 56dp
)
SwipeToDismissBox(
    state = state,
    enableDismissFromStartToEnd = false,             // one direction, one meaning
    onDismiss = {
        onDelete(mail)
        scope.launch {
            val result = snackbar.showSnackbar("Deleted", actionLabel = "Undo")
            if (result == SnackbarResult.ActionPerformed) onUndo(mail)
        }
    },
    backgroundContent = {
        val armed = state.targetValue == SwipeToDismissBoxValue.EndToStart
        Box(
            Modifier.fillMaxSize()
                .background(if (armed) MaterialTheme.colorScheme.error
                            else MaterialTheme.colorScheme.surfaceContainerHighest)
                .padding(horizontal = 24.dp),
            contentAlignment = Alignment.CenterEnd,
        ) { Icon(Icons.Outlined.Delete, contentDescription = null) }
    },
) {
    ListItem(
        headlineContent = { Text(mail.subject) },
        trailingContent = { MailOverflowMenu(mail) }, // the visible twin
    )
}
```

**React Native**

```tsx
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import * as Haptics from "expo-haptics";

function MailRow({ mail, openRow }: Props) {
  const ref = useRef<SwipeableMethods>(null);
  return (
    <ReanimatedSwipeable
      ref={ref}
      rightThreshold={48}          // open past 48pt or on a flick
      overshootRight={false}       // stop at the buttons, no full swipe
      renderRightActions={(progress, drag) => (
        <MailActions mail={mail} drag={drag} />
      )}
      onSwipeableWillOpen={() => {
        if (openRow.current !== ref.current) openRow.current?.close();
        openRow.current = ref.current; // one row open at a time
        Haptics.selectionAsync();
      }}
    >
      <Row mail={mail} />
    </ReanimatedSwipeable>
  );
}

// A custom pan inside a vertical list: activate on x, fail on y.
// Gesture.Pan().activeOffsetX([-10, 10]).failOffsetY([-10, 10])
```

Every swipe needs a visible twin: a ••• button or a context menu on the row
with the same actions, which is also how keyboard, switch and screen reader
users reach them. In Compose, add the actions as `customActions` semantics.
Under reduced motion, keep the row tracking the finger and settle it without
bounce.

### Resources

- [swipeActions(edge:allowsFullSwipe:content:)](https://developer.apple.com/documentation/swiftui/view/swipeactions(edge:allowsfullswipe:content:)): Apple's reference for row swipe actions, their order from the edge, and the full swipe that runs the first one.
- [Swipe to dismiss or update](https://developer.android.com/develop/ui/compose/touch-input/user-interactions/swipe-to-dismiss): The Compose guide to SwipeToDismissBox, with a to-do list that swipes one way to finish and the other to delete.
- [ReanimatedSwipeable](https://docs.swmansion.com/react-native-gesture-handler/docs/components/reanimated_swipeable): Gesture Handler's swipeable row for React Native, with its thresholds, overshoot and open and close callbacks.
- [Using Swipe to Trigger Contextual Actions](https://www.nngroup.com/articles/contextual-swipe/): Nielsen Norman Group on why swipe actions are hard to discover, easy to trigger by accident, and need an undo.
- [Invisible Details of Interaction Design](https://rauno.me/craft/interaction-design): Rauno Freiberg on responding before a threshold and committing destructive gestures only on release.
