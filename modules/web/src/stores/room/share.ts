import { makeAutoObservable } from 'mobx';
import type { ClipboardService, Schedule } from '../../services';
import type { Translate } from '../locale';

export type ShareState = 'idle' | 'copied' | 'failed';

export interface RoomShareDeps {
  origin: string;
  // Known once the table is open.
  roomId: () => string | null;
  clipboard: ClipboardService;
  schedule: Schedule;
  t: Translate;
}

const resetAfterMs = 2000;

// The room link and the copy-to-clipboard state machine: idle → copied | failed → idle.
export class RoomShareStore {
  state: ShareState = 'idle';
  readonly #origin: string;
  readonly #roomId: () => string | null;
  readonly #clipboard: ClipboardService;
  readonly #schedule: Schedule;
  readonly #t: Translate;
  #cancelReset: (() => void) | null = null;

  constructor({ origin, roomId, clipboard, schedule, t }: RoomShareDeps) {
    this.#origin = origin;
    this.#roomId = roomId;
    this.#clipboard = clipboard;
    this.#schedule = schedule;
    this.#t = t;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get link(): string {
    return `${this.#origin}/r/${this.#roomId() ?? ''}`;
  }

  get linkLabel(): string {
    return `${new URL(this.#origin).host}/r/${this.#roomId() ?? ''}`;
  }

  get isCopied(): boolean {
    return this.state === 'copied';
  }

  get copyLabel(): string {
    if (this.state === 'failed') return this.#t('share.failed');

    return this.isCopied ? this.#t('share.copied') : this.#t('share.copy');
  }

  get shareLabel(): string {
    return this.isCopied ? this.#t('share.linkCopied') : this.#t('share.share');
  }

  get inviteLabel(): string {
    return this.isCopied ? this.#t('share.inviteCopied') : this.#t('share.invite');
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
