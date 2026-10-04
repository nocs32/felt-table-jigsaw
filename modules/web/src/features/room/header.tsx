import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { EdgesIcon, FitIcon, HashIcon, PanelIcon } from '../../assets';
import { useRootStore } from '../../stores/use-root-store';
import { IconButton } from '../../ui';
import { RoomHeaderDivider, RoomHeaderRoot, RoomHeaderSummary, RoomHeaderTitle, RoomHeaderTools } from './styled-components';

// Slack's channel header: room name, a one-line summary and the table tools.
export const RoomHeader = observer(function RoomHeader(): ReactElement {
  const { room, ui } = useRootStore();

  return (
    <RoomHeaderRoot>
      <RoomHeaderTitle>
        <HashIcon />
        {room.name}
      </RoomHeaderTitle>
      <RoomHeaderSummary>{room.puzzle.summary}</RoomHeaderSummary>
      <RoomHeaderTools>
        <IconButton type="button" disabled={room.puzzle.isEmpty} aria-label="Fit all pieces in view (F)" title="Fit all pieces in view (F)">
          <FitIcon />
        </IconButton>
        <IconButton type="button" disabled={room.puzzle.isEmpty} aria-label="Edge pieces up (E)" title="Edge pieces up (E)">
          <EdgesIcon />
        </IconButton>
        <RoomHeaderDivider />
        <IconButton
          type="button"
          aria-pressed={ui.layout.isPanelOpen}
          aria-label="Picture and chat (C)"
          title="Picture and chat (C)"
          onClick={ui.layout.togglePanel}
        >
          <PanelIcon />
        </IconButton>
      </RoomHeaderTools>
    </RoomHeaderRoot>
  );
});
