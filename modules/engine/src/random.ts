// Seedable randomness. The engine never calls Math.random: callers inject a `random` function.

/** mulberry32: a small, fast, seedable generator of floats in [0, 1). */
export const createRandom = (seed: number): (() => number) => {
  let state = seed | 0;

  return (): number => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);

    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** A uniform float in [low, high). */
export const randomBetween = (random: () => number, low: number, high: number): number =>
  low + (high - low) * random();

/** Fisher-Yates shuffle into a new array. The input is left untouched. */
export const shuffle = <T>(items: readonly T[], random: () => number): T[] => {
  const out = [...items];

  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const swap = out[i] as T;

    out[i] = out[j] as T;
    out[j] = swap;
  }

  return out;
};
