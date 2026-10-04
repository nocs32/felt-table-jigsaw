import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { DicesIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { Button } from '../../../../ui';
import { RoomNewPuzzleSettingsLabel, RoomNewPuzzleSettingsPreviewCanvas, RoomNewPuzzleSettingsRow } from './styled-components';
import { useRoomNewPuzzleSettingsPreview } from './use-preview';

// The picked picture with the cut drawn over it: exactly the cut the server will make.
export const RoomNewPuzzleSettingsPreview = observer(function RoomNewPuzzleSettingsPreview(): ReactElement {
  const { locale, newPuzzle } = useRootStore();
  const ref = useRoomNewPuzzleSettingsPreview(newPuzzle);
  const { t } = locale;

  return (
    <>
      <RoomNewPuzzleSettingsRow>
        <RoomNewPuzzleSettingsLabel>{t('newPuzzle.preview.label')}</RoomNewPuzzleSettingsLabel>
        <Button type="button" tone="ghost" size="sm" disabled={!newPuzzle.canStart} onClick={newPuzzle.shuffle}>
          <DicesIcon />
          {t('newPuzzle.preview.shuffle')}
        </Button>
      </RoomNewPuzzleSettingsRow>
      <RoomNewPuzzleSettingsPreviewCanvas ref={ref} role="img" aria-label={newPuzzle.pick?.alt ?? t('newPuzzle.preview.empty')} />
    </>
  );
});
