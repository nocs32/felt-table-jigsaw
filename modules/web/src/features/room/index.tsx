import type { ReactElement } from 'react';
import { RoomHeader } from './header';
import { RoomTable } from './table';
import { RoomTopBar } from './top-bar';
import { RoomMain, RoomRoot } from './styled-components';

// The whole page: the top bar, then the table with its header. Chat and picture float on the table.
export function Room(): ReactElement {
  return (
    <RoomRoot>
      <RoomTopBar />
      <RoomMain>
        <RoomHeader />
        <RoomTable />
      </RoomMain>
    </RoomRoot>
  );
}
