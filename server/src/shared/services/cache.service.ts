/**
 * cache.service.ts
 * ─────────────────────────────────────────────────────────────
 * Generic item-caching layer backed by Upstash Redis.
 *
 * Usage:
 *   const data = await cacheService.get<MyType>('item:123');
 *   if (data) return data;
 *
 *   const fresh = await fetchFromDb();
 *   await cacheService.set('item:123', fresh);
 *   return fresh;
 *
 * When CACHE_ENABLED is false (development) every method is a safe
 * no-op so callers never need to branch on the flag themselves.
 */

import { createHash } from 'node:crypto';
import { env } from '../../config/env.js';
import { getRedisClient } from '../infrastructure/redis.client.js';

class CacheService {
    /** Namespaced, length-safe key. */
    private buildKey(rawKey: string): string {
        const compactKey =
            rawKey.length > 256
                ? createHash('sha256').update(rawKey).digest('hex')
                : rawKey;
        return `${env.CACHE_PREFIX}:${compactKey}`;
    }

    /**
     * Fetch a cached value.
     * Returns null on cache-miss, disabled Redis, or any error.
     */
    async get<T>(rawKey: string): Promise<T | null> {
        if (!env.CACHE_ENABLED) return null;

        const redis = getRedisClient();
        if (!redis) return null;

        try {
            const key = this.buildKey(rawKey);
            const cached = await redis.get<T>(key);
            return cached ?? null;
        } catch (error) {
            console.error('[CacheService] get error:', error);
            return null;
        }
    }

    /**
     * Store a value in the cache with an optional TTL.
     * Safe no-op when Redis is disabled.
     */
    async set<T>(
        rawKey: string,
        value: T,
        ttlSeconds: number = env.CACHE_DEFAULT_TTL_SECONDS
    ): Promise<void> {
        if (!env.CACHE_ENABLED) return;

        const redis = getRedisClient();
        if (!redis) return;

        try {
            const key = this.buildKey(rawKey);
            // Upstash Redis.set() accepts objects directly (auto-serialised to JSON).
            await redis.set(key, value, { ex: ttlSeconds });
        } catch (error) {
            console.error('[CacheService] set error:', error);
        }
    }

    /**
     * Invalidate all keys matching a prefix pattern.
     * Uses SCAN internally — safe for Upstash.
     */
    async deleteByPattern(pattern: string): Promise<void> {
        if (!env.CACHE_ENABLED) return;

        const redis = getRedisClient();
        if (!redis) return;

        try {
            const redisPattern = `${this.buildKey(pattern)}*`;
            let cursor = '0';
            const keysToDelete: string[] = [];

            do {
                const [nextCursor, keys] = await redis.scan(cursor, {
                    match: redisPattern,
                    count: 100,
                });
                cursor = nextCursor;
                keysToDelete.push(...keys);
            } while (cursor !== '0');

            if (keysToDelete.length > 0) {
                await redis.del(...keysToDelete);
            }
        } catch (error) {
            console.error('[CacheService] deleteByPattern error:', error);
        }
    }

    /**
     * Invalidate a single exact key.
     */
    async delete(rawKey: string): Promise<void> {
        if (!env.CACHE_ENABLED) return;

        const redis = getRedisClient();
        if (!redis) return;

        try {
            await redis.del(this.buildKey(rawKey));
        } catch (error) {
            console.error('[CacheService] delete error:', error);
        }
    }
}

export const cacheService = new CacheService();
