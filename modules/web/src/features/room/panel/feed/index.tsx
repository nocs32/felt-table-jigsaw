import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomPanelFeedMessage } from './message';
import { RoomPanelFeedRoot } from './styled-components';
import { RoomPanelFeedSystem } from './system';
import { useRoomPanelFeedScroll } from './use-scroll';

// Chat messages and activity lines, Slack-style, newest at the bottom.
export const RoomPanelFeed = observer(function RoomPanelFeed(): ReactElement {
  const { feed } = useRootStore().room;
  const listRef = useRoomPanelFeedScroll(feed.items.length);

  return (
    <RoomPanelFeedRoot ref={listRef} role="log" aria-live="polite" aria-label="Chat and activity">
      {feed.entries.map((entry) =>
        entry.kind === 'system' ? (
          <RoomPanelFeedSystem key={entry.id} entry={entry} />
        ) : (
          <RoomPanelFeedMessage key={entry.id} entry={entry} />
        ),
      )}
    </RoomPanelFeedRoot>
  );
});
