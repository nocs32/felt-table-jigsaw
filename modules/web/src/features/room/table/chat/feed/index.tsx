import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../../stores/use-root-store';
import { RoomTableChatFeedMessage } from './message';
import { RoomTableChatFeedRoot } from './styled-components';
import { RoomTableChatFeedSystem } from './system';
import { useRoomTableChatFeedScroll } from './use-scroll';

// Chat messages and activity lines, Slack-style, newest at the bottom.
export const RoomTableChatFeed = observer(function RoomTableChatFeed(): ReactElement {
  const { locale, room } = useRootStore();
  const { feed } = room;
  const listRef = useRoomTableChatFeedScroll(feed.items.length);

  return (
    <RoomTableChatFeedRoot ref={listRef} role="log" aria-live="polite" aria-label={locale.t('chat.log')}>
      {feed.entries.map((entry) =>
        entry.kind === 'system' ? (
          <RoomTableChatFeedSystem key={entry.id} entry={entry} />
        ) : (
          <RoomTableChatFeedMessage key={entry.id} entry={entry} />
        ),
      )}
    </RoomTableChatFeedRoot>
  );
});
