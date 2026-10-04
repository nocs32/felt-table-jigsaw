import type { ReactElement } from 'react';
import type { FeedEntry } from '../../../../../stores/room/feed';
import { Avatar } from '../../../../../ui';
import { RoomTableChatFeedGutter, RoomTableChatFeedSystemName, RoomTableChatFeedSystemRoot, RoomTableChatFeedTime } from './styled-components';

interface RoomTableChatFeedSystemProps {
  entry: FeedEntry;
}

// Activity lines like Slack's "joined #channel": small, muted, with the person's avatar.
export function RoomTableChatFeedSystem({ entry }: RoomTableChatFeedSystemProps): ReactElement {
  return (
    <RoomTableChatFeedSystemRoot>
      <RoomTableChatFeedGutter>
        <Avatar initial={entry.authorInitial} color={entry.authorColor} size="sm" />
      </RoomTableChatFeedGutter>
      <span>
        <RoomTableChatFeedSystemName>{entry.authorName}</RoomTableChatFeedSystemName> {entry.text}
      </span>
      <RoomTableChatFeedTime>{entry.timeLabel}</RoomTableChatFeedTime>
    </RoomTableChatFeedSystemRoot>
  );
}
