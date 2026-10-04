interface UnsplashClientCacheEntry<TValue> {
  value: TValue;
  expiresAt: number;
}

export interface UnsplashClientCacheOptions {
  ttlMs: number;
  maxEntries: number;
}

// In-memory TTL cache for upstream responses, keyed by URL. Bounded: the oldest entry is evicted first.
export class UnsplashClientCache<TValue> {
  private readonly entries = new Map<string, UnsplashClientCacheEntry<TValue>>();

  private readonly ttlMs: number;

  private readonly maxEntries: number;

  constructor(options: UnsplashClientCacheOptions) {
    this.ttlMs = options.ttlMs;
    this.maxEntries = options.maxEntries;
  }

  get(key: string): TValue | undefined {
    const entry = this.entries.get(key);

    if (entry === undefined) {
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);

      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: TValue): void {
    // Re-inserting moves the key to the end, so Map order stays oldest-first.
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: Date.now() + this.ttlMs });

    for (const oldestKey of this.entries.keys()) {
      if (this.entries.size <= this.maxEntries) {
        break;
      }

      this.entries.delete(oldestKey);
    }
  }

  delete(key: string): void {
    this.entries.delete(key);
  }

  dispose(): void {
    this.entries.clear();
  }
}
