import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { RoomNewPuzzleSettingsDifficulty } from './difficulty';
import { RoomNewPuzzleSettingsOptions } from './options';
import { RoomNewPuzzleSettingsPreview } from './preview';
import { RoomNewPuzzleSettingsRoot } from './styled-components';

// The right column: how the picture will be cut, how many pieces, and the finer options.
export const RoomNewPuzzleSettings = observer(function RoomNewPuzzleSettings(): ReactElement {
  return (
    <RoomNewPuzzleSettingsRoot>
      <RoomNewPuzzleSettingsPreview />
      <RoomNewPuzzleSettingsDifficulty />
      <RoomNewPuzzleSettingsOptions />
    </RoomNewPuzzleSettingsRoot>
  );
});
