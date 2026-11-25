import { ADJECTIVES, PLACES } from './vocabulary.mjs';
import { buildNounPhrase } from './buildNounPhrase.mjs';
import { pickSentenceParts } from './pickSentenceParts.mjs';

const capitalize = (text) => text[0].toUpperCase() + text.slice(1);

/**
 * Generates accusative items. The model sees an English sentence and the Esperanto
 * words with no -n anywhere, in subject-verb-object or object-verb-subject order,
 * and must add -n (and -jn) to the object and its adjective only, not to the subject
 * and not to a noun after a preposition.
 *
 * @param rng - Seeded generator from `createRng`.
 * @param count - Number of items.
 * @returns Items whose answer is the full corrected sentence.
 */
export const generateAccusative = (rng, count) => {
  const items = [];
  const seen = new Set();
  let guard = 0;
  while (items.length < count && guard < count * 50) {
    guard += 1;
    const { action, subject, object } = pickSentenceParts(rng);
    const subjectPlural = rng.int(3) === 0;
    const objectPlural = rng.int(3) === 0;
    const subjectAdjective = rng.int(2) === 0 ? rng.pick(ADJECTIVES) : null;
    const objectAdjective = rng.int(2) === 0 ? rng.pick(ADJECTIVES) : null;
    const place = rng.int(3) === 0 ? rng.pick(PLACES) : null;
    const reversed = rng.int(3) === 0;

    const subjectPhrase = buildNounPhrase(subject, subjectAdjective, subjectPlural, false);
    const objectBare = buildNounPhrase(object, objectAdjective, objectPlural, false);
    const objectMarked = buildNounPhrase(object, objectAdjective, objectPlural, true);
    const verb = action.eo;

    const join = (first, second) => [...first, verb, ...second, ...(place ? [place.eo] : [])].join(' ');
    const given = reversed ? join(objectBare.words, subjectPhrase.words) : join(subjectPhrase.words, objectBare.words);
    const gold = reversed ? join(objectMarked.words, subjectPhrase.words) : join(subjectPhrase.words, objectMarked.words);
    const verbEnglish = subjectPlural ? action.enPlural : action.enSingular;
    const english = `${capitalize(subjectPhrase.english)} ${verbEnglish} ${objectBare.english}${place ? ` ${place.en}` : ''}.`;

    const prompt = `Esperanto marks the direct object with the ending -n (-jn in the plural), on the noun and on its adjective. Words after a preposition, and the subject, do not take -n. The Esperanto sentence below has no -n anywhere. Rewrite it adding -n only where Esperanto requires it, and keep the word order.\nEnglish: ${english}\nEsperanto: ${capitalize(given)}.\nAnswer with the corrected Esperanto sentence only.`;
    if (seen.has(prompt)) continue;
    seen.add(prompt);
    items.push({
      task: 'accusative',
      prompt,
      answer: `${capitalize(gold)}.`,
      kind: 'text',
      meta: { reversedOrder: reversed, withPlace: place !== null },
    });
  }
  return items;
};
