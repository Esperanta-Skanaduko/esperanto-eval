import { numberToWords } from './numberToWords.mjs';

/**
 * Generates number items in both directions: digits to Esperanto words, and
 * Esperanto words to digits. Numbers are spread over 0-9999 with a bias to the
 * interesting cases (teens, round numbers, years).
 *
 * @param rng - Seeded generator from `createRng`.
 * @param count - Number of items (half in each direction).
 * @returns Items; word answers are compared ignoring spaces, digit answers as digits.
 */
export const generateNumbers = (rng, count) => {
  const chosen = new Set();
  const draw = () => {
    for (;;) {
      const style = rng.int(4);
      const number = style === 0 ? rng.int(100) : style === 1 ? (rng.int(99) + 1) * 100 : style === 2 ? 1000 + rng.int(1100) : rng.int(10000);
      if (!chosen.has(number)) {
        chosen.add(number);
        return number;
      }
    }
  };
  const items = [];
  for (let index = 0; index < count; index += 1) {
    const number = draw();
    if (index % 2 === 0) {
      items.push({
        task: 'number-write',
        prompt: `Write the number ${number} in Esperanto words (hundreds and tens are one word, as in "tricent" and "dudek"; thousands are a separate word, as in "du mil"). Answer with the words only.`,
        answer: numberToWords(number),
        kind: 'words',
        meta: { number },
      });
    } else {
      items.push({
        task: 'number-read',
        prompt: `Write this Esperanto number in digits: ${numberToWords(number)}\nAnswer with the digits only.`,
        answer: String(number),
        kind: 'number',
        meta: { number },
      });
    }
  }
  return items;
};
