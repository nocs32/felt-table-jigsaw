import type { ApiErrorCode, UnsplashPhoto, UnsplashPhotoPage, UnsplashTopic } from '@felt-table/protocol';
import { makeAutoObservable, observableRef } from 'mobx';
import type { ApiResult, PicturesApiService } from '../../services';

export type NewPuzzlePhotosSource = { kind: 'featured' } | { kind: 'topic'; slug: UnsplashTopic } | { kind: 'search'; query: string };

// idle → loading → ready (more pages load on demand) or failed.
export type NewPuzzlePhotosState = 'idle' | 'loading' | 'ready' | 'failed';

export interface NewPuzzlePhotosDeps {
  picturesApi: PicturesApiService;
  // Unsplash is off or out of quota: the whole picker hears about it.
  unavailable: (error: ApiErrorCode | 'NETWORK') => void;
}

const fetchPage = (api: PicturesApiService, source: NewPuzzlePhotosSource, page: number): Promise<ApiResult<UnsplashPhotoPage>> => {
  switch (source.kind) {
    case 'featured':
      return api.unsplashFeatured(page);
    case 'topic':
      return api.unsplashTopic(source.slug, page);
    case 'search':
      return api.unsplashSearch(source.query, page);
  }
};

// One list of Unsplash photos (the featured picks, a topic, or a search), a page at a time.
export class NewPuzzlePhotosStore {
  state: NewPuzzlePhotosState = 'idle';
  source: NewPuzzlePhotosSource | null = null;
  photos: UnsplashPhoto[] = [];
  page = 0;
  hasMore = false;
  readonly #deps: NewPuzzlePhotosDeps;
  // Answers to an older request (another source, or a page before it) are dropped.
  #request = 0;

  constructor(deps: NewPuzzlePhotosDeps) {
    this.#deps = deps;
    makeAutoObservable(this, { source: observableRef, photos: observableRef }, { autoBind: true });
  }

  get isEmpty(): boolean {
    return this.state === 'ready' && this.photos.length === 0;
  }

  show(source: NewPuzzlePhotosSource): void {
    this.source = source;
    this.photos = [];
    this.page = 0;
    this.hasMore = false;
    this.#load(1);
  }

  loadMore(): void {
    if (this.state === 'ready' && this.hasMore) {
      this.#load(this.page + 1);
    }
  }

  retry(): void {
    if (this.state === 'failed') {
      this.#load(this.page + 1);
    }
  }

  receivePage(request: number, result: ApiResult<UnsplashPhotoPage>): void {
    if (request !== this.#request) return;

    if (!result.ok) {
      this.state = 'failed';
      this.#deps.unavailable(result.error);

      return;
    }

    const known = new Set(this.photos.map((photo) => photo.id));

    this.photos = [...this.photos, ...result.value.photos.filter((photo) => !known.has(photo.id))];
    this.page = result.value.page;
    this.hasMore = result.value.hasMore;
    this.state = 'ready';
  }

  #load(page: number): void {
    const { source } = this;

    if (source === null) return;

    const request = ++this.#request;

    this.state = 'loading';
    void fetchPage(this.#deps.picturesApi, source, page).then((result) => this.receivePage(request, result));
  }
}
