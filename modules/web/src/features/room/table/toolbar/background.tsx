import { Popover } from '@ark-ui/react/popover';
import { Portal } from '@ark-ui/react/portal';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { DicesIcon, PaletteIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import {
  RoomTableToolbarBackgroundHint,
  RoomTableToolbarBackgroundSurprise,
  RoomTableToolbarBackgroundTitle,
  RoomTableToolbarButton,
  RoomTableToolbarPopover,
} from './styled-components';
import { RoomTableToolbarSwatches } from './swatches';

// The shared table surface: everyone sees what anyone picks.
export const RoomTableToolbarBackground = observer(function RoomTableToolbarBackground(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <Popover.Root positioning={{ placement: 'top', gutter: 12 }} lazyMount>
      <Popover.Trigger asChild>
        <RoomTableToolbarButton type="button" aria-label={locale.t('toolbar.table')} title={locale.t('toolbar.table')}>
          <PaletteIcon />
        </RoomTableToolbarButton>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <RoomTableToolbarPopover padded>
            <RoomTableToolbarBackgroundTitle>{locale.t('table.title')}</RoomTableToolbarBackgroundTitle>
            <RoomTableToolbarBackgroundHint>{locale.t('table.hint')}</RoomTableToolbarBackgroundHint>
            <RoomTableToolbarSwatches />
            <RoomTableToolbarBackgroundSurprise type="button" onClick={room.background.surprise}>
              <DicesIcon />
              {locale.t('table.surprise')}
            </RoomTableToolbarBackgroundSurprise>
          </RoomTableToolbarPopover>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
});
