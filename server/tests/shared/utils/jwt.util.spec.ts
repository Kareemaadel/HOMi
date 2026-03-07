import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { 
    generateAccessToken, 
    generateRefreshToken, 
    generateTokenPair, 
    verifyAccessToken, 
    verifyRefreshToken, 
    extractBearerToken,
    type JWTPayload
} from '../../../src/shared/utils/jwt.util.js';

vi.mock('../../../src/config/env.js', () => ({
    default: {
        JWT_SECRET: 'test-access-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_ACCESS_EXPIRATION: '15m',
        JWT_REFRESH_EXPIRATION: '7d',
    },
}));

describe('JWT Utility', () => {
    const mockPayload: JWTPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'LANDLORD',
    };

    describe('generateAccessToken', () => {
        it('should generate a valid access token with correct payload', () => {
            const token = generateAccessToken(mockPayload);
            expect(token).toBeDefined();
            
            const decoded = jwt.decode(token) as any;
            expect(decoded.userId).toBe(mockPayload.userId);
            expect(decoded.email).toBe(mockPayload.email);
            expect(decoded.role).toBe(mockPayload.role);
            expect(decoded.iss).toBe('homi-auth');
            expect(decoded.aud).toBe('homi-api');
        });
    });

    describe('generateRefreshToken', () => {
        it('should generate a valid refresh token with correct payload', () => {
            const token = generateRefreshToken(mockPayload);
            expect(token).toBeDefined();
            
            const decoded = jwt.decode(token) as any;
            expect(decoded.userId).toBe(mockPayload.userId);
            expect(decoded.email).toBe(mockPayload.email);
            expect(decoded.role).toBe(mockPayload.role);
            expect(decoded.iss).toBe('homi-auth');
            expect(decoded.aud).toBe('homi-api');
        });
    });

    describe('generateTokenPair', () => {
        it('should generate both access and refresh tokens', () => {
            const { accessToken, refreshToken } = generateTokenPair(
                mockPayload.userId,
                mockPayload.email,
                mockPayload.role
            );
            
            expect(accessToken).toBeDefined();
            expect(refreshToken).toBeDefined();
            expect(accessToken).not.toBe(refreshToken);
        });
    });

    describe('verifyAccessToken', () => {
        it('should verify and return payload for a valid access token', () => {
            const token = generateAccessToken(mockPayload);
            const verified = verifyAccessToken(token);
            
            expect(verified.userId).toBe(mockPayload.userId);
            expect(verified.email).toBe(mockPayload.email);
            expect(verified.role).toBe(mockPayload.role);
        });

        it('should throw error for invalid access token', () => {
            expect(() => verifyAccessToken('invalid-token')).toThrow('Invalid access token');
        });

        it('should throw error if token is signed with wrong secret', () => {
            const wrongToken = jwt.sign(mockPayload, 'wrong-secret');
            expect(() => verifyAccessToken(wrongToken)).toThrow('Invalid access token');
        });
    });

    describe('verifyRefreshToken', () => {
        it('should verify and return payload for a valid refresh token', () => {
            const token = generateRefreshToken(mockPayload);
            const verified = verifyRefreshToken(token);
            
            expect(verified.userId).toBe(mockPayload.userId);
            expect(verified.email).toBe(mockPayload.email);
            expect(verified.role).toBe(mockPayload.role);
        });

        it('should throw error for invalid refresh token', () => {
            expect(() => verifyRefreshToken('invalid-token')).toThrow('Invalid refresh token');
        });
    });

    describe('extractBearerToken', () => {
        it('should extract token from Bearer format header', () => {
            const authHeader = 'Bearer my-token-123';
            const token = extractBearerToken(authHeader);
            expect(token).toBe('my-token-123');
        });

        it('should return null for non-Bearer format header', () => {
            const authHeader = 'Basic my-token-123';
            const token = extractBearerToken(authHeader);
            expect(token).toBeNull();
        });

        it('should return null for undefined header', () => {
            const token = extractBearerToken(undefined);
            expect(token).toBeNull();
        });
    });
});
