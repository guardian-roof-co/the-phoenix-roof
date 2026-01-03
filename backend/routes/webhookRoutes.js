const express = require('express');
const router = express.Router();
const {
    findOrCreateContactByPhone,
    logCommunication,
    logCall
} = require('../services/hubspotService');

const crypto = require('crypto');

/**
 * Quo Webhook Handler
 * 
 * Logic:
 * 1. Verify HMAC-SHA256 signature (OpenPhone security)
 * 2. Receive event from Quo (Call completed or Message received)
 * 3. Find/Create contact in HubSpot by phone
 * 4. Log the specific activity (Missed Call or SMS Body)
 */
router.post('/quo-webhook', async (req, res) => {
    const signature = req.headers['openphone-signature'];
    const secret = process.env.QUO_WEBHOOK_SECRET;

    // 1. Signature Verification
    if (secret) {
        if (!signature) {
            console.warn('[Quo Webhook] Missing openphone-signature header');
            return res.status(401).json({ error: 'Missing signature' });
        }

        const parts = signature.split(';');
        if (parts.length < 4) return res.status(401).json({ error: 'Malformed signature' });

        const timestamp = parts[2];
        const receivedHash = parts[3];
        const rawBody = req.rawBody || Buffer.alloc(0);

        // OpenPhone/Quo secrets are often base64 encoded strings
        const secretBuf = (secret.length === 44 || secret.length === 88) ? Buffer.from(secret, 'base64') : Buffer.from(secret);

        // Construct payload: timestamp + "." + body
        const hmac = crypto.createHmac('sha256', secretBuf);
        const payload = Buffer.concat([Buffer.from(timestamp + '.'), rawBody]);
        const calculatedHash = hmac.update(payload).digest('base64');

        if (receivedHash !== calculatedHash) {
            console.warn('[Quo Webhook] Invalid signature detected');
            return res.status(401).json({ error: 'Invalid signature' });
        }
    }

    const event = req.body;
    const eventType = event.type;

    console.log(`[Quo Webhook] Received event: ${eventType}`);

    try {
        let phone = '';
        let contactId = null;

        const dataNode = event.data?.object || event.data;

        // 1. Extract Phone & Contact Processing
        if (eventType === 'call.completed' || eventType === 'message.received') {
            phone = dataNode.from;
        } else {
            return res.json({ message: 'Unhandled event type' });
        }

        if (!phone) {
            console.warn('[Quo Webhook] No phone number found in payload');
            return res.status(400).json({ error: 'No phone number' });
        }

        contactId = await findOrCreateContactByPhone(phone);
        if (!contactId) {
            throw new Error('Could not resolve HubSpot contact');
        }

        // 2. Log Activity based on type
        if (eventType === 'call.completed') {
            const isMissed = dataNode.status === 'no-answer' || dataNode.status === 'busy' || !dataNode.answeredAt;
            // Use voicemail duration if available, otherwise 0
            const duration = dataNode.voicemail?.duration || 0;

            if (isMissed) {
                console.log(`[Quo Webhook] Logging MISSED CALL for ${phone}`);
                await logCall(contactId, `Missed call from Quo. Status: ${dataNode.status || 'Missed'}`, 'No answer');
            } else {
                console.log(`[Quo Webhook] Logging Answered Call for ${phone}`);
                await logCall(contactId, `Answered call via Quo.`, 'Connected');
            }
        } else if (eventType === 'message.received') {
            const body = dataNode.body || '[No content]';
            console.log(`[Quo Webhook] Logging SMS from ${phone}: ${body}`);
            await logCommunication(contactId, `Incoming SMS from Quo: ${body}`);
        }

        res.json({ success: true, contactId });
    } catch (err) {
        console.error('[Quo Webhook Error]', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
