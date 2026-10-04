import { originCentredAt } from './bounds.js';
import { itemAt } from './list.js';
import { shuffle } from './random.js';
import type { Group, PuzzleCut } from './types.js';

const clampAspect = (aspect: number): number => (Number.isFinite(aspect) ? Math.max(0.6, Math.min(2.2, aspect)) : 1.6);

/**
 * One single-piece group per piece (group.id === piece id), laid out in a loose, jittered grid
 * of shuffled slots centred on the picture's centre. `areaAspect` is the shape of the area to
 * fill (e.g. the viewport's width / height), clamped to 0.6..2.2.
 */
export const scatterGroups = (cut: PuzzleCut, random: () => number, areaAspect = 1.6): Group[] => {
  const count = cut.pieces.length;
  const slot = Math.max(cut.cellWidth, cut.cellHeight) * 1.42;
  const slotCols = Math.ceil(Math.sqrt(count * clampAspect(areaAspect)));
  const slotRows = Math.ceil(count / slotCols);
  const left = cut.width / 2 - (slotCols * slot) / 2;
  const top = cut.height / 2 - (slotRows * slot) / 2;
  const slots = shuffle(Array.from({ length: slotCols * slotRows }, (_, k) => k), random);
  const wobble = (): number => (random() - 0.5) * slot * 0.18;

  return cut.pieces.map((piece) => {
    const index = itemAt(slots, piece.id);
    const x = left + ((index % slotCols) + 0.5) * slot + wobble();
    const y = top + (Math.floor(index / slotCols) + 0.5) * slot + wobble();

    return { id: piece.id, ...originCentredAt(piece, { x, y }), pieces: [piece.id] };
  });
};
