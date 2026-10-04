import { expect, test } from 'vitest';
import { cutPuzzle } from './cut.js';
import type { CutPiece, Point, PuzzleCut } from './types.js';

const wild = cutPuzzle({ aspect: 1.5, pieceCount: 60, shape: 'wild', seed: 1234 });
const classic = cutPuzzle({ aspect: 0.75, pieceCount: 48, shape: 'classic', seed: 99 });

/** The piece's four edges (top, right, bottom, left) in world space, in outline order. */
const edgesOf = (cut: PuzzleCut, piece: CutPiece): Point[][] => {
  const borders = [piece.row === 0, piece.col === cut.cols - 1, piece.row === cut.rows - 1, piece.col === 0];
  const world = piece.outline.map((p) => ({ x: p.x + piece.home.x, y: p.y + piece.home.y }));
  let start = 0;

  return borders.map((border) => {
    const end = start + (border ? 3 : 9);
    const edge = world.slice(start, end + 1);

    start = end;

    return edge;
  });
};

const expectSamePoints = (actual: Point[], expected: Point[]): void => {
  expect(actual.length).toBe(expected.length);

  actual.forEach((p, k) => {
    expect(p.x).toBeCloseTo(expected[k]?.x ?? NaN, 9);
    expect(p.y).toBeCloseTo(expected[k]?.y ?? NaN, 9);
  });
};

test('the same seed gives an identical cut', () => {
  expect(cutPuzzle({ aspect: 1.5, pieceCount: 60, shape: 'wild', seed: 1234 })).toEqual(wild);
  expect(cutPuzzle({ aspect: 0.75, pieceCount: 48, shape: 'classic', seed: 99 })).toEqual(classic);
});

test('a different seed gives different outlines', () => {
  const other = cutPuzzle({ aspect: 1.5, pieceCount: 60, shape: 'wild', seed: 1235 });

  expect(other.cols).toBe(wild.cols);
  expect(other.pieces.map((p) => p.outline)).not.toEqual(wild.pieces.map((p) => p.outline));
});

test('wild and classic shapes differ for the same seed', () => {
  const asClassic = cutPuzzle({ aspect: 1.5, pieceCount: 60, shape: 'classic', seed: 1234 });

  expect(asClassic.shape).toBe('classic');
  expect(asClassic.pieces.map((p) => p.outline)).not.toEqual(wild.pieces.map((p) => p.outline));
});

test('picture and cell sizes follow the aspect (long edge 1000)', () => {
  expect([wild.width, wild.height, wild.cols, wild.rows]).toEqual([1000, 1000 / 1.5, 9, 7]);
  expect(wild.cellWidth).toBeCloseTo(1000 / 9);
  expect(wild.cellHeight).toBeCloseTo(1000 / 1.5 / 7);
  expect(wild.pieceSize).toBe(Math.min(wild.cellWidth, wild.cellHeight));
  expect([classic.width, classic.height, classic.cols, classic.rows]).toEqual([750, 1000, 6, 8]);
  expect(classic.pieceSize).toBe(125);
});

test('there is one piece per cell, indexed by id', () => {
  for (const cut of [wild, classic]) {
    expect(cut.pieces).toHaveLength(cut.cols * cut.rows);

    cut.pieces.forEach((piece, index) => {
      expect(piece.id).toBe(index);
      expect(piece.id).toBe(piece.row * cut.cols + piece.col);
      expect(piece.home).toEqual({ x: piece.col * cut.cellWidth, y: piece.row * cut.cellHeight });
    });
  }
});

test('every outline is closed and made of whole cubic segments', () => {
  for (const cut of [wild, classic]) {
    for (const piece of cut.pieces) {
      const flags = [piece.row === 0, piece.col === cut.cols - 1, piece.row === cut.rows - 1, piece.col === 0];
      const borders = flags.filter(Boolean).length;

      expect((piece.outline.length - 1) % 3).toBe(0);
      expect(piece.outline.length).toBe(1 + 3 * (borders + 3 * (4 - borders)));
      expect(piece.outline.at(-1)).toEqual(piece.outline[0]);
    }
  }
});

test('bounds hold every outline point and touch the extremes', () => {
  for (const piece of [...wild.pieces, ...classic.pieces]) {
    const { x, y, width, height } = piece.bounds;
    const xs = piece.outline.map((p) => p.x);
    const ys = piece.outline.map((p) => p.y);

    const inside = (p: Point): boolean => p.x >= x && p.x <= x + width + 1e-9 && p.y >= y && p.y <= y + height + 1e-9;

    expect(piece.outline.every(inside)).toBe(true);
    expect([Math.min(...xs), Math.min(...ys)]).toEqual([x, y]);
    expect(Math.max(...xs)).toBeCloseTo(x + width, 9);
    expect(Math.max(...ys)).toBeCloseTo(y + height, 9);
  }
});

test('edge flags mark exactly the border pieces', () => {
  const edgeIds = classic.pieces.filter((p) => p.isEdge).map((p) => p.id);

  expect(edgeIds).toHaveLength(2 * classic.cols + 2 * classic.rows - 4);
  expect(classic.pieces[0]?.isEdge).toBe(true);
  expect(classic.pieces[classic.cols + 1]?.isEdge).toBe(false);
  expect(classic.pieces.at(-1)?.isEdge).toBe(true);

  for (const p of classic.pieces) {
    expect(p.isEdge).toBe(p.col === 0 || p.row === 0 || p.col === classic.cols - 1 || p.row === classic.rows - 1);
  }
});

test('border edges lie on the picture frame', () => {
  for (const piece of wild.pieces) {
    const [top, right, bottom, left] = edgesOf(wild, piece);

    if (piece.row === 0) expect(top?.every((p) => p.y === 0)).toBe(true);

    if (piece.col === 0) expect(left?.every((p) => p.x === 0)).toBe(true);

    if (piece.col === wild.cols - 1) expect(right?.every((p) => Math.abs(p.x - wild.width) < 1e-9)).toBe(true);

    if (piece.row === wild.rows - 1) expect(bottom?.every((p) => Math.abs(p.y - wild.height) < 1e-9)).toBe(true);
  }
});

test('neighbouring pieces share the same edge curve (they interlock)', () => {
  for (const cut of [wild, classic]) {
    for (const piece of cut.pieces) {
      const [, right, bottom] = edgesOf(cut, piece);
      const rightPiece = piece.col < cut.cols - 1 ? cut.pieces[piece.id + 1] : undefined;
      const belowPiece = piece.row < cut.rows - 1 ? cut.pieces[piece.id + cut.cols] : undefined;

      if (rightPiece) expectSamePoints(right ?? [], [...(edgesOf(cut, rightPiece)[3] ?? [])].reverse());

      if (belowPiece) expectSamePoints(bottom ?? [], [...(edgesOf(cut, belowPiece)[0] ?? [])].reverse());
    }
  }
});

test('cutPuzzle rejects a bad aspect', () => {
  expect(() => cutPuzzle({ aspect: 0, pieceCount: 10, shape: 'wild', seed: 1 })).toThrow(RangeError);
  expect(() => cutPuzzle({ aspect: Number.NaN, pieceCount: 10, shape: 'wild', seed: 1 })).toThrow(RangeError);
});
