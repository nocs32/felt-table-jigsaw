import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableBoardCanvas } from './styled-components';
import { useRoomTableBoard } from './use-board';

// The puzzle itself: one canvas over the felt. React draws it once; the pieces are painted by
// the board painter on each animation frame that has something new to show.
export const RoomTableBoard = observer(function RoomTableBoard(): ReactElement {
  const { room } = useRootStore();
  const ref = useRoomTableBoard(room.puzzle);

  return <RoomTableBoardCanvas ref={ref} cursor={room.puzzle.pointer.cursor} aria-label={room.puzzle.summary} />;
});
