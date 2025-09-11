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
import CodeSourceSelector from "../components/CodeSourceSelector.tsx";
import GitHubUrlInput from "../components/GitHubUrlInput.tsx";

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
  sourceType: "code_sourceType",
  githubUrl: "code_githubUrl",
};

interface GitHubFileInfo {
  user: string;
  repo: string;
  branch: string;
  path: string;
  fileName: string;
  fileExtension: string;
  url: string;
}

export default function CodeTyperMode() {
  // Source type state
  const [sourceType, setSourceType] = useState<"collections" | "github">(
    "collections",
  );

  // GitHub-specific state
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [githubFileInfo, setGithubFileInfo] = useState<GitHubFileInfo | null>(
    null,
  );
  const [githubLoading, setGithubLoading] = useState<boolean>(false);
  const [githubError, setGithubError] = useState<string | null>(null);

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
      targetText && !isLoading && !githubLoading && !showCompletion && !error &&
      !githubError &&
      (selectedCollectionId || (sourceType === "github" && githubFileInfo))
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
  }, [
    targetText,
    isLoading,
    githubLoading,
    showCompletion,
    error,
    githubError,
    selectedCollectionId,
    sourceType,
    githubFileInfo,
  ]);

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

  // GitHub URL fetching
  const fetchGitHubContent = useCallback(async (url: string) => {
    setGithubLoading(true);
    setGithubError(null);
    setTargetText("");
    setShowCompletion(false);
    setGameResult(null);
    setStartTime(null);
    finishedSentRef.current = false;

    try {
      const response = await fetch("/api/github-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!data.success) {
        setGithubError(data.error || "Failed to fetch GitHub content");
        setGithubFileInfo(null);
        return;
      }

      setTargetText(data.content);
      setGithubFileInfo(data.fileInfo);
      setGithubError(null);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Network error";
      setGithubError(`Failed to fetch content: ${errorMessage}`);
      setGithubFileInfo(null);
    } finally {
      setGithubLoading(false);
    }
  }, []);

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

      // Get the programming language and source info
      const programmingLanguage = sourceType === "github"
        ? (githubFileInfo?.fileExtension || "unknown")
        : (selectedLanguage || "unknown");

      // Determine source for metadata
      const source = sourceType === "github"
        ? `GitHub: ${githubFileInfo?.user}/${githubFileInfo?.repo}/${githubFileInfo?.fileName}`
        : `${selectedLanguageData?.name || programmingLanguage}/${
          selectedCollectionData?.name || "unknown"
        }`;

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
          source,
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

  // Load initial state
  useEffect(() => {
    if (initialLoadComplete) return;

    // Ensure completely clean initial state
    setShowCompletion(false);
    setGameResult(null);
    setStartTime(null);
    finishedSentRef.current = false;

    // Load source type from localStorage
    const savedSourceType = localStorage.getItem(localStorageKeys.sourceType) as
      | "collections"
      | "github"
      | null;
    if (savedSourceType) {
      setSourceType(savedSourceType);
    }

    // Load GitHub URL from localStorage
    const savedGithubUrl = localStorage.getItem(localStorageKeys.githubUrl);
    if (savedGithubUrl) {
      setGithubUrl(savedGithubUrl);
    }

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

  // Source type change handler
  const handleSourceTypeChange = useCallback(
    (newSourceType: "collections" | "github") => {
      setSourceType(newSourceType);
      localStorage.setItem(localStorageKeys.sourceType, newSourceType);

      // Reset content when switching source types
      setTargetText("");
      setShowCompletion(false);
      setGameResult(null);
      setStartTime(null);
      finishedSentRef.current = false;

      if (newSourceType === "github") {
        setGithubError(null);
        setGithubFileInfo(null);
      }
    },
    [],
  );

  // GitHub URL change handler
  const handleGithubUrlChange = useCallback((url: string) => {
    setGithubUrl(url);
    localStorage.setItem(localStorageKeys.githubUrl, url);
  }, []);

  // GitHub fetch handler
  const handleGithubFetch = useCallback((url: string) => {
    fetchGitHubContent(url);
  }, [fetchGitHubContent]);

  // Handle practice again
  const handlePracticeAgain = useCallback(() => {
    resetInput();
    setShowCompletion(false);
    setGameResult(null);
    setStartTime(null);
    finishedSentRef.current = false;
  }, [resetInput]);

  // Handle next exercise
  const handleNextExercise = useCallback(() => {
    loadNextSnippet();
  }, [loadNextSnippet]);

  return (
    <div class="code-mode-container" ref={containerRef}>
      {(isLoading || githubLoading) && (
        <div class="code-loading">
          <div class="code-spinner"></div>
          <span>Loading content...</span>
        </div>
      )}

      {(error || githubError) && (
        <div class="code-error">
          <span class="code-error-icon">⚠️</span>
          <span>{error || githubError}</span>
        </div>
      )}

      {!isLoading && !githubLoading && !error && !githubError && (
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

          {/* Source type selector */}
          <div class="code-selectors">
            <div class="source-selector-container">
              <CodeSourceSelector
                selectedSource={sourceType}
                onSourceChange={handleSourceTypeChange}
              />
            </div>

            {/* Collection selectors - only show when collections mode */}
            {sourceType === "collections" && (
              <div class="selector-row">
                <div class="selector-item">
                  <CodeLanguageSelector
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={handleLanguageChange}
                  />
                </div>
                <div class="selector-item">
                  <CodeCollectionSelector
                    languageCode={selectedLanguage}
                    selectedCollectionId={selectedCollectionId}
                    onCollectionChange={handleCollectionChange}
                  />
                </div>
              </div>
            )}

            {/* GitHub URL input - only show when GitHub mode */}
            {sourceType === "github" && (
              <div class="github-input-container">
                <GitHubUrlInput
                  value={githubUrl}
                  onChange={handleGithubUrlChange}
                  onFetch={handleGithubFetch}
                  loading={githubLoading}
                  error={githubError}
                  disabled={showCompletion}
                />
              </div>
            )}
          </div>

          {/* GitHub file info */}
          {sourceType === "github" && githubFileInfo && (
            <div class="github-file-info">
              <div class="file-info-header">
                <h3 class="file-title">📁 {githubFileInfo.fileName}</h3>
                <p class="file-path">
                  <span class="repo-info">
                    {githubFileInfo.user}/{githubFileInfo.repo}
                  </span>
                  <span class="branch-info">#{githubFileInfo.branch}</span>
                </p>
              </div>
              <div class="file-stats">
                <span class="char-count">{targetText.length} characters</span>
                {githubFileInfo.fileExtension && (
                  <span class="file-type">.{githubFileInfo.fileExtension}</span>
                )}
              </div>
            </div>
          )}

          {/* Snippet selector and info - only show for collections mode */}
          {sourceType === "collections" && codeSnippets.length > 0 && (
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

          {/* Action buttons - only show for collections mode */}
          {sourceType === "collections" && (
            <div class="code-actions">
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
            </div>
          )}

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

        /* GitHub-specific styles */
        .source-selector-container {
          margin-bottom: 1rem;
        }

        .github-input-container {
          margin-top: 1rem;
        }

        .github-file-info {
          margin: 1rem 0;
          padding: 1rem;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .file-info-header {
          margin-bottom: 0.75rem;
        }

        .file-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
        }

        .file-path {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          font-family: monospace;
        }

        .repo-info {
          font-weight: 500;
          color: #374151;
        }

        .branch-info {
          margin-left: 0.5rem;
          color: #059669;
          font-weight: 500;
        }

        .file-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .char-count {
          font-weight: 500;
        }

        .file-type {
          background-color: #e5e7eb;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 500;
          color: #374151;
        }
      `}
      </style>
    </div>
  );
}
