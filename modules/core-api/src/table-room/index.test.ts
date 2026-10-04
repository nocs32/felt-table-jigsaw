import { Server } from '@colyseus/core';
import type { Room as SdkRoom } from '@colyseus/sdk';
import { boot, type ColyseusTestServer } from '@colyseus/testing';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { buildCut, decodeGeometry } from '@felt-table/engine';
import { tableProtocolVersion, tableRoomName, type TableGeometryEvent, type UnsplashPhoto } from '@felt-table/protocol';
import type { TableSnapshot } from '@felt-table/protocol/state';
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest';
import { TableRoom, type TableRoomOptions } from './index.js';
import { createTableRoomPictures } from './pictures.js';

let colyseus: ColyseusTestServer;

// A pretend Unsplash: one known photo, and a record of reported downloads.
const photo: UnsplashPhoto = {
  id: 'lake-1',
  width: 3000,
  height: 2000,
  color: '#223344',
  description: 'A lake',
  thumbUrl: 'https://images.unsplash.com/thumb',
  previewUrl: 'https://images.unsplash.com/preview',
  puzzleUrl: 'https://images.unsplash.com/puzzle',
  photoUrl: 'https://unsplash.com/photos/lake-1',
  author: { name: 'Ana Lens', profileUrl: 'https://unsplash.com/@ana' },
};

const downloads: string[] = [];

const unsplash = {
  photo: (id: string): Promise<UnsplashPhoto> => (id === photo.id ? Promise.resolve(photo) : Promise.reject(new Error('Not found'))),
  use: (id: string): Promise<void> => {
    downloads.push(id);

    return Promise.resolve();
  },
};

// A pretend image store with one stored picture; it records which ids tables hold.
const held: string[] = [];

const images = {
  get: (id: string): { width: number; height: number; sourceUrl: string } | undefined =>
    id === 'linkedImage000000000x' ? { width: 800, height: 600, sourceUrl: 'https://example.com/cat.png' } : undefined,
  hold: (id: string): void => void held.push(id),
  release: (id: string): void => void held.splice(held.indexOf(id), 1),
};

beforeAll(async () => {
  const server = new Server({ transport: new WebSocketTransport(), greet: false, gracefullyShutdown: false });
  const options: TableRoomOptions = { pictures: createTableRoomPictures({ unsplash, images }) };

  server.define(tableRoomName, TableRoom, options);
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

const sample = { kind: 'sample', id: 'duskLake' } as const;

const newPuzzle = (sdkRoom: SdkRoom, picture: { kind: 'sample' | 'unsplash' | 'image'; id: string }, pieces = 12): void =>
  sdkRoom.send('newPuzzle', { picture, pieces, shape: 'wild', snap: 'tight', seed: 1 });

test('a new puzzle is cut for everyone and its shapes go to every browser', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await join(room, 'Ana');
  const sam = await join(room, 'Sam');
  const shapes = sam.waitForMessage('geometry') as Promise<TableGeometryEvent>;

  newPuzzle(ana, sample);

  const geometry = await shapes;
  const cut = buildCut(decodeGeometry(geometry.bytes));

  await room.waitForNextPatch();

  const { puzzle, groups, feed } = snapshotOf(room);

  expect(geometry.id).toBe(puzzle.geometryId);
  expect(puzzle.picture).toMatchObject({ kind: 'sample', id: 'duskLake', width: 1500, height: 1000 });
  expect(Object.keys(groups)).toHaveLength(cut.pieces.length);
  expect(feed.at(-1)).toMatchObject({ kind: 'puzzle', name: 'Ana', text: `${cut.pieces.length}` });
});

test('someone who joins later asks for the shapes', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await join(room, 'Ana');
  const refused = ana.waitForMessage('error');

  ana.send('needGeometry', {});
  expect(await refused).toEqual({ code: 'NO_PUZZLE' });

  newPuzzle(ana, sample);
  await ana.waitForMessage('geometry');

  const sam = await join(room, 'Sam');
  const shapes = sam.waitForMessage('geometry') as Promise<TableGeometryEvent>;

  sam.send('needGeometry', {});

  expect((await shapes).id).toBe(snapshotOf(room).puzzle.geometryId);
});

