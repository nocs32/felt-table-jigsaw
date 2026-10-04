import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { ChatIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTableToolbarBackground } from './background';
import { RoomTableToolbarPicker } from './picker';
import { RoomTableToolbarQuick } from './quick';
import { RoomTableToolbarButton, RoomTableToolbarDivider, RoomTableToolbarRoot } from './styled-components';

// The floating bar under the table, like a Slack huddle's: quick reactions, the full emoji
// picker, the table surface and the chat.
export const RoomTableToolbar = observer(function RoomTableToolbar(): ReactElement {
  const { locale, room, ui } = useRootStore();
  const { chat } = ui.widgets;

  return (
    <RoomTableToolbarRoot role="toolbar" aria-label={locale.t('toolbar.label')}>
      {room.reactions.quickButtons.map((button) => (
        <RoomTableToolbarQuick key={button.emoji} button={button} />
      ))}
      <RoomTableToolbarDivider />
      <RoomTableToolbarPicker />
      <RoomTableToolbarBackground />
      <RoomTableToolbarDivider />
      <RoomTableToolbarButton
        type="button"
        aria-pressed={chat.isOpen}
        aria-label={locale.t('toolbar.chat')}
        title={locale.t('toolbar.chat')}
        onClick={chat.toggle}
      >
        <ChatIcon />
      </RoomTableToolbarButton>
    </RoomTableToolbarRoot>
  );
});
