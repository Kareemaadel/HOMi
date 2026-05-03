/**
 * chat-history.service.ts
 * ─────────────────────────────────────────────────────────────
 * Lightweight Redis-backed chat message history using Upstash.
 *
 * Each user has a list key:  chat-history:<userId>
 * • saveMessage   – prepends a message, trims to the latest 100.
 * • getChatHistory – fetches the most recent `limit` messages (default 50).
 * • clearHistory  – removes a user's history (e.g. on account deletion).
 *
 * All methods are safe no-ops when REDIS_ENABLED is false.
 */

import { env } from '../../config/env.js';
import { getRedisClient } from '../infrastructure/redis.client.js';

const getChatHistoryKey = (userId: string): string =>
    `${env.REDIS_KEY_PREFIX}chat-history:${userId}`;

/** Maximum messages retained per user. */
const MAX_HISTORY_LENGTH = 100;

/**
 * Persist a new message at the front of the user's history list.
 * Automatically trims to the last MAX_HISTORY_LENGTH messages.
 */
export const saveMessage = async (
    userId: string,
    message: string
): Promise<void> => {
    if (!env.REDIS_ENABLED) return;

    const redis = getRedisClient();
    if (!redis) return;

    try {
        const key = getChatHistoryKey(userId);
        await redis.lpush(key, message);                          // prepend newest
        await redis.ltrim(key, 0, MAX_HISTORY_LENGTH - 1);       // keep latest 100
    } catch (error) {
        console.error('[ChatHistoryService] saveMessage error:', error);
    }
};

/**
 * Retrieve the most recent `limit` messages for a user (newest first).
 */
export const getChatHistory = async (
    userId: string,
    limit = 50
): Promise<string[]> => {
    if (!env.REDIS_ENABLED) return [];

    const redis = getRedisClient();
    if (!redis) return [];

    try {
        const key = getChatHistoryKey(userId);
        return await redis.lrange(key, 0, limit - 1);
    } catch (error) {
        console.error('[ChatHistoryService] getChatHistory error:', error);
        return [];
    }
};

/**
 * Delete a user's entire chat history from Redis.
 */
export const clearChatHistory = async (userId: string): Promise<void> => {
    if (!env.REDIS_ENABLED) return;

    const redis = getRedisClient();
    if (!redis) return;

    try {
        await redis.del(getChatHistoryKey(userId));
    } catch (error) {
        console.error('[ChatHistoryService] clearChatHistory error:', error);
    }
};
