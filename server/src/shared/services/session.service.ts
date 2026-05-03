/**
 * session.service.ts
 * ─────────────────────────────────────────────────────────────
 * Redis-backed server-side session store using Upstash hashes.
 *
 * Session schema:
 *   Redis key  →  s:<sessionId>     (hash)
 *   Fields     →  arbitrary key/value pairs set by the caller
 *   TTL        →  SESSION_TTL_SECONDS (default 900 = 15 min),
 *                 sliding — refreshed on every write.
 *
 * The sessionId is expected to be stored on the client as a
 * cookie or embedded in the JWT claims. Callers supply it via
 * getSessionId() / getSessionIdAndCreateIfMissing().
 *
 * All methods are safe no-ops when REDIS_ENABLED is false —
 * getSession returns null, setSession returns undefined.
 */

import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { getRedisClient } from '../infrastructure/redis.client.js';

const sessionKey = (sessionId: string): string =>
    `${env.REDIS_KEY_PREFIX}s:${sessionId}`;

// ─── Core helpers ──────────────────────────────────────────────────────────

/**
 * Read a single field from a session hash.
 * Returns null when the key or field does not exist.
 */
export const getSession = async (
    sessionId: string,
    field: string
): Promise<string | null> => {
    if (!env.REDIS_ENABLED) return null;

    const redis = getRedisClient();
    if (!redis) return null;

    try {
        return await redis.hget<string>(sessionKey(sessionId), field);
    } catch (error) {
        console.error('[SessionService] getSession error:', error);
        return null;
    }
};

/**
 * Write one or more fields to a session hash and slide the TTL.
 * Returns the sessionId so callers can persist it in a cookie.
 */
export const setSession = async (
    sessionId: string,
    data: Record<string, string>
): Promise<string | undefined> => {
    if (!env.REDIS_ENABLED) return undefined;

    const redis = getRedisClient();
    if (!redis) return undefined;

    try {
        const key = sessionKey(sessionId);
        await redis.hset(key, data);
        await redis.expire(key, env.SESSION_TTL_SECONDS);
        return sessionId;
    } catch (error) {
        console.error('[SessionService] setSession error:', error);
        return undefined;
    }
};

/**
 * Read all fields from a session hash.
 * Returns an empty object when the session does not exist.
 */
export const getFullSession = async (
    sessionId: string
): Promise<Record<string, string>> => {
    if (!env.REDIS_ENABLED) return {};

    const redis = getRedisClient();
    if (!redis) return {};

    try {
        return (await redis.hgetall<Record<string, string>>(sessionKey(sessionId))) ?? {};
    } catch (error) {
        console.error('[SessionService] getFullSession error:', error);
        return {};
    }
};

/**
 * Destroy a session (e.g. on logout).
 */
export const destroySession = async (sessionId: string): Promise<void> => {
    if (!env.REDIS_ENABLED) return;

    const redis = getRedisClient();
    if (!redis) return;

    try {
        await redis.del(sessionKey(sessionId));
    } catch (error) {
        console.error('[SessionService] destroySession error:', error);
    }
};

/**
 * Convenience: create a new random sessionId.
 * Use this when the request doesn't yet have one.
 */
export const createSessionId = (): string => randomUUID();
