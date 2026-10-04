import { makeAutoObservable } from 'mobx';
import type { RoomPresenceStore } from './presence';
import type { FeedItem, FeedItemKind, PlayerColor } from './types';

export interface FeedEntry {
  id: string;
  kind: FeedItemKind;
  text: string;
  authorName: string;
  authorInitial: string;
  authorColor: PlayerColor;
  timeLabel: string;
  startsGroup: boolean;
}

export interface RoomFeedDeps {
  presence: RoomPresenceStore;
  now: () => number;
  createId: () => string;
}

export type NewFeedItem = Omit<FeedItem, 'id' | 'at'>;

const maxItems = 200;
const maxLength = 500;
const groupWindowMs = 5 * 60_000;
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

// Slack groups consecutive messages from one person within a few minutes under one header.
const isGroupStart = (item: FeedItem, previous: FeedItem | undefined): boolean =>
  item.kind === 'system' ||
  previous?.kind !== 'message' ||
  previous.authorId !== item.authorId ||
  item.at - previous.at > groupWindowMs;

// Chat messages and system lines, newest last, plus the composer draft.
export class RoomFeedStore {
  items: FeedItem[];
  draft = '';
  readonly #deps: RoomFeedDeps;

  constructor(items: FeedItem[], deps: RoomFeedDeps) {
    this.items = items;
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get entries(): FeedEntry[] {
    return this.items.map((item, index) => this.#toEntry(item, this.items[index - 1]));
  }

  get canSend(): boolean {
    return this.draft.trim().length > 0;
  }

  get isDraftEmpty(): boolean {
    return !this.canSend;
  }

  setDraft(draft: string): void {
    this.draft = draft.slice(0, maxLength);
  }

  send(): void {
    const text = this.draft.trim();

    if (!text) return;

    this.add({ kind: 'message', authorId: this.#deps.presence.meId, text });
    this.draft = '';
  }

  add(item: NewFeedItem): void {
    const entry: FeedItem = { ...item, id: this.#deps.createId(), at: this.#deps.now() };
    const last = this.items.at(-1);
    const replacesLast = item.mergeKey !== undefined && last?.mergeKey === item.mergeKey;
    const kept = replacesLast ? this.items.slice(0, -1) : this.items;

    this.items = [...kept, entry].slice(-maxItems);
  }

  #toEntry(item: FeedItem, previous: FeedItem | undefined): FeedEntry {
    const author = this.#deps.presence.find(item.authorId);

    return {
      id: item.id,
      kind: item.kind,
      text: item.text,
      authorName: author?.name ?? 'Someone',
      authorInitial: author?.initial ?? '?',
      authorColor: author?.color ?? 'indigo',
      timeLabel: timeFormat.format(item.at),
      startsGroup: isGroupStart(item, previous),
    };
  }
}
