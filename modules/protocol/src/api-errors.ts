// Error codes for core-api's HTTP endpoints. Every non-2xx JSON response has the `ApiError` shape.
// INVALID_REQUEST 400, NOT_FOUND 404, UNSPLASH_RATE_LIMITED 429, UNSPLASH_UNAVAILABLE 502, UNSPLASH_DISABLED 503.
export type ApiErrorCode =
  | 'INVALID_REQUEST'
  | 'NOT_FOUND'
  | 'UNSPLASH_DISABLED'
  | 'UNSPLASH_RATE_LIMITED'
  | 'UNSPLASH_UNAVAILABLE';

export interface ApiError {
  error: ApiErrorCode;
  // Human-readable, safe to show to the user.
  message: string;
}
