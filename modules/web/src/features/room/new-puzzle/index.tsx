import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CloseIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomNewPuzzleFooter } from './footer';
import { RoomNewPuzzlePicker } from './picker';
import { RoomNewPuzzleSettings } from './settings';
import {
  RoomNewPuzzleBackdrop,
  RoomNewPuzzleBody,
  RoomNewPuzzleClose,
  RoomNewPuzzleContent,
  RoomNewPuzzleHeader,
  RoomNewPuzzlePositioner,
  RoomNewPuzzleTitle,
} from './styled-components';

// Pick a picture (Unsplash, a link or a sample), how many pieces and how they're cut, then start.
export const RoomNewPuzzle = observer(function RoomNewPuzzle(): ReactElement {
  const { locale, ui } = useRootStore();

  return (
    <Dialog.Root open={ui.dialog.isNewPuzzleOpen} onOpenChange={ui.dialog.syncOpen} lazyMount unmountOnExit>
      <Portal>
        <RoomNewPuzzleBackdrop />
        <RoomNewPuzzlePositioner>
          <RoomNewPuzzleContent>
            <RoomNewPuzzleHeader>
              <RoomNewPuzzleTitle>{locale.t('newPuzzle.title')}</RoomNewPuzzleTitle>
              <RoomNewPuzzleClose aria-label={locale.t('newPuzzle.close')} title={locale.t('newPuzzle.close')}>
                <CloseIcon />
              </RoomNewPuzzleClose>
            </RoomNewPuzzleHeader>
            <RoomNewPuzzleBody>
              <RoomNewPuzzlePicker />
              <RoomNewPuzzleSettings />
            </RoomNewPuzzleBody>
            <RoomNewPuzzleFooter />
          </RoomNewPuzzleContent>
        </RoomNewPuzzlePositioner>
      </Portal>
    </Dialog.Root>
  );
});
