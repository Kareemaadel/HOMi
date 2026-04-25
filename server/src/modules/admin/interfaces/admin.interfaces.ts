import type { PropertyResponse } from '../../properties/interfaces/property.interfaces.js';

export interface AdminStatsResponse {
    totalUsers: number;
    totalProperties: number;
    rentedProperties: number;
    activeContracts: number;
}

export interface VerifyPropertyRequest {
    action: 'APPROVE' | 'REJECT';
    rejectionReason?: string;
}

export interface VerificationResponse {
    success: boolean;
    message: string;
    property: PropertyResponse;
}

export interface AdminListingReport {
    id: string;
    reason: string;
    details: string;
    status: 'OPEN' | 'REVIEWED' | 'ACTIONED';
    createdAt: Date;
    property: {
        id: string;
        title: string;
        address: string;
        monthlyPrice: number;
        thumbnailUrl: string | null;
        landlord: {
            id: string;
            email: string;
            firstName?: string;
            lastName?: string;
        } | null;
    };
    reporter: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
    } | null;
}

export interface AdminActivityLogItem {
    id: string;
    actorUserId: string | null;
    actorRole: string | null;
    actorEmail: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    description: string;
    metadata: Record<string, any> | null;
    createdAt: Date;
}

export interface AdminUserProfileDetails {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
    emailVerified: boolean;
    createdAt: Date;
    profile: {
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
        avatarUrl: string | null;
        bio: string | null;
        currentLocation: string | null;
        gender: string | null;
        birthdate: string | null;
        nationalId: string | null;
    } | null;
}

export interface AdminPropertyDetails {
    id: string;
    title: string;
    description: string;
    status: string;
    address: string;
    monthlyPrice: number;
    landlordId: string;
    deletedAt: Date | null;
    landlord: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
    } | null;
}

export interface AdminManagedUser {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
    emailVerified: boolean;
    resetTokenHash: string | null;
    resetTokenExpires: Date | null;
    emailVerificationTokenHash: string | null;
    emailVerificationTokenExpires: Date | null;
    isBanned: boolean;
    banReason: string | null;
    banMessage: string | null;
    banUntil: Date | null;
    bannedByAdminId: string | null;
    banCreatedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    profile: {
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        bio: string | null;
        avatarUrl: string | null;
        currentLocation: string | null;
        nationalIdEncrypted: string | null;
        nationalIdDecrypted: string | null;
        gender: string | null;
        birthdate: string | null;
        gamificationPoints: number;
        preferredBudgetMin: number | null;
        preferredBudgetMax: number | null;
        walletBalance: number;
        walletPendingOrderId: number | null;
        walletPendingAmountCents: number | null;
        walletPendingSaveCard: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null;
}

export interface AdminSupportInboxItem {
    conversationId: string;
    user: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
    };
    lastMessagePreview: string | null;
    lastMessageAt: string | null;
    unreadFromUser: number;
}

export interface PendingMaintenanceApplication {
    id: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    providerType: 'CENTER' | 'INDIVIDUAL';
    businessName: string | null;
    category: string;
    categories: string[] | null;
    criminalRecordDocument: string | null;
    selfieImage: string | null;
    nationalIdFront: string | null;
    nationalIdBack: string | null;
    numberOfEmployees: number | null;
    companyLocation: string | null;
    documentationFiles: string[] | null;
    notes: string | null;
    createdAt: Date;
}
