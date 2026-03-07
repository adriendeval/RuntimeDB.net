// --- Utility functions ---

// Format runtime to X h YY (ZZZ min)
function formatRuntime(minutes) {
    if (!minutes || isNaN(minutes)) return 'Unknown';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const mStr = m.toString().padStart(2, '0');
    return `${h} h ${mStr} (${minutes} min)`;
}

// Format difference e.g., (+30 min) or (-1 min)
function formatDifference(alternate, official) {
    if (!official || isNaN(official) || !alternate || isNaN(alternate)) return '';
    const diff = alternate - official;
    if (diff === 0) return '(0 min)';
    return diff > 0 ? `(+${diff} min)` : `(${diff} min)`;
}

// Escape HTML to prevent XSS
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Initialize Lucide icons
function initIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Toggle Dark/Light Mode
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // Check local storage or system preference
    if (localStorage.theme === 'light' || (!('theme' in localStorage) && !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }

    toggleBtn.addEventListener('click', () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
    });
}

// --- View Handlers ---

// Determine current page
const isIndexPage = document.getElementById('search-input') !== null;
const isMoviePage = document.getElementById('movie-details') !== null;

// ==========================================
// INDEX PAGE LOGIC
// ==========================================
if (isIndexPage) {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');
    const loadingEl = document.getElementById('loading');
    const noResultsEl = document.getElementById('no-results');
    let searchTimeout;

    // Default placeholder poster if none available
    const fallbackPoster = 'https://via.placeholder.com/300x450?text=No+Poster';

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            noResultsEl.classList.add('hidden');
            return;
        }

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 500); // 500ms debounce
    });

    async function performSearch(query) {
        loadingEl.classList.remove('hidden');
        noResultsEl.classList.add('hidden');
        resultsContainer.innerHTML = '';

        try {
            const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();

            loadingEl.classList.add('hidden');

            if (!data.results || data.results.length === 0) {
                noResultsEl.classList.remove('hidden');
                return;
            }

            // Only show movies with valid IDs and some basic info
            const movies = data.results.filter(m => m.id && m.title);

            if (movies.length === 0) {
                 noResultsEl.classList.remove('hidden');
                 return;
            }

            movies.forEach(movie => {
                const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
                const posterUrl = movie.poster_path
                    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                    : fallbackPoster;

                const card = document.createElement('a');
                card.href = `/movie.html?id=${movie.id}`;
                card.className = "movie-card bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 block cursor-pointer";

                card.innerHTML = `
                    <div class="aspect-w-2 aspect-h-3 bg-gray-200 dark:bg-gray-700">
                        <img src="${posterUrl}" alt="${escapeHTML(movie.title)}" class="object-cover w-full h-full" loading="lazy">
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-lg truncate mb-1" title="${escapeHTML(movie.title)}">${escapeHTML(movie.title)}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <i data-lucide="calendar" class="w-4 h-4 mr-1"></i> ${year}
                        </p>
                    </div>
                `;
                resultsContainer.appendChild(card);
            });
            initIcons();
        } catch (error) {
            console.error('Search error:', error);
            loadingEl.classList.add('hidden');
            noResultsEl.innerHTML = '<p class="text-red-500">An error occurred while searching.</p>';
            noResultsEl.classList.remove('hidden');
        }
    }
}

