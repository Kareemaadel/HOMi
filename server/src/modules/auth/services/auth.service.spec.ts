import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { AuthService, AuthError } from './auth.service.js';
import { User, Profile, sequelize } from '../models/index.js';
import { generateTokenPair } from '../../../shared/utils/jwt.util.js';
import { generateSecureToken, hashToken } from '../../../shared/utils/encryption.util.js';
import { emailService } from '../../../shared/services/email.service.js';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('axios');
vi.mock('../models/index.js', () => ({
    sequelize: { transaction: vi.fn() },
    User: { findOne: vi.fn(), create: vi.fn(), findByPk: vi.fn() },
    Profile: { findOne: vi.fn(), create: vi.fn() },
}));

vi.mock('../../../shared/utils/jwt.util.js', () => ({
    generateTokenPair: vi.fn(),
}));

vi.mock('../../../shared/utils/encryption.util.js', () => ({
    generateSecureToken: vi.fn(),
    hashToken: vi.fn(),
}));

vi.mock('../../../shared/services/email.service.js', () => ({
    emailService: {
        sendVerificationEmail: vi.fn(),
        sendPasswordResetEmail: vi.fn(),
        sendWelcomeEmail: vi.fn(),
    },
}));

/**
 * Creates a mock Sequelize model instance for User/Profile.
 */
const sequelizeMock = (data: any = {}) => ({
    id: 'mock-id',
    ...data,
    update: vi.fn().mockImplementation(function (this: any, updates: any) {
        Object.assign(this, updates);
        return Promise.resolve(this);
    }),
    reload: vi.fn().mockResolvedValue(undefined),
    comparePassword: vi.fn(),
    toJSON: vi.fn().mockReturnValue(data),
    isVerificationComplete: vi.fn().mockReturnValue(true),
});

