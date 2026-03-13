
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Get all storm landing pages
router.get('/storm-pages', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM storm_landing_pages ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching storm pages:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Create a new storm landing page
router.post('/storm-pages', async (req, res) => {
    const { slug, city, date, hail_size, description, radar_image, video_embed, affected_areas, storm_photos } = req.body;
    
    try {
        const result = await pool.query(
            `INSERT INTO storm_landing_pages 
            (slug, city, date, hail_size, description, radar_image, video_embed, affected_areas, storm_photos) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [slug, city, date, hail_size, description, radar_image, video_embed, affected_areas || [], storm_photos || []]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // unique_violation
            return res.status(400).json({ error: 'A storm page with this slug already exists.' });
        }
        console.error('Error creating storm page:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
