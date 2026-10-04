import type { ApiError } from '@felt-table/protocol';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { logger } from '../logger.js';
import { ApiErrorException } from './api-error-exception.js';
import { describeError } from './describe-error.js';

// Express marks its own client errors (malformed URI, bad body) with a 4xx `status`.
const isClientError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return false;
  }

  return typeof error.status === 'number' && error.status >= 400 && error.status < 500;
};

// Mounted after every /api router: any /api path nobody answered is a typed 404.
export const notFoundMiddleware: RequestHandler = (request, _response, next) => {
  next(new ApiErrorException('NOT_FOUND', `No such endpoint: ${request.method} ${request.baseUrl}${request.path}`));
};

// The one place that turns thrown errors into `ApiError` JSON responses.
export const errorMiddleware: ErrorRequestHandler = (error: unknown, request, response, next) => {
  if (response.headersSent) {
    next(error);

    return;
  }

  if (error instanceof ApiErrorException) {
    response.status(error.status).json(error.toJson());

    return;
  }

  if (isClientError(error)) {
    response.status(400).json(new ApiErrorException('INVALID_REQUEST', 'Malformed request').toJson());

    return;
  }

  // A bug, not an upstream failure. The contract has no generic code, so the closest one is used with a 500.
  logger.error('unhandled request error', { method: request.method, path: request.baseUrl + request.path, error: describeError(error) });

  const body: ApiError = { error: 'UNSPLASH_UNAVAILABLE', message: 'Unexpected server error' };

  response.status(500).json(body);
};
