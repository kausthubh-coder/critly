# Sound

## Interface SFX

> Quiet sounds that confirm actions.

- Section: Sound
- URL: https://critly.vercel.app/interface-sfx
- Published: 2026-07-14
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/sound/interface-sfx.mdx

An interface sound is a cue, not a soundtrack. It says one thing, that
worked, and then it's gone. The shortest cue on this page lasts `16ms`
and the longest is under `300ms`.

Each cue should match the action it confirms. A toggle gets a two-note
flip, a finished task gets a short tick, a sent message gets a rising
arpeggio, and a removal gets a falling pop. Try each control below.

> **Interactive demo: Sound Cues.** Open https://critly.vercel.app/interface-sfx to try it.

These are the sounds this site plays, adapted from patches in Raphael
Salaja's [@web-kits/audio](https://audio.raphaelsalaja.com). They are
synthesized in the browser, so there are no audio files to load.

**A sound confirms something you can already see. It never carries the
message alone.** The switch moves, the text strikes through, the button
reads Sent. Some people have sound off, some are on a train, and some
just don't want it.

### Where sound helps

Sound earns its place when an action finishes and your eyes might be
elsewhere: sending, copying, saving, a long upload completing, a toggle
you flipped from the keyboard.

It hurts almost everywhere else. Typing, scrolling, opening menus,
moving between pages, anything that happens dozens of times a minute. If
a cue can fire twice in the same second, it should probably not exist.

### Keep it quiet

The most common mistake is volume. In `@web-kits/audio` a layer plays at
a gain of `0.5` unless you set one. Raphael's Minimal patch keeps every
layer between `0.04` and `0.12`, and the click cues on this site sit
between `0.04` and `0.1`. Copy the link at each level.

> **Interactive demo: Sound Level.** Open https://critly.vercel.app/interface-sfx to try it.

Loud is the same cue with every layer at five times the gain. It still
tops out at `0.3`, below the library default, and it is already the kind
of sound people mute an app for.

### Hover is a whisper or nothing

Hover fires constantly, so a real cue on hover turns a sidebar into a
keyboard. Move across the list with each setting.

> **Interactive demo: Hover Sound.** Open https://critly.vercel.app/interface-sfx to try it.

The whisper is a sine at a gain of `0.01`, a quarter of what Minimal
ships for hover. It rises 25 cents, a quarter of a semitone, per item, so
moving down the list feels like running a finger along a rail. The tick
is the click sound, and on hover it gets tiring fast.

Browsers keep audio suspended until the first click or key press, so
drop hover cues before that instead of queueing them. And put a mute
switch somewhere obvious. This site keeps one in the header and remembers
it.

### Usage

```tsx
import { definePatch, ensureReady } from "@web-kits/audio";

const ui = definePatch({
  name: "ui",
  sounds: {
    tick: {
      source: { type: "sine", frequency: 1200 },
      envelope: { attack: 0, decay: 0.012, sustain: 0, release: 0.004 },
      gain: 0.08,
    },
  },
});

async function play(name: string) {
  try {
    await ensureReady(); // resumes the AudioContext inside the click
    ui.play(name);
  } catch {
    // No audio available. The visual change still happens.
  }
}

<Button
  onClick={() => {
    setDone(true);
    play("tick");
  }}
>
  Done
</Button>
```

A quick test: trigger your cue twenty times in a row. If you're tired of
it by the tenth, lower the gain, shorten the decay, or cut it.

### Resources

- [@web-kits/audio](https://audio.raphaelsalaja.com): Raphael Salaja's synth library and patch collection, where the sounds on this site come from.
- [Web Audio API best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices): Autoplay rules and why sound has to wait for a user gesture.
- [Playing audio, Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/playing-audio): Apple on when interface sound helps and when it should stay quiet.
- [Applying sound to UI](https://m2.material.io/design/sound/applying-sound-to-ui.html): Material's guidance on matching each sound to what the interface is doing.


## Layering Sounds

> Stack short sources into one full cue.

- Section: Sound
- URL: https://critly.vercel.app/layering-sounds
- Published: 2026-07-15
- Source: https://github.com/kausthubh-coder/craft/blob/main/content/sound/layering-sounds.mdx

A single sine wave is the plainest sound a speaker can make. It is fine
for a tick and not much else.

A **layer** is another source that plays along with the first: a
different wave shape, an octave up or down, a little quieter, and a few
milliseconds late. Stack three or four and the note stops sounding like a
test tone. Play the note below, then add layers.

> **Interactive demo: Sound Layers.** Open https://critly.vercel.app/layering-sounds to try it.

Each bar is one layer on a timeline. Two things make the stack read as
one sound instead of several: the layers start within about `40ms` of each
other, and each one is quieter than the one before it, from a gain of
`0.08` down to `0.02`. Push the spacing to `80ms` and you start to hear
the seams.

**Every layer should add something the others don't.** Two copies of the
same wave at the same pitch mostly just make it louder. A triangle adds
softer harmonics, an octave up adds air, an octave down adds weight.

### From chord to arpeggio

Layers don't have to share a pitch. This site's success sound is four
square waves on C, E, G, and C, each starting `60ms` after the last.
Drag the spacing to hear where a chord turns into an arpeggio.

> **Interactive demo: Arpeggio Spacing.** Open https://critly.vercel.app/layering-sounds to try it.

At `0ms` all four notes land together, which is heavier than a
confirmation needs to be. Between `40ms` and `80ms` you hear one rising
gesture. Past `120ms` it becomes a melody, and a cue that takes half a
second asks for more attention than a copy button deserves.

### Mixing textures

Not every layer is a note. A short burst of filtered noise has no pitch,
but it has an attack, and that is what makes a sound feel like something
was pressed. Flip the switch with each texture selected.

> **Interactive demo: Texture Layers.** Open https://critly.vercel.app/layering-sounds to try it.

The tone on its own is a beep. The noise on its own is a tap. Together
they make a click with a pitch. The noise layer is under `30ms` long and
passes through a bandpass filter at `2600Hz`, so it adds edge without
hiss.

### Usage

```ts
import { definePatch } from "@web-kits/audio";

export const patch = definePatch({
  name: "ui",
  sounds: {
    // one note, three layers
    note: {
      layers: [
        {
          source: { type: "sine", frequency: 523 },
          envelope: { attack: 0.002, decay: 0.09, sustain: 0, release: 0.03 },
          gain: 0.08,
        },
        {
          source: { type: "triangle", frequency: 523 },
          envelope: { attack: 0.002, decay: 0.09, sustain: 0, release: 0.03 },
          gain: 0.05,
          delay: 0.04,
        },
        {
          source: { type: "noise", color: "white" },
          filter: { type: "bandpass", frequency: 2600 },
          envelope: { attack: 0, decay: 0.018, sustain: 0, release: 0.01 },
          gain: 0.06,
        },
      ],
    },
  },
});

// patch.play("note") from a click handler
```

Build one layer at a time. Get the first one right on its own, then add
the next at a lower gain and keep it only if you can hear what it adds.
If muting a layer changes nothing, delete it.

### Resources

- [@web-kits/audio](https://audio.raphaelsalaja.com): Raphael Salaja's synth library, where layers, envelopes, and delays are plain objects.
- [Retro patch](https://audio.raphaelsalaja.com/library/retro): The 8-bit patch this site's success sound is adapted from.
- [OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode): The sine, square, sawtooth, and triangle waves behind every pitched layer.
- [BiquadFilterNode](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode): The bandpass filter that turns white noise into a short tap.
- [Learning Synths](https://learningsynths.ableton.com): Ableton's hands-on intro to oscillators, envelopes, and filters.
