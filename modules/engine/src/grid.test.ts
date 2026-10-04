import { expect, test } from 'vitest';
import { cutPuzzle } from './cut.js';
import { gridFor, neighborIds, pictureSize } from './grid.js';

test('gridFor picks roughly square cells', () => {
  expect(gridFor(60, 1.5)).toEqual({ cols: 9, rows: 7 });
  expect(gridFor(100, 1)).toEqual({ cols: 10, rows: 10 });
  expect(gridFor(48, 0.75)).toEqual({ cols: 6, rows: 8 });
  expect(gridFor(500, 1.5)).toEqual({ cols: 27, rows: 19 });
});

test('gridFor never goes below 2 x 2', () => {
  expect(gridFor(1, 1)).toEqual({ cols: 2, rows: 2 });
  expect(gridFor(4, 10)).toEqual({ cols: 6, rows: 2 });
});

test('pictureSize puts 1000 on the long edge', () => {
  expect(pictureSize(1.5)).toEqual({ width: 1000, height: 1000 / 1.5 });
  expect(pictureSize(0.5)).toEqual({ width: 500, height: 1000 });
  expect(pictureSize(1)).toEqual({ width: 1000, height: 1000 });
});

test('neighborIds lists left, right, above, below', () => {
  // 4 columns x 3 rows:
  //  0  1  2  3
  //  4  5  6  7
  //  8  9 10 11
  const cut = cutPuzzle({ aspect: 4 / 3, pieceCount: 12, shape: 'classic', seed: 1 });

  expect([cut.cols, cut.rows]).toEqual([4, 3]);
  expect(neighborIds(cut, 0)).toEqual([1, 4]);
  expect(neighborIds(cut, 3)).toEqual([2, 7]);
  expect(neighborIds(cut, 11)).toEqual([10, 7]);
  expect(neighborIds(cut, 1)).toEqual([0, 2, 5]);
  expect(neighborIds(cut, 4)).toEqual([5, 0, 8]);
  expect(neighborIds(cut, 5)).toEqual([4, 6, 1, 9]);
  expect(neighborIds(cut, 12)).toEqual([]);
  expect(neighborIds(cut, -1)).toEqual([]);
});
