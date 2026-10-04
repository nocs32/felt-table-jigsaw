import type { RequestHandler } from 'express';
import type { UnsplashService } from '../service/index.js';

// GET /status: whether the photo picker can be offered at all. Never calls Unsplash.
export const unsplashStatusHandler = (service: UnsplashService): RequestHandler => (_request, response) => {
  response.json(service.status());
};
