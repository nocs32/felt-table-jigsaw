// Cuts a picture into jigsaw pieces: a jittered vertex lattice, one curve per lattice edge,
// and each piece's outline assembled from its four edges.
import { pointsBounds } from './bounds.js';
import { straightEdge, tabEdge } from './edges.js';
import { gridFor, pictureSize } from './grid.js';
import { itemAt } from './list.js';
import { createRandom, randomBetween } from './random.js';
import type { CutOptions, CutPiece, Point, PuzzleCut } from './types.js';

interface Lattice {
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
}

interface EdgeGrids {
  /** across[row][col]: the horizontal edge from vertex (row, col) to (row, col + 1). */
  across: Point[][][];
  /** down[col][row]: the vertical edge from vertex (row, col) to (row + 1, col). */
  down: Point[][][];
}

/** Lattice vertices vertices[row][col]; inner ones are nudged by up to `jitter` of a cell. */
const jitteredVertices = (lattice: Lattice, jitter: number, random: () => number): Point[][] => {
  const { cols, rows, cellWidth, cellHeight } = lattice;
  const nudge = (inner: boolean, size: number): number => (inner ? randomBetween(random, -jitter, jitter) * size : 0);

  return Array.from({ length: rows + 1 }, (_, row) =>
    Array.from({ length: cols + 1 }, (_, col) => {
      const x = col * cellWidth + nudge(col > 0 && col < cols, cellWidth);
      const y = row * cellHeight + nudge(row > 0 && row < rows, cellHeight);

      return { x, y };
    }),
  );
};

/** One curve per lattice edge. Border edges are straight; inner edges get a tab. */
const cutEdges = (vertices: Point[][], lattice: Lattice, random: () => number, wild: boolean): EdgeGrids => {
  const { cols, rows, cellWidth, cellHeight } = lattice;
  const vertex = (row: number, col: number): Point => itemAt(itemAt(vertices, row), col);

  const across = Array.from({ length: rows + 1 }, (_, row) =>
    Array.from({ length: cols }, (_, col) => {
      const from = vertex(row, col);
      const to = vertex(row, col + 1);

      return row === 0 || row === rows ? straightEdge(from, to) : tabEdge(from, to, cellHeight, random, wild);
    }),
  );

  const down = Array.from({ length: cols + 1 }, (_, col) =>
    Array.from({ length: rows }, (_, row) => {
      const from = vertex(row, col);
      const to = vertex(row + 1, col);

      return col === 0 || col === cols ? straightEdge(from, to) : tabEdge(from, to, cellWidth, random, wild);
    }),
  );

  return { across, down };
};

/** Builds a piece by walking its edges clockwise: top, right, bottom (reversed), left (reversed). */
const buildPiece = (edges: EdgeGrids, lattice: Lattice, col: number, row: number): CutPiece => {
  const { cols, rows, cellWidth, cellHeight } = lattice;
  const edge = (grid: Point[][][], line: number, index: number): Point[] => itemAt(itemAt(grid, line), index);
  const top = edge(edges.across, row, col);
  const right = edge(edges.down, col + 1, row);
  const bottom = [...edge(edges.across, row + 1, col)].reverse();
  const left = [...edge(edges.down, col, row)].reverse();
  const home = { x: col * cellWidth, y: row * cellHeight };
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

/** Cuts a puzzle. The same options (seed included) always give the same cut. */
export const cutPuzzle = (options: CutOptions): PuzzleCut => {
  checkOptions(options);

  const { aspect, pieceCount, shape, seed } = options;
  const { width, height } = pictureSize(aspect);
  const { cols, rows } = gridFor(pieceCount, aspect);
  const lattice = { cols, rows, cellWidth: width / cols, cellHeight: height / rows };
  const random = createRandom(seed);
  const wild = shape === 'wild';
  const vertices = jitteredVertices(lattice, wild ? 0.12 : 0.03, random);
  const edges = cutEdges(vertices, lattice, random, wild);

  const pieces = Array.from({ length: cols * rows }, (_, id) =>
    buildPiece(edges, lattice, id % cols, Math.floor(id / cols)),
  );

  return {
    width,
    height,
    cols,
    rows,
    cellWidth: lattice.cellWidth,
    cellHeight: lattice.cellHeight,
    pieceSize: Math.min(lattice.cellWidth, lattice.cellHeight),
    shape,
    pieces,
  };
};
