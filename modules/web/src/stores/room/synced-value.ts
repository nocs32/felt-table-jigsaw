import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../services';

export type RoomSyncedValueState = 'synced' | 'pending';

export interface RoomSyncedValueDeps {
  schedule: Schedule;
}

// How long our own change shows before the server's value takes over again, if the server
// never confirms it (the change was refused, e.g. rate limited).
const settleAfterMs = 2000;

// A shared value (the table name, the surface) this browser can change ahead of the server.
// Our change shows at once; the server's value wins as soon as it matches, or after a while.
// States: synced → pending (propose) → synced (the server agrees, or time runs out).
export class RoomSyncedValueStore {
  state: RoomSyncedValueState = 'synced';
  server: string;
  proposed = '';
  readonly #schedule: Schedule;
  #cancelSettle: (() => void) | null = null;

  constructor(initial: string, { schedule }: RoomSyncedValueDeps) {
    this.server = initial;
    this.#schedule = schedule;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get value(): string {
    return this.state === 'pending' ? this.proposed : this.server;
  }

  propose(value: string): void {
    this.proposed = value;
    this.state = 'pending';
    this.#cancelSettle?.();
    this.#cancelSettle = this.#schedule(this.settle, settleAfterMs);
  }

  receive(value: string): void {
    this.server = value;

    if (this.state === 'pending' && value === this.proposed) {
      this.settle();
    }
  }

  settle(): void {
    this.#cancelSettle?.();
    this.#cancelSettle = null;
    this.state = 'synced';
  }
}
