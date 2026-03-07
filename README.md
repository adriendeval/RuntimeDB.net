# RuntimeDB.net

RuntimeDB is a minimal web application to explore official movie runtimes via TMDB and capture alternate cuts with different runtimes.

## Requirements

- Node.js 18+
- TMDB API key stored in `TMDB_API_KEY`

## Getting started

```bash
npm install
TMDB_API_KEY=your_api_key_here node server.js
```

The server starts at [http://localhost:3000](http://localhost:3000).

## Project structure

```
server.js           # Express server entrypoint
database.sqlite     # SQLite database file
db/init.sql         # Schema definition
routes/versions.js  # Version CRUD routes
public/             # Static frontend (HTML, CSS, JS)
```

## Features

- Search movies through TMDB
- View movie details with theatrical runtime
- List available runtimes (theatrical + stored versions)
- Add official alternate runtimes when they differ from the theatrical cut
- Input validation and duplicate runtime prevention
- Tailwind-powered modern UI
- English / French interface toggle with TMDB language-aware requests
