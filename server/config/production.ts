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
        redis: {
            enabled: true,
            tls: true,
            connectTimeoutMs: 3000,
            commandTimeoutMs: 3000,
            maxRetriesPerRequest: 3,
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
        },
    },
};
