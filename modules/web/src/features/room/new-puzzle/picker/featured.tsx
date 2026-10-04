import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomNewPuzzlePickerPhotos } from './photos';
import { RoomNewPuzzlePickerChip, RoomNewPuzzlePickerChips, RoomNewPuzzlePickerStatus } from './styled-components';

// Our picks and Unsplash's topics, as chips over the photos.
export const RoomNewPuzzlePickerFeatured = observer(function RoomNewPuzzlePickerFeatured(): ReactElement {
  const { locale, newPuzzle } = useRootStore();
  const { unsplash } = newPuzzle;

  if (unsplash.notice) return <RoomNewPuzzlePickerStatus>{unsplash.notice}</RoomNewPuzzlePickerStatus>;

  return (
    <>
      <RoomNewPuzzlePickerChips role="group" aria-label={locale.t('newPuzzle.topics.label')}>
        {unsplash.chips.map((chip) => (
          <RoomNewPuzzlePickerChip
            key={chip.key}
            type="button"
            active={chip.isActive}
            aria-pressed={chip.isActive}
            onClick={() => unsplash.showChip(chip.key)}
          >
            {chip.label}
          </RoomNewPuzzlePickerChip>
        ))}
      </RoomNewPuzzlePickerChips>
      <RoomNewPuzzlePickerPhotos list={unsplash.featured} />
    </>
  );
});
