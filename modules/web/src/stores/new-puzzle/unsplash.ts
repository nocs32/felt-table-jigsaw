import { unsplashTopics, type ApiErrorCode, type UnsplashStatus, type UnsplashTopic } from '@felt-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { ApiResult, PicturesApiService } from '../../services';
import type { Translate } from '../locale';
import { NewPuzzlePhotosStore } from './photos';

// unknown → checking → enabled, or disabled (no key on the server). Enabled turns into
// rateLimited when Unsplash's hourly quota runs out.
export type NewPuzzleUnsplashAvailability = 'unknown' | 'checking' | 'enabled' | 'disabled' | 'rateLimited';

// The Featured tab's chips: our picks, or one of Unsplash's topics.
export type NewPuzzleUnsplashChip = 'picks' | UnsplashTopic;

export interface NewPuzzleUnsplashChipView {
  key: NewPuzzleUnsplashChip;
  label: string;
  isActive: boolean;
}

export interface NewPuzzleUnsplashDeps {
  picturesApi: PicturesApiService;
  t: Translate;
}

// The picker's Unsplash side: whether it's on, the Featured lists and the search.
export class NewPuzzleUnsplashStore {
  availability: NewPuzzleUnsplashAvailability = 'unknown';
  chip: NewPuzzleUnsplashChip = 'picks';
  searchDraft = '';
  readonly featured: NewPuzzlePhotosStore;
  readonly search: NewPuzzlePhotosStore;
  readonly #deps: NewPuzzleUnsplashDeps;

  constructor(deps: NewPuzzleUnsplashDeps) {
    this.#deps = deps;
    this.featured = new NewPuzzlePhotosStore({ ...deps, unavailable: (error) => this.markUnavailable(error) });
    this.search = new NewPuzzlePhotosStore({ ...deps, unavailable: (error) => this.markUnavailable(error) });
    makeAutoObservable(this, { featured: false, search: false }, { autoBind: true });
  }

  get isEnabled(): boolean {
    return this.availability === 'enabled';
  }

  // Why there are no photos to show, if Unsplash is off or paused.
  get notice(): string | null {
    const { t } = this.#deps;

    if (this.availability === 'disabled') return t('newPuzzle.photos.disabled');

    return this.availability === 'rateLimited' ? t('newPuzzle.photos.rateLimited') : null;
  }

  get chips(): NewPuzzleUnsplashChipView[] {
    const { t } = this.#deps;
    const keys: NewPuzzleUnsplashChip[] = ['picks', ...unsplashTopics.map((topic) => topic.slug)];

    return keys.map((key) => ({ key, label: t(`newPuzzle.topics.${key}`), isActive: key === this.chip }));
  }

  get canSearch(): boolean {
    return this.isEnabled && this.searchDraft.trim() !== '';
  }

  // Asks the server once whether Unsplash is set up; if it is, the featured photos load.
  check(): void {
    if (this.availability !== 'unknown') return;

    this.availability = 'checking';
    void this.#deps.picturesApi.unsplashStatus().then(this.receiveStatus);
  }

  receiveStatus(result: ApiResult<UnsplashStatus>): void {
    if (this.availability !== 'checking') return;

    // A failed check may be a blip: the next open of the dialog asks again.
    if (!result.ok) {
      this.availability = 'unknown';

      return;
    }

    this.availability = result.value.enabled ? 'enabled' : 'disabled';

    if (this.isEnabled) this.showChip(this.chip);
  }

  showChip(chip: NewPuzzleUnsplashChip): void {
    this.chip = chip;
    this.featured.show(chip === 'picks' ? { kind: 'featured' } : { kind: 'topic', slug: chip });
  }

  setSearchDraft(text: string): void {
    this.searchDraft = text;
  }

  submitSearch(): void {
    if (this.canSearch) {
      this.search.show({ kind: 'search', query: this.searchDraft.trim() });
    }
  }

  markUnavailable(error: ApiErrorCode | 'NETWORK'): void {
    if (error === 'UNSPLASH_RATE_LIMITED') {
      this.availability = 'rateLimited';
    } else if (error === 'UNSPLASH_DISABLED') {
      this.availability = 'disabled';
    }
  }
}
