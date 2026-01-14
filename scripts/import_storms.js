const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const { pool } = require('../backend/config/db');

async function importStorms(csvPath) {
    if (!csvPath) {
        console.error('Usage: node import_storms.js <path_to_csv>');
        process.exit(1);
    }

    const absolutePath = path.resolve(csvPath);
    if (!fs.existsSync(absolutePath)) {
        console.error(`File not found: ${absolutePath}`);
        process.exit(1);
    }

    console.log(`Starting import from: ${absolutePath}`);

    const client = await pool.connect();
    let count = 0;

    try {
        await client.query('DROP TABLE IF EXISTS storm_events CASCADE');

        console.log('Creating table storm_events (Unlogged for speed)...');
        await client.query(`
            CREATE UNLOGGED TABLE storm_events (
                id SERIAL PRIMARY KEY,
                episode_id INT,
                event_id INT,
                state TEXT,
                state_fips INT,
                year INT,
                month_name TEXT,
                event_type TEXT,
                cz_type TEXT,
                cz_fips INT,
                cz_name TEXT,
                wfo TEXT,
                begin_date_time TEXT,
                cz_timezone TEXT,
                end_date_time TEXT,
                injuries_direct INT,
                injuries_indirect INT,
                deaths_direct INT,
                deaths_indirect INT,
                damage_property TEXT,
                damage_crops TEXT,
                source TEXT,
                magnitude DECIMAL,
                magnitude_type TEXT,
                flood_cause TEXT,
                category TEXT,
                tor_f_scale TEXT,
                tor_length DECIMAL,
                tor_width DECIMAL,
                tor_other_wfo TEXT,
                tor_other_cz_state TEXT,
                tor_other_cz_fips INT,
                tor_other_cz_name TEXT,
                begin_range DECIMAL,
                begin_azimuth TEXT,
                begin_location TEXT,
                end_range DECIMAL,
                end_azimuth TEXT,
                end_location TEXT,
                begin_lat DECIMAL(9,6),
                begin_lon DECIMAL(9,6),
                end_lat DECIMAL(9,6),
                end_lon DECIMAL(9,6),
                episode_narrative TEXT,
                event_narrative TEXT,
                data_source TEXT,
                raw_data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query('BEGIN');

        const BATCH_SIZE = 500;
        let batch = [];

        const stream = fs.createReadStream(absolutePath);

        const flushBatch = async (rows) => {
            if (rows.length === 0) return;

            const numCols = 46;
            const placeholders = rows.map((_, i) =>
                `(${Array.from({ length: numCols }, (_, j) => `$${i * numCols + j + 1}`).join(', ')})`
            ).join(', ');

            const flatValues = rows.flat();

            await client.query(`
                INSERT INTO storm_events (
                    episode_id, event_id, state, state_fips, year, month_name, event_type, 
                    cz_type, cz_fips, cz_name, wfo, begin_date_time, cz_timezone, end_date_time, 
                    injuries_direct, injuries_indirect, deaths_direct, deaths_indirect, 
                    damage_property, damage_crops, source, magnitude, magnitude_type, 
                    flood_cause, category, tor_f_scale, tor_length, tor_width, 
                    tor_other_wfo, tor_other_cz_state, tor_other_cz_fips, tor_other_cz_name, 
                    begin_range, begin_azimuth, begin_location, end_range, end_azimuth, 
                    end_location, begin_lat, begin_lon, end_lat, end_lon, 
                    episode_narrative, event_narrative, data_source, raw_data
                ) VALUES ${placeholders}
            `, flatValues);
        };

        await new Promise((resolve, reject) => {
            const csvStream = csv.parse({ headers: true, trim: true })
                .on('data', async (row) => {
                    const rowValues = [
                        parseInt(row.EPISODE_ID) || null,
                        parseInt(row.EVENT_ID) || null,
                        row.STATE,
                        parseInt(row.STATE_FIPS) || null,
                        parseInt(row.YEAR) || null,
                        row.MONTH_NAME,
                        row.EVENT_TYPE,
                        row.CZ_TYPE,
                        parseInt(row.CZ_FIPS) || null,
                        row.CZ_NAME,
                        row.WFO,
                        row.BEGIN_DATE_TIME,
                        row.CZ_TIMEZONE,
                        row.END_DATE_TIME,
                        parseInt(row.INJURIES_DIRECT) || 0,
                        parseInt(row.INJURIES_INDIRECT) || 0,
                        parseInt(row.DEATHS_DIRECT) || 0,
                        parseInt(row.DEATHS_INDIRECT) || 0,
                        row.DAMAGE_PROPERTY,
                        row.DAMAGE_CROPS,
                        row.SOURCE,
                        parseFloat(row.MAGNITUDE) || null,
                        row.MAGNITUDE_TYPE,
                        row.FLOOD_CAUSE,
                        row.CATEGORY,
                        row.TOR_F_SCALE,
                        parseFloat(row.TOR_LENGTH) || null,
                        parseFloat(row.TOR_WIDTH) || null,
                        row.TOR_OTHER_WFO,
                        row.TOR_OTHER_CZ_STATE,
                        parseInt(row.TOR_OTHER_CZ_FIPS) || null,
                        row.TOR_OTHER_CZ_NAME,
                        parseFloat(row.BEGIN_RANGE) || null,
                        row.BEGIN_AZIMUTH,
                        row.BEGIN_LOCATION,
                        parseFloat(row.END_RANGE) || null,
                        row.END_AZIMUTH,
                        row.END_LOCATION,
                        parseFloat(row.BEGIN_LAT) || null,
                        parseFloat(row.BEGIN_LON) || null,
                        parseFloat(row.END_LAT) || null,
                        parseFloat(row.END_LON) || null,
                        row.EPISODE_NARRATIVE,
                        row.EVENT_NARRATIVE,
                        row.DATA_SOURCE,
                        JSON.stringify(row)
                    ];

                    batch.push(rowValues);
                    count++;

                    if (batch.length >= BATCH_SIZE) {
                        const currentBatch = [...batch];
                        batch = [];
                        csvStream.pause();
                        try {
                            await flushBatch(currentBatch);
                            process.stdout.write('#');
                        } catch (err) {
                            console.error(`\n[Batch Error at Row ${count - BATCH_SIZE + 1} to ${count}]`, err.message);
                            throw err; // Re-throw to trigger COMMIT rollback and script exit
                        } finally {
                            csvStream.resume();
                        }
                    }
                })
                .on('end', async () => {
                    try {
                        if (batch.length > 0) {
                            await flushBatch(batch);
                        }
                        console.log(`\nFinished parsing. Total processed: ${count}`);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                })
                .on('error', (err) => {
                    console.error('CSV Parser Error:', err.message);
                    reject(err);
                });

            stream.pipe(csvStream);
        });

        await client.query('COMMIT');

        console.log('Post-load optimization: Creating indexes...');
        await client.query('CREATE INDEX idx_storm_coords ON storm_events(begin_lat, begin_lon)');
        await client.query('ALTER TABLE storm_events SET LOGGED');

        console.log('Import successful.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Import failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

const targetFile = process.argv[2];
importStorms(targetFile);
