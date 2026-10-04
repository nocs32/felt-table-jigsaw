import { chatMaxLength } from '@felt-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Localizer, Translate } from '../locale';
import type { RoomPresenceStore } from './presence';
import { backgroundLabel } from './table-backgrounds';
import type { FeedEvent, FeedItem, FeedItemKind, PlayerColor } from './types';

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
  locale: Localizer;
  send: (text: string) => void;
}
const groupWindowMs = 5 * 60_000;

// Slack groups consecutive messages from one person within a few minutes under one header.
const isGroupStart = (item: FeedItem, previous: FeedItem | undefined): boolean =>
  item.kind === 'system' ||
  previous?.kind !== 'message' ||
  previous.authorId !== item.authorId ||
  item.at - previous.at > groupWindowMs;

const describe = (event: FeedEvent, t: Translate): string => {
  switch (event.type) {
    case 'joined':
      return t('feed.joined');
    case 'left':
      return t('feed.left');
    case 'background':
      return t('feed.background', { surface: backgroundLabel(event.background, t) });
    case 'renamed':
      return t('feed.renamed', { name: event.name });
  }
};

// Chat messages and system lines from the server, newest last, plus the composer draft.
export class RoomFeedStore {
  items: FeedItem[] = [];
  draft = '';
  readonly #deps: RoomFeedDeps;

  constructor(deps: RoomFeedDeps) {
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

  get maxLength(): number {
    return chatMaxLength;
  }

  receive(items: FeedItem[]): void {
    this.items = items;
  }

  setDraft(draft: string): void {
    this.draft = draft.slice(0, chatMaxLength);
  }

  // The message shows once the server has added it to the feed.
  send(): void {
    const text = this.draft.trim();

    if (!text) return;

    this.#deps.send(text);
    this.draft = '';
  }

  #toEntry(item: FeedItem, previous: FeedItem | undefined): FeedEntry {
    const { locale, presence } = this.#deps;
    // Someone still at the table shows as they are right now (a rename we haven't heard back
    // about yet included); someone who left, with the name and colour the line kept.
    const author = presence.find(item.authorId);
    const authorName = author?.name ?? item.authorName;

    return {
      id: item.id,
      kind: item.kind,
      text: item.kind === 'message' ? item.text : describe(item.event, locale.t),
      authorName: authorName || locale.t('chat.someone'),
      authorInitial: authorName.charAt(0).toUpperCase() || '?',
      authorColor: author?.color ?? item.authorColor,
      timeLabel: locale.formatTime(item.at),
      startsGroup: isGroupStart(item, previous),
    };
  }
}
