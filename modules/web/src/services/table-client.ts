import { Client, ErrorCode, type Room } from '@colyseus/sdk';
import { tableProtocolVersion, tableRoomName, type TableJoinOptions } from '@felt-table/protocol';
import { TableState } from '@felt-table/protocol/state';
import type { TableClientService, TableLink, TableOpenFailure, TableOpenResult } from './types';

// Vite (and later the production host) forwards /live to core-api's Colyseus server.
const livePath = '/live';

type TableRoom = Room<unknown, TableState>;

// The seat for each table this tab sits at. sessionStorage is per tab and survives a reload,
// which is exactly "reloading keeps my seat" (the server holds it for limits.table.reconnectSeconds).
const seatKey = (roomId: string): string => `felt-table:seat:${roomId}`;

const readSeat = (roomId: string): string | null => {
  try {
    return window.sessionStorage.getItem(seatKey(roomId));
  } catch {
    return null;
  }
};

const writeSeat = (roomId: string, token: string | null): void => {
  try {
    if (token === null) {
      window.sessionStorage.removeItem(seatKey(roomId));
    } else {
      window.sessionStorage.setItem(seatKey(roomId), token);
    }
  } catch {
    // Storage can be blocked; a reload then just joins as someone new.
  }
};

const failureOf = (error: unknown): TableOpenFailure => {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
  const message = error instanceof Error ? error.message : '';

  if (message === 'PROTOCOL_MISMATCH') return 'outdated';

  if (code === ErrorCode.MATCHMAKE_INVALID_ROOM_ID) return message.includes('locked') ? 'full' : 'gone';

  return 'unreachable';
};

// Back into the seat this tab had, if the server still holds it; otherwise a fresh join.
const enter = async (client: Client, roomId: string | null, options: TableJoinOptions): Promise<TableRoom> => {
  if (roomId === null) {
    return client.create(tableRoomName, options, TableState);
  }

  const seat = readSeat(roomId);

  if (seat !== null) {
    try {
      return await client.reconnect(seat, TableState);
    } catch {
      writeSeat(roomId, null);
    }
  }

  return client.joinById(roomId, options, TableState);
};

const toLink = (room: TableRoom): TableLink => ({
  roomId: room.roomId,
  sessionId: room.sessionId,
  listen: (listeners) => {
    room.onStateChange((state) => listeners.change(state.toJSON()));
    room.onMessage('reaction', listeners.reaction);
    room.onMessage('geometry', listeners.geometry);
    room.onMessage('snapped', listeners.snapped);
    room.onMessage('cursor', listeners.cursor);
    room.onMessage('error', listeners.refused);
    room.onDrop(() => listeners.drop());

    // The SDK calls this before it stores the new seat token, so the token is saved a moment later
    // (otherwise a reload after a reconnect would lose the seat).
    room.onReconnect(() => {
      window.setTimeout(() => writeSeat(room.roomId, room.reconnectionToken), 0);
      listeners.reconnect();
    });

    // The seat is lost, or the SDK gave up reconnecting (it doesn't try in the first seconds after
    // joining). The saved seat stays: sitting down again tries it first, while the table still holds it.
    room.onLeave(() => listeners.close());

    // The full state may already be here: it is once it lists us.
    if (room.state.members.has(room.sessionId)) {
      listeners.change(room.state.toJSON());
    }
  },
  send: (type, message) => room.send(type, message),
});

export const createTableClient = (origin: string): TableClientService => {
  const client = new Client(`${origin}${livePath}`);

  return {
    open: async (roomId, name): Promise<TableOpenResult> => {
      try {
        const room = await enter(client, roomId, { protocolVersion: tableProtocolVersion, name });

        writeSeat(room.roomId, room.reconnectionToken);

        return { ok: true, link: toLink(room) };
      } catch (error) {
        return { ok: false, failure: failureOf(error) };
      }
    },
  };
};
