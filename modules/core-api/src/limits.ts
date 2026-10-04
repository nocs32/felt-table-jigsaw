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
  table: {
    // People at one table (spec §5.4). Seats held for reconnecting people count too.
    maxClients: 12,
    // An empty table is kept this long, then thrown away (spec §4.6).
    emptyGraceMs: 10 * 60 * 1000,
    // A dropped connection keeps its seat this long.
    reconnectSeconds: 20,
    // Feed items kept; the oldest go first.
    feedMaxItems: 200,
    // Hard cap on messages from one connection; Colyseus disconnects anyone above it.
    maxMessagesPerSecond: 40,
    // Per person and message type: at most `count` in any `windowMs`. Extra messages are refused.
    rates: {
      chat: { count: 5, windowMs: 5000 },
      react: { count: 8, windowMs: 1000 },
      setBackground: { count: 10, windowMs: 5000 },
      renameRoom: { count: 10, windowMs: 10_000 },
      updateProfile: { count: 10, windowMs: 10_000 },
    },
  },
} as const;
