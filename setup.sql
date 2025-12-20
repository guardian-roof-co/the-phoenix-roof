-- SQL Setup for The Phoenix Roof (PostgreSQL)
-- This script creates the signups table for storing website leads.

-- 1. Create the signups table
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

-- 2. Optional: Indexing for faster searches
CREATE INDEX IF NOT EXISTS idx_signups_email ON signups(email);
CREATE INDEX IF NOT EXISTS idx_signups_created_at ON signups(created_at);

-- View the table structure:
-- \d signups
