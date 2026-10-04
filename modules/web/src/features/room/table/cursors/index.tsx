import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTableCursorsItem } from './item';
import { RoomTableCursorsRoot } from './styled-components';
import { useRoomTableCursors } from './use-cursors';

// Everyone else's pointer on the table, Figma style. React only adds and removes them; their hook
// moves them every frame, eased, and with your own view of the table.
export const RoomTableCursors = observer(function RoomTableCursors(): ReactElement {
  const { cursors, puzzle } = useRootStore().room;
  const ref = useRoomTableCursors(cursors, puzzle.camera);

  return (
    <RoomTableCursorsRoot ref={ref} aria-hidden="true">
      {cursors.list.map((cursor) => (
        <RoomTableCursorsItem key={cursor.id} cursor={cursor} />
      ))}
    </RoomTableCursorsRoot>
  );
});
