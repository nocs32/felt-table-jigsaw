import { reaction } from 'mobx';
import { useEffect, useRef, type RefObject } from 'react';
import { paintBoard, type BoardSize } from '../../../services/board-painter';
import { createPlayerPalette } from '../../../services/player-palette';
import type { RoomPuzzleStore } from '../../../stores/room/puzzle';
import type { RoomPuzzlePointerStore } from '../../../stores/room/puzzle/pointer';

// Mouse buttons used on the table: left picks pieces up (or pans on the felt), middle always pans.
const leftButton = 0;
const middleButton = 1;

// Passes pointer gestures on the canvas to the store, in CSS px within the canvas.
const listenToPointers = (canvas: HTMLCanvasElement, pointer: RoomPuzzlePointerStore): (() => void) => {
  const local = (event: MouseEvent): { x: number; y: number } => {
    const box = canvas.getBoundingClientRect();

    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };

  const down = (event: PointerEvent): void => {
    const isMouse = event.pointerType === 'mouse';

    if (isMouse && event.button !== leftButton && event.button !== middleButton) return;

    // Keeps the moves coming while the pointer is outside the canvas. It throws for a pointer the
    // browser no longer counts as active, which must not stop the press.
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Dragging still works inside the canvas.
    }

    pointer.down(event.pointerId, local(event).x, local(event).y, !isMouse || event.button === leftButton);
  };

  const move = (event: PointerEvent): void => pointer.move(event.pointerId, local(event).x, local(event).y);

  const up = (event: PointerEvent): void => {
    pointer.up(event.pointerId);

    // A lifted finger isn't on the table any more; a mouse still is.
    if (event.pointerType !== 'mouse') pointer.leave();
  };

  const wheel = (event: WheelEvent): void => {
    event.preventDefault();
    pointer.wheel({ ...local(event), deltaY: event.deltaY, deltaMode: event.deltaMode, ctrlKey: event.ctrlKey });
  };

  const listeners: [string, EventListener][] = [
    ['pointerdown', down as EventListener],
    ['pointermove', move as EventListener],
    ['pointerup', up as EventListener],
    ['pointercancel', up as EventListener],
    ['pointerleave', pointer.leave],
  ];

  listeners.forEach(([type, listener]) => canvas.addEventListener(type, listener));
  canvas.addEventListener('wheel', wheel, { passive: false });

  return () => {
    listeners.forEach(([type, listener]) => canvas.removeEventListener(type, listener));
    canvas.removeEventListener('wheel', wheel);
  };
};

// The table canvas: sized to its box at the screen's pixel ratio, redrawn on the next frame
// whenever what it shows changes (pieces, art, your view), and frame after frame while a snap glows.
export const useRoomTableBoard = (puzzle: RoomPuzzleStore): RefObject<HTMLCanvasElement | null> => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const paint = canvas?.getContext('2d');

    if (!canvas || !paint) return undefined;

    const size: BoardSize = { width: 0, height: 0, pixelRatio: 1, palette: createPlayerPalette() };
    let frame = 0;

    const redraw = (): void => {
      frame ||= requestAnimationFrame(() => {
        frame = 0;

        if (paintBoard(paint, puzzle.scene, size, Date.now())) redraw();
      });
    };

    const resize = (): void => {
      Object.assign(size, { width: canvas.clientWidth, height: canvas.clientHeight, pixelRatio: puzzle.pixelRatio() });
      canvas.width = Math.max(1, Math.round(size.width * size.pixelRatio));
      canvas.height = Math.max(1, Math.round(size.height * size.pixelRatio));
      puzzle.camera.measure(size.width, size.height);
      redraw();
    };

    const observer = new ResizeObserver(resize);
    const stopDrawing = reaction(() => puzzle.scene, redraw);
    const stopPointers = listenToPointers(canvas, puzzle.pointer);

    resize();
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      stopDrawing();
      stopPointers();
      cancelAnimationFrame(frame);
    };
  }, [puzzle]);

  return ref;
};
