const express = require('express');
const router = express.Router();
const { getRoofData } = require('../services/solarService');

/**
 * GET /api/solar-roof?lat=...&lng=...
 * Returns roof area and solar potential
 */
router.get('/solar-roof', async (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    try {
        const data = await getRoofData(parseFloat(lat), parseFloat(lng));

        if (!data) {
            return res.status(404).json({ error: 'No roof data found for this location' });
        }

        res.json(data);
    } catch (error) {
        console.error('[Solar Route] Error:', error);
        res.status(500).json({ error: 'Failed to fetch roof data' });
    }
});

module.exports = router;
