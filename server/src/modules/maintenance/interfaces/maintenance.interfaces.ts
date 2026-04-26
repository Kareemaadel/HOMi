import type {
    MaintenanceRequestStatusType,
    MaintenanceUrgencyType,
    MaintenanceChargePartyType,
} from '../models/MaintenanceRequest.js';
import type { MaintenanceJobApplicationStatusType } from '../models/MaintenanceJobApplication.js';
import type {
    MaintenanceConflictStatusType,
    MaintenanceConflictResolutionType,
} from '../models/MaintenanceConflict.js';

export interface PostMaintenanceIssueInput {
    propertyId?: string;        // optional — if not given we resolve from active contract
    contractId?: string;
    category: string;
    title: string;
    description: string;
    urgency: MaintenanceUrgencyType;
    estimatedBudget?: number | null;
    images?: string[];          // base64 data URLs
}

export interface ProviderApplyInput {
    finalPrice: number;
    priceBreakdown?: string | null;
    coverNote?: string | null;
    etaHours?: number | null;
}

export interface AcceptApplicationInput {
    applicationId: string;
}

export interface UpdateLocationInput {
    lat: number;
    lng: number;
    accuracyM?: number | null;
    heading?: number | null;
    speed?: number | null;
}

export interface MarkProviderCompleteInput {
    completionNotes?: string | null;
    completionImages: string[]; // required: at least one
}

export interface ConfirmCompletionInput {
    solved: boolean;
    rating?: number;          // required if solved
    ratingComment?: string | null;
    disputeReason?: string;   // required if !solved
}

export interface AdminResolveConflictInput {
    resolution: MaintenanceConflictResolutionType;
    adminNotes?: string | null;
}

// ─── Response shapes ───────────────────────────────────────────────────────

export interface PartyMini {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    phone: string | null;
}

export interface PropertyMini {
    id: string;
    title: string;
    address: string;
    thumbnailUrl: string | null;
    lat: number | null;
    lng: number | null;
}

export interface MaintenanceJobApplicationResponse {
    id: string;
    requestId: string;
    providerId: string;
    finalPrice: number;
    priceBreakdown: string | null;
    coverNote: string | null;
    etaHours: number | null;
    status: MaintenanceJobApplicationStatusType;
    createdAt: Date;
    provider?: (PartyMini & {
        rating: number;
        ratingsCount: number;
        category: string | null;
        providerType: string | null;
        businessName: string | null;
        bio: string | null;
    }) | undefined;
    /**
     * Optional snapshot of the related maintenance request — included by
     * endpoints where the caller doesn't already have request context (e.g.
     * provider's "my applications").
     */
    request?: {
        id: string;
        title: string;
        description: string;
        category: string;
        urgency: MaintenanceUrgencyType;
        status: MaintenanceRequestStatusType;
        createdAt: Date;
        tenant?: PartyMini | undefined;
        property?: PropertyMini | undefined;
    } | undefined;
}

export interface MaintenanceLocationResponse {
    lat: number;
    lng: number;
    reportedAt: Date;
    accuracyM: number | null;
    heading: number | null;
    speed: number | null;
}

export interface MaintenanceConflictResponse {
    id: string;
    requestId: string;
    tenantReason: string;
    providerCompletionNotes: string | null;
    status: MaintenanceConflictStatusType;
    resolution: MaintenanceConflictResolutionType | null;
    adminNotes: string | null;
    resolvedAt: Date | null;
    createdAt: Date;
}

export interface MaintenanceRatingResponse {
    rating: number;
    comment: string | null;
    createdAt: Date;
}

export interface MaintenanceRequestResponse {
    id: string;
    tenantId: string;
    landlordId: string;
    propertyId: string;
    contractId: string | null;
    assignedProviderId: string | null;
    category: string;
    title: string;
    description: string;
    urgency: MaintenanceUrgencyType;
    estimatedBudget: number | null;
    images: string[];
    status: MaintenanceRequestStatusType;
    chargeParty: MaintenanceChargePartyType;
    agreedPrice: number | null;
    escrowAmount: number;
    completionNotes: string | null;
    completionImages: string[];
    enRouteStartedAt: Date | null;
    inProgressStartedAt: Date | null;
    providerCompletedAt: Date | null;
    tenantConfirmedAt: Date | null;
    disputedAt: Date | null;
    disputedReason: string | null;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    tenant?: PartyMini | undefined;
    landlord?: PartyMini | undefined;
    provider?: (PartyMini & {
        category: string | null;
        providerType: string | null;
        businessName: string | null;
        rating: number;
        ratingsCount: number;
    }) | undefined;
    property?: PropertyMini | undefined;
    applications?: MaintenanceJobApplicationResponse[] | undefined;
    applicationsCount?: number | undefined;
    currentLocation?: MaintenanceLocationResponse | null | undefined;
    conflict?: MaintenanceConflictResponse | null | undefined;
    rating?: MaintenanceRatingResponse | null | undefined;
    /**
     * Indicates that the calling provider already applied to this request.
     * Only populated by `listAvailableJobs`.
     */
    alreadyApplied?: boolean | undefined;
}

export interface BrowseProviderItem {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    bio: string | null;
    providerType: 'INDIVIDUAL' | 'CENTER';
    businessName: string | null;
    primaryCategory: string;
    categories: string[];
    companyLocation: string | null;
    rating: number;
    ratingsCount: number;
    completedJobsCount: number;
}
