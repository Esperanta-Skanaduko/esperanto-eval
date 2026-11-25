import assert from 'node:assert/strict';
import { test } from 'node:test';
import { extractAnswer } from '../src/extractAnswer.mjs';
import { normalizeAnswer } from '../src/normalizeAnswer.mjs';
import { runEvaluation } from '../src/runEvaluation.mjs';
import { scoreItem } from '../src/scoreItem.mjs';
import { summarize } from '../src/summarize.mjs';
import { toReviewCsv } from '../src/toReviewCsv.mjs';
import { wilsonInterval } from '../src/wilsonInterval.mjs';

test('normalizeAnswer ignores case, quotes, trailing punctuation, spacing and x-system spelling', () => {
  assert.equal(normalizeAnswer('  "Ĉu vi parolas?" '), 'ĉu vi parolas');
  assert.equal(normalizeAnswer('CXu   vi'), 'ĉu vi');
  assert.equal(normalizeAnswer('**aĉetonta**'), 'aĉetonta');
  assert.equal(normalizeAnswer('ĉu'), 'ĉu');
});

test('extractAnswer reads multiple-choice replies, strictly but fairly', () => {
  assert.equal(extractAnswer('B', 'choice'), 'B');
  assert.equal(extractAnswer('B) how', 'choice'), 'B');
  assert.equal(extractAnswer('(C)', 'choice'), 'C');
  assert.equal(extractAnswer('Answer: D', 'choice'), 'D');
  assert.equal(extractAnswer('The correct sentence is:\n\n**A) La bonaj floroj.**\n\nExplanation: ...', 'choice'), 'A');
  assert.equal(extractAnswer('I think option A) sounds right.', 'choice'), 'A');
});

test('NEGATIVE CONTROL: extractAnswer refuses a reply that names two options, or none', () => {
  assert.equal(extractAnswer('A) is wrong because ... B) is correct', 'choice'), null);
  assert.equal(extractAnswer('Both sentences are fine.', 'choice'), null);
  assert.equal(extractAnswer('Between A) and B) I cannot say.', 'choice'), null);
  assert.equal(extractAnswer('A good question', 'choice'), null);
  assert.equal(extractAnswer('A', 'choice'), 'A');
  assert.equal(extractAnswer('**B**', 'choice'), 'B');
  assert.equal(extractAnswer('', 'choice'), null);
});

test('extractAnswer reads numbers and text', () => {
  assert.equal(extractAnswer('1 987', 'number'), '1987');
  assert.equal(extractAnswer('Answer: 1,987.', 'number'), '1987');
  assert.equal(extractAnswer('The number is 42', 'number'), '42');
  assert.equal(extractAnswer('\n\nparolos\nbecause ...', 'text'), 'parolos');
  assert.equal(extractAnswer('Answer: parolos', 'text'), 'parolos');
  assert.equal(extractAnswer('', 'text'), null);
  assert.equal(extractAnswer(null, 'text'), null);
});

test('scoreItem compares by kind: words ignore spaces, text does not', () => {
  assert.equal(scoreItem({ kind: 'words', answer: 'du mil dudek' }, 'dumil dudek').correct, true);
  assert.equal(scoreItem({ kind: 'text', answer: 'ĉu vi' }, 'ĉuvi').correct, false);
  assert.equal(scoreItem({ kind: 'text', answer: 'ĉu vi' }, 'CXU vi.').correct, true);
  assert.equal(scoreItem({ kind: 'number', answer: '1987' }, '1.987').correct, true);
  assert.equal(scoreItem({ kind: 'choice', answer: 'B' }, 'A').correct, false);
  assert.equal(scoreItem({ kind: 'text', answer: 'x' }, '').correct, false);
});

test('wilsonInterval matches known values', () => {
  const half = wilsonInterval(5, 10);
  assert.ok(Math.abs(half.low - 0.2366) < 0.001 && Math.abs(half.high - 0.7634) < 0.001);
  const none = wilsonInterval(0, 2);
  assert.ok(none.low === 0 && Math.abs(none.high - 0.658) < 0.001);
  assert.deepEqual(wilsonInterval(0, 0), { low: 0, high: 0 });
});

test('summarize averages the task accuracies, so a big task does not drown a small one', () => {
  const results = [
    ...Array.from({ length: 8 }, () => ({ task: 'big', correct: true })),
    { task: 'small', correct: false },
  ];
  const summary = summarize(results);
  assert.equal(summary.overall, 0.5);
  assert.equal(summary.items, 9);
});

test('runEvaluation keeps item order under concurrency and records a failed call as wrong, not as a crash', async () => {
  const items = Array.from({ length: 6 }, (_, index) => ({ id: `i${index}`, task: 't', prompt: `p${index}`, answer: `a${index}`, kind: 'text' }));
  const ask = async (prompt) => {
    if (prompt === 'p3') throw new Error('boom');
    await new Promise((resolve) => setTimeout(resolve, prompt === 'p0' ? 20 : 1));
    return `a${prompt.slice(1)}`;
  };
  const results = await runEvaluation(items, ask, { concurrency: 3 });
  assert.deepEqual(results.map((result) => result.id), items.map((item) => item.id));
  assert.deepEqual(results.map((result) => result.correct), [true, true, true, false, true, true]);
  assert.equal(results[3].error, 'boom');
});

test('toReviewCsv quotes fields and neutralises cells that a spreadsheet would run as a formula', () => {
  const csv = toReviewCsv([
    { id: 'a/1', task: 't', prompt: 'say "hi", please', answer: '=1+1' },
    { id: 'a/2', task: 't', prompt: 'plain', answer: '@x' },
  ]);
  assert.ok(csv.includes('"say ""hi"", please"'));
  assert.ok(csv.includes("'=1+1"));
  assert.ok(csv.includes("'@x"));
  assert.ok(!/(^|,)[=+@]/m.test(csv.split('\n').slice(1).join('\n')));
});
