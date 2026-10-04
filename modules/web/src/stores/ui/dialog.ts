import { makeAutoObservable } from 'mobx';

export type DialogName = 'newPuzzle' | 'picture' | 'finished' | null;

// Which modal is open. Only one at a time, like Slack.
export class UiDialogStore {
  open: DialogName = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isNewPuzzleOpen(): boolean {
    return this.open === 'newPuzzle';
  }

  get isPictureOpen(): boolean {
    return this.open === 'picture';
  }

  get isFinishedOpen(): boolean {
    return this.open === 'finished';
  }

  openNewPuzzle(): void {
    this.open = 'newPuzzle';
  }

  openPicture(): void {
    this.open = 'picture';
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
