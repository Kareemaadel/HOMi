//client\src\services\auth.service.ts
import axios from 'axios';
import apiClient from '../config/api';
import type {
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    AuthSuccessResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    CompleteVerificationRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
    UserProfileResponse,
    EmailVerificationResponse,
} from '../types/auth.types';

const REFRESH_VIA_COOKIE = 'refreshViaCookie';

/** One shared request per token (React Strict Mode runs effects twice; 2nd call must not re-verify after DB clears). */
const verifyEmailInFlight = new Map<string, Promise<EmailVerificationResponse>>();

function parseJwtExpMs(accessToken: string): number | null {
    try {
        const payload = JSON.parse(atob(accessToken.split('.')[1])) as { exp?: number };
        return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

function isAccessTokenValid(accessToken: string): boolean {
    const expMs = parseJwtExpMs(accessToken);
    if (expMs === null) return false;
    return Date.now() < expMs - 10_000;
}

/**
 * Store tokens after login/register — aligns session storage with Remember me (httpOnly cookie vs body).
 */
function persistLoginSession(data: LoginResponse, rememberMe: boolean): void {
    localStorage.setItem('accessToken', data.accessToken);

    if (data.refreshToken) {
        sessionStorage.setItem('refreshToken', data.refreshToken);
        localStorage.removeItem('refreshToken');
        localStorage.removeItem(REFRESH_VIA_COOKIE);
    } else if (rememberMe) {
        sessionStorage.removeItem('refreshToken');
        localStorage.removeItem('refreshToken');
        localStorage.setItem(REFRESH_VIA_COOKIE, '1');
    } else {
        sessionStorage.removeItem('refreshToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem(REFRESH_VIA_COOKIE);
    }

    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('profile', JSON.stringify(data.profile));
}

/**
 * Authentication Service
 * Handles all auth-related API calls
 * NOTE: apiClient baseURL should include /api (e.g. http://localhost:3000/api),
 * so paths here are relative to /api (e.g. '/auth/login' → /api/auth/login)
 */
class AuthService {
    /**
     * Decide where a user should land after auth/restore.
     * Incomplete profiles must finish onboarding before any dashboard.
     */
    resolvePostAuthRoute(source?: {
        user?: { role?: string | null };
        profile?: { isVerificationComplete?: boolean | null };
    }): string {
        const cached = source ?? this.getCurrentUser() ?? undefined;
        const role = cached?.user?.role;
        const hasAppRole = role === 'LANDLORD' || role === 'TENANT' || role === 'ADMIN';

        // Onboarding gate should enforce selecting a role, not forcing every optional profile field.
        if (!hasAppRole) return '/complete-profile';
        if (role === 'ADMIN') return '/admin/dashboard';
        if (role === 'LANDLORD') return '/landlord-home';
        if (role === 'TENANT') return '/tenant-home';

        return '/complete-profile';
    }

    /**
     * Register a new user
     */
    async register(data: RegisterRequest): Promise<AuthSuccessResponse> {
        const response = await apiClient.post<AuthSuccessResponse>('/auth/register', data);
        return response.data;
    }

    /**
     * Login with email/phone and password
     */
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/login', data);

        if (response.data.accessToken) {
            persistLoginSession(response.data, data.rememberMe === true);
            localStorage.setItem('authProvider', 'email');
        }

        return response.data;
    }

    /**
     * Logout — clears httpOnly refresh cookie on the server and local session data
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout', {});
        } catch {
            // Still clear client state if the network fails
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem(REFRESH_VIA_COOKIE);
        sessionStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
        localStorage.removeItem('authProvider');
    }

    /**
     * Get current user data from localStorage
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        const profileStr = localStorage.getItem('profile');

        if (!userStr) {
            return null;
        }

        return {
            user: JSON.parse(userStr),
            profile: profileStr ? JSON.parse(profileStr) : null,
        };
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('accessToken');
    }

    /**
     * Restore a logged-in session: valid access JWT, or refresh via cookie / stored refresh token.
     * Use on /auth (redirect away) and in AuthGuard before treating the user as logged out.
     */
    async tryRestoreSession(): Promise<boolean> {
        const token = localStorage.getItem('accessToken');
        let cached = this.getCurrentUser();

        if (token && isAccessTokenValid(token)) {
            if (!cached) {
                try {
                    await this.getProfile();
                    cached = this.getCurrentUser();
                } catch {
                    localStorage.removeItem('accessToken');
                    return false;
                }
            }
            return !!cached;
        }

        const refreshViaCookie = localStorage.getItem(REFRESH_VIA_COOKIE) === '1';
        const refreshToken =
            sessionStorage.getItem('refreshToken') ?? localStorage.getItem('refreshToken');

        if (!refreshViaCookie && !refreshToken) {
            if (token) {
                localStorage.removeItem('accessToken');
            }
            return false;
        }

        try {
            const base = apiClient.defaults.baseURL?.replace(/\/$/, '') ?? '';
            const body = refreshViaCookie ? {} : { refreshToken };
            const { data } = await axios.post<{ accessToken: string }>(
                `${base}/auth/refresh`,
                body,
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            localStorage.setItem('accessToken', data.accessToken);
            if (!this.getCurrentUser()) {
                await this.getProfile();
            }
            return true;
        } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem(REFRESH_VIA_COOKIE);
            sessionStorage.removeItem('refreshToken');
            localStorage.removeItem('refreshToken');
            return false;
        }
    }

    /**
     * Get current user profile from API
     */
    async getProfile(): Promise<UserProfileResponse> {
        const response = await apiClient.get<UserProfileResponse>('/auth/me');

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('profile', JSON.stringify(response.data.profile));

        return response.data;
    }

    /**
     * Complete verification
     */
    async completeVerification(data: CompleteVerificationRequest): Promise<AuthSuccessResponse> {
        const response = await apiClient.post<AuthSuccessResponse>('/auth/complete-verification', data);

        // Refresh user data after completing verification
        await this.getProfile();

        return response.data;
    }

    /**
     * Update user profile
     * Returns the updated UserProfileResponse (user + profile)
     */
    async updateProfile(data: UpdateProfileRequest): Promise<UserProfileResponse> {
        const response = await apiClient.put<UserProfileResponse>('/auth/profile', data);

        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('profile', JSON.stringify(response.data.profile));

        return response.data;
    }

    /**
     * Change password
     */
    async changePassword(data: ChangePasswordRequest): Promise<AuthSuccessResponse> {
        const response = await apiClient.put<AuthSuccessResponse>('/auth/change-password', data);
        return response.data;
    }

    /**
     * Update user role
     */
    async updateRole(data: { role: string }): Promise<LoginResponse> {
        const response = await apiClient.put<LoginResponse>('/auth/role', data);

        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            if (response.data.refreshToken) {
                sessionStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.removeItem('refreshToken');
                localStorage.removeItem(REFRESH_VIA_COOKIE);
            }
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('profile', JSON.stringify(response.data.profile));
        }

        return response.data;
    }

    /**
     * Request password reset
     */
    async forgotPassword(data: ForgotPasswordRequest): Promise<AuthSuccessResponse> {
        const response = await apiClient.post<AuthSuccessResponse>('/auth/forgot-password', data);
        return response.data;
    }

    /**
     * Reset password with token
     */
    async resetPassword(data: ResetPasswordRequest): Promise<AuthSuccessResponse> {
        const response = await apiClient.post<AuthSuccessResponse>('/auth/reset-password', data);
        return response.data;
    }

    /**
     * Verify email with token
     */
    async verifyEmail(token: string): Promise<EmailVerificationResponse> {
        const t = typeof token === 'string' ? token.trim() : String(token).trim();
        if (!t) {
            return Promise.reject(new Error('Verification token is required'));
        }

        const existing = verifyEmailInFlight.get(t);
        if (existing) {
            return existing;
        }

        const request = apiClient
            .get<EmailVerificationResponse>('/auth/verify-email', {
                params: { token: t },
                headers: { Accept: 'application/json' },
            })
            .then((response) => response.data)
            .finally(() => {
                verifyEmailInFlight.delete(t);
            });

        verifyEmailInFlight.set(t, request);
        return request;
    }

    /**
     * Send / resend email verification link
     * Requires the user to be logged in (JWT must be in localStorage)
     */
    async sendVerificationEmail(): Promise<AuthSuccessResponse> {
        const response = await apiClient.post<AuthSuccessResponse>('/auth/send-verification-email');
        return response.data;
    }

    /**
     * Login with Google OAuth
     */
    async loginWithGoogle(googleAccessToken: string, rememberMe = false): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/google', {
            googleAccessToken,
            rememberMe,
        });

        if (response.data.accessToken) {
            persistLoginSession(response.data, rememberMe);
            localStorage.setItem('authProvider', 'google');
        }

        return response.data;
    }

    /**
     * Get the authenticated tenant's current habits
     */
    async getUserHabits(): Promise<{ habit_names: string[] }> {
        const response = await apiClient.get<{ habit_names: string[] }>('/auth/habits');
        return response.data;
    }

    /**
     * Replace the authenticated user's habits with the provided list.
     * Pass an empty array to clear all habits.
     * Habit names must exactly match the seeded values (e.g. "Non-smoker", "Early Riser").
     */
    async setHabits(habitNames: string[]): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.put<{ success: boolean; message: string }>('/auth/habits', {
            habit_names: habitNames,
        });
        return response.data;
    }

    /**
     * Permanently delete the authenticated account (server enforces no properties / requests / contracts).
     * Clears local session on success. Does not call logout — the user row is removed.
     */
    async deleteAccount(): Promise<AuthSuccessResponse> {
        const response = await apiClient.delete<AuthSuccessResponse>('/auth/account');

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem(REFRESH_VIA_COOKIE);
        sessionStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
        localStorage.removeItem('authProvider');

        return response.data;
    }
}

export const authService = new AuthService();
export default authService;
