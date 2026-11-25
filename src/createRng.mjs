/**
 * Creates a small seeded random number generator (mulberry32), so a benchmark can
 * be regenerated exactly from its seed on any machine.
 *
 * @param seed - Any integer.
 * @returns Functions for a float in [0, 1), an integer below n, a random pick and a shuffle.
 */
export const createRng = (seed) => {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (n) => Math.floor(next() * n);
  const pick = (list) => list[int(list.length)];
  const shuffle = (list) => {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const other = int(index + 1);
      [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
  };
  return { next, int, pick, shuffle };
};
