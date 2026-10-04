import { TableRoomError } from './error.js';

export type TableRoomLifecycleState = 'emptyGrace' | 'active' | 'closed';

// Runs `callback` once after `delayMs`; returns a function that cancels it.
export type Schedule = (callback: () => void, delayMs: number) => () => void;

export interface TableRoomLifecycleDeps {
  schedule: Schedule;
  graceMs: number;
  // Closes the room for good: disconnects everyone and frees it.
  close: () => void;
}

// Whether anyone is using the table. An empty table is thrown away after `graceMs`, unless
// someone joins in time. States: emptyGrace ⇄ active, emptyGrace → closed.
export class TableRoomLifecycle {
  state: TableRoomLifecycleState = 'emptyGrace';
  readonly #deps: TableRoomLifecycleDeps;
  #cancelExpiry: (() => void) | null = null;

  constructor(deps: TableRoomLifecycleDeps) {
    this.#deps = deps;
  }

  // The table was just created and nobody is at it yet: start the clock.
  open(): void {
    if (this.state === 'emptyGrace' && this.#cancelExpiry === null) {
      this.#armExpiry();
    }
  }

  join(): void {
    if (this.state === 'closed') {
      throw new TableRoomError('ROOM_CLOSED');
    }

    this.#disarmExpiry();
    this.state = 'active';
  }

  // `remaining` counts everyone still at the table, including seats held for reconnecting people.
  leave(remaining: number): void {
    if (this.state !== 'active' || remaining > 0) return;

    this.state = 'emptyGrace';
    this.#armExpiry();
  }

  expire(): void {
    if (this.state !== 'emptyGrace') return;

    this.#disarmExpiry();
    this.state = 'closed';
    this.#deps.close();
  }

  dispose(): void {
    this.#disarmExpiry();
  }

  #armExpiry(): void {
    this.#disarmExpiry();
    this.#cancelExpiry = this.#deps.schedule(() => this.expire(), this.#deps.graceMs);
  }

  #disarmExpiry(): void {
    this.#cancelExpiry?.();
    this.#cancelExpiry = null;
  }
}
