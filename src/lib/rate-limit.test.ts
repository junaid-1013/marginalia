import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("allows `limit` calls per window then blocks", () => {
    const key = "t1";
    expect([1, 2, 3].map(() => rateLimit(key, 3, 1000))).toEqual([true, true, true]);
    expect(rateLimit(key, 3, 1000)).toBe(false);
  });

  it("starts a new window after it expires", () => {
    const key = "t2";
    rateLimit(key, 1, 1000);
    expect(rateLimit(key, 1, 1000)).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, 1, 1000)).toBe(true);
  });

  it("counts keys independently", () => {
    rateLimit("a", 1, 1000);
    expect(rateLimit("b", 1, 1000)).toBe(true);
  });
});
