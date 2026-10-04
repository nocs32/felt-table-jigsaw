import { makeAutoObservable } from 'mobx';

export type DialogName = 'newPuzzle' | 'finished' | null;

// Which modal is open. Only one at a time, like Slack.
export class UiDialogStore {
  open: DialogName = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isNewPuzzleOpen(): boolean {
    return this.open === 'newPuzzle';
  }

  get isFinishedOpen(): boolean {
    return this.open === 'finished';
  }

  openNewPuzzle(): void {
    this.open = 'newPuzzle';
  }

  openFinished(): void {
    this.open = 'finished';
  }

  close(): void {
    this.open = null;
  }

  // Ark's onOpenChange gives the next open state; closing is the only change we act on.
  syncOpen(details: { open: boolean }): void {
    if (!details.open) {
      this.close();
    }
  }
}
