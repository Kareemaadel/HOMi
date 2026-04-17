import apiClient from '../config/api';
import type { PropertyResponse } from './property.service';

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

export interface PendingApprovalProperty {
    thumbnailUrl: string | null;
    id: string;
    title: string;
    description: string;
    monthlyPrice: number;
    address: string;
    type: string | null;
    furnishing: string | null;
    status: string;
    createdAt: string;
    landlord: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
    } | null;
    ownershipDocs: Array<{
        id: string;
        documentUrl: string;
    }>;
}

export interface ListingReport {
    id: string;
    reason: 'SCAM_OR_FRAUD' | 'MISLEADING_INFORMATION' | 'FAKE_PHOTOS' | 'DUPLICATE_LISTING' | 'OFFENSIVE_CONTENT' | 'UNAVAILABLE_OR_ALREADY_RENTED' | 'OTHER';
    details: string;
    status: 'OPEN' | 'REVIEWED' | 'ACTIONED';
    createdAt: string;
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

export interface ActivityLogItem {
    id: string;
    actorUserId: string | null;
    actorRole: string | null;
    actorEmail: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    description: string;
    metadata: Record<string, unknown> | null;
    createdAt: string;
}

export interface AdminUserProfileDetails {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
    emailVerified: boolean;
    createdAt: string;
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
    deletedAt: string | null;
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
    resetTokenExpires: string | null;
    emailVerificationTokenHash: string | null;
    emailVerificationTokenExpires: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
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
        createdAt: string;
        updatedAt: string;
    } | null;
}

class AdminService {
    async getDashboardStats() {
        const response = await apiClient.get<{ success: boolean; data: AdminStatsResponse }>('/admin/dashboard/stats');
        return response.data;
    }

    async getPendingProperties() {
        const response = await apiClient.get<{ success: boolean; data: PendingApprovalProperty[] }>('/admin/properties/pending');
        return response.data.data;
    }

    async verifyProperty(id: string, payload: VerifyPropertyRequest) {
        const response = await apiClient.patch<{ success: boolean; message: string; data: PropertyResponse }>(`/admin/properties/${id}/verify`, payload);
        return response.data;
    }

    async getListingReports() {
        const response = await apiClient.get<{ success: boolean; data: ListingReport[] }>('/admin/reports/listings');
        return response.data.data;
    }

    async removeListingFromReport(reportId: string) {
        const response = await apiClient.delete<{ success: boolean; message: string; data: { reportId: string; propertyId: string } }>(
            `/admin/reports/${reportId}/remove-listing`
        );
        return response.data;
    }

    async getActivityLogs(params?: { page?: number; limit?: number }) {
        const response = await apiClient.get<{ success: boolean; data: ActivityLogItem[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
            '/admin/activity-logs',
            { params }
        );
        return response.data;
    }

    async getUserProfile(userId: string) {
        const response = await apiClient.get<{ success: boolean; data: AdminUserProfileDetails }>(`/admin/users/${userId}/profile`);
        return response.data.data;
    }

    async getPropertyDetails(propertyId: string) {
        const response = await apiClient.get<{ success: boolean; data: AdminPropertyDetails }>(`/admin/properties/${propertyId}/details`);
        return response.data.data;
    }

    async getUsersForManagement() {
        const response = await apiClient.get<{ success: boolean; data: { landlords: AdminManagedUser[]; tenants: AdminManagedUser[] } }>(
            '/admin/users/management/all'
        );
        return response.data.data;
    }
}

export const adminService = new AdminService();
export default adminService;
