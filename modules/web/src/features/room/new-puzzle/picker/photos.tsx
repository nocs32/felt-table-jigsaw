import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { NewPuzzlePhotosStore } from '../../../../stores/new-puzzle/photos';
import { useRootStore } from '../../../../stores/use-root-store';
import { Button } from '../../../../ui';
import { RoomNewPuzzlePickerPhotosItem } from './photos-item';
import { RoomNewPuzzlePickerGrid, RoomNewPuzzlePickerMore, RoomNewPuzzlePickerStatus } from './styled-components';
import { useRoomNewPuzzlePickerLoadMore } from './use-load-more';

interface RoomNewPuzzlePickerPhotosProps {
  list: NewPuzzlePhotosStore;
}

// A grid of Unsplash photos; the next page loads as you scroll to the end.
export const RoomNewPuzzlePickerPhotos = observer(function RoomNewPuzzlePickerPhotos({ list }: RoomNewPuzzlePickerPhotosProps): ReactElement {
  const { t } = useRootStore().locale;
  const moreRef = useRoomNewPuzzlePickerLoadMore(list);

  return (
    <>
      <RoomNewPuzzlePickerGrid>
        {list.photos.map((photo) => (
          <RoomNewPuzzlePickerPhotosItem key={photo.id} photo={photo} />
        ))}
      </RoomNewPuzzlePickerGrid>
      {list.state === 'loading' && <RoomNewPuzzlePickerStatus>{t('newPuzzle.photos.loading')}</RoomNewPuzzlePickerStatus>}
      {list.isEmpty && <RoomNewPuzzlePickerStatus>{t('newPuzzle.search.empty')}</RoomNewPuzzlePickerStatus>}
      {list.state === 'failed' && (
        <RoomNewPuzzlePickerStatus>
          {t('newPuzzle.photos.failed')}
          <Button type="button" size="sm" onClick={list.retry}>
            {t('newPuzzle.photos.retry')}
          </Button>
        </RoomNewPuzzlePickerStatus>
      )}
      <RoomNewPuzzlePickerMore ref={moreRef} />
    </>
  );
});
