import type { ReactElement } from 'react';
import type { MemberView } from '../../../stores/room/presence';
import { Avatar } from '../../../ui';
import { RoomSidebarItemLabel, RoomSidebarPerson, RoomSidebarPersonYou } from './styled-components';

interface RoomSidebarPeopleItemProps {
  member: MemberView;
}

export function RoomSidebarPeopleItem({ member }: RoomSidebarPeopleItemProps): ReactElement {
  return (
    <RoomSidebarPerson>
      <Avatar initial={member.initial} color={member.color} size="sm" presence={member.status} />
      <RoomSidebarItemLabel>{member.name}</RoomSidebarItemLabel>
      {member.isMe && <RoomSidebarPersonYou>you</RoomSidebarPersonYou>}
    </RoomSidebarPerson>
  );
}
