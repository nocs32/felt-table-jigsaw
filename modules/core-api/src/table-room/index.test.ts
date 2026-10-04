import { Server } from '@colyseus/core';
import type { Room as SdkRoom } from '@colyseus/sdk';
import { boot, type ColyseusTestServer } from '@colyseus/testing';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { tableProtocolVersion, tableRoomName } from '@felt-table/protocol';
import type { TableSnapshot } from '@felt-table/protocol/state';
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest';
import { TableRoom } from './index.js';

let colyseus: ColyseusTestServer;

beforeAll(async () => {
  const server = new Server({ transport: new WebSocketTransport(), greet: false, gracefullyShutdown: false });

  server.define(tableRoomName, TableRoom);
  colyseus = await boot(server);
});

afterEach(async () => {
  await colyseus.cleanup();
});

afterAll(async () => {
  await colyseus.shutdown();
});

const join = (room: TableRoom, name: string | null): Promise<SdkRoom> =>
  colyseus.connectTo(room, { protocolVersion: tableProtocolVersion, name });

const snapshotOf = (room: TableRoom): TableSnapshot => room.state.toJSON();

test('people join with their own name or a made-up one, each in a different colour', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await join(room, 'Ana');
  const guest = await join(room, null);
  const { members, feed } = snapshotOf(room);

  expect(room.roomId).toMatch(/^[0-9a-z]{12}$/u);
  expect(members[ana.sessionId]?.name).toBe('Ana');
  expect(members[guest.sessionId]?.name).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/u);
  expect(members[ana.sessionId]?.color).not.toBe(members[guest.sessionId]?.color);
  expect(feed.map((item) => item.kind)).toEqual(['joined', 'joined']);
});

test('a web app on another protocol version is turned away', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);

  await expect(colyseus.connectTo(room, { protocolVersion: tableProtocolVersion + 1, name: null })).rejects.toThrow('PROTOCOL_MISMATCH');
});

test('reactions go to everyone else and are never stored', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await join(room, 'Ana');
  const sam = await join(room, 'Sam');
  const received = sam.waitForMessage('reaction');

  ana.send('react', { emoji: '🎉' });

  expect(await received).toEqual({ sessionId: ana.sessionId, emoji: '🎉' });
  expect(snapshotOf(room).feed).toHaveLength(2);
});

test('chat, renames and surface changes land in the shared state and feed', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await join(room, 'Ana');

  ana.send('chat', { text: ' hello ' });
  ana.send('renameRoom', { name: 'Sunday Club' });
  ana.send('setBackground', { value: 'walnut' });
  ana.send('updateProfile', { name: 'Ana B' });
  await room.waitForNextPatch();

  const { name, background, members, feed } = snapshotOf(room);

  expect([name, background, members[ana.sessionId]?.name]).toEqual(['sunday-club', 'walnut', 'Ana B']);
  expect(new Set(feed.map((item) => item.name))).toEqual(new Set(['Ana B']));
  expect(feed.map((item) => `${item.kind}:${item.text}`)).toEqual(['joined:', 'message:hello', 'renamed:sunday-club', 'background:walnut']);
});

test('a bad message is refused with a typed error and the sender stays', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await join(room, 'Ana');
  const refused = ana.waitForMessage('error');

  ana.send('chat', { text: 'hi', extra: true });

  expect(await refused).toEqual({ code: 'INVALID_MESSAGE' });
  expect(room.clients).toHaveLength(1);
});

test('chat is rate limited per person', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await join(room, 'Ana');
  const refused = ana.waitForMessage('error');

  ['1', '2', '3', '4', '5', '6'].forEach((text) => ana.send('chat', { text }));

  expect(await refused).toEqual({ code: 'RATE_LIMITED' });
  expect(snapshotOf(room).feed.filter((item) => item.kind === 'message')).toHaveLength(5);
});

test('the last person leaving keeps the table around for the grace period', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await join(room, 'Ana');

  await ana.leave();
  await room.waitForNextPatch();

  expect(snapshotOf(room).members).toEqual({});
  expect(snapshotOf(room).feed.map((item) => item.kind)).toEqual(['left']);
  expect(colyseus.getRoomById(room.roomId)).toBe(room);
});
