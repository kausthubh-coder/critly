# Mobile

## Bottom Sheets

> Detents, a grabber, and a swipe down.

- Section: Mobile
- URL: https://critly.vercel.app/bottom-sheets
- Published: 2026-10-12
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/mobile/bottom-sheets.mdx

A bottom sheet is a drag surface with a list inside it. It has to rest at a
few set heights, follow the finger between them, guess where a flick was
going, and share one gesture with the scroll inside. Hand-rolled sheets get
one of those wrong and feel heavy, or trap you.

> **Interactive demo: Sheet Detents.** Open https://critly.vercel.app/bottom-sheets to try it.

**Give a sheet a few resting heights and a grabber, let the flick pick the
height, and let a swipe down close it.**

### Detents and the grabber

The resting heights are called detents. iOS has two built in: large, the
full height, and medium, about half. You can add your own with `.height` or
`.fraction`. A sheet with only `.medium` can't grow, and `.medium` is
inactive in compact height, so a landscape iPhone skips it. Apple's rule for
the grabber: include one in any resizable sheet. People drag it, tap it to
step through the detents, and VoiceOver can operate it.

|  | iPhone | Android |
|---|---|---|
| Handle | Grabber, drawn by the system | 32 × 4dp, in a 48dp tall touch row |
| Corners | System, inset Liquid Glass on iOS 26 | 28dp on top |
| Heights | `.medium`, `.large`, custom | Half the screen, then full; `skipPartiallyExpanded` goes straight to full |
| Behind | Dimmed when modal | Scrim at 32% |
| Width | Full width | Up to 640dp, centred on tablets |

On iOS 26, partial-height sheets float inset on Liquid Glass with their
bottom corners pulled in, and they can grow out of the button that opened
them. Apple's advice is to remove any custom `presentationBackground` so the
glass shows.

### The flick picks the detent

