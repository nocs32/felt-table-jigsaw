import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableBoard } from './board';
import { RoomTableChat } from './chat';
import { RoomTableCursors } from './cursors';
import { RoomTableEmpty } from './empty';
import { RoomTableFinished } from './finished';
import { RoomTableFlights } from './flights';
import { RoomTableLoading } from './loading';
import { RoomTablePicture } from './picture';
import { RoomTableFelt, RoomTableRoot } from './styled-components';
import { RoomTableToolbar } from './toolbar';
import { useRoomTableArea } from './use-area';
import { useRoomTableSurface } from './use-surface';

// The play area: the shared table surface, the puzzle, the floating picture and chat,
// flying reactions and the toolbar.
export const RoomTable = observer(function RoomTable(): ReactElement {
  const { room, ui } = useRootStore();
  const surfaceRef = useRoomTableSurface(room.background);
  const areaRef = useRoomTableArea(ui.widgets.area);

  return (
    <RoomTableRoot ref={areaRef}>
      <RoomTableFelt ref={surfaceRef} surface={room.background.surface} />
      <RoomTableBoard />
      <RoomTableCursors />
      {room.puzzle.isEmpty && <RoomTableEmpty />}
      {!room.puzzle.isEmpty && !room.puzzle.isReady && <RoomTableLoading />}
      {room.puzzle.isReady && room.puzzle.finish.isShown && <RoomTableFinished />}
      {ui.widgets.showsPicture && room.puzzle.picture && <RoomTablePicture picture={room.puzzle.picture} />}
      {ui.widgets.showsChat && <RoomTableChat />}
      <RoomTableFlights />
      <RoomTableToolbar />
    </RoomTableRoot>
  );
});
