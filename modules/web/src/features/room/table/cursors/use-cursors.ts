import { useEffect, useRef, type RefObject } from 'react';
import type { RoomCursorsStore } from '../../../../stores/room/cursors';
import type { RoomPuzzleCameraStore } from '../../../../stores/room/puzzle/camera';

// Each frame: eases every cursor toward its latest position and places it on screen through your
// own camera, so cursors stay on the same spot of the table while you pan and zoom.
export const useRoomTableCursors = (cursors: RoomCursorsStore, camera: RoomPuzzleCameraStore): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;

    if (!root) return undefined;

    let last = performance.now();
    let frame = 0;

    const place = (now: number): void => {
      const shown = cursors.step(now - last);

      last = now;

      root.querySelectorAll<HTMLElement>('[data-cursor]').forEach((element) => {
        const point = shown.get(element.dataset.cursor ?? '');

        if (point) {
          element.style.setProperty('--cursor-x', `${camera.x + point.x * camera.zoom}px`);
          element.style.setProperty('--cursor-y', `${camera.y + point.y * camera.zoom}px`);
        }
      });

      frame = requestAnimationFrame(place);
    };

    frame = requestAnimationFrame(place);

    return () => cancelAnimationFrame(frame);
  }, [cursors, camera]);

  return ref;
};
