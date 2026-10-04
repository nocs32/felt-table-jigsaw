import type { RequestHandler } from 'express';
import { validateInput } from '../../validation/index.js';
import {
  unsplashPageQuerySchema,
  unsplashSearchQuerySchema,
  unsplashTopicParamsSchema,
} from './schemas.js';
import type { UnsplashService } from '../service/index.js';

// GET /featured?page=N
export const unsplashFeaturedHandler = (service: UnsplashService): RequestHandler => async (request, response) => {
  const { page } = validateInput(unsplashPageQuerySchema, request.query);

  response.json(await service.featured(page));
};

// GET /topics/:slug?page=N
export const unsplashTopicHandler = (service: UnsplashService): RequestHandler => async (request, response) => {
  const { slug } = validateInput(unsplashTopicParamsSchema, request.params);
  const { page } = validateInput(unsplashPageQuerySchema, request.query);

  response.json(await service.topic(slug, page));
};

// GET /search?query=text&page=N&orientation=landscape|any
export const unsplashSearchHandler = (service: UnsplashService): RequestHandler => async (request, response) => {
  const input = validateInput(unsplashSearchQuerySchema, request.query);

  response.json(await service.search(input));
};
