import type { StoredImageInfo } from '@felt-table/protocol';
import { ApiErrorException } from '../errors/index.js';
import { logger } from '../logger.js';
import type { ImageStore, StoredImage } from './image-store.js';
import type { ImageLinkFetcher } from './link-fetcher.js';
import { probeImage } from './probe.js';

// Pictures people bring themselves: fetched from a link, checked, and kept for their table.
export class ImagesService {
  private readonly store: ImageStore;

  private readonly fetcher: ImageLinkFetcher;

  private readonly maxConcurrentFetches: number;

  private fetching = 0;

  constructor(store: ImageStore, fetcher: ImageLinkFetcher, maxConcurrentFetches: number) {
    this.store = store;
    this.fetcher = fetcher;
    this.maxConcurrentFetches = maxConcurrentFetches;
  }

  async fromLink(link: string): Promise<StoredImageInfo> {
    if (this.fetching >= this.maxConcurrentFetches) {
      throw new ApiErrorException('SERVER_BUSY', 'The server is busy. Try again in a bit.');
    }

    this.fetching += 1;

    try {
      const { bytes, finalUrl } = await this.fetcher.fetch(link);
      const { contentType, width, height } = probeImage(bytes);
      const image = this.store.put({ bytes, contentType, width, height, sourceUrl: link });

      logger.info('image stored from a link', { imageId: image.id, host: new URL(finalUrl).host, bytes: bytes.byteLength });

      return { id: image.id, width, height, sourceUrl: link };
    } finally {
      this.fetching -= 1;
    }
  }

  get(id: string): StoredImage {
    const image = this.store.get(id);

    if (image === undefined) {
      throw new ApiErrorException('NOT_FOUND', 'That picture is gone.');
    }

    return image;
  }
}
