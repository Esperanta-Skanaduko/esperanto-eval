/**
 * Small vocabulary used to build sentences. Every entry is a plain, regular
 * Esperanto root with its English word, so the English side of an item is exact.
 */
export const ANIMATES = [
  { eo: 'kato', en: 'cat', enPlural: 'cats' },
  { eo: 'hundo', en: 'dog', enPlural: 'dogs' },
  { eo: 'knabo', en: 'boy', enPlural: 'boys' },
  { eo: 'knabino', en: 'girl', enPlural: 'girls' },
  { eo: 'viro', en: 'man', enPlural: 'men' },
  { eo: 'virino', en: 'woman', enPlural: 'women' },
  { eo: 'infano', en: 'child', enPlural: 'children' },
  { eo: 'birdo', en: 'bird', enPlural: 'birds' },
];

export const THINGS = [
  { eo: 'libro', en: 'book', enPlural: 'books' },
  { eo: 'pomo', en: 'apple', enPlural: 'apples' },
  { eo: 'pano', en: 'loaf of bread', enPlural: 'loaves of bread' },
  { eo: 'floro', en: 'flower', enPlural: 'flowers' },
  { eo: 'domo', en: 'house', enPlural: 'houses' },
  { eo: 'arbo', en: 'tree', enPlural: 'trees' },
  { eo: 'letero', en: 'letter', enPlural: 'letters' },
  { eo: 'tablo', en: 'table', enPlural: 'tables' },
];

export const FOODS = THINGS.filter((thing) => ['pomo', 'pano'].includes(thing.eo));
export const READABLES = THINGS.filter((thing) => ['libro', 'letero'].includes(thing.eo));

export const ADJECTIVES = [
  { eo: 'granda', en: 'big' },
  { eo: 'malgranda', en: 'small' },
  { eo: 'bela', en: 'beautiful' },
  { eo: 'nova', en: 'new' },
  { eo: 'malnova', en: 'old' },
  { eo: 'bona', en: 'good' },
  { eo: 'ruĝa', en: 'red' },
  { eo: 'blua', en: 'blue' },
];

/** Transitive verbs with the kinds of object they take and their English forms. */
export const ACTIONS = [
  { eo: 'vidas', enSingular: 'sees', enPlural: 'see', objects: 'any' },
  { eo: 'amas', enSingular: 'loves', enPlural: 'love', objects: 'animate' },
  { eo: 'trovas', enSingular: 'finds', enPlural: 'find', objects: 'any' },
  { eo: 'havas', enSingular: 'has', enPlural: 'have', objects: 'any' },
  { eo: 'manĝas', enSingular: 'eats', enPlural: 'eat', objects: 'food' },
  { eo: 'legas', enSingular: 'reads', enPlural: 'read', objects: 'readable' },
  { eo: 'aĉetas', enSingular: 'buys', enPlural: 'buy', objects: 'thing' },
];

export const PLACES = [
  { eo: 'en la ĝardeno', en: 'in the garden' },
  { eo: 'en la domo', en: 'in the house' },
  { eo: 'sur la tablo', en: 'on the table' },
  { eo: 'en la ĉambro', en: 'in the room' },
];
