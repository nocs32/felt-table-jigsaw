import type { ApiErrorCode, ImageLinkRequest, StoredImageInfo, UnsplashPhotoPage, UnsplashStatus } from '@felt-table/protocol';
import type { ApiResult, PicturesApiService } from './types';

const isApiErrorCode = (value: unknown): value is ApiErrorCode => typeof value === 'string' && /^[A-Z_]+$/u.test(value);

const errorOf = (json: unknown): ApiErrorCode => {
  const code = typeof json === 'object' && json !== null && 'error' in json ? json.error : null;

  return isApiErrorCode(code) ? code : 'SERVER_ERROR';
};

// core-api answers JSON, or an `ApiError` body on failure. Never rejects: a lost connection is NETWORK.
const request = async <T>(path: string, init?: RequestInit): Promise<ApiResult<T>> => {
  try {
    const response = await fetch(path, init);
    const json: unknown = await response.json().catch(() => null);

    return response.ok ? { ok: true, value: json as T } : { ok: false, error: errorOf(json) };
  } catch {
    return { ok: false, error: 'NETWORK' };
  }
};

const post = <T>(path: string, body: unknown): Promise<ApiResult<T>> =>
  request(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

// The picker's calls to core-api: the Unsplash proxy, and pictures from a link.
export const createPicturesApi = (): PicturesApiService => ({
  unsplashStatus: () => request<UnsplashStatus>('/api/unsplash/status'),
  unsplashFeatured: (page) => request<UnsplashPhotoPage>(`/api/unsplash/featured?page=${page}`),
  unsplashTopic: (slug, page) => request<UnsplashPhotoPage>(`/api/unsplash/topics/${slug}?page=${page}`),
  unsplashSearch: (query, page) => request<UnsplashPhotoPage>(`/api/unsplash/search?${new URLSearchParams({ query, page: String(page) })}`),
  imageFromLink: (url) => post<StoredImageInfo>('/api/images/from-link', { url } satisfies ImageLinkRequest),
});
