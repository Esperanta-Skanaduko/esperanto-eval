/**
 * Pulls the answer out of a raw model response, using the rule for the item's kind.
 * It is deliberately strict, so every model is held to the same standard:
 * - `choice`: the response starts with a letter A to D; or says "Answer: X" or "the correct sentence is A)"; or
 *   mentions exactly one option marker such as "A)" (a reply that names two different options is not scored).
 * - `number`: the first run of digits (spaces, dots and commas inside are removed).
 * - `text` and `words`: the text after "Answer:" if present, otherwise the first non-empty line.
 *
 * @param response - The model's reply.
 * @param kind - `choice`, `number`, `text` or `words`.
 * @returns The extracted answer, or null when none can be found.
 */
export const extractAnswer = (response, kind) => {
  const text = String(response ?? '').trim();
  if (text === '') return null;
  if (kind === 'choice') {
    const markers = new Set([...text.matchAll(/(?:^|[\s*_(])([A-D])\)/g)].map((match) => match[1]));
    const leading = /^[\s*_([]*([A-D])(?:\s*[).:\]*_]|\s*$)/.exec(text);
    if (leading) return [...markers].some((letter) => letter !== leading[1]) ? null : leading[1];
    const labelled = /answer\s*(?:is)?\s*[:\-]?\s*[*_([]*([A-D])\b/i.exec(text);
    if (labelled) return labelled[1].toUpperCase();
    const cued = /(?:correct|right|answer|choice|option)[^.\n]{0,40}?[:\-]?\s*[*_(]*\b([A-D])\)/i.exec(text);
    if (cued) return cued[1].toUpperCase();
    return markers.size === 1 ? [...markers][0] : null;
  }
  if (kind === 'number') {
    const labelled = /answer\s*[:\-]\s*(.*)/i.exec(text);
    const match = /\d[\d\s.,]*/.exec(labelled ? labelled[1] : text);
    return match ? match[0].replace(/[\s.,]/g, '') : null;
  }
  const labelled = /answer\s*[:\-]\s*(.+)/i.exec(text);
  if (labelled) return labelled[1].split('\n')[0].trim();
  return text.split('\n').find((line) => line.trim() !== '')?.trim() ?? null;
};
