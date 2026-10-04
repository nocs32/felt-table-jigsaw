import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../stores/use-root-store';
import { RoomHeader } from './header';
import { RoomPanel } from './panel';
import { RoomSidebar } from './sidebar';
import { RoomTable } from './table';
import { RoomTopBar } from './top-bar';
import { RoomFrame, RoomMain, RoomRoot, RoomScrim } from './styled-components';

export const Room = observer(function Room(): ReactElement {
  const { layout } = useRootStore().ui;

  return (
    <RoomRoot>
      <RoomTopBar />
      <RoomFrame>
        <RoomSidebar />
        {layout.isDrawerOpen && <RoomScrim onClick={layout.closeDrawer} />}
        <RoomMain>
          <RoomHeader />
          <RoomTable />
        </RoomMain>
        {layout.isPanelOpen && <RoomPanel />}
      </RoomFrame>
    </RoomRoot>
  );
});
