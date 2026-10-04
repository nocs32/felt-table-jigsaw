import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { SpinnerIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableLoadingCard, RoomTableLoadingRoot } from './styled-components';

// While a new puzzle is cut, its picture loads and its pieces are drawn: "Preparing pieces 240 / 500".
export const RoomTableLoading = observer(function RoomTableLoading(): ReactElement {
  const { puzzle } = useRootStore().room;

  return (
    <RoomTableLoadingRoot>
      <RoomTableLoadingCard role="status" failed={puzzle.art.state === 'failed'}>
        {puzzle.art.state !== 'failed' && <SpinnerIcon />}
        {puzzle.progress}
      </RoomTableLoadingCard>
    </RoomTableLoadingRoot>
  );
});
