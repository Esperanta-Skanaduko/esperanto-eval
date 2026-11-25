import { createRng } from '../createRng.mjs';

/**
 * Creates one of the reference "models" that need no network:
 * - `random`: picks a random option on multiple-choice items; cannot answer the rest (empty reply).
 * - `first-option`: always answers A on multiple-choice items; empty reply otherwise.
 * - `copy-input`: repeats the Esperanto sentence unchanged on accusative items (adds no -n); empty reply otherwise.
 * - `gold`: returns the gold answer. It checks the harness and the scorer, and proves the items can be answered; it says nothing about difficulty.
 *
 * @param name - The baseline name.
 * @param items - The benchmark items (the `gold` baseline looks answers up by prompt).
 * @returns An async function from prompt to reply text.
 * @throws When the name is not a baseline.
 */
export const createBaseline = (name, items) => {
  const rng = createRng(7);
  const byPrompt = new Map(items.map((item) => [item.prompt, item]));
  if (name === 'random') {
    return async (prompt) => {
      const letters = [...prompt.matchAll(/^([A-D])\) /gm)].map((match) => match[1]);
      return letters.length > 0 ? rng.pick(letters) : '';
    };
  }
  if (name === 'first-option') return async (prompt) => (/^A\) /m.test(prompt) ? 'A' : '');
  if (name === 'copy-input') {
    return async (prompt) => /^Esperanto: (.*)$/m.exec(prompt)?.[1] ?? '';
  }
  if (name === 'gold') return async (prompt) => byPrompt.get(prompt)?.answer ?? '';
  throw new Error(`Unknown baseline "${name}". Choose random, first-option, copy-input or gold.`);
};

/** The baseline names, in the order they are reported. */
export const BASELINES = ['random', 'first-option', 'copy-input', 'gold'];
