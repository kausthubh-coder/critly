# Rules

One rule per concept. Re-read this before you finish any UI change, and open the full reference for every rule your change touches.

## Craft

- **Performance Is Design**: What you show during a wait shapes how long it feels. ([full](craft.md#performance-is-design))
- **How to Get References**: Collect references from outside your field, and borrow how they work, not how they look. ([full](craft.md#how-to-get-references))
- **Novelty Budget**: The rarer the moment, the more of people's time and attention its expression can take. Color, type, shape and voice cost no time, so frequency doesn't limit them. ([full](craft.md#novelty-budget))
- **Taste Pass**: Before you call a screen done, squint at it: the first thing the eye lands on should be what the screen is for, and every box and edge should be doing grouping work. ([full](craft.md#taste-pass))
- **Timelessness**: Surface ages fast. Structure ages slowly, so get the structure right and pick the surface on purpose, for this brand and this moment. ([full](craft.md#timelessness))
- **Product Feel**: How often and in what state of mind people use it decides the feel: density and pace. What the brand is decides its identity. Make both decisions, then let them pick the numbers. ([full](craft.md#product-feel))
- **Design Tokens**: Name the role, not the value, and let components use only the names. ([full](craft.md#design-tokens))

## Identity

- **Direction First**: Before you choose a font, a color or a shape, decide what the product is like (its subject, the one thing only it can claim, and the move people should remember) and trace every value back to them, because with no direction every choice drifts to the average of the category. ([full](identity.md#direction-first))
- **Borrow From the Subject**: Take type, color and shape from the subject's own world (its tools, artifacts, places, era, numbers and the words its people use) rather than from other software, because only material from the subject can say what the product is about. ([full](identity.md#borrow-from-the-subject))
- **Ownable Assets**: Pick two or three things nobody else in your category uses (a shape, a color pairing, a way of drawing progress or setting numbers) and use them the same way on every screen, because people recognize what is both unique and repeated. ([full](identity.md#ownable-assets))
- **Typeface as Voice**: People read a typeface's personality before its words, so let a display face carry the brand and a text face carry the reading, both chosen for this subject. ([full](identity.md#typeface-as-voice))
- **Palette From the World**: Take hues from the subject's own world rather than from color-psychology charts, set energy with chroma and weight with lightness, and build every ramp on shared lightness steps so text and buttons keep their contrast in any hue. ([full](identity.md#palette-from-the-world))
- **Signature Move**: Give the product one recognizable move, taken from what it does or from its world, use it the same way every time, and spend it at full size where people pause (the first screen, empty states, success moments), not as a corner detail and not on every control. ([full](identity.md#signature-move))

## Typography

- **Letter Spacing**: Tighten letter spacing as text gets bigger, and loosen it for small uppercase. ([full](typography.md#letter-spacing))
- **Text Wrapping**: Balance short text and make long text pretty. ([full](typography.md#text-wrapping))
- **Tabular Numbers**: Steady digits for values that change. ([full](typography.md#tabular-numbers))
- **Optical Alignment**: Center for the eye, not the math. ([full](typography.md#optical-alignment))
- **Icons**: Pick one set, give it one default weight that sits with your text, and size icons a little larger than the text beside them. Switch weight or fill only on purpose, for a selected state or a family of section icons. ([full](typography.md#icons))
- **Font Smoothing**: On macOS, turn the thickening off so text renders at the weight you chose. ([full](typography.md#font-smoothing))
- **Visual Hierarchy**: Decide what people should see first and make it win by contrast. Quiet what competes with it before you make it louder, using whichever lever fits the voice: tone, weight, size or color. ([full](typography.md#visual-hierarchy))
- **Line Length**: Keep body text between 45 and 75 characters per line. ([full](typography.md#line-length))
- **Type Scale**: Pick a small set of sizes far enough apart to read as deliberate, and give each one a job. Dense UI wants small steps; editorial and marketing pages can take far larger jumps. ([full](typography.md#type-scale))

## Color

- **OKLCH**: Pick colors in OKLCH, so equal lightness numbers actually look equally light. ([full](color.md#oklch))
- **Noise**: Add grain when a surface should feel tactile or a gradient bands. On anything large, render it once and tile it so it stays cheap. ([full](color.md#noise))
- **Edges and Elevation**: Choose how surfaces separate (a line, a shadow, a fill or plain space) by what the layering should say, and derive every level from one token. ([full](color.md#edges-and-elevation))
- **Image Outlines**: Paint the line over the image, not around it. ([full](color.md#image-outlines))
- **Color Roles**: Keep one color whose job is the next action and the current selection, and use green, amber and red only when they mean something. Color the rest as freely as the brand wants, as long as that signal still stands out. ([full](color.md#color-roles))
- **Dark Mode**: Design dark mode as its own theme: lift surfaces with lightness, soften the extremes, and recheck every color. ([full](color.md#dark-mode))
- **Liquid Glass**: If you use glass, keep what sits on it readable over the worst content that can pass beneath, and give it something to refract. ([full](color.md#liquid-glass))

## Layout

- **Nested Border Radius**: Inner radius is outer minus padding. ([full](layout.md#nested-border-radius))
- **Hit Areas**: Make the hit area bigger than the thing you can see. ([full](layout.md#hit-areas))
- **HTML Background**: Paint the canvas behind your page. ([full](layout.md#html-background))
- **Clip-Path**: Animate the window, not the box. ([full](layout.md#clip-path))
- **Scroll Fades**: Fade an edge only when there is more to scroll past it. ([full](layout.md#scroll-fades))
- **Squircles**: Keep the radius, change the shape. ([full](layout.md#squircles))
- **Whitespace**: Gaps inside a group should be about half the gaps between groups, or less. ([full](layout.md#whitespace))
- **Spacing Scale**: Pick every space from a small scale whose steps grow as the gaps do, and extend it, or make it fluid, for page-level rhythm. ([full](layout.md#spacing-scale))
- **Alignment**: Edges that almost line up read as mistakes, so align what belongs together. When you break alignment, break it far enough to look intended. ([full](layout.md#alignment))
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

## Marketing

- **Message First**: Before you choose a single section, write down who the page is for, what they use today, and what only this product does, because no layout can rescue a message any competitor could say. ([full](marketing.md#message-first))
- **The First Screen**: On the first screen, say what the product is and who it's for in plain words, show it, and offer one next step, in a page shape people already recognize, because that screen decides whether anyone reads the rest. ([full](marketing.md#the-first-screen))
- **Show the Product**: Fill the hero and feature images with the product doing its job, its real screen, its output, its code or the thing itself, because people study pictures that carry information and skip the ones that only decorate. ([full](marketing.md#show-the-product))
- **Sections Follow Questions**: Order a long page by the questions a buyer asks, in the order they ask them, give each section one idea, and size it by how much that answer matters, because a page of equal sections tells the reader nothing is more important than anything else. ([full](marketing.md#sections-follow-questions))
- **Specific Proof**: On a page that persuades, put proof right next to the claim it backs, and make it specific enough to check: a named person with their role and company, or a number with its baseline and timeframe, because praise nobody can check reads as filler. ([full](marketing.md#specific-proof))
- **Calls to Action**: Give a page that persuades one primary action, label it with what happens after the click, and repeat it where the reader decides; keep every other action quieter, so nobody has to guess which button matters or what it does. ([full](marketing.md#calls-to-action))
- **Pricing Pages**: Show real prices with what they're per and how often they're billed, offer four plans or fewer with at most one honest recommendation, and compare what differs between plans rather than every feature, because people come to a pricing page to work out what they would pay. ([full](marketing.md#pricing-pages))

## Motion

- **Icon Morph**: Make an icon change read as the same control changing, not two icons trading places. A blur crossfade, a morph or a quick snap with a small pop can all do it; pick the one that suits the brand. ([full](motion.md#icon-morph))
- **Button Press**: Make a press visible the moment it lands, so people know the click registered before anything else has happened. How far it moves is a brand decision; for controls people hit all day, keep it small and quick. ([full](motion.md#button-press))
- **Easings**: When the user triggers motion, start it at once and let it settle, with a front-loaded curve like an ease-out. Which curve, how hard it front-loads and whether it overshoots is part of the brand's feel. ([full](motion.md#easings))
- **Springs**: Bounce reads as energy. Use it where something gave the motion energy, like a throw or a swipe, or where the brand is playful, and keep it off opacity. ([full](motion.md#springs))
- **Stagger**: A stagger gives the eye a direction but delays the last item, so cap the total delay. In interface lists keep the gap short; longer gaps are choreography for showcase moments. ([full](motion.md#stagger))
- **Interruptibility**: If something can be triggered again before it finishes, animate it toward a target instead of playing a clip. ([full](motion.md#interruptibility))
- **Momentum**: Hand the release velocity to the animation that finishes the gesture, and aim for where the throw was going, not where it was let go. ([full](motion.md#momentum))
- **Hover Restraint**: The more often something happens, the less animation it can afford. Hovers people sweep across all day should keep up with the pointer; a rare or showcase hover can perform. ([full](motion.md#hover-restraint))
- **Shared Layout**: If two elements are the same thing to the user, move one instead of swapping two. ([full](motion.md#shared-layout))
- **Liquid Motion**: Where it helps to show that this is the same thing, morph the surface the user touched instead of fading in a new one, and close it back to where it came from. It's loud, so save it for a signature moment, not every control. ([full](motion.md#liquid-motion))
- **Exit Animations**: An exit shouldn't make people wait. Keep it shorter and quieter than the entrance, unless the motion shows where the thing went. ([full](motion.md#exit-animations))
- **Scale Entrances**: Grow a scale entrance from the thing that opened it, and keep it readable from the first frame: start close to full size and fade it in. ([full](motion.md#scale-entrances))
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
- **Effect Cost**: Blur and glass cost GPU work for every instance and every pixel they cover, so budget them by count and area, not by how one looks. If the look is the brand, make it cheap: keep it off repeated items, remove it when hidden, and measure on a phone. ([full](performance.md#effect-cost))

## Sound

- **Interface SFX**: A sound confirms something you can already see. It never carries the message alone. ([full](sound.md#interface-sfx))
- **Layering Sounds**: Every layer should add something the others don't. ([full](sound.md#layering-sounds))

## Data

- **Living Charts**: Animate the change, not the data. ([full](data.md#living-charts))
- **Curve Smoothing**: A smooth line should never go higher or lower than the points it connects. ([full](data.md#curve-smoothing))

## Mobile

- **Native Feel**: Keep the behaviors people learned from their platform, like where back is, the order of dialog buttons, what a press and a switch do, and Dynamic Type, and style the rest as freely as your brand wants. ([full](mobile/native-feel.md))
- **Thumb Reach**: Put the controls people use constantly where the thumb rests and keep navigation visible; the top costs a shift of grip, which is fine for occasional actions and the ones the platform puts there. ([full](mobile/thumb-reach.md))
- **Touch Feedback**: Show the pressed state the moment the finger lands, or after about 100 ms inside a scrolling list, and drop it the moment the touch turns into a scroll, a drag or a slide off. ([full](mobile/touch-feedback.md))
- **Gestures**: Treat every gesture that triggers an action as a shortcut for something people can see and tap; direct manipulation like scrolling, pinching and dragging needs no twin. ([full](mobile/gestures.md))
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
