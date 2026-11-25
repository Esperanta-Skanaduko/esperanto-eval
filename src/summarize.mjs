import { wilsonInterval } from './wilsonInterval.mjs';

/**
 * Turns per-item results into per-task accuracy with 95% intervals, and an overall
 * score that is the average of the task accuracies (so a big task does not drown
 * a small one).
 *
 * @param results - Records `{ task, correct }`.
 * @returns Per-task rows and the macro-average.
 */
export const summarize = (results) => {
  const byTask = new Map();
  for (const result of results) {
    const row = byTask.get(result.task) ?? { task: result.task, correct: 0, total: 0 };
    row.total += 1;
    if (result.correct) row.correct += 1;
    byTask.set(result.task, row);
  }
  const tasks = [...byTask.values()].map((row) => ({ ...row, accuracy: row.correct / row.total, ...wilsonInterval(row.correct, row.total) }));
  const overall = tasks.length === 0 ? 0 : tasks.reduce((total, row) => total + row.accuracy, 0) / tasks.length;
  return { tasks, overall, items: results.length };
};
