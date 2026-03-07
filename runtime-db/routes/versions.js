const express = require('express');
const router = express.Router();
const fetch = require('node-fetch'); // Ensure node-fetch is available if TMDB validation is needed

// Helper function to validate inputs securely
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
};

// GET /api/movie/:tmdb_id/versions - Returns all stored versions.
router.get('/movie/:tmdb_id/versions', (req, res) => {
    const tmdbId = parseInt(req.params.tmdb_id, 10);
    const db = req.app.locals.db;

    if (isNaN(tmdbId)) {
        return res.status(400).json({ error: 'Invalid TMDB ID' });
    }

    const query = `
        SELECT id, tmdb_id, version_name, runtime_minutes, release_year, notes, created_at
        FROM versions
        WHERE tmdb_id = ?
        ORDER BY runtime_minutes ASC
    `;

    db.all(query, [tmdbId], (err, rows) => {
        if (err) {
            console.error('Error fetching versions:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// POST /api/movie/:tmdb_id/versions - Adds a new version.
router.post('/movie/:tmdb_id/versions', async (req, res) => {
    const tmdbId = parseInt(req.params.tmdb_id, 10);
    const db = req.app.locals.db;

    let { version_name, runtime_minutes, release_year, notes } = req.body;

    // Validation
    if (isNaN(tmdbId)) return res.status(400).json({ error: 'Invalid TMDB ID' });
    if (!version_name || typeof version_name !== 'string') return res.status(400).json({ error: 'Version name is required' });

    runtime_minutes = parseInt(runtime_minutes, 10);
    if (isNaN(runtime_minutes) || runtime_minutes < 30 || runtime_minutes > 600) {
        return res.status(400).json({ error: 'Runtime must be between 30 and 600 minutes' });
    }

    release_year = release_year ? parseInt(release_year, 10) : null;
    version_name = sanitizeInput(version_name);
    notes = sanitizeInput(notes);

    try {
        // Fetch official runtime from TMDB to validate it's different
        const apiKey = process.env.TMDB_API_KEY;
        const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=en-US`;
        const tmdbRes = await fetch(url);

        if (!tmdbRes.ok) {
             return res.status(404).json({ error: 'Movie not found on TMDB' });
        }

        const tmdbData = await tmdbRes.json();
        const officialRuntime = tmdbData.runtime;

        if (runtime_minutes === officialRuntime) {
            return res.status(400).json({ error: 'Runtime must be different from the official theatrical runtime' });
        }

        // Insert into database
        const sql = `
            INSERT INTO versions (tmdb_id, version_name, runtime_minutes, release_year, notes)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.run(sql, [tmdbId, version_name, runtime_minutes, release_year, notes], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'A version with this runtime already exists for this movie' });
                }
                console.error('Error inserting version:', err.message);
                return res.status(500).json({ error: 'Failed to save version' });
            }

            res.status(201).json({
                id: this.lastID,
                tmdb_id: tmdbId,
                version_name,
                runtime_minutes,
                release_year,
                notes
            });
        });

    } catch (error) {
        console.error('Error verifying official runtime:', error);
        res.status(500).json({ error: 'Internal server error while verifying data' });
    }
});

module.exports = router;
