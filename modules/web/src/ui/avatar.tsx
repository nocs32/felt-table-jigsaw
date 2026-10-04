import type { ReactElement } from 'react';
import type { PlayerColor, PresenceStatus } from '../stores/room/types';
import { AvatarPresence, AvatarRoot } from './styled-components';

interface AvatarProps {
  initial: string;
  color: PlayerColor;
  size: 'sm' | 'md' | 'lg';
  label?: string;
  presence?: PresenceStatus;
  ring?: boolean;
}

// Slack-style rounded-square avatar in the player's colour, with an optional presence dot.
export function Avatar({ initial, color, size, label, presence, ring = false }: AvatarProps): ReactElement {
  return (
    <AvatarRoot tone={color} size={size} ring={ring} role="img" aria-label={label} title={label}>
      {initial}
      {presence && <AvatarPresence status={presence} />}
    </AvatarRoot>
  );
}
