import { imageIdPattern, imageLinkMaxLength } from '@felt-table/protocol';
import { json, Router, type RequestHandler } from 'express';
import * as v from 'valibot';
import { validateInput } from '../validation/index.js';
import type { ImagesService } from './service.js';

const linkBodySchema = v.strictObject({
  url: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(imageLinkMaxLength)),
});

const imageParamsSchema = v.strictObject({ id: v.pipe(v.string(), v.regex(imageIdPattern, 'Invalid image id')) });

// POST /from-link { url }: 201 with the stored image's id and size.
const imagesFromLinkHandler = (service: ImagesService): RequestHandler => async (request, response) => {
  const { url } = validateInput(linkBodySchema, request.body);

  response.status(201).json(await service.fromLink(url));
};

// GET /:id: the image bytes. An id always means the same bytes, so browsers may keep them.
const imagesGetHandler = (service: ImagesService): RequestHandler => (request, response) => {
  const { id } = validateInput(imageParamsSchema, request.params);
  const image = service.get(id);

  response
    .type(image.contentType)
    .set({
      'Cache-Control': 'private, max-age=86400, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
      'Cross-Origin-Resource-Policy': 'same-origin',
    })
    .send(Buffer.from(image.bytes.buffer, image.bytes.byteOffset, image.bytes.byteLength));
};

// Mounted at /api/images. Errors are thrown as ApiErrorException and answered by errorMiddleware.
export const createImagesRouter = (service: ImagesService): Router => {
  const router = Router();

  router.post('/from-link', json({ limit: '8kb' }), imagesFromLinkHandler(service));
  router.get('/:id', imagesGetHandler(service));

  return router;
};
