/**
 * The Esperanto table of correlatives: five prefixes times nine suffixes, 45 words.
 * Each word has a short English meaning. The table is part of the Fundamento and
 * is the same in every grammar; the English glosses are written for this benchmark.
 */
const PREFIXES = [
  { prefix: 'ki', role: 'question or relative' },
  { prefix: 'ti', role: 'demonstrative' },
  { prefix: 'i', role: 'indefinite' },
  { prefix: 'ĉi', role: 'universal' },
  { prefix: 'neni', role: 'negative' },
];

const SUFFIXES = [
  { suffix: 'u', kind: 'individual', english: ['who / which one', 'that one', 'someone', 'everyone / each one', 'no one'] },
  { suffix: 'o', kind: 'thing', english: ['what', 'that (thing)', 'something', 'everything', 'nothing'] },
  { suffix: 'a', kind: 'quality', english: ['what kind of', 'that kind of / such', 'some kind of', 'every kind of', 'no kind of'] },
  { suffix: 'es', kind: 'possession', english: ['whose', "that one's", "someone's", "everyone's", "no one's"] },
  { suffix: 'e', kind: 'place', english: ['where', 'there', 'somewhere', 'everywhere', 'nowhere'] },
  { suffix: 'al', kind: 'reason', english: ['why', 'for that reason', 'for some reason', 'for every reason', 'for no reason'] },
  { suffix: 'el', kind: 'manner', english: ['how', 'in that way / so', 'somehow', 'in every way', 'in no way'] },
  { suffix: 'am', kind: 'time', english: ['when', 'then', 'sometime / ever', 'always', 'never'] },
  { suffix: 'om', kind: 'amount', english: ['how much / how many', 'that much / that many', 'some amount / a little', 'the whole amount', 'none / no amount'] },
];

/** All 45 correlatives as `{ word, prefix, suffix, kind, english }`. */
export const CORRELATIVES = SUFFIXES.flatMap((suffix) =>
  PREFIXES.map((prefix, index) => ({
    word: `${prefix.prefix}${suffix.suffix}`,
    prefix: prefix.prefix,
    suffix: suffix.suffix,
    kind: suffix.kind,
    english: suffix.english[index],
  })),
);
