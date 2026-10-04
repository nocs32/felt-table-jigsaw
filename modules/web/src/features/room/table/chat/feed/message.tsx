import type { ReactElement } from 'react';
import type { FeedEntry } from '../../../../../stores/room/feed';
import { Avatar } from '../../../../../ui';
import {
  RoomTableChatFeedAuthor,
  RoomTableChatFeedGutter,
  RoomTableChatFeedMessageRoot,
  RoomTableChatFeedMeta,
  RoomTableChatFeedText,
  RoomTableChatFeedTime,
} from './styled-components';

interface RoomTableChatFeedMessageProps {
  entry: FeedEntry;
}

export function RoomTableChatFeedMessage({ entry }: RoomTableChatFeedMessageProps): ReactElement {
  return (
    <RoomTableChatFeedMessageRoot startsGroup={entry.startsGroup}>
      <RoomTableChatFeedGutter>
        {entry.startsGroup && <Avatar initial={entry.authorInitial} color={entry.authorColor} size="lg" />}
      </RoomTableChatFeedGutter>
      <div>
        {entry.startsGroup && (
          <RoomTableChatFeedMeta>
            <RoomTableChatFeedAuthor>{entry.authorName}</RoomTableChatFeedAuthor>
            <RoomTableChatFeedTime>{entry.timeLabel}</RoomTableChatFeedTime>
          </RoomTableChatFeedMeta>
        )}
        <RoomTableChatFeedText>{entry.text}</RoomTableChatFeedText>
      </div>
    </RoomTableChatFeedMessageRoot>
  );
}
