import type { PathHitService } from './types';

// Whether a point is inside a piece's outline. Only a 2D context can answer that, so a tiny canvas
// that's never shown does the asking.
export const createPathHit = (): PathHitService => {
  const canvas = typeof OffscreenCanvas === 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(1, 1);
  const paint = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;

  return (path, x, y) => paint?.isPointInPath(path, x, y) ?? false;
};
