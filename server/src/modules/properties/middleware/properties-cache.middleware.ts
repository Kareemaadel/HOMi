import type { NextFunction, Request, Response } from 'express';
import { env } from '../../../config/env.js';
import { cacheService } from '../../../shared/services/cache.service.js';

const buildQuerySignature = (query: Request['query']): string => {
    const entries = Object.entries(query)
        .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)] as [string, string])
        .sort(([a], [b]) => a.localeCompare(b));

    return new URLSearchParams(entries).toString();
};

export const propertiesListCacheMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (!env.CACHE_ENABLED || req.method !== 'GET') {
        next();
        return;
    }

    const querySignature = buildQuerySignature(req.query);
    const cacheKey = `properties:list:${querySignature}`;

    try {
        const cachedPayload = await cacheService.get<unknown>(cacheKey);
        if (cachedPayload) {
            res.status(200).json(cachedPayload);
            return;
        }

        const originalJson = res.json.bind(res);
        res.json = ((payload: unknown) => {
            if (res.statusCode === 200) {
                void cacheService.set(
                    cacheKey,
                    payload,
                    env.CACHE_POPULAR_PROPERTIES_TTL_SECONDS
                );
            }
            return originalJson(payload);
        }) as Response['json'];

        next();
    } catch (error) {
        console.error('Property cache middleware error:', error);
        next();
    }
};
