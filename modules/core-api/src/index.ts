import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { tableRoomName } from '@felt-table/protocol';
import { config } from './config.js';
import { describeError, errorMiddleware, notFoundMiddleware } from './errors/index.js';
import { healthRouter } from './health/index.js';
import { logger } from './logger.js';
import { TableRoom } from './table-room/index.js';
import { UnsplashClient, UnsplashService, createUnsplashRouter } from './unsplash/index.js';

const unsplashService = new UnsplashService(new UnsplashClient(config.unsplashAccessKey), config.unsplashCollectionId);

// One HTTP server for both: Colyseus answers its matchmaking routes and the WebSocket upgrades
// for live tables; every other request falls through to the Express app below.
const server = new Server({
  transport: new WebSocketTransport(),
  greet: false,
  express: (app) => {
    app.use('/api/health', healthRouter);
    app.use('/api/unsplash', createUnsplashRouter(unsplashService));
    app.use('/api', notFoundMiddleware);
    app.use(errorMiddleware);
  },
});

server.define(tableRoomName, TableRoom);

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
