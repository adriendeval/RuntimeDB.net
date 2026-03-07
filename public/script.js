const translations = {
  en: {
    tagline: 'Find movies and explore alternate runtimes.',
    navTagline: 'Official runtimes and alternate cuts',
    heroKicker: 'Movie runtime intelligence',
    heroTitle: 'Alternate runtimes, made easy.',
    heroDescription: 'Search TMDB, compare theatrical runtimes, and log official alternate cuts with clear differences.',
    searchTitle: 'Search movies',
    searchSubtitle: 'Find titles and open their runtime sheets.',
    searchPlaceholder: 'Search by title...',
    searchButton: 'Search',
    resultsTitle: 'Results',
    resultsHint: 'Click a movie to see its runtimes.',
    footer: 'Powered by TMDB • Alternate runtimes made simple',
    searchEmpty: 'No movies found. Try another title.',
    searchErrorRequired: 'Enter a title to search.',
    searchErrorGeneric: 'Unable to search movies right now.',
    availableTitle: 'Available runtimes',
    availableSubtitle: 'Includes theatrical runtime and all alternate versions.',
    refresh: 'Refresh',
    addVersionTitle: 'Add a new version',
    labelVersionName: 'Version name',
    labelRuntime: 'Runtime (minutes)',
    labelRelease: 'Release year (optional)',
    labelNotes: 'Notes (optional)',
    saveVersion: 'Save version',
    theatricalRuntimeLabel: 'Theatrical runtime',
    noRuntimes: 'No alternate runtimes added yet.',
    runtimeRequired: 'Runtime is required.',
    runtimeBounds: 'Runtime must be between 30 and 600 minutes.',
    runtimeSameAsTheatrical: 'Runtime must be different from theatrical runtime.',
    runtimeDuplicate: 'A version with that runtime already exists.',
    versionNameRequired: 'Version name is required.',
    versionSaved: 'Version saved successfully.',
    movieReleaseLabel: 'Release date:',
    movieRuntimeLabel: 'Official runtime:',
    movieOverviewFallback: 'No overview available.',
    movieReleaseUnknown: 'Unknown',
    movieLoadError: 'Could not load movie details.',
    runtimeLoadError: 'Failed to load runtimes.',
    langToggle: 'Français',
  },
  fr: {
    tagline: 'Recherchez des films et explorez les montages alternatifs.',
    navTagline: 'Durées officielles et versions alternatives',
    heroKicker: 'Intelligence sur les durées',
    heroTitle: 'Les durées alternatives, simplifiées.',
    heroDescription:
      'Recherchez sur TMDB, comparez les durées cinéma et consignez les versions officielles avec leurs différences.',
    searchTitle: 'Rechercher des films',
    searchSubtitle: 'Trouvez des titres et ouvrez leur fiche durées.',
    searchPlaceholder: 'Rechercher par titre...',
    searchButton: 'Rechercher',
    resultsTitle: 'Résultats',
    resultsHint: 'Cliquez sur un film pour voir ses durées.',
    footer: 'Propulsé par TMDB • Les durées, en toute simplicité',
    searchEmpty: 'Aucun film trouvé. Essayez un autre titre.',
    searchErrorRequired: 'Saisissez un titre pour rechercher.',
    searchErrorGeneric: 'Recherche impossible pour le moment.',
    availableTitle: 'Durées disponibles',
    availableSubtitle: 'Inclut la durée cinéma et toutes les versions alternatives.',
    refresh: 'Rafraîchir',
    addVersionTitle: 'Ajouter une nouvelle version',
    labelVersionName: 'Nom de la version',
    labelRuntime: 'Durée (minutes)',
    labelRelease: 'Année de sortie (optionnel)',
    labelNotes: 'Notes (optionnel)',
    saveVersion: 'Enregistrer la version',
    theatricalRuntimeLabel: 'Durée cinéma',
    noRuntimes: 'Aucune durée alternative ajoutée pour le moment.',
    runtimeRequired: 'La durée est obligatoire.',
    runtimeBounds: 'La durée doit être comprise entre 30 et 600 minutes.',
    runtimeSameAsTheatrical: 'La durée doit être différente de la durée cinéma.',
    runtimeDuplicate: 'Une version avec cette durée existe déjà.',
    versionNameRequired: 'Le nom de la version est obligatoire.',
    versionSaved: 'Version enregistrée avec succès.',
    movieReleaseLabel: 'Date de sortie :',
    movieRuntimeLabel: 'Durée officielle :',
    movieOverviewFallback: 'Aucun synopsis disponible.',
    movieReleaseUnknown: 'Inconnue',
    movieLoadError: 'Impossible de charger les détails du film.',
    runtimeLoadError: 'Impossible de charger les durées.',
    langToggle: 'English',
  },
};

let currentLang = localStorage.getItem('runtimeLang') === 'fr' ? 'fr' : 'en';

const t = (key) => translations[currentLang][key] || key;

const setLang = (lang) => {
  currentLang = lang === 'fr' ? 'fr' : 'en';
  localStorage.setItem('runtimeLang', currentLang);
  document.documentElement.lang = currentLang === 'fr' ? 'fr' : 'en';
  applyTranslations();
  if (movieId) {
    loadMovieDetails();
    loadVersions();
  }
};

const setText = (id, key) => {
  const el = document.getElementById(id);
  if (el) el.textContent = t(key);
};

