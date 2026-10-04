import { itemAt } from './list.js';
import type { CutPiece, Group, Point, PuzzleCut, Rect } from './types.js';

/** Bounding box of a list of points. An empty list gives a zero rect at the origin. */
export const pointsBounds = (points: readonly Point[]): Rect => {
  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);

  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
};

/** The smallest rect holding all the given rects, or undefined when there are none. */
export const unionRects = (rects: Iterable<Rect>): Rect | undefined => {
  let box: { x0: number; y0: number; x1: number; y1: number } | undefined;

  for (const r of rects) {
    box = {
      x0: Math.min(box?.x0 ?? r.x, r.x),
      y0: Math.min(box?.y0 ?? r.y, r.y),
      x1: Math.max(box?.x1 ?? r.x + r.width, r.x + r.width),
      y1: Math.max(box?.y1 ?? r.y + r.height, r.y + r.height),
    };
  }

  return box && { x: box.x0, y: box.y0, width: box.x1 - box.x0, height: box.y1 - box.y0 };
};

/** World-space bounds of one piece in a group whose origin is `origin`. */
export const pieceRect = (piece: CutPiece, origin: Point): Rect => ({
  x: origin.x + piece.home.x + piece.bounds.x,
  y: origin.y + piece.home.y + piece.bounds.y,
  width: piece.bounds.width,
  height: piece.bounds.height,
});

/** The group origin that puts the centre of the piece's bounds at `centre`. */
export const originCentredAt = (piece: CutPiece, centre: Point): Point => ({
  x: centre.x - piece.bounds.x - piece.bounds.width / 2 - piece.home.x,
  y: centre.y - piece.bounds.y - piece.bounds.height / 2 - piece.home.y,
});

/** World-space bounds of the group's piece outlines. An empty group gives a zero rect at its origin. */
export const groupBounds = (cut: PuzzleCut, group: Group): Rect => {
  const rects = group.pieces.map((id) => pieceRect(itemAt(cut.pieces, id), group));

  return unionRects(rects) ?? { x: group.x, y: group.y, width: 0, height: 0 };
};

/** World-space bounds of all the groups. With no groups, the picture's own rect at (0, 0). */
export const contentBounds = (cut: PuzzleCut, groups: Iterable<Group>): Rect => {
  const rects = [...groups].filter((g) => g.pieces.length > 0).map((g) => groupBounds(cut, g));

  return unionRects(rects) ?? { x: 0, y: 0, width: cut.width, height: cut.height };
};
