const { Storage } = require('@google-cloud/storage');
const csv = require('fast-csv');
const path = require('path');
const pool = require('../config/db');

const storage = new Storage({
    keyFilename: path.join(__dirname, '../../gcs-key.json'),
    projectId: 'guardian-478113'
});

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

module.exports = {
    syncAllBucketData
};
