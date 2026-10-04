// Shared shapes of the puzzle engine. World units: the picture's long edge is 1000.

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PieceShape = 'wild' | 'classic';

export type SnapTolerance = 'relaxed' | 'tight' | 'exact';

export interface CutPiece {
  /** row * cols + col */
  id: number;
  col: number;
  row: number;
  /** Top-left of the piece's grid cell in the finished picture: (col * cellWidth, row * cellHeight). */
  home: Point;
  /**
   * Closed outline relative to `home`: outline[0] is the start point, then groups of three points
   * (cp1, cp2, end) form cubic béziers. The last end point equals the start point.
   */
  outline: Point[];
  /** Bounding box of the outline points (control points included), relative to `home`. */
  bounds: Rect;
  isEdge: boolean;
}

export interface PuzzleCut {
  /** World units (long edge 1000). */
  width: number;
  height: number;
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  /** min(cellWidth, cellHeight) */
  pieceSize: number;
  shape: PieceShape;
  /** pieces[id].id === id */
  pieces: CutPiece[];
}

/**
 * The cut as exact numbers: every point sits on a 1/16-unit grid. The server sends this (encoded by
 * `encodeGeometry`) and every browser rebuilds the same pieces from it with `buildCut`.
 */
export interface CutGeometry {
  width: number;
  height: number;
  cols: number;
  rows: number;
  shape: PieceShape;
  /** Lattice corners, row by row: (rows + 1) * (cols + 1) points. The inner ones are jittered. */
  corners: Point[];
  /** The 8 inner points of each inner horizontal edge: rows - 1 lines of `cols` edges, top line first. */
  across: Point[][];
  /** The 8 inner points of each inner vertical edge: cols - 1 lines of `rows` edges, left line first. */
  down: Point[][];
}

export interface CutOptions {
  aspect: number;
  pieceCount: number;
  shape: PieceShape;
  seed: number;
}

/**
 * A set of joined pieces. `x, y` is where the puzzle's top-left corner would be for this group:
 * a piece's world top-left is (group.x + piece.home.x, group.y + piece.home.y).
 */
export interface Group {
  id: number;
  x: number;
  y: number;
  pieces: number[];
}

export interface DropInput {
  cut: PuzzleCut;
  groups: ReadonlyMap<number, Group>;
  groupId: number;
  /** Proposed origin of the dropped group. */
  x: number;
  y: number;
  tolerance: SnapTolerance;
  /** Groups being held by someone (true) are never snapped to. */
  isHeld?: (groupId: number) => boolean;
}

export interface DropOutcome {
  /** The surviving group: always the dropped group's id. */
  groupId: number;
  /** Final origin of the surviving group. */
  x: number;
  y: number;
  /** Ids of the groups absorbed into the surviving group, in merge order. */
  mergedIds: number[];
  /** Ids of the pieces on both sides of every new connection (for a glow effect). */
  joinedPieces: number[];
}
