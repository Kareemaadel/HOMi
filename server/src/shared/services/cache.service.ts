import { createHash } from 'node:crypto';
import { env } from '../../config/env.js';
import { getRedisClient } from '../infrastructure/redis.client.js';

class CacheService {
    private buildKey(rawKey: string): string {
        const compactKey = rawKey.length > 256
            ? createHash('sha256').update(rawKey).digest('hex')
            : rawKey;
        return `${env.CACHE_PREFIX}:${compactKey}`;
    }

    async get<T>(rawKey: string): Promise<T | null> {
        if (!env.CACHE_ENABLED) return null;

        const redisClient = getRedisClient();
        if (!redisClient) return null;

        const key = this.buildKey(rawKey);
        const cached = await redisClient.get(key);
        if (!cached) return null;

        return JSON.parse(cached) as T;
    }

    async set<T>(rawKey: string, value: T, ttlSeconds: number = env.CACHE_DEFAULT_TTL_SECONDS): Promise<void> {
        if (!env.CACHE_ENABLED) return;

        const redisClient = getRedisClient();
        if (!redisClient) return;

        const key = this.buildKey(rawKey);
        await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    }

    async deleteByPattern(pattern: string): Promise<void> {
        const redisClient = getRedisClient();
        if (!redisClient) return;

        const redisPattern = this.buildKey(pattern);
        const keys: string[] = [];

        for await (const key of redisClient.scanIterator({ MATCH: redisPattern, COUNT: 100 })) {
            keys.push(key as string);
        }

        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    }
}

export const cacheService = new CacheService();
