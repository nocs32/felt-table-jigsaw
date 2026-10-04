import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import {
  RoomNewPuzzlePickerGrid,
  RoomNewPuzzlePickerMessage,
  RoomNewPuzzlePickerTile,
  RoomNewPuzzlePickerTileCaption,
  RoomNewPuzzlePickerTileImage,
} from './styled-components';

// The built-in pictures, painted in the browser: they work with no network or API key.
export const RoomNewPuzzlePickerSamples = observer(function RoomNewPuzzlePickerSamples(): ReactElement {
  const { locale, newPuzzle } = useRootStore();

  return (
    <>
      <RoomNewPuzzlePickerMessage>{locale.t('newPuzzle.samples.hint')}</RoomNewPuzzlePickerMessage>
      <RoomNewPuzzlePickerGrid>
        {newPuzzle.samplePicks.map((sample) => (
          <RoomNewPuzzlePickerTile
            key={sample.key}
            type="button"
            data-tile
            chosen={newPuzzle.isSampleChosen(sample)}
            aria-pressed={newPuzzle.isSampleChosen(sample)}
            onClick={() => newPuzzle.choose(sample)}
          >
            <RoomNewPuzzlePickerTileImage src={sample.src} alt="" draggable={false} />
            <RoomNewPuzzlePickerTileCaption always>{sample.alt}</RoomNewPuzzlePickerTileCaption>
          </RoomNewPuzzlePickerTile>
        ))}
      </RoomNewPuzzlePickerGrid>
    </>
  );
});
