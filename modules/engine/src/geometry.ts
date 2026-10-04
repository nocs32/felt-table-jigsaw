// The cut's numbers as bytes, so the server can send them once and every browser rebuilds exactly
// the same pieces. Points are whole sixteenths of a world unit, stored as int16 (little-endian):
//
//   u8 format · u8 shape · u16 cols · u16 rows · u16 width · u16 height   (sizes in sixteenths)
//   corners: (rows + 1) * (cols + 1) points · across: (rows - 1) * cols * 8 · down: (cols - 1) * rows * 8
//
// About 34 KB for 500 pieces. Each shared edge is sent once; border edges are straight, so they
// travel as their two corners.
import type { CutGeometry, PieceShape, Point } from './types.js';

const scale = 16;
const format = 1;
const headerBytes = 10;
const pointBytes = 4;
const tabPoints = 8;
const shapes: readonly PieceShape[] = ['wild', 'classic'];
// The longest side a grid can have: room for panoramas at the 500-piece cap, small enough to refuse junk.
const maxSide = 1000;

/** Rounds a world coordinate to the geometry's 1/16-unit grid. */
export const onGeometryGrid = (value: number): number => Math.round(value * scale) / scale;

const byteLength = (cols: number, rows: number): number => {
  const points = (rows + 1) * (cols + 1) + ((rows - 1) * cols + (cols - 1) * rows) * tabPoints;

  return headerBytes + points * pointBytes;
};

const toFixed = (value: number): number => {
  const fixed = Math.round(value * scale);

  if (fixed < -32768 || fixed > 32767) {
    throw new RangeError(`${value} is outside the geometry's range.`);
  }

  return fixed;
};

/** Packs a cut's geometry into bytes. Throws if a point is off the grid's range. */
export const encodeGeometry = (geometry: CutGeometry): Uint8Array => {
  const { cols, rows, corners, across, down } = geometry;
  const bytes = new Uint8Array(byteLength(cols, rows));
  const view = new DataView(bytes.buffer);
  let offset = headerBytes;

  view.setUint8(0, format);
  view.setUint8(1, shapes.indexOf(geometry.shape));
  view.setUint16(2, cols, true);
  view.setUint16(4, rows, true);
  view.setUint16(6, toFixed(geometry.width), true);
  view.setUint16(8, toFixed(geometry.height), true);

  for (const point of [...corners, ...across.flat(), ...down.flat()]) {
    view.setInt16(offset, toFixed(point.x), true);
    view.setInt16(offset + 2, toFixed(point.y), true);
    offset += pointBytes;
  }

  return bytes;
};

const readHeader = (view: DataView): Omit<CutGeometry, 'corners' | 'across' | 'down'> => {
  const shape = shapes[view.getUint8(1)];
  const cols = view.getUint16(2, true);
  const rows = view.getUint16(4, true);

  if (view.getUint8(0) !== format || shape === undefined) throw new RangeError('Unknown geometry format.');

  if (cols < 2 || rows < 2 || cols > maxSide || rows > maxSide) throw new RangeError(`Bad grid ${cols} x ${rows}.`);

  if (view.byteLength !== byteLength(cols, rows)) throw new RangeError('Geometry has the wrong length.');

  return { shape, cols, rows, width: view.getUint16(6, true) / scale, height: view.getUint16(8, true) / scale };
};

/** Unpacks bytes made by `encodeGeometry`. Throws a RangeError on anything malformed. */
export const decodeGeometry = (bytes: Uint8Array): CutGeometry => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (view.byteLength < headerBytes) throw new RangeError('Geometry is too short.');

  const header = readHeader(view);
  const { cols, rows } = header;
  let offset = headerBytes;

  const readPoint = (): Point => {
    const point = { x: view.getInt16(offset, true) / scale, y: view.getInt16(offset + 2, true) / scale };

    offset += pointBytes;

    return point;
  };

  const readTabs = (count: number): Point[][] => Array.from({ length: count }, () => Array.from({ length: tabPoints }, readPoint));
  const corners = Array.from({ length: (rows + 1) * (cols + 1) }, readPoint);
  const across = readTabs((rows - 1) * cols);
  const down = readTabs((cols - 1) * rows);

  return { ...header, corners, across, down };
};
