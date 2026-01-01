const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const { initDB } = require('./backend/config/db');

// Import Routes
const signupRoutes = require('./backend/routes/signupRoutes');
const quoteRoutes = require('./backend/routes/quoteRoutes');
const webhookRoutes = require('./backend/routes/webhookRoutes');
const solarRoutes = require('./backend/routes/solarRoutes');
const weatherRoutes = require('./backend/routes/weatherRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Register API Routes
app.use('/api', signupRoutes);
app.use('/api', quoteRoutes);
app.use('/api', webhookRoutes);
app.use('/api', solarRoutes);
app.use('/api', weatherRoutes);

// Catch-all route to serve the frontend (for SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Phoenix Roof API running on http://127.0.0.1:${PORT}`);
    console.log(`- DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`- DB_PORT: ${process.env.DB_PORT || '5432'}`);
    console.log(`- DB_USER: ${process.env.DB_USER || 'postgres'}`);

    // Initialize database tables on startup
    initDB().catch(err => console.error('[Startup] DB Init Failed:', err));
});
