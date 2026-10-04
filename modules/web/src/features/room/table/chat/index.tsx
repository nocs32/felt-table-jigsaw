import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { ChatIcon, CloseIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { IconButton } from '../../../../ui';
import { RoomTableWidget } from '../widget';
import { RoomTableChatComposer } from './composer';
import { RoomTableChatFeed } from './feed';
import { RoomTableChatHeader, RoomTableChatTitle } from './styled-components';

// The chat floats over the table: drag its header to move it, its corner to resize it.
export const RoomTableChat = observer(function RoomTableChat(): ReactElement {
  const { locale, ui } = useRootStore();
  const { chat } = ui.widgets;

  return (
    <RoomTableWidget frame={chat} label={locale.t('chat.label')} layer="chat">
      <RoomTableChatHeader data-widget-move>
        <RoomTableChatTitle>
          <ChatIcon />
          {locale.t('chat.label')}
        </RoomTableChatTitle>
        <IconButton type="button" aria-label={locale.t('chat.hide')} title={locale.t('chat.hide')} onClick={chat.hide}>
          <CloseIcon />
        </IconButton>
      </RoomTableChatHeader>
      <RoomTableChatFeed />
      <RoomTableChatComposer />
    </RoomTableWidget>
  );
});
