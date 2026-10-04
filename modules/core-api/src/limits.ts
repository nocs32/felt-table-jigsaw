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
    // Photos the picker was shown that are remembered, for starting puzzles and download tracking.
    photosRemembered: 500,
    // Abort an upstream request after this long.
    requestTimeoutMs: 8000,
    // Log a warning when Unsplash reports fewer requests left this hour.
    rateLimitWarnBelow: 10,
  },
  images: {
    // A linked image may be at most this big to download...
    maxBytes: 15 * 1024 * 1024,
    // ...and at most this many pixels, so every browser at the table can decode it.
    maxPixels: 40_000_000,
    // The short side must be at least this long to make a puzzle from.
    minSide: 200,
    // All stored images together. Past this, new ones are refused until old ones expire.
    maxTotalBytes: 256 * 1024 * 1024,
    // An image no table is using is thrown away after this long (spec §7.4).
    unheldTtlMs: 30 * 60 * 1000,
    // Give up on a link after this long: connecting, redirects and downloading together.
    fetchTimeoutMs: 10_000,
    // Redirects followed for one link.
    maxRedirects: 3,
    // Links fetched at the same time. More are refused as busy.
    maxConcurrentFetches: 4,
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
    // Hard cap on messages from one connection; Colyseus disconnects anyone above it. Dragging
    // sends moves and cursor positions together, each at most about 20 a second.
    maxMessagesPerSecond: 100,
    // Per person and message type: at most `count` in any `windowMs`. Extra messages are refused.
    rates: {
      chat: { count: 5, windowMs: 5000 },
      react: { count: 8, windowMs: 1000 },
      setBackground: { count: 10, windowMs: 5000 },
      renameRoom: { count: 10, windowMs: 10_000 },
      updateProfile: { count: 10, windowMs: 10_000 },
      newPuzzle: { count: 3, windowMs: 10_000 },
      needGeometry: { count: 5, windowMs: 10_000 },
      arrange: { count: 5, windowMs: 5000 },
      grab: { count: 20, windowMs: 1000 },
      move: { count: 40, windowMs: 1000 },
      drop: { count: 20, windowMs: 1000 },
      cursor: { count: 40, windowMs: 1000 },
    },
  },
} as const;
