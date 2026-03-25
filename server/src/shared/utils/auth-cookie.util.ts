import type { Response } from 'express';
import env from '../../config/env.js';

/** HttpOnly cookie name for JWT refresh token (Remember me). */
export const REFRESH_COOKIE_NAME = 'homi_refresh_token';

/**
 * Parse JWT-style duration strings (e.g. 7d, 24h, 15m) to milliseconds for Set-Cookie maxAge.
 */
export function parseDurationToMs(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const [, value, unit] = match as [string, string, string];
    const num = parseInt(value, 10);
    switch (unit) {
        case 's':
            return num * 1000;
        case 'm':
            return num * 60 * 1000;
        case 'h':
            return num * 60 * 60 * 1000;
        case 'd':
            return num * 24 * 60 * 60 * 1000;
        default:
            return 7 * 24 * 60 * 60 * 1000;
    }
}

export function setRefreshCookie(res: Response, refreshToken: string): void {
    const maxAge = parseDurationToMs(env.JWT_REFRESH_EXPIRATION);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
    });
}

export function clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}
