import type { PlayerColor, TableBackgroundPreset } from '@felt-table/protocol';

export type { PlayerColor, TableBackgroundPreset };

// Reconnecting: the connection dropped and the table holds their seat for a while.
export type PresenceStatus = 'online' | 'reconnecting';

export interface Member {
  id: string;
  name: string;
  color: PlayerColor;
  status: PresenceStatus;
}

export type TableBackground = { kind: 'preset'; preset: TableBackgroundPreset } | { kind: 'color'; color: string };

// What a system line in the feed says. Kept as data, so each viewer reads it in their own language.
export type FeedEvent =
  | { type: 'joined' }
  | { type: 'left' }
  | { type: 'background'; background: TableBackground }
  | { type: 'renamed'; name: string };

interface FeedItemBase {
  id: string;
  authorId: string;
  // Their latest name and their colour, kept for when they're no longer at the table.
  authorName: string;
  authorColor: PlayerColor;
  at: number;
}

export type FeedItem = (FeedItemBase & { kind: 'message'; text: string }) | (FeedItemBase & { kind: 'system'; event: FeedEvent });

export type FeedItemKind = FeedItem['kind'];

// Unsplash requires crediting the photographer, with links back to them and to Unsplash.
export interface PictureCredit {
  name: string;
  profileUrl: string;
  sourceUrl: string;
}

export interface PuzzlePicture {
  src: string;
  width: number;
  height: number;
  alt: string;
  credit: PictureCredit | null;
}
