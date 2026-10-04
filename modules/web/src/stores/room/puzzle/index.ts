import { buildCut, contentBounds, decodeGeometry, type Point, type PuzzleCut, type Rect } from '@felt-table/engine';
import type { TableErrorCode, TableGeometryEvent, TableMessages, TableSnappedEvent } from '@felt-table/protocol';
import type { TableGroupSnapshot, TablePuzzleSnapshot } from '@felt-table/protocol/state';
import { makeAutoObservable, observableRef } from 'mobx';
import type { PathHitService, PictureLoaderService, PieceArtService, SamplesService, Schedule } from '../../../services';
import type { BoardGlow, BoardGroup, BoardScene, BoardShownGroup } from '../../../services/board-painter';
import type { Translate } from '../../locale';
import type { RoomConnectionStore } from '../connection';
import type { Member, PlayerColor, PuzzlePicture } from '../types';
import { RoomPuzzleArtStore } from './art';
import { groupAt, showGroups } from './board';
import { RoomPuzzleCameraStore } from './camera';
import { RoomPuzzleDragStore } from './drag';
import { RoomPuzzleFinishStore } from './finish';
import { pictureOf, toLoad } from './picture';
import { RoomPuzzlePointerStore, type RoomPuzzlePointerPick } from './pointer';

// empty → loading (shapes, picture, drawing the pieces) → ready. A new puzzle goes back to loading.
export type RoomPuzzleState = 'empty' | 'loading' | 'ready';

export interface RoomPuzzleDeps {
  t: Translate;
  samples: SamplesService;
  pictureLoader: PictureLoaderService;
  pieceArt: PieceArtService;
  pixelRatio: () => number;
  isInPath: PathHitService;
  schedule: Schedule;
  now: () => number;
  send: RoomConnectionStore['send'];
  sessionId: () => string;
  members: () => Member[];
  colorOf: (sessionId: string) => PlayerColor | null;
  // Our pointer on the table, for everyone else's view.
  trackCursor: (point: Point | null) => void;
}

const toGroups = (groups: Record<string, TableGroupSnapshot>): BoardGroup[] =>
  Object.entries(groups)
    .map(([id, group]) => ({ id: Number(id), x: group.x, y: group.y, z: group.z, pieces: group.pieces, heldBy: group.heldBy }))
    .sort((a, b) => a.z - b.z);

// The puzzle on the table, as the server has it. The shapes arrive separately from the state
// (the `geometry` event), so this asks for them whenever it has a cut it can't draw yet.
export class RoomPuzzleStore {
  info: TablePuzzleSnapshot | null = null;
  cut: PuzzleCut | null = null;
  // Bottom to top.
  groups: BoardGroup[] = [];
  // We asked for a new puzzle and wait for the server's cut.
  starting = false;
  // The server couldn't use the picture we picked.
  pictureRefused = false;
  // The last snap, glowing for a moment.
  glow: BoardGlow | null = null;
  readonly art: RoomPuzzleArtStore;
  readonly camera: RoomPuzzleCameraStore;
  readonly drag: RoomPuzzleDragStore;
  readonly pointer: RoomPuzzlePointerStore;
  readonly finish: RoomPuzzleFinishStore;
  readonly #deps: RoomPuzzleDeps;
  #geometry: TableGeometryEvent | null = null;
  #askedFor = '';

  constructor(deps: RoomPuzzleDeps) {
    this.#deps = deps;
    this.art = new RoomPuzzleArtStore(deps);
    this.camera = new RoomPuzzleCameraStore({ content: () => this.content });
    this.drag = new RoomPuzzleDragStore(deps);
    this.pointer = new RoomPuzzlePointerStore({ camera: this.camera, drag: this.drag, pick: (point) => this.pick(point), track: deps.trackCursor });
    this.finish = new RoomPuzzleFinishStore({ ...deps, info: () => this.info, pieceCount: () => this.pieceCount });

    makeAutoObservable(
      this,
      {
        info: observableRef,
        cut: observableRef,
        groups: observableRef,
        glow: observableRef,
        art: false,
        camera: false,
        drag: false,
        pointer: false,
        finish: false,
        pick: false,
      },
      { autoBind: true },
    );
  }

  get state(): RoomPuzzleState {
    if (this.info === null) return 'empty';

    return this.cut !== null && this.art.state === 'ready' ? 'ready' : 'loading';
  }

  get isEmpty(): boolean {
    return this.state === 'empty' && !this.starting;
  }

  get isReady(): boolean {
    return this.state === 'ready';
  }

  get pieceCount(): number {
    return this.info ? this.info.cols * this.info.rows : 0;
  }

