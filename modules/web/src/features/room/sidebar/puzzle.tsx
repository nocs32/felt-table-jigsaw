import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { HashIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomSidebarSection } from './section';
import { RoomSidebarItem, RoomSidebarItemLabel, RoomSidebarMeta } from './styled-components';

export const RoomSidebarPuzzle = observer(function RoomSidebarPuzzle(): ReactElement {
  const { room, ui } = useRootStore();

  return (
    <RoomSidebarSection title="Puzzle">
      <RoomSidebarItem type="button" active aria-current="page" onClick={ui.layout.closeDrawer}>
        <HashIcon />
        <RoomSidebarItemLabel>{room.name}</RoomSidebarItemLabel>
      </RoomSidebarItem>
      <RoomSidebarMeta>{room.puzzle.summary}</RoomSidebarMeta>
    </RoomSidebarSection>
  );
});
