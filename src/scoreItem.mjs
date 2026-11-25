import { extractAnswer } from './extractAnswer.mjs';
import { normalizeAnswer } from './normalizeAnswer.mjs';

/**
 * Scores one model response against an item's gold answer.
 *
 * @param item - A benchmark item.
 * @param response - The raw model response.
 * @returns Whether it was correct, and the answer that was extracted.
 */
export const scoreItem = (item, response) => {
  const extracted = extractAnswer(response, item.kind);
  if (extracted === null) return { correct: false, extracted: null };
  if (item.kind === 'choice') return { correct: extracted === item.answer, extracted };
  if (item.kind === 'number') return { correct: extracted === item.answer, extracted };
  const strip = item.kind === 'words' ? (value) => normalizeAnswer(value).replace(/[\s-]/g, '') : normalizeAnswer;
  return { correct: strip(extracted) === strip(item.answer), extracted };
};
