import { getTrackingData } from '../utils/tracking';

/**
 * Unified API Client
 * 
 * Automatically attaches tracking tokens (HUK, UTMs) and standardizes error handling.
 */
export const apiClient = {
    async post(endpoint: string, data: any) {
        const tracking = getTrackingData();
        const payload = {
            ...data,
            ...tracking,
            pageUri: window.location.href
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `API Request failed: ${response.status}`);
        }

        return response.json();
    },

    async get(endpoint: string) {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`API Request failed: ${response.status}`);
        }
        return response.json();
    }
};
