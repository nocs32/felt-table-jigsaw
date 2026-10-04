import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { ChevronDownIcon, CloseIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomSidebarInvite } from './invite';
import { RoomSidebarPeople } from './people';
import { RoomSidebarPuzzle } from './puzzle';
import { RoomSidebarTable } from './table';
import { RoomSidebarClose, RoomSidebarHeader, RoomSidebarRoot, RoomSidebarScroll, RoomSidebarTitle } from './styled-components';

// Slack's aubergine sidebar. On narrow screens it slides in as a drawer.
export const RoomSidebar = observer(function RoomSidebar(): ReactElement {
  const { layout } = useRootStore().ui;

  return (
    <RoomSidebarRoot drawer={layout.drawer} aria-label="Room">
      <RoomSidebarHeader>
        <RoomSidebarTitle>
          Felt Table
          <ChevronDownIcon />
        </RoomSidebarTitle>
        <RoomSidebarClose type="button" aria-label="Close sidebar" onClick={layout.closeDrawer}>
          <CloseIcon />
        </RoomSidebarClose>
      </RoomSidebarHeader>
      <RoomSidebarScroll>
        <RoomSidebarPuzzle />
        <RoomSidebarPeople />
        <RoomSidebarTable />
      </RoomSidebarScroll>
      <RoomSidebarInvite />
    </RoomSidebarRoot>
  );
});
