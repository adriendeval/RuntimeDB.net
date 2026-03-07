const formatRuntime = (minutes) => {
  if (!Number.isInteger(minutes) || minutes <= 0) return 'Unknown';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const padded = mins.toString().padStart(2, '0');
  return `${hours} h ${padded} (${minutes} min)`;
};

const formatDiff = (runtime, baseRuntime) => {
  if (!Number.isInteger(runtime) || !Number.isInteger(baseRuntime)) return '';
  const diff = runtime - baseRuntime;
  if (diff === 0) return '';
  const sign = diff > 0 ? '+' : '';
  return `(${sign}${diff} min)`;
};

const posterUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `https://image.tmdb.org/t/p/w500${path}`;
};

const params = new URLSearchParams(window.location.search);
const movieId = params.get('id');

const runtimesList = document.getElementById('runtimes-list');
const movieRuntimeEl = document.getElementById('movie-runtime');
const refreshButton = document.getElementById('refresh-versions');
const form = document.getElementById('add-version-form');
const formError = document.getElementById('form-error');
const formMessage = document.getElementById('form-message');

let theatricalRuntime = null;
let cachedVersions = [];

const renderSearchResults = (results) => {
  const container = document.getElementById('search-results');
  container.innerHTML = '';
  if (!results.length) {
    container.innerHTML = '<p class="muted">No movies found. Try another title.</p>';
    return;
  }

  results.forEach((movie) => {
    const card = document.createElement('a');
    card.className = 'movie-card';
    card.href = `movie.html?id=${movie.id}`;

    const img = document.createElement('img');
    img.src = posterUrl(movie.poster_path);
    img.alt = `${movie.title} poster`;
    card.appendChild(img);

    const content = document.createElement('div');
    content.className = 'content';

    const title = document.createElement('h3');
    title.textContent = movie.title;
    content.appendChild(title);

    const year = document.createElement('div');
    year.className = 'year';
    year.textContent = movie.release_date ? new Date(movie.release_date).getFullYear() : '—';
    content.appendChild(year);

    card.appendChild(content);
    container.appendChild(card);
  });
};

const handleSearch = () => {
  const formEl = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const errorEl = document.getElementById('search-error');

  if (!formEl || !input) return;

  formEl.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = input.value.trim();
    errorEl.textContent = '';

    if (!query) {
      errorEl.textContent = 'Enter a title to search.';
      return;
    }

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Search failed.');
      }
      const data = await response.json();
      renderSearchResults(data.results || []);
    } catch (_error) {
      errorEl.textContent = 'Unable to search movies right now.';
    }
  });
};

const renderRuntimeItem = (runtime, label, difference, meta) => {
  const li = document.createElement('li');
  li.className = 'runtime-item';

  const info = document.createElement('div');
  info.innerHTML = `<strong>${formatRuntime(runtime)}</strong> — ${label}`;
  li.appendChild(info);

  const metaEl = document.createElement('div');
  metaEl.className = 'runtime-meta';
  const metaParts = [];
  if (difference) metaParts.push(difference);
  if (meta) metaParts.push(meta);
  metaEl.textContent = metaParts.join(' • ');
  li.appendChild(metaEl);

  return li;
};

const renderRuntimes = (baseRuntime, versions = []) => {
  if (!runtimesList) return;
  runtimesList.innerHTML = '';

  if (Number.isInteger(baseRuntime)) {
    const theatricalItem = renderRuntimeItem(baseRuntime, 'Theatrical runtime', '', '');
    runtimesList.appendChild(theatricalItem);
  }

  if (!versions.length) {
    const empty = document.createElement('li');
    empty.className = 'muted';
    empty.textContent = 'No alternate runtimes added yet.';
    runtimesList.appendChild(empty);
    return;
  }

  versions
    .slice()
    .sort((a, b) => a.runtime_minutes - b.runtime_minutes)
    .forEach((version) => {
      const diffText = formatDiff(version.runtime_minutes, baseRuntime);
      const metaBits = [];
      if (version.release_year) metaBits.push(version.release_year);
      if (version.notes) metaBits.push(version.notes);
      const meta = metaBits.join(' • ');
      const item = renderRuntimeItem(version.runtime_minutes, version.version_name, diffText, meta);
      runtimesList.appendChild(item);
    });
};

