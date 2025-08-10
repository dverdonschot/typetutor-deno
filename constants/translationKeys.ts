/**
 * Translation key constants for type safety and easy maintenance
 */

export const TRANSLATION_KEYS = {
  // Navigation
  NAV: {
    TYPING: "nav.typing",
    QUOTES: "nav.quotes",
    TRIGRAPHS: "nav.trigraphs",
    CODE: "nav.code",
    ALPHABET: "nav.alphabet",
    RANDOM: "nav.random",
    STATS: "nav.stats",
  },

  // Common UI elements
  COMMON: {
    LANGUAGE: "common.language",
    CATEGORY: "common.category",
    DIFFICULTY: "common.difficulty",
    LOADING: "common.loading",
    ERROR: "common.error",
    RETRY: "common.retry",
    PRACTICE_AGAIN: "common.practiceAgain",
    NEXT_QUOTE: "common.nextQuote",
    WPM: "common.wpm",
    ACCURACY: "common.accuracy",
    TIME: "common.time",
  },

  // Page descriptions
  PAGES: {
    HOME: "pages.home",
    QUOTES: "pages.quotes",
    RANDOM: "pages.random",
    CODE: "pages.code",
    TRIGRAPHS: "pages.trigraphs",
    ALPHABET: "pages.alphabet",
    CUSTOM: "pages.custom",
    SERVERSTATS: "pages.serverstats",
    USERSTATS: "pages.userstats",
  },

  // Typing metrics and summary
  METRICS: {
    TYPING_SUMMARY: "metrics.typingSummary",
    SPEED: "metrics.speed",
    MISTAKES: "metrics.mistakes",
    BACKSPACES: "metrics.backspaces",
    BACKSPACE_RATIO: "metrics.backspaceRatio",
    ACCURACY: "metrics.accuracy",
    TIME: "metrics.time",
    CPM: "metrics.cpm",
    WPM: "metrics.wpm",
    PERSONAL_BEST: "metrics.personalBest",
    WPM_TREND: "metrics.wpmTrend",
    ACCURACY_TREND: "metrics.accuracyTrend",
    WORDS_PER_MINUTE: "metrics.wordsPerMinute",
    ACCURACY_PERCENTAGE: "metrics.accuracyPercentage",
    BEST_WPM: "metrics.bestWpm",
    CHARACTER_ERRORS_THIS_GAME: "metrics.characterErrorsThisGame",
    RED_KEYS_EXPLANATION: "metrics.redKeysExplanation",
    CHARACTER_WITH_ERRORS: "metrics.characterWithErrors",
    CHARACTERS_WITH_ERRORS: "metrics.charactersWithErrors",
    TOTAL_ERRORS_ACROSS: "metrics.totalErrorsAcross",
  },

  // Actions and buttons
  ACTIONS: {
    NEXT_QUOTE: "actions.nextQuote",
    REPLAY: "actions.replay",
    NEXT_RANDOM: "actions.nextRandom",
    NEXT: "actions.next",
    PRACTICE_AGAIN: "actions.practiceAgain",
    TRY_AGAIN: "actions.tryAgain",
    RETRY: "actions.retry",
    SELECT_LANGUAGE: "actions.selectLanguage",
  },

  // Content types and categories
  CONTENT: {
    OTHER_CODE: "content.otherCode",
    TRIGRAPHS: "content.trigraphs",
    SELECT_LANGUAGE_PLACEHOLDER: "content.selectLanguagePlaceholder",
    SELECT_CATEGORY_PLACEHOLDER: "content.selectCategoryPlaceholder",
  },

  // Trigraph-specific content
  TRIGRAPHS: {
    SELECT_TRIGRAPH: "trigraphs.selectTrigraph",
    NUMBER_OF_WORDS: "trigraphs.numberOfWords",
    RANDOM_TRIGRAPH_ENABLED: "trigraphs.randomTrigraphEnabled",
    RANDOM_TRIGRAPH_DISABLED: "trigraphs.randomTrigraphDisabled",
    LOADING: "trigraphs.loading",
    PLEASE_SELECT_TRIGRAPH: "trigraphs.pleaseSelectTrigraph",
  },

  // Random mode specific
  RANDOM: {
    CHARACTER_LENGTH: "random.characterLength",
    CHARACTER_SET: "random.characterSet",
    REGENERATE: "random.regenerate",
  },

  // Error messages
  ERRORS: {
    UNKNOWN_ERROR: "errors.unknownError",
    FAILED_TO_FETCH: "errors.failedToFetch",
    FAILED_TO_FETCH_CATEGORIES: "errors.failedToFetchCategories",
    FAILED_TO_FETCH_METADATA: "errors.failedToFetchMetadata",
    ERROR_LOADING_LANGUAGES: "errors.errorLoadingLanguages",
    NO_CONTENT_FOUND: "errors.noContentFound",
  },

  // Quote-specific content
  QUOTES: {
    TITLE: "quotes.title",
    DESCRIPTION: "quotes.description",
    SELECT_COLLECTION: "quotes.selectCollection",
    COLLECTION: "quotes.collection",
    LOADING_QUOTES: "quotes.loadingQuotes",
    FETCHING_COLLECTION: "quotes.fetchingCollection",
    ERROR_LOADING: "quotes.errorLoading",
    TRY_AGAIN: "quotes.tryAgain",
    LOAD_RANDOM_COLLECTION: "quotes.loadRandomCollection",
    RANDOM_QUOTES: "quotes.randomQuotes",
    RANDOM_FROM_ALL_QUOTES: "quotes.randomFromAllQuotes",
    GET_RANDOM_QUOTES_ENTIRE_LANGUAGE: "quotes.getRandomQuotesEntireLanguage",
    RANDOMIZE_CATEGORY: "quotes.randomizeCategory",
  },

  // About section
  ABOUT: {
    TITLE: "about.title",
    DESCRIPTION: "about.description",
  },

  // User stats page
  USERSTATS: {
    TITLE: "userStats.title",
    DESCRIPTION: "userStats.description",
    BEST_WPM: "userStats.bestWPM",
    PERSONAL_BEST: "userStats.personalBest",
    AVERAGE_WPM: "userStats.averageWPM",
    OVERALL_AVERAGE: "userStats.overallAverage",
    AVERAGE_ACCURACY: "userStats.averageAccuracy",
    TOTAL_GAMES: "userStats.totalGames",
    GAMES_COMPLETED: "userStats.gamesCompleted",
    TOTAL_TIME: "userStats.totalTime",
    TIME_SPENT_TYPING: "userStats.timeSpentTyping",
    CHARACTERS_TYPED: "userStats.charactersTyped",
    TOTAL_CHARACTERS: "userStats.totalCharacters",
    CURRENT_STREAK: "userStats.currentStreak",
    GAMES_WITH_95_ACCURACY: "userStats.gamesWith95Accuracy",
    WPM_TREND: "userStats.wpmTrend",
    ACCURACY_TREND: "userStats.accuracyTrend",
    WORDS_PER_MINUTE: "userStats.wordsPerMinute",
    ACCURACY_PERCENTAGE: "userStats.accuracyPercentage",
    RANGE: "userStats.range",
    LATEST_DATA_POINTS: "userStats.latestDataPoints",
    RECENT_GAMES: "userStats.recentGames",
    SHOWING_LAST_GAMES: "userStats.showingLastGames",
    DATA_MANAGEMENT: "userStats.dataManagement",
    EXPORT_STATS: "userStats.exportStats",
    IMPORT_STATS: "userStats.importStats",
    CLEAR_ALL_STATS: "userStats.clearAllStats",
    EXPORT_DESCRIPTION: "userStats.exportDescription",
    TABLE_DATE: "userStats.tableDate",
    TABLE_MODE: "userStats.tableMode",
    TABLE_DURATION: "userStats.tableDuration",
    NO_GAMES_YET: "userStats.noGamesYet",
    FAILED_TO_LOAD: "userStats.failedToLoad",
    CLEAR_CONFIRMATION: "userStats.clearConfirmation",
    STATS_IMPORTED: "userStats.statsImported",
    STATS_CLEARED: "userStats.statsCleared",
    FAILED_TO_EXPORT: "userStats.failedToExport",
    FAILED_TO_IMPORT: "userStats.failedToImport",
    FAILED_TO_CLEAR: "userStats.failedToClear",
    KEYBOARD_HEATMAP_TITLE: "userStats.keyboardHeatmapTitle",
    KEYBOARD_HEATMAP_DESCRIPTION: "userStats.keyboardHeatmapDescription",
  },

  // Server stats page
  SERVERSTATS: {
    TITLE: "serverStats.title",
    GAMES_COMPLETED: "serverStats.gamesCompleted",
    CATEGORIES: "serverStats.categories",
    DETAILS_SUFFIX: "serverStats.detailsSuffix",
    TOTAL_COMPLETED: "serverStats.totalCompleted",
    GAMES: "serverStats.games",
    LOADING: "serverStats.loading",
    ERROR_LOADING: "serverStats.errorLoading",
    NO_STATISTICS: "serverStats.noStatistics",
    COMPLETE_GAMES_TO_SEE: "serverStats.completeGamesToSee",
  },
} as const;

// Type for all possible translation keys
export type TranslationKey =
  typeof TRANSLATION_KEYS[keyof typeof TRANSLATION_KEYS][
    keyof typeof TRANSLATION_KEYS[keyof typeof TRANSLATION_KEYS]
  ];
