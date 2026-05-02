export default {
    app: {
        nodeEnv: 'production',
        testDateEnabled: false,
    },
    security: {
        corsOrigins: ['https://homi.app'],
    },
    database: {
        pool: {
            max: 30,
            min: 5,
            acquireMs: 60000,
            idleMs: 30000,
        },
    },
    scalability: {
        // ✅ Upstash Redis is active in production.
        // UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in the prod environment.
        redis: {
            enabled: true,
        },
        rateLimit: {
            enabled: true,
            windowSeconds: 600,
            maxRequests: 100,
        },
        cache: {
            enabled: true,
            defaultTtlSeconds: 900,
            popularPropertiesTtlSeconds: 600,
            sessionTtlSeconds: 900,
        },
    },
};
