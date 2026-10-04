import type { PuzzleCut } from './types.js';

const longEdge = 1000;

/** Columns and rows for roughly `pieceCount` cells of about square shape (at least 2 x 2). */
export const gridFor = (pieceCount: number, aspect: number): { cols: number; rows: number } => {
  const cols = Math.max(2, Math.round(Math.sqrt(pieceCount * aspect)));
  const rows = Math.max(2, Math.round(pieceCount / cols));

  return { cols, rows };
};

/** The picture size in world units: the long edge is 1000. */
export const pictureSize = (aspect: number): { width: number; height: number } =>
  aspect >= 1 ? { width: longEdge, height: longEdge / aspect } : { width: longEdge * aspect, height: longEdge };

/** Grid neighbours of a piece: left, right, above, below (those that exist). */
export const neighborIds = (cut: PuzzleCut, pieceId: number): number[] => {
  const { cols, rows } = cut;

  if (!Number.isInteger(pieceId) || pieceId < 0 || pieceId >= cols * rows) return [];

  const col = pieceId % cols;
  const row = Math.floor(pieceId / cols);

  return [
    col > 0 ? pieceId - 1 : -1,
    col < cols - 1 ? pieceId + 1 : -1,
    row > 0 ? pieceId - cols : -1,
    row < rows - 1 ? pieceId + cols : -1,
  ].filter((id) => id >= 0);
};
