import type { RequestHandler } from 'express';
import { validateInput } from '../../validation/index.js';
import { unsplashPhotoParamsSchema } from './schemas.js';
import type { UnsplashService } from '../service/index.js';

// POST /photos/:id/use: the user picked this photo for a puzzle (Unsplash download tracking). 204 on success.
export const unsplashUseHandler = (service: UnsplashService): RequestHandler => async (request, response) => {
  const { id } = validateInput(unsplashPhotoParamsSchema, request.params);

  await service.use(id);
  response.status(204).end();
};
