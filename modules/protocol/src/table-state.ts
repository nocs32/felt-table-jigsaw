import { schema, t } from '@colyseus/schema';
import type { PlayerColor } from './players.js';
import { defaultTableBackground } from './table-backgrounds.js';
import { defaultTableName } from './table-names.js';
import type { PuzzleShape, PuzzleSnap } from './table-puzzles.js';

// The live table's shared state. The server owns it; Colyseus streams every change to each
// browser as small ordered patches. Imported from `@felt-table/protocol/state`.

// What a feed item is. System lines are stored as data and worded by each viewer, in their language.
// `text` holds the message, the new table name (renamed), the new surface (background), the
// piece count (puzzle, see formatPuzzleFeedText) or how long it took in ms (finished).
export type TableFeedKind = 'message' | 'joined' | 'left' | 'background' | 'renamed' | 'puzzle' | 'finished';

export type TablePictureKind = 'unsplash' | 'sample' | 'image';

export class TableMember extends schema(
  {
    name: t.string(),
    color: t.string<PlayerColor>(),
    // false while the server holds their seat after a dropped connection.
    connected: t.boolean().default(true),
    // Groups this person joined onto others in the current puzzle (for the finish stats).
    joins: t.uint16().default(0),
  },
  'TableMember',
) {}

export class TableFeedItem extends schema(
  {
    id: t.string(),
    kind: t.string<TableFeedKind>(),
    // Session id of the author. `name` follows their renames and `color` is theirs, so the line
    // still reads right after they leave.
    by: t.string(),
    name: t.string(),
    color: t.string<PlayerColor>(),
    text: t.string().default(''),
    at: t.float64(),
  },
  'TableFeedItem',
) {}

// The puzzle's picture, looked up by the server. Unsplash photos are hotlinked and credited;
// samples are drawn by each browser from their id; images from a link are served by core-api.
export class TablePicture extends schema(
  {
    kind: t.string<TablePictureKind>().default('sample'),
    id: t.string().default(''),
    // The image to cut and show (images.unsplash.com, or /api/images/:id). '' for samples.
    src: t.string().default(''),
    width: t.uint16().default(0),
    height: t.uint16().default(0),
    description: t.string().default(''),
    // Credit: the photographer and the photo's page (Unsplash), or the link an image came from
    // (photoUrl only). '' for samples.
    authorName: t.string().default(''),
    authorUrl: t.string().default(''),
    photoUrl: t.string().default(''),
  },
  'TablePicture',
) {}

export class TablePuzzle extends schema(
  {
    // Which cut is on the table: the `geometry` event with this id holds its shapes. '' when the
    // table is empty.
    geometryId: t.string().default(''),
    picture: t.ref(TablePicture),
    cols: t.uint16().default(0),
    rows: t.uint16().default(0),
    shape: t.string<PuzzleShape>().default('wild'),
    snap: t.string<PuzzleSnap>().default('tight'),
    startedAt: t.float64().default(0),
    // When the last piece went in. 0 while unfinished.
    finishedAt: t.float64().default(0),
  },
  'TablePuzzle',
) {}

// Joined pieces that move together. `x, y` is where the puzzle's top-left corner would be;
// each piece sits at its fixed place from there (engine `Group`).
export class TableGroup extends schema(
  {
    x: t.float64(),
    y: t.float64(),
    // Stacking order: higher is drawn on top.
    z: t.uint32(),
    pieces: t.array('uint16'),
    // Session id of whoever is moving it. '' when it's free.
    heldBy: t.string().default(''),
  },
  'TableGroup',
) {}

export class TableState extends schema(
  {
    name: t.string().default(defaultTableName),
    // A preset id or a #rrggbb colour.
    background: t.string().default(defaultTableBackground),
    // Keyed by session id, in join order.
    members: t.map(TableMember),
    // Newest last, at most limits.table.feedMaxItems.
    feed: t.array(TableFeedItem),
    puzzle: t.ref(TablePuzzle),
    // Keyed by group id (the id of its first piece).
    groups: t.map(TableGroup),
  },
  'TableState',
) {}

// The same state as plain JSON (`state.toJSON()`), which is what the web app's stores read.
export interface TableMemberSnapshot {
  name: string;
  color: PlayerColor;
  connected: boolean;
  joins: number;
}

export interface TableFeedItemSnapshot {
  id: string;
  kind: TableFeedKind;
  by: string;
  name: string;
  color: PlayerColor;
  text: string;
  at: number;
}

export interface TablePictureSnapshot {
  kind: TablePictureKind;
  id: string;
  src: string;
  width: number;
  height: number;
  description: string;
  authorName: string;
  authorUrl: string;
  photoUrl: string;
}

export interface TablePuzzleSnapshot {
  geometryId: string;
  picture: TablePictureSnapshot;
  cols: number;
  rows: number;
  shape: PuzzleShape;
  snap: PuzzleSnap;
  startedAt: number;
  finishedAt: number;
}

export interface TableGroupSnapshot {
  x: number;
  y: number;
  z: number;
  pieces: number[];
  heldBy: string;
}

export interface TableSnapshot {
  name: string;
  background: string;
  members: Record<string, TableMemberSnapshot>;
  feed: TableFeedItemSnapshot[];
  puzzle: TablePuzzleSnapshot;
  groups: Record<string, TableGroupSnapshot>;
}
