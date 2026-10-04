// Cuts a picture into jigsaw pieces: a jittered lattice of corners, one curve per lattice edge,
// and each piece's outline assembled from its four edges. The cut is made in two steps:
// `cutGeometry` picks the numbers (on the 1/16-unit grid, so they can be sent exactly) and
// `buildCut` turns them into pieces. The server does both; browsers rebuild from the server's numbers.
import { pointsBounds } from './bounds.js';
import { straightEdge, tabEdge } from './edges.js';
import { onGeometryGrid } from './geometry.js';
import { gridFor, pictureSize } from './grid.js';
import { itemAt } from './list.js';
import { createRandom, randomBetween } from './random.js';
import type { CutGeometry, CutOptions, CutPiece, Point, PuzzleCut } from './types.js';

interface Lattice {
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
}

const pointOnGrid = (p: Point): Point => ({ x: onGeometryGrid(p.x), y: onGeometryGrid(p.y) });

/** Lattice corners, row by row. Inner ones are nudged by up to `jitter` of a cell. */
const jitteredCorners = (lattice: Lattice, jitter: number, random: () => number): Point[] => {
  const { cols, rows, cellWidth, cellHeight } = lattice;
  const nudge = (inner: boolean, size: number): number => (inner ? randomBetween(random, -jitter, jitter) * size : 0);

  return Array.from({ length: (rows + 1) * (cols + 1) }, (_, k) => {
    const row = Math.floor(k / (cols + 1));
    const col = k % (cols + 1);
    const x = col * cellWidth + nudge(col > 0 && col < cols, cellWidth);
    const y = row * cellHeight + nudge(row > 0 && row < rows, cellHeight);

    return pointOnGrid({ x, y });
  });
};

const cornerAt = (corners: readonly Point[], cols: number, row: number, col: number): Point => itemAt(corners, row * (cols + 1) + col);

/** The tab of every inner edge (its 8 inner points). Border edges are straight, so they need none. */
const innerEdges = (corners: Point[], lattice: Lattice, random: () => number, wild: boolean): Pick<CutGeometry, 'across' | 'down'> => {
  const { cols, rows, cellWidth, cellHeight } = lattice;
  const corner = (row: number, col: number): Point => cornerAt(corners, cols, row, col);
  const tab = (from: Point, to: Point, depth: number): Point[] => tabEdge(from, to, depth, random, wild).slice(1, -1).map(pointOnGrid);

  const across = Array.from({ length: (rows - 1) * cols }, (_, k) => {
    const row = Math.floor(k / cols) + 1;

    return tab(corner(row, k % cols), corner(row, (k % cols) + 1), cellHeight);
  });

  const down = Array.from({ length: (cols - 1) * rows }, (_, k) => {
    const col = Math.floor(k / rows) + 1;

    return tab(corner(k % rows, col), corner((k % rows) + 1, col), cellWidth);
  });

  return { across, down };
};

/** The horizontal edge from corner (row, col) to (row, col + 1). */
const acrossEdge = (geometry: CutGeometry, row: number, col: number): Point[] => {
  const from = cornerAt(geometry.corners, geometry.cols, row, col);
  const to = cornerAt(geometry.corners, geometry.cols, row, col + 1);

  if (row === 0 || row === geometry.rows) return straightEdge(from, to);

  return [from, ...itemAt(geometry.across, (row - 1) * geometry.cols + col), to];
};

/** The vertical edge from corner (row, col) to (row + 1, col). */
const downEdge = (geometry: CutGeometry, col: number, row: number): Point[] => {
  const from = cornerAt(geometry.corners, geometry.cols, row, col);
  const to = cornerAt(geometry.corners, geometry.cols, row + 1, col);

  if (col === 0 || col === geometry.cols) return straightEdge(from, to);

  return [from, ...itemAt(geometry.down, (col - 1) * geometry.rows + row), to];
};

/** Builds a piece by walking its edges clockwise: top, right, bottom (reversed), left (reversed). */
const buildPiece = (geometry: CutGeometry, col: number, row: number): CutPiece => {
  const { cols, rows } = geometry;
  const top = acrossEdge(geometry, row, col);
  const right = downEdge(geometry, col + 1, row);
  const bottom = acrossEdge(geometry, row + 1, col).reverse();
  const left = downEdge(geometry, col, row).reverse();
  const home = { x: col * (geometry.width / cols), y: row * (geometry.height / rows) };
  const world = [...top, ...right.slice(1), ...bottom.slice(1), ...left.slice(1)];
  const outline = world.map((p) => ({ x: p.x - home.x, y: p.y - home.y }));

  return {
    id: row * cols + col,
    col,
    row,
    home,
    outline,
    bounds: pointsBounds(outline),
    isEdge: col === 0 || row === 0 || col === cols - 1 || row === rows - 1,
  };
};

const checkOptions = (options: CutOptions): void => {
  if (!(options.aspect > 0) || !Number.isFinite(options.aspect)) {
    throw new RangeError(`aspect must be a positive finite number, got ${options.aspect}.`);
  }

  if (!Number.isFinite(options.pieceCount)) {
    throw new RangeError(`pieceCount must be a finite number, got ${options.pieceCount}.`);
  }
};

/** Picks the numbers of a cut. The same options (seed included) always give the same geometry. */
export const cutGeometry = (options: CutOptions): CutGeometry => {
  checkOptions(options);

  const { aspect, pieceCount, shape, seed } = options;
  const size = pictureSize(aspect);
  const width = onGeometryGrid(size.width);
  const height = onGeometryGrid(size.height);
  const { cols, rows } = gridFor(pieceCount, aspect);
  const lattice = { cols, rows, cellWidth: width / cols, cellHeight: height / rows };
  const random = createRandom(seed);
  const wild = shape === 'wild';
  const corners = jitteredCorners(lattice, wild ? 0.12 : 0.03, random);

  return { width, height, cols, rows, shape, corners, ...innerEdges(corners, lattice, random, wild) };
};

/** Turns a cut's numbers into pieces. Pure: the same geometry always gives the same pieces. */
export const buildCut = (geometry: CutGeometry): PuzzleCut => {
  const { width, height, cols, rows, shape } = geometry;
  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const pieces = Array.from({ length: cols * rows }, (_, id) => buildPiece(geometry, id % cols, Math.floor(id / cols)));

  return { width, height, cols, rows, cellWidth, cellHeight, pieceSize: Math.min(cellWidth, cellHeight), shape, pieces };
};

/** Cuts a puzzle. The same options (seed included) always give the same cut. */
export const cutPuzzle = (options: CutOptions): PuzzleCut => buildCut(cutGeometry(options));
