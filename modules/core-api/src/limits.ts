// Every rate limit, size cap and timeout of core-api, in one place.
export const limits = {
  unsplash: {
    // Photos per page on every list endpoint.
    perPage: 24,
    // Highest `page` a client may ask for.
    maxPage: 50,
    // Search text length, after trimming.
    queryMaxLength: 80,
    // Upstream responses are cached by URL for this long.
    cacheTtlMs: 5 * 60 * 1000,
    // Cached responses kept at most; the oldest is evicted first.
    cacheMaxEntries: 200,
    // Photos whose `download_location` is remembered for POST /photos/:id/use.
    downloadLocationsMax: 500,
    // Abort an upstream request after this long.
    requestTimeoutMs: 8000,
    // Log a warning when Unsplash reports fewer requests left this hour.
    rateLimitWarnBelow: 10,
  },
} as const;
