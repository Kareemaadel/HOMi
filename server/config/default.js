const toNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, fallback) => {
    if (typeof value !== 'string') return fallback;
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    return fallback;
};

export default {
    app: {
        nodeEnv: process.env.NODE_ENV ?? 'development',
        port: toNumber(process.env.PORT, 3000),
        clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
        testDateEnabled: toBoolean(process.env.TEST_DATE, process.env.NODE_ENV !== 'production'),
    },
    security: {
        corsOrigins: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    },
    database: {
        host: process.env.DB_HOST ?? 'localhost',
        port: toNumber(process.env.DB_PORT, 5432),
        name: process.env.DB_NAME ?? 'homi_db',
        user: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD ?? '',
        url: process.env.DATABASE_URL,
        pool: {
            max: toNumber(process.env.DB_POOL_MAX, 10),
            min: toNumber(process.env.DB_POOL_MIN, 2),
            acquireMs: toNumber(process.env.DB_POOL_ACQUIRE_MS, 30000),
            idleMs: toNumber(process.env.DB_POOL_IDLE_MS, 30000),
        },
    },
    auth: {
        jwt: {
            accessSecret: process.env.JWT_SECRET ?? 'dev-jwt-secret-change-in-production',
            refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-in-production',
            accessExpiration: process.env.JWT_ACCESS_EXPIRATION ?? '15m',
            refreshExpiration: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
        },
        webauthn: {
            rpId: process.env.WEBAUTHN_RP_ID,
            origin: process.env.WEBAUTHN_ORIGIN,
        },
    },
    encryption: {
        key: process.env.ENCRYPTION_KEY ?? '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    },
    email: {
        host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
        port: toNumber(process.env.SMTP_PORT, 587),
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
        fromEmail: process.env.SMTP_FROM_EMAIL ?? 'noreply@homi.com',
        fromName: process.env.SMTP_FROM_NAME ?? 'HOMi',
    },
    adminSeed: {
        email: process.env.ADMIN_SEED_EMAIL ?? 'Homi@admin.com',
        password: process.env.ADMIN_SEED_PASSWORD ?? 'HomiAdmin',
    },
    paymob: {
        baseUrl: process.env.PAYMOB_BASE_URL ?? 'https://accept.paymob.com',
        apiKey: process.env.PAYMOB_API_KEY ?? '',
        integrationId: toNumber(process.env.PAYMOB_INTEGRATION_ID, 0),
        walletIntegrationId: toNumber(process.env.PAYMOB_WALLET_INTEGRATION_ID, 5607894),
        iframeId: toNumber(process.env.PAYMOB_IFRAME_ID, 0),
        walletIframeId: toNumber(process.env.PAYMOB_WALLET_IFRAME_ID, 0),
        hmacSecret: process.env.PAYMOB_HMAC_SECRET ?? '',
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY ?? '',
        modelName: process.env.GEMINI_MODEL_NAME ?? 'gemini-2.0-flash',
    },
    scalability: {
        redis: {
            enabled: toBoolean(process.env.REDIS_ENABLED, true),
            url: process.env.REDIS_URL,
            host: process.env.REDIS_HOST ?? 'localhost',
            port: toNumber(process.env.REDIS_PORT, 6379),
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
            database: toNumber(process.env.REDIS_DB, 0),
            tls: toBoolean(process.env.REDIS_TLS, false),
            connectTimeoutMs: toNumber(process.env.REDIS_CONNECT_TIMEOUT_MS, 5000),
            commandTimeoutMs: toNumber(process.env.REDIS_COMMAND_TIMEOUT_MS, 5000),
            keyPrefix: process.env.REDIS_KEY_PREFIX ?? 'homi:',
            maxRetriesPerRequest: toNumber(process.env.REDIS_MAX_RETRIES_PER_REQUEST, 2),
        },
        rateLimit: {
            enabled: toBoolean(process.env.RATE_LIMIT_ENABLED, true),
            windowSeconds: toNumber(process.env.RATE_LIMIT_WINDOW_SECONDS, 600),
            maxRequests: toNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
            prefix: process.env.RATE_LIMIT_PREFIX ?? 'homi:ratelimit:ip',
            standardHeaders: true,
            legacyHeaders: false,
        },
        cache: {
            enabled: toBoolean(process.env.CACHE_ENABLED, true),
            prefix: process.env.CACHE_PREFIX ?? 'homi:cache',
            defaultTtlSeconds: toNumber(process.env.CACHE_DEFAULT_TTL_SECONDS, 600),
            popularPropertiesTtlSeconds: toNumber(process.env.CACHE_POPULAR_PROPERTIES_TTL_SECONDS, 600),
        },
    },
};
