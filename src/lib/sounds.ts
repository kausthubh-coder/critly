"use client";

import {
  definePatch,
  defineSound,
  ensureReady,
  type SoundDefinition,
} from "@web-kits/audio";

// Adapted from the "Minimal" patch by Raphael Salaja for his @web-kits/audio
// library (audio.raphaelsalaja.com/library/minimal) - quiet sine-based UI
// feedback. "tick" is Minimal's "tap" and "toggle" is its "toggle-on".
const minimal = definePatch({
  name: "Minimal",
  sounds: {
    // Minimal's hover at a quarter of its 0.04 gain.
    hover: {
      source: { type: "sine", frequency: 1300 },
      envelope: { attack: 0, decay: 0.01, sustain: 0, release: 0.004 },
      gain: 0.01,
    },
    tick: {
      source: { type: "sine", frequency: 1200 },
      envelope: { attack: 0, decay: 0.012, sustain: 0, release: 0.004 },
      gain: 0.08,
    },
    pop: {
      source: { type: "sine", frequency: { start: 400, end: 200 } },
      envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.012 },
      gain: 0.1,
    },
    // "Success" from the Retro patch (audio.raphaelsalaja.com/library/retro)
    // - a rising 8-bit C-E-G-C arpeggio, at under half of Retro's gains.
    success: {
      layers: [
        {
          source: { type: "square", frequency: 523 },
          envelope: { attack: 0, decay: 0.06, sustain: 0, release: 0.02 },
          gain: 0.06,
        },
        {
          source: { type: "square", frequency: 659 },
          envelope: { attack: 0, decay: 0.06, sustain: 0, release: 0.02 },
          delay: 0.06,
          gain: 0.05,
        },
        {
          source: { type: "square", frequency: 784 },
          envelope: { attack: 0, decay: 0.06, sustain: 0, release: 0.02 },
          delay: 0.12,
          gain: 0.045,
        },
        {
          source: { type: "square", frequency: 1047 },
          envelope: { attack: 0, decay: 0.08, sustain: 0, release: 0.025 },
          delay: 0.18,
          gain: 0.04,
        },
      ],
    },
    toggle: {
      layers: [
        {
          source: { type: "sine", frequency: 880 },
          envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 },
          gain: 0.08,
        },
        {
          source: { type: "sine", frequency: 1320 },
          envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 },
          delay: 0.03,
          gain: 0.07,
        },
      ],
    },
  },
});

export const SOUND_NAMES = [
  "tick",
  "pop",
  "success",
  "toggle",
  "hover",
] as const;
export type SoundName = (typeof SOUND_NAMES)[number];

const MUTE_KEY = "craft-muted";

export function isMuted() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(MUTE_KEY) === "true";
}

export function setMuted(muted: boolean) {
  window.localStorage.setItem(MUTE_KEY, String(muted));
}

export type PlayOptions = { detune?: number; volume?: number };

// Browsers keep the AudioContext suspended until a real user gesture
// (click/key/touch - hover doesn't count), and resume() just stays pending
// until then. Track when it has actually resolved so hover sounds can be
// dropped instead of queueing up and bursting out after the first click.
let audioUnlocked = false;

async function unlockAudio() {
  try {
    await ensureReady();
    audioUnlocked = true;
  } catch {
    // Audio not available - stay silent.
  }
}

if (typeof window !== "undefined") {
  // Unlock on the first gesture anywhere, not just the first sound-playing
  // interaction, so hover sounds start working as early as possible.
  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("keydown", unlockAudio, { once: true });
}

/** Plays a sound regardless of the mute toggle (for explicit demos). */
export async function playSoundAlways(name: SoundName, opts?: PlayOptions) {
  // Nothing can play before the page's first gesture, so drop the request
  // rather than queue it behind a resume() that resolves later.
  if (!hasBeenActive()) return;
  if (!audioUnlocked) {
    if (name === "hover") {
      // A hover can't grant user activation; don't queue a stale blip.
      void unlockAudio();
      return;
    }
    await unlockAudio();
    if (!audioUnlocked) return;
  }
  try {
    minimal.play(name, opts);
  } catch {
    // Audio not available - stay silent.
  }
}

/** Plays a one-off definition regardless of mute (for demos outside the patch). */
export async function playDefinitionAlways(
  definition: SoundDefinition,
  opts?: PlayOptions
) {
  if (!hasBeenActive()) return;
  if (!audioUnlocked) await unlockAudio();
  if (!audioUnlocked) return;
  try {
    defineSound(definition)(opts);
  } catch {
    // Audio not available - stay silent.
  }
}

function hasBeenActive() {
  if (typeof navigator === "undefined") return false;
  // Browsers without the User Activation API fall back to the old behavior.
  return navigator.userActivation?.hasBeenActive ?? true;
}

export async function playSound(name: SoundName, opts?: PlayOptions) {
  if (isMuted()) return;
  await playSoundAlways(name, opts);
}

/**
 * Detune (in cents) for the nth nav item - a very gentle rise down the
 * list, about a quarter of a semitone per step.
 */
export function progressionDetune(step: number) {
  return step * 25;
}
