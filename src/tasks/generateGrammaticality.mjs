import { ADJECTIVES, ANIMATES, PLACES, THINGS } from './vocabulary.mjs';
import { buildNounPhrase } from './buildNounPhrase.mjs';
import { pickSentenceParts } from './pickSentenceParts.mjs';

const capitalize = (text) => text[0].toUpperCase() + text.slice(1);
const PREDICATE_NOUNS = ['instruisto', 'kuracisto', 'studento', 'amiko', 'patro'];
const LOCATION_VERBS = ['loĝas', 'dormas', 'laboras', 'ludas'];

/**
 * Builds one minimal pair: a correct sentence and a copy with exactly one error
 * of a known kind. Every error is a plain rule of Esperanto grammar.
 *
 * @param rng - Seeded generator.
 * @param kind - Which error to inject.
 * @returns The correct and the wrong sentence.
 */
const buildPair = (rng, kind) => {
  if (kind === 'attributive-agreement') {
    const noun = rng.pick([...ANIMATES, ...THINGS]);
    const adjective = rng.pick(ADJECTIVES);
    const verb = rng.pick(['estas tie', 'dormas', 'staras tie']);
    const good = `${buildNounPhrase(noun, adjective, true, false).words.join(' ')} ${verb}`;
    const adjectiveOnly = rng.int(2) === 0;
    const wrongWords = buildNounPhrase(noun, adjective, true, false).words;
    if (adjectiveOnly) wrongWords[1] = adjective.eo;
    else wrongWords[2] = noun.eo;
    return { good: `${capitalize(good)}.`, bad: `${capitalize(`${wrongWords.join(' ')} ${verb}`)}.` };
  }
  if (kind === 'predicate-agreement') {
    const noun = rng.pick([...ANIMATES, ...THINGS]);
    const adjective = rng.pick(ADJECTIVES);
    const plural = rng.int(2) === 0;
    const subject = buildNounPhrase(noun, null, plural, false).words.join(' ');
    return { good: `${capitalize(subject)} estas ${adjective.eo}${plural ? 'j' : ''}.`, bad: `${capitalize(subject)} estas ${adjective.eo}${plural ? '' : 'j'}.` };
  }
  if (kind === 'missing-accusative') {
    const { action, subject, object } = pickSentenceParts(rng);
    const subjectWords = buildNounPhrase(subject, null, false, false).words.join(' ');
    return {
      good: `${capitalize(subjectWords)} ${action.eo} ${buildNounPhrase(object, null, false, true).words.join(' ')}.`,
      bad: `${capitalize(subjectWords)} ${action.eo} ${buildNounPhrase(object, null, false, false).words.join(' ')}.`,
    };
  }
  if (kind === 'accusative-after-estas') {
    const subject = rng.pick(ANIMATES);
    const noun = rng.pick(PREDICATE_NOUNS);
    const adjective = rng.pick(ADJECTIVES.filter((entry) => !['nova', 'malnova'].includes(entry.eo)));
    const subjectWords = buildNounPhrase(subject, null, false, false).words.join(' ');
    return { good: `${capitalize(subjectWords)} estas ${adjective.eo} ${noun}.`, bad: `${capitalize(subjectWords)} estas ${adjective.eo}n ${noun}n.` };
  }
  const subject = rng.pick(ANIMATES);
  const verb = rng.pick(LOCATION_VERBS);
  const place = rng.pick(PLACES.filter((entry) => !entry.eo.startsWith('sur')));
  const subjectWords = buildNounPhrase(subject, null, false, false).words.join(' ');
  const [preposition, article, noun] = place.eo.split(' ');
  return { good: `${capitalize(subjectWords)} ${verb} ${place.eo}.`, bad: `${capitalize(subjectWords)} ${verb} ${preposition} ${article} ${noun}n.` };
};

const KINDS = ['attributive-agreement', 'predicate-agreement', 'missing-accusative', 'accusative-after-estas', 'static-location'];

/**
 * Generates grammaticality items: two sentences, exactly one correct, and the model
 * names the correct one. The five error kinds are used equally often and the
 * correct sentence is A and B equally often.
 *
 * @param rng - Seeded generator from `createRng`.
 * @param count - Number of items.
 * @returns Items whose answer is A or B.
 */
export const generateGrammaticality = (rng, count) => {
  const items = [];
  const seen = new Set();
  let guard = 0;
  while (items.length < count && guard < count * 50) {
    guard += 1;
    const kind = KINDS[items.length % KINDS.length];
    const { good, bad } = buildPair(rng, kind);
    const goodFirst = items.length % 2 === 0;
    const [first, second] = goodFirst ? [good, bad] : [bad, good];
    const prompt = `Exactly one of these two Esperanto sentences is grammatically correct. Which one?\nA) ${first}\nB) ${second}\nAnswer with a single letter, A or B.`;
    if (seen.has(prompt) || good === bad) continue;
    seen.add(prompt);
    items.push({ task: 'grammaticality', prompt, answer: goodFirst ? 'A' : 'B', kind: 'choice', meta: { error: kind } });
  }
  return items;
};
