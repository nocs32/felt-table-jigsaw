import type { PuzzleCut } from '@felt-table/engine';
import type { PlayerColor } from '@felt-table/protocol';
import type { PieceArt } from './types';

export interface BoardCamera {
  // Screen position (CSS px) of the world origin, and CSS px per world unit.
  x: number;
  y: number;
  zoom: number;
}

export interface BoardGroup {
  id: number;
  x: number;
  y: number;
  pieces: number[];
  // Session id of whoever holds it ('' when free).
  heldBy: string;
}

// A group as drawn: yours in hand is lifted; someone else's in hand is outlined in their colour.
export interface BoardShownGroup extends BoardGroup {
  lifted: boolean;
  outline: PlayerColor | null;
}

// Pieces that just snapped together, glowing for a moment from `startedAt` (performance.now()).
export interface BoardGlow {
  pieces: number[];
  startedAt: number;
}

export interface BoardScene {
  cut: PuzzleCut;
  art: PieceArt;
  // Bottom to top.
  groups: readonly BoardShownGroup[];
  camera: BoardCamera;
  glow: BoardGlow | null;
}

export interface BoardSize {
  width: number;
  height: number;
  pixelRatio: number;
  // Real colour values for the player colours (the canvas can't read CSS tokens).
  palette: (color: PlayerColor) => string;
}

interface View {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export const glowMs = 450;

const visibleWorld = (camera: BoardCamera, size: BoardSize): View => {
  const margin = 30 / camera.zoom;
  const left = -camera.x / camera.zoom - margin;
  const top = -camera.y / camera.zoom - margin;

  return { left, top, right: left + size.width / camera.zoom + margin * 2, bottom: top + size.height / camera.zoom + margin * 2 };
};

const shownPieces = (scene: BoardScene, group: BoardGroup, view: View): number[] =>
  group.pieces.filter((id) => {
    const piece = scene.cut.pieces[id];

    if (!piece) return false;

    const x = group.x + piece.home.x + piece.bounds.x;
    const y = group.y + piece.home.y + piece.bounds.y;

    return x < view.right && x + piece.bounds.width > view.left && y < view.bottom && y + piece.bounds.height > view.top;
  });

// Strokes the outlines of some pieces of a group (held outlines, the snap glow).
const strokePieces = (paint: CanvasRenderingContext2D, scene: BoardScene, group: BoardGroup, pieces: readonly number[]): void => {
  for (const id of pieces) {
    const home = scene.cut.pieces[id]?.home;
    const sprite = scene.art.sprites[id];

    if (home && sprite) {
      paint.save();
      paint.translate(group.x + home.x, group.y + home.y);
      paint.stroke(sprite.path);
      paint.restore();
    }
  }
};

const paintGroup = (paint: CanvasRenderingContext2D, scene: BoardScene, group: BoardShownGroup, view: View): void => {
  const shown = shownPieces(scene, group, view);
  // A group in hand casts a longer shadow, as if lifted off the table.
  const lift = scene.cut.pieceSize * (group.lifted ? 0.09 : 0.025);

  for (const id of shown) {
    const sprite = scene.art.sprites[id];
    const home = scene.cut.pieces[id]?.home;

    if (sprite && home) {
      paint.drawImage(sprite.shadow, group.x + home.x + sprite.shadowX + lift, group.y + home.y + sprite.shadowY + lift * 1.5, sprite.shadowWidth, sprite.shadowHeight);
    }
  }

  for (const id of shown) {
    const sprite = scene.art.sprites[id];
    const home = scene.cut.pieces[id]?.home;

    if (sprite && home) paint.drawImage(sprite.image, group.x + home.x + sprite.x, group.y + home.y + sprite.y, sprite.width, sprite.height);
  }
};

const paintOutlines = (paint: CanvasRenderingContext2D, scene: BoardScene, size: BoardSize): void => {
  paint.lineJoin = 'round';
  paint.lineWidth = 3 / scene.camera.zoom;

  for (const group of scene.groups) {
    if (group.outline) {
      paint.strokeStyle = size.palette(group.outline);
      strokePieces(paint, scene, group, group.pieces);
    }
  }
};

// Returns whether the glow is still fading (so another frame is needed).
const paintGlow = (paint: CanvasRenderingContext2D, scene: BoardScene, now: number): boolean => {
  const { glow } = scene;
  const progress = glow ? (now - glow.startedAt) / glowMs : 1;

  if (!glow || progress >= 1) return false;

  const glowing = new Set(glow.pieces);

  paint.lineJoin = 'round';
  paint.lineWidth = 2.6 / scene.camera.zoom;
  paint.strokeStyle = `rgba(255, 236, 190, ${((1 - progress) * 0.9).toFixed(3)})`;
  scene.groups.forEach((group) => strokePieces(paint, scene, group, group.pieces.filter((id) => glowing.has(id))));

  return true;
};

// Draws one frame of the table: each group's shadow then its pieces, bottom to top, so a group on
// top casts its shadow onto the ones below; then held outlines and the snap glow. The canvas is
// see-through: the felt is the page's own. Returns whether something is still animating.
export const paintBoard = (paint: CanvasRenderingContext2D, scene: BoardScene | null, size: BoardSize, now: number): boolean => {
  const { pixelRatio: ratio } = size;

  paint.setTransform(1, 0, 0, 1, 0, 0);
  paint.clearRect(0, 0, paint.canvas.width, paint.canvas.height);

  if (!scene) return false;

  const { x, y, zoom } = scene.camera;
  const view = visibleWorld(scene.camera, size);

  paint.setTransform(ratio * zoom, 0, 0, ratio * zoom, ratio * x, ratio * y);
  paint.imageSmoothingEnabled = true;
  paint.imageSmoothingQuality = 'high';
  scene.groups.forEach((group) => paintGroup(paint, scene, group, view));
  paintOutlines(paint, scene, size);

  return paintGlow(paint, scene, now);
};
