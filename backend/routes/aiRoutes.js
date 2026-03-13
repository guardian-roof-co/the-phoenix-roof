const express = require('express');
const router = express.Router();
const { analyzeInsurancePolicy, analyzeRoofCondition, chatWithAssistantStream } = require('../services/aiService');
const { uploadFile } = require('../services/storageService');

/**
 * POST /api/analyze-policy
 * Body: { fileBase64, mimeType }
 */
router.post('/analyze-policy', async (req, res) => {
    const { fileBase64, mimeType, email } = req.body;

    if (!fileBase64 || !mimeType) {
        return res.status(400).json({ error: 'Missing file data or mimeType' });
    }

    if (mimeType !== 'application/pdf') {
        return res.status(400).json({ error: 'Invalid file type. Only PDF documents are allowed for policy analysis.' });
    }

    try {
        // 1. Upload to GCS
        const timestamp = Date.now();
        const safeEmail = (email || 'anonymous').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const ext = mimeType.includes('pdf') ? 'pdf' : 'jpg';
        const filename = `${safeEmail}_${timestamp}.${ext}`;

        let fileUrl = null;
        try {
            fileUrl = await uploadFile(fileBase64, filename, mimeType);
        } catch (uploadErr) {
            console.error('[AI Route] GCS Upload failed, but continuing with AI analysis:', uploadErr);
        }

        // 2. Analyze with AI
        const result = await analyzeInsurancePolicy(fileBase64, mimeType);

        res.json({
            analysis: result,
            fileUrl: fileUrl
        });
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
 * Body: { message, history }
 */
router.post('/chat', async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Missing message' });
    }

    try {
        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const streamingResp = await chatWithAssistantStream(message, history || []);

        for await (const chunk of streamingResp.stream) {
            const part = chunk.candidates[0].content.parts[0].text;
            if (part) {
                // Send SSE formatted data
                res.write(`data: ${JSON.stringify({ text: part })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('[AI Route Chat] Error:', error);
        // If headers are already sent, we can't send a JSON error
        if (!res.headersSent) {
            res.status(500).json({ error: 'Chat failed' });
        } else {
            res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
            res.end();
        }
    }
});

module.exports = router;
