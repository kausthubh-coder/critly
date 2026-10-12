# Interaction

## Interaction States

> Every control has more than one face.

- Section: Interaction
- URL: https://critly.vercel.app/interaction-states
- Published: 2026-10-02
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/interaction/interaction-states.mdx

A button is usually designed once, at rest. But people meet it in five other
states: hovered, pressed, focused from the keyboard, disabled and loading. If
nobody designed those, the browser or the component library did.

**Design every state a control can be in, not just the one in the mockup.**

> **Interactive demo: Interaction States.** Open https://critly.vercel.app/interaction-states to try it.

Each state answers a different question. Hover says "this is clickable".
Pressed says "I felt that". Focus says "you are here". Disabled says "not
now", and loading says "working on it". Here hover lightens the fill by 15%,
pressed by 20% with a [0.97 press](https://critly.vercel.app/button-press), disabled drops to 40%
opacity, and loading swaps the label for a spinner while keeping its width,
so nothing next to it moves.

### Hover must not move anything

Hover should change color, never size. Bold text is wider than regular text,
so a hover that switches font weight pushes every neighbor sideways. Sweep the
pointer across both rows and watch the dashed edge.

> **Interactive demo: Hover Shift.** Open https://critly.vercel.app/interaction-states to try it.

Hover also has no place on touch screens, where a tap can leave it stuck on
until you tap somewhere else. Keep hover styles inside `@media (hover: hover)`.
Tailwind v4's `hover:` variant already does this. How fast hover should appear
is its own topic: see [hover restraint](https://critly.vercel.app/hover-restraint).

### Disabled needs a reason

A greyed-out button tells you something is wrong without telling you what. It
can't be focused, so keyboard and screen reader users may never find it, and
a tooltip on it can't be reached from the keyboard.

> **Interactive demo: Disabled Reason.** Open https://critly.vercel.app/interaction-states to try it.

Keep the button enabled, and when it is pressed, say what is missing and move
focus to the field. If you really must disable a control, put the reason in
visible text next to it.

### Usage

**Tailwind**

```html
<button
  class="bg-neutral-900 transition-transform duration-100 ease-out
         hover:bg-neutral-900/85
         active:scale-[0.97]
         focus-visible:outline-2 focus-visible:outline-offset-2
         disabled:opacity-40"
>
  Save
</button>
```

**CSS**

```css
.button {
  background: rgb(23 23 23);
  transition: transform 100ms ease-out;
}

@media (hover: hover) {
  .button:hover {
    background: rgb(23 23 23 / 0.85);
  }
}

.button:focus-visible {
  outline: 2px solid;
  outline-offset: 2px;
}

.button:active {
  transform: scale(0.97);
}

.button:disabled {
  opacity: 0.4;
}
```

Loading is a state, not a disabled button. Keep it focusable with
`aria-busy="true"` and ignore repeat clicks in the handler. Disabling the
focused button would drop focus to the page while the request runs.

### Resources

- [Material Design state layers](https://m3.material.io/foundations/interaction/states/state-layers): A complete system of hover, focus, pressed and dragged overlays with fixed opacities.
- [The hover media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/hover): How to apply hover styles only on devices that can actually hover.
- [Don't Disable Form Controls](https://adrianroselli.com/2024/02/dont-disable-form-controls.html): Adrian Roselli on why a disabled submit button is no replacement for instructions and error messages.
- [Frustrating design patterns - disabled buttons](https://www.smashingmagazine.com/2021/08/frustrating-design-patterns-disabled-buttons/): Vitaly Friedman's survey of the problems with disabled buttons and the patterns that replace them.


## Focus Rings

> Show keyboard users where they are.

- Section: Interaction
- URL: https://critly.vercel.app/focus-rings
- Published: 2026-10-02
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/interaction/focus-rings.mdx

A focus ring is the keyboard's cursor. Without it, someone pressing Tab is
moving through the page blind. It gets removed so often because it used to show
up on mouse clicks too, and designers found that ugly.

**Never remove the focus ring. Style `:focus-visible` instead.**

> **Interactive demo: Focus Rings.** Open https://critly.vercel.app/focus-rings to try it.

With `:focus`, every mouse click on a button draws a ring. With
`:focus-visible`, the browser shows it only when it helps: always for keyboard
focus, and for text fields however they were focused, since you are about to
type.

### Outline, not box-shadow

A 2px solid `outline` with a 2px `outline-offset` is a good default. The offset
leaves a gap, so the ring reads as separate from the control even when they
are the same color. Outlines follow `border-radius` in every major browser, so
a pill gets a pill-shaped ring.

> **Interactive demo: Focus Offset.** Open https://critly.vercel.app/focus-rings to try it.

Rings drawn with `box-shadow` look the same, until someone turns on forced
colors mode, such as Windows contrast themes. The browser drops shadows there
and repaints outlines in the system colors. Here it is simulated:

> **Interactive demo: Focus Forced Colors.** Open https://critly.vercel.app/focus-rings to try it.

If you need a shadow ring for its looks, keep a `2px solid transparent` outline
next to it. It is invisible until forced colors paints it.

### Don't hide it under the header

A sticky header can cover the element you just moved to. Shift+Tab up through
a list and the browser scrolls each row to the top edge, right under the
header. WCAG 2.2 asks that focus is never fully hidden this way.

> **Interactive demo: Focus Obscured.** Open https://critly.vercel.app/focus-rings to try it.

`scroll-padding-top` tells the scroller how much of its top edge is taken. Set
it to the header's height plus a little air, here 36px + 4px. On a page with a
sticky site header, put it on `html`.

### Usage

**Tailwind**

```html
<!-- 64px: sticky header height + air -->
<html class="scroll-pt-16">

<button
  class="focus-visible:outline-2
         focus-visible:outline-offset-2
         focus-visible:outline-neutral-900"
>
  Invite
</button>
```

**CSS**

```css
html {
  scroll-padding-top: 64px; /* sticky header height + air */
}

:focus-visible {
  outline: 2px solid rgb(23 23 23);
  outline-offset: 2px;
}
```

In Tailwind v4, `outline-none` really removes the outline, in forced colors
too. Use `outline-hidden` when you replace it with a ring, which keeps the
transparent outline for forced colors mode.

### Resources

- [:focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible): The pseudo-class that matches focus the browser decides should be shown.
- [A guide to designing accessible focus indicators](https://www.sarasoueidan.com/blog/focus-indicators/): Sara Soueidan on contrast, size and why outlines beat box-shadows in forced colors mode.
- [Understanding Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html): The WCAG 2.2 AA rule that a focused element can't be fully hidden by sticky content.
- [Using CSS scroll-padding to un-obscure content](https://www.w3.org/WAI/WCAG22/Techniques/css/C43): The W3C technique for keeping focused elements clear of fixed and sticky bars.


## Input Details

> Small attributes that make typing easy.

- Section: Interaction
- URL: https://critly.vercel.app/input-details
- Published: 2026-10-02
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/interaction/input-details.mdx

Most of what makes a form pleasant on a phone is invisible. The right keyboard
appears, the page doesn't jump, the browser offers your email before you type
it. Each of those is one attribute.

**Tell the browser what each field is for, and it does the rest.**

> **Interactive demo: Input Keyboard.** Open https://critly.vercel.app/input-details to try it.

Tap a few fields in each mode. Safari on iPhone zooms in on any input with text
under 16px, and it stays zoomed after you leave. A `16px` font size stops
it. Don't disable zooming to fix it.

### Type, inputmode, autocomplete

`type` sets what the value is, `inputmode` sets which keyboard appears, and
`autocomplete` says what to fill in. `type="email"` brings the @ key,
`type="tel"` the phone pad, `inputmode="decimal"` digits with a point. Use
`inputmode="numeric"` rather than `type="number"` for codes, card numbers and
anything else that isn't a quantity. `autocomplete="one-time-code"` lets the
phone offer the code it just received.

Two more rules: wrap fields in a `<form>`, so Enter submits, and never block
paste. People paste passwords and codes from somewhere safer than their memory.

### When to show errors

An error that appears after the first letter scolds people for not having
finished. Type an email in both modes.

> **Interactive demo: Input Validation.** Open https://critly.vercel.app/input-details to try it.

Wait until the person leaves the field, then check it. Once an error is
showing, check again on every keystroke and remove it the moment the value is
valid. GOV.UK goes further and validates only on submit. I prefer blur on short
forms, where hearing about a typo right away saves a trip back.

CSS has this built in: `:user-invalid` matches only after someone has changed
a field and moved on, or tried to submit.

### Usage

**Tailwind**

```html
<form>
  <input
    class="text-base user-invalid:outline-2 user-invalid:outline-red-500"
    type="email"
    autocomplete="email"
    spellcheck="false"
    required
  />
  <input class="text-base" inputmode="numeric" autocomplete="one-time-code" />
</form>
```

**CSS**

```css
input {
  font-size: 16px;
}

input:user-invalid {
  outline: 2px solid rgb(239 68 68);
}
```

Keep the submit button enabled until the request starts, and on submit move
focus to the first field with an error.

### Resources

- [16px or larger text prevents iOS form zoom](https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/): Why Safari on iPhone zooms into small inputs, and the one-line fix.
- [inputmode](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode): Every virtual keyboard you can ask for, and when to use it instead of type.
- [autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete): The full list of tokens that let browsers and password managers fill a form.
- [Inline form validation](https://baymard.com/research-articles/inline-form-validation): Baymard's research on when to show an error and when to take it away.
- [GOV.UK validation pattern](https://design-system.service.gov.uk/patterns/validation/): The case for validating only on submit, from a design system built for everyone.


## Empty States

> Say why it's empty and what to do next.

- Section: Interaction
- URL: https://critly.vercel.app/empty-states
- Published: 2026-10-02
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/interaction/empty-states.mdx

A new user's first screen is usually empty. No projects, no messages, no data.
Whatever sits there is their introduction to the feature, and "No data." doesn't
introduce anything.

**An empty state should say why it's empty, what goes here, and offer one clear
next action.**

> **Interactive demo: Empty States.** Open https://critly.vercel.app/empty-states to try it.

With "No data." the only way forward is the small plus in the corner, if you
notice it. The designed version names the thing, says what it's for in one
line, and puts the action where your eyes already are. Add a project and
delete it again: the empty state comes back whenever the list does, so it's
not a one-time screen.

### Three kinds of empty

Empty screens don't all mean the same thing, so they shouldn't all say the same
thing.

- **First use.** Nothing has been made yet. Teach the feature and offer the first action.
- **No results.** The data exists, but a query or filter hid it. Help the person change the query.
- **Cleared.** The person finished everything. Say so and stop there.

### No results

An empty search is one the person caused, so the fix is usually in their own
input. Echo the query so a typo is easy to spot. If a filter is hiding a match,
say so and offer to remove it.

> **Interactive demo: Empty Search.** Open https://critly.vercel.app/empty-states to try it.

"Brand refresh" exists, it's just archived. "No results." makes it look like it
was never there. The designed version counts what the filter hid and turns that
into a button.

### Cleared

Inbox zero is the one empty state that has earned some delight. It's rare, it's
the reward for finishing, and it's the best place to spend your
[novelty budget](https://critly.vercel.app/novelty-budget). A check mark and a short line are enough. There
is nothing left to do, so don't add a button.

GitHub's Primer asks first-use screens to be playful. Atlassian saves the
excitement for finished work. I side with Atlassian: on first use the person is
trying to learn something, and a joke gets between them and the button.

### Usage

**Tailwind**

```html
<div class="flex h-48 flex-col items-center justify-center gap-3 text-center">
  <p class="text-sm font-medium">No projects yet</p>
  <p class="max-w-56 text-sm text-pretty text-muted-foreground">
    A project keeps tasks, files and people in one place.
  </p>
  <button class="rounded-full bg-foreground px-3 py-1.5 text-sm text-background">
    New project
  </button>
</div>
```

**React**

```tsx
if (projects.length > 0) return <ProjectList projects={projects} />;

if (query) {
  return (
    <EmptyState
      title={`No projects match “${query}”`}
      description="Check the spelling, or try a shorter word."
      action={<Button onClick={clearSearch}>Clear search</Button>}
    />
  );
}

return (
  <EmptyState
    title="No projects yet"
    description="A project keeps tasks, files and people in one place."
    action={<Button onClick={createProject}>New project</Button>}
  />
);
```

Give the empty state the same height as the list it replaces. Otherwise the
page jumps when the first item arrives and again when the last one leaves.

### Resources

- [Designing empty states in complex applications](https://www.nngroup.com/articles/empty-state-interface-design/): Kate Kaplan's three guidelines - show system status, teach the feature, and give a direct path to the task.
- [Primer empty states](https://primer.style/ui-patterns/empty-states): GitHub's blank slate pattern, with a graphic, a welcoming heading, one line of help and a primary action.
- [Atlassian empty state messages](https://atlassian.design/foundations/content/designing-messages/empty-state): How to write the heading, body and call to action, and how a cleared state differs from a blank slate.
- [5 UX strategies for "No Results" pages](https://baymard.com/blog/no-results-page): Baymard's research on searches that end at a dead end, and the patterns that recover them.


## Command Menu

> One shortcut to reach everything.

- Section: Interaction
- URL: https://critly.vercel.app/command-menu
- Published: 2026-10-02
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/interaction/command-menu.mdx

A command menu puts every action behind one shortcut. Press Cmd+K, or Ctrl+K on
Windows, type a few letters, press Enter. Nobody has to remember where a
setting lives, only roughly what it does.

**Open it instantly, match what people mean, and show each command's shortcut
next to it.**

> **Interactive demo: Command Menu.** Open https://critly.vercel.app/command-menu to try it.

Click the window and press the shortcut, or use the search field. Arrows move,
Enter runs, Escape closes. Run "Toggle sidebar" from the menu and the footer
tells you the shortcut for next time.

### Open it instantly

The menu exists to make things fast, so it can't be slow to appear. It opens
with no animation, the cursor is already in the input, and the same shortcut
closes it. This is [hover restraint](https://critly.vercel.app/hover-restraint) again: something you open
forty times a day can't afford a fade.

Closing returns focus to the search field, and nothing in the list needs a mouse.

### Match what people mean

People don't type your label, they type their own word. Someone looking for
dark mode types "dark", not "Change theme". An exact search finds nothing, and
they decide the feature doesn't exist.

> **Interactive demo: Command Search.** Open https://critly.vercel.app/command-menu to try it.

Give every command a few keywords and match loosely against the title and the
keywords together. When a keyword matched, show it next to the result so the
match doesn't look random.

### Teach the shortcuts

A command menu is also where people learn your shortcuts. If every row shows
its keys, the tenth time someone runs "Toggle sidebar" from the menu, they press
the shortcut instead. A shortcut nobody sees never gets learned.

> **Interactive demo: Command Shortcuts.** Open https://critly.vercel.app/command-menu to try it.

Order the list for the person, not the codebase. With an empty query, show
recent commands first, then the ones that fit the current screen. Most of the
time, the thing someone wants is the thing they did a minute ago.

### Usage

**React**

```tsx
import { Command } from "cmdk";
import { useEffect, useState } from "react";

export function CommandMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command menu">
      <Command.Input placeholder="Type a command" />
      <Command.List>
        <Command.Empty>No commands found.</Command.Empty>
        <Command.Item
          value="Change theme"
          keywords={["dark mode", "light mode", "appearance"]}
          onSelect={toggleTheme}
        >
          Change theme
          <kbd className="ml-auto text-xs text-muted-foreground">⌘⇧L</kbd>
        </Command.Item>
      </Command.List>
    </Command.Dialog>
  );
}
```

**Tailwind**

```html
<div
  cmdk-item
  class="flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-sm data-[selected=true]:bg-muted"
>
  Change theme
  <kbd class="ml-auto text-xs text-muted-foreground">⌘⇧L</kbd>
</div>
```

Set `value` on every item. Without it, cmdk uses the item's text, so the
shortcut becomes part of what it searches and "L" starts matching "Change
theme".

### Resources

- [How to build a remarkable command palette](https://blog.superhuman.com/how-to-build-a-remarkable-command-palette/): Superhuman's rules for the pattern - one shortcut everywhere, every command, forgiving search, and context.
- [cmdk](https://github.com/dip/cmdk): The React command menu this site uses, with keyword aliases and a pluggable filter.
- [ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/): The keyboard and screen reader behavior for an input that controls a list of options.
- [Command K bars](https://maggieappleton.com/command-bar): Maggie Appleton on where the pattern came from and why it scales better than menus.


## Overlays

> Keep scroll and focus inside the layer.

- Section: Interaction
- URL: https://critly.vercel.app/overlays
- Published: 2026-10-02
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/interaction/overlays.mdx

A modal says everything else is on hold until you're done here. Two things
quietly break that. Scrolling leaks out to the page behind, and focus wanders
off when the layer opens or closes.

### Scroll

Scroll the list below to the end and keep going. Once the list runs out, the
browser hands the scroll to the next scrollable thing behind it, and the page
starts moving. This is called scroll chaining.

> **Interactive demo: Overlay Scroll.** Open https://critly.vercel.app/overlays to try it.

One line stops it. `overscroll-behavior: contain` keeps the scroll inside the
element even at its edges, and keeps the bounce from leaking out too. Put it on
every scroll area inside an overlay: the dialog body, a drawer, a long menu.

### Focus

**When an overlay opens, focus goes in. When it closes, focus goes back to
the button that opened it.**

Open one of the fields, then close it with Save, Cancel, Escape or a click on
the backdrop.

> **Interactive demo: Overlay Focus.** Open https://critly.vercel.app/overlays to try it.

In the unmanaged version focus stays behind the dialog, so Tab walks through
buttons you can't use. When the dialog closes, the element that had focus is
removed and focus falls back to the page body. A keyboard or screen reader user
has lost their place and has to find it again.

The managed version moves focus to the input, keeps Tab cycling inside the
dialog, and makes the page behind `inert` so nothing there can be reached.
Escape and a backdrop click close it, and focus lands back on the button you
pressed.

Only let the backdrop close overlays that are cheap to reopen, like menus,
pickers and previews. If closing would throw away typing or skip a destructive
choice, make people press a button.

### Usage

`<dialog>` opened with `showModal()` does most of this for you. The rest of the
page becomes inert, Escape closes it, focus moves to the first focusable
element, and it returns to the trigger on close. The `closedby="any"` attribute
adds backdrop clicks, but it isn't Baseline yet, so the click handler below is
still the safe route.

**Tailwind**

```html
<button onclick="language.showModal()">Language</button>

<dialog
  id="language"
  class="rounded-xl p-0 backdrop:bg-black/20"
  onclick="event.target === this && this.close()"
>
  <ul class="max-h-64 overflow-y-auto overscroll-contain p-1">
    <li>English</li>
    <!-- … -->
  </ul>
</dialog>
```

**CSS**

```css
dialog {
  padding: 0;
}

dialog::backdrop {
  background: rgb(0 0 0 / 0.2);
}

dialog ul {
  max-height: 16rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

A modal dialog doesn't stop the page from scrolling when the wheel is over the
backdrop itself. If that matters, lock the root while it's open with
`html:has(dialog:modal) { overflow: hidden }`, and keep `contain` on the lists
for the scroll that starts inside.

### Resources

- [overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior): The property that stops a scroll from chaining out to the page, on MDN.
- [Take control of your scroll](https://developer.chrome.com/blog/overscroll-behavior): The Chrome team's walkthrough of scroll chaining and how contain fixes it in modals.
- [inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert): The attribute that takes a whole subtree out of focus, clicks and the accessibility tree.
- [The dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog): What showModal() gives you for free, from inert backgrounds to Escape and focus.
- [Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): The ARIA Authoring Practices rules for where focus goes when a dialog opens and closes.


## Toasts

> News from somewhere else.

- Section: Interaction
- URL: https://critly.vercel.app/toasts
- Published: 2026-10-03
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/interaction/toasts.mdx

A toast is a small message that slides in from a corner and leaves on its own.
It's good at one thing: telling you about something that happened away from
where you're looking. Most apps use it for everything.

**Toast what happened out of sight. If the change already shows where the
person is looking, show it there instead.**

Star the report, copy the link, then export it.

> **Interactive demo: Toasts.** Open https://critly.vercel.app/toasts to try it.

Toasting every action turns three clicks into four toasts, and none of them
say anything the interface didn't. The star already filled in. "Copied"
belongs on the button you just pressed, under your cursor. Inline first, the
only toast left is the one that earns it: the export finishing 3 seconds
later, when you could be anywhere.

Keep the words short and lead with what happened, "Q4 report.pdf is ready",
not "Success!". One action at most. Plain news here lasts 4 seconds, Sonner's
default. Toasts with a button get 8, because reading and then reaching takes
longer.

### Stacking

Toasts arrive in bursts. They shouldn't build a wall over the page, or leave
while someone is reading them. Add a few, then hover them.

> **Interactive demo: Toast Stacking.** Open https://critly.vercel.app/toasts to try it.

Piled up, five toasts cover most of the inbox and keep expiring under your
cursor. Stacked, the newest sits in front with two more peeking out 8px
behind it. Hover or focus fans them out and pauses every timer. How they move
between those spots is [interruptibility](https://critly.vercel.app/interruptibility), and how they
leave is [exit animations](https://critly.vercel.app/exit-animations).

Sonner works the same way: three visible, a stack that opens on hover, and
timers that stop while it's hovered or the tab is hidden. Alt+T (Option+T on
a Mac) opens it from the keyboard, but tabbing onto a toast doesn't pause it,
one more reason to give toasts with a button extra time.

### Errors need a place to stay

"Couldn't save" fades away while the work is still unsaved. An error that
needs action belongs next to the thing that failed, or in a banner that stays
until it's fixed.

Adrian Roselli argues no toast should time out, since a message that leaves
on its own fails slow readers. I'd keep the timer for news you can also find
elsewhere, and make anything with a button stay until it's dismissed or
reachable another way.

### Usage

**Tailwind**

```html
<!-- In the page from the start, so screen readers are listening -->
<div role="status" aria-atomic="false" class="fixed right-6 bottom-6 flex w-80 flex-col gap-2">
  <div class="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm shadow-lg">
    Q4 report.pdf is ready
    <button class="ml-auto rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium">
      Download
    </button>
  </div>
</div>
```

**React**

```tsx
import { toast } from "sonner";

// <Toaster /> renders once, at the root of the app.

// A background job finished: the person may be anywhere by now
toast("Q4 report.pdf is ready", {
  duration: 8000,
  action: { label: "Download", onClick: download },
});

// Nothing to do but read, so the default 4 seconds is fine
toast("Ada joined Design");
```

The live region has to be in the page before the first message lands. A
`role="status"` element inserted together with its text often isn't announced
at all. Render the empty container once and add toasts into it, which is what
Sonner's `<Toaster />` does.

### Resources

- [Building a Toast Component](https://emilkowal.ski/ui/building-a-toast-component): Emil Kowalski on the decisions behind Sonner, from the stack that expands on hover to the timer that pauses in hidden tabs.
- [ARIA status role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role): The live region role that announces a message politely, without moving focus.
- [Defining 'Toast' Messages](https://adrianroselli.com/2020/01/defining-toast-messages.html): Adrian Roselli's case that toasts should never time out and shouldn't hold interactive content.
- [Understanding status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): The WCAG criterion behind role="status", for messages that are announced without taking focus.


## Destructive Actions

> Undo instead of asking.

- Section: Interaction
- URL: https://critly.vercel.app/destructive-actions
- Published: 2026-10-03
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/interaction/destructive-actions.mdx

"Are you sure?" on every delete stops protecting anyone by the third time.
People learn where OK is and click it without reading, and the one time it
matters, the habit clicks through too.

**If an action can be undone, do it right away and offer Undo. Save
confirmation for what can't be undone.**

Delete a few files each way.

> **Interactive demo: Delete Undo.** Open https://critly.vercel.app/destructive-actions to try it.

With a dialog on every row, three files take six clicks, and every dialog asks
the same question. With Undo they take three. The file goes as soon as you
press, and a toast keeps Undo around for 5 seconds. Delete another while it's
up and Undo brings both back where they were.

Aza Raskin made this case in 2007: never use a warning when you mean undo. A
warning asks people to predict a mistake. Undo lets them notice it
afterwards, which is when people actually notice.

Undo needs a soft delete behind it. Hide the row, keep it with a `deletedAt`,
and purge it later. The toast goes away, so give deleted things a home that
stays, like a Trash that keeps them for 30 days.

### When you have to ask

Some things can't come back, like a project with all its deployments. Here a
confirmation earns its place, as long as it says something. Open the dialog
and press Enter.

> **Interactive demo: Confirm Dialog.** Open https://critly.vercel.app/destructive-actions to try it.

"Are you sure?" could be about anything, and with focus on OK, Enter deletes
the project. The specific dialog names the project, says what goes with it,
and the button repeats the verb: "Delete project", not "OK". Focus starts on
Cancel, so a stray Enter does nothing. The rest follows the
[overlays](https://critly.vercel.app/overlays) rules: focus goes in, Escape cancels, and focus comes
back to the button.

For the catastrophic, add friction on purpose. GitHub asks you to type the
repository's full name before it deletes one. It works because it's rare. Ask
for it on every delete and typing becomes one more reflex.

### Red where it counts

Red is a warning, and warnings wear out. Keep it for the button that actually
destroys something. The trash icons in the file list stay grey and turn red
on hover, one of their [interaction states](https://critly.vercel.app/interaction-states) rather than
a color they wear all the time.

### Usage

**Tailwind**

```html
<dialog id="delete" role="alertdialog" aria-labelledby="delete-title"
  class="max-w-sm rounded-xl p-4 backdrop:bg-black/20">
  <h2 id="delete-title" class="text-sm font-medium">Delete “Critly website”?</h2>
  <p class="mt-1.5 text-sm text-neutral-500">
    This permanently deletes 214 deployments, 3 environments and the craft.dev domain.
  </p>
  <form method="dialog" class="mt-4 flex justify-end gap-2">
    <button value="cancel" autofocus class="rounded-full px-3 py-1.5 text-sm">
      Cancel
    </button>
    <button value="delete" class="rounded-full bg-red-500/10 px-3 py-1.5 text-sm text-red-600">
      Delete project
    </button>
  </form>
</dialog>
```

**React**

```tsx
import { toast } from "sonner";

function remove(file: File) {
  // Soft delete: hidden now, purged later
  softDelete(file.id);

  toast(`Deleted “${file.name}”`, {
    duration: 5000,
    action: { label: "Undo", onClick: () => restore(file.id) },
  });
}
```

Undo has to reverse everything the delete set off. If removing a file also
emails its collaborators, bringing the file back doesn't unsend the emails.
Hold side effects like these until the undo window has closed.

### Resources

- [Never Use a Warning When You Mean Undo](https://alistapart.com/article/neveruseawarning/): Aza Raskin's 2007 essay on why people click through warnings out of habit, and why undo works instead.
- [Confirmation Dialogs Can Prevent User Errors (If Not Overused)](https://www.nngroup.com/articles/confirmation-dialog/): Jakob Nielsen on saving confirmations for serious consequences and labeling buttons with what they do.
- [How To Manage Dangerous Actions In User Interfaces](https://www.smashingmagazine.com/2024/09/how-manage-dangerous-actions-user-interfaces/): Victor Ponamariov's tour of undo, specific dialogs and type-to-confirm, and when each one fits.
- [Alert and Message Dialogs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): The ARIA Authoring Practices for the alertdialog role, including where focus should start.
