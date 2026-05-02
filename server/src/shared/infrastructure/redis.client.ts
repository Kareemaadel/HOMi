/**
 * redis.client.ts
 * ─────────────────────────────────────────────────────────────
 * Upstash Redis client wrapper (REST-based, no persistent TCP).
 *
 * Enabled in production   → all four features active.
 * Disabled in development → zero Upstash API calls.
 *
 * Exports keep the same surface as the old node-redis client so
 * every caller (index.ts, rate-limit.middleware.ts, etc.) compiles
 * without modification.
 */

import { Redis } from '@upstash/redis';
import { env } from '../../config/env.js';

let upstashClient: Redis | null = null;
let _isReady = false;

/**
 * Initialise (or skip) the Upstash Redis connection.
 * Called once at server boot from index.ts.
 */
export const connectRedis = async (): Promise<void> => {
    if (!env.REDIS_ENABLED) {
        console.warn('⚠️  Redis disabled by configuration. Running without caching/rate-limiting.');
        return;
    }

    if (_isReady) return;

    upstashClient = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Upstash REST is stateless — validate by pinging.
    try {
        await upstashClient.ping();
        _isReady = true;
        console.log('✅ Upstash Redis client ready.');
    } catch (error) {
        _isReady = false;
        upstashClient = null;
        console.error('❌ Upstash Redis connection failed:', error);
    }
};

/**
 * No-op for Upstash (REST is stateless).
 * Exists to keep index.ts shutdown logic identical.
 */
export const disconnectRedis = async (): Promise<void> => {
    _isReady = false;
    upstashClient = null;
};

/**
 * Returns the active Upstash Redis instance, or null if disabled / not ready.
 */
export const getRedisClient = (): Redis | null => {
    if (!_isReady || !upstashClient) return null;
    return upstashClient;
};

export const isRedisReady = (): boolean => _isReady;
