const express = require('express');

module.exports = ({ db, fetchFromTmdb, sanitizeText }) => {
  const router = express.Router();

  router.get('/:tmdbId/versions', (req, res) => {
    const tmdbId = Number.parseInt(req.params.tmdbId, 10);
    if (Number.isNaN(tmdbId)) {
      return res.status(400).json({ error: 'Invalid TMDB id.' });
    }

    db.all(
      'SELECT id, tmdb_id, version_name, runtime_minutes, release_year, notes, created_at FROM versions WHERE tmdb_id = ? ORDER BY runtime_minutes ASC',
      [tmdbId],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to load versions.' });
        }
        return res.json({ versions: rows || [] });
      },
    );
  });

  router.post('/:tmdbId/versions', async (req, res) => {
    const tmdbId = Number.parseInt(req.params.tmdbId, 10);
    if (Number.isNaN(tmdbId)) {
      return res.status(400).json({ error: 'Invalid TMDB id.' });
    }

    const versionName = sanitizeText(req.body.version_name || '', 120);
    const runtimeMinutes = Number.parseInt(req.body.runtime_minutes, 10);
    const releaseYearInput = req.body.release_year ? Number.parseInt(req.body.release_year, 10) : null;
    const notes = sanitizeText(req.body.notes || '', 1000);

    if (!versionName) {
      return res.status(400).json({ error: 'Version name is required.' });
    }

    if (Number.isNaN(runtimeMinutes)) {
      return res.status(400).json({ error: 'Runtime (minutes) is required.' });
    }

    if (runtimeMinutes < 30 || runtimeMinutes > 600) {
      return res.status(400).json({ error: 'Runtime must be between 30 and 600 minutes.' });
    }

    if (releaseYearInput && (releaseYearInput < 1888 || releaseYearInput > 2100)) {
      return res.status(400).json({ error: 'Release year is invalid.' });
    }

    let theatricalRuntime;
    try {
      const movie = await fetchFromTmdb(`/movie/${tmdbId}`);
      theatricalRuntime = movie.runtime;
    } catch (_error) {
      return res.status(502).json({ error: 'Unable to verify theatrical runtime with TMDB.' });
    }

    if (!Number.isInteger(theatricalRuntime)) {
      return res.status(400).json({ error: 'Theatrical runtime unavailable for validation.' });
    }

    if (runtimeMinutes === theatricalRuntime) {
      return res.status(400).json({ error: 'Runtime must differ from the official theatrical runtime.' });
    }

    db.all('SELECT runtime_minutes FROM versions WHERE tmdb_id = ?', [tmdbId], (selectErr, rows) => {
      if (selectErr) {
        return res.status(500).json({ error: 'Failed to validate existing versions.' });
      }

      const runtimes = new Set((rows || []).map((row) => row.runtime_minutes));
      if (runtimes.has(runtimeMinutes)) {
        return res.status(400).json({ error: 'A version with the same runtime already exists.' });
      }

      const params = [tmdbId, versionName, runtimeMinutes, releaseYearInput || null, notes || null];

      db.run(
        'INSERT INTO versions (tmdb_id, version_name, runtime_minutes, release_year, notes) VALUES (?, ?, ?, ?, ?)',
        params,
        function insertCallback(err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
              return res.status(409).json({ error: 'A version with the same runtime already exists.' });
            }
            return res.status(500).json({ error: 'Failed to save version.' });
          }

          return res.status(201).json({
            id: this.lastID,
            tmdb_id: tmdbId,
            version_name: versionName,
            runtime_minutes: runtimeMinutes,
            release_year: releaseYearInput || null,
            notes: notes || null,
          });
        },
      );
    });
  });

  return router;
};
