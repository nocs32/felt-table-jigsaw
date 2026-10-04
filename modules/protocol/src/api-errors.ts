// Error codes for core-api's HTTP endpoints. Every non-2xx JSON response has the `ApiError` shape.
// Statuses: INVALID_REQUEST 400, IMAGE_LINK_INVALID 400, NOT_FOUND 404, IMAGE_TOO_LARGE 413,
// NOT_AN_IMAGE 415, IMAGE_TOO_SMALL 422, UNSPLASH_RATE_LIMITED 429, SERVER_ERROR 500,
// UNSPLASH_UNAVAILABLE 502, IMAGE_LINK_UNREACHABLE 502, UNSPLASH_DISABLED 503, SERVER_BUSY 503.
export type ApiErrorCode =
  | 'INVALID_REQUEST'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'SERVER_BUSY'
  | 'UNSPLASH_DISABLED'
  | 'UNSPLASH_RATE_LIMITED'
  | 'UNSPLASH_UNAVAILABLE'
  // Not an http(s) link, or one that points inside a private network.
  | 'IMAGE_LINK_INVALID'
  // The link didn't answer with a file (down, timed out, or an error page).
  | 'IMAGE_LINK_UNREACHABLE'
  // The file isn't a JPG, PNG, WebP or GIF picture.
  | 'NOT_AN_IMAGE'
  | 'IMAGE_TOO_LARGE'
  | 'IMAGE_TOO_SMALL';

export interface ApiError {
  error: ApiErrorCode;
  // Human-readable, safe to show to the user.
  message: string;
}
