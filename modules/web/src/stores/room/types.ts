export type PlayerColor =
  | 'raspberry'
  | 'sky'
  | 'green'
  | 'mustard'
  | 'violet'
  | 'orange'
  | 'teal'
  | 'pink'
  | 'lime'
  | 'indigo';

export type PresenceStatus = 'online' | 'away';

export interface Member {
  id: string;
  name: string;
  color: PlayerColor;
  status: PresenceStatus;
}

export type TableBackgroundPreset =
  | 'feltGreen'
  | 'feltNavy'
  | 'feltBurgundy'
  | 'feltCharcoal'
  | 'walnut'
  | 'oak'
  | 'cork'
  | 'slate'
  | 'linen';

export type TableBackground = { kind: 'preset'; preset: TableBackgroundPreset } | { kind: 'color'; color: string };

// What a system line in the feed says. Kept as data, so each viewer reads it in their own language.
export type FeedEvent =
  | { type: 'joined' }
  | { type: 'background'; background: TableBackground }
  | { type: 'renamed'; name: string };

interface FeedItemBase {
  id: string;
  authorId: string;
  at: number;
  // Consecutive items with the same key replace each other (e.g. rapid background changes).
  mergeKey?: string;
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
