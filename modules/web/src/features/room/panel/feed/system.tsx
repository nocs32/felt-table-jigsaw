import type { ReactElement } from 'react';
import type { FeedEntry } from '../../../../stores/room/feed';
import { Avatar } from '../../../../ui';
import { RoomPanelFeedGutter, RoomPanelFeedSystemName, RoomPanelFeedSystemRoot, RoomPanelFeedTime } from './styled-components';

interface RoomPanelFeedSystemProps {
  entry: FeedEntry;
}

// Activity lines like Slack's "joined #channel": small, muted, with the person's avatar.
export function RoomPanelFeedSystem({ entry }: RoomPanelFeedSystemProps): ReactElement {
  return (
    <RoomPanelFeedSystemRoot>
      <RoomPanelFeedGutter>
        <Avatar initial={entry.authorInitial} color={entry.authorColor} size="sm" />
      </RoomPanelFeedGutter>
      <span>
        <RoomPanelFeedSystemName>{entry.authorName}</RoomPanelFeedSystemName> {entry.text}
      </span>
      <RoomPanelFeedTime>{entry.timeLabel}</RoomPanelFeedTime>
    </RoomPanelFeedSystemRoot>
  );
}
