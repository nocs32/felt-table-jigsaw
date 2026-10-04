import type { UnsplashPhoto } from '@felt-table/protocol';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomNewPuzzlePickerTile, RoomNewPuzzlePickerTileCaption, RoomNewPuzzlePickerTileImage } from './styled-components';

interface RoomNewPuzzlePickerPhotosItemProps {
  photo: UnsplashPhoto;
}

// One photo: click to pick it. Hovering credits the photographer, as Unsplash asks.
export const RoomNewPuzzlePickerPhotosItem = observer(function RoomNewPuzzlePickerPhotosItem({
  photo,
}: RoomNewPuzzlePickerPhotosItemProps): ReactElement {
  const { locale, newPuzzle } = useRootStore();
  const chosen = newPuzzle.isPhotoChosen(photo);
  const credit = locale.t('newPuzzle.photos.photoBy', { name: photo.author.name });

  return (
    <RoomNewPuzzlePickerTile type="button" data-tile chosen={chosen} aria-pressed={chosen} title={credit} onClick={() => newPuzzle.choosePhoto(photo)}>
      <RoomNewPuzzlePickerTileImage src={photo.thumbUrl} alt={photo.description} loading="lazy" draggable={false} />
      <RoomNewPuzzlePickerTileCaption>{credit}</RoomNewPuzzlePickerTileCaption>
    </RoomNewPuzzlePickerTile>
  );
});
