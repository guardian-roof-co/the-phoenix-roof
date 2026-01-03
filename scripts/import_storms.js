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
        // Re-run initDB or just copy the SQL here. 
        // For simplicity and to ensure we use the updated schema from db.js, we call the pool's init logic if possible
        // or just execute the CREATE TABLE here. Let's execute it directly to be sure.
        await client.query(`
            CREATE TABLE storm_events (
                id SERIAL PRIMARY KEY,
                episode_id INT,
                event_id INT,
                state VARCHAR(100),
                state_fips INT,
                year INT,
                month_name VARCHAR(20),
                event_type VARCHAR(100),
                cz_type VARCHAR(10),
                cz_fips INT,
                cz_name VARCHAR(100),
                wfo VARCHAR(10),
                begin_date_time VARCHAR(100),
                cz_timezone VARCHAR(50),
                end_date_time VARCHAR(100),
                injuries_direct INT,
                injuries_indirect INT,
                deaths_direct INT,
                deaths_indirect INT,
                damage_property VARCHAR(50),
                damage_crops VARCHAR(50),
                source VARCHAR(100),
                magnitude DECIMAL,
                magnitude_type VARCHAR(20),
                flood_cause VARCHAR(100),
                category VARCHAR(100),
                tor_f_scale VARCHAR(10),
                tor_length DECIMAL,
                tor_width DECIMAL,
                tor_other_wfo VARCHAR(10),
                tor_other_cz_state VARCHAR(100),
                tor_other_cz_fips INT,
                tor_other_cz_name VARCHAR(100),
                begin_range DECIMAL,
                begin_azimuth VARCHAR(10),
                begin_location VARCHAR(255),
                end_range DECIMAL,
                end_azimuth VARCHAR(10),
                end_location VARCHAR(255),
                begin_lat DECIMAL(9,6),
                begin_lon DECIMAL(9,6),
                end_lat DECIMAL(9,6),
                end_lon DECIMAL(9,6),
                episode_narrative TEXT,
                event_narrative TEXT,
                data_source VARCHAR(100),
                raw_data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_storm_coords ON storm_events(begin_lat, begin_lon);
        `);

        await client.query('BEGIN');

        const stream = fs.createReadStream(absolutePath);

        await new Promise((resolve, reject) => {
            const csvStream = csv.parse({ headers: true, trim: true })
                .on('data', async (row) => {
                    csvStream.pause();
                    try {
                        if (count === 0) {
                            console.log('Sample Row Data Keys:', Object.keys(row));
                        }

                        const values = [
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
                            ) VALUES (
                                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 
                                $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, 
                                $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46
                            )
                        `, values);

                        count++;
                        if (count % 100 === 0) process.stdout.write('.');
                    } catch (err) {
                        console.error(`\n[Row ${count + 1}] Error:`, err.message);
                    } finally {
                        csvStream.resume();
                    }
                })
                .on('end', () => {
                    console.log(`\nFinished parsing. Total processed: ${count}`);
                    resolve();
                })
                .on('error', (err) => {
                    console.error('CSV Parser Error:', err.message);
                    reject(err);
                });

            stream.pipe(csvStream);
        });

        await client.query('COMMIT');
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
