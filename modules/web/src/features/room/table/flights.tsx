import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableFlightsItem } from './flights-item';
import { RoomTableFlightsRoot } from './styled-components';

// Huddle-style reactions rising from the reaction bar on everyone's screen.
export const RoomTableFlights = observer(function RoomTableFlights(): ReactElement {
  const { reactions } = useRootStore().room;

  return (
    <RoomTableFlightsRoot aria-hidden>
      {reactions.flights.map((flight) => (
        <RoomTableFlightsItem key={flight.id} flight={flight} onLand={reactions.land} />
      ))}
    </RoomTableFlightsRoot>
  );
});