const loadMovieDetails = async () => {
  if (!movieId) return;
  const titleEl = document.getElementById('movie-title');
  const overviewEl = document.getElementById('movie-overview');
  const releaseEl = document.getElementById('movie-release');
  const posterEl = document.getElementById('movie-poster');
  const errorEl = document.getElementById('movie-error');

  try {
    const response = await fetch(`/api/movie/${movieId}`);
    if (!response.ok) {
      throw new Error('Failed to load movie.');
    }
    const movie = await response.json();

    titleEl.textContent = movie.title;
    overviewEl.textContent = movie.overview || 'No overview available.';
    releaseEl.textContent = movie.release_date || 'Unknown';
    theatricalRuntime = movie.runtime;
    movieRuntimeEl.textContent = formatRuntime(movie.runtime);
    posterEl.src = posterUrl(movie.poster_path);
    posterEl.alt = `${movie.title} poster`;
  } catch (error) {
    errorEl.textContent = error.message || 'Could not load movie details.';
  }
};

const loadVersions = async () => {
  if (!movieId || !runtimesList) return;
  try {
    const response = await fetch(`/api/movie/${movieId}/versions`);
    if (!response.ok) throw new Error('Failed to load runtimes.');
    const payload = await response.json();
    cachedVersions = payload.versions || [];
    renderRuntimes(theatricalRuntime, cachedVersions);
  } catch (error) {
    runtimesList.innerHTML = `<li class="error">${error.message}</li>`;
  }
};

const validateRuntime = (value) => {
  const minutes = Number.parseInt(value, 10);
  if (Number.isNaN(minutes)) return 'Runtime is required.';
  if (minutes < 30 || minutes > 600) return 'Runtime must be between 30 and 600 minutes.';
  if (Number.isInteger(theatricalRuntime) && minutes === theatricalRuntime) {
    return 'Runtime must be different from theatrical runtime.';
  }
  const exists = cachedVersions.some((version) => version.runtime_minutes === minutes);
  if (exists) return 'A version with that runtime already exists.';
  return null;
};

const handleAddVersion = () => {
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    formError.textContent = '';
    formMessage.textContent = '';
    formMessage.classList.remove('success');

    const formData = new FormData(form);
    const versionName = formData.get('version_name').toString().trim();
    const runtimeValue = formData.get('runtime_minutes');
    const releaseYear = formData.get('release_year');
    const notes = formData.get('notes');

    if (!versionName) {
      formError.textContent = 'Version name is required.';
      return;
    }

    const runtimeError = validateRuntime(runtimeValue);
    if (runtimeError) {
      formError.textContent = runtimeError;
      return;
    }

    const payload = {
      version_name: versionName,
      runtime_minutes: Number.parseInt(runtimeValue, 10),
      release_year: releaseYear ? Number.parseInt(releaseYear, 10) : undefined,
      notes: notes ? notes.toString().trim() : '',
    };

    try {
      const response = await fetch(`/api/movie/${movieId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save version.');
      }

      form.reset();
      formMessage.textContent = 'Version saved successfully.';
      formMessage.classList.add('success');
      await loadVersions();
    } catch (error) {
      formError.textContent = error.message;
    }
  });
};

const initMoviePage = async () => {
  if (!movieId) return;
  await loadMovieDetails();
  await loadVersions();
  if (refreshButton) {
    refreshButton.addEventListener('click', loadVersions);
  }
  handleAddVersion();
};

document.addEventListener('DOMContentLoaded', () => {
  handleSearch();
  initMoviePage();
});
