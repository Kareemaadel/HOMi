import apiClient from '../config/api';
import type { PropertyResponse } from './property.service';

class SavedPropertiesService {
    async getSavedIds(): Promise<string[]> {
        const response = await apiClient.get<{ success: boolean; data: string[] }>('/saved-properties/my/ids');
        return response.data.data;
    }

    async getSavedProperties(): Promise<PropertyResponse[]> {
        const response = await apiClient.get<{ success: boolean; data: PropertyResponse[] }>('/saved-properties/my');
        return response.data.data;
    }

    async saveProperty(propertyId: string | number): Promise<void> {
        await apiClient.post(`/saved-properties/${propertyId}`);
    }

    async removeSavedProperty(propertyId: string | number): Promise<void> {
        await apiClient.delete(`/saved-properties/${propertyId}`);
    }

    async clearAll(): Promise<void> {
        await apiClient.delete('/saved-properties/my');
    }
}

export const savedPropertiesService = new SavedPropertiesService();
export default savedPropertiesService;
