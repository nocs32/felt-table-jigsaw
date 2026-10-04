import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { nanoid } from 'nanoid';
import { tableRoomName } from '@felt-table/protocol';
import { config } from './config.js';
import { describeError, errorMiddleware, notFoundMiddleware } from './errors/index.js';
import { healthRouter } from './health/index.js';
import { createImagesRouter, ImageLinkFetcher, ImagesService, ImageStore } from './images/index.js';
import { limits } from './limits.js';
import { logger } from './logger.js';
import { TableRoom, type TableRoomOptions } from './table-room/index.js';
import { createTableRoomPictures } from './table-room/pictures.js';
import { UnsplashClient, UnsplashService, createUnsplashRouter } from './unsplash/index.js';

const unsplashService = new UnsplashService(new UnsplashClient(config.unsplashAccessKey), config.unsplashCollectionId);

const imageStore = new ImageStore({
  createId: nanoid,
  schedule: (callback, delayMs) => {
    const timer = setTimeout(callback, delayMs).unref();

    return () => clearTimeout(timer);
  },
  maxTotalBytes: limits.images.maxTotalBytes,
  unheldTtlMs: limits.images.unheldTtlMs,
});

const imageLinkFetcher = new ImageLinkFetcher({
  maxBytes: limits.images.maxBytes,
  timeoutMs: limits.images.fetchTimeoutMs,
  maxRedirects: limits.images.maxRedirects,
});

const imagesService = new ImagesService(imageStore, imageLinkFetcher, limits.images.maxConcurrentFetches);

// One HTTP server for both: Colyseus answers its matchmaking routes and the WebSocket upgrades
// for live tables; every other request falls through to the Express app below.
const server = new Server({
  transport: new WebSocketTransport(),
  greet: false,
  express: (app) => {
    app.use('/api/health', healthRouter);
    app.use('/api/unsplash', createUnsplashRouter(unsplashService));
    app.use('/api/images', createImagesRouter(imagesService));
    app.use('/api', notFoundMiddleware);
    app.use(errorMiddleware);
  },
});

const tableRoomOptions: TableRoomOptions = { pictures: createTableRoomPictures({ unsplash: unsplashService, images: imageStore }) };

server.define(tableRoomName, TableRoom, tableRoomOptions);

server.listen(config.port).then(
  () => {
    logger.info('core-api listening', {
      url: `http://localhost:${config.port}`,
      unsplash: unsplashService.status().enabled ? 'enabled' : 'disabled (no UNSPLASH_ACCESS_KEY)',
    });
  },
  (error: unknown) => {
    logger.error('core-api failed to start', { port: config.port, error: describeError(error) });
    process.exitCode = 1;
  },
);
