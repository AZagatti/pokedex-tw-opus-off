/**
 * Tiny in-memory response cache keyed by URL, plus in-flight request
 * de-duplication so concurrent callers (e.g. an infinite-scroll page firing 30
 * detail fetches) share a single network request per URL.
 *
 * No data-fetching library — just `fetch` + a `Map`, as pinned by the spec.
 */

const store = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

export class ApiError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

export interface FetchOptions {
  /** Bypass the cache and force a fresh network request. */
  force?: boolean;
  signal?: AbortSignal;
}

/**
 * Fetch `url`, validate/transform the JSON with `parse`, and memoize the
 * parsed result. Repeat calls for the same URL resolve from memory.
 */
export async function cachedFetch<T>(
  url: string,
  parse: (data: unknown) => T,
  options: FetchOptions = {}
): Promise<T> {
  if (!options.force && store.has(url)) {
    return store.get(url) as T;
  }
  if (!options.force && inflight.has(url)) {
    return inflight.get(url) as Promise<T>;
  }

  const request = (async () => {
    const res = await fetch(url, { signal: options.signal });
    if (!res.ok) {
      throw new ApiError(
        `Request to ${url} failed with ${res.status}`,
        res.status,
        url
      );
    }
    const json: unknown = await res.json();
    const parsed = parse(json);
    store.set(url, parsed);
    return parsed;
  })();

  inflight.set(url, request);
  try {
    return await request;
  } finally {
    inflight.delete(url);
  }
}

/** Read a cached, already-parsed value without triggering a fetch. */
export function peekCache<T>(url: string): T | undefined {
  return store.get(url) as T | undefined;
}

/** Test/utility helpers. */
export function clearCache(): void {
  store.clear();
  inflight.clear();
}

export function cacheSize(): number {
  return store.size;
}
