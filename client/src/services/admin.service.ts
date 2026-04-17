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
}

export const adminService = new AdminService();
export default adminService;
