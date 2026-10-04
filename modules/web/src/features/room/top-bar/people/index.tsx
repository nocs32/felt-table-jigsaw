import { Popover } from '@ark-ui/react/popover';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { Avatar } from '../../../../ui';
import { RoomTopBarPeoplePanel } from './panel';
import { RoomTopBarPeopleMore, RoomTopBarPeopleStackItem, RoomTopBarPeopleTrigger } from './styled-components';

// The avatar stack; click it for everyone at the table and to change your own name.
export const RoomTopBarPeople = observer(function RoomTopBarPeople(): ReactElement {
  const { presence } = useRootStore().room;

  return (
    <Popover.Root positioning={{ placement: 'bottom-end', gutter: 8 }} lazyMount>
      <RoomTopBarPeopleTrigger aria-label={presence.showLabel} title={presence.countLabel}>
        {presence.stack.map((person) => (
          <RoomTopBarPeopleStackItem key={person.id}>
            <Avatar initial={person.initial} color={person.color} size="md" ring />
          </RoomTopBarPeopleStackItem>
        ))}
        {presence.hasOverflow && <RoomTopBarPeopleMore>+{presence.overflow}</RoomTopBarPeopleMore>}
      </RoomTopBarPeopleTrigger>
      <Portal>
        <Popover.Positioner>
          <RoomTopBarPeoplePanel />
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
});
