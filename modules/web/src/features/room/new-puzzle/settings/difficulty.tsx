import { Slider } from '@ark-ui/react/slider';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import {
  RoomNewPuzzleSettingsDifficultyBand,
  RoomNewPuzzleSettingsDifficultyControl,
  RoomNewPuzzleSettingsDifficultyLabel,
  RoomNewPuzzleSettingsDifficultyMarker,
  RoomNewPuzzleSettingsDifficultyMarkers,
  RoomNewPuzzleSettingsDifficultyRange,
  RoomNewPuzzleSettingsDifficultyReadout,
  RoomNewPuzzleSettingsDifficultyRoot,
  RoomNewPuzzleSettingsDifficultyThumb,
  RoomNewPuzzleSettingsDifficultyTrack,
  RoomNewPuzzleSettingsRow,
} from './styled-components';

// How many pieces: 14 stops from 12 to 500, with the difficulty bands under the track.
export const RoomNewPuzzleSettingsDifficulty = observer(function RoomNewPuzzleSettingsDifficulty(): ReactElement {
  const { locale, newPuzzle } = useRootStore();

  return (
    <RoomNewPuzzleSettingsDifficultyRoot
      min={0}
      max={newPuzzle.pieceStops}
      step={1}
      value={[newPuzzle.pieceIndex]}
      onValueChange={newPuzzle.syncPieces}
      getAriaValueText={() => newPuzzle.readout}
    >
      <RoomNewPuzzleSettingsRow>
        <RoomNewPuzzleSettingsDifficultyLabel>{locale.t('newPuzzle.difficulty.label')}</RoomNewPuzzleSettingsDifficultyLabel>
        <RoomNewPuzzleSettingsDifficultyBand>{newPuzzle.difficulty}</RoomNewPuzzleSettingsDifficultyBand>
      </RoomNewPuzzleSettingsRow>
      <RoomNewPuzzleSettingsDifficultyControl>
        <RoomNewPuzzleSettingsDifficultyTrack>
          <RoomNewPuzzleSettingsDifficultyRange />
        </RoomNewPuzzleSettingsDifficultyTrack>
        <RoomNewPuzzleSettingsDifficultyThumb index={0}>
          <Slider.HiddenInput />
        </RoomNewPuzzleSettingsDifficultyThumb>
      </RoomNewPuzzleSettingsDifficultyControl>
      <RoomNewPuzzleSettingsDifficultyMarkers>
        {newPuzzle.bands.map((band) => (
          <RoomNewPuzzleSettingsDifficultyMarker key={band.index} value={band.index}>
            {band.label}
          </RoomNewPuzzleSettingsDifficultyMarker>
        ))}
      </RoomNewPuzzleSettingsDifficultyMarkers>
      <RoomNewPuzzleSettingsDifficultyReadout>{newPuzzle.readout}</RoomNewPuzzleSettingsDifficultyReadout>
    </RoomNewPuzzleSettingsDifficultyRoot>
  );
});
