/**
 * rate-limit.middleware.ts
 * ─────────────────────────────────────────────────────────────
 * Global Express middleware that enforces the distributed
 * sliding-window rate limit via Upstash Redis.
 *
 * • Disabled in development (RATE_LIMIT_ENABLED=false).
 * • Falls back to pass-through when Upstash is unreachable.
 * • Attaches standard RateLimit-* headers to every response.
 */

import type { NextFunction, Request, Response } from 'express';
import { env } from '../../config/env.js';
import { checkRateLimit } from '../services/upstash-ratelimit.service.js';

const getClientIp = (req: Request): string => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
        return forwardedFor.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
};

export const globalRateLimiter = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (!env.RATE_LIMIT_ENABLED) {
        next();
        return;
    }

    try {
        const identifier = getClientIp(req);
        const { success, limit, remaining, reset } = await checkRateLimit(identifier);

        // Attach standard RateLimit-* headers
        if (env.RATE_LIMIT_STANDARD_HEADERS) {
            res.setHeader('RateLimit-Limit', String(limit));
            res.setHeader('RateLimit-Remaining', String(remaining));
            res.setHeader('RateLimit-Reset', String(reset));
        }

        if (!success) {
            res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                code: 'RATE_LIMIT_EXCEEDED',
            });
            return;
        }

        next();
    } catch (error) {
        // Fail-open: never block a request due to a Redis error.
        console.error('[RateLimiter] Unexpected error — failing open:', error);
        next();
    }
};
