const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

/**
 * Get Historical Storm Data (Hail/Wind)
 * @param {number} lat 
 * @param {number} lng 
 */
const getStormHistory = async (lat, lng) => {
    if (!OPENWEATHER_API_KEY) {
        console.warn('[Weather Service] Missing OPENWEATHER_API_KEY');
        return null; // Will trigger simulation fallback in route
    }

    try {
        // OpenWeather History API (Last 2 years)
        // Note: For real roofing use, services like HailRecon are better, 
        // but OpenWeather is the best general-purpose starting point.

        // We fetching "History Bulk" or iterate through major storm dates
        // For this implementation, we will fetch the last 12 months of daily summaries if possible
        // or clear historical events if the specific sub-product is subscribed.

        const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall/day_summary?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}`);

        if (!response.ok) {
            console.error('[Weather Service] API Error Status:', response.status);
            return null;
        }

        const data = await response.json();

        // This is a simplified mapper. Real-world implementation would 
        // fetch multiple dates or use a specialized Storm API provider.
        return data;
    } catch (error) {
        console.error('[Weather Service] Fetch Failure:', error);
        return null;
    }
};

module.exports = {
    getStormHistory
};
