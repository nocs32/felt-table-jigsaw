import type { Point } from '@felt-table/engine';
import { makeAutoObservable } from 'mobx';
import type { BoardGroup } from '../../../services/board-painter';
import type { RoomPuzzleCameraStore } from './camera';
import type { RoomPuzzleDragStore } from './drag';

// idle → dragging (pressed on a free piece) | panning (pressed on the felt, or with the middle
// button) ⇄ pinching (two fingers) → idle. A press on a piece someone else holds does nothing.
export type RoomPuzzlePointerState = 'idle' | 'panning' | 'pinching' | 'dragging';

// What's under the pointer, for its look: the felt, a piece to pick up, or one someone holds.
export type RoomPuzzlePointerHover = 'felt' | 'piece' | 'held';

export interface RoomPuzzlePointerPick {
  group: BoardGroup;
  heldByOther: boolean;
}

export interface RoomPuzzlePointerDeps {
  camera: RoomPuzzleCameraStore;
  drag: RoomPuzzleDragStore;
  // The top group under a table point, if any.
  pick: (point: Point) => RoomPuzzlePointerPick | null;
  // Where our pointer is on the table, for everyone else (null: it left the table).
  track: (point: Point | null) => void;
}

export interface RoomPuzzlePointerWheel {
  x: number;
  y: number;
  deltaY: number;
  // 0: pixels, 1: lines, 2: pages (WheelEvent.deltaMode).
  deltaMode: number;
  // Trackpad pinches arrive as wheel events with the control key.
  ctrlKey: boolean;
}

interface ScreenPoint {
  x: number;
  y: number;
}

const lineHeight = 16;

const middle = (a: ScreenPoint, b: ScreenPoint): ScreenPoint => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

const distance = (a: ScreenPoint, b: ScreenPoint): number => Math.hypot(a.x - b.x, a.y - b.y) || 1;

// Turns pointer gestures on the table into picking up pieces and camera moves. Points are CSS px
// within the table.
export class RoomPuzzlePointerStore {
  state: RoomPuzzlePointerState = 'idle';
  hover: RoomPuzzlePointerHover = 'felt';
  readonly #deps: RoomPuzzlePointerDeps;
  readonly #pointers = new Map<number, ScreenPoint>();
  #dragPointer = -1;

  constructor(deps: RoomPuzzlePointerDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get cursor(): 'default' | 'grab' | 'grabbing' | 'notAllowed' {
    if (this.state !== 'idle') return 'grabbing';

    if (this.hover === 'held') return 'notAllowed';

    return this.hover === 'piece' ? 'grab' : 'default';
  }

  // `canPick`: a primary press (left button, finger or pen); the middle button always pans.
  down(id: number, x: number, y: number, canPick: boolean): void {
    if (this.#pointers.size >= 2 || this.state === 'dragging') return;

    this.#pointers.set(id, { x, y });

    if (this.#pointers.size === 2) {
      this.state = 'pinching';

      return;
    }

    const world = this.#deps.camera.toWorld(x, y);
    const hit = canPick ? this.#deps.pick(world) : null;

    if (hit?.heldByOther) {
      this.#pointers.delete(id);
    } else if (hit) {
      this.#deps.drag.grab(hit.group, world);
      this.#dragPointer = id;
      this.state = 'dragging';
    } else {
      this.state = 'panning';
    }
  }

  move(id: number, x: number, y: number): void {
    const world = this.#deps.camera.toWorld(x, y);

    this.#deps.track(world);

    if (!this.#pointers.has(id)) {
      this.#hoverAt(world);

      return;
    }

    if (this.state === 'dragging') {
      if (id === this.#dragPointer) this.#deps.drag.move(world);

      return;
    }

    this.#gesture(id, { x, y });
  }

  up(id: number): void {
    if (!this.#pointers.delete(id)) return;

    if (this.state === 'dragging' && id === this.#dragPointer) {
      this.#deps.drag.drop();
      this.state = 'idle';
    } else {
      this.state = this.#pointers.size === 0 ? 'idle' : 'panning';
    }
  }

  // The pointer left the table (or a finger lifted).
  leave(): void {
    this.hover = 'felt';
    this.#deps.track(null);
  }

  wheel(event: RoomPuzzlePointerWheel): void {
    const scale = event.deltaMode === 1 ? lineHeight : event.deltaMode === 2 ? this.#deps.camera.height : 1;

    this.#deps.camera.zoomAt(event.x, event.y, Math.exp(-event.deltaY * scale * (event.ctrlKey ? 0.01 : 0.0016)));
  }

  #hoverAt(world: Point): void {
    const hit = this.#deps.pick(world);

    this.hover = hit === null ? 'felt' : hit.heldByOther ? 'held' : 'piece';
  }

  // Panning with one pointer, or zooming and panning with two.
  #gesture(id: number, point: ScreenPoint): void {
    const [a, b] = [...this.#pointers.values()];

    this.#pointers.set(id, point);

    const [c, d] = [...this.#pointers.values()];
    const { camera } = this.#deps;

    if (this.state === 'pinching' && a && b && c && d) {
      camera.zoomAt(middle(a, b).x, middle(a, b).y, distance(c, d) / distance(a, b));
      camera.panBy(middle(c, d).x - middle(a, b).x, middle(c, d).y - middle(a, b).y);
    } else if (this.state === 'panning' && a && c) {
      camera.panBy(c.x - a.x, c.y - a.y);
    }
  }
}
