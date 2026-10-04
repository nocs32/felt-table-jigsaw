import { autorun } from 'mobx';
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import type { UiWidgetsFrameStore } from '../../../stores/ui/widgets/frame';

const place = (element: HTMLElement, frame: UiWidgetsFrameStore): void => {
  const { x, y, width, height } = frame.frame;

  element.style.setProperty('--widget-x', `${x}px`);
  element.style.setProperty('--widget-y', `${y}px`);
  element.style.setProperty('--widget-width', `${width}px`);
  element.style.setProperty('--widget-height', `${height}px`);
};

// A drag ends with a click on whatever is under the pointer; this one shouldn't count
// (dragging the picture must not also open it).
const swallowNextClick = (): void => {
  const swallow = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
  };

  window.addEventListener('click', swallow, { capture: true, once: true });
  window.setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
};

// The corner handle resizes; anything marked data-widget-move moves. Returns whether a gesture began.
const begin = (frame: UiWidgetsFrameStore, event: PointerEvent): boolean => {
  if (event.button !== 0 || !(event.target instanceof Element)) return false;

  if (event.target.closest('[data-widget-resize]')) {
    event.preventDefault();
    frame.grabCorner(event.clientX, event.clientY);

    return true;
  }

  if (!event.target.closest('[data-widget-move]')) return false;

  frame.press(event.clientX, event.clientY);

  return true;
};

// Follows the pointer on the window, so a fast drag that leaves the widget keeps going.
const listenForGestures = (element: HTMLElement, frame: UiWidgetsFrameStore): (() => void) => {
  let following: AbortController | null = null;

  const end = (): void => {
    if (frame.isDragging) swallowNextClick();

    frame.release();
    following?.abort();
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (!begin(frame, event)) return;

    following = new AbortController();

    const { signal } = following;

    window.addEventListener('pointermove', (move) => frame.drag(move.clientX, move.clientY), { signal });
    window.addEventListener('pointerup', end, { signal });
    window.addEventListener('pointercancel', end, { signal });
  };

  element.addEventListener('pointerdown', onPointerDown);

  return () => {
    element.removeEventListener('pointerdown', onPointerDown);
    following?.abort();
  };
};

// Positions a floating widget from its store (CSS variables, no React renders while dragging)
// and turns pointer drags on it into store actions.
export const useRoomTableWidget = (frame: UiWidgetsFrameStore): RefObject<HTMLElement | null> => {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(
    () =>
      autorun(() => {
        if (ref.current) place(ref.current, frame);
      }),
    [frame],
  );

  useEffect(() => (ref.current ? listenForGestures(ref.current, frame) : undefined), [frame]);

  return ref;
};
