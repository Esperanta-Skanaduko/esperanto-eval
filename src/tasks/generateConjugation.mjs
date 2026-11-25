import { FORMS, VERBS } from './verbData.mjs';

/**
 * Generates verb-form items: given an infinitive and a form, write the form.
 * Passive participles are only asked for transitive verbs.
 *
 * @param rng - Seeded generator from `createRng`.
 * @param count - Number of items.
 * @returns Items with a one-word text answer.
 */
export const generateConjugation = (rng, count) => {
  const pairs = VERBS.flatMap((verb) => FORMS.filter((form) => !form.passive || verb.transitive).map((form) => ({ verb, form })));
  return rng.shuffle(pairs).slice(0, count).map(({ verb, form }) => ({
    task: 'conjugation',
    prompt: `Give the ${form.label} of the Esperanto verb "${verb.verb}" (${verb.english}). Answer with the single word only.`,
    answer: `${verb.verb.slice(0, -1)}${form.ending}`,
    kind: 'text',
    meta: { verb: verb.verb, ending: form.ending },
  }));
};
