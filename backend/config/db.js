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
