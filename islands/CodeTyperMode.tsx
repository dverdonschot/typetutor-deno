import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import { useOvertypeInput } from "../hooks/useOvertypeInput.ts";
import { useTypingMetrics } from "../hooks/useTypingMetrics.ts";
import OvertypeContainer from "../components/overtype/OvertypeContainer.tsx";
import GameScoreDisplayIsland from "./GameScoreDisplayIsland.tsx";
import { UserStatsManager } from "../utils/userStatsManager.ts";
import { DetailedGameResult } from "../types/userStats.ts";
import CodeLanguageSelector from "../components/CodeLanguageSelector.tsx";
import CodeCollectionSelector from "../components/CodeCollectionSelector.tsx";

interface Language {
  code: string;
  name: string;
  icon: string;
  description: string;
}

interface CodeCollectionMetadata {
  id: string;
  name: string;
  snippetCount: number;
  difficulty?: string;
  tags?: string[];
  description?: string;
}

interface CodeSnippet {
  code: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: string;
  language: string;
  index: number;
}

// localStorage keys for code mode - moved outside component to prevent re-creation
const localStorageKeys = {
  language: "code_selectedLanguage",
  collection: "code_selectedCollection",
  snippet: "code_selectedSnippet",
  languageRandom: "code_languageRandomMode",
  collectionRandom: "code_collectionRandomMode",
};

