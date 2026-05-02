export default {
    app: {
        nodeEnv: 'development',
        testDateEnabled: true,
    },
    security: {
        corsOrigins: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    },
    scalability: {
        redis: {
            enabled: true,
            tls: false,
        },
        rateLimit: {
            enabled: true,
            windowSeconds: 600,
            maxRequests: 100,
        },
        cache: {
            enabled: true,
            defaultTtlSeconds: 600,
            popularPropertiesTtlSeconds: 600,
        },
    },
};
