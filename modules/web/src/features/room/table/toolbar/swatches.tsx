import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import {
  RoomTableToolbarColor,
  RoomTableToolbarColorInput,
  RoomTableToolbarSwatch,
  RoomTableToolbarSwatchesRoot,
  RoomTableToolbarSwatchSurface,
} from './styled-components';

// The surface presets plus a free colour (the rainbow tile opens the system colour picker).
export const RoomTableToolbarSwatches = observer(function RoomTableToolbarSwatches(): ReactElement {
  const { locale, room } = useRootStore();
  const { background } = room;

  return (
    <RoomTableToolbarSwatchesRoot role="radiogroup" aria-label={locale.t('table.title')}>
      {background.options.map((option) => (
        <RoomTableToolbarSwatch
          key={option.preset}
          type="button"
          role="radio"
          aria-checked={option.isSelected}
          aria-label={option.label}
          title={option.label}
          selected={option.isSelected}
          onClick={() => room.choosePreset(option.preset)}
        >
          <RoomTableToolbarSwatchSurface surface={option.preset} />
        </RoomTableToolbarSwatch>
      ))}
      <RoomTableToolbarColor selected={background.isCustom} title={locale.t('table.custom')}>
        <RoomTableToolbarColorInput
          type="color"
          aria-label={locale.t('table.custom')}
          value={background.colorValue}
          onChange={(event) => room.chooseColor(event.target.value)}
        />
      </RoomTableToolbarColor>
    </RoomTableToolbarSwatchesRoot>
  );
});