  // Share of the joins made so far, 0–100.
  get percent(): number {
    const pieces = this.pieceCount;

    return pieces > 1 ? Math.round(((pieces - this.groups.length) / (pieces - 1)) * 100) : 0;
  }

  get picture(): PuzzlePicture | null {
    return this.info ? pictureOf(this.info.picture, this.#deps) : null;
  }

  get pictureAspect(): number | null {
    return this.picture ? this.picture.width / this.picture.height : null;
  }

  get content(): Rect | null {
    return this.cut ? contentBounds(this.cut, this.groups) : null;
  }

  get shownGroups(): BoardShownGroup[] {
    return showGroups(this.groups, this.drag, this.#deps.sessionId(), this.#deps.colorOf);
  }

  // What the table canvas draws, once everything's ready.
  get scene(): BoardScene | null {
    const { cut, art } = this;

    return cut && art.art && this.isReady ? { cut, art: art.art, groups: this.shownGroups, camera: this.camera.camera, glow: this.glow } : null;
  }

  // The group under a table point, and whether someone else has it in hand.
  pick(point: Point): RoomPuzzlePointerPick | null {
    const { cut } = this;
    const art = this.art.art;
    const group = cut && art && this.isReady ? groupAt(cut, art, this.shownGroups, point, this.#deps.isInPath) : null;

    return group && { group, heldByOther: group.heldBy !== '' && group.heldBy !== this.#deps.sessionId() };
  }

  get progress(): string {
    const { t } = this.#deps;

    if (this.art.state === 'failed') return t('puzzle.pictureFailed');

    if (this.art.state === 'preparing') return t('puzzle.preparing', { done: this.art.done, total: this.pieceCount });

    return this.art.state === 'loading' ? t('puzzle.loadingPicture') : t('puzzle.cutting');
  }

  get summary(): string {
    const { t } = this.#deps;

    if (this.pictureRefused) return t('puzzle.pictureRefused');

    if (this.isEmpty) return t('puzzle.empty');

    if (this.state !== 'ready') return this.progress;

    return this.finish.isFinished
      ? t('puzzle.finished', { count: this.pieceCount, time: this.finish.time })
      : t('puzzle.summary', { count: this.pieceCount, percent: this.percent });
  }

  // Screen pixels per CSS pixel, for the table canvas.
  pixelRatio(): number {
    return this.#deps.pixelRatio();
  }

  receive(puzzle: TablePuzzleSnapshot, groups: Record<string, TableGroupSnapshot>): void {
    const isNew = puzzle.geometryId !== this.info?.geometryId;

    this.groups = toGroups(groups);

    if (isNew) {
      this.cut = null;
      this.glow = null;
      this.starting = false;
      this.drag.end();
      this.art.reset();
    }

    const justFinished = !isNew && puzzle.finishedAt > 0 && this.info?.finishedAt === 0;

    // Only a new cut or the finish changes what's kept about the puzzle.
    if (isNew || puzzle.finishedAt !== this.info?.finishedAt) {
      this.info = puzzle.geometryId === '' ? null : puzzle;
    }

    // The last piece is in: show the whole picture.
    if (justFinished) this.camera.fit();

    this.drag.receive(this.groups);

    if (isNew) this.#useGeometry();
  }

  receiveSnapped(event: TableSnappedEvent): void {
    this.glow = { pieces: event.pieces, startedAt: this.#deps.now() };
  }

  receiveGeometry(event: TableGeometryEvent): void {
    this.#geometry = event;
    this.#useGeometry();
  }

  start(request: TableMessages['newPuzzle']): void {
    this.starting = true;
    this.pictureRefused = false;
    this.#deps.send('newPuzzle', request);
  }

  refuse(code: TableErrorCode): void {
    this.drag.refuse(code);

    if (code === 'PICTURE_UNAVAILABLE') {
      this.starting = false;
      this.pictureRefused = true;
    }
  }

  arrangeEdges(): void {
    if (this.isReady) {
      this.#deps.send('arrange', { kind: 'edgesUp' });
    }
  }

  // Builds the cut once its shapes are here; otherwise asks the server for them (once per cut).
  #useGeometry(): void {
    const { info } = this;

    if (info === null || this.cut !== null) return;

    if (this.#geometry?.id !== info.geometryId) {
      if (this.#askedFor !== info.geometryId) this.#deps.send('needGeometry', {});

      this.#askedFor = info.geometryId;

      return;
    }

    try {
      this.cut = buildCut(decodeGeometry(this.#geometry.bytes));
      this.camera.reset();
      this.art.prepare(this.cut, toLoad(info.picture));
    } catch {
      this.art.fail();
    }
  }
}
