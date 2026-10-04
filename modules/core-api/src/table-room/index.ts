import { randomUUID } from 'node:crypto';
import { ErrorCode, Room, ServerError, type Client } from '@colyseus/core';
import {
  tableJoinOptionsSchema,
  tableMessageSchemas,
  tableProtocolVersion,
  type TableErrorCode,
  type TableEvents,
  type TableJoinOptions,
  type TableMessages,
  type TableMessageType,
} from '@felt-table/protocol';
import { TableState } from '@felt-table/protocol/state';
import { customAlphabet } from 'nanoid';
import * as v from 'valibot';
import { limits } from '../limits.js';
import { logger } from '../logger.js';
import { TableRoomError } from './error.js';
import { TableRoomFeed, type TableRoomFeedSystemKind } from './feed.js';
import { TableRoomLifecycle } from './lifecycle.js';
import { TableRoomMembers } from './members.js';
import { TableRoomRateLimits } from './rate-limits.js';
import { TableRoomSettings } from './settings.js';

export type TableClient = Client<{ messages: TableEvents }>;

const { table } = limits;

// 12 characters of [0-9a-z]: about 62 bits, so table links can't be guessed (spec §7.1).
const createRoomId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

// The client reads the code from the refused join's error message.
const joinError = (code: TableErrorCode): ServerError => new ServerError(ErrorCode.APPLICATION_ERROR, code);

// A join with bad options, or from a web app on another protocol version, is turned away.
const readJoinOptions = (options: unknown): TableJoinOptions => {
  const result = v.safeParse(tableJoinOptionsSchema, options);

  if (!result.success) throw joinError('INVALID_JOIN');

  if (result.output.protocolVersion !== tableProtocolVersion) throw joinError('PROTOCOL_MISMATCH');

  return result.output;
};

// One shared table. Its parts own the rules: who is here, the feed, the name and surface,
// rate limits, and when the empty table is thrown away. This class only wires them to Colyseus.
export class TableRoom extends Room<{ state: TableState; client: TableClient }> {
  override maxClients = table.maxClients;
  // The lifecycle decides when an empty table goes, not Colyseus.
  override autoDispose = false;
  override maxMessagesPerSecond = table.maxMessagesPerSecond;
  override state = new TableState();
  readonly #members = new TableRoomMembers(this.state.members, Math.random);
  readonly #feed = new TableRoomFeed(this.state.feed, { now: Date.now, createId: randomUUID, maxItems: table.feedMaxItems });
  readonly #settings = new TableRoomSettings(this.state, Math.random);
  readonly #rateLimits = new TableRoomRateLimits(table.rates, Date.now);
  readonly #lifecycle = new TableRoomLifecycle({
    schedule: (callback, delayMs) => {
      const delayed = this.clock.setTimeout(callback, delayMs);

      return () => delayed.clear();
    },
    graceMs: table.emptyGraceMs,
    close: () => void this.disconnect(),
  });

  override onCreate(): void {
    this.roomId = createRoomId();
    this.#listen();
    this.#lifecycle.open();
    logger.info('table created', { roomId: this.roomId });
  }

  override onJoin(client: TableClient, options: unknown): void {
    const { name } = readJoinOptions(options);
    const author = this.#members.join(client.sessionId, name);

    this.#feed.announce(author, 'joined');
    this.#lifecycle.join();
    logger.info('table joined', { roomId: this.roomId, sessionId: client.sessionId, people: this.#members.count });
  }

  // A lost connection keeps its seat for a while; the browser reconnects on its own.
  override onDrop(client: TableClient): void {
    this.#members.drop(client.sessionId);
    this.allowReconnection(client, table.reconnectSeconds);
  }

  override onReconnect(client: TableClient): void {
    this.#members.reconnect(client.sessionId);
  }

  override onLeave(client: TableClient): void {
    if (!this.#members.has(client.sessionId)) return;

    const author = this.#members.leave(client.sessionId);

    this.#rateLimits.forget(client.sessionId);
    this.#feed.announce(author, 'left');
    this.#lifecycle.leave(this.#members.count);
  }

  override onDispose(): void {
    this.#lifecycle.dispose();
    this.#rateLimits.dispose();
    logger.info('table closed', { roomId: this.roomId });
  }

  #listen(): void {
    this.#on('chat', (client, { text }) => this.#feed.say(this.#members.author(client.sessionId), text));
    this.#on('react', (client, { emoji }) => this.broadcast('reaction', { sessionId: client.sessionId, emoji }, { except: client }));
    this.#on('setBackground', (client, { value }) => this.#announce(client, 'background', this.#settings.setBackground(value)));
    this.#on('renameRoom', (client, { name }) => this.#announce(client, 'renamed', this.#settings.rename(name)));
    this.#on('updateProfile', (client, { name }) => this.#renameMember(client, name));
  }

  // Every handler: validate the message, check the sender's rate, then call the part that owns it.
  // Anything refused goes back to the sender as an `error` event; nobody gets disconnected for it.
  #on<K extends TableMessageType>(type: K, handle: (client: TableClient, message: TableMessages[K]) => void): void {
    this.onMessage(type, (client: TableClient, input: unknown) => {
      const result = v.safeParse(tableMessageSchemas[type], input);

      if (!result.success) return this.#refuse(client, type, 'INVALID_MESSAGE');

      if (!this.#rateLimits.allow(client.sessionId, type)) return this.#refuse(client, type, 'RATE_LIMITED');

      try {
        handle(client, result.output as TableMessages[K]);
      } catch (error) {
        if (!(error instanceof TableRoomError)) throw error;

        this.#refuse(client, type, error.code);
      }
    });
  }

  #renameMember(client: TableClient, text: string): void {
    const name = this.#members.rename(client.sessionId, text);

    if (name !== null) {
      this.#feed.renameAuthor(client.sessionId, name);
    }
  }

  // A null `text` means nothing changed, so there's nothing to log in the feed.
  #announce(client: TableClient, kind: TableRoomFeedSystemKind, text: string | null): void {
    if (text !== null) {
      this.#feed.announce(this.#members.author(client.sessionId), kind, text);
    }
  }

  #refuse(client: TableClient, type: TableMessageType, code: TableErrorCode): void {
    if (code !== 'RATE_LIMITED') {
      logger.warn('table message refused', { roomId: this.roomId, sessionId: client.sessionId, type, code });
    }

    client.send('error', { code });
  }
}
