import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { ImageIcon } from '../../../assets';
import { RoomPanelPictureEmpty, RoomPanelPictureRoot } from './styled-components';

// The box lid: the finished picture to solve against.
export const RoomPanelPicture = observer(function RoomPanelPicture(): ReactElement {
  return (
    <RoomPanelPictureRoot aria-label="Picture">
      <RoomPanelPictureEmpty>
        <ImageIcon />
        The picture shows up here once a puzzle is cut.
      </RoomPanelPictureEmpty>
    </RoomPanelPictureRoot>
  );
});
