// Public API of the puzzle engine: pure maths, no DOM, no Node.
export type {
  CutGeometry,
  CutOptions,
  CutPiece,
  DropInput,
  DropOutcome,
  Group,
  PieceShape,
  Point,
  PuzzleCut,
  Rect,
  SnapTolerance,
} from './types.js';
export { createRandom, shuffle } from './random.js';
export { gridFor, neighborIds } from './grid.js';
export { buildCut, cutGeometry, cutPuzzle } from './cut.js';
export { decodeGeometry, encodeGeometry } from './geometry.js';
export { scatterGroups } from './scatter.js';
export { resolveDrop, snapDistance } from './snap.js';
export { applyDrop, isSolved } from './groups.js';
export { contentBounds, groupBounds } from './bounds.js';
export { arrangeEdges } from './arrange.js';
