export default {
    app: {
        nodeEnv: 'development',
        testDateEnabled: false,
    },
    security: {
        corsOrigins: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    },
    scalability: {
        // ⚠️  Upstash is a metered free-tier service.
        // Keep ALL redis features OFF in development to avoid burning quota.
        redis: {
            enabled: false,
        },
        rateLimit: {
            enabled: false,
        },
        cache: {
            enabled: false,
            sessionTtlSeconds: 900,
        },
    },
};
