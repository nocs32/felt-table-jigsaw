import type { ReactElement } from 'react';
import type { Flight } from '../../../stores/room/reactions';
import { RoomTableFlightsName, RoomTableFlightsRise, RoomTableFlightsSway } from './styled-components';

interface RoomTableFlightsItemProps {
  flight: Flight;
  onLand: (id: string) => void;
}

export function RoomTableFlightsItem({ flight, onLand }: RoomTableFlightsItemProps): ReactElement {
  return (
    <RoomTableFlightsRise lane={flight.lane} onAnimationEnd={() => onLand(flight.id)}>
      <RoomTableFlightsSway sway={flight.sway}>
        {flight.emoji}
        {flight.sender && <RoomTableFlightsName>{flight.sender}</RoomTableFlightsName>}
      </RoomTableFlightsSway>
    </RoomTableFlightsRise>
  );
}
