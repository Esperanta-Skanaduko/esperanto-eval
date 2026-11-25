/**
 * Formats a run summary as a table for the terminal or for pasting into a README.
 *
 * @param name - Name of the model or baseline.
 * @param summary - The value returned by `summarize`.
 * @returns Markdown text.
 */
export const renderReport = (name, summary) => {
  const percent = (value) => `${(value * 100).toFixed(1)}%`;
  const lines = [`**${name}**: overall ${percent(summary.overall)} (average of tasks, ${summary.items} items)`, '', '| Task | Correct | Accuracy | 95% interval |', '| --- | ---: | ---: | --- |'];
  for (const row of summary.tasks) lines.push(`| ${row.task} | ${row.correct}/${row.total} | ${percent(row.accuracy)} | ${percent(row.low)} to ${percent(row.high)} |`);
  return lines.join('\n');
};
