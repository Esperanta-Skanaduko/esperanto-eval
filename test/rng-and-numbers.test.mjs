import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRng } from '../src/createRng.mjs';
import { numberToWords } from '../src/tasks/numberToWords.mjs';

/**
 * An independent reader of Esperanto number words, written separately from
 * `numberToWords`, so that a round trip over 0-9999 can catch a shared mistake.
 */
const wordsToNumber = (text) => {
  const ones = { nul: 0, unu: 1, du: 2, tri: 3, kvar: 4, kvin: 5, ses: 6, sep: 7, ok: 8, naŭ: 9 };
  let total = 0;
  let pendingThousands = null;
  for (const word of text.split(' ')) {
    if (word in ones) pendingThousands = ones[word];
    else if (word === 'mil') {
      total += (pendingThousands ?? 1) * 1000;
      pendingThousands = null;
    } else {
      if (pendingThousands !== null) {
        total += pendingThousands;
        pendingThousands = null;
      }
      if (word === 'cent') total += 100;
      else if (word === 'dek') total += 10;
      else if (word.endsWith('cent')) total += ones[word.slice(0, -4)] * 100;
      else if (word.endsWith('dek')) total += ones[word.slice(0, -3)] * 10;
      else throw new Error(`unknown word ${word}`);
    }
  }
  return total + (pendingThousands ?? 0);
};

test('the same seed gives the same numbers, different seeds differ', () => {
  const first = createRng(1);
  const second = createRng(1);
  assert.deepEqual(Array.from({ length: 5 }, () => first.next()), Array.from({ length: 5 }, () => second.next()));
  assert.notEqual(createRng(1).next(), createRng(2).next());
});

test('shuffle returns a permutation and does not modify its input', () => {
  const input = [1, 2, 3, 4, 5, 6];
  const result = createRng(3).shuffle(input);
  assert.deepEqual([...result].sort(), input);
  assert.deepEqual(input, [1, 2, 3, 4, 5, 6]);
});

test('numberToWords gives the known spellings', () => {
  const known = {
    0: 'nul', 1: 'unu', 10: 'dek', 11: 'dek unu', 20: 'dudek', 21: 'dudek unu', 100: 'cent', 101: 'cent unu',
    300: 'tricent', 1000: 'mil', 1100: 'mil cent', 1987: 'mil naŭcent okdek sep', 2000: 'du mil', 2024: 'du mil dudek kvar', 9999: 'naŭ mil naŭcent naŭdek naŭ',
  };
  for (const [number, words] of Object.entries(known)) assert.equal(numberToWords(Number(number)), words);
});

test('every number from 0 to 9999 survives a round trip through an independent reader', () => {
  for (let number = 0; number <= 9999; number += 1) assert.equal(wordsToNumber(numberToWords(number)), number, `${number}`);
});

test('NEGATIVE CONTROL: the round trip catches a wrong spelling', () => {
  assert.notEqual(wordsToNumber('mil naŭcent okdek ses'), 1987);
});

test('numberToWords refuses numbers it does not support', () => {
  for (const bad of [-1, 10000, 1.5, NaN]) assert.throws(() => numberToWords(bad), RangeError);
});
