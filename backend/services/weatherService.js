const { pool } = require('../config/db');

/**
 * Get Historical Storm Data from local database
 * @param {number} lat 
 * @param {number} lng 
 * @param {number} radiusMiles - Default 10 miles
 */
const getStormHistory = async (lat, lng, radiusMiles = 10) => {
    try {
        // Using Haversine formula for radius search
        // 3959 is the radius of Earth in miles
        const query = `
            SELECT id, episode_id, event_id, year, month_name, event_type, begin_location, begin_lat, begin_lon, magnitude, tor_f_scale, damage_property, begin_date_time,
                (3959 * acos(cos(radians($1)) * cos(radians(begin_lat)) * cos(radians(begin_lon) - radians($2)) + sin(radians($1)) * sin(radians(begin_lat)))) AS distance
            FROM storm_events
            WHERE (3959 * acos(cos(radians($1)) * cos(radians(begin_lat)) * cos(radians(begin_lon) - radians($2)) + sin(radians($1)) * sin(radians(begin_lat)))) < $3
            AND year >= 2025
            ORDER BY 
                year DESC, 
                CASE UPPER(month_name) 
                    WHEN 'JANUARY' THEN 1 WHEN 'FEBRUARY' THEN 2 WHEN 'MARCH' THEN 3 
                    WHEN 'APRIL' THEN 4 WHEN 'MAY' THEN 5 WHEN 'JUNE' THEN 6 
                    WHEN 'JULY' THEN 7 WHEN 'AUGUST' THEN 8 WHEN 'SEPTEMBER' THEN 9 
                    WHEN 'OCTOBER' THEN 10 WHEN 'NOVEMBER' THEN 11 WHEN 'DECEMBER' THEN 12 
                    ELSE 0 END DESC,
                distance ASC
            LIMIT 20;
        `;

        const result = await pool.query(query, [lat, lng, radiusMiles]);

        const events = result.rows.map(row => {
            const monthLabel = row.month_name ? (row.month_name.length > 3 ? row.month_name.substring(0, 3) : row.month_name) : 'Storm';

            // Synthesize "Strength" based on event type
            let strength = 'Documented Entry';
            let isSevere = false;

            if (row.event_type === 'Tornado' && row.tor_f_scale) {
                strength = `${row.tor_f_scale} Scale`;
                isSevere = true; // Tornadoes are always severe
            } else if (row.event_type === 'Hail' && row.magnitude) {
                strength = `${row.magnitude}" Hail`;
                // Standard industry threshold for claimable damage is often >= 1.0 inch
                if (parseFloat(row.magnitude) >= 1.0) isSevere = true;
            } else if (row.event_type && row.event_type.includes('Wind') && row.magnitude) {
                // Convert Knots (historical data format) to MPH (user friendly)
                // 1 knot = 1.15078 mph
                const mph = Math.round(row.magnitude * 1.15078);
                strength = `${mph} mph Wind`;
                // Severe Thunderstorm criteria is usually 58 mph (50 kts)
                if (mph >= 58) isSevere = true;
            } else if (row.damage_property && row.damage_property !== '0.00K') {
                strength = `${row.damage_property} Damage`;
                isSevere = true;
            }

            // Extract cleaner date from begin_date_time (Format: 01-MAR-25 12:00:00)
            const beginDate = row.begin_date_time ? row.begin_date_time.split(' ')[0] : `${monthLabel} ${row.year}`;

            return {
                date: `${monthLabel} ${row.year}`,
                beginDate: beginDate,
                type: row.event_type || 'Storm Event',
                severity: strength,
                insurancePotential: isSevere,
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
                ? `Found **${events.length}** documented storm events within **10 miles** of this property in the last 12 months.`
                : `No historical storm events recorded within 10 miles of this location in the last 12 months.`,
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
