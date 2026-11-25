import { CORRELATIVES } from './correlativeTable.mjs';

const NEAR_SYNONYMS = new Set(['o', 'om']);

/**
 * Whether two correlatives have meanings close enough to make a multiple-choice
 * question ambiguous (`ĉio` "everything" and `ĉiom` "the whole amount").
 *
 * @param first - One correlative entry.
 * @param second - Another correlative entry.
 * @returns True if they must not appear in the same question.
 */
const tooClose = (first, second) =>
  first.prefix === second.prefix && NEAR_SYNONYMS.has(first.suffix) && NEAR_SYNONYMS.has(second.suffix);

/**
 * Generates "what does this correlative mean" multiple-choice items. The three
 * wrong options are chosen to be tempting: one shares the prefix, one shares the
 * suffix, and one is random.
 *
 * @param rng - Seeded generator from `createRng`.
 * @param count - Number of items.
 * @returns Items whose answer is a letter A to D.
 */
export const generateCorrelativeChoice = (rng, count) => {
  const items = [];
  const seen = new Set();
  let guard = 0;
  while (items.length < count && guard < count * 50) {
    guard += 1;
    const target = rng.pick(CORRELATIVES);
    const others = CORRELATIVES.filter((entry) => entry.word !== target.word && !tooClose(target, entry));
    const samePrefix = rng.pick(others.filter((entry) => entry.prefix === target.prefix));
    const sameSuffix = rng.pick(others.filter((entry) => entry.suffix === target.suffix));
    const random = rng.pick(others.filter((entry) => entry.prefix !== target.prefix && entry.suffix !== target.suffix));
    const options = rng.shuffle([target, samePrefix, sameSuffix, random]);
    if (new Set(options.map((entry) => entry.english)).size < 4) continue;
    if (options.some((first, index) => options.some((second, other) => other > index && tooClose(first, second)))) continue;
    const letters = ['A', 'B', 'C', 'D'];
    const prompt = `What does the Esperanto word "${target.word}" mean?\n${options.map((entry, index) => `${letters[index]}) ${entry.english}`).join('\n')}\nAnswer with a single letter.`;
    if (seen.has(prompt)) continue;
    seen.add(prompt);
    items.push({ task: 'correlative-meaning', prompt, answer: letters[options.indexOf(target)], kind: 'choice', meta: { word: target.word } });
  }
  return items;
};
