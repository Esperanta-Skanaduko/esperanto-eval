/**
 * Builds the sheet a native speaker uses to review the answer keys: one row per
 * item with its task, prompt, gold answer and empty review columns. Cells that
 * start with `=`, `+`, `-`, `@`, a tab or CR get a leading apostrophe so a
 * spreadsheet cannot run them as a formula.
 *
 * @param items - The benchmark items.
 * @returns CSV text with a header row.
 */
export const toReviewCsv = (items) => {
  const cell = (value) => {
    const raw = String(value ?? '');
    const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const header = ['id', 'task', 'prompt', 'gold_answer', 'reviewer', 'verdict (ok / wrong / ambiguous)', 'comment'];
  const rows = items.map((item) => [item.id, item.task, item.prompt, item.answer, '', '', ''].map(cell).join(','));
  return `${[header.join(','), ...rows].join('\n')}\n`;
};
