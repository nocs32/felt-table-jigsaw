import { expect, test } from 'vitest';
import { TableRoomRateLimits } from './rate-limits.js';

const createLimits = (): { limits: TableRoomRateLimits<'chat' | 'react'>; advance: (ms: number) => void } => {
  let now = 0;

  return {
    limits: new TableRoomRateLimits({ chat: { count: 2, windowMs: 1000 }, react: { count: 1, windowMs: 1000 } }, () => now),
    advance: (ms) => {
      now += ms;
    },
  };
};

test('allows up to the count, then refuses until the window slides', () => {
  const { limits, advance } = createLimits();

  expect(limits.allow('a', 'chat')).toBe(true);
  expect(limits.allow('a', 'chat')).toBe(true);
  expect(limits.allow('a', 'chat')).toBe(false);

  advance(999);
  expect(limits.allow('a', 'chat')).toBe(false);

  advance(1);
  expect(limits.allow('a', 'chat')).toBe(true);
});

test('each person and message type has its own budget', () => {
  const { limits } = createLimits();

  expect(limits.allow('a', 'react')).toBe(true);
  expect(limits.allow('a', 'react')).toBe(false);
  expect(limits.allow('b', 'react')).toBe(true);
  expect(limits.allow('a', 'chat')).toBe(true);
});

test('forget clears a person who left', () => {
  const { limits } = createLimits();

  limits.allow('a', 'react');
  limits.forget('a');

  expect(limits.allow('a', 'react')).toBe(true);
});
