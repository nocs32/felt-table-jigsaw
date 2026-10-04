import type { UnsplashPhoto } from '@felt-table/protocol';

export interface UnsplashServicePhotosEntry {
  photo: UnsplashPhoto;
  // Unsplash's `links.download_location`, pinged when someone starts a puzzle from the photo.
  downloadLocation: string;
}

// Remembers the photos the picker was shown, so a table can start a puzzle from one without asking
// Unsplash again, and so its download can be tracked at the exact URL Unsplash gave us.
// Bounded: the oldest photo is forgotten first (callers then fetch it again).
export class UnsplashServicePhotos {
  private readonly entries = new Map<string, UnsplashServicePhotosEntry>();

  private readonly maxEntries: number;

  constructor(maxEntries: number) {
    this.maxEntries = maxEntries;
  }

  remember(entry: UnsplashServicePhotosEntry): void {
    this.entries.delete(entry.photo.id);
    this.entries.set(entry.photo.id, entry);

    for (const oldestId of this.entries.keys()) {
      if (this.entries.size <= this.maxEntries) {
        break;
      }

      this.entries.delete(oldestId);
    }
  }

  get(photoId: string): UnsplashServicePhotosEntry | undefined {
    return this.entries.get(photoId);
  }

  dispose(): void {
    this.entries.clear();
  }
}
