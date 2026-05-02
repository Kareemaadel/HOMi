import { createClient, type RedisClientType, type RedisModules, type RedisFunctions, type RedisScripts } from 'redis';
import { env } from '../../config/env.js';

type RedisClient = RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

let redisClient: RedisClient | null = null;
let isConnected = false;

const buildRedisClient = (): RedisClient => {
    const commonSocketOptions = {
        connectTimeout: env.REDIS_CONNECT_TIMEOUT_MS,
        reconnectStrategy: (retries: number) => {
            if (retries > env.REDIS_MAX_RETRIES_PER_REQUEST) {
                return false;
            }
            return Math.min(retries * 100, 1000);
        },
        tls: env.REDIS_TLS,
    };

    if (env.REDIS_URL) {
        return createClient({
            url: env.REDIS_URL,
            socket: commonSocketOptions,
            pingInterval: env.REDIS_COMMAND_TIMEOUT_MS,
        });
    }

    return createClient({
        socket: {
            ...commonSocketOptions,
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
        },
        username: env.REDIS_USERNAME,
        password: env.REDIS_PASSWORD,
        database: env.REDIS_DB,
        pingInterval: env.REDIS_COMMAND_TIMEOUT_MS,
    });
};

export const connectRedis = async (): Promise<void> => {
    if (!env.REDIS_ENABLED) {
        console.warn('⚠️ Redis disabled by configuration. Running in degraded mode.');
        return;
    }

    if (redisClient && isConnected) {
        return;
    }

    redisClient = buildRedisClient();

    redisClient.on('error', (error) => {
        isConnected = false;
        console.error('❌ Redis client error:', error);
    });

    redisClient.on('ready', () => {
        isConnected = true;
        console.log('✅ Redis client ready.');
    });

    await redisClient.connect();
};

export const disconnectRedis = async (): Promise<void> => {
    if (!redisClient) return;

    try {
        await redisClient.quit();
    } catch {
        await redisClient.disconnect();
    } finally {
        isConnected = false;
        redisClient = null;
    }
};

export const getRedisClient = (): RedisClient | null => {
    if (!redisClient || !isConnected) {
        return null;
    }
    return redisClient;
};

export const isRedisReady = (): boolean => isConnected;
