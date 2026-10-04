import { expect, test } from 'vitest';
import { createRandom, randomBetween, shuffle } from './random.js';

const take = (random: () => number, count: number): number[] => Array.from({ length: count }, () => random());

test('createRandom repeats the same sequence for the same seed', () => {
  expect(take(createRandom(42), 20)).toEqual(take(createRandom(42), 20));
  expect(take(createRandom(42), 20)).not.toEqual(take(createRandom(43), 20));
});

test('createRandom stays within [0, 1)', () => {
  const values = take(createRandom(7), 5000);

  expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
  expect(Math.min(...values)).toBeLessThan(0.01);
  expect(Math.max(...values)).toBeGreaterThan(0.99);
});

test('randomBetween maps into the range', () => {
  expect(randomBetween(() => 0, 2, 4)).toBe(2);
  expect(randomBetween(() => 0.5, 2, 4)).toBe(3);
});

test('shuffle returns a new permutation and leaves the input alone', () => {
  const items = Array.from({ length: 50 }, (_, k) => k);
  const before = [...items];
  const out = shuffle(items, createRandom(7));

  expect(items).toEqual(before);
  expect(out).not.toBe(items);
  expect(out).not.toEqual(items);
  expect([...out].sort((a, b) => a - b)).toEqual(items);
});

test('shuffle is repeatable with a seeded random', () => {
  const items = ['a', 'b', 'c', 'd', 'e', 'f'];

  expect(shuffle(items, createRandom(3))).toEqual(shuffle(items, createRandom(3)));
  expect(shuffle([], createRandom(3))).toEqual([]);
});