describe('AuthService', () => {
    let authService: AuthService;
    const mockTx = { commit: vi.fn(), rollback: vi.fn() };

    beforeEach(() => {
        vi.clearAllMocks();
        authService = new AuthService();
        vi.mocked(sequelize.transaction).mockResolvedValue(mockTx as any);
    });

    // ── register ───────────────────────────────────────────────────────────
    describe('register', () => {
        const regInput: any = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            phone: '0123456789',
            role: 'TENANT',
        };

        it('should throw if email already exists', async () => {
            vi.mocked(User.findOne).mockResolvedValue({ id: 'existing' } as any);
            await expect(authService.register(regInput)).rejects.toMatchObject({ code: 'EMAIL_EXISTS' });
            expect(mockTx.rollback).toHaveBeenCalled();
        });

        it('should throw if phone already exists', async () => {
            vi.mocked(User.findOne).mockResolvedValue(null);
            vi.mocked(Profile.findOne).mockResolvedValue({ id: 'existing' } as any);
            await expect(authService.register(regInput)).rejects.toMatchObject({ code: 'PHONE_EXISTS' });
        });

        it('should register user successfully', async () => {
            vi.mocked(User.findOne).mockResolvedValue(null);
            vi.mocked(Profile.findOne).mockResolvedValue(null);
            vi.mocked(User.create).mockResolvedValue({ id: 'u1' } as any);
            vi.mocked(Profile.create).mockResolvedValue({ id: 'p1' } as any);

            const res = await authService.register(regInput);
            expect(res.success).toBe(true);
            expect(mockTx.commit).toHaveBeenCalled();
            expect(User.create).toHaveBeenCalledWith(
                expect.objectContaining({ email: 'test@example.com' }),
                expect.any(Object)
            );
        });
    });

    // ── login ──────────────────────────────────────────────────────────────
    describe('login', () => {
        const loginInput = { identifier: 'test@example.com', password: 'password123' };

        it('should throw if user not found', async () => {
            vi.mocked(User.findOne).mockResolvedValue(null);
            await expect(authService.login(loginInput)).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
        });

        it('should throw if password incorrect', async () => {
            const user = sequelizeMock({ id: 'u1' });
            user.comparePassword.mockResolvedValue(false);
            vi.mocked(User.findOne).mockResolvedValue(user as any);

            await expect(authService.login(loginInput)).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
        });

        it('should login successfully and return tokens', async () => {
            const profile = sequelizeMock({ id: 'p1', user_id: 'u1' });
            const user = sequelizeMock({ 
                id: 'u1', 
                email: 'test@example.com', 
                role: 'TENANT', 
                profile 
            });
            user.comparePassword.mockResolvedValue(true);
            vi.mocked(User.findOne).mockResolvedValue(user as any);
            vi.mocked(generateTokenPair).mockReturnValue({ accessToken: 'at', refreshToken: 'rt' });

            const res = await authService.login(loginInput);
            expect(res.accessToken).toBe('at');
            expect(res.user.id).toBe('u1');
        });
    });

    // ── completeVerification ────────────────────────────────────────────────
    describe('completeVerification', () => {
        it('should throw if email not verified', async () => {
            const user = sequelizeMock({ id: 'u1', email_verified: false });
            vi.mocked(User.findByPk).mockResolvedValue(user as any);

            await expect(authService.completeVerification('u1', {} as any)).rejects.toMatchObject({ code: 'EMAIL_NOT_VERIFIED' });
        });

        it('should complete verification successfully', async () => {
            const profile = sequelizeMock({ id: 'p1' });
            const user = sequelizeMock({ id: 'u1', email_verified: true, profile });
            vi.mocked(User.findByPk).mockResolvedValue(user as any);

            const res = await authService.completeVerification('u1', { nationalId: '123', gender: 'MALE', birthdate: '1990-01-01' });
            expect(res.success).toBe(true);
            expect(profile.update).toHaveBeenCalled();
            expect(user.update).toHaveBeenCalledWith({ is_verified: true }, expect.any(Object));
            expect(emailService.sendWelcomeEmail).toHaveBeenCalled();
        });
    });

    // ── forgotPassword ─────────────────────────────────────────────────────
    describe('forgotPassword', () => {
        it('should generate token and send email', async () => {
            const user = sequelizeMock({ email: 'test@example.com' });
            vi.mocked(User.findOne).mockResolvedValue(user as any);
            vi.mocked(generateSecureToken).mockReturnValue({ token: 'raw', hashedToken: 'hashed' });
            vi.mocked(emailService.sendPasswordResetEmail).mockResolvedValue(true);

            const res = await authService.forgotPassword({ email: 'test@example.com' });
            expect(res.success).toBe(true);
            expect(user.update).toHaveBeenCalledWith(
                expect.objectContaining({ reset_token_hash: 'hashed' })
            );
            expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com', 'raw');
        });
    });

    // ── googleLogin ────────────────────────────────────────────────────────
    describe('loginWithGoogle', () => {
        it('should auto-register new Google user', async () => {
            vi.mocked(axios.get).mockResolvedValue({
                data: { email: 'google@example.com', given_name: 'G', family_name: 'User' }
            });
            vi.mocked(User.findOne).mockResolvedValue(null); // New user
            const profile = sequelizeMock({ id: 'gp1' });
            const user = sequelizeMock({ 
                id: 'gu1', 
                email: 'google@example.com', 
                profile 
            });
            vi.mocked(User.create).mockResolvedValue(user as any);
            vi.mocked(generateTokenPair).mockReturnValue({ accessToken: 'at', refreshToken: 'rt' });

            const res = await authService.loginWithGoogle('google-token');
            expect(User.create).toHaveBeenCalled();
            expect(res.accessToken).toBe('at');
        });
    });

    // ── resetPassword ─────────────────────────────────────────────────────
    describe('resetPassword', () => {
        it('should throw if token is invalid', async () => {
            vi.mocked(hashToken).mockReturnValue('wrong-hash');
            vi.mocked(User.findOne).mockResolvedValue(null);

            await expect(authService.resetPassword({ token: 't', newPassword: 'p' })).rejects.toMatchObject({ code: 'INVALID_RESET_TOKEN' });
        });

        it('should reset password successfully', async () => {
            vi.mocked(hashToken).mockReturnValue('hashed');
            const user = sequelizeMock({ reset_token_expires: new Date(Date.now() + 10000) });
            vi.mocked(User.findOne).mockResolvedValue(user as any);

            const res = await authService.resetPassword({ token: 't', newPassword: 'new-p' });
            expect(res.success).toBe(true);
            expect(user.update).toHaveBeenCalledWith(
                expect.objectContaining({ password_hash: 'new-p' })
            );
        });
    });

    // ── getCurrentUser ─────────────────────────────────────────────────────
    describe('getCurrentUser', () => {
        it('should return user and profile', async () => {
            const profile = sequelizeMock({ id: 'p1' });
            const user = sequelizeMock({ id: 'u1', profile });
            vi.mocked(User.findByPk).mockResolvedValue(user as any);

            const res = await authService.getCurrentUser('u1');
            expect(res.user.id).toBe('u1');
            expect(res.profile.id).toBe('p1');
        });
    });

    // ── updateProfile ──────────────────────────────────────────────────────
    describe('updateProfile', () => {
        it('should update profile fields', async () => {
            const profile = sequelizeMock({ id: 'p1' });
            const user = sequelizeMock({ id: 'u1', profile });
            vi.mocked(User.findByPk).mockResolvedValue(user as any);

            const res = await authService.updateProfile('u1', { firstName: 'Jane' });
            expect(profile.update).toHaveBeenCalledWith(
                expect.objectContaining({ first_name: 'Jane' }),
                expect.any(Object)
            );
            expect(res.profile.firstName).toBe('Jane');
        });
    });

    // ── changePassword ─────────────────────────────────────────────────────
    describe('changePassword', () => {
        it('should throw if current password incorrect', async () => {
            const user = sequelizeMock({ id: 'u1' });
            user.comparePassword.mockResolvedValue(false);
            vi.mocked(User.findByPk).mockResolvedValue(user as any);

            await expect(authService.changePassword('u1', { currentPassword: 'c', newPassword: 'n' }))
                .rejects.toMatchObject({ code: 'INVALID_CURRENT_PASSWORD' });
        });

        it('should change password successfully', async () => {
            const user = sequelizeMock({ id: 'u1' });
            // First call for current password, second call for "is it same as new"
            user.comparePassword.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
            vi.mocked(User.findByPk).mockResolvedValue(user as any);

            const res = await authService.changePassword('u1', { currentPassword: 'c', newPassword: 'new-n' });
            expect(res.success).toBe(true);
            expect(user.update).toHaveBeenCalledWith({ password_hash: 'new-n' });
        });
    });
});
