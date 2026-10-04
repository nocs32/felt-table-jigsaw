import { expect, test } from 'vitest';
import { contentBounds, groupBounds, originCentredAt, pieceRect, pointsBounds, unionRects } from './bounds.js';
import { cutPuzzle } from './cut.js';
import { itemAt } from './list.js';

const cut = cutPuzzle({ aspect: 4 / 3, pieceCount: 12, shape: 'wild', seed: 21 });

test('pointsBounds and unionRects', () => {
  expect(pointsBounds([])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  expect(pointsBounds([{ x: 1, y: 5 }, { x: -2, y: 3 }, { x: 4, y: 4 }])).toEqual({ x: -2, y: 3, width: 6, height: 2 });
  expect(unionRects([])).toBeUndefined();

  expect(unionRects([{ x: 0, y: 0, width: 2, height: 2 }, { x: 5, y: -1, width: 1, height: 1 }])).toEqual({
    x: 0,
    y: -1,
    width: 6,
    height: 3,
  });
});

test('groupBounds of a single piece is its bounds moved to the group origin', () => {
  const piece = itemAt(cut.pieces, 5);
  const box = groupBounds(cut, { id: 5, x: 100, y: -50, pieces: [5] });

  expect(box).toEqual({
    x: 100 + piece.home.x + piece.bounds.x,
    y: -50 + piece.home.y + piece.bounds.y,
    width: piece.bounds.width,
    height: piece.bounds.height,
  });

  expect(groupBounds(cut, { id: 9, x: 3, y: 4, pieces: [] })).toEqual({ x: 3, y: 4, width: 0, height: 0 });
});

test('a whole puzzle at origin (0, 0) fills exactly the picture', () => {
  const box = groupBounds(cut, { id: 0, x: 0, y: 0, pieces: cut.pieces.map((p) => p.id) });

  expect(box.x).toBeCloseTo(0, 9);
  expect(box.y).toBeCloseTo(0, 9);
  expect(box.width).toBeCloseTo(cut.width, 9);
  expect(box.height).toBeCloseTo(cut.height, 9);
});

test('contentBounds unions the groups and falls back to the picture', () => {
  const a = { id: 0, x: 0, y: 0, pieces: [0] };
  const b = { id: 11, x: 500, y: 400, pieces: [11] };
  const boxA = groupBounds(cut, a);
  const boxB = groupBounds(cut, b);
  const both = contentBounds(cut, [a, b]);

  expect(both.x).toBe(Math.min(boxA.x, boxB.x));
  expect(both.y).toBe(Math.min(boxA.y, boxB.y));
  expect(both.x + both.width).toBeCloseTo(Math.max(boxA.x + boxA.width, boxB.x + boxB.width), 9);
  expect(both.y + both.height).toBeCloseTo(Math.max(boxA.y + boxA.height, boxB.y + boxB.height), 9);
  expect(contentBounds(cut, [])).toEqual({ x: 0, y: 0, width: cut.width, height: cut.height });
});

test('originCentredAt centres the piece bounds on the point', () => {
  const piece = itemAt(cut.pieces, 6);
  const rect = pieceRect(piece, originCentredAt(piece, { x: 40, y: -30 }));

  expect(rect.x + rect.width / 2).toBeCloseTo(40, 9);
  expect(rect.y + rect.height / 2).toBeCloseTo(-30, 9);
});
