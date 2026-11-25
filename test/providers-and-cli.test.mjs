import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { parseArguments } from '../src/parseArguments.mjs';
import { createBaseline } from '../src/providers/createBaseline.mjs';
import { createCommandProvider } from '../src/providers/createCommandProvider.mjs';
import { createOpenAiProvider } from '../src/providers/createOpenAiProvider.mjs';
import { readItems } from '../src/readItems.mjs';
import { runEvaluation } from '../src/runEvaluation.mjs';
import { summarize } from '../src/summarize.mjs';

const bin = fileURLToPath(new URL('../bin/esperanto-eval.mjs', import.meta.url));
const items = readItems(fileURLToPath(new URL('../data/v0.1/items.jsonl', import.meta.url)));

const withServer = async (handler, run) => {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}/v1`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

test('the OpenAI-compatible provider sends the prompt at temperature 0 and returns the reply', async () => {
  let seen;
  await withServer(
    (request, response) => {
      let body = '';
      request.on('data', (chunk) => (body += chunk));
      request.on('end', () => {
        seen = { url: request.url, auth: request.headers.authorization, body: JSON.parse(body) };
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify({ choices: [{ message: { content: 'ĉu' } }] }));
      });
    },
    async (baseUrl) => {
      const ask = createOpenAiProvider({ baseUrl, model: 'm', apiKey: 'secret', maxTokens: 9 });
      assert.equal(await ask('Hello'), 'ĉu');
    },
  );
  assert.equal(seen.url, '/v1/chat/completions');
  assert.equal(seen.auth, 'Bearer secret');
  assert.deepEqual([seen.body.model, seen.body.temperature, seen.body.max_tokens, seen.body.messages], ['m', 0, 9, [{ role: 'user', content: 'Hello' }]]);
});

test('NEGATIVE CONTROL: an HTTP error becomes a thrown error, and a null content becomes an empty reply', async () => {
  await withServer((_request, response) => { response.statusCode = 500; response.end('nope'); }, async (baseUrl) => {
    await assert.rejects(createOpenAiProvider({ baseUrl, model: 'm' })('x'), /HTTP 500/);
  });
  await withServer((_request, response) => { response.end(JSON.stringify({ choices: [{ message: { content: null } }] })); }, async (baseUrl) => {
    assert.equal(await createOpenAiProvider({ baseUrl, model: 'm' })('x'), '');
  });
});

test('the command provider pipes the prompt to stdin and reads stdout; a failing command is an error', async () => {
  assert.equal((await createCommandProvider('cat')('hello ĉu')).trim(), 'hello ĉu');
  await assert.rejects(createCommandProvider('exit 3')('x'), /exited with 3/);
  await assert.rejects(createCommandProvider('sleep 5', 200)('x'), /timed out/);
});

test('the baselines score as designed over the whole benchmark', async () => {
  const score = async (name) => summarize(await runEvaluation(items, createBaseline(name, items)));
  assert.equal((await score('gold')).overall, 1);
  assert.equal((await score('copy-input')).overall, 0);
  const random = await score('random');
  const grammaticality = random.tasks.find((row) => row.task === 'grammaticality');
  assert.ok(grammaticality.accuracy > 0.3 && grammaticality.accuracy < 0.7);
  assert.equal(random.tasks.find((row) => row.task === 'conjugation').accuracy, 0);
  assert.throws(() => createBaseline('nope', items), /Unknown baseline/);
});

test('parseArguments reads a command, a bare file argument, --a=b and --a b', () => {
  assert.deepEqual(parseArguments(['run', '--model', 'm', '--limit=3', '--verbose'], ['model', 'limit']), { command: 'run', positionals: [], options: { model: 'm', limit: '3', verbose: true } });
  assert.deepEqual(parseArguments(['report', 'file.json'], []).positionals, ['file.json']);
  assert.throws(() => parseArguments(['run', '--model'], ['model']), /needs a value/);
});

test('the CLI: verify passes, baselines runs, and a missing provider is refused', () => {
  const run = (...args) => spawnSync(process.execPath, [bin, ...args], { encoding: 'utf-8' });
  const verify = run('verify');
  assert.equal(verify.status, 0, verify.stdout + verify.stderr);
  assert.match(run('baselines', '--limit', '3').stdout, /\*\*gold\*\*: overall 100\.0%/);
  assert.notEqual(run('run', '--limit', '1').status, 0);
  assert.notEqual(run('rubbish').status, 0);
});
