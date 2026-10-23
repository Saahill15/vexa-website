/**
 * Motion values measured from the reference site.
 *
 * Its blur-in text reveal follows a pure exponential decay: half-way at ~130 ms, 90% at ~400 ms,
 * settled by ~900 ms (time constant ≈ 0.19 s). This easing reproduces that curve over 1 s.
 */
const K = 5.3;
export const expoOut = (t: number) => (1 - Math.exp(-K * t)) / (1 - Math.exp(-K));

/** Duration that, with `expoOut`, matches the reference reveal. */
export const REVEAL_DURATION = 1;

/** Stagger between words in a heading reveal (~60 ms in the reference). */
export const WORD_STAGGER = 0.06;

/**
 * Smooth-scroll interpolation. The reference closes ~6% of the remaining distance per frame
 * (half-way at ~160 ms, settled in ~1 s), which is Lenis with lerp ≈ 0.075.
 */
export const SCROLL_LERP = 0.1;

/** Springy settle used by the folder cards (≈9% overshoot, settled in ~0.9 s). */
export const folderSpring = { type: "spring", stiffness: 320, damping: 22, mass: 1 } as const;
