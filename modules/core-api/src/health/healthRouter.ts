import { Router } from 'express';

export const healthRouter: Router = Router();

healthRouter.get('/', (_request, response) => {
  response.json({ ok: true, uptime: process.uptime() });
});
