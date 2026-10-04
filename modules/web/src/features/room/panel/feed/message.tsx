import type { ReactElement } from 'react';
import type { FeedEntry } from '../../../../stores/room/feed';
import { Avatar } from '../../../../ui';
import {
  RoomPanelFeedAuthor,
  RoomPanelFeedGutter,
  RoomPanelFeedMessageRoot,
  RoomPanelFeedMeta,
  RoomPanelFeedText,
  RoomPanelFeedTime,
} from './styled-components';

interface RoomPanelFeedMessageProps {
  entry: FeedEntry;
}

export function RoomPanelFeedMessage({ entry }: RoomPanelFeedMessageProps): ReactElement {
  return (
    <RoomPanelFeedMessageRoot startsGroup={entry.startsGroup}>
      <RoomPanelFeedGutter>
        {entry.startsGroup && <Avatar initial={entry.authorInitial} color={entry.authorColor} size="lg" />}
      </RoomPanelFeedGutter>
      <div>
        {entry.startsGroup && (
          <RoomPanelFeedMeta>
            <RoomPanelFeedAuthor>{entry.authorName}</RoomPanelFeedAuthor>
            <RoomPanelFeedTime>{entry.timeLabel}</RoomPanelFeedTime>
          </RoomPanelFeedMeta>
        )}
        <RoomPanelFeedText>{entry.text}</RoomPanelFeedText>
      </div>
    </RoomPanelFeedMessageRoot>
  );
}
