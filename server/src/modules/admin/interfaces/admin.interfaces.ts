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
