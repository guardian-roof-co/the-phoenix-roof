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
            const errorBody = await response.json().catch(() => ({}));
            // Prioritize specific error properties, then fall back to a generic message
            const errorMessage = errorBody.error || errorBody.message || `API Request failed: ${response.status}`;
            // Re-throw the error with more context, potentially including the full errorBody
            const error = new Error(errorMessage);
            Object.assign(error, { status: response.status, ...errorBody });
            throw error;
        }

        return response.json();
    },

    async get(endpoint: string) {
        const response = await fetch(endpoint);
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            // Prioritize specific error properties, then fall back to a generic message
            const errorMessage = errorBody.error || errorBody.message || `API Request failed: ${response.status}`;
            // Re-throw the error with more context, potentially including the full errorBody
            const error = new Error(errorMessage);
            Object.assign(error, { status: response.status, ...errorBody });
            throw error;
        }
        return response.json();
    }
};
