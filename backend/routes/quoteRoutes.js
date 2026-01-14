const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { syncToHubSpot } = require('../services/hubspotService');
const { syncAllBucketData } = require('../services/storageService');
const { sendThankYouEmail } = require('../services/emailService');
const { sendThankYouSMS } = require('../services/quoService');

// --- LEADS ---
router.get('/leads', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM property LIMIT 100');
        res.json(result.rows);
    } catch (err) { res.json([]); }
});

// --- APPOINTMENTS ---
router.get('/appointments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM appointments ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json([]); }
});

router.post('/appointments', async (req, res) => {
    const { id, user_name, user_email, user_phone, date, time, type, status, notes } = req.body;
    try {
        await pool.query(
            `INSERT INTO appointments (id, user_name, user_email, user_phone, date, time, type, status, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [id, user_name, user_email, user_phone, date, time, type, status, notes]
        );
        res.json({ message: 'Appointment scheduled', id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save appointment' });
    }
});

// --- QUOTES ---
router.post('/quotes', async (req, res) => {
    const { id, address, roofAreaSqFt, material, estimatedCost } = req.body;
    try {
        await pool.query(
            `INSERT INTO quotes (id, address, area_sqft, material, cost)
            VALUES ($1, $2, $3, $4, $5)`,
            [id, address, roofAreaSqFt, material?.name, estimatedCost]
        );
        res.json({ message: 'Quote saved', id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save quote' });
    }
});

// HubSpot Bridge for Scheduler & Insurance Analysis
router.post('/quotes-sync', async (req, res) => {
    try {
        const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const ipAddress = (typeof rawIp === 'string') ? rawIp.split(',')[0].trim() : rawIp;
        const referer = req.headers['referer'];
        const { firstName, lastName, email, phone, address, date, time, notes, leadSource, estimatedCost, policyDocumentUrl, aiAnalysis, hutk, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = req.body;

        if (!phone) {
            return res.status(400).json({ error: "Phone number is required" });
        }

        let dbPromise = Promise.resolve();
        if (req.body.pageName === 'Scheduler') {
            console.log(`[Persistence] Logging scheduler lead for: ${email} | Interaction: ${date} @ ${time}`);
            dbPromise = pool.query(`
                INSERT INTO signups (first_name, last_name, email, phone, address, preferred_date, time_window, project_notes, lead_source)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (email) DO UPDATE 
                SET first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    phone = EXCLUDED.phone,
                    address = EXCLUDED.address,
                    preferred_date = EXCLUDED.preferred_date,
                    time_window = EXCLUDED.time_window,
                    project_notes = EXCLUDED.project_notes,
                    lead_source = EXCLUDED.lead_source;
            `, [firstName, lastName, email, phone, address, date, time, notes, leadSource || 'Website Scheduler']);
        }

        const hubspotPromise = syncToHubSpot({
            ...req.body,
            ipAddress,
            referer,
            pageName: req.body.pageName || 'Quote'
        });

        const [dbRes, hubspotOk] = await Promise.allSettled([dbPromise, hubspotPromise]);

        res.json({
            success: (hubspotOk.status === 'fulfilled' && hubspotOk.value === true),
            dbPersisted: dbRes.status === 'fulfilled'
        });

        // 3. Send Thank You Email on SUCCESS
        if (hubspotOk.status === 'fulfilled' && hubspotOk.value === true) {
            sendThankYouEmail({
                email,
                firstName,
                leadSource,
                estimatedCost
            }).catch(e => console.error('[Quotes Sync Email Error]', e));

            // 4. Send Thank You SMS
            sendThankYouSMS({
                phone,
                firstName,
                leadSource: leadSource || req.body.pageName,
                estimatedCost
            }).catch(e => console.error('[Quotes Sync SMS Error]', e));
        }
    } catch (err) {
        console.error("Quotes Sync Error:", err);
        res.status(500).json({ error: "Failed to sync quote" });
    }
});

// --- MARKET DATA ---
router.get('/market-data', async (req, res) => {
    const { type, city, zip, address, limit = 500 } = req.query;
    let query = 'SELECT * FROM market_leads WHERE 1=1';
    let params = [];
    let pIdx = 1;

    if (address) {
        query += ` AND address ILIKE $${pIdx++}`;
        params.push(`%${address}%`);
    } else {
        if (type && type !== 'All') {
            query += ` AND lead_type = $${pIdx++}`;
            params.push(type);
        }
        if (city) {
            query += ` AND city ILIKE $${pIdx++}`;
            params.push(`%${city}%`);
        }
        if (zip) {
            query += ` AND zip_code = $${pIdx++}`;
            params.push(zip);
        }
    }

    query += ` ORDER BY created_at DESC LIMIT $${pIdx}`;
    params.push(limit);

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch market data" });
    }
});

// Admin Bucket Sync
router.post('/admin/sync-bucket', async (req, res) => {
    syncAllBucketData(); // Start async
    res.json({ message: "Full bucket sync started. This may take a few minutes." });
});

module.exports = router;
