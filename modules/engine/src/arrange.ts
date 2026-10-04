import { contentBounds, originCentredAt } from './bounds.js';
import { itemAt } from './list.js';
import { shuffle } from './random.js';
import type { Group, Point, PuzzleCut } from './types.js';

const isLooseEdge = (cut: PuzzleCut, group: Group, isHeld: (groupId: number) => boolean): boolean => {
  const [pieceId] = group.pieces;

  return group.pieces.length === 1 && pieceId !== undefined && itemAt(cut.pieces, pieceId).isEdge && !isHeld(group.id);
};

/**
 * "Edges up": new origins for the loose edge pieces (single-piece groups that are not held),
 * shuffled into rows of slots above everything else on the table. Returns group id -> new origin;
 * groups not in the map stay where they are.
 */
export const arrangeEdges = (
  cut: PuzzleCut,
  groups: ReadonlyMap<number, Group>,
  random: () => number,
  isHeld: (groupId: number) => boolean = (): boolean => false,
): Map<number, Point> => {
  const all = [...groups.values()];
  const loose = all.filter((g) => isLooseEdge(cut, g, isHeld)).sort((a, b) => a.id - b.id);
  const placed = new Map<number, Point>();

  if (loose.length === 0) return placed;

  const looseIds = new Set(loose.map((g) => g.id));
  const box = contentBounds(cut, all.filter((g) => !looseIds.has(g.id)));
  const slot = Math.max(cut.cellWidth, cut.cellHeight) * 1.4;
  const perRow = Math.max(6, Math.floor(box.width / slot), Math.ceil(Math.sqrt(loose.length * 3)));
  const rowCount = Math.ceil(loose.length / perRow);
  const left = box.x + box.width / 2 - (perRow * slot) / 2;
  const top = box.y - slot * 0.4 - rowCount * slot;

  shuffle(loose, random).forEach((group, k) => {
    const piece = itemAt(cut.pieces, itemAt(group.pieces, 0));
    const centre = { x: left + ((k % perRow) + 0.5) * slot, y: top + (Math.floor(k / perRow) + 0.5) * slot };

    placed.set(group.id, originCentredAt(piece, centre));
  });

  return placed;
};
