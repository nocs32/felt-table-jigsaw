import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CloseIcon } from '../../../../assets';
import type { PuzzlePicture } from '../../../../stores/room/types';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTablePictureCredit } from './credit';
import { RoomTablePictureSource } from './source';
import {
  RoomTablePictureFullBackdrop,
  RoomTablePictureFullCaption,
  RoomTablePictureFullClose,
  RoomTablePictureFullContent,
  RoomTablePictureFullImage,
  RoomTablePictureFullPositioner,
} from './styled-components';

interface RoomTablePictureFullProps {
  picture: PuzzlePicture;
}

// The picture at full size over a dimmed screen. Esc, the close button or a click outside closes it.
export const RoomTablePictureFull = observer(function RoomTablePictureFull({ picture }: RoomTablePictureFullProps): ReactElement {
  const { locale, ui } = useRootStore();

  return (
    <Dialog.Root open={ui.dialog.isPictureOpen} onOpenChange={ui.dialog.syncOpen} lazyMount unmountOnExit>
      <Portal>
        <RoomTablePictureFullBackdrop />
        <RoomTablePictureFullPositioner>
          <RoomTablePictureFullContent aria-label={locale.t('picture.label')}>
            <RoomTablePictureFullImage src={picture.src} alt={picture.alt} />
            <RoomTablePictureFullCaption>
              {picture.credit && <RoomTablePictureCredit credit={picture.credit} />}
              {picture.source && <RoomTablePictureSource source={picture.source} />}
              {!picture.credit && !picture.source && picture.alt}
            </RoomTablePictureFullCaption>
            <RoomTablePictureFullClose aria-label={locale.t('picture.close')} title={locale.t('picture.close')}>
              <CloseIcon />
            </RoomTablePictureFullClose>
          </RoomTablePictureFullContent>
        </RoomTablePictureFullPositioner>
      </Portal>
    </Dialog.Root>
  );
});
