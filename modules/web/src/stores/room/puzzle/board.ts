import type { Point, PuzzleCut } from '@felt-table/engine';
import type { PathHitService, PieceArt } from '../../../services';
import type { BoardGroup, BoardShownGroup } from '../../../services/board-painter';
import type { PlayerColor } from '../types';
import type { RoomPuzzleDragStore } from './drag';

// The groups as this browser draws them: the server's, except the one in your hand, which is where
// your pointer put it and on top. Groups others hold are outlined in their colour.
export const showGroups = (
  groups: readonly BoardGroup[],
  drag: RoomPuzzleDragStore,
  sessionId: string,
  colorOf: (sessionId: string) => PlayerColor | null,
): BoardShownGroup[] => {
  const mine = drag.isActive ? groups.find((group) => group.id === drag.groupId) : undefined;

  const rest = groups
    .filter((group) => group !== mine)
    .map((group) => ({ ...group, lifted: false, outline: group.heldBy !== '' && group.heldBy !== sessionId ? colorOf(group.heldBy) : null }));

  return mine ? [...rest, { ...mine, x: drag.x, y: drag.y, lifted: drag.isDragging, outline: null }] : rest;
};

// The top group with a piece under the table point, if any.
export const groupAt = (cut: PuzzleCut, art: PieceArt, groups: readonly BoardShownGroup[], point: Point, isInPath: PathHitService): BoardShownGroup | null => {
  for (let k = groups.length - 1; k >= 0; k--) {
    const group = groups[k];

    for (const id of group?.pieces ?? []) {
      const piece = cut.pieces[id];
      const sprite = art.sprites[id];
      const x = point.x - (group?.x ?? 0) - (piece?.home.x ?? 0);
      const y = point.y - (group?.y ?? 0) - (piece?.home.y ?? 0);
      const box = piece?.bounds;

      if (group && sprite && box && x >= box.x && y >= box.y && x <= box.x + box.width && y <= box.y + box.height && isInPath(sprite.path, x, y)) {
        return group;
      }
    }
  }

  return null;
};
