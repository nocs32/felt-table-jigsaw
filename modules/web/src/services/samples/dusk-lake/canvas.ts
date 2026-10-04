import { puzzleSamples } from '@felt-table/protocol';

// What every part of the Dusk Lake painting shares: its size, where the horizon and sun are,
// and two drawing helpers. The colours are the picture's own, not UI colours, so they live in
// these files rather than in the Panda tokens.

export type Paint = CanvasRenderingContext2D;

export const { width, height } = puzzleSamples.duskLake;
export const horizon = Math.round(height * 0.63);
export const sunX = width * 0.64;
export const sunY = horizon - 92;
export const fullCircle = Math.PI * 2;

export const gradient = (paint: Paint, y0: number, y1: number, stops: [number, string][]): CanvasGradient => {
  const fill = paint.createLinearGradient(0, y0, 0, y1);

  stops.forEach(([offset, color]) => fill.addColorStop(offset, color));

  return fill;
};

export const disc = (paint: Paint, x: number, y: number, radius: number, color: string): void => {
  paint.fillStyle = color;
  paint.beginPath();
  paint.arc(x, y, radius, 0, fullCircle);
  paint.fill();
};
