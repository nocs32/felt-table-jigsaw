import * as v from 'valibot';
import { ApiErrorException } from '../errors/api-error-exception.js';

// Parses request input (params, query, body) with a valibot schema, or throws a typed 400.
export const validateInput = <TSchema extends v.GenericSchema>(schema: TSchema, input: unknown): v.InferOutput<TSchema> => {
  const result = v.safeParse(schema, input);

  if (result.success) {
    return result.output;
  }

  const issue = result.issues[0];
  const path = v.getDotPath(issue);

  throw new ApiErrorException('INVALID_REQUEST', path === null ? issue.message : `${path}: ${issue.message}`);
};
