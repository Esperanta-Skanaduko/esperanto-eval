/**
 * The 95% Wilson score interval for a proportion, which stays sensible for small
 * samples and for scores near 0 or 1 (unlike the normal approximation).
 *
 * @param correct - Number of correct answers.
 * @param total - Number of items.
 * @returns The lower and upper bound, between 0 and 1.
 */
export const wilsonInterval = (correct, total) => {
  if (total === 0) return { low: 0, high: 0 };
  const z = 1.959963984540054;
  const p = correct / total;
  const denominator = 1 + (z * z) / total;
  const centre = (p + (z * z) / (2 * total)) / denominator;
  const margin = (z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total))) / denominator;
  return { low: Math.max(0, centre - margin), high: Math.min(1, centre + margin) };
};
