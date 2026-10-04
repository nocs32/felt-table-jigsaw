import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { Avatar } from '../../../ui';
import { RoomTopBarPeopleItem, RoomTopBarPeopleMore, RoomTopBarPeopleRoot } from './styled-components';

export const RoomTopBarPeople = observer(function RoomTopBarPeople(): ReactElement {
  const { presence } = useRootStore().room;

  return (
    <RoomTopBarPeopleRoot role="group" aria-label={presence.countLabel} title={presence.countLabel}>
      {presence.stack.map((person) => (
        <RoomTopBarPeopleItem key={person.id}>
          <Avatar initial={person.initial} color={person.color} size="md" label={person.name} ring />
        </RoomTopBarPeopleItem>
      ))}
      {presence.hasOverflow && <RoomTopBarPeopleMore>+{presence.overflow}</RoomTopBarPeopleMore>}
    </RoomTopBarPeopleRoot>
  );
});
