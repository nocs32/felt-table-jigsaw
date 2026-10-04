import { expect, test } from 'vitest';
import { cutPuzzle } from './cut.js';
import { resolveDrop, snapDistance } from './snap.js';
import type { DropInput, Group } from './types.js';

// 3 x 3 grid, pieceSize 1000 / 3:
//  0 1 2
//  3 4 5
//  6 7 8
const cut = cutPuzzle({ aspect: 1, pieceCount: 9, shape: 'classic', seed: 1 });
const relaxed = snapDistance(cut, 'relaxed');

const single = (id: number, x: number, y: number): Group => ({ id, x, y, pieces: [id] });

const groupsOf = (...groups: Group[]): Map<number, Group> => new Map(groups.map((g) => [g.id, g]));

const drop = (groups: Map<number, Group>, groupId: number, x: number, y: number, extra?: Partial<DropInput>): DropInput => ({
  cut,
  groups,
  groupId,
  x,
  y,
  tolerance: 'relaxed',
  ...extra,
});

test('snapDistance scales the piece size by the tolerance', () => {
  expect([cut.cols, cut.rows]).toEqual([3, 3]);
  expect(relaxed).toBeCloseTo((1000 / 3) * 0.16);
  expect(snapDistance(cut, 'tight')).toBeCloseTo((1000 / 3) * 0.075);
  expect(snapDistance(cut, 'exact')).toBeCloseTo((1000 / 3) * 0.035);
});

test('a neighbour within tolerance snaps and takes over its origin', () => {
  const groups = groupsOf(single(0, 500, 500), single(1, 100, 100));
  const outcome = resolveDrop(drop(groups, 0, 120, 90));

  expect(outcome).toEqual({ groupId: 0, x: 100, y: 100, mergedIds: [1], joinedPieces: [0, 1] });
});

test('snapping is inclusive at the tolerance and stops just beyond it', () => {
  const groups = groupsOf(single(0, 500, 500), single(1, 0, 0));

  expect(resolveDrop(drop(groups, 0, relaxed, 0)).mergedIds).toEqual([1]);

  expect(resolveDrop(drop(groups, 0, relaxed + 0.01, 0))).toEqual({
    groupId: 0,
    x: relaxed + 0.01,
    y: 0,
    mergedIds: [],
    joinedPieces: [],
  });
});

test('tighter tolerances need a closer drop', () => {
  const groups = groupsOf(single(0, 500, 500), single(1, 0, 0));

  expect(resolveDrop(drop(groups, 0, 30, 0)).mergedIds).toEqual([1]);
  expect(resolveDrop(drop(groups, 0, 30, 0, { tolerance: 'tight' })).mergedIds).toEqual([]);
  expect(resolveDrop(drop(groups, 0, 10, 0, { tolerance: 'exact' })).mergedIds).toEqual([1]);
  expect(resolveDrop(drop(groups, 0, 12, 0, { tolerance: 'exact' })).mergedIds).toEqual([]);
});

test('a held group is never snapped to', () => {
  const groups = groupsOf(single(0, 500, 500), single(1, 0, 0));
  const outcome = resolveDrop(drop(groups, 0, 5, 5, { isHeld: (id) => id === 1 }));

  expect(outcome).toEqual({ groupId: 0, x: 5, y: 5, mergedIds: [], joinedPieces: [] });
});

test('pieces that are not grid neighbours do not snap', () => {
  // 0 and 2 share a row but are not adjacent; 0 and 4 are diagonal.
  const groups = groupsOf(single(0, 500, 500), single(2, 0, 0), single(4, 0, 0));

  expect(resolveDrop(drop(groups, 0, 0, 0)).mergedIds).toEqual([]);
});

test('snaps chain: after joining B, a C next to B within tolerance joins too', () => {
  const groups = groupsOf(single(0, 500, 500), single(1, 100, 100), single(2, 140, 100));
  const outcome = resolveDrop(drop(groups, 0, 70, 100));

  expect(outcome).toEqual({ groupId: 0, x: 140, y: 100, mergedIds: [1, 2], joinedPieces: [0, 1, 2] });
});

test('a chain stops when the next group is out of tolerance', () => {
  const groups = groupsOf(single(0, 500, 500), single(1, 100, 100), single(2, 100 + relaxed + 1, 100));
  const outcome = resolveDrop(drop(groups, 0, 70, 100));

  expect(outcome).toMatchObject({ x: 100, y: 100, mergedIds: [1] });
});

test('the nearest candidate snaps first', () => {
  const groups = groupsOf(single(4, 500, 500), single(1, 20, 0), single(3, 0, 10), single(5, 300, 300));
  const outcome = resolveDrop(drop(groups, 4, 0, 0));

  // 3 is nearer (10) than 1 (20); from 3's origin, 1 is still within reach (about 22).
  expect(outcome).toEqual({ groupId: 4, x: 20, y: 0, mergedIds: [3, 1], joinedPieces: [4, 3, 1] });
});

test('joinedPieces lists both sides of every new connection', () => {
  const top: Group = { id: 0, x: 0, y: 0, pieces: [0, 1] };
  const middle: Group = { id: 3, x: 10, y: 10, pieces: [3, 4] };
  const outcome = resolveDrop(drop(groupsOf(top, middle), 0, 0, 0));

  expect(outcome).toEqual({ groupId: 0, x: 10, y: 10, mergedIds: [3], joinedPieces: [0, 3, 1, 4] });
});

test('resolveDrop does not change the groups', () => {
  const groups = groupsOf(single(0, 500, 500), single(1, 100, 100));
  const before = JSON.stringify([...groups.entries()]);

  resolveDrop(drop(groups, 0, 100, 100));

  expect(JSON.stringify([...groups.entries()])).toBe(before);
});

test('an unknown group id gives an outcome with no merges', () => {
  const groups = groupsOf(single(1, 0, 0));

  expect(resolveDrop(drop(groups, 0, 0, 0))).toEqual({ groupId: 0, x: 0, y: 0, mergedIds: [], joinedPieces: [] });
});
