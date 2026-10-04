import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import type { PictureCredit } from '../../../../stores/room/types';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomTablePictureCreditLink } from './styled-components';

interface RoomTablePictureCreditProps {
  credit: PictureCredit;
}

// Unsplash's required attribution: "Photo by <name> on Unsplash", both linked.
export const RoomTablePictureCredit = observer(function RoomTablePictureCredit({ credit }: RoomTablePictureCreditProps): ReactElement {
  const { t } = useRootStore().locale;

  return (
    <span>
      {t('picture.photoBy')}{' '}
      <RoomTablePictureCreditLink href={credit.profileUrl} target="_blank" rel="noreferrer">
        {credit.name}
      </RoomTablePictureCreditLink>{' '}
      {t('picture.photoOn')}{' '}
      <RoomTablePictureCreditLink href={credit.sourceUrl} target="_blank" rel="noreferrer">
        Unsplash
      </RoomTablePictureCreditLink>
    </span>
  );
});
