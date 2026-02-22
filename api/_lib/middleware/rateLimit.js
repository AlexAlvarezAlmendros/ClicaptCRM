// LeadFlow CRM — Middleware — Rate limiting

const rateLimitMap = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;    // per window

/**
 * Simple in-memory rate limiter.
 * For production, consider using Vercel's built-in rate limiting or Redis.
 */
export function rateLimit(req) {
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  const now = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  const entry = rateLimitMap.get(ip);

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + WINDOW_MS;
    return;
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS) {
    throw { status: 429, code: "RATE_LIMITED", message: "Demasiadas peticiones. Inténtalo de nuevo en un minuto." };
  }
}

// Note: In serverless, each cold start gets a fresh Map.
// No cleanup interval needed — the Map lives only for the function's lifetime.
