import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { PuzzleIcon, SparklesIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { RoomTableEmptyCard, RoomTableEmptyIcon, RoomTableEmptyRoot, RoomTableEmptyText, RoomTableEmptyTitle } from './styled-components';

export const RoomTableEmpty = observer(function RoomTableEmpty(): ReactElement {
  const { dialog } = useRootStore().ui;

  return (
    <RoomTableEmptyRoot>
      <RoomTableEmptyCard>
        <RoomTableEmptyIcon>
          <PuzzleIcon />
        </RoomTableEmptyIcon>
        <RoomTableEmptyTitle>No puzzle on the table yet</RoomTableEmptyTitle>
        <RoomTableEmptyText>Pick a picture and how hard it should be. Everyone here solves it together.</RoomTableEmptyText>
        <Button type="button" tone="primary" onClick={dialog.openNewPuzzle}>
          <SparklesIcon />
          New puzzle
        </Button>
      </RoomTableEmptyCard>
    </RoomTableEmptyRoot>
  );
});
