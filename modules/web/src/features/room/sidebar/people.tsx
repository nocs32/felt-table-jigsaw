import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomSidebarPeopleItem } from './people-item';
import { RoomSidebarSection } from './section';

export const RoomSidebarPeople = observer(function RoomSidebarPeople(): ReactElement {
  const { presence } = useRootStore().room;

  return (
    <RoomSidebarSection title="People" count={presence.count}>
      {presence.views.map((member) => (
        <RoomSidebarPeopleItem key={member.id} member={member} />
      ))}
    </RoomSidebarSection>
  );
});
