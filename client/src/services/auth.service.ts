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

/**
 * Authentication Service
 * Handles all auth-related API calls
 */
class AuthService {
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
        
        // Store tokens and user data
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('profile', JSON.stringify(response.data.profile));
        }
        
        return response.data;
    }

    /**
     * Logout - clear local storage
     */
    logout(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
    }

    /**
     * Get current user data from localStorage
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        const profileStr = localStorage.getItem('profile');
        
        if (!userStr || !profileStr) {
            return null;
        }
        
        return {
            user: JSON.parse(userStr),
            profile: JSON.parse(profileStr),
        };
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('accessToken');
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
     */
    async updateProfile(data: UpdateProfileRequest): Promise<AuthSuccessResponse> {
        const response = await apiClient.put<AuthSuccessResponse>('/api/auth/profile', data);
        
        // Refresh user data after update
        await this.getProfile();
        
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
        const response = await apiClient.get<EmailVerificationResponse>(`/auth/verify-email/${token}`);
        return response.data;
    }

    /**
     * Resend verification email
     */
    async resendVerification(): Promise<AuthSuccessResponse> {
        const response = await apiClient.post<AuthSuccessResponse>('/auth/resend-verification');
        return response.data;
    }

    /**
     * Login with Google OAuth
     */
    async loginWithGoogle(googleAccessToken: string): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/google', {
            googleAccessToken,
        });
        
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('profile', JSON.stringify(response.data.profile));
        }
        
        return response.data;
    }
}

export const authService = new AuthService();
export default authService;
