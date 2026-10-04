import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { QuickReactionView } from '../../../../stores/room/reactions';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTableToolbarEmoji } from './styled-components';

interface RoomTableToolbarQuickProps {
  button: QuickReactionView;
}

// Click an emoji to send one; press and hold to stream them.
export const RoomTableToolbarQuick = observer(function RoomTableToolbarQuick({ button }: RoomTableToolbarQuickProps): ReactElement {
  const { reactions } = useRootStore().room;

  return (
    <RoomTableToolbarEmoji
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
    </RoomTableToolbarEmoji>
  );
});
