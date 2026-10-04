import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { SendIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { withoutDefault } from '../../../../utils';
import { RoomTableChatComposerInput, RoomTableChatComposerRoot, RoomTableChatComposerSend } from './styled-components';

export const RoomTableChatComposer = observer(function RoomTableChatComposer(): ReactElement {
  const { locale, room } = useRootStore();
  const { feed } = room;

  return (
    <RoomTableChatComposerRoot onSubmit={withoutDefault(feed.send)}>
      <RoomTableChatComposerInput
        value={feed.draft}
        placeholder={room.composerPlaceholder}
        aria-label={locale.t('chat.message')}
        maxLength={500}
        onChange={(event) => feed.setDraft(event.target.value)}
      />
      <RoomTableChatComposerSend type="submit" disabled={feed.isDraftEmpty} ready={feed.canSend} aria-label={locale.t('chat.send')}>
        <SendIcon />
      </RoomTableChatComposerSend>
    </RoomTableChatComposerRoot>
  );
});
