/**
 * Helper to get HubSpot tracking cookie
 */
export const getHubspotUtk = (): string | undefined => {
    const name = 'hubspotutk';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
};

/**
 * Interface for UTM parameters
 */
export interface UtmParams {
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmTerm: string | null;
    utmContent: string | null;
}

/**
 * Retrieve captured UTM parameters from sessionStorage
 */
export const getSavedUtms = (): UtmParams => {
    return {
        utmSource: sessionStorage.getItem('utm_source'),
        utmMedium: sessionStorage.getItem('utm_medium'),
        utmCampaign: sessionStorage.getItem('utm_campaign'),
        utmTerm: sessionStorage.getItem('utm_term'),
        utmContent: sessionStorage.getItem('utm_content'),
    };
};

/**
 * Get unified tracking data for API payloads
 */
export const getTrackingData = () => {
    return {
        hutk: getHubspotUtk(),
        ...getSavedUtms()
    };
};
