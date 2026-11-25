import { createRng } from './createRng.mjs';
import { NUMBER_COUNT, TASKS, generateNumbers } from './tasks/index.mjs';

/**
 * Generates the full benchmark from a seed. The same seed always gives the same
 * items in the same order, so a published benchmark can be re-derived and
 * checked. Each task gets its own generator stream, so changing one task's size
 * does not reshuffle the others.
 *
 * @param seed - Integer seed.
 * @param version - Label stored in each item id, for example `v0.1`.
 * @returns A list of items `{ id, task, prompt, answer, kind, meta }`.
 */
export const generateBenchmark = (seed, version) => {
  const items = [];
  let stream = 0;
  for (const task of TASKS) {
    if (task.generate === null) continue;
    stream += 1;
    const rng = createRng(seed * 1000 + stream);
    for (const item of task.generate(rng, task.count)) items.push(item);
  }
  const numbers = generateNumbers(createRng(seed * 1000 + 99), NUMBER_COUNT);
  for (const item of numbers) items.push(item);

  const counters = new Map();
  return items.map((item) => {
    const index = (counters.get(item.task) ?? 0) + 1;
    counters.set(item.task, index);
    return { id: `${version}/${item.task}/${String(index).padStart(3, '0')}`, ...item };
  });
};
