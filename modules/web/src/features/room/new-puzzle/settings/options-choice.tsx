import { SegmentGroup } from '@ark-ui/react/segment-group';
import type { ReactElement } from 'react';
import type { NewPuzzleChoice } from '../../../../stores/new-puzzle';
import {
  RoomNewPuzzleSettingsOptionsChoiceItem,
  RoomNewPuzzleSettingsOptionsChoiceItems,
  RoomNewPuzzleSettingsOptionsChoiceLabel,
  RoomNewPuzzleSettingsOptionsChoiceRoot,
} from './styled-components';

interface RoomNewPuzzleSettingsOptionsChoiceProps {
  label: string;
  value: string;
  choices: NewPuzzleChoice[];
  onChange: (details: { value: string | null }) => void;
}

// One of a few options side by side (Wild | Classic).
export function RoomNewPuzzleSettingsOptionsChoice({ label, value, choices, onChange }: RoomNewPuzzleSettingsOptionsChoiceProps): ReactElement {
  return (
    <RoomNewPuzzleSettingsOptionsChoiceRoot value={value} onValueChange={onChange}>
      <RoomNewPuzzleSettingsOptionsChoiceLabel>{label}</RoomNewPuzzleSettingsOptionsChoiceLabel>
      <RoomNewPuzzleSettingsOptionsChoiceItems>
        {choices.map((choice) => (
          <RoomNewPuzzleSettingsOptionsChoiceItem key={choice.value} value={choice.value}>
            <SegmentGroup.ItemText>{choice.label}</SegmentGroup.ItemText>
            <SegmentGroup.ItemControl />
            <SegmentGroup.ItemHiddenInput />
          </RoomNewPuzzleSettingsOptionsChoiceItem>
        ))}
      </RoomNewPuzzleSettingsOptionsChoiceItems>
    </RoomNewPuzzleSettingsOptionsChoiceRoot>
  );
}
