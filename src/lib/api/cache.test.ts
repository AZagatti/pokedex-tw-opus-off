import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApiError,
  cacheSize,
  cachedFetch,
  clearCache,
  peekCache,
} from "./cache";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(body) } as Response;
}

const identity = (d: unknown) => d as { value: number };

describe("cachedFetch", () => {
  beforeEach(() => {
    clearCache();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("memoizes by URL — a repeat call does not refetch", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ value: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    const a = await cachedFetch("/x", identity);
    const b = await cachedFetch("/x", identity);

    expect(a).toStrictEqual({ value: 1 });
    expect(b).toBe(a);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(cacheSize()).toBe(1);
  });

  it("de-duplicates concurrent in-flight requests", async () => {
    // Both callers run synchronously before the mock resolves, so the second
    // must reuse the first's in-flight promise (one fetch total).
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ value: 2 }));
    vi.stubGlobal("fetch", fetchMock);

    const [a, b] = await Promise.all([
      cachedFetch("/y", identity),
      cachedFetch("/y", identity),
    ]);

    expect(a).toStrictEqual({ value: 2 });
    expect(b).toStrictEqual({ value: 2 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws ApiError on a non-ok response and does not cache it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(null, false, 404))
    );

    await expect(cachedFetch("/missing", identity)).rejects.toBeInstanceOf(
      ApiError
    );
    expect(peekCache("/missing")).toBeUndefined();
    expect(cacheSize()).toBe(0);
  });

  it("applies the parse function to the response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ value: 5 }))
    );
    const doubled = await cachedFetch("/z", (d) => {
      const { value } = d as { value: number };
      return { value: value * 2 };
    });
    expect(doubled).toStrictEqual({ value: 10 });
  });
});
