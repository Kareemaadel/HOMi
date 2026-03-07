// ==========================================
// Type Definitions for Auth
// ==========================================

export type UserRole = 'LANDLORD' | 'TENANT' | 'ADMIN' | 'SUPPORT';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

// ==========================================
// Request Types
// ==========================================

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'LANDLORD' | 'TENANT';
}

export interface LoginRequest {
    identifier: string; // Can be email or phone number
    password: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface CompleteVerificationRequest {
    nationalId: string;
    gender: Gender;
    birthdate: string;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    avatarUrl?: string;
    preferredBudgetMin?: number;
    preferredBudgetMax?: number;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

// ==========================================
// Response Types
// ==========================================

export interface ProfileResponse {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    bio: string | null;
    avatarUrl: string | null;
    gender: Gender | null;
    birthdate: string | null;
    gamificationPoints: number;
    preferredBudgetMin: number | null;
    preferredBudgetMax: number | null;
    isVerificationComplete: boolean;
}

export interface UserResponse {
    id: string;
    email: string;
    role: UserRole;
    isVerified: boolean;
    emailVerified: boolean;
    createdAt: Date;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: UserResponse;
    profile: ProfileResponse;
}

export interface AuthSuccessResponse {
    success: boolean;
    message: string;
}

export interface UserProfileResponse {
    user: UserResponse;
    profile: ProfileResponse;
}

export interface EmailVerificationResponse {
    success: boolean;
    message: string;
    emailVerified?: boolean;
}

// ==========================================
// Error Response
// ==========================================

export interface ErrorResponse {
    success: false;
    message: string;
    error?: string;
    code?: string;
}
