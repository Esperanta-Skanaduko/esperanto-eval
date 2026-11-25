import { WORD_BUILDING } from './wordBuildingData.mjs';

/**
 * Generates word-building items from the curated list: the model combines a root
 * with an affix to form the one standard word with a stated meaning.
 *
 * @param rng - Seeded generator from `createRng`.
 * @param count - Maximum number of items (at most the length of the list).
 * @returns Items with a one-word text answer.
 */
export const generateWordBuilding = (rng, count) =>
  rng.shuffle(WORD_BUILDING).slice(0, count).map(([affix, root, meaning, answer]) => ({
    task: 'word-building',
    prompt: `Form one Esperanto word from the root "${root}" and the affix "${affix}" that means: ${meaning}. Write the word in its basic form (a noun in -o, an adjective in -a, a verb in -i) unless the meaning is plural. Answer with the word only.`,
    answer,
    kind: 'text',
    meta: { affix, root },
  }));
