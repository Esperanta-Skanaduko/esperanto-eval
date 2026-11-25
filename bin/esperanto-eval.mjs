#!/usr/bin/env node
/**
 * esperanto-eval: a benchmark of Esperanto grammar and word-building for language models.
 *
 *   esperanto-eval run --provider openai --base-url http://localhost:11434/v1 --model llama3 --name llama3
 *   esperanto-eval run --provider command --cmd "claude -p" --name claude-cli --limit 5
 *   esperanto-eval baselines
 *   esperanto-eval generate --seed 42 --out my-items.jsonl     (fresh items, same rules)
 *   esperanto-eval verify                                        (re-derive the shipped items)
 *   esperanto-eval review-sheet --out review.csv                 (sheet for native-speaker review)
 *   esperanto-eval report results/llama3.json
 *   esperanto-eval rescore results/llama3.json                  (score the saved replies again with the current rules)
 *
 * Options for run: --items FILE (default: the shipped v0.1 set), --tasks a,b, --limit N per task,
 * --concurrency N, --api-key-env NAME (environment variable holding the API key), --max-tokens N.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateBenchmark } from '../src/generateBenchmark.mjs';
import { parseArguments } from '../src/parseArguments.mjs';
import { createBaseline, BASELINES } from '../src/providers/createBaseline.mjs';
import { createCommandProvider } from '../src/providers/createCommandProvider.mjs';
import { createOpenAiProvider } from '../src/providers/createOpenAiProvider.mjs';
import { readItems } from '../src/readItems.mjs';
import { renderReport } from '../src/renderReport.mjs';
import { runEvaluation } from '../src/runEvaluation.mjs';
import { scoreItem } from '../src/scoreItem.mjs';
import { summarize } from '../src/summarize.mjs';
import { toJsonLines } from '../src/toJsonLines.mjs';
import { toReviewCsv } from '../src/toReviewCsv.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const defaultItems = join(root, 'data', 'v0.1', 'items.jsonl');
const { command, positionals, options } = parseArguments(process.argv.slice(2), [
  'items', 'seed', 'version', 'out', 'provider', 'model', 'base-url', 'cmd', 'name', 'tasks', 'limit', 'concurrency', 'api-key-env', 'max-tokens',
]);

const selectItems = () => {
  let items = readItems(options.items ?? defaultItems);
  if (options.tasks) {
    const wanted = new Set(String(options.tasks).split(','));
    items = items.filter((item) => wanted.has(item.task));
  }
  if (options.limit) {
    const seen = new Map();
    items = items.filter((item) => {
      const count = (seen.get(item.task) ?? 0) + 1;
      seen.set(item.task, count);
      return count <= Number(options.limit);
    });
  }
  return items;
};

const save = (path, text) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text.endsWith('\n') ? text : `${text}\n`);
};

if (command === 'generate') {
  const seed = Number(options.seed ?? 20261125);
  const version = String(options.version ?? 'custom');
  const items = generateBenchmark(seed, version);
  const text = toJsonLines(items);
  save(String(options.out ?? 'items.jsonl'), text);
  console.log(`${items.length} items, seed ${seed}, sha256 ${createHash('sha256').update(text).digest('hex')}`);
} else if (command === 'verify') {
  const manifest = JSON.parse(readFileSync(join(root, 'data', 'v0.1', 'manifest.json'), 'utf-8'));
  const regenerated = toJsonLines(generateBenchmark(manifest.seed, manifest.version));
  const shipped = readFileSync(defaultItems, 'utf-8');
  const hash = createHash('sha256').update(shipped).digest('hex');
  const same = regenerated === shipped && hash === manifest.sha256;
  console.log(same ? `OK: ${manifest.count} items re-derived from seed ${manifest.seed}, sha256 ${hash}` : 'MISMATCH: the shipped items are not what the generator produces');
  process.exit(same ? 0 : 1);
} else if (command === 'review-sheet') {
  save(String(options.out ?? 'review.csv'), toReviewCsv(selectItems()));
  console.log(`review sheet written to ${options.out ?? 'review.csv'}`);
} else if (command === 'baselines') {
  const items = selectItems();
  const report = {};
  for (const name of BASELINES) {
    const summary = summarize(await runEvaluation(items, createBaseline(name, items)));
    report[name] = summary;
    console.log(renderReport(name, summary), '\n');
  }
  if (options.out) save(String(options.out), JSON.stringify(report, null, 2));
} else if (command === 'run') {
  const items = selectItems();
  const name = String(options.name ?? options.model ?? 'model');
  let ask;
  if (options.provider === 'openai') {
    if (!options['base-url'] || !options.model) throw new Error('--provider openai needs --base-url and --model');
    const keyName = options['api-key-env'];
    ask = createOpenAiProvider({
      baseUrl: String(options['base-url']),
      model: String(options.model),
      apiKey: keyName ? process.env[String(keyName)] : undefined,
      maxTokens: options['max-tokens'] ? Number(options['max-tokens']) : undefined,
    });
  } else if (options.provider === 'command') {
    if (!options.cmd) throw new Error('--provider command needs --cmd');
    ask = createCommandProvider(String(options.cmd));
  } else {
    throw new Error('--provider must be openai or command (use the baselines command for the built-in references)');
  }
  const results = await runEvaluation(items, ask, {
    concurrency: Number(options.concurrency ?? 1),
    onResult: (_result, done) => done % 25 === 0 && console.error(`${done}/${items.length}`),
  });
  const summary = summarize(results);
  const out = String(options.out ?? join(root, 'results', `${name}.json`));
  save(out, JSON.stringify({ name, date: new Date().toISOString().slice(0, 10), benchmark: 'v0.1', summary, results }, null, 2));
  console.log(renderReport(name, summary));
  const errors = results.filter((result) => result.error).length;
  if (errors > 0) console.log(`\n${errors} request(s) failed and count as wrong; see "error" in ${out}`);
} else if (command === 'rescore') {
  const file = positionals[0];
  if (!file) throw new Error('give the results file: esperanto-eval report FILE');
  const saved = JSON.parse(readFileSync(file, 'utf-8'));
  const byId = new Map(readItems(options.items ?? defaultItems).map((item) => [item.id, item]));
  const results = saved.results.map((result) => {
    const rescored = result.error ? { correct: false, extracted: null } : scoreItem(byId.get(result.id), result.response);
    return { ...result, ...rescored };
  });
  const summary = summarize(results);
  save(file, JSON.stringify({ ...saved, summary, results }, null, 2));
  console.log(renderReport(saved.name, summary));
} else if (command === 'report') {
  const file = positionals[0];
  if (!file) throw new Error('give the results file: esperanto-eval report FILE');
  const saved = JSON.parse(readFileSync(file, 'utf-8'));
  console.log(renderReport(saved.name, saved.summary));
} else {
  console.error('Usage: esperanto-eval <run|baselines|generate|verify|review-sheet|report> [options]. See the header of bin/esperanto-eval.mjs.');
  process.exit(command ? 1 : 0);
}
