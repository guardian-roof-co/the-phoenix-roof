const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { syncToHubSpot } = require('../services/hubspotService');
const { sendThankYouEmail } = require('../services/emailService');
const { sendThankYouSMS } = require('../services/quoService');

router.post('/signups', async (req, res) => {
    const { firstName, lastName, email, phone, zip, leadSource, pageUri, hutk, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = req.body;
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipAddress = (typeof rawIp === 'string') ? rawIp.split(',')[0].trim() : rawIp;

    if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
    }

    try {
        console.log(`[Persistence] Logging signup for: ${email} | Source: ${leadSource || 'Website'}`);

        // 1. Internal DB Sync
        const dbPromise = pool.query(`
            INSERT INTO signups (first_name, last_name, email, phone, zip_code, lead_source)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (email) DO UPDATE 
            SET first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                phone = EXCLUDED.phone,
                zip_code = EXCLUDED.zip_code,
                lead_source = EXCLUDED.lead_source;
        `, [firstName, lastName, email, phone, zip, leadSource]);

        // 2. HubSpot CRM Sync (Server-Side)
        const hubspotPromise = syncToHubSpot({
            firstName, lastName, email, phone, zip, leadSource,
            ipAddress,
            pageUri,
            pageName: 'Signup',
            hutk,
            utmSource,
            utmMedium,
            utmCampaign,
            utmTerm,
            utmContent
        });

        const [dbRes, hubspotOk] = await Promise.allSettled([dbPromise, hubspotPromise]);

        console.log(`[Signup Sync] DB Persistence: ${dbRes.status === 'fulfilled' ? 'OK' : 'FAILED (' + dbRes.reason.message + ')'}`);
        console.log(`[Signup Sync] HubSpot CRM: ${hubspotOk.status === 'fulfilled' && hubspotOk.value ? 'OK' : 'FAILED'}`);

        const success = (dbRes.status === 'fulfilled') || (hubspotOk.status === 'fulfilled' && hubspotOk.value === true);

        if (success) {
            // 3. Send Thank You Email (Fire and forget, don't block response)
            sendThankYouEmail({
                email,
                firstName,
                leadSource
            }).catch(e => console.error('[Signup Email Error]', e));

            // 4. Send Thank You SMS
            sendThankYouSMS({
                phone,
                firstName,
                leadSource
            }).catch(e => console.error('[Signup SMS Error]', e));

            res.json({ success: true, message: 'Signup processed successfully' });
        } else {
            throw new Error("Integrated sync failed");
        }
    } catch (err) {
        console.error("Signup Processing Error:", err);
        res.status(500).json({ error: "Failed to process signup" });
    }
});

module.exports = router;
