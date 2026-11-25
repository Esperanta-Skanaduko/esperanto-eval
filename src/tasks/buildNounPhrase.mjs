/**
 * Builds a noun phrase in Esperanto and in English from a noun, an optional
 * adjective and a number.
 *
 * @param noun - A vocabulary noun.
 * @param adjective - A vocabulary adjective, or null.
 * @param plural - Whether the phrase is plural.
 * @param accusative - Whether to add the accusative -n.
 * @returns The Esperanto words and the English phrase.
 */
export const buildNounPhrase = (noun, adjective, plural, accusative) => {
  const ending = `${plural ? 'j' : ''}${accusative ? 'n' : ''}`;
  const words = ['la'];
  if (adjective) words.push(`${adjective.eo}${ending}`);
  words.push(`${noun.eo}${ending}`);
  const english = `the ${adjective ? `${adjective.en} ` : ''}${plural ? noun.enPlural : noun.en}`;
  return { words, english };
};
