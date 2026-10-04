// Error codes of the live table. A rejected join arrives as the join error's message;
// a rejected message arrives as an `error` event ({ code }).
export const tableErrorCodes = [
  // The web app and the server speak different protocol versions: reload.
  'PROTOCOL_MISMATCH',
  'INVALID_JOIN',
  'INVALID_MESSAGE',
  'RATE_LIMITED',
  'NOT_A_MEMBER',
  'ALREADY_A_MEMBER',
  'ROOM_CLOSED',
  // A rename that's empty once cleaned up.
  'EMPTY_NAME',
  // Asked for something about the puzzle while the table has none.
  'NO_PUZZLE',
  // The picked picture couldn't be looked up (Unsplash down, out of quota, or no such photo).
  'PICTURE_UNAVAILABLE',
  // A group that isn't on the table (any more).
  'NO_SUCH_GROUP',
  // Someone else picked that group up first.
  'GROUP_HELD',
  // Moving or dropping a group you aren't holding.
  'NOT_HOLDING',
] as const;

export type TableErrorCode = (typeof tableErrorCodes)[number];

export const isTableErrorCode = (value: unknown): value is TableErrorCode =>
  typeof value === 'string' && (tableErrorCodes as readonly string[]).includes(value);
