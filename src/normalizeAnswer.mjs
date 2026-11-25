const X_SYSTEM = [['cx', 'ĉ'], ['gx', 'ĝ'], ['hx', 'ĥ'], ['jx', 'ĵ'], ['sx', 'ŝ'], ['ux', 'ŭ']];

/**
 * Normalises an answer for comparison: Unicode NFC, lower case, x-system
 * spellings turned into real letters (so `cxu` equals `ĉu`), surrounding quotes,
 * backticks and asterisks removed, trailing sentence punctuation removed, and
 * spaces collapsed.
 *
 * @param text - A model answer or a gold answer.
 * @returns The normalised text.
 */
export const normalizeAnswer = (text) => {
  let result = String(text).normalize('NFC').toLowerCase().trim();
  for (const [from, to] of X_SYSTEM) result = result.replaceAll(from, to);
  result = result.replace(/^[\s"'`*_«»“”‘’]+|[\s"'`*_«»“”‘’]+$/g, '');
  result = result.replace(/[.!?]+$/g, '').trim();
  return result.replace(/\s+/g, ' ');
};
