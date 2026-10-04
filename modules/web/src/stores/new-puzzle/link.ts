import { imagePath, type ApiErrorCode, type StoredImageInfo } from '@felt-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { ApiResult, PicturesApiService } from '../../services';
import type { Translate } from '../locale';
import type { NewPuzzlePick } from './types';

// idle → checking (the server fetches and checks the link) → ready, or failed with a reason.
// Editing the link after a failure goes back to idle.
export type NewPuzzleLinkState = 'idle' | 'checking' | 'ready' | 'failed';

export type NewPuzzleLinkError = ApiErrorCode | 'NETWORK' | 'NOT_A_LINK';

export interface NewPuzzleLinkDeps {
  picturesApi: PicturesApiService;
  t: Translate;
  choose: (pick: NewPuzzlePick) => void;
}

// Reasons with their own message; anything else gets the generic one.
const explained = ['NOT_A_LINK', 'IMAGE_LINK_INVALID', 'IMAGE_LINK_UNREACHABLE', 'NOT_AN_IMAGE', 'IMAGE_TOO_LARGE', 'IMAGE_TOO_SMALL', 'SERVER_BUSY'] as const;

type ExplainedError = (typeof explained)[number];

const isExplained = (error: NewPuzzleLinkError): error is ExplainedError => (explained as readonly string[]).includes(error);

const isWebLink = (text: string): boolean => {
  try {
    const url = new URL(text);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const hostOf = (url: string): string => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

// A picture from a link. The browser only checks it looks like a web link; the server downloads
// it, checks it really is a picture and keeps it for the table.
export class NewPuzzleLinkStore {
  state: NewPuzzleLinkState = 'idle';
  draft = '';
  image: StoredImageInfo | null = null;
  error: NewPuzzleLinkError | null = null;
  readonly #deps: NewPuzzleLinkDeps;
  #request = 0;

  constructor(deps: NewPuzzleLinkDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get canSubmit(): boolean {
    return this.draft.trim() !== '' && this.state !== 'checking';
  }

  get isChecking(): boolean {
    return this.state === 'checking';
  }

  get isFailed(): boolean {
    return this.state === 'failed';
  }

  // The line under the field: a hint, progress, what was found, or what went wrong.
  get message(): string {
    const { t } = this.#deps;
    const { error, image } = this;

    if (this.state === 'checking') return t('newPuzzle.link.checking');

    if (this.state === 'ready' && image) return t('newPuzzle.link.ready', { width: image.width, height: image.height, host: hostOf(image.sourceUrl) });

    if (this.state === 'failed' && error) return isExplained(error) ? t(`newPuzzle.link.errors.${error}`) : t('newPuzzle.link.errors.other');

    return t('newPuzzle.link.hint');
  }

  setDraft(text: string): void {
    this.draft = text;

    if (this.state === 'failed') {
      this.state = 'idle';
      this.error = null;
    }
  }

  submit(): void {
    const url = this.draft.trim();

    if (!this.canSubmit) return;

    if (!isWebLink(url)) {
      this.state = 'failed';
      this.error = 'NOT_A_LINK';

      return;
    }

    const request = ++this.#request;

    this.state = 'checking';
    this.error = null;
    void this.#deps.picturesApi.imageFromLink(url).then((result) => this.receive(request, result));
  }

  receive(request: number, result: ApiResult<StoredImageInfo>): void {
    if (request !== this.#request || this.state !== 'checking') return;

    if (!result.ok) {
      this.state = 'failed';
      this.error = result.error;

      return;
    }

    const { id, width, height, sourceUrl } = result.value;

    this.state = 'ready';
    this.image = result.value;
    this.#deps.choose({ key: `image:${id}`, request: { kind: 'image', id }, src: imagePath(id), width, height, alt: hostOf(sourceUrl) });
  }
}
