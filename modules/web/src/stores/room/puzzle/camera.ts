import type { Point, Rect } from '@felt-table/engine';
import { makeAutoObservable } from 'mobx';
import type { BoardCamera } from '../../../services/board-painter';

export interface RoomPuzzleCameraDeps {
  // Where the pieces are, in world units. Null with no puzzle.
  content: () => Rect | null;
}

const minZoom = 0.06;
const maxZoom = 8;
const zoomStep = 1.25;
// Room around the pieces when fitting; more at the bottom for the floating toolbar.
const fitPadding = { side: 24, top: 24, bottom: 84 };

const clampZoom = (zoom: number): number => Math.min(maxZoom, Math.max(minZoom, zoom));

// Your own view of the table: pan and zoom are personal, never shared (spec §4.3). Until you move
// it, the view keeps refitting as the window changes; after that the centre stays put instead.
export class RoomPuzzleCameraStore {
  // Screen position (CSS px) of the world origin, and CSS px per world unit.
  x = 0;
  y = 0;
  zoom = 1;
  width = 0;
  height = 0;
  moved = false;
  readonly #deps: RoomPuzzleCameraDeps;

  constructor(deps: RoomPuzzleCameraDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get camera(): BoardCamera {
    return { x: this.x, y: this.y, zoom: this.zoom };
  }

  measure(width: number, height: number): void {
    if (width === this.width && height === this.height) return;

    this.x += (width - this.width) / 2;
    this.y += (height - this.height) / 2;
    this.width = width;
    this.height = height;

    if (!this.moved) {
      this.fit();
    }
  }

  // Everything in view, as big as fits.
  fit(): void {
    const box = this.#deps.content();
    const areaWidth = this.width - fitPadding.side * 2;
    const areaHeight = this.height - fitPadding.top - fitPadding.bottom;

    if (!box || areaWidth <= 0 || areaHeight <= 0 || box.width <= 0 || box.height <= 0) return;

    this.zoom = clampZoom(Math.min(areaWidth / box.width, areaHeight / box.height));
    this.x = fitPadding.side + (areaWidth - box.width * this.zoom) / 2 - box.x * this.zoom;
    this.y = fitPadding.top + (areaHeight - box.height * this.zoom) / 2 - box.y * this.zoom;
    this.moved = false;
  }

  // A new puzzle: fit it as soon as there's something to fit.
  reset(): void {
    this.moved = false;
    this.fit();
  }

  panBy(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
    this.moved = true;
  }

  // Zooms by `factor`, keeping the world point under (screenX, screenY) where it is.
  zoomAt(screenX: number, screenY: number, factor: number): void {
    const world = this.toWorld(screenX, screenY);

    this.zoom = clampZoom(this.zoom * factor);
    this.x = screenX - world.x * this.zoom;
    this.y = screenY - world.y * this.zoom;
    this.moved = true;
  }

  zoomIn(): void {
    this.zoomAt(this.width / 2, this.height / 2, zoomStep);
  }

  zoomOut(): void {
    this.zoomAt(this.width / 2, this.height / 2, 1 / zoomStep);
  }

  toWorld(screenX: number, screenY: number): Point {
    return { x: (screenX - this.x) / this.zoom, y: (screenY - this.y) / this.zoom };
  }
}