export default function CodeTyperMode() {
  // Selection state for new collection system
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedLanguageData, setSelectedLanguageData] = useState<
    Language | null
  >(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null);
  const [selectedCollectionData, setSelectedCollectionData] = useState<
    CodeCollectionMetadata | null
  >(null);
  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>([]);
  const [selectedSnippetIndex, setSelectedSnippetIndex] = useState<number>(0);

  // Random mode states
  const [languageRandomMode, setLanguageRandomMode] = useState<boolean>(false);
  const [collectionRandomMode, setCollectionRandomMode] = useState<boolean>(
    false,
  );

  // Content and UI state
  const [targetText, setTargetText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(
    false,
  );
  const [showCompletion, setShowCompletion] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<DetailedGameResult | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const finishedSentRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const overtypeRef = useRef<HTMLDivElement>(null);
  const _hasUserInteracted = useRef(false);

  // Memoize current snippet to prevent re-renders
  const currentSnippet = useMemo(() => {
    if (codeSnippets.length > 0 && selectedSnippetIndex < codeSnippets.length) {
      return codeSnippets[selectedSnippetIndex];
    }
    return null;
  }, [codeSnippets, selectedSnippetIndex]);

  // Initialize overtype input hook
  const {
    inputValue,
    charStates,
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    isComplete,
    startTime: inputStartTime,
    keystrokeData,
    handleInputChange,
    resetInput,
    getWrongCharactersArray,
  } = useOvertypeInput(targetText);

  // Start timer on first input
  useEffect(() => {
    if (typedCount > 0 && startTime === null && inputStartTime) {
      setStartTime(inputStartTime);
    }
  }, [typedCount, startTime, inputStartTime]);

  // Focus management for overtype textarea
  useEffect(() => {
    if (
      targetText && !isLoading && !showCompletion && !error &&
      selectedCollectionId
    ) {
      const timer = setTimeout(() => {
        if (overtypeRef.current) {
          const textarea = overtypeRef.current.querySelector("textarea");
          if (textarea && !textarea.disabled) {
            textarea.focus();
          }
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [targetText, isLoading, showCompletion, error, selectedCollectionId]);

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
    inputStartTime ?? Date.now(),
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

      // Get the programming language from the selected language
      const programmingLanguage = selectedLanguage || "unknown";

      // Note: keystrokeData conversion removed - using empty array for now

      const gameResult: DetailedGameResult = {
        gameId: generateGameId(),
        userId: userStatsManager.getUserId(),
        mode: "code",
        startTime: new Date(inputStartTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration,
        wpm: metrics.wordsPerMinute,
        cpm: metrics.charactersPerMinute,
        accuracy: metrics.accuracyPercentage,
        mistakeCount,
        backspaceCount,
        keystrokeData: [],
        characterStats: {},
        contentMetadata: {
          source: `${selectedLanguageData?.name || programmingLanguage}/${
            selectedCollectionData?.name || "unknown"
          }`,
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
    targetText,
    selectedLanguageData,
    selectedCollectionData,
    getWrongCharactersArray,
  ]);

  // Handle completion and stats tracking
  useEffect(() => {
    if (isComplete && !finishedSentRef.current) {
      const programmingLanguage = selectedLanguage || "unknown";

      fetch("/api/game-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameType: "code",
          category: programmingLanguage,
          isFinished: true,
        }),
      }).then((response) => response.json()).then((_data) => {
        // Success
      }).catch((error) => {
        console.error("Error sending finished code stats:", error);
      });

      sendDetailedStats();

      setShowCompletion(true);
      finishedSentRef.current = true;
    }
  }, [isComplete, sendDetailedStats, selectedLanguage]);

  // Function to load next snippet
  const loadNextSnippet = useCallback(() => {
    if (codeSnippets.length === 0) return;

    // Reset completion state when loading new content
    setShowCompletion(false);
    setGameResult(null);
    setStartTime(null);
    finishedSentRef.current = false;

    const nextIndex = (selectedSnippetIndex + 1) % codeSnippets.length;
    setSelectedSnippetIndex(nextIndex);
    localStorage.setItem(localStorageKeys.snippet, nextIndex.toString());
  }, [codeSnippets.length, selectedSnippetIndex]);

  // Function to load a random snippet from current collection
  const loadRandomSnippet = useCallback(() => {
    if (codeSnippets.length === 0) return;

    // Reset completion state when loading random content
    setShowCompletion(false);
    setGameResult(null);
    setStartTime(null);
    finishedSentRef.current = false;

    const randomIndex = Math.floor(Math.random() * codeSnippets.length);
    setSelectedSnippetIndex(randomIndex);
    localStorage.setItem(localStorageKeys.snippet, randomIndex.toString());
  }, [codeSnippets.length]);

  // Function to load a random snippet from any collection in the language
  const loadLanguageRandomSnippet = useCallback(async () => {
    if (!selectedLanguage) return;

    // Reset completion state when loading random content
    setShowCompletion(false);
    setGameResult(null);
    setStartTime(null);
    finishedSentRef.current = false;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/code-collections/random-snippet/${selectedLanguage}`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch random snippet: ${response.status}`);
      }

      const data = await response.json();

      // Set the target text directly from the random snippet
      setTargetText(data.snippet.code);

      // Update collection if it changed
      if (data.collectionId !== selectedCollectionId) {
        setSelectedCollectionId(data.collectionId);
        localStorage.setItem(localStorageKeys.collection, data.collectionId);

        // Find and set collection data
        try {
          const collectionResponse = await fetch(
            `/api/code-collections/collections/${selectedLanguage}`,
          );
          if (collectionResponse.ok) {
            const collections = await collectionResponse.json();
            const collectionData = collections.find((
              c: CodeCollectionMetadata,
            ) => c.id === data.collectionId);
            if (collectionData) {
              setSelectedCollectionData(collectionData);
            }
          }
        } catch (e) {
          console.warn("Failed to update collection data:", e);
        }

        // Load the full collection to get other snippets
        try {
          const snippetsResponse = await fetch(
            `/api/code-collections/snippets/${selectedLanguage}/${data.collectionId}`,
          );
          if (snippetsResponse.ok) {
            const snippets = await snippetsResponse.json();
            setCodeSnippets(snippets);

            // Find the index of our random snippet
            const snippetIndex = snippets.findIndex((s: CodeSnippet) =>
              s.code === data.snippet.code
            );
            if (snippetIndex !== -1) {
              setSelectedSnippetIndex(snippetIndex);
              localStorage.setItem(
                localStorageKeys.snippet,
                snippetIndex.toString(),
              );
            }
          }
        } catch (e) {
          console.warn("Failed to load collection snippets:", e);
        }
      } else {
        // Same collection, just find the snippet index
        const snippetIndex = codeSnippets.findIndex((s: CodeSnippet) =>
          s.code === data.snippet.code
        );
        if (snippetIndex !== -1) {
          setSelectedSnippetIndex(snippetIndex);
          localStorage.setItem(
            localStorageKeys.snippet,
            snippetIndex.toString(),
          );
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Error loading random snippet: ${errorMessage}`);
    }

    setIsLoading(false);
  }, [selectedLanguage, selectedCollectionId, codeSnippets]);

  // Load initial state including random modes
  useEffect(() => {
    if (initialLoadComplete) return;

    // Ensure completely clean initial state
    setShowCompletion(false);
    setGameResult(null);
    setStartTime(null);
    finishedSentRef.current = false;

    // Load random mode preferences from localStorage
    const savedLanguageRandom = localStorage.getItem(
      localStorageKeys.languageRandom,
    );
    const savedCollectionRandom = localStorage.getItem(
      localStorageKeys.collectionRandom,
    );

    if (savedLanguageRandom === "true") {
      setLanguageRandomMode(true);
    }
    if (savedCollectionRandom === "true") {
      setCollectionRandomMode(true);
    }

    // Let the individual selectors handle auto-selection
    // This ensures proper data loading flow

    setInitialLoadComplete(true);
  }, [initialLoadComplete]);

  // Fetch code snippets when collection changes
  useEffect(() => {
    if (!selectedLanguage || !selectedCollectionId) {
      setCodeSnippets([]);
      setTargetText("");
      return;
    }

    const loadCollection = async () => {
      setIsLoading(true);
      setError(null);
      setTargetText("");
      setShowCompletion(false);
      setGameResult(null);
      setStartTime(null);
      finishedSentRef.current = false;

      try {
        const response = await fetch(
          `/api/code-collections/snippets/${selectedLanguage}/${selectedCollectionId}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch collection: ${response.status}`);
        }

        const snippets: CodeSnippet[] = await response.json();
        setCodeSnippets(snippets);

        // Restore snippet selection from localStorage after snippets are loaded
        const savedSnippetIndex = localStorage.getItem(
          localStorageKeys.snippet,
        );
        if (savedSnippetIndex && snippets.length > 0) {
          const parsedIndex = parseInt(savedSnippetIndex, 10);
          if (parsedIndex >= 0 && parsedIndex < snippets.length) {
            setSelectedSnippetIndex(parsedIndex);
          } else {
            // Saved index is out of bounds, reset to 0
            setSelectedSnippetIndex(0);
            localStorage.setItem(localStorageKeys.snippet, "0");
          }
        } else {
          // No saved index, start with 0
          setSelectedSnippetIndex(0);
          localStorage.setItem(localStorageKeys.snippet, "0");
        }
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : "Unknown error";
        setError(`Error loading collection: ${errorMessage}`);
        setCodeSnippets([]);
      }

      setIsLoading(false);
    };

    loadCollection();
  }, [
    selectedLanguage,
    selectedCollectionId,
  ]);

  // Update target text when snippet selection changes
  useEffect(() => {
    if (codeSnippets.length === 0) {
      setTargetText("");
      return;
    }

    // Validate snippet index (defensive check)
    if (
      selectedSnippetIndex >= codeSnippets.length || selectedSnippetIndex < 0
    ) {
      console.warn(
        `Invalid snippet index ${selectedSnippetIndex}, resetting to 0`,
      );
      setSelectedSnippetIndex(0);
      localStorage.setItem(localStorageKeys.snippet, "0");
      return; // Let the effect re-run with the corrected index
    }

    // Update target text with current snippet
    const selectedSnippet = codeSnippets[selectedSnippetIndex];
    if (selectedSnippet) {
      setTargetText(selectedSnippet.code);
    }

    // Reset game state when changing snippets (only if not during initial load)
    setShowCompletion(false);
    setGameResult(null);
    setStartTime(null);
    finishedSentRef.current = false;
  }, [codeSnippets, selectedSnippetIndex]);

  // Selection handlers
  const handleLanguageChange = useCallback(
    (languageCode: string, language: Language) => {
      setSelectedLanguage(languageCode);
      setSelectedLanguageData(language);
      setSelectedCollectionId(null);
      setSelectedCollectionData(null);
      setSelectedSnippetIndex(0);
      localStorage.setItem(localStorageKeys.language, languageCode);
      localStorage.removeItem(localStorageKeys.collection);
      localStorage.removeItem(localStorageKeys.snippet);
    },
    [],
  );

  const handleCollectionChange = useCallback(
    (collectionId: string, collection: CodeCollectionMetadata) => {
      setSelectedCollectionId(collectionId);
      setSelectedCollectionData(collection);
      setSelectedSnippetIndex(0);
      localStorage.setItem(localStorageKeys.collection, collectionId);
      localStorage.setItem(localStorageKeys.snippet, "0");
    },
    [],
  );

  const handleSnippetChange = useCallback((index: number) => {
    if (
      index !== selectedSnippetIndex && index >= 0 &&
      index < codeSnippets.length
    ) {
      setSelectedSnippetIndex(index);
      localStorage.setItem(localStorageKeys.snippet, index.toString());
    }
  }, [selectedSnippetIndex, codeSnippets.length]);

  // Random mode toggle handlers
  const handleLanguageRandomToggle = useCallback((enabled: boolean) => {
    setLanguageRandomMode(enabled);
    localStorage.setItem(localStorageKeys.languageRandom, enabled.toString());

    // If enabling language random, disable collection random
    if (enabled && collectionRandomMode) {
      setCollectionRandomMode(false);
      localStorage.setItem(localStorageKeys.collectionRandom, "false");
    }

    // If enabling and we have a language, load a random snippet immediately
    if (enabled && selectedLanguage) {
      loadLanguageRandomSnippet();
    }
  }, [collectionRandomMode, selectedLanguage, loadLanguageRandomSnippet]);

  const handleCollectionRandomToggle = useCallback((enabled: boolean) => {
    setCollectionRandomMode(enabled);
    localStorage.setItem(localStorageKeys.collectionRandom, enabled.toString());

    // If enabling collection random, disable language random
    if (enabled && languageRandomMode) {
      setLanguageRandomMode(false);
      localStorage.setItem(localStorageKeys.languageRandom, "false");
    }

    // If enabling and we have snippets, load a random snippet immediately
    if (enabled && codeSnippets.length > 0) {
      loadRandomSnippet();
    }
  }, [languageRandomMode, codeSnippets.length, loadRandomSnippet]);

  // Handle practice again
  const handlePracticeAgain = useCallback(() => {
    resetInput();
    setShowCompletion(false);
    setGameResult(null);
    setStartTime(null);
    finishedSentRef.current = false;
  }, [resetInput]);

  // Handle next exercise - use appropriate random mode
  const handleNextExercise = useCallback(() => {
    if (languageRandomMode) {
      loadLanguageRandomSnippet();
    } else if (collectionRandomMode) {
      loadRandomSnippet();
    } else {
      loadNextSnippet();
    }
  }, [
    languageRandomMode,
    collectionRandomMode,
    loadLanguageRandomSnippet,
    loadRandomSnippet,
    loadNextSnippet,
  ]);

  // Auto-trigger random snippet on completion if random modes are enabled
  useEffect(() => {
    if (isComplete && !finishedSentRef.current) {
      const timeoutId = setTimeout(() => {
        if (languageRandomMode) {
          loadLanguageRandomSnippet();
        } else if (collectionRandomMode) {
          loadRandomSnippet();
        }
      }, 2000); // 2 second delay after completion

      return () => clearTimeout(timeoutId);
    }
  }, [
    isComplete,
    languageRandomMode,
    collectionRandomMode,
    loadLanguageRandomSnippet,
    loadRandomSnippet,
  ]);

  return (
    <div class="code-mode-container" ref={containerRef}>
      {isLoading && (
        <div class="code-loading">
          <div class="code-spinner"></div>
          <span>Loading content...</span>
        </div>
      )}

      {error && (
        <div class="code-error">
          <span class="code-error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {targetText && (
            <div ref={overtypeRef}>
              <OvertypeContainer
                charStates={charStates}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                disabled={showCompletion}
              />
            </div>
          )}

          {/* Collection selectors */}
          <div class="code-selectors">
            <div class="selector-row">
              <div class="selector-item">
                <CodeLanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={handleLanguageChange}
                  randomMode={languageRandomMode}
                  onRandomModeChange={handleLanguageRandomToggle}
                />
              </div>
              <div class="selector-item">
                <CodeCollectionSelector
                  languageCode={selectedLanguage}
                  selectedCollectionId={selectedCollectionId}
                  onCollectionChange={handleCollectionChange}
                  randomMode={collectionRandomMode}
                  onRandomModeChange={handleCollectionRandomToggle}
                  disabled={languageRandomMode}
                />
              </div>
            </div>
          </div>

          {/* Snippet selector and info */}
          {codeSnippets.length > 0 && (
            <div class="snippet-selector">
              <label class="code-label">
                Code Snippet ({selectedSnippetIndex + 1} of{" "}
                {codeSnippets.length}):
              </label>
              <select
                key={`snippet-selector-${selectedCollectionId}-${codeSnippets.length}`}
                value={selectedSnippetIndex}
                onChange={(e) =>
                  handleSnippetChange(parseInt(e.currentTarget.value, 10))}
                class="code-select"
                disabled={isComplete}
              >
                {codeSnippets.map((snippet, index) => (
                  <option key={`${snippet.title}-${index}`} value={index}>
                    {snippet.title} ({snippet.difficulty})
                  </option>
                ))}
              </select>

              {currentSnippet && (
                <div class="snippet-info">
                  <p class="snippet-description">
                    {currentSnippet.description}
                  </p>
                  {currentSnippet.tags.length > 0 && (
                    <p class="snippet-tags">
                      Tags: {currentSnippet.tags.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div class="code-actions">
            {!languageRandomMode && !collectionRandomMode && (
              <>
                <button
                  onClick={loadRandomSnippet}
                  class="code-button code-button-random"
                  type="button"
                  disabled={isComplete || codeSnippets.length === 0}
                >
                  Random Snippet
                </button>
                <button
                  onClick={loadNextSnippet}
                  class="code-button code-button-next"
                  type="button"
                  disabled={isComplete || codeSnippets.length <= 1}
                >
                  Next Snippet
                </button>
              </>
            )}

            {languageRandomMode && (
              <button
                onClick={loadLanguageRandomSnippet}
                class="code-button code-button-random"
                type="button"
                disabled={isComplete || !selectedLanguage}
              >
                Random from Language
              </button>
            )}

            {collectionRandomMode && !languageRandomMode && (
              <button
                onClick={loadRandomSnippet}
                class="code-button code-button-random"
                type="button"
                disabled={isComplete || codeSnippets.length === 0}
              >
                Random from Collection
              </button>
            )}
          </div>

          {/* Completion display with proper metrics */}
          {showCompletion && isComplete && (
            <GameScoreDisplayIsland
              metrics={metrics}
              isComplete
              onPracticeAgain={handlePracticeAgain}
              onNextGame={handleNextExercise}
              gameType="code"
              gameResult={gameResult || undefined}
            />
          )}
        </>
      )}

      <style jsx>
        {`
        .code-mode-container {
          max-width: 95vw;
          margin: 0 auto;
          padding: 0.5rem 1rem 1rem 1rem;
        }

        .code-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .code-title {
          font-size: 2rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .code-subtitle {
          color: #6b7280;
          font-size: 1rem;
        }

        .code-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem;
          color: #6b7280;
        }

        .code-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .code-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          margin-bottom: 1rem;
        }

        .code-selectors {
          margin: 1rem 0;
        }

        .selector-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .selector-row {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }

        .selector-item {
          min-width: 0;
        }

        .snippet-selector {
          margin: 1rem 0;
        }

        .code-label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .code-select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background-color: white;
          font-size: 1rem;
        }

        .code-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .snippet-info {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .snippet-description {
          margin: 0 0 0.5rem 0;
          color: #374151;
          font-weight: 500;
        }

        .snippet-tags {
          margin: 0;
          color: #6b7280;
          font-size: 0.8rem;
        }

        .code-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin: 1rem 0;
        }

        .code-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .code-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .code-button-random {
          background-color: #0044aa;
          color: white;
        }

        .code-button-random:hover:not(:disabled) {
          background-color: #003388;
        }

        .code-button-next {
          background-color: #5fbcd3;
          color: white;
        }

        .code-button-next:hover:not(:disabled) {
          background-color: #4aa8bd;
        }

        .code-button-focus {
          background-color: #f59e0b;
          color: white;
        }

        .code-button-focus:hover:not(:disabled) {
          background-color: #d97706;
        }
      `}
      </style>
    </div>
  );
}
