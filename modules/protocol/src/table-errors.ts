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
] as const;

export type TableErrorCode = (typeof tableErrorCodes)[number];

export const isTableErrorCode = (value: unknown): value is TableErrorCode =>
  typeof value === 'string' && (tableErrorCodes as readonly string[]).includes(value);
