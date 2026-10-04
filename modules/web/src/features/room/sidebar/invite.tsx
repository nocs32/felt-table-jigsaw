import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { PlusIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomSidebarFooter, RoomSidebarInviteIcon, RoomSidebarItem, RoomSidebarItemLabel } from './styled-components';

export const RoomSidebarInvite = observer(function RoomSidebarInvite(): ReactElement {
  const { share } = useRootStore().room;

  return (
    <RoomSidebarFooter>
      <RoomSidebarItem type="button" onClick={share.copy}>
        <RoomSidebarInviteIcon>
          <PlusIcon />
        </RoomSidebarInviteIcon>
        <RoomSidebarItemLabel>{share.inviteLabel}</RoomSidebarItemLabel>
      </RoomSidebarItem>
    </RoomSidebarFooter>
  );
});
