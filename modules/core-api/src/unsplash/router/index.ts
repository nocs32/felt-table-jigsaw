import { Router } from 'express';
import { unsplashFeaturedHandler, unsplashSearchHandler, unsplashTopicHandler } from './list-handlers.js';
import type { UnsplashService } from '../service/index.js';
import { unsplashStatusHandler } from './status-handler.js';
import { unsplashUseHandler } from './use-handler.js';

// Mounted at /api/unsplash. Errors are thrown as ApiErrorException and answered by errorMiddleware.
export const createUnsplashRouter = (service: UnsplashService): Router => {
  const router = Router();

  router.get('/status', unsplashStatusHandler(service));
  router.get('/featured', unsplashFeaturedHandler(service));
  router.get('/topics/:slug', unsplashTopicHandler(service));
  router.get('/search', unsplashSearchHandler(service));
  router.post('/photos/:id/use', unsplashUseHandler(service));

  return router;
};
