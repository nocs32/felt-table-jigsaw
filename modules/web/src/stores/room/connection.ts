import type { TableMessages, TableMessageType, TableReactionEvent } from '@felt-table/protocol';
import type { TableSnapshot } from '@felt-table/protocol/state';
import { makeAutoObservable } from 'mobx';
import type { AddressService, PreferencesService, TableClientService, TableLink, TableOpenFailure, TableOpenResult } from '../../services';
import type { Translate } from '../locale';

// idle → opening → live ⇄ reconnecting. Opening can end in a failure instead; a connection
// that ends for good while live goes back to opening (a fresh join to the same table).
export type RoomConnectionState = 'idle' | 'opening' | 'live' | 'reconnecting' | TableOpenFailure;

export interface RoomConnectionDeps {
  tableClient: TableClientService;
  address: AddressService;
  preferences: PreferencesService;
  t: Translate;
  // Every shared state change, starting with the first full state.
  receive: (snapshot: TableSnapshot) => void;
  receiveReaction: (event: TableReactionEvent) => void;
}

const failures: readonly RoomConnectionState[] = ['gone', 'full', 'outdated', 'unreachable'];

// The link to the live table on the server: joining, staying connected, and what to show
// when there's no table to show.
export class RoomConnectionStore {
  state: RoomConnectionState = 'idle';
  // The table's id, once known: from the address, or from the server for a new table.
  roomId: string | null = null;
  // Our seat at the table; it changes when a connection that ended is replaced by a new one.
  sessionId = '';
  // Messages the server refused this session (rate limits, bad input).
  refusals = 0;
  readonly #deps: RoomConnectionDeps;
  #link: TableLink | null = null;

  constructor(deps: RoomConnectionDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // The table is on screen (also while reconnecting, with a notice).
  get isOpen(): boolean {
    return this.state === 'live' || this.state === 'reconnecting';
  }

  get isReconnecting(): boolean {
    return this.state === 'reconnecting';
  }

  get isBusy(): boolean {
    return this.state === 'idle' || this.state === 'opening';
  }

  get title(): string {
    const { t } = this.#deps;

    switch (this.state) {
      case 'idle':
      case 'opening':
        return this.roomId === null ? t('status.creating') : t('status.joining');
      case 'live':
      case 'reconnecting':
        return t('status.reconnecting');
      default:
        return t(`status.${this.state}Title`);
    }
  }

  get text(): string {
    return failures.includes(this.state) ? this.#deps.t(`status.${this.state as TableOpenFailure}Text`) : '';
  }

  // The one thing to do about a failure: start over, reload, or try again.
  get actionLabel(): string {
    const { t } = this.#deps;

    if (this.state === 'outdated') return t('status.reload');

    return this.state === 'unreachable' ? t('status.retry') : t('status.startNew');
  }

  open(): void {
    if (this.state !== 'idle') return;

    const address = this.#deps.address.read();

    if (address.kind === 'invalid') {
      this.state = 'gone';

      return;
    }

    this.roomId = address.kind === 'table' ? address.roomId : null;
    this.#enter();
  }

  settle(result: TableOpenResult): void {
    if (this.state !== 'opening') return;

    if (!result.ok) {
      this.state = result.failure;

      return;
    }

    const { link } = result;

    this.#link = link;
    this.roomId = link.roomId;
    this.sessionId = link.sessionId;
    this.#deps.address.showRoom(link.roomId);

    link.listen({
      change: this.receive,
      reaction: this.#deps.receiveReaction,
      refused: this.refuse,
      drop: this.drop,
      reconnect: this.restore,
      close: this.close,
    });
  }

  // The first full state puts the table on screen.
  receive(snapshot: TableSnapshot): void {
    this.#deps.receive(snapshot);

    if (this.state === 'opening') {
      this.state = 'live';
    }
  }

  drop(): void {
    if (this.state === 'live') {
      this.state = 'reconnecting';
    }
  }

  restore(): void {
    if (this.state === 'reconnecting') {
      this.state = 'live';
    }
  }

  // The seat is gone (the table closed, or reconnecting took too long): sit down again if the
  // table still exists. Otherwise opening fails with 'gone'.
  close(): void {
    if (!this.isOpen) return;

    this.#link = null;
    this.#enter();
  }

  // A message the server refused. Nothing to show for it yet: optimistic values settle back
  // on their own (RoomSyncedValueStore), and the composer is limited like the server.
  refuse(): void {
    this.refusals += 1;
  }

  send<K extends TableMessageType>(type: K, message: TableMessages[K]): void {
    this.#link?.send(type, message);
  }

  act(): void {
    if (this.state === 'outdated') {
      this.#deps.address.reload();
    } else if (this.state === 'unreachable') {
      this.#enter();
    } else if (failures.includes(this.state)) {
      this.#deps.address.startNewTable();
    }
  }

  #enter(): void {
    this.state = 'opening';
    this.#deps.tableClient.open(this.roomId, this.#deps.preferences.loadName()).then(this.settle);
  }
}
