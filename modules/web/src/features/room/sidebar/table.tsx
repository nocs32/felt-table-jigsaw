import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { DicesIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomSidebarSection } from './section';
import {
  RoomSidebarColor,
  RoomSidebarColorInput,
  RoomSidebarItem,
  RoomSidebarItemLabel,
  RoomSidebarSwatch,
  RoomSidebarSwatches,
  RoomSidebarSwatchSurface,
} from './styled-components';

// The shared table surface: everyone sees what anyone picks.
export const RoomSidebarTable = observer(function RoomSidebarTable(): ReactElement {
  const { room } = useRootStore();
  const { background } = room;

  return (
    <RoomSidebarSection title="Table">
      <RoomSidebarSwatches role="radiogroup" aria-label="Table surface">
        {background.options.map((option) => (
          <RoomSidebarSwatch
            key={option.preset}
            type="button"
            role="radio"
            aria-checked={option.isSelected}
            aria-label={option.label}
            title={option.label}
            selected={option.isSelected}
            onClick={() => room.choosePreset(option.preset)}
          >
            <RoomSidebarSwatchSurface surface={option.preset} />
          </RoomSidebarSwatch>
        ))}
        <RoomSidebarColor selected={background.isCustom} title="Custom colour">
          <RoomSidebarColorInput
            type="color"
            aria-label="Custom table colour"
            value={background.colorValue}
            onChange={(event) => room.chooseColor(event.target.value)}
          />
        </RoomSidebarColor>
      </RoomSidebarSwatches>
      <RoomSidebarItem type="button" onClick={room.surpriseBackground}>
        <DicesIcon />
        <RoomSidebarItemLabel>Surprise everyone</RoomSidebarItemLabel>
      </RoomSidebarItem>
    </RoomSidebarSection>
  );
});
