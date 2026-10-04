import { expect, test } from 'vitest';
import { ImageStore } from './image-store.js';

const createStore = (maxTotalBytes = 100): { store: ImageStore; timers: Map<number, () => void> } => {
  const timers = new Map<number, () => void>();
  let id = 0;
  let timer = 0;

  const store = new ImageStore({
    createId: () => `img${++id}`,
    schedule: (callback) => {
      const key = ++timer;

      timers.set(key, callback);

      return () => void timers.delete(key);
    },
    maxTotalBytes,
    unheldTtlMs: 1000,
  });

  return { store, timers };
};

const image = (size: number): { bytes: Uint8Array; contentType: string; width: number; height: number; sourceUrl: string } => ({
  bytes: new Uint8Array(size),
  contentType: 'image/png',
  width: 300,
  height: 200,
  sourceUrl: 'https://example.com/a.png',
});

const runTimers = (timers: Map<number, () => void>): void => {
  [...timers.values()].forEach((callback) => callback());
  timers.clear();
};

test('an image nobody uses is thrown away after a while', () => {
  const { store, timers } = createStore();
  const stored = store.put(image(10));

  expect(store.get(stored.id)?.width).toBe(300);
  runTimers(timers);
  expect(store.get(stored.id)).toBeUndefined();
  expect(store.totalBytes).toBe(0);
});

test('a held image stays until the last table lets go', () => {
  const { store, timers } = createStore();
  const stored = store.put(image(10));

  store.hold(stored.id);
  store.hold(stored.id);
  runTimers(timers);
  store.release(stored.id);
  runTimers(timers);

  expect(store.get(stored.id)).toBeDefined();

  store.release(stored.id);
  runTimers(timers);

  expect(store.get(stored.id)).toBeUndefined();
});

test('the store refuses new images once it is full', () => {
  const { store } = createStore(25);

  store.put(image(20));

  expect(() => store.put(image(10))).toThrow(expect.objectContaining({ code: 'SERVER_BUSY' }));
  expect(store.size).toBe(1);
});

test('dispose forgets everything and cancels the timers', () => {
  const { store, timers } = createStore();

  store.put(image(10));
  store.dispose();

  expect([store.size, store.totalBytes, timers.size]).toEqual([0, 0, 0]);
});
