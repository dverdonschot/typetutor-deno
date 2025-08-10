import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import CategorySelector from "../components/CategorySelector.tsx";
import QuoteFileSelector from "../components/QuoteFileSelector.tsx";
import QuoteTextDisplay from "../components/QuoteTextDisplay.tsx";
import { useQuoteInput } from "../hooks/useQuoteInput.ts";
import { useTypingMetrics } from "../hooks/useTypingMetrics.ts";
import GameScoreDisplayIsland from "./GameScoreDisplayIsland.tsx";
import { UserStatsManager } from "../utils/userStatsManager.ts";
import { DetailedGameResult } from "../types/userStats.ts";
import type { Quote, QuoteMetadata } from "../types/quotes.ts";
import { currentLanguageSignal } from "../contexts/LanguageContext.ts";
import { useReactiveTranslation } from "../utils/translations.ts";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

interface NewQuoteTyperModeProps {
  autoFocus?: boolean;
}

export default function NewQuoteTyperMode(
  { autoFocus = true }: NewQuoteTyperModeProps,
) {
  // Global language from signal - use .value directly in effects for reactivity
  const t = useReactiveTranslation();

  // Selection state (removed selectedLanguage - using global language)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFileMetadata, setSelectedFileMetadata] = useState<
    QuoteMetadata | null
  >(null);

  // New toggle states
  const [randomizeCategoryEnabled, setRandomizeCategoryEnabled] = useState<
    boolean
  >(false);
  const [randomQuotesEnabled, setRandomQuotesEnabled] = useState<boolean>(
    false,
  );
  const [gamesPlayedCount, setGamesPlayedCount] = useState<number>(0);

  // Content state
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0);
  const [targetText, setTargetText] = useState<string>("");

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<DetailedGameResult | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isStateLoaded, setIsStateLoaded] = useState<boolean>(false);

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const finishedSentRef = useRef(false);

  // Load persistent state from localStorage
  useEffect(() => {
    // One-time cleanup: Clear old localStorage that contained quote content
    const cleanupKey = "quote-cache-cleaned-v1";
    if (!localStorage.getItem(cleanupKey)) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('quote-state-')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem(cleanupKey, "true");
      console.log("Cleaned up old quote cache from localStorage");
    }

    const savedState = localStorage.getItem(
      `quote-state-${currentLanguageSignal.value.code}`,
    );
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.selectedCategory) {
          setSelectedCategory(parsed.selectedCategory);
        }
        if (parsed.selectedFileId) setSelectedFileId(parsed.selectedFileId);
        if (parsed.selectedFileMetadata) {
          setSelectedFileMetadata(parsed.selectedFileMetadata);
        }
        if (parsed.randomizeCategoryEnabled !== undefined) {
          setRandomizeCategoryEnabled(parsed.randomizeCategoryEnabled);
        }
        if (parsed.randomQuotesEnabled !== undefined) {
          setRandomQuotesEnabled(parsed.randomQuotesEnabled);
        }
        if (parsed.gamesPlayedCount !== undefined) {
          setGamesPlayedCount(parsed.gamesPlayedCount);
        }
        if (parsed.currentQuoteIndex !== undefined) {
          setCurrentQuoteIndex(parsed.currentQuoteIndex);
        }
        // Note: No longer restoring allQuotes or targetText from localStorage
        // These will be fetched fresh from the API
      } catch (e) {
        console.warn("Failed to parse saved quote state:", e);
      }
    }
    setIsStateLoaded(true);
  }, [currentLanguageSignal.value.code]);

  // Save state to localStorage when selections change
  useEffect(() => {
    const state = {
      selectedCategory,
      selectedFileId,
      selectedFileMetadata,
      randomizeCategoryEnabled,
      randomQuotesEnabled,
      gamesPlayedCount,
      currentQuoteIndex,
      // Note: NOT storing allQuotes or targetText - these should be fetched fresh
    };
    localStorage.setItem(
      `quote-state-${currentLanguageSignal.value.code}`,
      JSON.stringify(state),
    );
  }, [
    selectedCategory,
    selectedFileId,
    selectedFileMetadata,
    randomizeCategoryEnabled,
    randomQuotesEnabled,
    gamesPlayedCount,
    currentQuoteIndex,
    allQuotes,
    targetText,
    currentLanguageSignal.value.code,
  ]);

  // Reset selections when language changes (but after loading saved state)
  useEffect(() => {
    if (currentLanguageSignal.value.code) {
      // Only reset if we don't have saved state for this language
      const savedState = localStorage.getItem(
        `quote-state-${currentLanguageSignal.value.code}`,
      );
      if (!savedState) {
        setSelectedCategory(null);
        setSelectedFileId(null);
        setSelectedFileMetadata(null);
        setRandomizeCategoryEnabled(false);
        setRandomQuotesEnabled(false);
        setGamesPlayedCount(0);
        setCurrentQuoteIndex(0);
        setAllQuotes([]);
        setTargetText("");
      }
    }
  }, [currentLanguageSignal.value.code]);

  // Load quotes when file selection changes or randomization modes change
  useEffect(() => {
    async function loadQuotes() {
      if (!currentLanguageSignal.value.code) {
        setAllQuotes([]);
        setTargetText("");
        setCurrentQuoteIndex(0);
        return;
      }

      // Check if we have restored state that we should preserve
      const savedState = localStorage.getItem(
        `quote-state-${currentLanguageSignal.value.code}`,
      );
      // Note: We no longer store quotes in localStorage, so always load fresh quotes
      // The saved state only contains UI preferences

      try {
        setIsLoading(true);
        setError(null);

        let quotes: Quote[] = [];

        if (randomQuotesEnabled) {
          // Load all quotes from all categories for the language
          const categoriesResponse = await fetch(
            `/api/quotes/categories/${currentLanguageSignal.value.code}`,
          );
          if (!categoriesResponse.ok) {
            throw new Error("Failed to fetch categories");
          }

          const categories = await categoriesResponse.json();

          for (const category of categories) {
            const metadataResponse = await fetch(
              `/api/quotes/metadata/${currentLanguageSignal.value.code}/${category.directory}`,
            );
            if (!metadataResponse.ok) continue;

            const files: QuoteMetadata[] = await metadataResponse.json();

            for (const file of files) {
              const contentResponse = await fetch(
                `/api/quotes/content/${currentLanguageSignal.value.code}/${category.directory}/${file.id}`,
              );
              if (!contentResponse.ok) continue;

              const responseData = await contentResponse.json();
              const fileQuotes: Quote[] = responseData.quotes || responseData;
              
              
              quotes.push(...fileQuotes);
            }
          }

          // For random quotes mode, we only need one quote at a time
          const shuffledQuotes = [...quotes].sort(() => Math.random() - 0.5);
          setAllQuotes([shuffledQuotes[0]]); // Only set one quote
          setTargetText(shuffledQuotes[0]?.text || "");
        } else if (randomizeCategoryEnabled && selectedCategory) {
          // Load all quotes from the selected category
          const metadataResponse = await fetch(
            `/api/quotes/metadata/${currentLanguageSignal.value.code}/${selectedCategory}`,
          );
          if (!metadataResponse.ok) throw new Error("Failed to fetch metadata");

          const files: QuoteMetadata[] = await metadataResponse.json();

          for (const file of files) {
            const contentResponse = await fetch(
              `/api/quotes/content/${currentLanguageSignal.value.code}/${selectedCategory}/${file.id}`,
            );
            if (!contentResponse.ok) continue;

            const responseData = await contentResponse.json();
            const fileQuotes: Quote[] = responseData.quotes || responseData;
            quotes.push(...fileQuotes);
          }

          // For category randomization, we only need one quote at a time
          const shuffledQuotes = [...quotes].sort(() => Math.random() - 0.5);
          setAllQuotes([shuffledQuotes[0]]); // Only set one quote
          setTargetText(shuffledQuotes[0]?.text || "");
        } else if (selectedCategory && selectedFileId) {
          // Normal mode: load quotes from selected file
          const response = await fetch(
            `/api/quotes/content/${currentLanguageSignal.value.code}/${selectedCategory}/${selectedFileId}`,
          );
          if (!response.ok) {
            throw new Error(`Failed to load quotes: ${response.status}`);
          }

          const responseData = await response.json();
          quotes = responseData.quotes || responseData;


          // Shuffle the quotes for variety
          const shuffledQuotes = [...quotes].sort(() => Math.random() - 0.5);
          
          
          setAllQuotes(shuffledQuotes);
          setTargetText(shuffledQuotes[0]?.text || "");
        } else {
          // No valid selection
          setAllQuotes([]);
          setTargetText("");
          setCurrentQuoteIndex(0);
          return;
        }

        setCurrentQuoteIndex(0);
        setStartTime(null);
        setShowCompletion(false);
        setGameResult(null);
        finishedSentRef.current = false;
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : "Unknown error";
        setError(errorMessage);
        console.error("Error loading quotes:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuotes();
  }, [
    currentLanguageSignal.value.code,
    selectedCategory,
    selectedFileId,
    randomizeCategoryEnabled,
    randomQuotesEnabled,
  ]);

  // Initialize input hook
  const {
    charStates,
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    isComplete,
    keystrokeData,
    startTime: inputStartTime,
    getCharacterStats,
    getWrongCharactersArray,
    inputProps,
    resetInput,
  } = useQuoteInput(targetText);

  // Start timer on first input
  useEffect(() => {
    if (typedCount > 0 && startTime === null) {
      setStartTime(Date.now());
    }
  }, [typedCount, startTime]);

  // Calculate typing metrics
  const metrics = useTypingMetrics(
    charStates.map((cs) => ({
      char: cs.original,
      state: cs.state === "current" ? "none" : cs.state,
      typedChar: cs.typed ?? "",
    })),
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    startTime ?? Date.now(),
  );

  // Generate unique game ID
  const generateGameId = (): string => {
    return `game_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  // Send detailed stats to UserStatsManager
  const sendDetailedStats = useCallback(async () => {
    if (!inputStartTime || !isComplete) return;

    try {
      const userStatsManager = UserStatsManager.getInstance();
      await userStatsManager.initialize();

      const endTime = Date.now();
      const duration = (endTime - inputStartTime) / 1000;

      const gameResult: DetailedGameResult = {
        gameId: generateGameId(),
        userId: userStatsManager.getUserId(),
        mode: "quotes",
        startTime: new Date(inputStartTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration,
        wpm: metrics.wordsPerMinute,
        cpm: metrics.charactersPerMinute,
        accuracy: metrics.accuracyPercentage,
        mistakeCount,
        backspaceCount,
        keystrokeData,
        characterStats: getCharacterStats(),
        contentMetadata: {
          source: selectedFileMetadata?.fileTitle || selectedCategory ||
            "random-quote",
          totalCharacters: targetText.length,
          uniqueCharacters: new Set(targetText).size,
        },
        wrongCharacters: getWrongCharactersArray(),
      };

      await userStatsManager.updateStats(gameResult);
      setGameResult(gameResult);
    } catch (error) {
      console.error("Failed to update detailed user stats:", error);
    }
  }, [
    inputStartTime,
    isComplete,
    metrics,
    mistakeCount,
    backspaceCount,
    keystrokeData,
    getCharacterStats,
    targetText,
    selectedFileMetadata,
    getWrongCharactersArray,
  ]);

  // Handle quote completion and advancement
  useEffect(() => {
    // Send stats for individual quote completion
    if (isComplete && !finishedSentRef.current) {
      // Send to existing API
      fetch("/api/game-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameType: "quote",
          category: selectedFileMetadata?.fileTitle || selectedCategory ||
            "random-quote",
          isFinished: true,
        }),
      }).then((response) => response.json()).then((_data) => {
        // Success
      }).catch((error) => {
        console.error("Error sending finished quote stats:", error);
      });

      // Send detailed stats
      sendDetailedStats();
      setShowCompletion(true);
      finishedSentRef.current = true;
    }

    // Note: Manual progression - no auto-advance
  }, [
    isComplete,
    currentQuoteIndex,
    allQuotes,
    resetInput,
    sendDetailedStats,
    selectedFileMetadata,
  ]);

  // Load random category and quote collection
  const loadRandomFile = useCallback(async () => {
    if (!currentLanguageSignal.value.code) return;

    try {
      // First, get all categories for current language
      const categoriesResponse = await fetch(
        `/api/quotes/categories/${currentLanguageSignal.value.code}`,
      );
      if (!categoriesResponse.ok) throw new Error("Failed to fetch categories");

      const categories = await categoriesResponse.json();
      if (categories.length === 0) return;

      // Pick a random category
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];

      // Get all quote files for the random category
      const metadataResponse = await fetch(
        `/api/quotes/metadata/${currentLanguageSignal.value.code}/${randomCategory.directory}`,
      );
      if (!metadataResponse.ok) throw new Error("Failed to fetch metadata");

      const files: QuoteMetadata[] = await metadataResponse.json();
      if (files.length === 0) return;

      // Pick a random file from the random category
      const randomFile = files[Math.floor(Math.random() * files.length)];

      // Reset game state and set new selections
      setSelectedCategory(randomCategory.directory);
      setSelectedFileId(randomFile.id);
      setSelectedFileMetadata(randomFile);
      setCurrentQuoteIndex(0);
      setShowCompletion(false);
      setGameResult(null);
      setStartTime(null);
      finishedSentRef.current = false;
      resetInput();
    } catch (err) {
      console.error("Error loading random category and file:", err);
    }
  }, [currentLanguageSignal.value.code, resetInput]);

  // Practice again handler
  const handlePracticeAgain = useCallback(() => {
    resetInput();
    setShowCompletion(false);
    setGameResult(null);
    finishedSentRef.current = false;
    setStartTime(null);
    setCurrentQuoteIndex(0);
    if (allQuotes.length > 0) {
      setTargetText(allQuotes[0].text);
    }
    setTimeout(() => {
      hiddenInputRef.current?.focus();
    }, 100);
  }, [resetInput, allQuotes, currentQuoteIndex]);

  // Load next random quote for randomization modes
  const loadNextRandomQuote = useCallback(async () => {
    if (!currentLanguageSignal.value.code) return;

    try {
      const quotes: Quote[] = [];

      if (randomQuotesEnabled) {
        // Load all quotes from all categories for the language
        const categoriesResponse = await fetch(
          `/api/quotes/categories/${currentLanguageSignal.value.code}`,
        );
        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }

        const categories = await categoriesResponse.json();

        for (const category of categories) {
          const metadataResponse = await fetch(
            `/api/quotes/metadata/${currentLanguageSignal.value.code}/${category.directory}`,
          );
          if (!metadataResponse.ok) continue;

          const files: QuoteMetadata[] = await metadataResponse.json();

          for (const file of files) {
            const contentResponse = await fetch(
              `/api/quotes/content/${currentLanguageSignal.value.code}/${category.directory}/${file.id}`,
            );
            if (!contentResponse.ok) continue;

            const responseData = await contentResponse.json();
            const fileQuotes: Quote[] = responseData.quotes || responseData;
            quotes.push(...fileQuotes);
          }
        }
      } else if (randomizeCategoryEnabled && selectedCategory) {
        // Load all quotes from the selected category
        const metadataResponse = await fetch(
          `/api/quotes/metadata/${currentLanguageSignal.value.code}/${selectedCategory}`,
        );
        if (!metadataResponse.ok) throw new Error("Failed to fetch metadata");

        const files: QuoteMetadata[] = await metadataResponse.json();

        for (const file of files) {
          const contentResponse = await fetch(
            `/api/quotes/content/${currentLanguageSignal.value.code}/${selectedCategory}/${file.id}`,
          );
          if (!contentResponse.ok) continue;

          const responseData = await contentResponse.json();
          const fileQuotes: Quote[] = responseData.quotes || responseData;
          quotes.push(...fileQuotes);
        }
      }

      if (quotes.length > 0) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setAllQuotes([randomQuote]);
        setTargetText(randomQuote.text);
        setCurrentQuoteIndex(0);
      }
    } catch (err) {
      console.error("Error loading next random quote:", err);
    }
  }, [
    currentLanguageSignal.value.code,
    selectedCategory,
    randomQuotesEnabled,
    randomizeCategoryEnabled,
  ]);

  // Next quote handler
  const handleNextQuote = useCallback(async () => {
    if (randomQuotesEnabled || randomizeCategoryEnabled) {
      // Load a new random quote
      await loadNextRandomQuote();
      resetInput();
      setStartTime(null);
      setShowCompletion(false);
      finishedSentRef.current = false;
      // Increment games played counter for random modes
      setGamesPlayedCount((prev) => prev + 1);
      // Focus the hidden input after loading new quote
      setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 150);
    } else if (currentQuoteIndex < allQuotes.length - 1) {
      // Normal mode: move to next quote in collection
      const nextQuoteIndex = currentQuoteIndex + 1;
      setCurrentQuoteIndex(nextQuoteIndex);
      setTargetText(allQuotes[nextQuoteIndex].text);
      resetInput();
      setStartTime(null);
      setShowCompletion(false);
      finishedSentRef.current = false;
      // Focus the hidden input after hiding completion screen
      setTimeout(() => {
        if (!showCompletion) {
          hiddenInputRef.current?.focus();
        }
      }, 150);
    }
  }, [
    currentQuoteIndex,
    allQuotes,
    resetInput,
    showCompletion,
    randomQuotesEnabled,
    randomizeCategoryEnabled,
    loadNextRandomQuote,
  ]);

  // Selection handlers (removed handleLanguageChange - using global language)
  const handleCategoryChange = useCallback((categoryDirectory: string) => {
    setSelectedCategory(categoryDirectory);
    setSelectedFileId(null);
    setSelectedFileMetadata(null);
  }, []);

  const handleFileChange = useCallback(
    (fileId: string, metadata: QuoteMetadata) => {
      setSelectedFileId(fileId);
      setSelectedFileMetadata(metadata);
    },
    [],
  );

  // Toggle handlers
  const handleRandomQuotesToggle = useCallback((enabled: boolean) => {
    setRandomQuotesEnabled(enabled);
    if (enabled) {
      // Disable category randomization when enabling random quotes
      setRandomizeCategoryEnabled(false);
      // Clear specific selections since we're now in random mode
      setSelectedFileId(null);
      setSelectedFileMetadata(null);
      // Reset games played counter and clear current game state when entering random mode
      setGamesPlayedCount(0);
      setCurrentQuoteIndex(0);
      setAllQuotes([]);
      setTargetText("");
    }
  }, []);

  const handleRandomizeCategoryToggle = useCallback((enabled: boolean) => {
    setRandomizeCategoryEnabled(enabled);
    if (enabled) {
      // Clear specific file selection when enabling category randomization
      setSelectedFileId(null);
      setSelectedFileMetadata(null);
      // Reset games played counter and clear current game state when entering category randomization mode
      setGamesPlayedCount(0);
      setCurrentQuoteIndex(0);
      setAllQuotes([]);
      setTargetText("");
    }
  }, []);

  // Focus management
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Don't interfere with keyboard navigation when completion screen is shown
      if (showCompletion) {
        return;
      }

      const hiddenInput = document.querySelector(
        'input[aria-hidden="true"]',
      ) as HTMLInputElement;

      if (
        event.key === "Enter" && hiddenInput &&
        document.activeElement !== hiddenInput
      ) {
        event.preventDefault();
        hiddenInput.focus();
      }
    };

    globalThis.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      globalThis.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [showCompletion]);

  // Auto-focus after content loads
  useEffect(() => {
    if (
      autoFocus && !isLoading && !error && targetText &&
      hiddenInputRef.current && !showCompletion
    ) {
      const focusTimer = setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 100);

      return () => clearTimeout(focusTimer);
    }
  }, [autoFocus, isLoading, error, targetText, showCompletion]);

  return (
    <div class="space-y-4 -mt-5">
      {/* Loading State */}
      {isLoading && (
        <div class="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-tt-lightblue bg-opacity-10 rounded-full mb-4">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-tt-lightblue border-t-transparent">
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {t("quotes.loadingQuotes")}
            </h3>
            <p class="text-gray-600">
              {t("quotes.fetchingCollection")}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div class="bg-red-50 border border-red-200 rounded-xl p-6">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <svg
                class="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-red-800 mb-1">
                {t("quotes.errorLoading")}
              </h3>
              <p class="text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => globalThis.location.reload()}
                class="mt-3 text-sm text-red-700 hover:text-red-800 underline focus:outline-none"
              >
                {t("quotes.tryAgain")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Typing Interface */}
      {!isLoading && !error && targetText && (
        <>
          {/* Hidden input */}
          <input
            ref={hiddenInputRef}
            {...inputProps}
            type="text"
            style={{
              position: "absolute",
              top: "-9999px",
              left: "-9999px",
              opacity: 0,
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />

          {/* Quote display */}
          <div
            onClick={() => hiddenInputRef.current?.focus()}
            style={{ cursor: "text" }}
            class="w-full min-h-[300px] rounded-lg bg-white shadow mb-4"
          >
            <div class="w-full">
              <QuoteTextDisplay charStates={charStates} />
            </div>
          </div>

          {/* Quote Attribution Box */}
          {allQuotes[currentQuoteIndex] && (
            <div class="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-4">
              <div class="flex items-start justify-between">
                {/* Primary attribution - author and year */}
                <div class="flex-1">
                  {allQuotes[currentQuoteIndex].author && (
                    <div class="text-lg font-medium text-gray-800 mb-1">
                      — {allQuotes[currentQuoteIndex].author}
                      {allQuotes[currentQuoteIndex].year && (
                        <span class="text-base text-gray-600 ml-2">
                          ({allQuotes[currentQuoteIndex].year})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Author biographical information */}
                  {allQuotes[currentQuoteIndex]?.authorBio && 
                   allQuotes[currentQuoteIndex].authorBio.trim() !== "" && (
                    <div class="text-sm text-gray-600 italic mb-2">
                      <strong>Bio:</strong> {allQuotes[currentQuoteIndex].authorBio}
                    </div>
                  )}

                  {/* Secondary metadata */}
                  <div class="space-y-1 text-sm text-gray-500">
                    {allQuotes[currentQuoteIndex]?.source && 
                     allQuotes[currentQuoteIndex].source.trim() !== "" && (
                      <div class="italic">
                        <strong>Source:</strong> {allQuotes[currentQuoteIndex].source}
                      </div>
                    )}
                    {allQuotes[currentQuoteIndex].tags &&
                      allQuotes[currentQuoteIndex].tags.length > 0 && (
                      <div class="flex items-center space-x-1">
                        <span>Tags:</span>
                        <div class="flex flex-wrap gap-1">
                          {allQuotes[currentQuoteIndex].tags.map((
                            tag: string,
                            index: number,
                          ) => (
                            <span
                              key={index}
                              class="px-2 py-1 bg-gray-100 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {allQuotes[currentQuoteIndex].difficulty && (
                      <div>
                        {t(TRANSLATION_KEYS.COMMON.DIFFICULTY)}:{" "}
                        <span class="capitalize font-medium">
                          {allQuotes[currentQuoteIndex].difficulty}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Collection info */}
                <div class="text-right text-sm text-gray-500 ml-4">
                  {selectedCategory && !randomQuotesEnabled && (
                    <div class="mb-1">
                      {t(TRANSLATION_KEYS.COMMON.CATEGORY)}:{" "}
                      <span class="font-medium capitalize">
                        {selectedCategory}
                      </span>
                    </div>
                  )}
                  {selectedFileMetadata?.fileTitle &&
                    !randomizeCategoryEnabled && !randomQuotesEnabled && (
                    <div>
                      {t("quotes.collection")}:{" "}
                      <span class="font-medium">
                        {selectedFileMetadata.fileTitle}
                      </span>
                    </div>
                  )}
                  {randomQuotesEnabled && (
                    <div class="text-xs bg-blue-50 px-2 py-1 rounded text-blue-700">
                      🎲 {t(TRANSLATION_KEYS.QUOTES.RANDOM_FROM_ALL_QUOTES)}
                    </div>
                  )}
                  {randomizeCategoryEnabled && selectedCategory && (
                    <div class="text-xs bg-green-50 px-2 py-1 rounded text-green-700">
                      🎲 Random from {selectedCategory}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          {(allQuotes.length > 1 || randomQuotesEnabled ||
            randomizeCategoryEnabled) && (
            <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  {randomQuotesEnabled || randomizeCategoryEnabled
                    ? (
                      // Random modes - show games played
                      <>
                        <div class="flex items-center justify-center w-8 h-8 bg-tt-lightblue text-white rounded-full text-sm font-semibold">
                          {gamesPlayedCount + 1}
                        </div>
                        <div class="text-sm">
                          <span class="font-medium text-gray-900">
                            Game {gamesPlayedCount + 1}
                          </span>
                        </div>
                      </>
                    )
                    : (
                      // Collection mode - show quote progress
                      <>
                        <div class="flex items-center justify-center w-8 h-8 bg-tt-lightblue text-white rounded-full text-sm font-semibold">
                          {currentQuoteIndex + 1}
                        </div>
                        <div class="text-sm">
                          <span class="font-medium text-gray-900">
                            Quote {currentQuoteIndex + 1}
                          </span>
                          <span class="text-gray-500">
                            {" "}of {allQuotes.length}
                          </span>
                        </div>
                      </>
                    )}
                </div>
                <div class="text-sm text-gray-500">
                  {randomQuotesEnabled || randomizeCategoryEnabled
                    ? (
                      <span class="flex items-center space-x-1">
                        <span>🎲</span>
                        <span>Random Mode</span>
                      </span>
                    )
                    : (
                      <span>
                        {Math.round(
                          ((currentQuoteIndex + (isComplete ? 1 : 0)) /
                            allQuotes.length) * 100,
                        )}% Complete
                      </span>
                    )}
                </div>
              </div>
              {/* Only show progress bar for collections */}
              {!randomQuotesEnabled && !randomizeCategoryEnabled && (
                <div class="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div
                    class="bg-gradient-to-r from-tt-lightblue to-blue-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{
                      width: `${
                        ((currentQuoteIndex + (isComplete ? 1 : 0)) /
                          allQuotes.length) * 100
                      }%`,
                    }}
                  >
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completion screen */}
          {showCompletion && (
            <GameScoreDisplayIsland
              metrics={metrics}
              isComplete={showCompletion}
              onPracticeAgain={handlePracticeAgain}
              onNextGame={(randomQuotesEnabled || randomizeCategoryEnabled ||
                  currentQuoteIndex < allQuotes.length - 1)
                ? handleNextQuote
                : undefined}
              gameType="quote"
              gameResult={gameResult || undefined}
            />
          )}
        </>
      )}

      {/* Selection Controls - moved to bottom */}
      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div class="space-y-4">
          {/* Random Quotes Toggle */}
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={randomQuotesEnabled}
                  onChange={(e) =>
                    handleRandomQuotesToggle(
                      (e.target as HTMLInputElement).checked,
                    )}
                  class="w-4 h-4 text-tt-lightblue bg-gray-100 border-gray-300 rounded focus:ring-tt-lightblue focus:ring-2"
                />
                <span class="text-sm font-medium text-gray-700">
                  {t(TRANSLATION_KEYS.QUOTES.RANDOM_QUOTES)}
                </span>
              </label>
              <div class="text-xs text-gray-500">
                {t(TRANSLATION_KEYS.QUOTES.GET_RANDOM_QUOTES_ENTIRE_LANGUAGE)}
              </div>
            </div>
            {/* Load Random Collection Button - smaller and positioned here */}
            <button
              type="button"
              onClick={loadRandomFile}
              class="bg-gradient-to-r from-tt-lightblue to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
            >
              🎲 {t("quotes.loadRandomCollection")}
            </button>
          </div>

          {/* Category and File Selection - only show when Random Quotes is disabled */}
          {!randomQuotesEnabled && (
            <>
              {/* Category Selector with Randomize Category Toggle */}
              <div class="space-y-2">
                <div class="flex items-center space-x-4">
                  <div class="flex-1">
                    <CategorySelector
                      languageCode={currentLanguageSignal.value.code}
                      selectedCategory={selectedCategory}
                      onCategoryChange={handleCategoryChange}
                      isStateLoaded={isStateLoaded}
                      categoryLabel={t(TRANSLATION_KEYS.COMMON.CATEGORY)}
                    />
                  </div>
                  {selectedCategory && (
                    <label class="flex items-center space-x-2 cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={randomizeCategoryEnabled}
                        onChange={(e) =>
                          handleRandomizeCategoryToggle(
                            (e.target as HTMLInputElement).checked,
                          )}
                        class="w-4 h-4 text-tt-lightblue bg-gray-100 border-gray-300 rounded focus:ring-tt-lightblue focus:ring-2"
                      />
                      <span class="text-sm font-medium text-gray-700">
                        {t(TRANSLATION_KEYS.QUOTES.RANDOMIZE_CATEGORY)}
                      </span>
                    </label>
                  )}
                </div>
                {selectedCategory && randomizeCategoryEnabled && (
                  <div class="text-xs text-gray-500 pl-1">
                    Get random quotes from the entire "{selectedCategory}"
                    category
                  </div>
                )}
              </div>

              {/* Quote File Selector - only show when category randomization is disabled */}
              {selectedCategory && !randomizeCategoryEnabled && (
                <QuoteFileSelector
                  languageCode={currentLanguageSignal.value.code}
                  categoryDirectory={selectedCategory}
                  selectedFileId={selectedFileId}
                  onFileChange={handleFileChange}
                  label={t(TRANSLATION_KEYS.QUOTES.SELECT_COLLECTION)}
                  difficultyLabel={t(TRANSLATION_KEYS.COMMON.DIFFICULTY)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!isLoading && !error && !targetText && (
        <div class="bg-white rounded-xl shadow-md border border-gray-200 p-12">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
              <svg
                class="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h6a2 2 0 002-2V8"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Ready to Start Typing
            </h3>
            <p class="text-gray-500">
              Select a category and quote collection from the options below to
              begin your typing practice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
