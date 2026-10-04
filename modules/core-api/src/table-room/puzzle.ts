import { ArraySchema } from '@colyseus/schema';
import { arrangeEdges, buildCut, createRandom, cutGeometry, encodeGeometry, resolveDrop, scatterGroups, type Group, type PuzzleCut } from '@felt-table/engine';
import type { PuzzleShape, PuzzleSnap, TableGeometryEvent } from '@felt-table/protocol';
import { TableGroup, type TablePictureSnapshot, type TableState } from '@felt-table/protocol/state';
import { TableRoomError } from './error.js';

export type TableRoomPuzzleState = 'empty' | 'playing';

export interface TableRoomPuzzleRequest {
  picture: TablePictureSnapshot;
  pieces: number;
  shape: PuzzleShape;
  snap: PuzzleSnap;
  seed: number;
}

export interface TableRoomPuzzleStarted {
  geometry: TableGeometryEvent;
  // The picture it replaced, if there was a puzzle.
  replacedPicture: TablePictureSnapshot | null;
  // The real piece count: the requested one, fitted to the picture's shape.
  pieces: number;
  // How far the replaced puzzle got, when it was started on but not finished (for the feed line).
  replacedPercent: number | null;
}

export interface TableRoomPuzzleDropped {
  // Groups joined onto the dropped one (0: it didn't snap).
  joins: number;
  // Pieces on both sides of each new connection, for the glow.
  joinedPieces: number[];
  // This drop put the last piece in: ms since the puzzle started.
  finishedAfter: number | null;
}

export interface TableRoomPuzzleDeps {
  now: () => number;
  createId: () => string;
  random: () => number;
}

// The scatter draws from its own stream of the same seed, so the cut and the layout don't depend
// on each other.
const scatterSalt = 0x9e3779b9;

// The puzzle on the table: cuts the picture, lays the pieces out, keeps the cut's shapes for anyone
// who asks, and runs the play: each group is free ⇄ held (by one person, who alone may move it),
// and a drop is where the server decides what snaps. empty → playing → finished; anyone can start a
// new puzzle at any time, which replaces it and drops every hold.
export class TableRoomPuzzle {
  state: TableRoomPuzzleState = 'empty';
  readonly #table: TableState;
  readonly #deps: TableRoomPuzzleDeps;
  #cut: PuzzleCut | null = null;
  #geometry: TableGeometryEvent | null = null;
  // The highest stacking order so far: a picked-up group goes on top.
  #topZ = 0;

  constructor(table: TableState, deps: TableRoomPuzzleDeps) {
    this.#table = table;
    this.#deps = deps;
  }

