import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { SendIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { withoutDefault } from '../../../utils';
import { RoomPanelComposerInput, RoomPanelComposerRoot, RoomPanelComposerSend } from './styled-components';

export const RoomPanelComposer = observer(function RoomPanelComposer(): ReactElement {
  const { room } = useRootStore();
  const { feed } = room;

  return (
    <RoomPanelComposerRoot onSubmit={withoutDefault(feed.send)}>
      <RoomPanelComposerInput
        value={feed.draft}
        placeholder={room.composerPlaceholder}
        aria-label="Message"
        maxLength={500}
        onChange={(event) => feed.setDraft(event.target.value)}
      />
      <RoomPanelComposerSend type="submit" disabled={feed.isDraftEmpty} ready={feed.canSend} aria-label="Send">
        <SendIcon />
      </RoomPanelComposerSend>
    </RoomPanelComposerRoot>
  );
});
