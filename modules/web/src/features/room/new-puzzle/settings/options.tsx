import { Collapsible } from '@ark-ui/react/collapsible';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { ChevronDownIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomNewPuzzleSettingsOptionsChoice } from './options-choice';
import { RoomNewPuzzleSettingsOptionsContent, RoomNewPuzzleSettingsOptionsTrigger } from './styled-components';

// Folded away by default: the pieces' shape and how close a drop must be to snap.
export const RoomNewPuzzleSettingsOptions = observer(function RoomNewPuzzleSettingsOptions(): ReactElement {
  const { locale, newPuzzle } = useRootStore();
  const { t } = locale;

  return (
    <Collapsible.Root open={newPuzzle.optionsOpen} onOpenChange={newPuzzle.toggleOptions}>
      <RoomNewPuzzleSettingsOptionsTrigger>
        {t('newPuzzle.options.toggle')}
        <ChevronDownIcon />
      </RoomNewPuzzleSettingsOptionsTrigger>
      <RoomNewPuzzleSettingsOptionsContent>
        <RoomNewPuzzleSettingsOptionsChoice
          label={t('newPuzzle.options.shape')}
          value={newPuzzle.shape}
          choices={newPuzzle.shapeChoices}
          onChange={newPuzzle.syncShape}
        />
        <RoomNewPuzzleSettingsOptionsChoice
          label={t('newPuzzle.options.snap')}
          value={newPuzzle.snap}
          choices={newPuzzle.snapChoices}
          onChange={newPuzzle.syncSnap}
        />
      </RoomNewPuzzleSettingsOptionsContent>
    </Collapsible.Root>
  );
});
