const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const fetch = require('node-fetch');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initSqlPath = path.join(__dirname, 'db', 'init.sql');
const initSql = fs.readFileSync(initSqlPath, 'utf8');
db.serialize(() => {
  db.run(initSql);
});

const sanitizeText = (value, maxLength = 255) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().slice(0, maxLength);
};

const fetchFromTmdb = async (endpoint, params = {}) => {
  if (!TMDB_API_KEY) {
    const error = new Error('TMDB API key not configured.');
    error.statusCode = 500;
    throw error;
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`TMDB request failed with status ${response.status}`);
    error.statusCode = response.status;
    error.details = body;
    throw error;
  }

  return response.json();
};

const resolveLanguage = (langParam) => {
  if (langParam && langParam !== 'fr' && langParam !== 'en') {
    return { error: 'Invalid language parameter.', language: null };
  }
  return { error: null, language: langParam === 'fr' ? 'fr-FR' : 'en-US' };
};

app.get('/api/search', async (req, res) => {
  const query = sanitizeText(req.query.query || '', 100);
  const langParam = sanitizeText(req.query.lang || '', 5);
  const { error, language } = resolveLanguage(langParam);
  if (error) {
    return res.status(400).json({ error });
  }
  if (!query) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  try {
    const data = await fetchFromTmdb('/search/movie', { query, language });
    const results = (data.results || []).map((movie) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
    }));
    res.json({ results });
  } catch (error) {
    const status = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
    res.status(status).json({ error: 'Failed to fetch movies from TMDB.' });
  }
});

app.get('/api/movie/:tmdbId', async (req, res) => {
  const tmdbId = Number.parseInt(req.params.tmdbId, 10);
  const langParam = sanitizeText(req.query.lang || '', 5);
  const { error, language } = resolveLanguage(langParam);
  if (error) {
    return res.status(400).json({ error });
  }
  if (Number.isNaN(tmdbId)) {
    return res.status(400).json({ error: 'Invalid TMDB id.' });
  }

  try {
    const movie = await fetchFromTmdb(`/movie/${tmdbId}`, { language });
    res.json({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      runtime: movie.runtime,
    });
  } catch (error) {
    const status = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
    res.status(status).json({ error: 'Failed to fetch movie details from TMDB.' });
  }
});

const versionRoutes = require('./routes/versions')({
  db,
  fetchFromTmdb,
  sanitizeText,
});

app.use('/api/movie', versionRoutes);

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/movie.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'movie.html'));
});

app.use((err, _req, res, _next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Unexpected error occurred.' });
});

app.listen(PORT, () => {
  console.log(`RuntimeDB server running at http://localhost:${PORT}`);
});
