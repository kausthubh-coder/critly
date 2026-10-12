# Rules

One rule per concept. Re-read this before you finish any UI change, and open the full reference for every rule your change touches.

## Craft

- **Performance Is Design**: What you show during a wait decides how long it feels. ([full](craft.md#performance-is-design))
- **How to Get References**: Collect references from outside your field, and borrow how they work, not how they look. ([full](craft.md#how-to-get-references))
- **Novelty Budget**: The rarer the moment, the more expressive it can be. ([full](craft.md#novelty-budget))
- **Taste Is Trained**: Taste is a skill, and it takes reps. ([full](craft.md#taste-is-trained))
- **Timelessness**: Surface ages fast. Structure ages slowly. ([full](craft.md#timelessness))
- **Product Feel**: Decide how it should feel, then let that pick the numbers. ([full](craft.md#product-feel))
- **Design Tokens**: Name the role, not the value, and let components use only the names. ([full](craft.md#design-tokens))

## Typography

- **Letter Spacing**: Tighten letter spacing as text gets bigger, and loosen it for small uppercase. ([full](typography.md#letter-spacing))
- **Text Wrapping**: Balance short text and make long text pretty. ([full](typography.md#text-wrapping))
- **Tabular Numbers**: Steady digits for values that change. ([full](typography.md#tabular-numbers))
- **Optical Alignment**: Center for the eye, not the math. ([full](typography.md#optical-alignment))
- **Icons**: Pick one set, use one weight, and size icons a little larger than the text beside them. ([full](typography.md#icons))
- **Font Smoothing**: On macOS, turn the thickening off so text renders at the weight you chose. ([full](typography.md#font-smoothing))
- **Visual Hierarchy**: Quiet the rest instead of making the important thing louder. ([full](typography.md#visual-hierarchy))
- **Line Length**: Keep body text between 45 and 75 characters per line. ([full](typography.md#line-length))
- **Type Scale**: Pick about five sizes from a scale, give each one a job, and use nothing else. ([full](typography.md#type-scale))

## Color

- **OKLCH**: Pick colors in OKLCH, so equal lightness numbers actually look equally light. ([full](color.md#oklch))
- **Noise**: Grain hides banding and adds texture. ([full](color.md#noise))
- **Shadows, Not Borders**: Give surfaces their edge with a faint shadow, not a border. ([full](color.md#shadows-not-borders))
- **Image Outlines**: Paint the line over the image, not around it. ([full](color.md#image-outlines))
- **Color Roles**: Let neutrals do almost all the work. Use the accent only for the main action and the current selection, and use green, amber and red only when they mean something. ([full](color.md#color-roles))
- **Dark Mode**: Design dark mode as its own theme: lift surfaces with lightness, soften the extremes, and recheck every color. ([full](color.md#dark-mode))
- **Liquid Glass**: Use glass only for controls that float above content, and make them readable over the worst background they can cross. ([full](color.md#liquid-glass))

## Layout

- **Nested Border Radius**: Inner radius is outer minus padding. ([full](layout.md#nested-border-radius))
- **Hit Areas**: Make the hit area bigger than the thing you can see. ([full](layout.md#hit-areas))
- **HTML Background**: Paint the canvas behind your page. ([full](layout.md#html-background))
- **Clip-Path**: Animate the window, not the box. ([full](layout.md#clip-path))
- **Scroll Fades**: Fade an edge only when there is more to scroll past it. ([full](layout.md#scroll-fades))
- **Squircles**: Keep the radius, change the shape. ([full](layout.md#squircles))
- **Whitespace**: Gaps inside a group should be about half the gaps between groups, or less. ([full](layout.md#whitespace))
- **Spacing Scale**: Pick every space from a small scale, and let the steps grow as the gaps do. ([full](layout.md#spacing-scale))
- **Alignment**: Line things up to as few edges as possible. Every new left edge is one more thing the eye has to resolve. ([full](layout.md#alignment))
- **Density**: Choose density from how often and how long people use the screen. ([full](layout.md#density))
- **Layout Shift**: Anything that arrives late should land in space that was already waiting for it. ([full](layout.md#layout-shift))
- **Responsive**: A component should respond to the space it is given, not to the size of the screen. ([full](layout.md#responsive))

## Interaction

- **Interaction States**: Design every state a control can be in, not just the one in the mockup. ([full](interaction.md#interaction-states))
- **Focus Rings**: Never remove the focus ring. Style `:focus-visible` instead. ([full](interaction.md#focus-rings))
- **Input Details**: Tell the browser what each field is for, and it does the rest. ([full](interaction.md#input-details))
- **Empty States**: An empty state should say why it's empty, what goes here, and offer one clear next action. ([full](interaction.md#empty-states))
- **Command Menu**: Open it instantly, match what people mean, and show each command's shortcut next to it. ([full](interaction.md#command-menu))
- **Overlays**: When an overlay opens, focus goes in. When it closes, focus goes back to the button that opened it. ([full](interaction.md#overlays))
- **Toasts**: Toast what happened out of sight. If the change already shows where the person is looking, show it there instead. ([full](interaction.md#toasts))
- **Destructive Actions**: If an action can be undone, do it right away and offer Undo. Save confirmation for what can't be undone. ([full](interaction.md#destructive-actions))

## Content

- **Microcopy**: Interface words are interface: buttons name the action, labels name the thing, and errors say what happened and how to fix it. ([full](content.md#microcopy))
- **Real Content**: Design with the awkward data you'll actually get, and give every text box a plan for when it overflows. ([full](content.md#real-content))

## Motion

- **Icon Morph**: Don't swap icons. Blur, scale and fade between them. ([full](motion.md#icon-morph))
- **Button Press**: Scale it down a little while it is pressed. ([full](motion.md#button-press))
- **Easings**: Use ease-out for anything that appears because the user did something. ([full](motion.md#easings))
- **Springs**: Start every spring at bounce 0. Add bounce only when a gesture gave the motion momentum. ([full](motion.md#springs))
- **Stagger**: Keep the gap between 30ms and 60ms. ([full](motion.md#stagger))
- **Interruptibility**: If something can be triggered again before it finishes, animate it toward a target instead of playing a clip. ([full](motion.md#interruptibility))
- **Momentum**: Hand the release velocity to the animation that finishes the gesture, and aim for where the throw was going, not where it was let go. ([full](motion.md#momentum))
- **Hover Restraint**: The more often something happens, the less animation it can afford. ([full](motion.md#hover-restraint))
- **Shared Layout**: If two elements are the same thing to the user, move one instead of swapping two. ([full](motion.md#shared-layout))
- **Liquid Motion**: Morph the surface the user touched instead of fading in a new one, and close it back to where it came from. ([full](motion.md#liquid-motion))
- **Exit Animations**: Something leaving deserves less ceremony than something arriving. ([full](motion.md#exit-animations))
- **Scale Entrances**: Start a scale entrance between 0.9 and 0.97, fade it in, and grow it from the thing that opened it. ([full](motion.md#scale-entrances))
- **Reduced Motion**: Reduced motion means less movement, not no animation. ([full](motion.md#reduced-motion))

## Performance

- **Measuring Performance**: Measure the wait a person feels, on the kind of device they use, more than once, before and after every change. ([full](performance.md#measuring-performance))
- **Responsiveness**: Answer every input on the next frame. Finish the work afterwards. ([full](performance.md#responsiveness))
- **Instant Navigation**: Start loading on intent, not on click, and never show a blank screen while you wait. ([full](performance.md#instant-navigation))
- **Image Loading**: Give every image its space and a placeholder before it loads, then fade it in. Except the hero: load that one first and show it at once. ([full](performance.md#image-loading))
- **Font Loading**: Show text immediately in a fallback that takes up the same space as the web font, and load as few font files as you can. ([full](performance.md#font-loading))
- **Video and Embeds**: Don't load a player until someone asks for it, and choose a video format that starts fast for anything that plays on its own. ([full](performance.md#video-and-embeds))
- **JavaScript Cost**: Ship the least JavaScript that makes the first screen work. Load the rest when someone is about to need it. ([full](performance.md#javascript-cost))
- **Long Lists**: Render only the rows people can see. Keep the rest as space, not as elements. ([full](performance.md#long-lists))
- **Smooth Animation**: Animate `transform` and `opacity`, and let CSS or the Web Animations API run them. ([full](performance.md#smooth-animation))
- **Effect Cost**: Budget expensive effects by how many are on the page, not by how one looks. Keep blur and heavy shadows to a few small floating surfaces, and remove them when they're hidden. ([full](performance.md#effect-cost))

## Sound

- **Interface SFX**: A sound confirms something you can already see. It never carries the message alone. ([full](sound.md#interface-sfx))
- **Layering Sounds**: Every layer should add something the others don't. ([full](sound.md#layering-sounds))

## Data

- **Living Charts**: Animate the change, not the data. ([full](data.md#living-charts))
- **Curve Smoothing**: A smooth line should never go higher or lower than the points it connects. ([full](data.md#curve-smoothing))

## Mobile

- **Native Feel**: Draw the parts people learned from the system the way their platform draws them, and put your brand in color, content and voice. ([full](mobile/native-feel.md))
- **Thumb Reach**: Put persistent, frequent controls at the bottom, keep content in the middle, and leave the top for actions people rarely take. ([full](mobile/thumb-reach.md))
- **Touch Feedback**: Show the pressed state the moment the finger lands, and drop it the moment the touch turns into a scroll, a drag or a slide off. ([full](mobile/touch-feedback.md))
- **Gestures**: Treat every gesture as a shortcut for something people can see and tap. ([full](mobile/gestures.md))
- **Swipe Actions**: Let a short swipe reveal the actions and a long swipe commit the first one, and make the moment it switches impossible to miss. ([full](mobile/swipe-actions.md))
- **Long Press**: Show the hold progressing, mark the moment it completes, and open the menu attached to the thing you pressed. ([full](mobile/long-press.md))
- **Bottom Sheets**: Give a sheet a few resting heights and a grabber, let the flick pick the height, and let a swipe down close it. ([full](mobile/bottom-sheets.md))
- **Back Navigation**: Let back follow the finger the whole way, show the screen underneath, and decide on release, so people can change their mind. ([full](mobile/back-navigation.md))
- **Haptics**: Play a haptic only at a moment the screen also shows, and use the system pattern whose meaning matches it. ([full](mobile/haptics.md))
- **Safe Areas**: Let backgrounds and scrolling content run to the edges of the screen, and keep text and controls inside the safe area. ([full](mobile/safe-areas.md))
- **Soft Keyboard**: Keep the focused field and its action above the keyboard, and move them with the keyboard's own animation, frame by frame. ([full](mobile/soft-keyboard.md))
- **Text Size**: Use the platform's text styles, give text containers minimum heights instead of fixed ones, and stack side-by-side content at the largest sizes. ([full](mobile/text-size.md))
- **UI Thread**: Compute anything that follows the finger on the thread that draws the frames, and keep every frame inside the budget of a 120 Hz screen. ([full](mobile/ui-thread.md))
- **App Launch**: Make the launch screen look like your first screen, draw that screen from cached data, and never hold the launch for the network. ([full](mobile/app-launch.md))
- **Native Lists**: Use the platform's recycling list, give every row a stable key and a type, and keep each row cheap enough to fill inside one frame. ([full](mobile/native-lists.md))
