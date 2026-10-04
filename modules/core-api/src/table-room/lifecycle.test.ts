import { expect, test } from 'vitest';
import { TableRoomError } from './error.js';
import { TableRoomLifecycle } from './lifecycle.js';

interface Harness {
  lifecycle: TableRoomLifecycle;
  pending: () => number;
  fire: () => void;
  closed: () => number;
}

// A hand-cranked clock: `fire` runs every scheduled callback that wasn't cancelled.
const createHarness = (): Harness => {
  const timers = new Set<() => void>();
  let closes = 0;

  const lifecycle = new TableRoomLifecycle({
    graceMs: 1000,
    close: () => closes++,
    schedule: (callback) => {
      timers.add(callback);

      return () => {
        timers.delete(callback);
      };
    },
  });

  return {
    lifecycle,
    pending: () => timers.size,
    fire: () => [...timers].forEach((callback) => callback()),
    closed: () => closes,
  };
};

test('a new table is empty and expires unless someone joins', () => {
  const { lifecycle, pending, fire, closed } = createHarness();

  lifecycle.open();
  expect(lifecycle.state).toBe('emptyGrace');
  expect(pending()).toBe(1);

  fire();
  expect(lifecycle.state).toBe('closed');
  expect(closed()).toBe(1);
});

test('joining cancels the expiry and leaving last starts it again', () => {
  const { lifecycle, pending } = createHarness();

  lifecycle.open();
  lifecycle.join();
  expect(lifecycle.state).toBe('active');
  expect(pending()).toBe(0);

  lifecycle.leave(1);
  expect(lifecycle.state).toBe('active');
  expect(pending()).toBe(0);

  lifecycle.leave(0);
  expect(lifecycle.state).toBe('emptyGrace');
  expect(pending()).toBe(1);
});

test('coming back within the grace period keeps the table', () => {
  const { lifecycle, pending, closed } = createHarness();

  lifecycle.open();
  lifecycle.join();
  lifecycle.leave(0);
  lifecycle.join();

  expect(lifecycle.state).toBe('active');
  expect(pending()).toBe(0);
  expect(closed()).toBe(0);
});

test('expire is ignored while people are at the table', () => {
  const { lifecycle, closed } = createHarness();

  lifecycle.open();
  lifecycle.join();
  lifecycle.expire();

  expect(lifecycle.state).toBe('active');
  expect(closed()).toBe(0);
});

test('a closed table refuses joins with ROOM_CLOSED', () => {
  const { lifecycle, fire } = createHarness();

  lifecycle.open();
  fire();

  expect(() => lifecycle.join()).toThrow(new TableRoomError('ROOM_CLOSED'));
});

test('dispose cancels the pending expiry', () => {
  const { lifecycle, pending } = createHarness();

  lifecycle.open();
  lifecycle.dispose();

  expect(pending()).toBe(0);
});
