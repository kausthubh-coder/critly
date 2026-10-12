# Mobile

## Native Lists

> Recycle rows, keep the scroll at full rate.

- Section: Mobile
- URL: https://critly.vercel.app/native-lists
- Published: 2026-10-12
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/mobile/native-lists.mdx

Feeds, inboxes and chats are most of what people do in an app, and a fling
moves dozens of rows across the screen every second. Every row that arrives
is work for that frame. If each one is a brand-new component, a fast fling
becomes a burst of creation work, and every row ever shown stays in memory.

> **Interactive demo: Recycling.** Open https://critly.vercel.app/native-lists to try it.

The first list maps all 500 rows into a scroll view, so every row that has
been on screen stays mounted and the counts only climb. The second keeps a
pool of about a dozen cells. A row that leaves the top hands its cell to the row
arriving at the bottom, which re-renders it with new data. Watch the cell
tags repeat.

**Use the platform's recycling list, give every row a stable key and a type, and keep each row cheap enough to fill inside one frame.**

The frame budget is the one from [UI Thread](https://critly.vercel.app/ui-thread): 8.3 ms at 120 Hz,
for every row that scrolls in during that frame. How much to render at all is
covered in [Long Lists](https://critly.vercel.app/long-lists).

### React Native and Expo

Use FlashList v2. When a row leaves the screen, "instead of being destroyed,
the component is re-rendered with a different `item` prop."

- v2 asks for no size estimates, so drop `estimatedItemSize`. It needs the
  New Architecture.
- `keyExtractor` returns the item's id, never the index. `getItemType`
  separates mixed rows, so a header cell is never reused for a photo post.
- `useState` inside a row leaks into the next item that cell shows. Use
  `useRecyclingState(initial, [item.id])`, which resets when the item changes.
- Hoist `renderItem` and memoize the row. FlashList's docs say memoizing the
  props you pass matters more in v2.
- Use `expo-image` with `recyclingKey={item.id}`, so a reused cell shows its
  placeholder instead of the previous row's photo. `placeholderContentFit`
  defaults to `scale-down` while `contentFit` defaults to `cover`, so set
  both. Load thumbnail URLs, not full-size images.

FlatList also virtualizes, but by mounting and unmounting rows, with
`windowSize` 21 by default: the visible screen plus 10 screens above and 10
below. It's fine for short lists; for feeds use FlashList.

### Compose

`LazyColumn` reuses compositions, but only between items of the same
`contentType`. Pass `key = { it.id }` and `contentType` on every lazy list.
The key must be a type a `Bundle` can hold (an `Int`, a `String`, a
`Parcelable`) so `rememberSaveable` state comes back. Keep row models
immutable so unchanged rows skip recomposition.

### SwiftUI

`List` gives you the platform's rows: separators, swipe actions, edit mode
and `.refreshable`. A `LazyVStack` in a `ScrollView` creates rows as they
appear but estimates the height of rows it hasn't placed yet from the
average of the ones it has, so rows of very different heights make the
offset shift as you scroll. Either way, loop over `Identifiable` items with
an id that never changes. A new id destroys the row's state and animations.

### Flutter

`ListView.builder` builds rows lazily. `itemExtent` or `prototypeItem` tells
it every row's height up front, which makes long jumps cheap. Give rows that
hold state a `ValueKey` of the item's id.

### Pull to refresh

Use the platform's control. Pull the list on each platform.

> **Interactive demo: Pull To Refresh.** Open https://critly.vercel.app/native-lists to try it.

iOS pulls the content down and reveals a spinner above it. Android leaves
the content where it is and drops a circular indicator over it. Both keep the
indicator up for as long as the refresh runs.

- SwiftUI: `.refreshable { await store.refresh() }` (iOS 15). The spinner stays
  until the async action returns.
- Compose: `PullToRefreshBox(isRefreshing, onRefresh)` around the
  `LazyColumn`.
- React Native: `refreshControl={<RefreshControl ... />}`. `refreshing` is
  controlled, so set it to `true` in `onRefresh`, or the spinner stops at once.

Refresh on your own too, when the screen opens or the app comes back to the
foreground. The pull is a shortcut, so a person who never pulls still sees new
data ([Gestures](https://critly.vercel.app/gestures)).

### Back to the top

On iPhone, a tap on the status bar scrolls the scroll view closest to it to
the top. UIKit turns this on by default, but on iPhone it does nothing if more
than one scroll view on screen has `scrollsToTop` on
([Apple](https://developer.apple.com/documentation/uikit/uiscrollview/scrollstotop)).
Horizontal carousels inside a feed count, so switch it off on them. On both
platforms, tapping the tab you're already on should go back to that tab's
root, and if you're already there, scroll to the top
([Back Navigation](https://critly.vercel.app/back-navigation)).

Measure all of this in a release build on a low-end Android phone. Debug
builds run slower code, and a simulator on a fast laptop hides what a slow
phone does with a fling.

### Usage

**SwiftUI**

```swift
struct InboxView: View {
    @State private var store = InboxStore()

    var body: some View {
        // Message is Identifiable with an id that never changes.
        List(store.messages) { message in
            MessageRow(message: message)
                .swipeActions {
                    Button("Archive") { store.archive(message) }
                }
        }
        .listStyle(.plain)
        .refreshable { await store.refresh() } // iOS 15+
        .task { await store.refresh() }        // refresh on open, too
    }
}
```

**Compose**

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Inbox(state: InboxState, onRefresh: () -> Unit) {
    PullToRefreshBox(isRefreshing = state.refreshing, onRefresh = onRefresh) {
        LazyColumn(Modifier.fillMaxSize()) {
            items(
                items = state.items,
                key = { it.id },               // stable, and Bundle-safe
                contentType = { it::class },   // reuse rows only for the same kind
            ) { item ->
                when (item) {
                    is DayHeader -> DayHeaderRow(item)
                    is Message -> MessageRow(item) // an immutable data class
                }
            }
        }
    }
}
```

**React Native**

```tsx
import { FlashList, useRecyclingState } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, RefreshControl, Text } from 'react-native';

const MessageRow = memo(function MessageRow({ item }: { item: Message }) {
  const [open, setOpen] = useRecyclingState(false, [item.id]); // resets on reuse
  return (
    <Pressable onPress={() => setOpen((v) => !v)} style={styles.row}>
      <Image
        source={item.avatarThumbUrl}
        placeholder={{ blurhash: item.blurhash }}
        contentFit="cover"
        placeholderContentFit="cover" // defaults differ, so match them
        recyclingKey={item.id}        // no flash of the last row's photo
        style={styles.avatar}
      />
      <Text numberOfLines={open ? undefined : 1}>{item.preview}</Text>
    </Pressable>
  );
});

const renderItem = ({ item }: { item: Message }) => <MessageRow item={item} />;

<FlashList
  data={messages}
  renderItem={renderItem}
  keyExtractor={(m) => m.id}
  getItemType={(m) => m.kind}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
/>
```

**Flutter**

```dart
RefreshIndicator(
  // The indicator stays until this Future completes.
  onRefresh: inbox.refresh,
  child: ListView.builder(
    itemCount: messages.length,
    // Every row's height up front, so long jumps are cheap.
    prototypeItem: const MessageTile.placeholder(),
    itemBuilder: (context, i) => MessageTile(
      key: ValueKey(messages[i].id),
      message: messages[i],
    ),
  ),
)
```

Recycled rows must not carry anything over from the item that used the cell
before: an expanded row, a checked box, a half-open swipe action, an
accessibility label. That bug only shows after a fling, so test by changing a
row, flinging away and flinging back.

### Resources

- [FlashList recycling](https://shopify.github.io/flash-list/docs/recycling): How FlashList reuses row components, and why state inside a row needs useRecyclingState.
- [expo-image](https://docs.expo.dev/versions/latest/sdk/image/): Placeholders, cache policies and the recyclingKey that keeps a reused cell from flashing an old photo.
- [Lists and grids in Compose](https://developer.android.com/develop/ui/compose/lists): Item keys, contentType and how LazyColumn reuses compositions between items of the same type.
- [Creating performant scrollable stacks](https://developer.apple.com/documentation/swiftui/creating-performant-scrollable-stacks): Apple on when lazy stacks pay off, and the layout correctness they trade for it.
- [Pull to refresh in Compose](https://developer.android.com/develop/ui/compose/components/pull-to-refresh): PullToRefreshBox, its state and indicator, wrapped around a LazyColumn.
