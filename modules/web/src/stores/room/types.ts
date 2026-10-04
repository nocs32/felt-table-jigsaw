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

export type FeedItemKind = 'system' | 'message';

export interface FeedItem {
  id: string;
  kind: FeedItemKind;
  authorId: string;
  text: string;
  at: number;
  // Consecutive items with the same key replace each other (e.g. rapid background changes).
  mergeKey?: string;
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
