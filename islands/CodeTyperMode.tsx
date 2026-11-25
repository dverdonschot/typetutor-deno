import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { useOvertypeInput } from "../hooks/useOvertypeInput.ts";
import { useTypingMetrics } from "../hooks/useTypingMetrics.ts";
import { useCodeContent } from "../hooks/useCodeContent.ts";
import OvertypeContainer from "../components/overtype/OvertypeContainer.tsx";
import GameScoreDisplayIsland from "./GameScoreDisplayIsland.tsx";
import { UserStatsManager } from "../utils/userStatsManager.ts";
import { DetailedGameResult } from "../types/userStats.ts";
import CodeLanguageSelector from "../components/CodeLanguageSelector.tsx";
import CodeCollectionSelector from "../components/CodeCollectionSelector.tsx";
import CodeSourceSelector from "../components/CodeSourceSelector.tsx";
import GitHubUrlInput from "../components/GitHubUrlInput.tsx";

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
  const [githubTarget, setGithubTarget] = useState<string>("");

  // Content and UI state
  const [showCompletion, setShowCompletion] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<DetailedGameResult | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Single owner of the languages → collections → snippets cascade
  // (fetching, validation, localStorage restore, abort races).
  const content = useCodeContent({
    languageKey: localStorageKeys.language,
    collectionKey: localStorageKeys.collection,
    snippetKey: localStorageKeys.snippet,
  });

  const targetText = sourceType === "github"
    ? githubTarget
    : content.currentSnippet?.code ?? "";

  const finishedSentRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const overtypeRef = useRef<HTMLDivElement>(null);
  const _hasUserInteracted = useRef(false);

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
      targetText && content.status !== "loading" && !githubLoading &&
      !showCompletion && !content.error &&
      !githubError &&
      (content.selectedCollectionId ||
        (sourceType === "github" && githubFileInfo))
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
    content.status,
    githubLoading,
    showCompletion,
    content.error,
    githubError,
    content.selectedCollectionId,
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
    setGithubTarget("");
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

      setGithubTarget(data.content);
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
        : (content.selectedLanguage || "unknown");

      // Determine source for metadata
      const source = sourceType === "github"
        ? `GitHub: ${githubFileInfo?.user}/${githubFileInfo?.repo}/${githubFileInfo?.fileName}`
        : `${content.selectedLanguageData?.name || programmingLanguage}/${
          content.selectedCollectionData?.name || "unknown"
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
    content.selectedLanguage,
    content.selectedLanguageData,
    content.selectedCollectionData,
    sourceType,
    githubFileInfo,
    getWrongCharactersArray,
  ]);

  // Handle completion and stats tracking
  useEffect(() => {
    if (isComplete && !finishedSentRef.current) {
      const programmingLanguage = content.selectedLanguage || "unknown";

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
  }, [isComplete, sendDetailedStats, content.selectedLanguage]);

  // Load initial state for source type and GitHub URL. Language, collection
  // and snippet selections are restored inside useCodeContent.
  useEffect(() => {
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
  }, []);

  // Reset game state whenever the content changes (new snippet, collection,
  // language, or a freshly fetched GitHub file).
  useEffect(() => {
    setShowCompletion(false);
    setGameResult(null);
    setStartTime(null);
    finishedSentRef.current = false;
  }, [targetText]);

  // Source type change handler
  const handleSourceTypeChange = useCallback(
    (newSourceType: "collections" | "github") => {
      setSourceType(newSourceType);
      localStorage.setItem(localStorageKeys.sourceType, newSourceType);

      // Reset content when switching source types
      setGithubTarget("");
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

  return (
    <div class="code-mode-container" ref={containerRef}>
      {((content.status === "loading" && !content.currentSnippet) ||
        githubLoading) && (
        <div class="code-loading">
          <div class="code-spinner"></div>
          <span>Loading content...</span>
        </div>
      )}

      {(content.error || githubError) && (
        <div class="code-error">
          <span class="code-error-icon">⚠️</span>
          <span>{content.error || githubError}</span>
        </div>
      )}

      {!githubLoading && !content.error && !githubError && (
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
                    languages={content.languages}
                    selectedLanguage={content.selectedLanguage}
                    onLanguageChange={content.selectLanguage}
                  />
                </div>
                <div class="selector-item">
                  <CodeCollectionSelector
                    collections={content.collections}
                    selectedCollectionId={content.selectedCollectionId}
                    onCollectionChange={content.selectCollection}
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
          {sourceType === "collections" && content.snippets.length > 0 && (
            <div class="snippet-selector">
              <label class="code-label">
                Code Snippet ({content.selectedSnippetIndex + 1} of{" "}
                {content.snippets.length}):
              </label>
              <select
                value={content.selectedSnippetIndex}
                onChange={(e) =>
                  content.selectSnippet(parseInt(e.currentTarget.value, 10))}
                class="code-select"
                disabled={isComplete}
              >
                {content.snippets.map((snippet, index) => (
                  <option key={`${snippet.title}-${index}`} value={index}>
                    {snippet.title} ({snippet.difficulty})
                  </option>
                ))}
              </select>

              {content.currentSnippet && (
                <div class="snippet-info">
                  <p class="snippet-description">
                    {content.currentSnippet.description}
                  </p>
                  {content.currentSnippet.tags.length > 0 && (
                    <p class="snippet-tags">
                      Tags: {content.currentSnippet.tags.join(", ")}
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
                onClick={content.randomSnippetInCollection}
                class="code-button code-button-random"
                type="button"
                disabled={isComplete || content.snippets.length === 0}
              >
                Random Snippet
              </button>
              <button
                onClick={content.nextSnippet}
                class="code-button code-button-next"
                type="button"
                disabled={isComplete || content.snippets.length <= 1}
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
              onNextGame={content.nextSnippet}
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
