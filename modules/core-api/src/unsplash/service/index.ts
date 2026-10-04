import type { UnsplashPhoto, UnsplashPhotoPage, UnsplashStatus, UnsplashTopic } from '@felt-table/protocol';
import { limits } from '../../limits.js';
import type { UnsplashClient, UnsplashClientQuery } from '../client/index.js';
import { unsplashMapper, type UnsplashApiPhoto } from '../mapper.js';
import { UnsplashServicePhotos } from './photos.js';

export type UnsplashSearchOrientation = 'landscape' | 'any';

export interface UnsplashSearchInput {
  query: string;
  page: number;
  orientation: UnsplashSearchOrientation;
}

const perPage = limits.unsplash.perPage;

// Used when no UNSPLASH_COLLECTION_ID is configured.
const defaultFeaturedTopic = 'wallpapers';

// The photo picker's use cases: browse, search, and report a pick to Unsplash.
export class UnsplashService {
  private readonly client: UnsplashClient;

  private readonly collectionId: string | null;

  private readonly photos = new UnsplashServicePhotos(limits.unsplash.photosRemembered);

  constructor(client: UnsplashClient, collectionId: string | null) {
    this.client = client;
    this.collectionId = collectionId;
  }

  status(): UnsplashStatus {
    return { enabled: this.client.enabled };
  }

  featured(page: number): Promise<UnsplashPhotoPage> {
    if (this.collectionId === null) {
      return this.list(`/topics/${defaultFeaturedTopic}/photos`, { order_by: 'popular' }, page);
    }

    return this.list(`/collections/${encodeURIComponent(this.collectionId)}/photos`, {}, page);
  }

  topic(slug: UnsplashTopic, page: number): Promise<UnsplashPhotoPage> {
    return this.list(`/topics/${slug}/photos`, {}, page);
  }

  async search(input: UnsplashSearchInput): Promise<UnsplashPhotoPage> {
    const orientation: UnsplashClientQuery = input.orientation === 'any' ? {} : { orientation: input.orientation };

    const json = await this.client.getJson('/search/photos', {
      query: input.query,
      ...orientation,
      content_filter: 'high',
      page: input.page,
      per_page: perPage,
    });

    const result = unsplashMapper.readSearch(json);

    return { photos: this.toPhotos(result.photos), page: input.page, hasMore: input.page < result.totalPages };
  }

  // One photo, for starting a puzzle: usually one the picker was just shown, else asked from Unsplash.
  async photo(photoId: string): Promise<UnsplashPhoto> {
    const known = this.photos.get(photoId);

    if (known !== undefined) {
      return known.photo;
    }

    const path = `/photos/${encodeURIComponent(photoId)}`;

    return this.remember(unsplashMapper.readPhoto(await this.client.getJson(path, {}), path));
  }

  // Unsplash API guideline: when a user picks a photo, hit its download_location once.
  async use(photoId: string): Promise<void> {
    await this.client.ping(this.photos.get(photoId)?.downloadLocation ?? `/photos/${encodeURIComponent(photoId)}/download`);
  }

  dispose(): void {
    this.photos.dispose();
    this.client.dispose();
  }

  private async list(path: string, query: UnsplashClientQuery, page: number): Promise<UnsplashPhotoPage> {
    const json = await this.client.getJson(path, { ...query, orientation: 'landscape', page, per_page: perPage });
    const photos = this.toPhotos(unsplashMapper.readList(json, path));

    return { photos, page, hasMore: photos.length === perPage };
  }

  private toPhotos(rawPhotos: UnsplashApiPhoto[]): UnsplashPhoto[] {
    return rawPhotos.map((rawPhoto) => this.remember(rawPhoto));
  }

  private remember(rawPhoto: UnsplashApiPhoto): UnsplashPhoto {
    const photo = unsplashMapper.toPhoto(rawPhoto);

    this.photos.remember({ photo, downloadLocation: rawPhoto.links.download_location });

    return photo;
  }
}
