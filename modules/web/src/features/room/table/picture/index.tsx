import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CloseIcon, ZoomInIcon } from '../../../../assets';
import type { PuzzlePicture } from '../../../../stores/room/types';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTableWidget } from '../widget';
import { RoomTablePictureFull } from './full';
import { RoomTablePictureHide, RoomTablePictureHint, RoomTablePictureImage, RoomTablePictureOpen } from './styled-components';

interface RoomTablePictureProps {
  picture: PuzzlePicture;
}

// The box lid: the finished picture, floating in the top-left corner. Click to see it full size.
export const RoomTablePicture = observer(function RoomTablePicture({ picture }: RoomTablePictureProps): ReactElement {
  const { locale, ui } = useRootStore();

  return (
    <RoomTableWidget frame={ui.widgets.picture} label={locale.t('picture.label')} layer="picture">
      <RoomTablePictureOpen
        type="button"
        data-widget-move
        aria-label={locale.t('picture.open')}
        title={locale.t('picture.openTitle')}
        onClick={ui.dialog.openPicture}
      >
        <RoomTablePictureImage src={picture.src} alt={picture.alt} draggable={false} />
        <RoomTablePictureHint>
          <ZoomInIcon />
        </RoomTablePictureHint>
      </RoomTablePictureOpen>
      <RoomTablePictureHide type="button" aria-label={locale.t('picture.hide')} title={locale.t('picture.hide')} onClick={ui.widgets.picture.hide}>
        <CloseIcon />
      </RoomTablePictureHide>
      <RoomTablePictureFull picture={picture} />
    </RoomTableWidget>
  );
});
