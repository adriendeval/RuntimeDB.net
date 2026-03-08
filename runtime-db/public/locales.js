const translations = {
  en: {
    // NAVBAR
    appTitle: "RuntimeDB",
    themeLabelToggle: "Toggle Dark Mode",

    // INDEX PAGE - HERO
    heroTitle: "Find Alternate Runtimes",
    heroSubtitle: "Discover and add extended editions, director's cuts, and other alternate versions of your favorite movies.",

    // INDEX PAGE - SEARCH
    searchPlaceholder: "Search for a movie...",
    noResultsIcon: "Search",
    noResultsText: "No movies found. Try a different search.",
    searchErrorText: "An error occurred while searching.",

    // MOVIE PAGE - HEADER
    backButton: "Back to Search",

    // MOVIE PAGE - DETAILS
    dateLabel: "Release Date",
    officialRuntimeLabel: "Theatrical",
    movieOverviewPlaceholder: "No overview available.",

    // MOVIE PAGE - RUNTIME SECTION
    runtimeSectionTitle: "Available Runtimes",

    // MOVIE PAGE - FORM
    addVersionTitle: "Add a New Version",
    formVersionNameLabel: "Version Name",
    formVersionNamePlaceholder: "e.g. Director's Cut",
    formRuntimeLabel: "Runtime (minutes)",
    formRuntimePlaceholder: "e.g. 150",
    formYearLabel: "Release Year (Optional)",
    formYearPlaceholder: "e.g. 2004",
    formNotesLabel: "Notes (Optional)",
    formNotesPlaceholder: "Any additional information...",
    formRequired: "*",
    formSubmitButton: "Save Version",
    formErrorDefault: "An error occurred.",
    formSuccessDefault: "Version saved successfully!",

    // FOOTER
    footerText: "© 2024 RuntimeDB. Data provided by TMDB."
  },

  fr: {
    // NAVBAR
    appTitle: "RuntimeDB",
    themeLabelToggle: "Basculer le mode sombre",

    // INDEX PAGE - HERO
    heroTitle: "Trouver les Durées Alternatives",
    heroSubtitle: "Découvrez et ajoutez des éditions étendues, versions du réalisateur et autres variantes de vos films préférés.",

    // INDEX PAGE - SEARCH
    searchPlaceholder: "Chercher un film...",
    noResultsIcon: "Search",
    noResultsText: "Aucun film trouvé. Essayez une autre recherche.",
    searchErrorText: "Une erreur s'est produite lors de la recherche.",

    // MOVIE PAGE - HEADER
    backButton: "Retour à la recherche",

    // MOVIE PAGE - DETAILS
    dateLabel: "Date de sortie",
    officialRuntimeLabel: "Version théâtrale",
    movieOverviewPlaceholder: "Aucun résumé disponible.",

    // MOVIE PAGE - RUNTIME SECTION
    runtimeSectionTitle: "Durées Disponibles",

    // MOVIE PAGE - FORM
    addVersionTitle: "Ajouter une Nouvelle Version",
    formVersionNameLabel: "Nom de la version",
    formVersionNamePlaceholder: "ex. Director's Cut",
    formRuntimeLabel: "Durée (minutes)",
    formRuntimePlaceholder: "ex. 150",
    formYearLabel: "Année de sortie (Optionnel)",
    formYearPlaceholder: "ex. 2004",
    formNotesLabel: "Notes (Optionnelles)",
    formNotesPlaceholder: "Toute information supplémentaire...",
    formRequired: "*",
    formSubmitButton: "Enregistrer la version",
    formErrorDefault: "Une erreur s'est produite.",
    formSuccessDefault: "Version enregistrée avec succès !",

    // FOOTER
    footerText: "© 2024 RuntimeDB. Données fournies par TMDB."
  }
};

// Fonction globale pour récupérer une traduction
function t(key) {
  const lang = localStorage.getItem("language") || "en";
  return translations[lang]?.[key] || translations["en"][key] || `[${key}]`;
}
