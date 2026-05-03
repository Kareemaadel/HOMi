import apiClient from '../../../config/api';
import type { 
    EligibilityResponse, 
    RoommateRequest, 
    RoommateMatch 
} from '../types/roommateMatchingTypes';

class RoommateMatchingService {
    /**
     * Check if user is eligible for roommate matching
     */
    async checkEligibility(): Promise<EligibilityResponse> {
        const response = await apiClient.get<EligibilityResponse>('/roommate-matching/eligibility');
        return response.data;
    }

    /**
     * Create a new roommate request
     */
    async createRequest(data: any): Promise<RoommateRequest> {
        const response = await apiClient.post<RoommateRequest>('/roommate-matching/requests', data);
        return response.data;
    }

    /**
     * Get user's current active request
     */
    async getMyActiveRequest(): Promise<RoommateRequest | null> {
        const response = await apiClient.get<RoommateRequest | null>('/roommate-matching/requests/me');
        return response.data;
    }

    /**
     * Update a roommate request
     */
    async updateRequest(id: string, data: any): Promise<RoommateRequest> {
        const response = await apiClient.patch<RoommateRequest>(`/roommate-matching/requests/${id}`, data);
        return response.data;
    }

    /**
     * Cancel a roommate request
     */
    async cancelRequest(id: string): Promise<void> {
        await apiClient.delete(`/roommate-matching/requests/${id}`);
    }

    /**
     * Trigger AI matching for a request
     */
    async findMatches(id: string): Promise<{ found: number }> {
        const response = await apiClient.post<{ found: number }>(`/roommate-matching/requests/${id}/find-matches`);
        return response.data;
    }

    /**
     * Get user's matches
     */
    async getMatches(): Promise<RoommateMatch[]> {
        const response = await apiClient.get<RoommateMatch[]>('/roommate-matching/matches');
        return response.data;
    }

    /**
     * Respond to a match
     */
    async respondToMatch(id: string, action: 'ACCEPTED' | 'DECLINED'): Promise<RoommateMatch> {
        const response = await apiClient.patch<RoommateMatch>(`/roommate-matching/matches/${id}/respond`, { action });
        return response.data;
    }

    /**
     * Browse active requests
     */
    async browseRequests(filters: any = {}): Promise<RoommateRequest[]> {
        const response = await apiClient.get<RoommateRequest[]>('/roommate-matching/requests/browse', { params: filters });
        return response.data;
    }
}

export const roommateMatchingService = new RoommateMatchingService();
export default roommateMatchingService;
