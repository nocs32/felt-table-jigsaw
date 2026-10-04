import { autorun } from 'mobx';
import { useEffect, useRef, type RefObject } from 'react';
import { paintPreview } from '../../../../services/preview-painter';
import type { NewPuzzleStore } from '../../../../stores/new-puzzle';

// Loads the picked picture and redraws the preview whenever the picture, the piece count, the
// shape or the seed changes, and when the canvas is resized.
export const useRoomNewPuzzleSettingsPreview = (newPuzzle: NewPuzzleStore): RefObject<HTMLCanvasElement | null> => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const paint = canvas?.getContext('2d');

    if (!canvas || !paint) return undefined;

    let image: HTMLImageElement | null = null;

    const draw = (): void => paintPreview(paint, image?.complete ? image : null, newPuzzle.previewCut, Math.min(window.devicePixelRatio || 1, 2));

    const stop = autorun(() => {
      const src = newPuzzle.pick?.src ?? '';

      if (src !== (image?.getAttribute('src') ?? '')) {
        image = new Image();
        image.onload = draw;
        image.src = src;
      }

      draw();
    });

    const observer = new ResizeObserver(draw);

    observer.observe(canvas);

    return () => {
      stop();
      observer.disconnect();
    };
  }, [newPuzzle]);

  return ref;
};