Track the finger 1:1. On release, project the throw forward as described in
[Momentum](https://critly.vercel.app/momentum), snap to the detent nearest that point, and hand the
release velocity to a [spring](https://critly.vercel.app/springs). A quick flick from the bottom can
skip medium and land at large. In the demo, the sky marks are the detents
and the dot is where your last flick was headed.

Only dim what's blocked. A sheet for a side task, like Maps' search panel,
leaves the map usable below a certain height:
`presentationBackgroundInteraction(.enabled(upThrough: .medium))` on iOS, or
`sheetLargestUndimmedDetentIndex` on a React Native formSheet. In the demo the
map stays tappable at the two lower detents and fades in a scrim only on the
way to large.

### Scroll, then drag

A sheet with a list in it needs the scroll and the drag to share one
gesture. Scroll the comments on each.

> **Interactive demo: Sheet Scroll.** Open https://critly.vercel.app/bottom-sheets to try it.

With a plain scroll view in a fixed sheet, the list bounces at the top and
the sheet never moves. The X is the only way out. The handoff works in both
directions:

- **Finger up at a lower detent**: the sheet grows to its top detent first,
  then the list scrolls. This is the iOS default; `presentationContentInteraction(.scrolls)`
  turns it off.
- **Finger down with the list at the top**: the same drag keeps going as a
  sheet drag, toward a lower detent or closed.

Platform sheets do this for you. `ModalBottomSheet` wires a `LazyColumn`'s
nested scroll for you. On iOS, a React Native formSheet expands when the
list is scrolled to its edge, by default. In `@gorhom/bottom-sheet` the list must be its
`BottomSheetFlatList`, `BottomSheetScrollView` or `BottomSheetFlashList`; a
plain `ScrollView` breaks it. In Flutter, use `isScrollControlled: true` with
a `DraggableScrollableSheet`.

### Closing

Swipe down closes a sheet, but give it a visible Close or Done too, and let
the system back gesture close it. On Android that comes with
`ModalBottomSheet`, as a predictive back animation. If the sheet holds
unsaved edits, block the swipe with `interactiveDismissDisabled(hasChanges)`
and confirm on Cancel. iOS lets you present a sheet from a sheet, but
usually avoid it: each layer is one more swipe to get out, and the one
below gets hard to see. Push the next step inside the sheet instead.

In React Native and Expo, start with the native sheet: `presentation:
"formSheet"` with `sheetAllowedDetents` in the native stack or Expo Router.
Android allows at most 3 detents, and the grabber is off by default. Reach for
`@gorhom/bottom-sheet` v5 when you need a persistent non-modal sheet, a custom
handle or backdrop, more detents, or a footer that rides the keyboard. Its
`enableDynamicSizing` is on by default and adds a snap point for the
content's height, which shifts your indexes.

### Usage

**SwiftUI**

```swift
// A Maps-style panel: three detents, the map usable up to medium.
.sheet(isPresented: .constant(true)) {
    PlacesPanel()
        .presentationDetents([.height(120), .medium, .large], selection: $detent)
        .presentationDragIndicator(.visible)
        .presentationBackgroundInteraction(.enabled(upThrough: .medium)) // iOS 16.4
        .interactiveDismissDisabled()           // a panel, not a task
}

// A task sheet that protects unsaved edits.
.sheet(isPresented: $isEditing) {
    NavigationStack {
        EditorForm(draft: $draft)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { draft.hasChanges ? (confirm = true) : close() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { save() }
                }
            }
    }
    .presentationDetents([.medium, .large])
    .interactiveDismissDisabled(draft.hasChanges)
}
```

**Compose**

```kotlin
var show by rememberSaveable { mutableStateOf(false) }
val sheetState = rememberModalBottomSheetState()   // half, then full
val scope = rememberCoroutineScope()

if (show) {
    ModalBottomSheet(
        onDismissRequest = { show = false },       // swipe, scrim tap, back
        sheetState = sheetState,
    ) {
        // Nested scroll is wired: the list scrolls, then drags the sheet.
        LazyColumn(Modifier.weight(1f, fill = false)) {
            items(comments, key = { it.id }) { CommentRow(it) }
        }
        TextButton(onClick = {
            // Hide first so the exit animates, then remove it.
            scope.launch { sheetState.hide() }.invokeOnCompletion {
                if (!sheetState.isVisible) show = false
            }
        }) { Text("Close") }
    }
}
```

**React Native**

```tsx
// Expo Router: a native sheet (UIModalPresentationFormSheet on iOS,
// BottomSheetBehavior on Android).
<Stack.Screen
  name="comments"
  options={{
    presentation: "formSheet",
    sheetAllowedDetents: [0.5, 1],      // Android: at most 3
    sheetGrabberVisible: true,          // iOS; off by default
    sheetLargestUndimmedDetentIndex: 0, // no dim at half height
  }}
/>

// @gorhom/bottom-sheet v5, when you need more than that.
<BottomSheet
  snapPoints={["25%", "50%", "90%"]}
  enableDynamicSizing={false}           // or it adds a content-height point
  enablePanDownToClose
>
  <BottomSheetFlatList data={comments} renderItem={renderComment} />
</BottomSheet>
```

**Flutter**

```dart
showModalBottomSheet(
  context: context,
  isScrollControlled: true,  // otherwise capped at 9/16 of the screen
  useSafeArea: true,
  showDragHandle: true,
  builder: (context) => DraggableScrollableSheet(
    expand: false,
    initialChildSize: 0.5,
    snap: true,
    snapSizes: const [0.5],
    builder: (context, controller) => ListView.builder(
      controller: controller,  // the list and the sheet share the drag
      itemCount: comments.length,
      itemBuilder: (_, i) => CommentTile(comments[i]),
    ),
  ),
);
```

The grabber is a real control: name it with the current height and let a
tap step through the others. Under reduced motion, keep the sheet
tracking the finger and settle it without bounce; skip the morph from the
source button and fade instead.

### Resources

- [Sheets, Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/sheets): Apple on medium and large detents, the grabber, swipe to dismiss, and protecting unsaved changes.
- [Bottom sheets in Compose](https://developer.android.com/develop/ui/compose/components/bottom-sheets): ModalBottomSheet and SheetState, including hiding the sheet before you remove it.
- [Native Stack Navigator](https://reactnavigation.org/docs/native-stack-navigator): The formSheet presentation for React Native, with sheetAllowedDetents, the grabber and undimmed detents.
- [React Native Bottom Sheet props](https://gorhom.dev/react-native-bottom-sheet/props): The props of @gorhom/bottom-sheet v5, for the sheets a native formSheet can't do.
- [Bottom Sheets: Definition and UX Guidelines](https://www.nngroup.com/articles/bottom-sheet/): Nielsen Norman Group on visible close buttons, Back closing the sheet, and not stacking sheets.
