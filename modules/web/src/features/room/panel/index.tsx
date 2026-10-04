import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CloseIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { IconButton } from '../../../ui';
import { RoomPanelComposer } from './composer';
import { RoomPanelFeed } from './feed';
import { RoomPanelPicture } from './picture';
import { RoomPanelHeader, RoomPanelRoot, RoomPanelTitle } from './styled-components';

export const RoomPanel = observer(function RoomPanel(): ReactElement {
  const { layout } = useRootStore().ui;

  return (
    <RoomPanelRoot aria-label="Picture and chat">
      <RoomPanelHeader>
        <RoomPanelTitle>Picture &amp; chat</RoomPanelTitle>
        <IconButton type="button" aria-label="Close panel" onClick={layout.closePanel}>
          <CloseIcon />
        </IconButton>
      </RoomPanelHeader>
      <RoomPanelPicture />
      <RoomPanelFeed />
      <RoomPanelComposer />
    </RoomPanelRoot>
  );
});
