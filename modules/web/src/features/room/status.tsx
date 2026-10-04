import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LogoMark, SpinnerIcon } from '../../assets';
import { useRootStore } from '../../stores/use-root-store';
import { Button } from '../../ui';
import { RoomStatusCard, RoomStatusLogo, RoomStatusRoot, RoomStatusSpinner, RoomStatusText, RoomStatusTitle } from './styled-components';

// Shown instead of the table while joining it, or when there's no table to show.
export const RoomStatus = observer(function RoomStatus(): ReactElement {
  const { connection } = useRootStore().room;

  return (
    <RoomStatusRoot>
      <RoomStatusCard aria-live="polite" aria-busy={connection.isBusy}>
        <RoomStatusLogo>
          <LogoMark />
        </RoomStatusLogo>
        <RoomStatusTitle>{connection.title}</RoomStatusTitle>
        {connection.isBusy ? (
          <RoomStatusSpinner>
            <SpinnerIcon />
          </RoomStatusSpinner>
        ) : (
          <>
            <RoomStatusText>{connection.text}</RoomStatusText>
            <Button type="button" tone="primary" onClick={connection.act}>
              {connection.actionLabel}
            </Button>
          </>
        )}
      </RoomStatusCard>
    </RoomStatusRoot>
  );
});
