import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableEmpty } from './empty';
import { RoomTableFlights } from './flights';
import { RoomTableReactionBar } from './reaction-bar';
import { RoomTableFelt, RoomTableRoot } from './styled-components';
import { useRoomTableSurface } from './use-surface';

// The play area: the shared table surface, the puzzle, flying reactions and the reaction bar.
export const RoomTable = observer(function RoomTable(): ReactElement {
  const { room } = useRootStore();
  const surfaceRef = useRoomTableSurface(room.background);

  return (
    <RoomTableRoot>
      <RoomTableFelt ref={surfaceRef} surface={room.background.surface} />
      {room.puzzle.isEmpty && <RoomTableEmpty />}
      <RoomTableFlights />
      <RoomTableReactionBar />
    </RoomTableRoot>
  );
});
