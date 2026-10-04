import type { CutPiece, PuzzleCut } from '@felt-table/engine';
import type { PieceArt, PieceArtService, PieceSprite } from './types';

// Pre-draws every piece once, so the table only copies images each frame: the picture clipped to
// the piece's outline with a raised edge, and a soft shadow (ported from the prototype). Sizes are
// in world units (the picture's long edge is 1000); a sprite's x, y is relative to the piece's home.

type Surface = OffscreenCanvas | HTMLCanvasElement;
type Paint = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

interface ArtScale {
  // Pixels per world unit in the piece images, the shadow images and the scaled picture.
  piece: number;
  shadow: number;
  source: number;
  edge: number;
  outline: number;
  blur: number;
}

// Work in slices this long, then let the page breathe (and show progress).
const sliceMs = 12;
// All piece images together stay under about this many pixels.
const pixelBudget = 16e6;

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));

const createSurface = (width: number, height: number): { surface: Surface; paint: Paint } => {
  const surface: Surface = typeof OffscreenCanvas === 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(width, height);

  surface.width = Math.max(1, width);
  surface.height = Math.max(1, height);

  const paint = surface.getContext('2d') as Paint | null;

  if (!paint) throw new Error('This browser has no 2D canvas.');

  return { surface, paint };
};

/** The piece's outline as a path, relative to its home. */
export const piecePath = (piece: CutPiece): Path2D => {
  const path = new Path2D();
  const [start, ...rest] = piece.outline;

  path.moveTo(start?.x ?? 0, start?.y ?? 0);

  for (let k = 0; k + 2 < rest.length; k += 3) {
    const [a, b, c] = [rest[k], rest[k + 1], rest[k + 2]];

    if (a && b && c) path.bezierCurveTo(a.x, a.y, b.x, b.y, c.x, c.y);
  }

  path.closePath();

  return path;
};

const artScale = (cut: PuzzleCut, pixelRatio: number): ArtScale => {
  const size = cut.pieceSize;
  const biggest = Math.max(...cut.pieces.map((piece) => Math.max(piece.bounds.width, piece.bounds.height))) + 8;
  const sharp = Math.min(3, Math.max(1, 130 / size)) * pixelRatio;
  const piece = Math.max(0.6, Math.min(sharp, 4, Math.sqrt(pixelBudget / cut.pieces.length) / biggest));

  return {
    piece,
    shadow: clamp(piece / 2, 0.4, 1.5),
    source: Math.min(piece, 4096 / Math.max(cut.width, cut.height)),
    edge: clamp(size * 0.026, 1.1, 3.2),
    outline: Math.max(0.7, size * 0.011),
    blur: Math.max(2, size * 0.07),
  };
};

// The picture stretched over the cut's world size, at the source scale.
const scaledPicture = (cut: PuzzleCut, image: CanvasImageSource, scale: number): Surface => {
  const { surface, paint } = createSurface(Math.round(cut.width * scale), Math.round(cut.height * scale));

  paint.imageSmoothingQuality = 'high';
  paint.drawImage(image, 0, 0, surface.width, surface.height);

  return surface;
};

// A raised edge: light on the top left, dark on the bottom right, then a thin outline.
const paintEdge = (paint: Paint, path: Path2D, scale: ArtScale): void => {
  paint.lineJoin = 'round';
  paint.lineWidth = scale.edge * 2;
  paint.translate(scale.edge * 0.5, scale.edge * 0.5);
  paint.strokeStyle = 'rgba(255,255,255,.28)';
  paint.stroke(path);
  paint.translate(-scale.edge, -scale.edge);
  paint.strokeStyle = 'rgba(0,0,0,.36)';
  paint.stroke(path);
  paint.translate(scale.edge * 0.5, scale.edge * 0.5);
  paint.lineWidth = scale.outline * 2;
  paint.strokeStyle = 'rgba(0,0,0,.42)';
  paint.stroke(path);
};

const paintPiece = (cut: PuzzleCut, piece: CutPiece, path: Path2D, picture: Surface, scale: ArtScale): Pick<PieceSprite, 'image' | 'x' | 'y' | 'width' | 'height'> => {
  const { bounds, home } = piece;
  const pad = scale.edge + 2;
  const { surface, paint } = createSurface(Math.ceil((bounds.width + pad * 2) * scale.piece), Math.ceil((bounds.height + pad * 2) * scale.piece));
  const x0 = Math.max(0, home.x + bounds.x - pad);
  const y0 = Math.max(0, home.y + bounds.y - pad);
  const x1 = Math.min(cut.width, home.x + bounds.x + bounds.width + pad);
  const y1 = Math.min(cut.height, home.y + bounds.y + bounds.height + pad);
  const s = scale.source;

  paint.setTransform(scale.piece, 0, 0, scale.piece, (pad - bounds.x) * scale.piece, (pad - bounds.y) * scale.piece);
  paint.save();
  paint.clip(path);

  if (x1 > x0 && y1 > y0) {
    paint.drawImage(picture, x0 * s, y0 * s, (x1 - x0) * s, (y1 - y0) * s, x0 - home.x, y0 - home.y, x1 - x0, y1 - y0);
  }

  paintEdge(paint, path, scale);
  paint.restore();

  return { image: surface, x: bounds.x - pad, y: bounds.y - pad, width: surface.width / scale.piece, height: surface.height / scale.piece };
};

// The shape filled far off to the side, so only its blurred shadow lands on the image.
const paintShadow = (piece: CutPiece, path: Path2D, scale: ArtScale): Pick<PieceSprite, 'shadow' | 'shadowX' | 'shadowY' | 'shadowWidth' | 'shadowHeight'> => {
  const { bounds } = piece;
  const pad = scale.blur * 2 + 2;
  const s = scale.shadow;
  const { surface, paint } = createSurface(Math.ceil((bounds.width + pad * 2) * s), Math.ceil((bounds.height + pad * 2) * s));

  paint.setTransform(s, 0, 0, s, (pad - bounds.x) * s, (pad - bounds.y) * s);
  paint.shadowColor = 'rgba(0,0,0,.62)';
  paint.shadowBlur = scale.blur * s;
  paint.shadowOffsetX = 20000 * s;
  paint.translate(-20000, 0);
  paint.fill(path);

  return { shadow: surface, shadowX: bounds.x - pad, shadowY: bounds.y - pad, shadowWidth: surface.width / s, shadowHeight: surface.height / s };
};

const spriteOf = (cut: PuzzleCut, piece: CutPiece, picture: Surface, scale: ArtScale): PieceSprite => {
  const path = piecePath(piece);

  return { path, ...paintPiece(cut, piece, path, picture, scale), ...paintShadow(piece, path, scale) };
};

export const createPieceArt = (): PieceArtService => ({
  prepare: (cut, image, pixelRatio, onProgress) => {
    let cancelled = false;

    const promise = new Promise<PieceArt>((resolve) => {
      const scale = artScale(cut, pixelRatio);
      const picture = scaledPicture(cut, image, scale.source);
      const sprites: PieceSprite[] = [];

      const work = (): void => {
        if (cancelled) return;

        const until = performance.now() + sliceMs;

        for (let piece = cut.pieces[sprites.length]; piece && performance.now() < until; piece = cut.pieces[sprites.length]) {
          sprites.push(spriteOf(cut, piece, picture, scale));
        }

        onProgress(sprites.length);

        if (sprites.length === cut.pieces.length) resolve({ sprites });
        else window.setTimeout(work, 0);
      };

      work();
    });

    return { promise, cancel: () => void (cancelled = true) };
  },
});
