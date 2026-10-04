import { Dialog } from '@ark-ui/react/dialog';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { AlertIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { RoomNewPuzzleFooterRoot, RoomNewPuzzleFooterWarning } from './styled-components';

// Start, or (with a puzzle on the table) replace it after one "yes, for everyone".
export const RoomNewPuzzleFooter = observer(function RoomNewPuzzleFooter(): ReactElement {
  const { locale, newPuzzle } = useRootStore();

  return (
    <RoomNewPuzzleFooterRoot>
      {newPuzzle.replaces && (
        <RoomNewPuzzleFooterWarning urgent={newPuzzle.isConfirming}>
          <AlertIcon />
          {locale.t('newPuzzle.replaceWarning')}
        </RoomNewPuzzleFooterWarning>
      )}
      {newPuzzle.isConfirming ? (
        <Button type="button" tone="ghost" onClick={newPuzzle.back}>
          {locale.t('newPuzzle.cancel')}
        </Button>
      ) : (
        <Dialog.CloseTrigger asChild>
          <Button type="button" tone="ghost">
            {locale.t('newPuzzle.cancel')}
          </Button>
        </Dialog.CloseTrigger>
      )}
      <Button type="button" tone="primary" disabled={!newPuzzle.canStart} onClick={newPuzzle.start}>
        {newPuzzle.startLabel}
      </Button>
    </RoomNewPuzzleFooterRoot>
  );
});
