import { autorun } from 'mobx';
import { useEffect, useRef, type RefObject } from 'react';
import type { RoomBackgroundStore } from '../../../stores/room/background';

// A custom table colour can be any hex, so it goes in as a CSS variable through a ref.
export const useRoomTableSurface = (background: RoomBackgroundStore): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      autorun(() => {
        ref.current?.style.setProperty('--table-custom', background.colorValue);
      }),
    [background],
  );

  return ref;
};
