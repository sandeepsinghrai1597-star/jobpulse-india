/**
 * Simple in-memory IP-based rate limiter for AI endpoints.
 * Limits unauthenticated callers to 5 requests per 10-minute window.
 * Authenticated users get a higher limit (20 per window).
 * Note: resets on cold starts — use Redis (Upstash) for cross-instance persistence.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const LIMIT_ANON = 5;
const LIMIT_AUTH = 20;

type Entry = { count: number; windowStart: number };
const store = new Map<string, Entry>();

function getKey(ip: string, userId?: string) {
  return userId ? `user:${userId}` : `ip:${ip}`;
}

export function checkAiRateLimit(
  ip: string,
  userId?: string,
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const limit = userId ? LIMIT_AUTH : LIMIT_ANON;
  const key = getKey(ip, userId);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= limit) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, retryAfterSeconds: 0 };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
