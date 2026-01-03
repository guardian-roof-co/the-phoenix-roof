const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'guardian-prod',
    password: process.env.DB_PASSWORD || 'postgres123',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000
});

const initDB = async () => {
    try {
        await pool.query(`
            -- Unified Table for All Market Data (BZ, FA, INF)
            CREATE TABLE IF NOT EXISTS market_leads (
                id SERIAL PRIMARY KEY,
                lead_type VARCHAR(20),
                source_file VARCHAR(255),
                name VARCHAR(255),
                address VARCHAR(255),
                city VARCHAR(100),
                state VARCHAR(50),
                zip_code VARCHAR(20),
                phone VARCHAR(50),
                raw_data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

            -- Detailed Table for NOAA Storm Events
            CREATE TABLE IF NOT EXISTS storm_events (
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
            CREATE INDEX IF NOT EXISTS idx_storm_coords ON storm_events(begin_lat, begin_lon);
        `);
        console.log("Database tables verified.");
    } catch (err) {
        console.error("Error creating tables:", err);
    }
};

module.exports = {
    pool,
    initDB
};
