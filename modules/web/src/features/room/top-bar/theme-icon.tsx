import type { ReactElement } from 'react';
import { MonitorIcon, MoonIcon, SunIcon } from '../../../assets';
import type { ThemeMode } from '../../../stores/ui/theme';

interface RoomTopBarThemeIconProps {
  mode: ThemeMode;
}

export function RoomTopBarThemeIcon({ mode }: RoomTopBarThemeIconProps): ReactElement {
  return (
    <>
      {mode === 'system' && <MonitorIcon />}
      {mode === 'light' && <SunIcon />}
      {mode === 'dark' && <MoonIcon />}
    </>
  );
}
