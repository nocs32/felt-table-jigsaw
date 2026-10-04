import { ApiErrorException } from '../../errors/api-error-exception.js';
import { describeError } from '../../errors/describe-error.js';
import { limits } from '../../limits.js';
import { logger } from '../../logger.js';
import { UnsplashClientCache } from './cache.js';

export type UnsplashClientQuery = Record<string, string | number>;

// The access key is only ever sent to this origin.
const apiOrigin = 'https://api.unsplash.com';

const unavailable = (): ApiErrorException =>
  new ApiErrorException('UNSPLASH_UNAVAILABLE', 'Unsplash is not answering right now. Try again in a moment.');

const readRemaining = (response: Response): number | null => {
  const header = response.headers.get('x-ratelimit-remaining');
  const remaining = header === null ? Number.NaN : Number(header);

  return Number.isFinite(remaining) ? remaining : null;
};

const isRateLimited = (response: Response): boolean =>
  response.status === 429 || (response.status === 403 && readRemaining(response) === 0);

// Talks to api.unsplash.com: adds auth, caches GETs by URL, maps failures to typed errors and watches the rate limit.
export class UnsplashClient {
  private readonly accessKey: string | null;

  // Pending promises are cached too, so identical concurrent requests share one upstream call.
  private readonly cache = new UnsplashClientCache<Promise<unknown>>({
    ttlMs: limits.unsplash.cacheTtlMs,
    maxEntries: limits.unsplash.cacheMaxEntries,
  });

  constructor(accessKey: string | null) {
    this.accessKey = accessKey;
  }

  get enabled(): boolean {
    return this.accessKey !== null;
  }

  async getJson(path: string, query: UnsplashClientQuery): Promise<unknown> {
    const headers = this.authHeaders();
    const url = this.resolve(path, query);
    const cached = this.cache.get(url.href);

    if (cached !== undefined) {
      return cached;
    }

    const pending = this.fetchJson(url, headers).catch((error: unknown) => {
      this.cache.delete(url.href);
      throw error;
    });

    this.cache.set(url.href, pending);

    return pending;
  }

  // GET whose body is not needed (the download tracking ping). Never cached; failures still throw.
  async ping(location: string): Promise<void> {
    const headers = this.authHeaders();
    const response = await this.send(this.resolve(location, {}), headers);

    await response.body?.cancel();
  }

  dispose(): void {
    this.cache.dispose();
  }

  private authHeaders(): Record<string, string> {
    if (this.accessKey === null) {
      throw new ApiErrorException('UNSPLASH_DISABLED', 'Unsplash photos are not set up on this server.');
    }

    return { Authorization: `Client-ID ${this.accessKey}`, 'Accept-Version': 'v1' };
  }

  private resolve(pathOrUrl: string, query: UnsplashClientQuery): URL {
    const url = new URL(pathOrUrl, apiOrigin);

    if (url.origin !== apiOrigin) {
      logger.error('refused to call Unsplash outside its API origin', { origin: url.origin });
      throw unavailable();
    }

    for (const [name, value] of Object.entries(query)) {
      url.searchParams.set(name, String(value));
    }

    return url;
  }

  private async fetchJson(url: URL, headers: Record<string, string>): Promise<unknown> {
    const response = await this.send(url, headers);

    try {
      return await response.json();
    } catch (error) {
      logger.error('Unsplash sent an unreadable response', { path: url.pathname, error: describeError(error) });
      throw unavailable();
    }
  }

  private async send(url: URL, headers: Record<string, string>): Promise<Response> {
    let response: Response;

    try {
      response = await fetch(url, { headers, signal: AbortSignal.timeout(limits.unsplash.requestTimeoutMs) });
    } catch (error) {
      logger.error('Unsplash request failed', { path: url.pathname, error: describeError(error) });
      throw unavailable();
    }

    this.watchRateLimit(response, url);

    if (!response.ok) {
      throw await this.upstreamError(response, url);
    }

    return response;
  }

  private watchRateLimit(response: Response, url: URL): void {
    const remaining = readRemaining(response);

    logger.info('Unsplash request', { path: url.pathname, status: response.status, rateLimitRemaining: remaining });

    if (remaining !== null && remaining < limits.unsplash.rateLimitWarnBelow) {
      logger.warn('Unsplash rate limit is running low', {
        remaining,
        limit: response.headers.get('x-ratelimit-limit'),
      });
    }
  }

  private async upstreamError(response: Response, url: URL): Promise<ApiErrorException> {
    const body = await response.text().catch(() => '');
    // Unsplash error bodies are short JSON or text; the key is redacted in case one ever echoes it.
    const detail = (this.accessKey === null ? body : body.replaceAll(this.accessKey, '[redacted]')).slice(0, 200);

    if (isRateLimited(response)) {
      logger.warn('Unsplash rate limit reached', { path: url.pathname, status: response.status, detail });

      return new ApiErrorException('UNSPLASH_RATE_LIMITED', 'Unsplash photos are paused for now: the hourly limit is used up.');
    }

    logger.error('Unsplash answered with an error', { path: url.pathname, status: response.status, detail });

    return unavailable();
  }
}
