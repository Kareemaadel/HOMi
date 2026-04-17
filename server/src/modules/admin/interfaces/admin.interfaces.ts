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
