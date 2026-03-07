CREATE TABLE IF NOT EXISTS versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id INTEGER NOT NULL,
    version_name TEXT NOT NULL,
    runtime_minutes INTEGER NOT NULL,
    release_year INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tmdb_id, runtime_minutes)
);
