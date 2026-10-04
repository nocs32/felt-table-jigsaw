import type { PuzzleCut } from '@felt-table/engine';
import { makeAutoObservable, observableRef } from 'mobx';
import type { PictureLoaderService, PictureToLoad, PieceArt, PieceArtJob, PieceArtService } from '../../../services';

// idle → loading (the picture) → preparing (drawing the pieces) → ready, or failed when the
// picture can't be loaded. A new cut starts over; anything still running for the old one is dropped.
export type RoomPuzzleArtState = 'idle' | 'loading' | 'preparing' | 'ready' | 'failed';

export interface RoomPuzzleArtDeps {
  pictureLoader: PictureLoaderService;
  pieceArt: PieceArtService;
  pixelRatio: () => number;
}

// The pieces' images for the cut on the table.
export class RoomPuzzleArtStore {
  state: RoomPuzzleArtState = 'idle';
  // Pieces drawn so far, while preparing.
  done = 0;
  art: PieceArt | null = null;
  readonly #deps: RoomPuzzleArtDeps;
  // Tells this cut's callbacks apart from an older cut's.
  #round = 0;
  #job: PieceArtJob | null = null;

  constructor(deps: RoomPuzzleArtDeps) {
    this.#deps = deps;
    makeAutoObservable(this, { art: observableRef }, { autoBind: true });
  }

  prepare(cut: PuzzleCut, picture: PictureToLoad): void {
    this.reset();

    const round = this.#round;

    this.state = 'loading';
    void this.#deps.pictureLoader.load(picture).then((result) => this.receivePicture(round, cut, result.ok ? result.image : null));
  }

  receivePicture(round: number, cut: PuzzleCut, image: CanvasImageSource | null): void {
    if (round !== this.#round || this.state !== 'loading') return;

    if (image === null) {
      this.state = 'failed';

      return;
    }

    this.state = 'preparing';
    this.#job = this.#deps.pieceArt.prepare(cut, image, this.#deps.pixelRatio(), (done) => this.receiveProgress(round, done));
    void this.#job.promise.then((art) => this.receiveArt(round, art));
  }

  receiveProgress(round: number, done: number): void {
    if (round === this.#round && this.state === 'preparing') {
      this.done = done;
    }
  }

  receiveArt(round: number, art: PieceArt): void {
    if (round === this.#round && this.state === 'preparing') {
      this.art = art;
      this.state = 'ready';
      this.#job = null;
    }
  }

  // The shapes couldn't be read: nothing to draw.
  fail(): void {
    this.reset();
    this.state = 'failed';
  }

  reset(): void {
    this.#job?.cancel();
    this.#job = null;
    this.#round += 1;
    this.state = 'idle';
    this.done = 0;
    this.art = null;
  }
}