// ==========================================
// MOVIE PAGE LOGIC
// ==========================================
if (isMoviePage) {
    const urlParams = new URLSearchParams(window.location.search);
    const tmdbId = urlParams.get('id');
    let officialRuntimeGlobal = 0;

    const els = {
        loading: document.getElementById('loading'),
        detailsSection: document.getElementById('movie-details'),
        runtimesSection: document.getElementById('runtimes-section'),
        poster: document.getElementById('movie-poster'),
        title: document.getElementById('movie-title'),
        date: document.getElementById('movie-date'),
        officialRuntime: document.getElementById('official-runtime'),
        overview: document.getElementById('movie-overview'),
        runtimesList: document.getElementById('runtimes-list'),
        form: document.getElementById('add-version-form'),
        errorMsg: document.getElementById('form-error'),
        successMsg: document.getElementById('form-success')
    };

    if (!tmdbId) {
        els.loading.innerHTML = '<p class="text-red-500 text-xl font-bold">Invalid Movie ID.</p>';
    } else {
        loadMovieData(tmdbId);
    }

    async function loadMovieData(id) {
        try {
            // Fetch TMDB data
            const tmdbRes = await fetch(`/api/tmdb/movie/${id}`);
            if (!tmdbRes.ok) throw new Error('Failed to fetch movie details from TMDB');
            const movie = await tmdbRes.json();

            // Store global official runtime for validation & calculation
            officialRuntimeGlobal = movie.runtime || 0;

            // Populate DOM
            const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
            els.poster.src = posterUrl;
            els.title.textContent = movie.title;

            // Fix issue where calendar icon was overwritten
            els.date.innerHTML = `<i data-lucide="calendar" class="inline w-4 h-4 mr-1"></i> ${movie.release_date || 'Unknown'}`;
            els.officialRuntime.innerHTML = `<i data-lucide="clock" class="inline w-4 h-4 mr-1"></i> ${formatRuntime(movie.runtime)} (Theatrical)`;
            els.overview.textContent = movie.overview || 'No overview available.';

            els.loading.classList.add('hidden');
            els.detailsSection.classList.remove('hidden');
            els.runtimesSection.classList.remove('hidden');
            initIcons();

            // Fetch stored versions
            await loadVersions(id);

        } catch (error) {
            console.error(error);
            els.loading.innerHTML = `<div class="bg-red-100 text-red-700 p-4 rounded-lg flex items-center"><i data-lucide="alert-triangle" class="mr-2"></i> Error loading movie data.</div>`;
            initIcons();
        }
    }

    async function loadVersions(id) {
        try {
            const res = await fetch(`/api/movie/${id}/versions`);
            const versions = await res.json();

            els.runtimesList.innerHTML = '';

            if (versions.length === 0) {
                els.runtimesList.innerHTML = '<li class="text-gray-500 italic p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">No alternate versions added yet. Be the first!</li>';
                return;
            }

            versions.forEach(v => {
                const diffStr = formatDifference(v.runtime_minutes, officialRuntimeGlobal);

                const li = document.createElement('li');
                li.className = "p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm hover:shadow transition";

                li.innerHTML = `
                    <div class="flex-grow">
                        <div class="flex items-baseline gap-2 mb-1">
                            <span class="font-bold text-lg text-indigo-700 dark:text-indigo-400">
                                ${formatRuntime(v.runtime_minutes)}
                            </span>
                            <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                ${diffStr}
                            </span>
                        </div>
                        <div class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                             <i data-lucide="film" class="w-4 h-4 text-gray-400"></i>
                             ${escapeHTML(v.version_name)}
                        </div>
                        ${v.notes ? `<p class="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2 rounded italic border-l-2 border-indigo-300">"${escapeHTML(v.notes)}"</p>` : ''}
                    </div>
                    <div class="mt-2 sm:mt-0 sm:ml-4 text-right">
                        ${v.release_year ? `<span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-1 px-2 rounded-full border border-gray-200 dark:border-gray-600">Year: ${v.release_year}</span>` : ''}
                    </div>
                `;
                els.runtimesList.appendChild(li);
            });
            initIcons();
        } catch (error) {
            console.error('Failed to load versions', error);
        }
    }

    // Handle Form Submission
    els.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        els.errorMsg.classList.add('hidden');
        els.successMsg.classList.add('hidden');

        const formData = new FormData(els.form);
        const data = Object.fromEntries(formData.entries());

        // Basic frontend validation matches backend constraints
        const runtime = parseInt(data.runtime_minutes, 10);
        if (runtime === officialRuntimeGlobal) {
            els.errorMsg.textContent = 'Runtime must be different from the official theatrical runtime.';
            els.errorMsg.classList.remove('hidden');
            return;
        }

        if (runtime < 30 || runtime > 600) {
            els.errorMsg.textContent = 'Runtime must be between 30 and 600 minutes.';
            els.errorMsg.classList.remove('hidden');
            return;
        }

        try {
            const btn = els.form.querySelector('button');
            const originalBtnContent = btn.innerHTML;
            btn.innerHTML = `<i data-lucide="loader-2" class="animate-spin w-4 h-4"></i> Saving...`;
            btn.disabled = true;
            initIcons();

            const res = await fetch(`/api/movie/${tmdbId}/versions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            btn.innerHTML = originalBtnContent;
            btn.disabled = false;
            initIcons();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to add version');
            }

            els.successMsg.textContent = 'Version added successfully!';
            els.successMsg.classList.remove('hidden');
            els.form.reset();

            // Reload versions list
            loadVersions(tmdbId);

            // Hide success message after 3 seconds
            setTimeout(() => { els.successMsg.classList.add('hidden'); }, 3000);

        } catch (error) {
            els.errorMsg.textContent = error.message;
            els.errorMsg.classList.remove('hidden');
        }
    });
}

// Initialization calls
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initIcons();
});
