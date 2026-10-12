# Mobile

## Safe Areas

> Paint to the edges, keep content inside.

- Section: Mobile
- URL: https://critly.vercel.app/safe-areas
- Published: 2026-10-12
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/mobile/safe-areas.mdx

A phone screen isn't a rectangle. The Dynamic Island or a camera cutout,
the status bar, the rounded corners and the home indicator all take space
along the edges. Put text there and it gets covered. Stop the background
there and the app looks letterboxed.

> **Interactive demo: Safe Area.** Open https://critly.vercel.app/safe-areas to try it.

Ignored, the title runs into the status bar and the Play button sits on
the home indicator, where a swipe up goes home instead. Boxed, everything
is readable, but the app stops short of the edges with plain bars above
and below. Edge to edge, the background fills the screen and only the
content keeps its distance.

**Let backgrounds and scrolling content run to the edges of the screen, and keep text and controls inside the safe area.**

### iPhone

SwiftUI keeps views inside the safe area by default. Two modifiers do the
rest:

- `ignoresSafeArea()` on backgrounds only. Put it on the whole screen and
  your buttons go under the home indicator.
- `safeAreaInset(edge:)` for a custom bar. It shrinks the safe area for
  everything else, so a scroll view's last row can still clear the bar.

Since iOS 26, bars float on [Liquid Glass](https://critly.vercel.app/liquid-glass) with a scroll
edge effect. Apple says to use that instead of a solid color behind
controls, so don't paint opaque backgrounds onto system bars.

### Android

Android 15 made apps that target API 35 edge-to-edge. The status bar and
the gesture navigation bar are transparent, and 3-button navigation gets
an 80% opaque scrim. Android 16 removed the opt-out for apps that target
API 36. Google Play has required API 36 for new apps and updates since
2026-08-31, so every app you ship is edge-to-edge now.

Call `enableEdgeToEdge()` for the same behavior on older versions. In
Compose, Material 3's `Scaffold` pads its bars and passes the remaining
insets to your content. Use `WindowInsets.safeDrawing` for anything you
draw yourself. Don't wrap the root in `systemBarsPadding()`, which brings
the letterbox back.

### React Native and Expo

Wrap the app in `SafeAreaProvider` and use `SafeAreaView` from
react-native-safe-area-context, with only the edges a screen needs. Expo
Router's native header and native tabs already handle their own edges, so
a screen under both often needs no edges at all. The library's
`SafeAreaView` applies insets natively; the `useSafeAreaInsets` hook is
for custom layouts and can cause layout flicker in some cases.

The `SafeAreaView` in React Native core has been deprecated since 0.81. It
only ever worked on iOS. React Native 0.81 targets API 36, and Expo made
edge-to-edge mandatory on Android in SDK 54, so Android has real insets
too. `Platform.OS === "android" ? 0 : insets.top` and
`StatusBar.currentHeight` hacks are wrong now.

In Flutter, `SafeArea` pads all four edges by default. Read
`MediaQuery.paddingOf(context)` when you need the numbers.

### Scroll under the bars

A list should start below the top bar and end above the tab bar, but
scroll under both. That needs padding inside the scroll view, not around
it.

> **Interactive demo: Edge To Edge.** Open https://critly.vercel.app/safe-areas to try it.

With an overlay, the tab bar is drawn on top and the list doesn't know, so
the last row can never scroll out from under it. With padding on the scroll
view, the list stops dead at the bars: nothing passes under them, and the
space beside and below the floating tab bar sits empty. With
a content inset, the list fills the screen and its content is padded by the
bars and the insets. Compose calls this `contentPadding`, iOS does it
automatically for system bars, and React Native needs
`contentInsetAdjustmentBehavior="automatic"` or a `paddingBottom` in
`contentContainerStyle`.

### Never hard-code an inset

The insets change between models and in landscape, where the camera cutout
moves to one side and the side insets grow. On iPhone Duo, the outer display puts the
tab bar and toolbar in a strip on one side, so the left and right insets
differ. iOS 27 also lets iPhone apps resize freely in iPhone Mirroring and
on iPad. Read the insets from the system every time. A `padding(.top, 47)`
or `24.dp` that fits your phone is wrong on the next one.

### Usage

**SwiftUI**

```swift
ZStack {
    LinearGradient(colors: [.indigo, .black], startPoint: .top, endPoint: .bottom)
        .ignoresSafeArea()                 // the background only
    ScrollView {
        SongList()                         // content stays in the safe area
    }
    .safeAreaInset(edge: .bottom) {        // iOS 15+: the list scrolls clear of it
        PlayButton()
            .padding(.horizontal)
            .padding(.bottom, 8)
    }
}
```

**Compose**

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { AppTheme { Library() } }
    }
}

@Composable
fun Library() {
    Scaffold(
        topBar = { TopAppBar(title = { Text("Library") }) },
        bottomBar = { NavigationBar { /* items */ } },
    ) { inner ->
        LazyColumn(
            contentPadding = inner,        // not Modifier.padding(inner)
            modifier = Modifier.fillMaxSize().consumeWindowInsets(inner),
        ) { items(songs, key = { it.id }) { SongRow(it) } }
    }
}
```

**React Native**

```tsx
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Root: <SafeAreaProvider><Stack /></SafeAreaProvider>

// The native header covers the top, so pad only the bottom.
export function PlaylistScreen() {
  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <SongList />
      <PlayButton />
    </SafeAreaView>
  );
}

// A list under your own floating bar: pad the content, not the list.
export function Library() {
  const insets = useSafeAreaInsets();
  return (
    <FlashList
      data={songs}
      renderItem={({ item }) => <SongRow song={item} />}
      contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT }}
    />
  );
}
```

**Flutter**

```dart
Scaffold(
  extendBody: true,                  // the body runs under the bottom bar
  bottomNavigationBar: const FloatingTabBar(),
  body: Stack(children: [
    const Positioned.fill(child: HeroGradient()),   // paints to the edges
    SafeArea(
      bottom: false,                 // the list pads its own bottom
      child: ListView(
        padding: EdgeInsets.only(bottom: MediaQuery.paddingOf(context).bottom + 72),
        children: songs.map(SongTile.new).toList(),
      ),
    ),
  ]),
);
```

The safe area doesn't include the keyboard. In react-native-safe-area-context
the insets ignore it, and Compose's `Scaffold` leaves the IME out of its
default insets. Handle it separately, as in [Soft Keyboard](https://critly.vercel.app/soft-keyboard).
Keep anything people drag, like a slider or a carousel, out of the bottom
gesture area and the side back-gesture zones too, or the system takes the
swipe before your app does.

### Resources

- [Layout in the Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/layout): Apple on safe areas, extending backgrounds under bars, and laying out by size class instead of device.
- [Edge-to-edge enforcement in Android 15](https://developer.android.com/about/versions/15/behavior-changes-15#edge-to-edge): Exactly what changes for the status bar, gesture navigation and 3-button navigation when you target API 35.
- [About window insets](https://developer.android.com/develop/ui/compose/system/insets): The Compose inset types, safeDrawing, and how Scaffold hands insets to your content.
- [react-native-safe-area-context](https://appandflow.github.io/react-native-safe-area-context/usage): Why SafeAreaView beats the insets hook for most screens, and which edges to apply.
- [React Native 0.81](https://reactnative.dev/blog/2025/08/12/react-native-0.81): Why core SafeAreaView is deprecated, and how React Native handles Android 16's edge-to-edge.
