const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Get Roof Area and Data from Google Solar API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
const getRoofData = async (lat, lng) => {
    if (!GOOGLE_MAPS_API_KEY) {
        console.warn('[Solar Service] Missing GOOGLE_MAPS_API_KEY');
        return null;
    }

    try {
        const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&key=${GOOGLE_MAPS_API_KEY}`;

        const response = await fetch(url);
        if (!response.ok) {
            const error = await response.json();
            console.error('[Solar Service] API Error:', error);
            return null;
        }

        const data = await response.json();

        // Extract area from solar potential
        // areaMeters2 is the total area of the roof
        const areaM2 = data.solarPotential?.wholeRoofStats?.areaMeters2 || 0;

        // Convert to Square Feet (1 m2 = 10.7639 sqft)
        const areaSqFt = Math.round(areaM2 * 10.7639);

        return {
            areaSqFt,
            solarPotential: data.solarPotential,
            imageryDate: data.imageryDate
        };
    } catch (error) {
        console.error('[Solar Service] Fetch Failure:', error);
        return null;
    }
};

module.exports = {
    getRoofData
};
