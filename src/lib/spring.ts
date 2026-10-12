// Spring math shared by the motion demos. Springs are described by feel
// (Apple's perceptual duration + bounce) and converted to the physics values
// Motion needs. Physics springs keep their velocity when interrupted; Motion
// springs defined by duration/bounce drop it, so demos always pass these.

export type SpringPhysics = {
  stiffness: number;
  damping: number;
  mass: number;
};

/** Apple's (duration, bounce) to stiffness/damping, mass 1. bounce in [-1, 1]. */
export function springFromFeel(duration: number, bounce = 0): SpringPhysics {
  const stiffness = ((2 * Math.PI) / duration) ** 2;
  const damping =
    bounce >= 0
      ? (4 * Math.PI * (1 - bounce)) / duration
      : (4 * Math.PI) / (duration * (1 + bounce));
  return { stiffness, damping, mass: 1 };
}

/** Position of a spring going 0 -> 1 from rest, sampled every `step` seconds. */
export function sampleSpring(
  { stiffness, damping, mass }: SpringPhysics,
  seconds: number,
  step = 1 / 240
) {
  const samples = new Float32Array(Math.ceil(seconds / step) + 1);
  const substeps = 8;
  const dt = step / substeps;
  let x = 0;
  let v = 0;
  for (let i = 1; i < samples.length; i++) {
    for (let s = 0; s < substeps; s++) {
      const a = (-stiffness * (x - 1) - damping * v) / mass;
      v += a * dt;
      x += v * dt;
    }
    samples[i] = x;
  }
  return samples;
}

/** Peak overshoot (fraction past the target) and time to settle within 0.1%. */
export function springStats(physics: SpringPhysics) {
  const step = 1 / 1000;
  const samples = sampleSpring(physics, 4, step);
  let peak = 0;
  let lastOutside = 0;
  for (let i = 0; i < samples.length; i++) {
    peak = Math.max(peak, samples[i]);
    if (Math.abs(samples[i] - 1) > 0.001) lastOutside = i;
  }
  return {
    overshoot: Math.max(0, peak - 1),
    settleMs: Math.round(lastOutside * step * 1000),
  };
}

/**
 * Where a flick would come to rest, from WWDC18 "Designing Fluid Interfaces":
 * velocity in px/s, decelerating at UIScrollView's normal rate (0.998 per ms).
 */
export function projectMomentum(velocity: number, rate = 0.998) {
  return ((velocity / 1000) * rate) / (1 - rate);
}
