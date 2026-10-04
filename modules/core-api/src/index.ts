import express from 'express';
import { config } from './config.js';
import { healthRouter } from './health/healthRouter.js';
import { logger } from './logger.js';

const app = express();

app.use('/api/health', healthRouter);

app.listen(config.port, (error) => {
  if (error) {
    logger.error('core-api failed to start', { port: config.port, error: error.message });
    process.exitCode = 1;

    return;
  }

  logger.info('core-api listening', { url: `http://localhost:${config.port}` });
});
