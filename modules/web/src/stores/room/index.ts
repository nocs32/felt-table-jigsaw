import { makeAutoObservable } from 'mobx';
import type { Services } from '../../services';
import type { LocaleStore, Translate } from '../locale';
import { NameFieldStore } from '../name-field';
import { RoomBackgroundStore } from './background';
import { RoomFeedStore } from './feed';
import { createMockFeed, mockMeId, mockMembers, mockRoomId } from './mock';
import { finishPersonName, finishTableName, toPersonName, toTableName } from './names';
import { RoomPresenceStore } from './presence';
import { RoomPuzzleStore } from './puzzle';
import { RoomReactionsStore } from './reactions';
import { RoomShareStore } from './share';
import type { TableBackgroundPreset } from './types';

const backgroundMergeKey = 'background';
const renameMergeKey = 'rename';

// One puzzle room. Sub-stores own each concern; this class wires the cross-cutting actions.
export class RoomStore {
  readonly id = mockRoomId;
  name = 'new-table';
  readonly presence: RoomPresenceStore;
  readonly feed: RoomFeedStore;
  readonly background: RoomBackgroundStore;
  readonly reactions: RoomReactionsStore;
  readonly share: RoomShareStore;
  readonly puzzle: RoomPuzzleStore;
  // The table name in the header (shared: anyone can rename it).
  readonly nameField: NameFieldStore;
  // Your own name (kept in this browser for every table).
  readonly myNameField: NameFieldStore;
  readonly #services: Services;
  readonly #t: Translate;

  constructor(services: Services, locale: LocaleStore) {
    const { t } = locale;

    this.#services = services;
    this.#t = t;
    this.presence = new RoomPresenceStore(mockMembers, mockMeId, t);
    this.feed = new RoomFeedStore(createMockFeed(services.now()), { ...services, presence: this.presence, locale });
    this.background = new RoomBackgroundStore(services.random, t);
    this.reactions = new RoomReactionsStore({ ...services, t });
    this.share = new RoomShareStore({ ...services, roomId: this.id, t });
    this.puzzle = new RoomPuzzleStore(t);
    this.nameField = this.#createNameField();
    this.myNameField = this.#createMyNameField();
    this.#applySavedName();

    makeAutoObservable(
      this,
      {
        id: false,
        presence: false,
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

  get composerPlaceholder(): string {
    return this.#t('chat.placeholder', { name: this.name });
  }

  rename(name: string): void {
    this.name = name;
    this.feed.add({ kind: 'system', authorId: this.presence.meId, event: { type: 'renamed', name }, mergeKey: renameMergeKey });
  }

  renameMe(name: string): void {
    this.presence.rename(this.presence.meId, name);
    this.#services.preferences.saveName(name);
  }

  choosePreset(preset: TableBackgroundPreset): void {
    this.background.choosePreset(preset);
    this.#announceBackground();
  }

  chooseColor(color: string): void {
    this.background.chooseColor(color);
    this.#announceBackground();
  }

  surpriseBackground(): void {
    this.background.surprise();
    this.#announceBackground();
  }

  #announceBackground(): void {
    this.feed.add({
      kind: 'system',
      authorId: this.presence.meId,
      event: { type: 'background', background: this.background.current },
      mergeKey: backgroundMergeKey,
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

  // The room hands out a name like "Teal Otter"; a name you picked before replaces it.
  #applySavedName(): void {
    const saved = this.#services.preferences.loadName();

    if (saved) {
      this.presence.rename(this.presence.meId, saved);
    }
  }
}