test('an Unsplash photo is looked up by the server, credited, and counted as a download', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await join(room, 'Ana');

  newPuzzle(ana, { kind: 'unsplash', id: photo.id });
  await ana.waitForMessage('geometry');

  expect(snapshotOf(room).puzzle.picture).toMatchObject({
    kind: 'unsplash',
    src: photo.puzzleUrl,
    authorName: 'Ana Lens',
    photoUrl: photo.photoUrl,
  });

  expect(downloads).toContain(photo.id);
});

test('a photo the server can’t find is refused and the table stays as it was', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await join(room, 'Ana');
  const refused = ana.waitForMessage('error');

  newPuzzle(ana, { kind: 'unsplash', id: 'missing' });

  expect(await refused).toEqual({ code: 'PICTURE_UNAVAILABLE' });
  expect(snapshotOf(room).puzzle.geometryId).toBe('');
});

test('a picture from a link is served by us and held while the table shows it', async () => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await join(room, 'Ana');

  newPuzzle(ana, { kind: 'image', id: 'linkedImage000000000x' });
  await ana.waitForMessage('geometry');

  expect(snapshotOf(room).puzzle.picture).toMatchObject({
    kind: 'image',
    src: '/api/images/linkedImage000000000x',
    width: 800,
    photoUrl: 'https://example.com/cat.png',
  });

  expect(held).toEqual(['linkedImage000000000x']);

  newPuzzle(ana, sample);
  await ana.waitForMessage('geometry');

  expect(held).toEqual([]);
});

// Two people at a table with a 12-piece sample puzzle.
const playing = async (): Promise<{ room: TableRoom; ana: SdkRoom; sam: SdkRoom }> => {
  const room = await colyseus.createRoom<TableRoom>(tableRoomName);
  const ana = await join(room, 'Ana');
  const sam = await join(room, 'Sam');

  newPuzzle(ana, sample);
  await ana.waitForMessage('geometry');

  return { room, ana, sam };
};

test('two people grab the same group at once: the first wins and the other is told', async () => {
  const { room, ana, sam } = await playing();
  const refused = sam.waitForMessage('error');

  ana.send('grab', { group: 0 });
  sam.send('grab', { group: 0 });

  expect(await refused).toEqual({ code: 'GROUP_HELD' });
  expect(snapshotOf(room).groups['0']?.heldBy).toBe(ana.sessionId);
});

test('a snap glows for everyone and counts for whoever made it', async () => {
  const { room, ana, sam } = await playing();
  const target = snapshotOf(room).groups['1'];
  const glow = sam.waitForMessage('snapped');

  ana.send('grab', { group: 0 });
  ana.send('drop', { group: 0, x: target?.x ?? 0, y: target?.y ?? 0 });

  expect(await glow).toEqual({ sessionId: ana.sessionId, pieces: expect.arrayContaining([0, 1]) });
  expect(snapshotOf(room).members[ana.sessionId]?.joins).toBe(1);
  expect(snapshotOf(room).groups['0']?.pieces).toEqual([0, 1]);
});

test('cursors go to everyone else, and vanish when their owner leaves', async () => {
  const { ana, sam } = await playing();
  const seen = sam.waitForMessage('cursor');

  ana.send('cursor', { x: 10, y: 20 });
  expect(await seen).toEqual({ sessionId: ana.sessionId, position: { x: 10, y: 20 } });

  const gone = sam.waitForMessage('cursor');

  await ana.leave();
  expect(await gone).toEqual({ sessionId: ana.sessionId, position: null });
});

test('someone who drops out lets go of what they held', async () => {
  const { room, ana } = await playing();

  ana.send('grab', { group: 2 });
  await room.waitForNextPatch();
  expect(snapshotOf(room).groups['2']?.heldBy).toBe(ana.sessionId);

  await ana.leave();
  await room.waitForNextPatch();
  expect(snapshotOf(room).groups['2']?.heldBy).toBe('');
});
