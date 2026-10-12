# Mobile

## Thumb Reach

> Put frequent actions where the thumb rests.

- Section: Mobile
- URL: https://critly.vercel.app/thumb-reach
- Published: 2026-10-12
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/mobile/thumb-reach.mdx

Most people tap their phone with one thumb. The thumb rests near the bottom
of the screen and sweeps an arc from there. The top of the screen, and the
far top corner most of all, takes a stretch or a shift of the grip. Put the
buttons people use all day up there and every tap costs that shuffle.

> **Interactive demo: Thumb Reach.** Open https://critly.vercel.app/thumb-reach to try it.

With the top bar, the menu, search and compose all sit in the stretch and
hard zones. With the bottom bar, the tabs, search and compose sit under the
thumb, and the only control left at the top is Edit, which people rarely
need.

**Put persistent, frequent controls at the bottom, keep content in the middle, and leave the top for actions people rarely take.**

### What the data says

Steven Hoober watched 1,333 people use their phones in public in 2013. Of
the 780 who were touching the screen, 49% held the phone in one hand. 36%
cradled it, holding it in one hand and tapping with that thumb or a finger
of the other, and 15% held it in both hands.
He also saw them change grip often, sometimes every few seconds. Josh Clark
drew the thumb zone from this kind of data: the bottom is comfortable, the
top demands a stretch, and you design for the most constrained grip.

Hoober's later work refines the map. People stretch and shift their grip to
reach anything on the screen, so no spot is out of reach. What changes is
accuracy: in the center, targets can sit as close as 7mm apart, while at
the top and bottom edges and in the corners they need about 11 to 12mm.
People also scroll what they read into the middle of the screen.

So the overlay above shows effort, not a wall. Read it like this:

- Bottom: the tab bar, search, the main action, compose. Reachable without a
  grip change.
- Middle: content, which people scroll to where they can see and tap it
  best.
- Top: titles, settings, rare and destructive actions, where a slip of
  the thumb won't reach them.
- Edges and corners: bigger targets than the minimum. See
  [Hit Areas](https://critly.vercel.app/hit-areas).

### Don't hide the navigation

A hamburger menu fails twice: it sits in the hardest corner, and it hides
the destinations. Nielsen Norman Group tested 179 people on six sites in
2016. On mobile, people used the navigation in 57% of tasks when it was
hidden and 86% when part of it was visible. Content discoverability dropped
by more than 20%, and tasks took 15% longer. A tab bar fits up to five
destinations, so show them there.

### The platforms moved down

- Safari on iOS 15 (2021) moved the address bar to the bottom, and kept a
  top option after people pushed back in the beta.
- Chrome added a bottom address bar on iOS on 2023-10-31 and on Android on
  2025-06-24. Google's reason: people prefer different positions depending
  on the size of their hands and devices.
- iOS 26 put a search tab at the trailing end of the tab bar, at the bottom.
- Material 3's navigation bar holds 3 to 5 destinations. Expressive cut its
  height from 80dp to 64dp.

### Big phones

Bigger phones make the stretch longer. In a 2018 CHI study of phones from
4 to 5.96 inches, people's grip moved up the phone as it got bigger, and
today's largest phones are bigger still. Don't answer "more actions" with a menu in the
top corner. Open a [bottom sheet](https://critly.vercel.app/bottom-sheets) from a button at the
bottom: it rises into the thumb's zone, and a swipe down closes it.

### Usage

**SwiftUI**

```swift
TabView {
    Tab("Inbox", systemImage: "tray.fill") {
        NavigationStack { InboxView() }
    }
    Tab("Sent", systemImage: "paperplane.fill") {
        NavigationStack { SentView() }
    }
    // iOS 18+; on iOS 26 it sits apart at the trailing end of the bar
    Tab(role: .search) {
        NavigationStack { SearchView() }
    }
}
.searchable(text: $query)

// In InboxView: the main action goes in the bottom toolbar
.toolbar {
    ToolbarItem(placement: .bottomBar) {
        Button("Compose", systemImage: "square.and.pencil") { compose() }
    }
}
```

**Compose**

```kotlin
Scaffold(
    bottomBar = {
        NavigationBar {   // 3 to 5 destinations
            tabs.forEach { tab ->
                NavigationBarItem(
                    selected = current == tab,
                    onClick = { current = tab },
                    icon = { Icon(painterResource(tab.icon), contentDescription = null) },
                    label = { Text(tab.label) },
                )
            }
        }
    },
    floatingActionButton = {   // bottom trailing, under the thumb
        ExtendedFloatingActionButton(
            onClick = onCompose,
            icon = { Icon(painterResource(R.drawable.edit), contentDescription = null) },
            text = { Text("Compose") },
        )
    },
) { inner -> MailList(contentPadding = inner) }
```

**React Native**

```tsx
// app/(tabs)/_layout.tsx, Expo SDK 55 to 57.
// From SDK 58, import from "expo-router/native-tabs".
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="tray.fill" md="inbox" />
        <NativeTabs.Trigger.Label>Inbox</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

Keep the layout the same for both hands. The bottom center is in easy
reach of either thumb, so guessing which hand someone uses and flipping
the screen solves nothing. Put destructive actions away from the ones
people tap often, so a slip of the thumb can't delete something, and make
sure everything at the bottom also works with VoiceOver and TalkBack,
where position doesn't matter but the order does.

### Resources

- [How Do Users Really Hold Mobile Devices?](https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php): Steven Hoober's 1,333 street observations and the one-handed, cradled and two-handed split.
- [Design for Fingers, Touch, and People](https://www.uxmatters.com/mt/archives/2017/03/design-for-fingers-touch-and-people-part-1.php): Hoober's later data on why the center of the screen is the most accurate and edges need bigger targets.
- [How We Hold Our Gadgets](https://alistapart.com/article/how-we-hold-our-gadgets/): Josh Clark's thumb zone, and why you design for the most constrained grip.
- [Hamburger Menus and Hidden Navigation Hurt UX Metrics](https://www.nngroup.com/articles/hamburger-menus/): Nielsen Norman Group's test of hidden versus visible navigation on mobile and desktop.
- [Move the Chrome address bar to the bottom](https://blog.google/products/chrome/address-bar-position-change/): Google's 2025 note on the bottom address bar for Chrome on Android, and why hand size matters.
