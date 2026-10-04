import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LinkIcon, MenuIcon, PuzzleIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTopBarLink } from './link';
import { RoomTopBarPeople } from './people';
import { RoomTopBarThemeIcon } from './theme-icon';
import {
  RoomTopBarBrand,
  RoomTopBarBrandMark,
  RoomTopBarEnd,
  RoomTopBarIconButton,
  RoomTopBarRoot,
  RoomTopBarShare,
  RoomTopBarShareLabel,
  RoomTopBarStart,
} from './styled-components';

export const RoomTopBar = observer(function RoomTopBar(): ReactElement {
  const { room, ui } = useRootStore();

  return (
    <RoomTopBarRoot>
      <RoomTopBarStart>
        <RoomTopBarIconButton type="button" onlyNarrow aria-label="Open sidebar" onClick={ui.layout.toggleDrawer}>
          <MenuIcon />
        </RoomTopBarIconButton>
        <RoomTopBarBrand>
          <RoomTopBarBrandMark>
            <PuzzleIcon />
          </RoomTopBarBrandMark>
          Felt Table
        </RoomTopBarBrand>
      </RoomTopBarStart>
      <RoomTopBarLink />
      <RoomTopBarEnd>
        <RoomTopBarPeople />
        <RoomTopBarIconButton type="button" aria-label={ui.theme.label} title={ui.theme.label} onClick={ui.theme.cycle}>
          <RoomTopBarThemeIcon mode={ui.theme.mode} />
        </RoomTopBarIconButton>
        <RoomTopBarShare type="button" onClick={room.share.copy}>
          <LinkIcon />
          <RoomTopBarShareLabel>{room.share.shareLabel}</RoomTopBarShareLabel>
        </RoomTopBarShare>
      </RoomTopBarEnd>
    </RoomTopBarRoot>
  );
});
