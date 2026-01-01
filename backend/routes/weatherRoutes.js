const express = require('express');
const router = express.Router();
const { getStormHistory: getRealStormHistory } = require('../services/weatherService');

/**
 * Ported Simulation Logic (Fallback)
 */
const getSimulatedStormHistory = (lat, lng) => {
    const events = [];
    const today = new Date();

    for (let i = 0; i < 24; i++) {
        const checkDate = new Date(today.getFullYear(), today.getMonth() - i, 15);
        const month = checkDate.getMonth();
        const isStormSeason = month >= 4 && month <= 8;

        const locFactor = (Math.sin(lat * i) + Math.cos(lng * i)) * 0.5 + 0.5;
        let threshold = isStormSeason ? 0.7 : 0.9;

        if (locFactor > threshold) {
            const isHail = Math.random() > 0.5;
            const severity = isHail
                ? (Math.random() > 0.7 ? "1.5+ inch Hail" : "0.75 inch Hail")
                : (Math.random() > 0.7 ? "65+ mph Gusts" : "45 mph Gusts");

            const daysAgo = (today.getTime() - checkDate.getTime()) / (1000 * 3600 * 24);
            const isHighSeverity = severity.includes("1.5") || severity.includes("65");
            const insurancePotential = daysAgo <= 365 && isHighSeverity;

            events.push({
                date: checkDate.toISOString().split('T')[0],
                type: isHail ? 'Hail' : 'Wind',
                severity: severity,
                insurancePotential: insurancePotential
            });
        }
    }

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const recentMajorEvents = events.filter(e => e.insurancePotential).length;
    let riskLevel = 'Low';
    let summary = "No significant storm activity detected recently.";

    if (recentMajorEvents >= 1) {
        riskLevel = 'High';
        summary = "CRITICAL: Major storm activity detected within the insurance filing window. Inspection recommended.";
    } else if (events.length > 2) {
        riskLevel = 'Medium';
        summary = "Moderate weather activity detected. Roof may have cumulative wear.";
    }

    return {
        riskLevel,
        events,
        lastStormDate: events.length > 0 ? events[0].date : null,
        summary,
        isSimulated: true
    };
};

/**
 * GET /api/storm-history?lat=...&lng=...
 */
router.get('/storm-history', async (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Lat/Lng required' });
    }

    try {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        // 1. Try real API
        let data = await getRealStormHistory(latNum, lngNum);

        // 2. Fallback to simulation if real data is missing or API key is not set
        if (!data) {
            console.log('[Weather Route] Using simulated fallback for:', lat, lng);
            data = getSimulatedStormHistory(latNum, lngNum);
        }

        res.json(data);
    } catch (error) {
        console.error('[Weather Route] Error:', error);
        res.status(500).json({ error: 'Weather processing failed' });
    }
});

module.exports = router;
