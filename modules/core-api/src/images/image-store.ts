import { ApiErrorException } from '../errors/index.js';

export interface StoredImage {
  id: string;
  bytes: Uint8Array;
  contentType: string;
  width: number;
  height: number;
  // The link it came from.
  sourceUrl: string;
}

export interface ImageStoreDeps {
  createId: () => string;
  // Runs `callback` once after `delayMs`; returns a function that cancels it.
  schedule: (callback: () => void, delayMs: number) => () => void;
  maxTotalBytes: number;
  unheldTtlMs: number;
}

interface ImageStoreEntry {
  image: StoredImage;
  // Tables showing it. While one does, it never expires.
  holders: number;
  cancelExpiry: (() => void) | null;
}

// Pictures kept in memory (no database, spec §7.4). Each image is either held by tables or not;
// one nobody holds is thrown away after `unheldTtlMs`, so an image goes with the last table using it.
export class ImageStore {
  readonly #entries = new Map<string, ImageStoreEntry>();
  readonly #deps: ImageStoreDeps;
  #totalBytes = 0;

  constructor(deps: ImageStoreDeps) {
    this.#deps = deps;
  }

  get size(): number {
    return this.#entries.size;
  }

  get totalBytes(): number {
    return this.#totalBytes;
  }

  put(image: Omit<StoredImage, 'id'>): StoredImage {
    if (this.#totalBytes + image.bytes.byteLength > this.#deps.maxTotalBytes) {
      throw new ApiErrorException('SERVER_BUSY', 'The server is busy. Try again in a bit.');
    }

    const stored = { ...image, id: this.#deps.createId() };
    const entry: ImageStoreEntry = { image: stored, holders: 0, cancelExpiry: null };

    this.#entries.set(stored.id, entry);
    this.#totalBytes += stored.bytes.byteLength;
    this.#armExpiry(entry);

    return stored;
  }

  get(id: string): StoredImage | undefined {
    return this.#entries.get(id)?.image;
  }

  // A table starts showing it.
  hold(id: string): void {
    const entry = this.#entries.get(id);

    if (entry) {
      entry.holders += 1;
      entry.cancelExpiry?.();
      entry.cancelExpiry = null;
    }
  }

  // A table stops showing it (a new puzzle, or the table closed).
  release(id: string): void {
    const entry = this.#entries.get(id);

    if (entry && entry.holders > 0) {
      entry.holders -= 1;

      if (entry.holders === 0) this.#armExpiry(entry);
    }
  }

  dispose(): void {
    this.#entries.forEach((entry) => entry.cancelExpiry?.());
    this.#entries.clear();
    this.#totalBytes = 0;
  }

  #armExpiry(entry: ImageStoreEntry): void {
    entry.cancelExpiry = this.#deps.schedule(() => this.#delete(entry.image.id), this.#deps.unheldTtlMs);
  }

  #delete(id: string): void {
    const entry = this.#entries.get(id);

    if (entry) {
      this.#entries.delete(id);
      this.#totalBytes -= entry.image.bytes.byteLength;
    }
  }
}
