import type { ReactElement } from 'react';
import { CursorIcon } from '../../../../assets';
import type { RoomCursor } from '../../../../stores/room/cursors';
import { RoomTableCursorsItemName, RoomTableCursorsItemRoot } from './styled-components';

interface RoomTableCursorsItemProps {
  cursor: RoomCursor;
}

// One person's pointer: an arrow in their colour with their name beside it.
export function RoomTableCursorsItem({ cursor }: RoomTableCursorsItemProps): ReactElement {
  return (
    <RoomTableCursorsItemRoot data-cursor={cursor.id} tone={cursor.color}>
      <CursorIcon />
      <RoomTableCursorsItemName tone={cursor.color}>{cursor.name}</RoomTableCursorsItemName>
    </RoomTableCursorsItemRoot>
  );
}
