const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Initialize DB
        const initSqlPath = path.join(__dirname, 'db', 'init.sql');
        if (fs.existsSync(initSqlPath)) {
            const initSql = fs.readFileSync(initSqlPath, 'utf8');
            db.exec(initSql, (err) => {
                if (err) {
                    console.error('Error initializing database schema:', err.message);
                } else {
                    console.log('Database schema initialized.');
                }
            });
        }
    }
});

// Expose db to routes
app.locals.db = db;

// TMDB Proxy Endpoints
app.get('/api/tmdb/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ error: 'Missing query parameter' });

        const apiKey = process.env.TMDB_API_KEY;
        const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${apiKey}&language=en-US`;

        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('TMDB Search Error:', error);
        res.status(500).json({ error: 'Failed to fetch from TMDB' });
    }
});

app.get('/api/tmdb/movie/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const apiKey = process.env.TMDB_API_KEY;
        const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`;

        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('TMDB Movie Error:', error);
        res.status(500).json({ error: 'Failed to fetch movie details from TMDB' });
    }
});

// Routes
const versionsRouter = require('./routes/versions');
app.use('/api', versionsRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
