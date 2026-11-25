import { generateAccusative } from './generateAccusative.mjs';
import { generateConjugation } from './generateConjugation.mjs';
import { generateCorrelativeChoice } from './generateCorrelativeChoice.mjs';
import { generateCorrelativeProduction } from './generateCorrelativeProduction.mjs';
import { generateGrammaticality } from './generateGrammaticality.mjs';
import { generateNumbers } from './generateNumbers.mjs';
import { generateWordBuilding } from './generateWordBuilding.mjs';

/** Every task: id(s) used in items, a short title, what it tests, its generator, and the default item count. */
export const TASKS = [
  { id: 'correlative-write', title: 'Correlatives: write the word', tests: 'The 45-word table of correlatives, produced from an English meaning.', generate: generateCorrelativeProduction, count: 45 },
  { id: 'correlative-meaning', title: 'Correlatives: choose the meaning', tests: 'The same table, read: choose the right meaning among tempting neighbours.', generate: generateCorrelativeChoice, count: 60 },
  { id: 'accusative', title: 'Accusative', tests: 'Mark the direct object (and its adjective) with -n or -jn, in SVO and OVS order, without marking the subject or a noun after a preposition.', generate: generateAccusative, count: 100 },
  { id: 'grammaticality', title: 'Grammaticality (minimal pairs)', tests: 'Pick the correct sentence from a pair differing by one error: noun-adjective agreement, predicate agreement, missing or extra accusative, static location.', generate: generateGrammaticality, count: 100 },
  { id: 'word-building', title: 'Word-building with affixes', tests: 'Combine a root and an affix into the standard derived word.', generate: generateWordBuilding, count: 72 },
  { id: 'conjugation', title: 'Verb forms', tests: 'Tenses, conditional, imperative and the six participles.', generate: generateConjugation, count: 100 },
  { id: 'number-write', title: 'Numbers: write', tests: 'Digits to Esperanto number words (0-9999).', generate: null, count: 0 },
  { id: 'number-read', title: 'Numbers: read', tests: 'Esperanto number words to digits (0-9999).', generate: null, count: 0 },
];

/** The number task is generated as one pool and split into write and read items. */
export const NUMBER_COUNT = 100;
export { generateNumbers };
