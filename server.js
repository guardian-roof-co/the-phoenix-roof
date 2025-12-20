
const express = require('express');
require('dotenv').config();
const { Pool } = require('pg');
const { Storage } = require('@google-cloud/storage');
const csv = require('fast-csv');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// 1. Database Config
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'guardian-prod',
    password: process.env.DB_PASSWORD || 'postgres123',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000
});

// Diagnostic check for DB connectivity
pool.on('error', (err) => {
    console.error('[Database Pool Error] Check your local Postgres credentials:', err.message);
});

// 2. Google Cloud Storage Config
const storage = new Storage({
    keyFilename: path.join(__dirname, 'gcs-key.json'),
    projectId: 'guardian-478113'
});

const BUCKET_NAME = 'west-michigan-roof';

// 3. HubSpot Config
const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID || process.env.VITE_HUBSPOT_PORTAL_ID;
const HUBSPOT_FORM_ID = process.env.HUBSPOT_FORM_ID || process.env.VITE_HUBSPOT_FORM_ID;

const syncToHubSpot = async (leadData) => {
    if (!HUBSPOT_PORTAL_ID || !HUBSPOT_FORM_ID) {
        console.warn('[HubSpot] Missing credentials, skipping CRM sync.');
        return false;
    }

    try {
        console.log(`[HubSpot] Syncing lead: ${leadData.email} | IP: ${leadData.ipAddress || 'unknown'} | URI: ${leadData.pageUri || 'FALLBACK'}`);
        const fields = [
            { name: 'email', value: leadData.email || 'pending@user.quote' },
            { name: 'firstname', value: leadData.firstName || '' },
            { name: 'lastname', value: leadData.lastName || '' },
            { name: 'mobilephone', value: leadData.phone || '' },
            { name: 'zip', value: leadData.zip || '' },
            { name: 'privacy_consent', value: leadData.privacyConsent ? 'true' : 'false' },
            { name: 'lead_source', value: leadData.leadSource || 'Website' },
        ];

        const payload = {
            submittedAt: Date.now(),
            fields,
            context: {
                pageUri: leadData.pageUri || 'https://thephoenixroof.com/form-submission',
                pageName: leadData.pageName || 'Website Interaction',
                ipAddress: leadData.ipAddress, // CRITICAL: Helps prevent spam flagging
                hutk: leadData.hutk // Optional cookie for session merging
            }
        };

        const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;

        // Add a timeout to prevent hanging the whole request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const err = await response.json();
            console.error('[HubSpot Error]', err);
        } else {
            console.log(`[HubSpot] Sync successful for: ${leadData.email}`);
        }
        return response.ok;
    } catch (error) {
        console.error('[HubSpot Critical Failure]', error);
        return false;
    }
};

// --- HELPER: Database Setup ---
const initDB = async () => {
    try {
        await pool.query(`
            -- Unified Table for All Market Data (BZ, FA, INF)
            CREATE TABLE IF NOT EXISTS market_leads (
                id SERIAL PRIMARY KEY,
                lead_type VARCHAR(20), -- 'Commercial' (BZ), 'Residential' (FA), 'Info' (INF)
                source_file VARCHAR(255),
                name VARCHAR(255),
                address VARCHAR(255),
                city VARCHAR(100),
                state VARCHAR(50),
                zip_code VARCHAR(20),
                phone VARCHAR(50),
                raw_data JSONB, -- Stores all original columns for reference
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                -- Prevent duplicates based on Address + Zip
                CONSTRAINT unique_property_market UNIQUE (address, zip_code)
            );

            -- Table for User Signups/Leads
            CREATE TABLE IF NOT EXISTS signups (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                email VARCHAR(255),
                phone VARCHAR(50),
                zip_code VARCHAR(10),
                privacy_consent BOOLEAN DEFAULT FALSE,
                lead_source VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_signup_email UNIQUE (email)
            );
        `);
        console.log("Database tables verified.");
    } catch (err) {
        console.error("Error creating tables:", err);
    }
};

// --- DATA CLEANING & SYNC ---
const cleanZip = (zip) => {
    if (!zip) return null;
    let clean = zip.toString().trim();
    if (clean.length > 5 && clean.includes('-')) clean = clean.split('-')[0];
    return clean.padStart(5, '0'); // Ensure 5 digits for MI
};

const determineType = (filename) => {
    if (filename.startsWith('BZ')) return 'Commercial';
    if (filename.startsWith('FA')) return 'Residential';
    return 'Info';
};

const syncAllBucketData = async () => {
    console.log("Starting Full Bucket Sync...");
    try {
        const bucket = storage.bucket(BUCKET_NAME);
        const [files] = await bucket.getFiles();

        const csvFiles = files.filter(f => f.name.toLowerCase().endsWith('.csv'));
        console.log(`Found ${csvFiles.length} CSV files to process.`);

        const client = await pool.connect();

        for (const file of csvFiles) {
            console.log(`Processing ${file.name}...`);
            const leadType = determineType(file.name);

            const stream = file.createReadStream();
            let batch = [];
            const BATCH_SIZE = 500;

            await new Promise((resolve, reject) => {
                stream
                    .pipe(csv.parse({ headers: true, trim: true }))
                    .on('data', (row) => {
                        // DATA CLEANUP / MAPPING
                        const name = row['Company'] || row['Name'] || row['Owner'] || row['BusinessName'] || 'Unknown';
                        const address = row['Address'] || row['Street'] || row['PropertyAddress'];
                        const zip = cleanZip(row['Zip'] || row['ZipCode'] || row['PostalCode']);

                        // Only insert valid records
                        if (address && zip) {
                            batch.push({
                                lead_type: leadType,
                                source_file: file.name,
                                name: name,
                                address: address,
                                city: row['City'] || 'Unknown',
                                state: row['State'] || 'MI',
                                zip_code: zip,
                                phone: row['Phone'] || row['Tel'] || null,
                                raw_data: row
                            });
                        }

                        if (batch.length >= BATCH_SIZE) {
                            insertBatch(client, batch).then(() => { batch = []; });
                        }
                    })
                    .on('end', async () => {
                        if (batch.length > 0) await insertBatch(client, batch);
                        console.log(`Finished ${file.name}`);
                        resolve();
                    })
                    .on('error', reject);
            });
        }
        client.release();
        console.log("Full Sync Complete.");

    } catch (err) {
        console.error("Sync Error:", err);
    }
};

