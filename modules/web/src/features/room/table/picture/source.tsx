import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { PictureSource } from '../../../../stores/room/types';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTablePictureCreditLink } from './styled-components';

interface RoomTablePictureSourceProps {
  source: PictureSource;
}

// Where a picture from a link came from: "From example.com", linked.
export const RoomTablePictureSource = observer(function RoomTablePictureSource({ source }: RoomTablePictureSourceProps): ReactElement {
  const { t } = useRootStore().locale;

  return (
    <span>
      {t('picture.from')}{' '}
      <RoomTablePictureCreditLink href={source.url} target="_blank" rel="noreferrer noopener">
        {source.host}
      </RoomTablePictureCreditLink>
    </span>
  );
});
