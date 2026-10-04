import type { TableErrorCode } from '@felt-table/protocol';

// Thrown by the table room's parts when an event isn't allowed in the current state.
// The room turns it into an `error` event for the sender (or a refused join).
export class TableRoomError extends Error {
  readonly code: TableErrorCode;

  constructor(code: TableErrorCode, message: string = code) {
    super(message);
    this.name = 'TableRoomError';
    this.code = code;
  }
}
