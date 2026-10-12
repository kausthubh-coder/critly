# Content

## Microcopy

> Buttons say what they do.

- Section: Content
- URL: https://critly.vercel.app/microcopy
- Published: 2026-10-03
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/content/microcopy.mdx

A button that says "OK" makes you read the whole dialog again to find out what
OK will do. The words in an interface are controls, just like the buttons they
sit on.

**Interface words are interface: buttons name the action, labels name the
thing, and errors say what happened and how to fix it.**

> **Interactive demo: Microcopy.** Open https://critly.vercel.app/microcopy to try it.

Press Remove in both modes. "Are you sure?" with Yes and No asks you to
remember what you clicked. "Delete project" says the verb and the object, so
the button still makes sense if it's the only thing you read. Whether to ask
at all is a separate question, covered in
[destructive actions](https://critly.vercel.app/destructive-actions).

Labels are nouns, not questions: "Project name", not "What do you want to call
it?". Pick one word for each thing and use it everywhere. Generic mode calls it
a project, then a workspace, and the button says Remove while the dialog says
deleted. Two names for one thing make people wonder whether it's two things.

Write in sentence case. GOV.UK asks for it on buttons. Apple lets you choose
title or sentence case per element, as long as you stay consistent. I prefer
sentence case everywhere: it reads like speech, and nobody has to argue about
which words get a capital.

### Errors

An error has two jobs: say what happened, and say what to do next.

> **Interactive demo: Error Messages.** Open https://critly.vercel.app/microcopy to try it.

"An error occurred" does neither. "Error 402" is for the server log.
"You entered an invalid username!" blames the person for a rule they couldn't
see. NN/g and GOV.UK both warn against "invalid", and GOV.UK adds "please", "sorry" and
"oops" to the list. None of them help fix anything. For when to show an error,
see [input details](https://critly.vercel.app/input-details).

### Counts and ellipses

"1 files" is what happens when a string is built with `${n} files`. Plurals
differ by language: English has two forms, Polish has four, Arabic has six.
`Intl.PluralRules` knows them all.

> **Interactive demo: Plural Count.** Open https://critly.vercel.app/microcopy to try it.

Format big numbers with separators and use [tabular numbers](https://critly.vercel.app/tabular-numbers)
for counts that change. Zero is its own case: "No files selected" reads better
than "0 files selected", and an empty list deserves a real
[empty state](https://critly.vercel.app/empty-states).

Use the real ellipsis "…", one character, not three periods. On a button or
menu item it means the action needs more input before it runs, like
"Rename…". On a status it means something is in progress, like "Saving…".

### Usage

**Tailwind**

```html
<label for="name" class="text-sm">Project name</label>
<input id="name" aria-invalid="true" aria-describedby="name-error" />
<p id="name-error" class="text-sm text-red-600">Enter a project name</p>

<button class="rounded-full bg-black px-3 py-1.5 text-sm text-white">
  Save changes
</button>
```

**React**

```tsx
const plural = new Intl.PluralRules("en-US");
const number = new Intl.NumberFormat("en-US");
const forms: Partial<Record<Intl.LDMLPluralRule, string>> = {
  one: "file",
  other: "files",
};

function files(count: number) {
  if (count === 0) return "No files";
  const form = forms[plural.select(count)] ?? forms.other;
  return `${number.format(count)} ${form}`;
}

<span className="tabular-nums">{files(1284)} selected</span>;
// 1,284 files selected
```

Keep whole sentences in one string with placeholders, never glue fragments
together like `"Delete " + noun`. Word order changes between languages, and a
translator can't fix a sentence they only see in pieces.

### Resources

- [GOV.UK error messages](https://design-system.service.gov.uk/components/error-message/): Say what happened and how to fix it, and the words to never use while doing it.
- [GOV.UK buttons](https://design-system.service.gov.uk/components/button/): Button text in sentence case that describes the action it performs.
- [Error-message guidelines](https://www.nngroup.com/articles/error-message-guidelines/): NN/g's research on visible, constructive errors that don't blame the user.
- [Apple HIG - Writing](https://developer.apple.com/design/human-interface-guidelines/writing): Action-oriented labels, consistent terms, and one capitalization style per element.
- [Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules): The browser's built-in plural categories for every locale, on MDN.


## Real Content

> Design for the data you'll actually get.

- Section: Content
- URL: https://critly.vercel.app/real-content
- Published: 2026-10-03
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/content/real-content.mdx

Mockups are full of Jane Doe. Her name is short, her photo is square, and she
has exactly 12 tasks. Your real users have long names, no photo, zero tasks or
a thousand, and they write in German.

**Design with the awkward data you'll actually get, and give every text box a
plan for when it overflows.**

> **Interactive demo: Real Content.** Open https://critly.vercel.app/real-content to try it.

Switch to real data. The long name pushes the count out of the card, even
though the name already has `truncate`. A flex item won't shrink below the width
of its content, so the ellipsis never gets a chance. `min-width: 0` on the text
column fixes it.

The person with no name is an empty line, the missing photos are grey holes,
and "1 tasks" and "1284" finish it off. Fixed mode falls back to the email,
draws initials, and formats counts with [tabular numbers](https://critly.vercel.app/tabular-numbers).

### Test with the worst case

Keep a set of awkward records next to your nice ones:

- A name over 40 characters, and one with no name at all.
- 0, 1 and 1,000+ of everything. Zero needs an [empty state](https://critly.vercel.app/empty-states).
- No avatar, and photos of every aspect ratio.
- Another language. W3C quotes IBM's figures: text over 70 characters grows
  about 30% from English, and labels under 10 can double or triple. German
  compounds like "Kundenbetreuungsteamleiterin" won't wrap without
  `hyphens: auto` and `lang="de"`.

### A plan for every box

Each text container needs one of three plans. Truncate single-line things you
can open elsewhere, like names in a list, and put the full text in a `title`.
Clamp previews to two or three lines. Wrap anything people have to read in
full, like errors and addresses, with a sensible [line length](https://critly.vercel.app/line-length)
and [text wrapping](https://critly.vercel.app/text-wrapping).

Images need a plan too. Give them a fixed aspect ratio and let them crop.

> **Interactive demo: Real Content Grid.** Open https://critly.vercel.app/real-content to try it.

With placeholders the grid looks perfect, because every grey box is 16:9.
Real uploads arrive as a panorama, a square, a painting and no image at all.
Every image is a different height, one title wraps to four lines or more,
another is missing, and the counts land wherever the text ends. A 4:3 box with
`object-fit: cover`, a two-line clamp, "Untitled" and a placeholder put it
back in order.

### Usage

**Tailwind**

```html
<li class="flex items-center gap-3">
  <img class="size-8 shrink-0 rounded-full object-cover" src="..." alt="" />
  <div class="min-w-0 flex-1">
    <p class="truncate" title="Maximiliane Wolfeschlegelsteinhausen-Bergdorff">
      Maximiliane Wolfeschlegelsteinhausen-Bergdorff
    </p>
  </div>
  <span class="shrink-0 tabular-nums">1,284 tasks</span>
</li>

<img class="aspect-4/3 w-full object-cover" src="..." alt="" />
<p class="line-clamp-2 break-words">...</p>
```

**CSS**

```css
.row-text {
  flex: 1;
  min-width: 0;
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  overflow-wrap: break-word;
}

.thumbnail {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}
```

A `title` tooltip never shows on a touch screen, and keyboard users can't reach
it. Only truncate text that people can read in full somewhere else, like a
profile or a detail view.

### Resources

- [Defensive CSS](https://defensivecss.dev/): Ahmad Shadeed's catalogue of CSS that survives long text, missing images and odd sizes.
- [Flexbox and truncated text](https://css-tricks.com/flexbox-truncated-text/): Why an ellipsis inside a flex item needs min-width: 0 on its parent.
- [Text size in translation](https://www.w3.org/International/articles/article-text-size): W3C's guide to how much text grows when it leaves English, by string length.
- [line-clamp](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-clamp): Cut a block of text after a set number of lines, on MDN.
