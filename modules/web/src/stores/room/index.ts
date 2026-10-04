import { makeAutoObservable } from 'mobx';
import type { Services } from '../../services';
import { RoomBackgroundStore } from './background';
import { RoomFeedStore } from './feed';
import { createMockFeed, mockMeId, mockMembers, mockRoomId } from './mock';
import { RoomPresenceStore } from './presence';
import { RoomPuzzleStore } from './puzzle';
import { RoomReactionsStore } from './reactions';
import { RoomShareStore } from './share';
import type { TableBackgroundPreset } from './types';

const backgroundMergeKey = 'background';

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

  constructor(services: Services) {
    this.presence = new RoomPresenceStore(mockMembers, mockMeId);

    this.feed = new RoomFeedStore(createMockFeed(services.now()), {
      presence: this.presence,
      now: services.now,
      createId: services.createId,
    });

    this.background = new RoomBackgroundStore(services.random);
    this.reactions = new RoomReactionsStore(services);
    this.share = new RoomShareStore({ ...services, roomId: this.id });
    this.puzzle = new RoomPuzzleStore();

    makeAutoObservable(
      this,
      { id: false, presence: false, feed: false, background: false, reactions: false, share: false, puzzle: false },
      { autoBind: true },
    );
  }

  get composerPlaceholder(): string {
    return `Message #${this.name}`;
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
      text: `changed the table to ${this.background.label}`,
      mergeKey: backgroundMergeKey,
    });
  }
}
