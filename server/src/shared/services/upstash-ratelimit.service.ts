/**
 * upstash-ratelimit.service.ts
 * ─────────────────────────────────────────────────────────────
 * Distributed rate-limiting backed by Upstash Redis using the
 * official @upstash/ratelimit sliding-window algorithm.
 *
 * Sliding-window: 10 requests per 10-second window per identifier.
 * The limits used in production are overridden by env vars read
 * from rate-limit.middleware.ts.
 *
 * Returns { success: boolean, limit, remaining, reset } so the
 * middleware can attach standard RateLimit-* headers.
 *
 * When RATE_LIMIT_ENABLED is false (development) the call is a
 * safe no-op and always returns { success: true }.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '../../config/env.js';

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number; // Unix epoch seconds when the window resets
}

let ratelimiter: Ratelimit | null = null;

const getRateLimiter = (): Ratelimit | null => {
    if (!env.RATE_LIMIT_ENABLED || !env.REDIS_ENABLED) return null;

    if (!ratelimiter) {
        ratelimiter = new Ratelimit({
            redis: new Redis({
                url: env.UPSTASH_REDIS_REST_URL,
                token: env.UPSTASH_REDIS_REST_TOKEN,
            }),
            limiter: Ratelimit.slidingWindow(
                env.RATE_LIMIT_MAX_REQUESTS,   // maxRequests
                `${env.RATE_LIMIT_WINDOW_SECONDS} s` // window e.g. "600 s"
            ),
            prefix: env.RATE_LIMIT_PREFIX,
            analytics: false, // set true to see usage in Upstash console
        });
    }

    return ratelimiter;
};

/**
 * Check whether `identifier` (usually the client IP) is within
 * the rate limit.  Returns a permissive result when Redis is off.
 */
export const checkRateLimit = async (
    identifier: string
): Promise<RateLimitResult> => {
    const limiter = getRateLimiter();

    if (!limiter) {
        return {
            success: true,
            limit: env.RATE_LIMIT_MAX_REQUESTS,
            remaining: env.RATE_LIMIT_MAX_REQUESTS,
            reset: 0,
        };
    }

    try {
        const result = await limiter.limit(identifier);
        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: Math.floor(result.reset / 1000), // Upstash returns ms
        };
    } catch (error) {
        // Fail-open: if Upstash is unreachable, let the request through.
        console.error('[RatelimitService] error:', error);
        return {
            success: true,
            limit: env.RATE_LIMIT_MAX_REQUESTS,
            remaining: 0,
            reset: 0,
        };
    }
};
