const { Storage } = require('@google-cloud/storage');
const csv = require('fast-csv');
const path = require('path');
const pool = require('../config/db');

const fs = require('fs');
const keyPath = path.join(__dirname, '../../gcs-key.json');

// Initialize Storage: Use local key if exists, otherwise fall back to Application Default Credentials (ADC)
const storageOptions = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'guardian-478113'
};

if (fs.existsSync(keyPath)) {
    console.log('[Storage] Initializing with local key file.');
    storageOptions.keyFilename = keyPath;
} else {
    console.log('[Storage] Local key not found. Using Application Default Credentials.');
}

const storage = new Storage(storageOptions);

// Add initialization check to debug identity
async function debugIdentity() {
    try {
        const [serviceAccount] = await storage.getServiceAccount();
        if (serviceAccount && serviceAccount.email) {
            console.log(`[Storage] Active Service Account: ${serviceAccount.email}`);
        } else {
            console.log('[Storage] Service Account email not found via SDK. Checking Metadata Server...');
            // In Cloud Run, we can fetch the email from the metadata server
            const response = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email', {
                headers: { 'Metadata-Flavor': 'Google' }
            });
            if (response.ok) {
                const email = await response.text();
                console.log(`[Storage] Metadata Server Identity: ${email}`);
            } else {
                console.warn('[Storage] Could not reach Metadata Server.');
            }
        }
    } catch (err) {
        console.warn('[Storage] Identity Check Error:', err.message);
    }
}

debugIdentity();

const BUCKET_NAME = 'west-michigan-roof';

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
                        const name = row['Company'] || row['Name'] || row['Owner'] || row['BusinessName'] || 'Unknown';
                        const address = row['Address'] || row['Street'] || row['PropertyAddress'];
                        const zip = cleanZip(row['Zip'] || row['ZipCode'] || row['PostalCode']);

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
                            const currentBatch = batch;
                            batch = [];
                            insertBatch(client, currentBatch);
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

const uploadFile = async (base64Data, filename, mimeType) => {
    try {
        const bucket = storage.bucket(BUCKET_NAME);
        const file = bucket.file(`policies/${filename}`);
        const buffer = Buffer.from(base64Data, 'base64');

        await file.save(buffer, {
            metadata: { contentType: mimeType },
            resumable: false
        });

        // For sensitive insurance policies, we use Signed URLs that expire
        // NOTE: This requires a Service Account identity (client_email).
        // If running locally without gcs-key.json, this will fail.
        let signedUrl;
        try {
            [signedUrl] = await file.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            });
        } catch (signErr) {
            console.error('[Storage] Signed URL generation failed.');
            if (signErr.message.includes('client_email')) {
                console.warn('[Storage] CRITICAL: Signed URLs require a Service Account key file (gcs-key.json) with a "client_email" property.');
                console.warn('[Storage] If you are running locally, please ensure gcs-key.json exists in the project root.');
            }
            throw signErr;
        }

        console.log(`[Storage] File uploaded to GCS. Signed URL generated.`);
        return signedUrl;
    } catch (error) {
        console.error('[Storage] Upload Error:', error);
        throw error;
    }
};

module.exports = {
    syncAllBucketData,
    uploadFile
};