const applyTranslations = () => {
  document.documentElement.lang = currentLang === 'fr' ? 'fr' : 'en';
  setText('tagline', 'tagline');
  setText('nav-tagline', 'navTagline');
  setText('hero-kicker', 'heroKicker');
  setText('hero-title', 'heroTitle');
  setText('hero-description', 'heroDescription');
  setText('search-title', 'searchTitle');
  setText('search-subtitle', 'searchSubtitle');
  setText('search-button', 'searchButton');
  setText('results-title', 'resultsTitle');
  setText('results-hint', 'resultsHint');
  setText('footer-text', 'footer');
  setText('available-title', 'availableTitle');
  setText('available-subtitle', 'availableSubtitle');
  setText('refresh-versions', 'refresh');
  setText('add-version-title', 'addVersionTitle');
  setText('label-version-name', 'labelVersionName');
  setText('label-runtime', 'labelRuntime');
  setText('label-release', 'labelRelease');
  setText('label-notes', 'labelNotes');
  setText('save-button', 'saveVersion');
  setText('movie-release-label', 'movieReleaseLabel');
  setText('movie-runtime-label', 'movieRuntimeLabel');

  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) langToggle.textContent = t('langToggle');

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.placeholder = t('searchPlaceholder');

  const heroTitleElement = document.getElementById('hero-title');
  if (heroTitleElement && heroTitleElement.tagName === 'SPAN') {
    heroTitleElement.textContent = t('heroTitle');
  }

  renderRuntimes(theatricalRuntime, cachedVersions);
};

const posterAlt = (title) => (currentLang === 'fr' ? `Affiche de ${title}` : `${title} poster`);

const formatRuntime = (minutes) => {
  if (!Number.isInteger(minutes) || minutes <= 0) return '—';
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
    const empty = document.createElement('p');
    empty.className = 'text-slate-400';
    empty.textContent = t('searchEmpty');
    container.appendChild(empty);
    return;
  }

  results.forEach((movie) => {
    const card = document.createElement('a');
    card.className =
      'group relative rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-400/60 transition shadow-lg overflow-hidden flex flex-col';
    card.href = `movie.html?id=${movie.id}`;

    const img = document.createElement('img');
    img.src = posterUrl(movie.poster_path);
    img.alt = posterAlt(movie.title);
    img.className = 'w-full h-72 object-cover bg-slate-900';
    card.appendChild(img);

    const content = document.createElement('div');
    content.className = 'p-4 flex flex-col gap-2';

    const title = document.createElement('h3');
    title.textContent = movie.title;
    title.className = 'font-semibold text-lg';
    content.appendChild(title);

    const metaRow = document.createElement('div');
    metaRow.className = 'text-sm text-slate-400 flex items-center gap-2';
    const yearText = movie.release_date ? new Date(movie.release_date).getFullYear() : '—';
    metaRow.textContent = yearText;
    content.appendChild(metaRow);

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
      errorEl.textContent = t('searchErrorRequired');
      return;
    }

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&lang=${currentLang}`);
      if (!response.ok) {
        throw new Error('Search failed.');
      }
      const data = await response.json();
      renderSearchResults(data.results || []);
    } catch (_error) {
      errorEl.textContent = t('searchErrorGeneric');
    }
  });
};

const renderRuntimeItem = (runtime, label, difference, meta) => {
  const li = document.createElement('li');
  li.className =
    'rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2';

  const info = document.createElement('div');
  info.innerHTML = `<strong class="text-white">${formatRuntime(runtime)}</strong> — <span class="text-slate-300">${label}</span>`;
  li.appendChild(info);

  const metaEl = document.createElement('div');
  metaEl.className = 'text-sm text-slate-400';
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
    const theatricalItem = renderRuntimeItem(baseRuntime, t('theatricalRuntimeLabel'), '', '');
    runtimesList.appendChild(theatricalItem);
  }

  if (!versions.length) {
    const empty = document.createElement('li');
    empty.className = 'text-slate-400';
    empty.textContent = t('noRuntimes');
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
    const response = await fetch(`/api/movie/${movieId}?lang=${currentLang}`);
    if (!response.ok) {
      throw new Error('Failed to load movie.');
    }
    const movie = await response.json();

    titleEl.textContent = movie.title;
    overviewEl.textContent = movie.overview || t('movieOverviewFallback');
    releaseEl.textContent = movie.release_date || t('movieReleaseUnknown');
    theatricalRuntime = movie.runtime;
    if (movieRuntimeEl) movieRuntimeEl.textContent = formatRuntime(movie.runtime);
    posterEl.src = posterUrl(movie.poster_path);
    posterEl.alt = posterAlt(movie.title);
    errorEl.textContent = '';
  } catch (_error) {
    errorEl.textContent = t('movieLoadError');
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
  } catch (_error) {
    runtimesList.innerHTML = `<li class="text-rose-300">${t('runtimeLoadError')}</li>`;
  }
};

const validateRuntime = (value) => {
  const minutes = Number.parseInt(value, 10);
  if (Number.isNaN(minutes)) return t('runtimeRequired');
  if (minutes < 30 || minutes > 600) return t('runtimeBounds');
  if (Number.isInteger(theatricalRuntime) && minutes === theatricalRuntime) {
    return t('runtimeSameAsTheatrical');
  }
  const exists = cachedVersions.some((version) => version.runtime_minutes === minutes);
  if (exists) return t('runtimeDuplicate');
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
    const versionName = (formData.get('version_name') || '').toString().trim();
    const runtimeValue = formData.get('runtime_minutes');
    const releaseYear = formData.get('release_year');
    const notes = formData.get('notes');

    if (!versionName) {
      formError.textContent = t('versionNameRequired');
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
      formMessage.textContent = t('versionSaved');
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

const initLangToggle = () => {
  const langToggle = document.getElementById('lang-toggle');
  if (!langToggle) return;
  langToggle.addEventListener('click', () => setLang(currentLang === 'en' ? 'fr' : 'en'));
};

document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  initLangToggle();
  handleSearch();
  initMoviePage();
});
