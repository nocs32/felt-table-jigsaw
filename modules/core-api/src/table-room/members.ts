import type { MapSchema } from '@colyseus/schema';
import { cleanPersonName, playerColors, type PlayerColor } from '@felt-table/protocol';
import { TableMember } from '@felt-table/protocol/state';
import { TableRoomError } from './error.js';
import { pickMemberName } from './member-names.js';

// Who said or did something, as written into the feed.
export interface TableRoomAuthor {
  id: string;
  name: string;
  color: PlayerColor;
}

// Who is at the table, keyed by session id. Each member is connected ⇄ reconnecting
// (a dropped connection keeps its seat for a while), then leaves.
export class TableRoomMembers {
  readonly #members: MapSchema<TableMember>;
  readonly #random: () => number;

  constructor(members: MapSchema<TableMember>, random: () => number) {
    this.#members = members;
    this.#random = random;
  }

  // Everyone with a seat, reconnecting people included.
  get count(): number {
    return this.#members.size;
  }

  has(id: string): boolean {
    return this.#members.has(id);
  }

  // `requestedName` is the name this person picked before; without one the table makes one up.
  join(id: string, requestedName: string | null): TableRoomAuthor {
    if (this.#members.has(id)) {
      throw new TableRoomError('ALREADY_A_MEMBER');
    }

    const name = cleanPersonName(requestedName ?? '') || pickMemberName(this.#names(), this.#random);
    const color = this.#freeColor();

    this.#members.set(id, new TableMember({ name, color, connected: true }));

    return { id, name, color };
  }

  drop(id: string): void {
    this.#get(id).connected = false;
  }

  reconnect(id: string): void {
    this.#get(id).connected = true;
  }

  leave(id: string): TableRoomAuthor {
    const author = this.author(id);

    this.#members.delete(id);

    return author;
  }

  // Returns the cleaned-up name, or null when nothing changed.
  rename(id: string, text: string): string | null {
    const member = this.#get(id);
    const name = cleanPersonName(text);

    if (!name) {
      throw new TableRoomError('EMPTY_NAME');
    }

    if (name === member.name) return null;

    member.name = name;

    return name;
  }

  author(id: string): TableRoomAuthor {
    const { name, color } = this.#get(id);

    return { id, name, color };
  }

  #get(id: string): TableMember {
    const member = this.#members.get(id);

    if (!member) {
      throw new TableRoomError('NOT_A_MEMBER');
    }

    return member;
  }

  #names(): Set<string> {
    return new Set([...this.#members.values()].map((member) => member.name));
  }

  // The least used colour (unused while there are fewer people than colours), random among ties.
  #freeColor(): PlayerColor {
    const uses = new Map<PlayerColor, number>(playerColors.map((color) => [color, 0]));

    this.#members.forEach((member) => uses.set(member.color, (uses.get(member.color) ?? 0) + 1));

    const fewest = Math.min(...uses.values());
    const candidates = playerColors.filter((color) => uses.get(color) === fewest);

    return candidates[Math.floor(this.#random() * candidates.length)] ?? 'teal';
  }
}
