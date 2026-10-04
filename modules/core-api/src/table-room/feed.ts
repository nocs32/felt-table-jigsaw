import type { ArraySchema } from '@colyseus/schema';
import { TableFeedItem, type TableFeedKind } from '@felt-table/protocol/state';
import { TableRoomError } from './error.js';
import type { TableRoomAuthor } from './members.js';

export type TableRoomFeedSystemKind = Exclude<TableFeedKind, 'message'>;

export interface TableRoomFeedDeps {
  now: () => number;
  createId: () => string;
  maxItems: number;
}

// System lines of one family replace the same person's previous line of that family, so a
// quick reload doesn't log "left" + "joined", and a colour drag logs one background change.
const familyOf = (kind: TableFeedKind): string | null => {
  if (kind === 'message') return null;

  return kind === 'joined' || kind === 'left' ? 'presence' : kind;
};

// The chat and activity feed: messages and system lines, newest last, capped at `maxItems`.
export class TableRoomFeed {
  readonly #items: ArraySchema<TableFeedItem>;
  readonly #deps: TableRoomFeedDeps;

  constructor(items: ArraySchema<TableFeedItem>, deps: TableRoomFeedDeps) {
    this.#items = items;
    this.#deps = deps;
  }

  say(author: TableRoomAuthor, text: string): void {
    const message = text.trim();

    if (!message) {
      throw new TableRoomError('INVALID_MESSAGE', 'Empty chat message');
    }

    this.#add(author, 'message', message);
  }

  // `text` is the new table name (renamed) or the new surface (background).
  announce(author: TableRoomAuthor, kind: TableRoomFeedSystemKind, text = ''): void {
    const last = this.#items.at(-1);

    if (last && last.by === author.id && familyOf(last.kind) === familyOf(kind)) {
      last.kind = kind;
      last.text = text;
      last.name = author.name;
      last.at = this.#deps.now();

      return;
    }

    this.#add(author, kind, text);
  }

  // Like Slack, someone's lines carry their current name, also after they leave.
  renameAuthor(id: string, name: string): void {
    this.#items.forEach((item) => {
      if (item.by === id) {
        item.name = name;
      }
    });
  }

  #add(author: TableRoomAuthor, kind: TableFeedKind, text: string): void {
    const { id: by, name, color } = author;

    this.#items.push(new TableFeedItem({ id: this.#deps.createId(), kind, by, name, color, text, at: this.#deps.now() }));

    while (this.#items.length > this.#deps.maxItems) {
      this.#items.shift();
    }
  }
}
