import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { AddReactionIcon, ChatIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import {
  RoomTableReactionBarButton,
  RoomTableReactionBarDivider,
  RoomTableReactionBarEmoji,
  RoomTableReactionBarRoot,
} from './styled-components';

// Click an emoji to send one; press and hold to stream them.
export const RoomTableReactionBar = observer(function RoomTableReactionBar(): ReactElement {
  const { room, ui } = useRootStore();
  const { reactions } = room;

  return (
    <RoomTableReactionBarRoot role="toolbar" aria-label="Reactions">
      {reactions.quickButtons.map((button) => (
        <RoomTableReactionBarEmoji
          key={button.emoji}
          type="button"
          aria-label={button.label}
          title={button.label}
          onPointerDown={() => reactions.startStream(button.emoji)}
          onPointerUp={reactions.stopStream}
          onPointerLeave={reactions.stopStream}
          onPointerCancel={reactions.stopStream}
          onClick={(event) => reactions.fireFromKeyboard(button.emoji, event.detail)}
        >
          {button.emoji}
        </RoomTableReactionBarEmoji>
      ))}
      <RoomTableReactionBarDivider />
      <RoomTableReactionBarButton type="button" disabled aria-label="More reactions" title="More reactions">
        <AddReactionIcon />
      </RoomTableReactionBarButton>
      <RoomTableReactionBarDivider />
      <RoomTableReactionBarButton type="button" aria-pressed={ui.layout.isPanelOpen} aria-label="Chat (C)" title="Chat (C)" onClick={ui.layout.togglePanel}>
        <ChatIcon />
      </RoomTableReactionBarButton>
    </RoomTableReactionBarRoot>
  );
});
