import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../stores/use-root-store';
import { RoomHeader } from './header';
import { RoomNewPuzzle } from './new-puzzle';
import { RoomStatus } from './status';
import { RoomMain, RoomRoot } from './styled-components';
import { RoomTable } from './table';
import { RoomTopBar } from './top-bar';

// The whole page: the top bar, then the table with its header. Chat and picture float on the table.
// Until the table is open (or when it can't be), a status card stands in for all of it.
export const Room = observer(function Room(): ReactElement {
  const { connection } = useRootStore().room;

  if (!connection.isOpen) {
    return <RoomStatus />;
  }

  return (
    <RoomRoot>
      <RoomTopBar />
      <RoomMain>
        <RoomHeader />
        <RoomTable />
      </RoomMain>
      <RoomNewPuzzle />
    </RoomRoot>
  );
});
