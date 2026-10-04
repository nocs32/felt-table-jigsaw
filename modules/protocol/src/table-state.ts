import { schema, t } from '@colyseus/schema';
import type { PlayerColor } from './players.js';
import { defaultTableBackground } from './table-backgrounds.js';
import { defaultTableName } from './table-names.js';

// The live table's shared state. The server owns it; Colyseus streams every change to each
// browser as small ordered patches. Imported from `@felt-table/protocol/state`.

// What a feed item is. System lines are stored as data and worded by each viewer, in their language.
// `text` holds the message, the new table name (renamed) or the new surface (background).
export type TableFeedKind = 'message' | 'joined' | 'left' | 'background' | 'renamed';

export class TableMember extends schema(
  {
    name: t.string(),
    color: t.string<PlayerColor>(),
    // false while the server holds their seat after a dropped connection.
    connected: t.boolean().default(true),
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

export class TableState extends schema(
  {
    name: t.string().default(defaultTableName),
    // A preset id or a #rrggbb colour.
    background: t.string().default(defaultTableBackground),
    // Keyed by session id, in join order.
    members: t.map(TableMember),
    // Newest last, at most limits.table.feedMaxItems.
    feed: t.array(TableFeedItem),
  },
  'TableState',
) {}

// The same state as plain JSON (`state.toJSON()`), which is what the web app's stores read.
export interface TableMemberSnapshot {
  name: string;
  color: PlayerColor;
  connected: boolean;
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

export interface TableSnapshot {
  name: string;
  background: string;
  members: Record<string, TableMemberSnapshot>;
  feed: TableFeedItemSnapshot[];
}
