import { makeAutoObservable } from 'mobx';
import type { ClipboardService, Schedule } from '../../services';

export type ShareState = 'idle' | 'copied' | 'failed';

export interface RoomShareDeps {
  origin: string;
  roomId: string;
  clipboard: ClipboardService;
  schedule: Schedule;
}

const resetAfterMs = 2000;

// The room link and the copy-to-clipboard state machine: idle → copied | failed → idle.
export class RoomShareStore {
  state: ShareState = 'idle';
  readonly link: string;
  readonly linkLabel: string;
  readonly #clipboard: ClipboardService;
  readonly #schedule: Schedule;
  #cancelReset: (() => void) | null = null;

  constructor({ origin, roomId, clipboard, schedule }: RoomShareDeps) {
    this.link = `${origin}/r/${roomId}`;
    this.linkLabel = `${new URL(origin).host}/r/${roomId}`;
    this.#clipboard = clipboard;
    this.#schedule = schedule;
    makeAutoObservable(this, { link: false, linkLabel: false }, { autoBind: true });
  }

  get isCopied(): boolean {
    return this.state === 'copied';
  }

  get copyLabel(): string {
    return this.state === 'failed' ? 'Copy failed' : this.isCopied ? 'Copied' : 'Copy';
  }

  get shareLabel(): string {
    return this.isCopied ? 'Link copied' : 'Share';
  }

  get inviteLabel(): string {
    return this.isCopied ? 'Link copied!' : 'Invite people';
  }

  copy(): void {
    this.#clipboard.writeText(this.link).then(
      () => this.settle('copied'),
      () => this.settle('failed'),
    );
  }

  settle(state: ShareState): void {
    this.state = state;
    this.#cancelReset?.();
    this.#cancelReset = this.#schedule(this.reset, resetAfterMs);
  }

  reset(): void {
    this.state = 'idle';
  }
}
