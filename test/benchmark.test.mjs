import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { generateBenchmark } from '../src/generateBenchmark.mjs';
import { readItems } from '../src/readItems.mjs';
import { toJsonLines } from '../src/toJsonLines.mjs';
import { CORRELATIVES } from '../src/tasks/correlativeTable.mjs';

const path = (name) => fileURLToPath(new URL(`../data/v0.1/${name}`, import.meta.url));
const items = readItems(path('items.jsonl'));
const manifest = JSON.parse(readFileSync(path('manifest.json'), 'utf-8'));
const ofTask = (task) => items.filter((item) => item.task === task);

test('the shipped items are exactly what the generator makes from the manifest seed', () => {
  const regenerated = toJsonLines(generateBenchmark(manifest.seed, manifest.version));
  assert.equal(regenerated, readFileSync(path('items.jsonl'), 'utf-8'));
  assert.equal(createHash('sha256').update(regenerated).digest('hex'), manifest.sha256);
  assert.equal(items.length, manifest.count);
});

test('a different seed gives different items', () => {
  assert.notEqual(toJsonLines(generateBenchmark(1, 'x')), toJsonLines(generateBenchmark(2, 'x')));
});

test('ids and prompts are unique, and every item is complete', () => {
  assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  assert.equal(new Set(items.map((item) => item.prompt)).size, items.length);
  for (const item of items) {
    for (const field of ['id', 'task', 'prompt', 'answer', 'kind']) assert.ok(item[field], `${item.id} lacks ${field}`);
    assert.ok(['choice', 'number', 'text', 'words'].includes(item.kind), item.id);
  }
});

test('the correlative table has 45 distinct words, each one prefix plus one suffix', () => {
  assert.equal(CORRELATIVES.length, 45);
  assert.equal(new Set(CORRELATIVES.map((entry) => entry.word)).size, 45);
  for (const entry of CORRELATIVES) assert.equal(entry.word, entry.prefix + entry.suffix);
});

test('correlative-write uses each of the 45 words once', () => {
  assert.deepEqual(ofTask('correlative-write').map((item) => item.answer).sort(), CORRELATIVES.map((entry) => entry.word).sort());
});

test('correlative-meaning: the keyed option is the table meaning, and all four options are distinct', () => {
  for (const item of ofTask('correlative-meaning')) {
    const word = item.meta.word;
    const options = Object.fromEntries([...item.prompt.matchAll(/^([A-D])\) (.*)$/gm)].map((match) => [match[1], match[2]]));
    assert.equal(Object.keys(options).length, 4, item.id);
    assert.equal(new Set(Object.values(options)).size, 4, item.id);
    assert.equal(options[item.answer], CORRELATIVES.find((entry) => entry.word === word).english, item.id);
  }
});

test('accusative: the key differs from the given sentence only by -n on the object noun phrase', () => {
  for (const item of ofTask('accusative')) {
    const given = /^Esperanto: (.*)\.$/m.exec(item.prompt)[1].split(' ');
    const gold = item.answer.replace(/\.$/, '').split(' ');
    assert.equal(given.length, gold.length, item.id);
    const changed = gold.map((word, index) => [word, given[index].toLowerCase(), index]).filter(([word, original]) => word.toLowerCase() !== original);
    assert.ok(changed.length >= 1 && changed.length <= 2, `${item.id}: ${changed.length} words changed`);
    for (const [word, original] of changed) assert.equal(word.toLowerCase(), `${original}n`, item.id);
    const verbIndex = gold.findIndex((word) => word.endsWith('as'));
    const objectBeforeVerb = item.meta.reversedOrder;
    for (const [, , index] of changed) assert.ok(objectBeforeVerb ? index < verbIndex : index > verbIndex, `${item.id}: -n on the subject side`);
    if (item.meta.withPlace) assert.ok(!/(en|sur) la \S+n$/.test(item.answer.replace(/\.$/, '')), `${item.id}: -n after a preposition`);
  }
});

test('grammaticality: balanced answers, equal error kinds, and the pair differs by one error only', () => {
  const pairs = ofTask('grammaticality');
  assert.equal(pairs.filter((item) => item.answer === 'A').length, pairs.length / 2);
  const kinds = new Map();
  for (const item of pairs) kinds.set(item.meta.error, (kinds.get(item.meta.error) ?? 0) + 1);
  assert.equal(kinds.size, 5);
  assert.ok([...kinds.values()].every((count) => count === pairs.length / 5));
  for (const item of pairs) {
    const [a, b] = ['A', 'B'].map((letter) => new RegExp(`^${letter}\\) (.*)$`, 'm').exec(item.prompt)[1]);
    assert.notEqual(a, b);
    const left = a.replace(/[.]$/, '').split(' ');
    const right = b.replace(/[.]$/, '').split(' ');
    assert.equal(left.length, right.length, item.id);
    const different = left.filter((word, index) => word !== right[index]);
    assert.ok(different.length >= 1 && different.length <= 2, `${item.id}: ${different.length} words differ`);
  }
});

test('word-building and conjugation answers are unique per prompt and single words', () => {
  assert.equal(ofTask('word-building').length, 72);
  for (const item of [...ofTask('word-building'), ...ofTask('conjugation')]) assert.ok(!/\s/.test(item.answer), item.id);
  assert.equal(new Set(ofTask('word-building').map((item) => item.answer)).size, 72);
});

test('numbers are split evenly between writing and reading', () => {
  assert.equal(ofTask('number-write').length, 50);
  assert.equal(ofTask('number-read').length, 50);
});
