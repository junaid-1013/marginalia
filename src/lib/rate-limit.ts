// Best effort, in memory fixed window limiter.
// Each serverless instance keeps its own counters, so this only slows abuse down.
// TODO: swap the store for Upstash Redis (same signature) before real traffic.
const hits = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = (key: string, limit: number, windowMs: number) => {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    // opportunistic cleanup so the map cannot grow forever
    if (hits.size > 5000) {
      hits.forEach((v, k) => {
        if (v.resetAt <= now) hits.delete(k);
      });
    }
    return true;
  }

  entry.count += 1;
  return entry.count <= limit;
};
