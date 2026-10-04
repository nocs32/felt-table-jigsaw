import { expect, test } from 'vitest';
import { buildCut, cutGeometry, cutPuzzle } from './cut.js';
import { decodeGeometry, encodeGeometry } from './geometry.js';

const options = { aspect: 1.5, pieceCount: 500, shape: 'wild', seed: 42 } as const;
const geometry = cutGeometry(options);

test('every point of a cut sits on the 1/16-unit grid', () => {
  const points = [...geometry.corners, ...geometry.across.flat(), ...geometry.down.flat()];

  expect(points.every((p) => Number.isInteger(p.x * 16) && Number.isInteger(p.y * 16))).toBe(true);
  expect(Number.isInteger(geometry.width * 16) && Number.isInteger(geometry.height * 16)).toBe(true);
});

test('the bytes round-trip exactly, so browsers rebuild the server’s pieces', () => {
  const decoded = decodeGeometry(encodeGeometry(geometry));

  expect(decoded).toEqual(geometry);
  expect(buildCut(decoded)).toEqual(cutPuzzle(options));
});

test('500 pieces fit in about 34 KB', () => {
  const bytes = encodeGeometry(geometry);

  expect(geometry.cols * geometry.rows).toBeGreaterThanOrEqual(480);
  expect(bytes.byteLength).toBeLessThan(40_000);
});

test('classic cuts and tall pictures round-trip too', () => {
  const tall = cutGeometry({ aspect: 0.6, pieceCount: 12, shape: 'classic', seed: 7 });

  expect(decodeGeometry(encodeGeometry(tall))).toEqual(tall);
});

test('bytes inside a bigger buffer decode from their own offset', () => {
  const bytes = encodeGeometry(geometry);
  const padded = new Uint8Array(bytes.byteLength + 8);

  padded.set(bytes, 8);

  expect(decodeGeometry(padded.subarray(8))).toEqual(geometry);
});

test('malformed bytes are refused', () => {
  const bytes = encodeGeometry(geometry);
  const wrongFormat = bytes.slice();
  const wrongShape = bytes.slice();

  wrongFormat[0] = 9;
  wrongShape[1] = 5;

  expect(() => decodeGeometry(new Uint8Array(4))).toThrow(RangeError);
  expect(() => decodeGeometry(bytes.subarray(0, bytes.byteLength - 1))).toThrow(RangeError);
  expect(() => decodeGeometry(wrongFormat)).toThrow(RangeError);
  expect(() => decodeGeometry(wrongShape)).toThrow(RangeError);
});
