/**
 * In-memory sliding-window rate limiter with zero external dependencies.
 * Automatically prunes expired records to prevent memory leaks.
 * Supports optional Upstash Redis transparently if UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN are set in environment variables.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      // Keep timestamps within the last 15 minutes
      record.timestamps = record.timestamps.filter((ts) => now - ts < 15 * 60 * 1000);
      if (record.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    }
  }, 60_000);
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // milliseconds until oldest in window expires
}

/**
 * Check if an action is allowed under the rate limit.
 *
 * @param identifier Unique key (e.g., IP address, user email, or voter ID)
 * @param limit Max allowed requests within the window
 * @param windowMs Window duration in milliseconds (e.g., 60_000 for 1 minute)
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  // If Upstash Redis credentials exist, use Upstash REST API
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const now = Date.now();
      const key = `rl:${identifier}`;
      const clearBefore = now - windowMs;

      // Pipeline: remove old, add current, count, expire
      const response = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["ZREMRANGEBYSCORE", key, "0", clearBefore.toString()],
          ["ZADD", key, now.toString(), `${now}-${Math.random()}`],
          ["ZCARD", key],
          ["EXPIRE", key, Math.ceil(windowMs / 1000).toString()],
        ]),
      });

      if (response.ok) {
        const results = await response.json();
        const count = typeof results[2]?.result === "number" ? results[2].result : 1;
        const success = count <= limit;
        return {
          success,
          limit,
          remaining: Math.max(0, limit - count),
          reset: windowMs,
        };
      }
    } catch {
      // Fallback to memoryStore on network failure
    }
  }

  // In-memory sliding window
  const now = Date.now();
  const record = memoryStore.get(identifier) || { timestamps: [] };

  // Keep only timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const reset = Math.max(0, windowMs - (now - oldest));
    return {
      success: false,
      limit,
      remaining: 0,
      reset,
    };
  }

  record.timestamps.push(now);
  memoryStore.set(identifier, record);

  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    reset: windowMs,
  };
}

/**
 * Helper to extract client IP from incoming NextRequest headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}
