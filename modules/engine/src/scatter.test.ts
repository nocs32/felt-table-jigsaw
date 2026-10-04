import { expect, test } from 'vitest';
import { pieceRect } from './bounds.js';
import { cutPuzzle } from './cut.js';
import { itemAt } from './list.js';
import { createRandom } from './random.js';
import { scatterGroups } from './scatter.js';
import type { Group, Point, PuzzleCut } from './types.js';

const cut = cutPuzzle({ aspect: 1.5, pieceCount: 60, shape: 'wild', seed: 8 });

/** World centre of each group's (single) piece bounds. */
const centres = (puzzle: PuzzleCut, groups: Group[]): Point[] =>
  groups.map((g) => {
    const rect = pieceRect(itemAt(puzzle.pieces, g.id), g);

    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  });

test('scatterGroups makes one single-piece group per piece', () => {
  const groups = scatterGroups(cut, createRandom(1));

  expect(groups).toHaveLength(cut.pieces.length);

  groups.forEach((group, index) => {
    expect(group.id).toBe(index);
    expect(group.pieces).toEqual([index]);
    expect(Number.isFinite(group.x) && Number.isFinite(group.y)).toBe(true);
  });
});

test('scatterGroups is repeatable with a seeded random', () => {
  expect(scatterGroups(cut, createRandom(1))).toEqual(scatterGroups(cut, createRandom(1)));
  expect(scatterGroups(cut, createRandom(1))).not.toEqual(scatterGroups(cut, createRandom(2)));
});

test('scattered pieces sit in separate slots around the picture centre', () => {
  const points = centres(cut, scatterGroups(cut, createRandom(3)));
  const slot = Math.max(cut.cellWidth, cut.cellHeight) * 1.42;
  let closest = Infinity;

  points.forEach((a, i) => {
    points.slice(i + 1).forEach((b) => {
      closest = Math.min(closest, Math.hypot(a.x - b.x, a.y - b.y));
    });
  });

  const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

  expect(closest).toBeGreaterThan(slot * 0.8);
  expect(Math.abs(meanX - cut.width / 2)).toBeLessThan(slot * 2);
  expect(Math.abs(meanY - cut.height / 2)).toBeLessThan(slot * 2);
});

test('areaAspect shapes the scatter and is clamped', () => {
  const spread = (aspect: number): number => {
    const xs = centres(cut, scatterGroups(cut, createRandom(4), aspect)).map((p) => p.x);

    return Math.max(...xs) - Math.min(...xs);
  };

  expect(spread(2)).toBeGreaterThan(spread(0.8));
  expect(spread(50)).toBe(spread(2.2));
  expect(spread(Number.NaN)).toBe(spread(1.6));
});