  // Share of the joins made so far, 0–100. Null with no puzzle.
  get percent(): number | null {
    if (this.#cut === null) return null;

    const pieces = this.#cut.pieces.length;

    return Math.round(((pieces - this.#table.groups.size) / (pieces - 1)) * 100);
  }

  // The picture on the table. Null with no puzzle.
  get picture(): TablePictureSnapshot | null {
    return this.state === 'playing' ? this.#table.puzzle.picture.toJSON() : null;
  }

  start(request: TableRoomPuzzleRequest): TableRoomPuzzleStarted {
    const { picture, pieces, shape, snap, seed } = request;
    const percent = this.percent;
    const replacedPicture = this.picture;
    const geometry = cutGeometry({ aspect: picture.width / picture.height, pieceCount: pieces, shape, seed });
    const cut = buildCut(geometry);

    this.state = 'playing';
    this.#cut = cut;
    this.#geometry = { id: this.#deps.createId(), bytes: encodeGeometry(geometry) };
    this.#table.puzzle.picture.assign(picture);

    this.#table.puzzle.assign({
      geometryId: this.#geometry.id,
      cols: cut.cols,
      rows: cut.rows,
      shape,
      snap,
      startedAt: this.#deps.now(),
      finishedAt: 0,
    });

    this.#place(scatterGroups(cut, createRandom(seed ^ scatterSalt)));

    return {
      geometry: this.#geometry,
      replacedPicture,
      pieces: cut.pieces.length,
      replacedPercent: percent !== null && percent > 0 && percent < 100 ? percent : null,
    };
  }

  geometry(): TableGeometryEvent {
    if (this.#geometry === null) throw new TableRoomError('NO_PUZZLE', 'No puzzle on the table');

    return this.#geometry;
  }

  // "Edges up": the loose edge pieces move into rows above everything else. Held ones stay put.
  arrangeEdges(): void {
    const cut = this.#requireCut();

    for (const [id, origin] of arrangeEdges(cut, this.#groups(), this.#deps.random, (groupId) => this.#isHeld(groupId))) {
      const group = this.#table.groups.get(String(id));

      if (group) {
        group.x = origin.x;
        group.y = origin.y;
      }
    }
  }

  grab(sessionId: string, groupId: number): void {
    const group = this.#group(groupId);

    if (group.heldBy !== '' && group.heldBy !== sessionId) throw new TableRoomError('GROUP_HELD', 'Someone else holds it');

    this.release(sessionId);
    group.heldBy = sessionId;
    group.z = ++this.#topZ;
  }

  move(sessionId: string, groupId: number, x: number, y: number): void {
    const group = this.#held(sessionId, groupId);

    group.x = x;
    group.y = y;
  }

  // Puts the group down where it was let go, then snaps it to any neighbours close enough.
  drop(sessionId: string, groupId: number, x: number, y: number): TableRoomPuzzleDropped {
    const group = this.#held(sessionId, groupId);
    const cut = this.#requireCut();
    const isHeld = (id: number): boolean => id !== groupId && this.#isHeld(id);
    const outcome = resolveDrop({ cut, groups: this.#groups(), groupId, x, y, tolerance: this.#table.puzzle.snap, isHeld });

    for (const mergedId of outcome.mergedIds) {
      group.pieces.push(...(this.#table.groups.get(String(mergedId))?.pieces ?? []));
      this.#table.groups.delete(String(mergedId));
    }

    group.assign({ x: outcome.x, y: outcome.y, heldBy: '' });

    return { joins: outcome.mergedIds.length, joinedPieces: outcome.joinedPieces, finishedAfter: this.#finish() };
  }

  // Lets go of whatever this person holds (they left, or picked up something else).
  release(sessionId: string): void {
    this.#table.groups.forEach((group) => {
      if (group.heldBy === sessionId) group.heldBy = '';
    });
  }

  // One group left: done. Returns how long it took, the first time only.
  #finish(): number | null {
    const { puzzle } = this.#table;

    if (this.#table.groups.size !== 1 || puzzle.finishedAt !== 0) return null;

    puzzle.finishedAt = this.#deps.now();

    return puzzle.finishedAt - puzzle.startedAt;
  }

  #requireCut(): PuzzleCut {
    if (this.#cut === null) throw new TableRoomError('NO_PUZZLE', 'No puzzle on the table');

    return this.#cut;
  }

  #group(groupId: number): TableGroup {
    this.#requireCut();

    const group = this.#table.groups.get(String(groupId));

    if (!group) throw new TableRoomError('NO_SUCH_GROUP', `No group ${groupId}`);

    return group;
  }

  #held(sessionId: string, groupId: number): TableGroup {
    const group = this.#group(groupId);

    if (group.heldBy !== sessionId) throw new TableRoomError('NOT_HOLDING', `Not holding group ${groupId}`);

    return group;
  }

  #isHeld(groupId: number): boolean {
    return (this.#table.groups.get(String(groupId))?.heldBy ?? '') !== '';
  }

  #place(groups: Group[]): void {
    this.#topZ = groups.length - 1;
    this.#table.groups.clear();

    groups.forEach((group, z) => {
      this.#table.groups.set(String(group.id), new TableGroup({ x: group.x, y: group.y, z, pieces: ArraySchema.from(group.pieces) }));
    });
  }

  // The state's groups in the engine's shape.
  #groups(): Map<number, Group> {
    const groups = new Map<number, Group>();

    this.#table.groups.forEach((group, key) => {
      groups.set(Number(key), { id: Number(key), x: group.x, y: group.y, pieces: [...group.pieces] });
    });

    return groups;
  }
}
