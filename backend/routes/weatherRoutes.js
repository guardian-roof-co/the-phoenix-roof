const express = require('express');
const router = express.Router();
const { getStormHistory: getRealStormHistory } = require('../services/weatherService');

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

        // 2. Return empty report if no real data is found (no more simulation)
        if (!data) {
            return res.json({
                riskLevel: 'Low',
                events: [],
                lastStormDate: null,
                summary: "No historical storm events (Severe Thunderstorm/Hail) recorded by NWS for this location in the current alert window.",
                isSimulated: false
            });
        }

        res.json(data);
    } catch (error) {
        console.error('[Weather Route] Error:', error);
        res.status(500).json({ error: 'Weather processing failed' });
    }
});

module.exports = router;
