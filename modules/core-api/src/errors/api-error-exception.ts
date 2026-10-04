import type { ApiError, ApiErrorCode } from '@felt-table/protocol';

const statusByCode: Record<ApiErrorCode, number> = {
  INVALID_REQUEST: 400,
  IMAGE_LINK_INVALID: 400,
  NOT_FOUND: 404,
  IMAGE_TOO_LARGE: 413,
  NOT_AN_IMAGE: 415,
  IMAGE_TOO_SMALL: 422,
  UNSPLASH_RATE_LIMITED: 429,
  SERVER_ERROR: 500,
  UNSPLASH_UNAVAILABLE: 502,
  IMAGE_LINK_UNREACHABLE: 502,
  UNSPLASH_DISABLED: 503,
  SERVER_BUSY: 503,
};

// Thrown anywhere in a request; errorMiddleware turns it into an `ApiError` JSON response.
// The message is sent to the client, so it must never contain secrets or upstream details.
export class ApiErrorException extends Error {
  readonly code: ApiErrorCode;

  readonly status: number;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = 'ApiErrorException';
    this.code = code;
    this.status = statusByCode[code];
  }

  toJson(): ApiError {
    return { error: this.code, message: this.message };
  }
}
