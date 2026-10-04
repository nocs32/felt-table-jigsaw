export interface TableRoomRate {
  count: number;
  windowMs: number;
}

// Sliding-window limits per person and message type: at most `count` in any `windowMs`.
export class TableRoomRateLimits<TKind extends string> {
  readonly #rates: Readonly<Record<TKind, TableRoomRate>>;
  readonly #now: () => number;
  readonly #hits = new Map<string, number[]>();

  constructor(rates: Readonly<Record<TKind, TableRoomRate>>, now: () => number) {
    this.#rates = rates;
    this.#now = now;
  }

  // Records the attempt and says whether it's within the limit.
  allow(sessionId: string, kind: TKind): boolean {
    const { count, windowMs } = this.#rates[kind];
    const key = `${kind}:${sessionId}`;
    const now = this.#now();
    const recent = (this.#hits.get(key) ?? []).filter((at) => now - at < windowMs);

    if (recent.length >= count) {
      this.#hits.set(key, recent);

      return false;
    }

    this.#hits.set(key, [...recent, now]);

    return true;
  }

  forget(sessionId: string): void {
    (Object.keys(this.#rates) as TKind[]).forEach((kind) => this.#hits.delete(`${kind}:${sessionId}`));
  }

  dispose(): void {
    this.#hits.clear();
  }
}
