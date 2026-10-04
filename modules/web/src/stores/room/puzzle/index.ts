import { makeAutoObservable } from 'mobx';
import type { Translate } from '../../locale';
import type { PuzzlePicture } from '../types';

export type PuzzleState = 'empty' | 'cutting' | 'playing' | 'finished';

// The puzzle on the table and its picture. States: empty → cutting → playing → finished.
export class RoomPuzzleStore {
  state: PuzzleState = 'empty';
  picture: PuzzlePicture | null = null;
  pieceCount = 0;
  joinCount = 0;
  readonly #t: Translate;

  constructor(t: Translate) {
    this.#t = t;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isEmpty(): boolean {
    return this.state === 'empty';
  }

  get pictureAspect(): number | null {
    return this.picture ? this.picture.width / this.picture.height : null;
  }

  get percent(): number {
    return this.pieceCount > 1 ? Math.round((this.joinCount / (this.pieceCount - 1)) * 100) : 0;
  }

  get summary(): string {
    if (this.state === 'empty') return this.#t('puzzle.empty');

    if (this.state === 'cutting') return this.#t('puzzle.cutting');

    return this.#t('puzzle.summary', { count: this.pieceCount, percent: this.percent });
  }

  // A new puzzle replaces whatever was on the table. The server will drive this once rooms sync.
  begin(picture: PuzzlePicture, pieceCount: number): void {
    this.picture = picture;
    this.pieceCount = pieceCount;
    this.joinCount = 0;
    this.state = 'playing';
  }
}
