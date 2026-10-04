import { unsplashPhotoIdPattern, unsplashTopics } from '@felt-table/protocol';
import * as v from 'valibot';
import { limits } from '../../limits.js';

// Request schemas for unsplashRouter. Query values arrive as strings; unknown fields are rejected.

const pageSchema = v.optional(
  v.pipe(
    v.string(),
    v.regex(/^\d{1,4}$/, 'page must be a whole number'),
    v.transform(Number),
    v.integer(),
    v.minValue(1),
    v.maxValue(limits.unsplash.maxPage),
  ),
  '1',
);

export const unsplashPageQuerySchema = v.strictObject({ page: pageSchema });

export const unsplashTopicParamsSchema = v.strictObject({
  slug: v.picklist(unsplashTopics.map((topic) => topic.slug), 'Unknown topic'),
});

export const unsplashSearchQuerySchema = v.strictObject({
  query: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(limits.unsplash.queryMaxLength)),
  page: pageSchema,
  orientation: v.optional(v.picklist(['landscape', 'any']), 'landscape'),
});

export const unsplashPhotoParamsSchema = v.strictObject({
  id: v.pipe(v.string(), v.regex(unsplashPhotoIdPattern, 'Invalid photo id')),
});
