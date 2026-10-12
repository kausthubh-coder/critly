# Mobile

## App Launch

> Open on the content, not a logo.

- Section: Mobile
- URL: https://critly.vercel.app/app-launch
- Published: 2026-10-12
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/mobile/app-launch.mdx

People open an app to do something in it. Every second of logo between the
tap and the content is a second of waiting for nothing, and a spinner after
the logo doubles it. Launch the same app both ways.

> **Interactive demo: Launch.** Open https://critly.vercel.app/app-launch to try it.

The splash version holds a logo for 1.5 s, spins while it fetches, shows the
stories at 2.6 s, and then jumps when a banner loads above them. The other
draws its own bars at once, shows the stories it saved last time at 0.4 s,
and puts fresh ones in the same slots.

**Make the launch screen look like your first screen, draw that screen from cached data, and never hold the launch for the network.**

### The numbers

- Apple's goal is the first frame within 400 ms of the tap. The system takes
  about 100 ms of that, leaving you about 300 ms to create views, load
  content and draw. The frame can have placeholders, but it has to respond to
  touch.
- Android vitals flags a launch as excessive at 5 s cold, 2 s warm and 1.5 s
  hot, measured to the first frame (time to initial display).
- On Android, a Baseline Profile makes code run about 30% faster from the
  first launch, because it skips interpretation and JIT compilation.

### iPhone: a picture of the first screen

iOS shows your launch screen the moment the icon is tapped and swaps in your
app when its first frame is ready. So the launch screen is your first screen
with the content taken out.

> **Interactive demo: Launch Screen.** Open https://critly.vercel.app/app-launch to try it.

Apple's guidelines ask for a launch screen "nearly identical to the first
screen", with no text, because it is never localized. No logos either,
unless the logo is a fixed part of that first screen: "The launch screen
isn't a branding opportunity." If you want a splash, put it at the start of
onboarding. Once the app is up, restore where people were: the tab, the
screen and the scroll position.

### Android: the system splash

Since Android 12, every cold and warm start shows a system splash, your icon
centred on a background colour, until your app draws its first frame. You
can't make it look like your first screen, so keep it short.

| Part | Spec |
|---|---|
| Icon with an icon background | 240 × 240 dp, inside a 160 dp circle |
| Icon without a background | 288 × 288 dp, inside a 192 dp circle |
| Animated icon | No longer than 1,000 ms on phones |

Call `installSplashScreen()` before `super.onCreate()`. Hold it with
`setKeepOnScreenCondition` only while you read local data, never while you
wait on the network. Delete any separate splash activity: Google asks apps to
migrate to the SplashScreen API, and an extra activity shows a second splash
after the system one.

### React Native and Expo

`expo-splash-screen` keeps the native splash up until you hide it. Call
`preventAutoHideAsync()` at module scope, then `hide()` once the first screen
can draw, and on the error path too, or the splash never leaves. `fade: true`
fades it out on iOS only. Release builds ship Hermes bytecode, which loads
without parsing. Judge startup in a release build, not Expo Go, which shows
your app icon instead of your splash.

On every stack, the first screen shows what was there last time and updates
in place, so nothing moves when fresh data arrives
([Layout Shift](https://critly.vercel.app/layout-shift)). A skeleton in the right shape covers the very
first launch, when there is no cache yet. Speed is part of the design here
more than anywhere ([Performance Is Design](https://critly.vercel.app/performance-is-design)).

### Usage

**SwiftUI**

```swift
// Info.plist > UILaunchScreen: only your first screen's background
// colour (UIColorName). No logo, no text.

struct RootView: View {
    @SceneStorage("tab") private var tab = "today"   // reopen where they were
    @State private var feed = FeedStore()

    var body: some View {
        TabView(selection: $tab) {
            // iOS 18+ Tab API
            Tab("Today", systemImage: "newspaper", value: "today") {
                FeedList(stories: feed.stories)      // cached, in the first frame
            }
        }
        .task { await feed.refresh() }               // never in init or body
    }
}

@MainActor @Observable
final class FeedStore {
    var stories: [Story] = Story.cached()            // small local read
    func refresh() async {
        if let fresh = try? await API.stories() { stories = fresh }
    }
}
```

**Compose**

```kotlin
class MainActivity : ComponentActivity() {
    private val vm: FeedViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        val splash = installSplashScreen()        // before super.onCreate
        super.onCreate(savedInstanceState)
        // Local disk only. A slow network must never hold the splash.
        splash.setKeepOnScreenCondition { !vm.cacheLoaded.value }
        enableEdgeToEdge()
        setContent {
            AppTheme {
                val feed by vm.feed.collectAsStateWithLifecycle()
                ReportDrawnWhen { feed.isNotEmpty() }   // time to full display
                FeedScreen(feed)                        // cached, then refreshed in place
            }
        }
    }
}
```

**React Native**

```tsx
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();     // module scope, not in a component
SplashScreen.setOptions({ fade: true }); // iOS only

export default function RootLayout() {
  const cache = useCachedFeed();         // reads disk, never the network
  const ready = cache.loaded || cache.error;

  useEffect(() => {
    if (ready) SplashScreen.hide();      // on the error path too
  }, [ready]);

  if (!ready) return null;
  return <Stack />;                      // first screen renders cached stories
}
```

Match the appearance people are in. Apple asks for a launch screen that
matches the device's current orientation and appearance mode, so give it a
dark variant. On Android, a splash background colour set only in `values/`
stays light at night; set a dark one in `values-night/`. Otherwise the first
thing people see at night is a white flash.

### Resources

- [Human Interface Guidelines: Launching](https://developer.apple.com/design/human-interface-guidelines/launching): Apple's rules for launch screens, no text, no branding, and restoring where people left off.
- [Optimizing App Launch](https://developer.apple.com/videos/play/wwdc2019/423/): The WWDC19 session behind the 400 ms first-frame goal, and how the time splits.
- [Splash screens](https://developer.android.com/develop/ui/views/launch/splash-screen): Android's SplashScreen API, its icon sizes, the animated icon limit, and how to hold or exit it.
- [App startup time in Android vitals](https://developer.android.com/google/play/vitals/launch-time): The 5 s cold, 2 s warm and 1.5 s hot thresholds Google Play flags as excessive.
- [expo-splash-screen](https://docs.expo.dev/versions/latest/sdk/splash-screen/): Keeping the native splash up until your first screen is ready, then hiding it.
