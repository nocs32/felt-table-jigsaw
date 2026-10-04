import type { Point } from '@felt-table/engine';
import { tableWorldExtent, type TableCursorEvent } from '@felt-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../services';
import type { RoomConnectionStore } from './connection';
import type { RoomPresenceStore } from './presence';
import type { PlayerColor } from './types';

export interface RoomCursorsDeps {
  send: RoomConnectionStore['send'];
  schedule: Schedule;
  presence: RoomPresenceStore;
}

export interface RoomCursor {
  id: string;
  name: string;
  color: PlayerColor;
}

interface CursorTrack {
  // Where it is, as last heard, and where it's drawn: the drawn one eases toward the other.
  target: Point;
  shown: Point;
}

// Our position goes out at most this often (the server passes it on to everyone else).
const sendEveryMs = 50;
// How quickly a drawn cursor catches up with the latest position (smaller is snappier).
const easeMs = 45;

const sameSpot = (a: Point | null, b: Point | null): boolean => a === b || (a !== null && b !== null && a.x === b.x && a.y === b.y);

// Everyone else's pointer on the table, like Figma: an arrow in their colour with their name.
// Which cursors exist changes rarely and is observable; where they are changes every frame, so the
// overlay reads it each frame with `step` instead of through MobX.
export class RoomCursorsStore {
  ids: string[] = [];
  readonly #deps: RoomCursorsDeps;
  readonly #tracks = new Map<string, CursorTrack>();
  // Our own pointer: what we last sent, what's waiting to go, and the send timer.
  #sent: Point | null = null;
  #latest: Point | null = null;
  #cancelTimer: (() => void) | null = null;

  constructor(deps: RoomCursorsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // The cursors to draw: only people still at the table.
  get list(): RoomCursor[] {
    return this.ids.flatMap((id) => {
      const member = this.#deps.presence.find(id);

      return member ? [{ id, name: member.name, color: member.color }] : [];
    });
  }

  receive({ sessionId, position }: TableCursorEvent): void {
    const track = this.#tracks.get(sessionId);

    if (position === null) {
      this.#tracks.delete(sessionId);
      this.ids = this.ids.filter((id) => id !== sessionId);
    } else if (track) {
      track.target = position;
    } else {
      this.#tracks.set(sessionId, { target: position, shown: position });
      this.ids = [...this.ids, sessionId];
    }
  }

  // Moves each drawn cursor part of the way to its latest position; `elapsedMs` since the last frame.
  step(elapsedMs: number): ReadonlyMap<string, Point> {
    const share = 1 - Math.exp(-elapsedMs / easeMs);
    const shown = new Map<string, Point>();

    this.#tracks.forEach((track, id) => {
      track.shown = { x: track.shown.x + (track.target.x - track.shown.x) * share, y: track.shown.y + (track.target.y - track.shown.y) * share };
      shown.set(id, track.shown);
    });

    return shown;
  }

  // Our pointer moved on the table (null: it left).
  track(point: Point | null): void {
    this.#latest = point && { x: Math.min(tableWorldExtent, Math.max(-tableWorldExtent, point.x)), y: Math.min(tableWorldExtent, Math.max(-tableWorldExtent, point.y)) };

    if (this.#cancelTimer === null) this.sendLatest();
  }

  sendLatest(): void {
    this.#cancelTimer = null;

    if (sameSpot(this.#latest, this.#sent)) return;

    this.#sent = this.#latest;
    this.#deps.send('cursor', this.#latest);
    this.#cancelTimer = this.#deps.schedule(this.sendLatest, sendEveryMs);
  }
}
