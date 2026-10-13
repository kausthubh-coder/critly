# Mobile

## Native Feel

> Keep the behaviors people know from their platform.

- Section: Mobile
- URL: https://critly.vercel.app/native-feel
- Published: 2026-10-12
- Source: https://github.com/kausthubh-coder/critly/blob/main/content/mobile/native-feel.mdx

Everyone who opens your app has used dozens of other apps on the same
phone. They already know where back is, how a switch flips, and which
dialog button cancels. When an app redraws those parts its own way, each
one becomes a small thing to figure out.

> **Interactive demo: Native Feel.** Open https://critly.vercel.app/native-feel to try it.

It's the same screen, with the same rows and the same brand color. Switch
platforms and watch what changes: the back button, the title, the list, the
switches, and what a press looks like. On iPhone a row highlights under
your finger. On Android a ripple grows from the point you touched.

**Keep the behaviors people learned from their platform, like where back is, the order of dialog buttons, what a press and a switch do, and Dynamic Type, and style the rest as freely as your brand wants.**

### What changes

The back, switch, press and type rows are behaviors people rely on. The title, list, icon and sheet rows are each platform's default look: a good place to start, not a requirement.

| | iPhone | Android |
| --- | --- | --- |
| Back | Chevron, top leading. Swipe right from the edge, or from anywhere in the content since iOS 26 | Arrow in the top app bar. The system back gesture from either edge, or the back button |
| Title | Large title that shrinks into the bar as you scroll | 64dp top app bar, title after the arrow |
| Lists | By default, grouped inset rows on a gray background, Title Case labels | By default, full-width rows, section labels in the primary color, sentence case |
| Switches | iOS switch; only the switch toggles | M3 switch, the thumb grows when on; the whole row toggles |
| Press | Highlight or dim on touch-down | Ripple from the touch point, a 10% state layer |
| Type | SF Pro, Dynamic Type, 17pt body | Roboto, sizes in sp, scaling up to 200% |
| Icons | SF Symbols | Material Symbols |
| Sheets | Detents and a grabber | Bottom sheet with a 32×4dp drag handle |

