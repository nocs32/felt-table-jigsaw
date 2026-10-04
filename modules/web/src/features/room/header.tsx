import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { EdgesIcon, FitIcon, HashIcon, ImageIcon, PlusIcon } from '../../assets';
import { useRootStore } from '../../stores/use-root-store';
import { Button, IconButton, NameInput } from '../../ui';
import { RoomHeaderDivider, RoomHeaderName, RoomHeaderRoot, RoomHeaderSummary, RoomHeaderTitle, RoomHeaderTools } from './styled-components';

// Slack's channel header: the table name (click to rename), a one-line summary and the table tools.
export const RoomHeader = observer(function RoomHeader(): ReactElement {
  const { locale, newPuzzle, room, ui } = useRootStore();
  const { t } = locale;
  const { widgets } = ui;

  return (
    <RoomHeaderRoot>
      <RoomHeaderTitle>
        <RoomHeaderName>
          <HashIcon />
          <NameInput field={room.nameField} label={t('header.tableName')} title={t('header.rename')} tone="heading" />
        </RoomHeaderName>
      </RoomHeaderTitle>
      <RoomHeaderSummary>{room.puzzle.summary}</RoomHeaderSummary>
      <RoomHeaderTools>
        <IconButton type="button" disabled={!room.puzzle.isReady} aria-label={t('header.fit')} title={t('header.fit')} onClick={room.puzzle.camera.fit}>
          <FitIcon />
        </IconButton>
        <IconButton type="button" disabled={!room.puzzle.isReady} aria-label={t('header.edges')} title={t('header.edges')} onClick={room.puzzle.arrangeEdges}>
          <EdgesIcon />
        </IconButton>
        <RoomHeaderDivider />
        <IconButton
          type="button"
          disabled={!widgets.hasPicture}
          aria-pressed={widgets.showsPicture}
          aria-label={t('header.picture')}
          title={t('header.picture')}
          onClick={widgets.togglePicture}
        >
          <ImageIcon />
        </IconButton>
        <RoomHeaderDivider />
        <Button type="button" size="sm" onClick={newPuzzle.open}>
          <PlusIcon />
          {t('header.newPuzzle')}
        </Button>
      </RoomHeaderTools>
    </RoomHeaderRoot>
  );
});
