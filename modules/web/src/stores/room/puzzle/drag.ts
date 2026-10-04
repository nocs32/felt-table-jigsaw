import type { Point } from '@felt-table/engine';
import { tableWorldExtent, type TableErrorCode } from '@felt-table/protocol';
import { makeAutoObservable, observableRef } from 'mobx';
import type { Schedule } from '../../../services';
import { liftAt } from '../../../services/board-motion';
import type { BoardGroup } from '../../../services/board-painter';
import type { RoomConnectionStore } from '../connection';

// idle → dragging (your group follows your pointer at once, on your screen) → dropping (let go:
// still shown where you put it until the server's answer arrives) → idle. A refused grab, or a new
// puzzle, ends it straight away and the group shows where the server has it.
export type RoomPuzzleDragState = 'idle' | 'dragging' | 'dropping';

export interface RoomPuzzleDragDeps {
  send: RoomConnectionStore['send'];
  schedule: Schedule;
  now: () => number;
  sessionId: () => string;
}

// The group last let go of: how high it was and where, when it settles back onto the table, and
// when the server's answer came (it glides from there to where the server put it).
export interface RoomPuzzleDragSettle {
  groupId: number;
  height: number;
  x: number;
  y: number;
  at: number;
  answeredAt: number | null;
}

// Moves go out at most this often; the last one always goes.
const sendEveryMs = 50;
// Give up waiting for the server's answer to a drop after this long.
const dropTimeoutMs = 1000;

const ending: readonly TableErrorCode[] = ['GROUP_HELD', 'NOT_HOLDING', 'NO_SUCH_GROUP', 'NO_PUZZLE'];

const clampWorld = (value: number): number => Math.min(tableWorldExtent, Math.max(-tableWorldExtent, value));

// The group you're moving.
export class RoomPuzzleDragStore {
  state: RoomPuzzleDragState = 'idle';
  groupId = -1;
  // Where your copy of the group is (its origin, in world units).
  x = 0;
  y = 0;
  // When it was picked up, so it can rise smoothly.
  grabbedAt = 0;
  settle: RoomPuzzleDragSettle | null = null;
  readonly #deps: RoomPuzzleDragDeps;
  #offset: Point = { x: 0, y: 0 };
  // The server has said we hold it (seen in its state at least once).
  #confirmed = false;
  // Where the server had the group when we picked it up.
  #grabbedFrom: Point = { x: 0, y: 0 };
  #moved = false;
  #cancelTimer: (() => void) | null = null;

  constructor(deps: RoomPuzzleDragDeps) {
    this.#deps = deps;
    makeAutoObservable(this, { settle: observableRef }, { autoBind: true });
  }

  get isActive(): boolean {
    return this.state !== 'idle';
  }

  get isDragging(): boolean {
    return this.state === 'dragging';
  }

  // A new grab while the last drop waits for its answer is fine: that drop has already gone out.
  grab(group: BoardGroup, pointer: Point): void {
    if (this.state === 'dropping') this.end();

    if (this.state !== 'idle') return;

    this.state = 'dragging';
    this.groupId = group.id;
    this.x = group.x;
    this.y = group.y;
    this.#offset = { x: pointer.x - group.x, y: pointer.y - group.y };
    this.#confirmed = false;
    this.#grabbedFrom = { x: group.x, y: group.y };
    this.grabbedAt = this.#deps.now();
    this.#deps.send('grab', { group: group.id });
  }

  move(pointer: Point): void {
    if (this.state !== 'dragging') return;

    this.x = clampWorld(pointer.x - this.#offset.x);
    this.y = clampWorld(pointer.y - this.#offset.y);
    this.#moved = true;

    if (this.#cancelTimer === null) this.sendMove();
  }

  // Sends the latest position, then waits a little before sending again.
  sendMove(): void {
    this.#cancelTimer = null;

    if (this.state !== 'dragging' || !this.#moved) return;

    this.#moved = false;
    this.#deps.send('move', { group: this.groupId, x: this.x, y: this.y });
    this.#cancelTimer = this.#deps.schedule(this.sendMove, sendEveryMs);
  }

  drop(): void {
    if (this.state !== 'dragging') return;

    const now = this.#deps.now();

    this.#stopTimer();
    this.state = 'dropping';
    this.settle = { groupId: this.groupId, height: liftAt({ from: 0, to: 1, startedAt: this.grabbedAt }, now), x: this.x, y: this.y, at: now, answeredAt: null };
    this.#deps.send('drop', { group: this.groupId, x: this.x, y: this.y });
    this.#cancelTimer = this.#deps.schedule(this.end, dropTimeoutMs);
  }

  // The server's groups: once it has let go of ours after the drop, our copy isn't needed. A quick
  // grab and drop can both land between two updates, so we never see ourselves holding it; the
  // group having moved from where we picked it up shows the drop went through too.
  receive(groups: readonly BoardGroup[]): void {
    if (this.state === 'idle') return;

    const group = groups.find((entry) => entry.id === this.groupId);
    const ours = group?.heldBy === this.#deps.sessionId();
    const moved = group !== undefined && (group.x !== this.#grabbedFrom.x || group.y !== this.#grabbedFrom.y);

    this.#confirmed ||= ours;

    if (!group || (this.state === 'dropping' && !ours && (this.#confirmed || moved))) this.end();
  }

  refuse(code: TableErrorCode): void {
    if (ending.includes(code)) this.end();
  }

  end(): void {
    if (this.state === 'dropping' && this.settle) {
      this.settle = { ...this.settle, answeredAt: this.#deps.now() };
    }

    this.#stopTimer();
    this.state = 'idle';
    this.groupId = -1;
    this.#moved = false;
  }

  #stopTimer(): void {
    this.#cancelTimer?.();
    this.#cancelTimer = null;
  }
}
