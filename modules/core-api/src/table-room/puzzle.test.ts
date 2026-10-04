import { buildCut, decodeGeometry } from '@felt-table/engine';
import { TableState, type TablePictureSnapshot } from '@felt-table/protocol/state';
import { expect, test } from 'vitest';
import { TableRoomError } from './error.js';
import { TableRoomPuzzle, type TableRoomPuzzleRequest } from './puzzle.js';

const picture: TablePictureSnapshot = {
  kind: 'sample',
  id: 'duskLake',
  src: '',
  width: 1500,
  height: 1000,
  description: '',
  authorName: '',
  authorUrl: '',
  photoUrl: '',
};

const request: TableRoomPuzzleRequest = { picture, pieces: 20, shape: 'wild', snap: 'tight', seed: 7 };

const createPuzzle = (): { puzzle: TableRoomPuzzle; state: TableState } => {
  const state = new TableState();
  let id = 0;
  let time = 5000;

  return { puzzle: new TableRoomPuzzle(state, { now: () => (time += 1000), createId: () => `g${++id}`, random: () => 0.5 }), state };
};

const codeOf = (run: () => unknown): string | undefined => {
  try {
    run();

    return undefined;
  } catch (error) {
    return error instanceof TableRoomError ? error.code : 'other';
  }
};

// The group that holds a piece, and its key.
const groupOf = (state: TableState, piece: number): { key: string; x: number; y: number } => {
  const [key, group] = [...state.groups.entries()].find(([, entry]) => entry.pieces.includes(piece)) ?? ['', null];

  return { key, x: group?.x ?? 0, y: group?.y ?? 0 };
};

const positions = (state: TableState): string[] => [...state.groups.values()].map((group) => `${group.x},${group.y}`);

test('an empty table has no shapes to give and nothing to arrange', () => {
  const { puzzle } = createPuzzle();

  expect(puzzle.state).toBe('empty');
  expect(puzzle.percent).toBeNull();
  expect(() => puzzle.geometry()).toThrow(TableRoomError);
  expect(() => puzzle.arrangeEdges()).toThrow(TableRoomError);
});

test('starting cuts the picture and lays out one group per piece', () => {
  const { puzzle, state } = createPuzzle();
  const started = puzzle.start(request);
  const cut = buildCut(decodeGeometry(started.geometry.bytes));

  expect(puzzle.state).toBe('playing');
  expect(started.pieces).toBe(cut.pieces.length);
  expect(state.puzzle.toJSON()).toMatchObject({ geometryId: 'g1', cols: cut.cols, rows: cut.rows, shape: 'wild', snap: 'tight', finishedAt: 0 });
  expect(state.puzzle.picture.toJSON()).toEqual(picture);
  expect(state.groups.size).toBe(cut.pieces.length);
  expect([...state.groups.values()].map((group) => [...group.pieces])).toEqual(cut.pieces.map((piece) => [piece.id]));
  expect(new Set([...state.groups.values()].map((group) => group.z)).size).toBe(cut.pieces.length);
  expect(puzzle.geometry()).toBe(started.geometry);
});

test('the same seed gives the same cut and layout', () => {
  const first = createPuzzle();
  const second = createPuzzle();

  expect(first.puzzle.start(request).geometry.bytes).toEqual(second.puzzle.start(request).geometry.bytes);
  expect(positions(first.state)).toEqual(positions(second.state));
});

test('a new puzzle replaces the old one and says how far it got', () => {
  const { puzzle, state } = createPuzzle();

  puzzle.start(request);
  state.groups.delete('1');

  const replaced = puzzle.start({ ...request, pieces: 12 });

  expect(replaced.replacedPercent).toBe(Math.round((1 / (20 - 1)) * 100));
  expect(replaced.geometry.id).toBe('g2');
  expect(state.groups.size).toBe(replaced.pieces);
  expect(puzzle.start(request).replacedPercent).toBeNull();
});

test('edges up moves only loose edge pieces', () => {
  const { puzzle, state } = createPuzzle();

  puzzle.start({ ...request, pieces: 30 });

  const cut = buildCut(decodeGeometry(puzzle.geometry().bytes));
  const before = positions(state);

  puzzle.arrangeEdges();

  const after = positions(state);

  cut.pieces.forEach((piece) => {
    expect(after[piece.id] !== before[piece.id]).toBe(piece.isEdge);
  });
});

test('a held group is only for its holder until they put it down', () => {
  const { puzzle, state } = createPuzzle();

  puzzle.start(request);
  puzzle.grab('ana', 3);

  expect(state.groups.get('3')?.heldBy).toBe('ana');
  expect(state.groups.get('3')?.z).toBe(state.groups.size);
  expect(codeOf(() => puzzle.grab('sam', 3))).toBe('GROUP_HELD');
  expect(codeOf(() => puzzle.move('sam', 3, 0, 0))).toBe('NOT_HOLDING');
  expect(codeOf(() => puzzle.grab('sam', 999))).toBe('NO_SUCH_GROUP');

  puzzle.move('ana', 3, 1234, -50);
  puzzle.drop('ana', 3, 1300, -60);

  expect(state.groups.get('3')?.toJSON()).toMatchObject({ x: 1300, y: -60, heldBy: '' });
  expect(codeOf(() => puzzle.drop('ana', 3, 0, 0))).toBe('NOT_HOLDING');
});

test('picking up another group, or leaving, lets go of the first', () => {
  const { puzzle, state } = createPuzzle();

  puzzle.start(request);
  puzzle.grab('ana', 1);
  puzzle.grab('ana', 2);

  expect([state.groups.get('1')?.heldBy, state.groups.get('2')?.heldBy]).toEqual(['', 'ana']);

  puzzle.release('ana');

  expect(state.groups.get('2')?.heldBy).toBe('');
});

test('a drop close to a neighbour snaps onto it; one next to a held neighbour does not', () => {
  const { puzzle, state } = createPuzzle();

  puzzle.start(request);

  const neighbour = groupOf(state, 1);

  puzzle.grab('sam', 1);
  puzzle.grab('ana', 0);
  expect(puzzle.drop('ana', 0, neighbour.x + 1, neighbour.y).joins).toBe(0);

  puzzle.release('sam');
  puzzle.grab('ana', 0);

  const dropped = puzzle.drop('ana', 0, neighbour.x + 1, neighbour.y - 1);

  expect(dropped.joins).toBe(1);
  expect(dropped.joinedPieces.toSorted()).toEqual([0, 1]);
  expect(state.groups.get('0')?.toJSON()).toMatchObject({ x: neighbour.x, y: neighbour.y, pieces: [0, 1] });
  expect(state.groups.has('1')).toBe(false);
});

test('the last piece in finishes the puzzle, once', () => {
  const { puzzle, state } = createPuzzle();
  const { pieces } = puzzle.start({ ...request, pieces: 12 });
  const finishes: (number | null)[] = [];

  for (let piece = 1; piece < pieces; piece++) {
    const target = groupOf(state, 0);

    puzzle.grab('ana', piece);
    finishes.push(puzzle.drop('ana', piece, target.x, target.y).finishedAfter);
  }

  expect(state.groups.size).toBe(1);
  expect(finishes.filter((after) => after !== null)).toEqual([state.puzzle.finishedAt - state.puzzle.startedAt]);
  expect(puzzle.percent).toBe(100);
});
