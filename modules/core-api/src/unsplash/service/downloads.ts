// Remembers each served photo's `links.download_location`, so POST /photos/:id/use can ping the exact URL
// Unsplash gave us. Bounded: the oldest photo is forgotten first (the caller then falls back to /photos/:id/download).
export class UnsplashServiceDownloads {
  private readonly locations = new Map<string, string>();

  private readonly maxEntries: number;

  constructor(maxEntries: number) {
    this.maxEntries = maxEntries;
  }

  remember(photoId: string, location: string): void {
    this.locations.delete(photoId);
    this.locations.set(photoId, location);

    for (const oldestId of this.locations.keys()) {
      if (this.locations.size <= this.maxEntries) {
        break;
      }

      this.locations.delete(oldestId);
    }
  }

  locationOf(photoId: string): string | undefined {
    return this.locations.get(photoId);
  }

  dispose(): void {
    this.locations.clear();
  }
}
