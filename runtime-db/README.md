# RuntimeDB

RuntimeDB is a movie runtime database. It retrieves movie data from the TMDB API and allows users to store alternate runtime versions (like Director's Cuts or Extended Editions) in its own SQLite database.

## Prerequisites

- Node.js installed
- A TMDB API Key

## Setup

1. Create a `.env` file in the root of the project:
   ```env
   TMDB_API_KEY=your_actual_tmdb_api_key_here
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node server.js
   ```

4. Access the application:
   The server should run on [http://localhost:3000](http://localhost:3000).

## Features

- Search for movies dynamically via the TMDB API.
- View movie details including poster, overview, and official runtime.
- View alternate runtimes added by users, displayed in a clean `X h YY (ZZZ min)` format.
- Add new alternate versions securely.
- Fully responsive UI with Dark and Light mode support using Tailwind CSS.
