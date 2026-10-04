import { defaultTableName, finishPersonName, finishTableName, toPersonName, toTableName, type TableReactionEvent } from '@felt-table/protocol';
import type { TableSnapshot } from '@felt-table/protocol/state';
import { makeAutoObservable } from 'mobx';
import type { Services } from '../../services';
import type { LocaleStore, Translate } from '../locale';
import { NameFieldStore } from '../name-field';
import { RoomBackgroundStore } from './background';
import { RoomConnectionStore } from './connection';
import { RoomCursorsStore } from './cursors';
import { RoomFeedStore } from './feed';
import { RoomPresenceStore } from './presence';
import { RoomPuzzleStore } from './puzzle';
import { RoomReactionsStore } from './reactions';
import { RoomShareStore } from './share';
import { toFeedItem, toMembers } from './snapshot';
import { RoomSyncedValueStore } from './synced-value';

// One live table. The server owns everything shared; sub-stores mirror their part of its
// state and send our requests. This class wires them to the connection.
export class RoomStore {
  readonly connection: RoomConnectionStore;
  readonly presence: RoomPresenceStore;
  readonly cursors: RoomCursorsStore;
  readonly feed: RoomFeedStore;
  readonly background: RoomBackgroundStore;
  readonly reactions: RoomReactionsStore;
  readonly share: RoomShareStore;
  readonly puzzle: RoomPuzzleStore;
  // The table name in the header (shared: anyone can rename it).
  readonly nameField: NameFieldStore;
  // Your own name (kept in this browser for every table).
  readonly myNameField: NameFieldStore;
  readonly #name: RoomSyncedValueStore;
  readonly #services: Services;
  readonly #t: Translate;

  constructor(services: Services, locale: LocaleStore) {
    const { t } = locale;
    const send = this.#sender();

    this.#services = services;
    this.#t = t;
    this.#name = new RoomSyncedValueStore(defaultTableName, services);

    this.connection = this.#createConnection();
    this.presence = new RoomPresenceStore(t);
    this.cursors = new RoomCursorsStore({ ...services, send, presence: this.presence });
    this.feed = new RoomFeedStore({ presence: this.presence, locale, send: (text) => send('chat', { text }) });
    this.background = new RoomBackgroundStore({ ...services, t, send: (value) => send('setBackground', { value }) });
    this.reactions = new RoomReactionsStore({ ...services, t, send: (emoji) => send('react', { emoji }) });
    this.share = new RoomShareStore({ ...services, roomId: () => this.connection.roomId, t });

    this.puzzle = this.#createPuzzle(send);
    this.nameField = this.#createNameField();
    this.myNameField = this.#createMyNameField();

    makeAutoObservable(
      this,
      {
        connection: false,
        presence: false,
        cursors: false,
        feed: false,
        background: false,
        reactions: false,
        share: false,
        puzzle: false,
        nameField: false,
        myNameField: false,
      },
      { autoBind: true },
    );
  }

  get name(): string {
    return this.#name.value;
  }

  get composerPlaceholder(): string {
    return this.#t('chat.placeholder', { name: this.name });
  }

  receive(snapshot: TableSnapshot): void {
    this.#name.receive(snapshot.name);
    this.presence.receive(toMembers(snapshot.members), this.connection.sessionId);
    this.feed.receive(snapshot.feed.map(toFeedItem));
    this.background.receive(snapshot.background);
    this.puzzle.receive(snapshot.puzzle, snapshot.groups);
  }

  receiveReaction({ sessionId, emoji }: TableReactionEvent): void {
    this.reactions.receive(emoji, sessionId, this.presence.find(sessionId)?.name ?? this.#t('chat.someone'));
  }

  rename(name: string): void {
    this.#name.propose(name);
    this.connection.send('renameRoom', { name });
  }

  // Your name: shown at once, shared through the server, and remembered for every table.
  renameMe(name: string): void {
    this.presence.rename(this.presence.meId, name);
    this.connection.send('updateProfile', { name });
    this.#services.preferences.saveName(name);
  }

  // Sub-stores are built before `connection`, so they reach it through this lambda.
  #sender(): RoomConnectionStore['send'] {
    return (type, message) => this.connection.send(type, message);
  }

  // Everything the server tells this table goes to the part it's about.
  #createConnection(): RoomConnectionStore {
    return new RoomConnectionStore({
      ...this.#services,
      t: this.#t,
      receive: (snapshot) => this.receive(snapshot),
      receiveReaction: (event) => this.receiveReaction(event),
      receiveGeometry: (event) => this.puzzle.receiveGeometry(event),
      receiveSnapped: (event) => this.puzzle.receiveSnapped(event),
      receiveCursor: (event) => this.cursors.receive(event),
      receiveRefusal: ({ code }) => this.puzzle.refuse(code),
    });
  }

  #createPuzzle(send: RoomConnectionStore['send']): RoomPuzzleStore {
    return new RoomPuzzleStore({
      ...this.#services,
      t: this.#t,
      send,
      sessionId: () => this.connection.sessionId,
      members: () => this.presence.members,
      colorOf: (sessionId) => this.presence.find(sessionId)?.color ?? null,
      trackCursor: (point) => this.cursors.track(point),
    });
  }

  #createNameField(): NameFieldStore {
    return new NameFieldStore({
      read: () => this.name,
      write: (name) => this.rename(name),
      placeholder: () => this.#t('header.namePlaceholder'),
      normalize: toTableName,
      finish: finishTableName,
    });
  }

  #createMyNameField(): NameFieldStore {
    return new NameFieldStore({
      read: () => this.presence.me?.name ?? '',
      write: (name) => this.renameMe(name),
      placeholder: () => this.#t('people.namePlaceholder'),
      normalize: toPersonName,
      finish: finishPersonName,
    });
  }
}
