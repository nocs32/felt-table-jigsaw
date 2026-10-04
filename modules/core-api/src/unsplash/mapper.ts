import { unsplashUtm, type UnsplashPhoto } from '@felt-table/protocol';
import { ApiErrorException } from '../errors/api-error-exception.js';
import { logger } from '../logger.js';

// The parts of Unsplash's photo JSON we use (https://unsplash.com/documentation#get-a-photo).
export interface UnsplashApiPhoto {
  id: string;
  width: number;
  height: number;
  color: string | null;
  description: string | null;
  alt_description: string | null;
  urls: { raw: string; regular: string; small: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
}

export interface UnsplashApiSearch {
  photos: UnsplashApiPhoto[];
  totalPages: number;
}

const fallbackColor = '#7f7f7f';

// The puzzle is cut from a 2400px-wide JPEG: big enough for 1000 pieces, small enough to load quickly.
const puzzleParams = 'w=2400&fm=jpg&q=85';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isApiPhoto = (value: unknown): value is UnsplashApiPhoto =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  isRecord(value.urls) &&
  isRecord(value.links) &&
  isRecord(value.user) &&
  isRecord(value.user.links);

const unexpectedShape = (endpoint: string): ApiErrorException => {
  logger.error('Unsplash sent an unexpected response shape', { endpoint });

  return new ApiErrorException('UNSPLASH_UNAVAILABLE', 'Unsplash sent something we could not read.');
};

const withQuery = (url: string, query: string): string => `${url}${url.includes('?') ? '&' : '?'}${query}`;

const toPhoto = (photo: UnsplashApiPhoto): UnsplashPhoto => ({
  id: photo.id,
  width: photo.width,
  height: photo.height,
  color: photo.color ?? fallbackColor,
  description: photo.alt_description ?? photo.description ?? 'Photo',
  thumbUrl: photo.urls.small,
  previewUrl: photo.urls.regular,
  puzzleUrl: withQuery(photo.urls.raw, puzzleParams),
  photoUrl: withQuery(photo.links.html, unsplashUtm),
  author: { name: photo.user.name, profileUrl: withQuery(photo.user.links.html, unsplashUtm) },
});

// A list endpoint answers with a bare array of photos.
const readList = (json: unknown, endpoint: string): UnsplashApiPhoto[] => {
  if (!Array.isArray(json)) {
    throw unexpectedShape(endpoint);
  }

  return json.filter(isApiPhoto);
};

// /photos/:id answers with one photo.
const readPhoto = (json: unknown, endpoint: string): UnsplashApiPhoto => {
  if (!isApiPhoto(json)) {
    throw unexpectedShape(endpoint);
  }

  return json;
};

// /search/photos answers with { total, total_pages, results }.
const readSearch = (json: unknown): UnsplashApiSearch => {
  if (!isRecord(json) || !Array.isArray(json.results) || typeof json.total_pages !== 'number') {
    throw unexpectedShape('/search/photos');
  }

  return { photos: json.results.filter(isApiPhoto), totalPages: json.total_pages };
};

// Raw Unsplash API JSON → the shapes in @felt-table/protocol.
export const unsplashMapper = { toPhoto, readList, readPhoto, readSearch };
