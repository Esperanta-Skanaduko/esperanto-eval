import { CORRELATIVES } from './correlativeTable.mjs';

/**
 * Generates "write the correlative" items: the model gets an English meaning and
 * must produce the Esperanto word. Every one of the 45 correlatives is used once.
 *
 * @param rng - Seeded generator from `createRng`.
 * @param count - Maximum number of items (at most 45).
 * @returns Items with the gold answer and a `text` comparison.
 */
export const generateCorrelativeProduction = (rng, count) =>
  rng.shuffle(CORRELATIVES).slice(0, count).map((entry) => ({
    task: 'correlative-write',
    prompt: `Esperanto correlative words are built from a prefix (ki-, ti-, i-, ĉi-, neni-) and a suffix (-u, -o, -a, -es, -e, -al, -el, -am, -om). Write the single Esperanto correlative that means "${entry.english}" (${/^[aeiou]/.test(entry.kind) ? 'an' : 'a'} ${entry.kind} word). Answer with the word only.`,
    answer: entry.word,
    kind: 'text',
    meta: { prefix: entry.prefix, suffix: entry.suffix },
  }));
