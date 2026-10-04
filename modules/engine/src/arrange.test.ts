import { expect, test } from 'vitest';
import { arrangeEdges } from './arrange.js';
import { contentBounds, groupBounds } from './bounds.js';
import { cutPuzzle } from './cut.js';
import { createRandom } from './random.js';
import { scatterGroups } from './scatter.js';
import type { Group } from './types.js';

// 4 x 3 grid: inner pieces are 5 and 6, all others are edge pieces.
const cut = cutPuzzle({ aspect: 4 / 3, pieceCount: 12, shape: 'wild', seed: 3 });

/** Scattered table where pieces 0 and 1 are already joined (group 0). */
const table = (): Map<number, Group> => {
  const groups = new Map(scatterGroups(cut, createRandom(9)).map((g) => [g.id, g]));
  const first = groups.get(0);

  groups.set(0, { id: 0, x: first?.x ?? 0, y: first?.y ?? 0, pieces: [0, 1] });
  groups.delete(1);

  return groups;
};

test('arrangeEdges only moves loose, unheld edge pieces', () => {
  const groups = table();
  const placed = arrangeEdges(cut, groups, createRandom(1), (id) => id === 2);

  expect([...placed.keys()].sort((a, b) => a - b)).toEqual([3, 4, 7, 8, 9, 10, 11]);
});

test('arranged edge pieces sit above everything else, without overlapping slots', () => {
  const groups = table();
  const placed = arrangeEdges(cut, groups, createRandom(1));
  const rest = [...groups.values()].filter((g) => !placed.has(g.id));
  const restTop = contentBounds(cut, rest).y;
  const centres = new Set<string>();

  expect([...placed.keys()].sort((a, b) => a - b)).toEqual([2, 3, 4, 7, 8, 9, 10, 11]);

  for (const [id, origin] of placed) {
    const group = groups.get(id);
    const box = groupBounds(cut, { id, x: origin.x, y: origin.y, pieces: group?.pieces ?? [] });

    expect(box.y + box.height).toBeLessThan(restTop);

    centres.add(`${Math.round(box.x + box.width / 2)},${Math.round(box.y + box.height / 2)}`);
  }

  expect(centres.size).toBe(placed.size);
});

test('arrangeEdges is repeatable and leaves the groups alone', () => {
  const groups = table();
  const before = JSON.stringify([...groups.entries()]);

  expect(arrangeEdges(cut, groups, createRandom(5))).toEqual(arrangeEdges(cut, groups, createRandom(5)));
  expect(JSON.stringify([...groups.entries()])).toBe(before);
});

test('arrangeEdges returns nothing when no edge piece is loose', () => {
  const all: Group = { id: 0, x: 0, y: 0, pieces: cut.pieces.map((p) => p.id) };
  const innerOnly = new Map<number, Group>([[5, { id: 5, x: 0, y: 0, pieces: [5] }]]);

  expect(arrangeEdges(cut, new Map([[0, all]]), createRandom(1)).size).toBe(0);
  expect(arrangeEdges(cut, innerOnly, createRandom(1)).size).toBe(0);
  expect(arrangeEdges(cut, table(), createRandom(1), () => true).size).toBe(0);
});
