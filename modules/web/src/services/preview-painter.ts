import type { PuzzleCut } from '@felt-table/engine';
import { piecePath } from './piece-art';

// The New puzzle dialog's preview: the picture fitted into the canvas, with the cut drawn over
// it the way the server will make it. Purely visual, so a cross-site picture is fine here.
export const paintPreview = (paint: CanvasRenderingContext2D, image: HTMLImageElement | null, cut: PuzzleCut | null, pixelRatio: number): void => {
  const { canvas } = paint;
  const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
  const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));

  canvas.width = width;
  canvas.height = height;
  paint.clearRect(0, 0, width, height);

  if (!cut) return;

  const scale = Math.min(width / cut.width, height / cut.height);
  const left = (width - cut.width * scale) / 2;
  const top = (height - cut.height * scale) / 2;

  if (image) paint.drawImage(image, left, top, cut.width * scale, cut.height * scale);

  paint.setTransform(scale, 0, 0, scale, left, top);
  paint.lineJoin = 'round';

  // A dark line under a light one, so the cut shows on bright and dark pictures alike.
  for (const [color, lineWidth] of [['rgba(0,0,0,.45)', 2.4], ['rgba(255,255,255,.85)', 1]] as const) {
    paint.strokeStyle = color;
    paint.lineWidth = (lineWidth * pixelRatio) / scale;

    for (const piece of cut.pieces) {
      paint.save();
      paint.translate(piece.home.x, piece.home.y);
      paint.stroke(piecePath(piece));
      paint.restore();
    }
  }

  paint.setTransform(1, 0, 0, 1, 0, 0);
};
