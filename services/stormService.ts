
import { StormEvent, StormReport } from '../types';
import { apiClient } from './apiClient';

// Fetch historical weather data via backend proxy
export const getStormHistory = async (lat: number, lng: number): Promise<StormReport> => {
    try {
        const data = await apiClient.get(`/api/storm-history?lat=${lat}&lng=${lng}`);
        return data as StormReport;
    } catch (error) {
        console.error('[Storm Service] Failed to fetch storm history:', error);
        throw error;
    }
};
