/**
 * A small in-memory cache for public GET responses, keyed by URL.
 *
 * Website content changes only when someone saves in the dashboard, so most public requests can be
 * answered without touching the database. Every successful admin write clears the cache
 * (see src/routes/admin.ts), so this server shows a change immediately.
 *
 * With several server instances, each has its own cache: another instance can show the old content
 * for up to the TTL. Keep PUBLIC_CACHE_TTL_SECONDS short, or set it to 0 and use a CDN instead.
 */
export class ResponseCache {
  private readonly entries = new Map<string, { body: string; expires: number }>();

  constructor(
    private readonly ttlMs: number,
    /** Bounds memory when clients send many different query strings. */
    private readonly maxEntries = 500,
  ) {}

  get enabled() {
    return this.ttlMs > 0;
  }

  get(key: string): string | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expires <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.body;
  }

  set(key: string, body: string) {
    if (!this.enabled) return;
    this.entries.delete(key);
    if (this.entries.size >= this.maxEntries) {
      // Maps keep insertion order, so the first key is the oldest.
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(key, { body, expires: Date.now() + this.ttlMs });
  }

  clear() {
    this.entries.clear();
  }

  get size() {
    return this.entries.size;
  }
}
