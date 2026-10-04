import { expect, test } from 'vitest';
import { groupBounds } from './bounds.js';
import { cutPuzzle } from './cut.js';
import { applyDrop, isSolved } from './groups.js';
import { createRandom } from './random.js';
import { scatterGroups } from './scatter.js';
import { resolveDrop } from './snap.js';
import type { Group } from './types.js';

const cut = cutPuzzle({ aspect: 1, pieceCount: 9, shape: 'wild', seed: 5 });

const groupsOf = (...groups: Group[]): Map<number, Group> => new Map(groups.map((g) => [g.id, g]));

test('applyDrop moves the survivor, absorbs merged pieces and removes merged groups', () => {
  const groups = groupsOf(
    { id: 0, x: 1, y: 2, pieces: [0] },
    { id: 1, x: 10, y: 20, pieces: [1, 2] },
    { id: 4, x: 7, y: 7, pieces: [4] },
    { id: 8, x: 3, y: 3, pieces: [8] },
  );

  const before = JSON.stringify([...groups.entries()]);
  const next = applyDrop(groups, { groupId: 0, x: 10, y: 20, mergedIds: [1, 4], joinedPieces: [0, 1, 1, 4] });

  expect(next).not.toBe(groups);
  expect(JSON.stringify([...groups.entries()])).toBe(before);
  expect([...next.keys()]).toEqual([0, 8]);
  expect(next.get(0)).toEqual({ id: 0, x: 10, y: 20, pieces: [0, 1, 2, 4] });
  expect(next.get(8)).toBe(groups.get(8));
});

test('applyDrop without merges just moves the group', () => {
  const groups = groupsOf({ id: 0, x: 1, y: 2, pieces: [0] }, { id: 1, x: 5, y: 5, pieces: [1] });
  const next = applyDrop(groups, { groupId: 0, x: 50, y: 60, mergedIds: [], joinedPieces: [] });

  expect(next.get(0)).toEqual({ id: 0, x: 50, y: 60, pieces: [0] });
  expect(next.size).toBe(2);
});

test('isSolved is true for exactly one group', () => {
  expect(isSolved(new Map())).toBe(false);
  expect(isSolved(groupsOf({ id: 0, x: 0, y: 0, pieces: [0, 1] }, { id: 2, x: 0, y: 0, pieces: [2] }))).toBe(false);
  expect(isSolved(groupsOf({ id: 0, x: 0, y: 0, pieces: [0, 1, 2] }))).toBe(true);
});

test('dropping every piece onto the growing group solves the puzzle', () => {
  let groups = new Map(scatterGroups(cut, createRandom(5)).map((g) => [g.id, g]));
  let mainId = 0;

  for (let pieceId = 1; pieceId < cut.pieces.length; pieceId++) {
    const main = groups.get(mainId);

    expect(isSolved(groups)).toBe(false);

    // Drop the loose piece slightly off the main group's origin.
    const outcome = resolveDrop({ cut, groups, groupId: pieceId, x: (main?.x ?? 0) + 3, y: (main?.y ?? 0) - 2, tolerance: 'tight' });

    expect(outcome.mergedIds).toEqual([mainId]);

    groups = applyDrop(groups, outcome);
    mainId = outcome.groupId;
  }

  const solved = groups.get(mainId);

  expect(isSolved(groups)).toBe(true);
  expect(solved?.pieces.toSorted((a, b) => a - b)).toEqual(cut.pieces.map((p) => p.id));

  const box = groupBounds(cut, solved ?? { id: 0, x: 0, y: 0, pieces: [] });

  expect(box.x - (solved?.x ?? 0)).toBeCloseTo(0, 9);
  expect(box.y - (solved?.y ?? 0)).toBeCloseTo(0, 9);
  expect(box.width).toBeCloseTo(cut.width, 9);
  expect(box.height).toBeCloseTo(cut.height, 9);
});
