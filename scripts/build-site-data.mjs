#!/usr/bin/env node
/**
 * Writes site/data.json for the results page: every item (so visitors can try
 * them) and the summary of each saved run and baseline. Run after adding results.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TASKS } from '../src/tasks/index.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const items = readFileSync(join(root, 'data', 'v0.1', 'items.jsonl'), 'utf-8')
  .split('\n').filter(Boolean).map((line) => JSON.parse(line))
  .map(({ id, task, prompt, answer, kind }) => ({ id, task, prompt, answer, kind }));

const baselines = JSON.parse(readFileSync(join(root, 'results', 'baselines.json'), 'utf-8'));
const runs = [
  ...Object.entries(baselines).map(([name, summary]) => ({ name, type: 'baseline', date: null, summary })),
  ...readdirSync(join(root, 'results'))
    .filter((file) => file.endsWith('.json') && file !== 'baselines.json')
    .map((file) => JSON.parse(readFileSync(join(root, 'results', file), 'utf-8')))
    .map(({ name, date, summary }) => ({ name, type: 'model', date, summary })),
];
const tasks = TASKS.map(({ id, title, tests }) => ({ id, title, tests }));
writeFileSync(join(root, 'site', 'data.json'), JSON.stringify({ tasks, runs, items }));
console.log(`site/data.json written (${items.length} items, ${runs.length} runs)`);
