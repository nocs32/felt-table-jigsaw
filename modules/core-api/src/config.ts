import { fileURLToPath } from 'node:url';

export interface Config {
  port: number;
  // Unsplash access key, sent only server-side as `Authorization: Client-ID <key>`. null turns the Unsplash proxy off.
  unsplashAccessKey: string | null;
  // Optional collection for the "Featured" list. null = popular photos from the Wallpapers topic.
  unsplashCollectionId: string | null;
}

const defaultPort = 2567;

const collectionIdPattern = /^[A-Za-z0-9_-]{1,64}$/;

// modules/core-api/.env (see .env.example). It is optional: real environment variables work too.
const loadEnvFile = (): void => {
  try {
    process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
  } catch (error) {
    const missing = error instanceof Error && 'code' in error && error.code === 'ENOENT';

    if (!missing) {
      throw error;
    }
  }
};

const readPort = (value: string | undefined): number => {
  const port = Number(value ?? defaultPort);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`CORE_API_PORT must be a positive integer, got "${value}"`);
  }

  return port;
};

const readOptional = (value: string | undefined): string | null => {
  const trimmed = value?.trim() ?? '';

  return trimmed === '' ? null : trimmed;
};

const readCollectionId = (value: string | undefined): string | null => {
  const collectionId = readOptional(value);

  if (collectionId !== null && !collectionIdPattern.test(collectionId)) {
    throw new Error(`UNSPLASH_COLLECTION_ID must be an Unsplash collection id, got "${collectionId}"`);
  }

  return collectionId;
};

loadEnvFile();

// CORE_API_PORT, not PORT: tools that start the whole workspace often set PORT for the web dev server.
export const config: Config = {
  port: readPort(process.env.CORE_API_PORT),
  unsplashAccessKey: readOptional(process.env.UNSPLASH_ACCESS_KEY),
  unsplashCollectionId: readCollectionId(process.env.UNSPLASH_COLLECTION_ID),
};