const insertBatch = async (client, rows) => {
    try {
        await client.query('BEGIN');
        for (const row of rows) {
            await client.query(`
                INSERT INTO market_leads (lead_type, source_file, name, address, city, state, zip_code, phone, raw_data)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (address, zip_code) DO UPDATE 
                SET name = EXCLUDED.name,
                    phone = EXCLUDED.phone,
                    lead_type = EXCLUDED.lead_type,
                    raw_data = EXCLUDED.raw_data;
            `, [row.lead_type, row.source_file, row.name, row.address, row.city, row.state, row.zip_code, row.phone, JSON.stringify(row.raw_data)]);
        }
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Batch Insert Error:", e);
    }
};

// --- API ENDPOINTS ---

app.get('/api/leads', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM property LIMIT 100');
        res.json(result.rows);
    } catch (err) { res.json([]); }
});

app.get('/api/appointments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM appointments ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json([]); }
});

app.post('/api/appointments', async (req, res) => {
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

app.post('/api/quotes', async (req, res) => {
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

// User Signups API
app.post('/api/signups', async (req, res) => {
    const { firstName, lastName, email, phone, zip, privacyConsent, leadSource, pageUri } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        console.log(`[Persistence] Logging signup for: ${email}`);

        // 1. Internal DB Sync
        const dbPromise = pool.query(`
            INSERT INTO signups (first_name, last_name, email, phone, zip_code, privacy_consent, lead_source)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (email) DO UPDATE 
            SET first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                phone = EXCLUDED.phone,
                zip_code = EXCLUDED.zip_code,
                privacy_consent = EXCLUDED.privacy_consent,
                lead_source = EXCLUDED.lead_source;
        `, [firstName, lastName, email, phone, zip, privacyConsent, leadSource]);

        // 2. HubSpot CRM Sync (Server-Side)
        const hubspotPromise = syncToHubSpot({
            firstName, lastName, email, phone, zip, privacyConsent, leadSource,
            ipAddress,
            pageUri,
            pageName: 'Signup'
        });

        const [dbRes, hubspotOk] = await Promise.allSettled([dbPromise, hubspotPromise]);

        console.log(`[Signup Sync] DB Persistence: ${dbRes.status === 'fulfilled' ? 'OK' : 'FAILED (' + dbRes.reason.message + ')'}`);
        console.log(`[Signup Sync] HubSpot CRM: ${hubspotOk.status === 'fulfilled' && hubspotOk.value ? 'OK' : 'FAILED'}`);

        // Success if EITHER worked (this allows local testing without a DB)
        const success = (dbRes.status === 'fulfilled') || (hubspotOk.status === 'fulfilled' && hubspotOk.value === true);

        if (success) {
            res.json({ success: true, message: 'Signup processed successfully' });
        } else {
            throw new Error("Integrated sync failed");
        }
    } catch (err) {
        console.error("Signup Processing Error:", err);
        res.status(500).json({ error: "Failed to process signup" });
    }
});

// HubSpot Bridge for Instant Quotes
app.post('/api/quotes-sync', async (req, res) => {
    try {
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const success = await syncToHubSpot({
            ...req.body,
            ipAddress,
            pageName: req.body.pageName || 'Quote'
        });
        res.json({ success });
    } catch (err) {
        console.error("Quotes Sync Error:", err);
        res.status(500).json({ error: "Failed to sync quote" });
    }
});

// Unified Market Data API with Address Search
app.get('/api/market-data', async (req, res) => {
    const { type, city, zip, address, limit = 500 } = req.query;

    let query = 'SELECT * FROM market_leads WHERE 1=1';
    let params = [];
    let pIdx = 1;

    if (address) {
        // Fuzzy search for address (e.g. "123 Main" matches "123 Main St")
        query += ` AND address ILIKE $${pIdx++}`;
        params.push(`%${address}%`);
    } else {
        // Standard filters
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
        console.error("API Error:", err);
        res.status(500).json({ error: "Failed to fetch market data" });
    }
});

app.post('/api/admin/sync-bucket', async (req, res) => {
    syncAllBucketData(); // Start async
    res.json({ message: "Full bucket sync started. This may take a few minutes." });
});

// Catch-all route to serve the frontend (for SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Phoenix Roof API running on http://127.0.0.1:${PORT}`);
    console.log(`- DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`- DB_PORT: ${process.env.DB_PORT || '5432'}`);
    console.log(`- DB_USER: ${process.env.DB_USER || 'postgres'}`);
    initDB().then(() => {
        // Uncomment to force sync on start
        // syncAllBucketData(); 
    });
});
