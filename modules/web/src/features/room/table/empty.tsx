import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { PuzzleIcon, SparklesIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Button } from '../../../ui';
import { RoomTableEmptyCard, RoomTableEmptyIcon, RoomTableEmptyRoot, RoomTableEmptyText, RoomTableEmptyTitle } from './styled-components';

export const RoomTableEmpty = observer(function RoomTableEmpty(): ReactElement {
  const { locale, newPuzzle } = useRootStore();

  return (
    <RoomTableEmptyRoot>
      <RoomTableEmptyCard>
        <RoomTableEmptyIcon>
          <PuzzleIcon />
        </RoomTableEmptyIcon>
        <RoomTableEmptyTitle>{locale.t('empty.title')}</RoomTableEmptyTitle>
        <RoomTableEmptyText>{locale.t('empty.text')}</RoomTableEmptyText>
        <Button type="button" tone="primary" onClick={newPuzzle.open}>
          <SparklesIcon />
          {locale.t('empty.newPuzzle')}
        </Button>
      </RoomTableEmptyCard>
    </RoomTableEmptyRoot>
  );
});
