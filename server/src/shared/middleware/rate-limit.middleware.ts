import type { NextFunction, Request, Response } from 'express';
import { env } from '../../config/env.js';
import { getRedisClient } from '../infrastructure/redis.client.js';

const getClientIp = (req: Request): string => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
        return forwardedFor.split(',')[0]?.trim() ?? req.ip;
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

    const redisClient = getRedisClient();
    if (!redisClient) {
        // Fail-open to keep API available if Redis is temporarily down.
        next();
        return;
    }

    try {
        const key = `${env.RATE_LIMIT_PREFIX}:${getClientIp(req)}`;
        const currentCount = await redisClient.incr(key);

        if (currentCount === 1) {
            await redisClient.expire(key, env.RATE_LIMIT_WINDOW_SECONDS);
        }

        const ttl = await redisClient.ttl(key);
        const remaining = Math.max(0, env.RATE_LIMIT_MAX_REQUESTS - currentCount);
        const resetAtEpochSeconds = Math.floor(Date.now() / 1000) + Math.max(ttl, 0);

        if (env.RATE_LIMIT_STANDARD_HEADERS) {
            res.setHeader('RateLimit-Limit', String(env.RATE_LIMIT_MAX_REQUESTS));
            res.setHeader('RateLimit-Remaining', String(remaining));
            res.setHeader('RateLimit-Reset', String(resetAtEpochSeconds));
        }

        if (env.RATE_LIMIT_LEGACY_HEADERS) {
            res.setHeader('X-RateLimit-Limit', String(env.RATE_LIMIT_MAX_REQUESTS));
            res.setHeader('X-RateLimit-Remaining', String(remaining));
            res.setHeader('X-RateLimit-Reset', String(resetAtEpochSeconds));
        }

        if (currentCount > env.RATE_LIMIT_MAX_REQUESTS) {
            res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                code: 'RATE_LIMIT_EXCEEDED',
            });
            return;
        }

        next();
    } catch (error) {
        console.error('Rate limiter error:', error);
        next();
    }
};
