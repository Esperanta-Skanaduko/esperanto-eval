import { scoreItem } from './scoreItem.mjs';

/**
 * Runs every item through a model caller and scores the replies. A failed call
 * (network error, timeout) counts as wrong and is recorded with its error, so one
 * bad request never stops a long run.
 *
 * @param items - Benchmark items to ask.
 * @param ask - Async function from prompt to reply text.
 * @param options - `concurrency` (default 1), `onResult(result, doneCount)` called after each item.
 * @returns One result per item, in item order: `{ id, task, correct, extracted, response, error }`.
 */
export const runEvaluation = async (items, ask, { concurrency = 1, onResult } = {}) => {
  const results = new Array(items.length);
  let next = 0;
  let done = 0;
  const worker = async () => {
    for (;;) {
      const index = next;
      next += 1;
      if (index >= items.length) return;
      const item = items[index];
      let response = '';
      let error = null;
      try {
        response = await ask(item.prompt);
      } catch (caught) {
        error = String(caught?.message ?? caught);
      }
      const { correct, extracted } = error ? { correct: false, extracted: null } : scoreItem(item, response);
      results[index] = { id: item.id, task: item.task, correct, extracted, response, error };
      done += 1;
      onResult?.(results[index], done);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  return results;
};
