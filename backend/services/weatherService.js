const { pool } = require('../config/db');

/**
 * Get Historical Storm Data from local database
 * @param {number} lat 
 * @param {number} lng 
 * @param {number} radiusMiles - Default 10 miles
 */
const getStormHistory = async (lat, lng, radiusMiles = 30) => {
    try {
        // Using Haversine formula for radius search
        // 3959 is the radius of Earth in miles
        const query = `
            SELECT id, episode_id, event_id, year, month_name, event_type, begin_location, begin_lat, begin_lon, magnitude, tor_f_scale, damage_property,
                (3959 * acos(cos(radians($1)) * cos(radians(begin_lat)) * cos(radians(begin_lon) - radians($2)) + sin(radians($1)) * sin(radians(begin_lat)))) AS distance
            FROM storm_events
            WHERE (3959 * acos(cos(radians($1)) * cos(radians(begin_lat)) * cos(radians(begin_lon) - radians($2)) + sin(radians($1)) * sin(radians(begin_lat)))) < $3
            ORDER BY year DESC, distance ASC
            LIMIT 20;
        `;

        const result = await pool.query(query, [lat, lng, radiusMiles]);

        const events = result.rows.map(row => {
            const monthLabel = row.month_name ? (row.month_name.length > 3 ? row.month_name.substring(0, 3) : row.month_name) : 'Storm';

            // Synthesize "Strength" based on event type
            let strength = 'Documented Entry';
            if (row.event_type === 'Tornado' && row.tor_f_scale) {
                strength = `${row.tor_f_scale} Scale`;
            } else if (row.event_type === 'Hail' && row.magnitude) {
                strength = `${row.magnitude} in`;
            } else if (row.event_type && row.event_type.includes('Wind') && row.magnitude) {
                strength = `${row.magnitude} kts`;
            } else if (row.damage_property && row.damage_property !== '0.00K') {
                strength = `${row.damage_property} Damage`;
            }

            return {
                date: `${monthLabel} ${row.year}`,
                type: row.event_type || 'Storm Event',
                severity: strength,
                insurancePotential: (row.event_type === 'Hail' || row.event_type === 'Thunderstorm Wind' || (row.magnitude && row.magnitude > 50)),
                location: row.begin_location || 'Unknown',
                distance: parseFloat(row.distance).toFixed(1),
                eventId: row.event_id,
                episodeId: row.episode_id
            };
        });

        const lastStorm = events.length > 0 ? events[0].date : null;
        const hasSevereEvent = events.some(e => e.insurancePotential || (parseFloat(e.severity) > 50)); // Simplified check

        let riskLevel = 'Low';
        if (events.length > 0) {
            riskLevel = 'Medium'; // Default to Medium if ANY storm is found (User wants to know!)
            if (events.length > 3 || events.some(e => e.severity.includes('Scale') || parseInt(e.severity) > 60 || e.severity.includes('Damage'))) {
                riskLevel = 'High';
            }
        }

        return {
            riskLevel,
            events,
            lastStormDate: lastStorm,
            summary: events.length > 0
                ? `Found ${events.length} documented storm events within ${radiusMiles} miles of this property since 2024.`
                : `No historical storm events recorded within ${radiusMiles} miles of this location in our database.`,
            isSimulated: false,
            dataSource: 'Internal CRM / Storm Data'
        };

    } catch (error) {
        console.error('[Storm Service] DB Query Failure:', error);
        return null;
    }
};

module.exports = {
    getStormHistory
};
