import express from 'express';
import { config } from './config.js';
import { errorMiddleware, notFoundMiddleware } from './errors/index.js';
import { healthRouter } from './health/index.js';
import { logger } from './logger.js';
import { UnsplashClient, UnsplashService, createUnsplashRouter } from './unsplash/index.js';

const unsplashService = new UnsplashService(new UnsplashClient(config.unsplashAccessKey), config.unsplashCollectionId);

const app = express();

app.use('/api/health', healthRouter);
app.use('/api/unsplash', createUnsplashRouter(unsplashService));
app.use('/api', notFoundMiddleware);
app.use(errorMiddleware);

app.listen(config.port, (error) => {
  if (error) {
    logger.error('core-api failed to start', { port: config.port, error: error.message });
    process.exitCode = 1;

    return;
  }

  logger.info('core-api listening', {
    url: `http://localhost:${config.port}`,
    unsplash: unsplashService.status().enabled ? 'enabled' : 'disabled (no UNSPLASH_ACCESS_KEY)',
  });
});
