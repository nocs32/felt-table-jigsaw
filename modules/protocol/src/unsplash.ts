// Shapes served by core-api's Unsplash proxy (`/api/unsplash/*`).
// The browser never talks to api.unsplash.com directly: the access key stays on the server.
// Image URLs (thumbUrl, previewUrl, puzzleUrl) point straight at images.unsplash.com, as Unsplash requires (hotlinking).

export interface UnsplashAuthor {
  name: string;
  // Unsplash profile page, with the referral utm parameters (attribution guideline).
  profileUrl: string;
}

export interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  // Dominant colour as hex: a placeholder while the image loads.
  color: string;
  // alt_description ?? description ?? 'Photo'.
  description: string;
  // urls.small: grid thumbnails.
  thumbUrl: string;
  // urls.regular: large preview.
  previewUrl: string;
  // urls.raw resized to 2400px wide JPEG: the image the puzzle is cut from.
  puzzleUrl: string;
  // Photo page on unsplash.com, with the referral utm parameters.
  photoUrl: string;
  author: UnsplashAuthor;
}

export interface UnsplashPhotoPage {
  photos: UnsplashPhoto[];
  page: number;
  hasMore: boolean;
}

export interface UnsplashStatus {
  // True when the server has an Unsplash access key configured.
  enabled: boolean;
}

export type UnsplashTopic = 'nature' | 'animals' | 'architecture-interior' | 'food-drink' | 'arts-culture' | 'travel';

export const unsplashTopics: readonly { slug: UnsplashTopic; label: string }[] = [
  { slug: 'nature', label: 'Nature' },
  { slug: 'animals', label: 'Animals' },
  { slug: 'architecture-interior', label: 'Architecture' },
  { slug: 'food-drink', label: 'Food' },
  { slug: 'arts-culture', label: 'Art' },
  { slug: 'travel', label: 'Travel' },
];

// Appended to every link back to unsplash.com (attribution guideline).
export const unsplashUtm = 'utm_source=felt_table&utm_medium=referral';
