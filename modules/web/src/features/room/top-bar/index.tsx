import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LinkIcon, LogoMark } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTopBarLink } from './link';
import { RoomTopBarPeople } from './people';
import {
  RoomTopBarBrand,
  RoomTopBarEnd,
  RoomTopBarLanguage,
  RoomTopBarRoot,
  RoomTopBarShare,
  RoomTopBarShareLabel,
  RoomTopBarStart,
} from './styled-components';

export const RoomTopBar = observer(function RoomTopBar(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <RoomTopBarRoot>
      <RoomTopBarStart>
        <RoomTopBarBrand>
          <LogoMark />
          Felt Table
        </RoomTopBarBrand>
      </RoomTopBarStart>
      <RoomTopBarLink />
      <RoomTopBarEnd>
        <RoomTopBarPeople />
        <RoomTopBarLanguage type="button" aria-label={locale.toggleLabel} title={locale.toggleLabel} onClick={locale.toggle}>
          {locale.code}
        </RoomTopBarLanguage>
        <RoomTopBarShare type="button" onClick={room.share.copy}>
          <LinkIcon />
          <RoomTopBarShareLabel>{room.share.shareLabel}</RoomTopBarShareLabel>
        </RoomTopBarShare>
      </RoomTopBarEnd>
    </RoomTopBarRoot>
  );
});
