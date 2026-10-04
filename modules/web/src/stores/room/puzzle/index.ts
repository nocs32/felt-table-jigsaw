import { makeAutoObservable } from 'mobx';

export type PuzzleState = 'empty' | 'cutting' | 'playing' | 'finished';

// The puzzle on the table. States: empty → cutting → playing → finished.
export class RoomPuzzleStore {
  state: PuzzleState = 'empty';
  pieceCount = 0;
  joinCount = 0;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isEmpty(): boolean {
    return this.state === 'empty';
  }

  get percent(): number {
    return this.pieceCount > 1 ? Math.round((this.joinCount / (this.pieceCount - 1)) * 100) : 0;
  }

  get summary(): string {
    if (this.state === 'empty') return 'No puzzle yet';

    if (this.state === 'cutting') return 'Cutting the picture…';

    return `${this.pieceCount} pieces · ${this.percent}% joined`;
  }
}
