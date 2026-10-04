import type { ReactElement } from 'react';
import type { MemberView } from '../../../../stores/room/presence';
import { Avatar } from '../../../../ui';
import { RoomTopBarPeoplePanelItemName, RoomTopBarPeoplePanelItemNote, RoomTopBarPeoplePanelItemRoot } from './styled-components';

interface RoomTopBarPeoplePanelItemProps {
  member: MemberView;
}

export function RoomTopBarPeoplePanelItem({ member }: RoomTopBarPeoplePanelItemProps): ReactElement {
  return (
    <RoomTopBarPeoplePanelItemRoot>
      <Avatar initial={member.initial} color={member.color} size="sm" presence={member.status} />
      <RoomTopBarPeoplePanelItemName>{member.name}</RoomTopBarPeoplePanelItemName>
      {member.note && <RoomTopBarPeoplePanelItemNote>{member.note}</RoomTopBarPeoplePanelItemNote>}
    </RoomTopBarPeoplePanelItemRoot>
  );
}
