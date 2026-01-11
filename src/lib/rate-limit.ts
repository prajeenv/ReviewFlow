import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { RATE_LIMITS } from "./constants";

// Check if Upstash Redis is configured
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis client only if configured
const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// In-memory rate limiter for development (fallback when Redis not configured)
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

function createInMemoryLimiter(requests: number, windowSeconds: number) {
  return {
    async limit(identifier: string): Promise<{
      success: boolean;
      limit: number;
      remaining: number;
      reset: number;
    }> {
      const now = Date.now();
      const windowMs = windowSeconds * 1000;
      const key = identifier;

      const record = inMemoryStore.get(key);

      if (!record || now > record.resetTime) {
        // New window
        inMemoryStore.set(key, { count: 1, resetTime: now + windowMs });
        return {
          success: true,
          limit: requests,
          remaining: requests - 1,
          reset: now + windowMs,
        };
      }

      if (record.count >= requests) {
        return {
          success: false,
          limit: requests,
          remaining: 0,
          reset: record.resetTime,
        };
      }

      record.count++;
      return {
        success: true,
        limit: requests,
        remaining: requests - record.count,
        reset: record.resetTime,
      };
    },
  };
}

// Login rate limit: 5 attempts per 60 seconds
export const loginRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMITS.AUTH.REQUESTS,
        `${RATE_LIMITS.AUTH.WINDOW_SECONDS} s`
      ),
      analytics: true,
      prefix: "ratelimit:login",
    })
  : createInMemoryLimiter(
      RATE_LIMITS.AUTH.REQUESTS,
      RATE_LIMITS.AUTH.WINDOW_SECONDS
    );

// API rate limit: 60 requests per minute
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMITS.API.REQUESTS,
        `${RATE_LIMITS.API.WINDOW_SECONDS} s`
      ),
      analytics: true,
      prefix: "ratelimit:api",
    })
  : createInMemoryLimiter(
      RATE_LIMITS.API.REQUESTS,
      RATE_LIMITS.API.WINDOW_SECONDS
    );

// AI generation rate limit: 10 per minute (prevent abuse)
export const aiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMITS.AI.REQUESTS,
        `${RATE_LIMITS.AI.WINDOW_SECONDS} s`
      ),
      analytics: true,
      prefix: "ratelimit:ai",
    })
  : createInMemoryLimiter(
      RATE_LIMITS.AI.REQUESTS,
      RATE_LIMITS.AI.WINDOW_SECONDS
    );

// Helper to get client IP from request
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return "127.0.0.1";
}

// Helper to check rate limit and return appropriate response
export async function checkRateLimit(
  limiter: typeof loginRateLimit | typeof apiRateLimit | typeof aiRateLimit,
  identifier: string
): Promise<{
  success: boolean;
  headers: Record<string, string>;
  error?: { code: string; message: string };
}> {
  const result = await limiter.limit(identifier);

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    headers["Retry-After"] = String(retryAfter);

    return {
      success: false,
      headers,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
      },
    };
  }

  return { success: true, headers };
}