Each row has its own concept: [Back Navigation](https://critly.vercel.app/back-navigation),
[Touch Feedback](https://critly.vercel.app/touch-feedback), [Text Size](https://critly.vercel.app/text-size),
[Bottom Sheets](https://critly.vercel.app/bottom-sheets) and [Haptics](https://critly.vercel.app/haptics).

### Dialogs

Dialogs are where a home-made design does the most damage, because a wrong
button costs data. Switch between one custom dialog and the native ones.

> **Interactive demo: Platform Dialog.** Open https://critly.vercel.app/native-feel to try it.

In a row of buttons, both platforms put the safe choice on the left and the
action on the right.

- On iPhone, Apple puts the default button on the trailing side of a
  row, or at the top of a stack, and Cancel on the leading side or at the
  bottom. Always call it Cancel, and name the action with a verb. Apple
  allows "OK" only in a purely informational alert, where there's no
  action to name.
- On Android, Material 3 puts text buttons at the trailing edge, with the
  dismiss button left of the confirm button, and allows at most two.
  Compose's `AlertDialog(confirmButton, dismissButton)` does the layout.

The custom dialog puts Delete where both platforms put Cancel, so a
reflexive tap deletes the photos. The system dialog gets this right for
free. Before you ask at all, check [Destructive Actions](https://critly.vercel.app/destructive-actions):
an undo is often better than a question.

### Where the brand goes

Your brand can shape everything that isn't a learned behavior: color, type,
shape, illustration, content, copy and motion. Tint the system switch with your color. If
you use your own font, make it scale like the system one: SwiftUI's
`.custom(_:size:relativeTo:)` follows Dynamic Type, and sizes in sp follow
Android's font scale. Keep the system back button: replacing it can lose
the swipe back.

### The 2026 look

iOS 26 put bars and tab bars on [Liquid Glass](https://critly.vercel.app/liquid-glass), floating over
content, and iOS 26.1 added a setting that lets people choose between clear
and tinted. Android has Material 3 Expressive, with springier motion and
new shapes, on Pixel since September 2025. In Compose, `MaterialExpressiveTheme`
and `MotionScheme` are internal in material3 1.4.0. They become public in
1.5.0, which was still in beta in October 2026.

System bars pick up these changes on their own, including the resizable
iPhone apps in iOS 27 and the side strip on iPhone Duo
([Safe Areas](https://critly.vercel.app/safe-areas)). A hand-built bottom bar stays where you drew it.

### Cross-platform

- In React Native and Expo, use the native stack (Expo Router's `Stack`),
  not the JavaScript one. Use native tabs: `expo-router/unstable-native-tabs`
  up to SDK 57, `expo-router/native-tabs` from SDK 58. Pick values per
  platform with `Platform.select`, and system colors with `PlatformColor`.
  Expo UI (`@expo/ui`, stable since SDK 56) renders real SwiftUI and
  Compose controls when the stock components don't cover it.
- In Flutter, `Switch.adaptive`, `Slider.adaptive`, `AlertDialog.adaptive`
  and `showAdaptiveDialog` draw Cupertino on iOS and Material elsewhere.

### Usage

**SwiftUI**

```swift
// Push this inside a NavigationStack: the back button and swipe come free.
struct NotificationSettings: View {
    @State private var allow = true
    @State private var confirmClear = false

    var body: some View {
        List {
            Section("Alerts") {
                Toggle("Allow Notifications", isOn: $allow)
            }
            Section {
                Button("Clear History", role: .destructive) { confirmClear = true }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Notifications")   // large title by default
        .tint(Color("Brand"))               // your color, system shapes
        .alert("Clear history?", isPresented: $confirmClear) {
            Button("Cancel", role: .cancel) {}                // leading
            Button("Clear", role: .destructive) { clear() }   // trailing
        } message: {
            Text("This can't be undone.")
        }
    }
}
```

**Compose**

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationSettings(onBack: () -> Unit, onClear: () -> Unit) {
    var allow by rememberSaveable { mutableStateOf(true) }
    var confirmClear by rememberSaveable { mutableStateOf(false) }
    Scaffold(topBar = {
        TopAppBar(
            title = { Text("Notifications") },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    // Material Symbols "arrow_back", imported as a vector drawable
                    Icon(painterResource(R.drawable.arrow_back), contentDescription = "Back")
                }
            },
        )
    }) { inner ->
        LazyColumn(contentPadding = inner) {
            item {
                ListItem(   // the whole row toggles
                    headlineContent = { Text("Allow notifications") },
                    trailingContent = { Switch(checked = allow, onCheckedChange = null) },
                    modifier = Modifier.toggleable(allow, role = Role.Switch) { allow = it },
                )
            }
            item { ListItem({ Text("Clear history") }, Modifier.clickable { confirmClear = true }) }
        }
    }
    if (confirmClear) AlertDialog(
        onDismissRequest = { confirmClear = false },
        title = { Text("Clear history?") },
        text = { Text("This can't be undone.") },
        dismissButton = { TextButton({ confirmClear = false }) { Text("Cancel") } },
        confirmButton = { TextButton({ onClear(); confirmClear = false }) { Text("Clear") } },
    )
}
```

**React Native**

```tsx
import { Stack } from "expo-router";
import { useState } from "react";
import { Alert, Platform, PlatformColor, Pressable, ScrollView, Switch, Text } from "react-native";

const label = Platform.select({
  ios: PlatformColor("label"),
  android: PlatformColor("?android:attr/textColorPrimary"),
});

export default function NotificationSettings() {
  const [allow, setAllow] = useState(true);
  // The system alert on iOS, the system dialog on Android
  const confirmClear = () =>
    Alert.alert("Clear history?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clear },
    ]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ title: "Notifications", headerLargeTitleEnabled: true }} />
      <Switch value={allow} onValueChange={setAllow} />
      <Pressable
        onPress={confirmClear}
        android_ripple={{ color: "rgba(0,0,0,0.1)" }}
        style={({ pressed }) => Platform.OS === "ios" && pressed && { opacity: 0.6 }}
      >
        <Text style={{ color: label }}>Clear history</Text>
      </Pressable>
    </ScrollView>
  );
}
```

**Flutter**

```dart
SwitchListTile.adaptive(
  title: const Text('Allow notifications'),
  value: allow,
  onChanged: (v) => setState(() => allow = v),
);

// Cupertino alert on iOS, Material dialog on Android
showAdaptiveDialog<void>(
  context: context,
  builder: (context) => AlertDialog.adaptive(
    title: const Text('Clear history?'),
    content: const Text("This can't be undone."),
    actions: [
      action(context, 'Cancel', () => Navigator.pop(context)),
      action(context, 'Clear', clear, destructive: true),
    ],
  ),
);

Widget action(BuildContext context, String label, VoidCallback onPressed,
        {bool destructive = false}) =>
    switch (Theme.of(context).platform) {
      TargetPlatform.iOS || TargetPlatform.macOS => CupertinoDialogAction(
          isDestructiveAction: destructive, onPressed: onPressed, child: Text(label)),
      _ => TextButton(onPressed: onPressed, child: Text(label)),
    };
```

System controls also come with the accessibility work done: VoiceOver
and TalkBack roles, Dynamic Type, Bold Text, Increase Contrast and the
right focus order. A custom switch has to rebuild every one of those, and
most don't. Break the convention only where your app is the convention,
like the canvas of a drawing app or the controls of a game.

### Resources

- [Alerts in the Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/alerts): Apple's rules for alert buttons, including where Cancel and the default button go in a row and in a stack.
- [Dialogs in Jetpack Compose](https://developer.android.com/develop/ui/compose/components/dialog): The Material 3 AlertDialog with its confirm and dismiss buttons, laid out for you.
- [Automatic platform adaptations](https://docs.flutter.dev/ui/adaptive-responsive/platform-adaptations): Everything Flutter changes per platform, from page transitions and scroll physics to the .adaptive widgets.
- [Native Stack Navigator](https://reactnavigation.org/docs/native-stack-navigator): React Navigation's stack on UINavigationController and Fragment, with large titles and native sheets.
- [Native tabs in Expo Router](https://docs.expo.dev/router/advanced/native-tabs/): The system tab bar from React Native, with the import path for each Expo SDK.
