const express = require('express');
const router = express.Router();
const { analyzeInsurancePolicy, analyzeRoofCondition, chatWithAssistant } = require('../services/aiService');

/**
 * POST /api/analyze-policy
 * Body: { fileBase64, mimeType }
 */
router.post('/analyze-policy', async (req, res) => {
    const { fileBase64, mimeType } = req.body;

    if (!fileBase64 || !mimeType) {
        return res.status(400).json({ error: 'Missing file data or mimeType' });
    }

    try {
        const result = await analyzeInsurancePolicy(fileBase64, mimeType);
        res.json({ analysis: result });
    } catch (error) {
        console.error('[AI Route] Error:', error);
        res.status(500).json({ error: 'AI Analysis failed' });
    }
});

/**
 * POST /api/analyze-roof
 * Body: { streetViewBase64, userImages }
 */
router.post('/analyze-roof', async (req, res) => {
    const { streetViewBase64, userImages } = req.body;

    if (!userImages || !Array.isArray(userImages)) {
        return res.status(400).json({ error: 'Missing or invalid userImages' });
    }

    try {
        const result = await analyzeRoofCondition(streetViewBase64, userImages);
        res.json({ analysis: result });
    } catch (error) {
        console.error('[AI Route Roof] Error:', error);
        res.status(500).json({ error: 'Roof analysis failed' });
    }
});

/**
 * POST /api/chat
 * Body: { message }
 */
router.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Missing message' });
    }

    try {
        const result = await chatWithAssistant(message);
        res.json({ text: result });
    } catch (error) {
        console.error('[AI Route Chat] Error:', error);
        res.status(500).json({ error: 'Chat failed' });
    }
});

module.exports = router;
