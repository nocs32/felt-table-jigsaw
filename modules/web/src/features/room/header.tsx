import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { EdgesIcon, FitIcon, HashIcon, ImageIcon } from '../../assets';
import { useRootStore } from '../../stores/use-root-store';
import { IconButton, NameInput } from '../../ui';
import { RoomHeaderDivider, RoomHeaderName, RoomHeaderRoot, RoomHeaderSummary, RoomHeaderTitle, RoomHeaderTools } from './styled-components';

// Slack's channel header: the table name (click to rename), a one-line summary and the table tools.
export const RoomHeader = observer(function RoomHeader(): ReactElement {
  const { locale, room, ui } = useRootStore();
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
        <IconButton type="button" disabled={room.puzzle.isEmpty} aria-label={t('header.fit')} title={t('header.fit')}>
          <FitIcon />
        </IconButton>
        <IconButton type="button" disabled={room.puzzle.isEmpty} aria-label={t('header.edges')} title={t('header.edges')}>
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
      </RoomHeaderTools>
    </RoomHeaderRoot>
  );
});
