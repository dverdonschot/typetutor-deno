import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { useOvertypeInput } from "../hooks/useOvertypeInput.ts";
import { useTypingMetrics } from "../hooks/useTypingMetrics.ts";
import {
  fetchOvertypeContent,
  OvertypeContentResult,
} from "../utils/overtypeContentFetcher.ts";
import OvertypeContainer from "../components/overtype/OvertypeContainer.tsx";
import GameScoreDisplayIsland from "./GameScoreDisplayIsland.tsx";
import { UserStatsManager } from "../utils/userStatsManager.ts";
import { DetailedGameResult } from "../types/userStats.ts";
import typingContentData from "../config/typingContent.ts";

export default function CodeTyperMode() {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null,
  );
  const [targetText, setTargetText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  // localStorage key for code mode
  const localStorageKey = "code_lastSelectedCodeId";

  // Filter content items to only show code content
  const relevantContentItems = typingContentData.filter((item) =>
    item.type === "code"
  );

  // Find the selected ContentItem based on ID
  const selectedContentItem = relevantContentItems.find((item) =>
    item.id === selectedContentId
  );

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
      targetText && !isLoading && !showCompletion && !error && selectedContentId
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
  }, [targetText, isLoading, showCompletion, error, selectedContentId]);

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

      // Get the programming language from the selected content item
      const programmingLanguage = selectedContentItem?.language ||
        selectedContentItem?.name?.split("-")[0]?.toLowerCase() || "unknown";

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
          source: selectedContentItem?.name || programmingLanguage,
          totalCharacters: targetText.length,
          uniqueCharacters: new Set(targetText).size,
        },
        wrongCharacters: [],
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
    selectedContentItem,
  ]);

  // Handle completion and stats tracking
  useEffect(() => {
    if (isComplete && !finishedSentRef.current) {
      const programmingLanguage = selectedContentItem?.language ||
        selectedContentItem?.name?.split("-")[0]?.toLowerCase() || "unknown";

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
  }, [isComplete, sendDetailedStats, selectedContentItem]);

  // Function to load a random item
  const loadRandomItem = useCallback(() => {
    if (relevantContentItems.length === 0) {
      console.warn("No code content items found");
      setError("No code content available.");
      setIsLoading(false);
      return;
    }

    // Reset completion state when loading random content
    setShowCompletion(false);
    setGameResult(null);
    setStartTime(null);
    finishedSentRef.current = false;

    const randomIndex = Math.floor(Math.random() * relevantContentItems.length);
    const randomId = relevantContentItems[randomIndex].id;
    setSelectedContentId(randomId);
    localStorage.setItem(localStorageKey, randomId);
  }, [relevantContentItems, localStorageKey]);

  // Effect for initial load logic
  useEffect(() => {
    if (initialLoadComplete) return;

    // Ensure completely clean initial state
    setShowCompletion(false);
    setGameResult(null);
    setStartTime(null);
    finishedSentRef.current = false;

    const lastSelectedId = localStorage.getItem(localStorageKey);

    if (
      lastSelectedId &&
      relevantContentItems.some((item) => item.id === lastSelectedId)
    ) {
      setSelectedContentId(lastSelectedId);
    } else {
      loadRandomItem();
    }

    setInitialLoadComplete(true);
  }, [initialLoadComplete, localStorageKey, loadRandomItem]);

  // Fetch content when selectedContentId changes
  useEffect(() => {
    if (!selectedContentItem) {
      setTargetText("");
      setError(null);
      setIsLoading(false);
      return;
    }

    const loadContent = async () => {
      setIsLoading(true);
      setError(null);
      setTargetText("");
      setShowCompletion(false);
      setGameResult(null);
      setStartTime(null);
      finishedSentRef.current = false;

      const result: OvertypeContentResult = await fetchOvertypeContent(
        selectedContentItem.sourceUrl,
      );

      if (result.success) {
        setTargetText(result.content);
      } else {
        setError(`Error loading content: ${result.error}`);
        setTargetText("");
      }

      setIsLoading(false);
    };

    loadContent();
  }, [selectedContentItem]);

  // Handle content selection
  const handleSelectContent = useCallback((id: string) => {
    setShowCompletion(false);
    setGameResult(null);
    setStartTime(null);
    finishedSentRef.current = false;

    setSelectedContentId(id);
    localStorage.setItem(localStorageKey, id);
  }, [localStorageKey]);

  // Handle practice again
  const handlePracticeAgain = useCallback(() => {
    resetInput();
    setShowCompletion(false);
    setGameResult(null);
    setStartTime(null);
    finishedSentRef.current = false;
  }, [resetInput]);

  // Handle next exercise (load random)
  const handleNextExercise = useCallback(() => {
    loadRandomItem();
  }, [loadRandomItem]);

  // Manual focus function for debugging
  const handleManualFocus = useCallback(() => {
    if (overtypeRef.current) {
      const textarea = overtypeRef.current.querySelector("textarea");
      if (textarea) {
        textarea.focus();
      }
    }
  }, []);

  return (
    <div class="code-mode-container" ref={containerRef}>
      <div class="code-header">
        <h2 class="code-title">Code Typing</h2>
        <p class="code-subtitle">
          Practice typing code snippets with real-time feedback
        </p>
      </div>

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

      {!isLoading && !error && targetText && (
        <>
          <div ref={overtypeRef}>
            <OvertypeContainer
              charStates={charStates}
              inputValue={inputValue}
              onInputChange={handleInputChange}
              disabled={showCompletion}
            />
          </div>

          {/* Content selector */}
          <div class="code-content-selector">
            <label class="code-label">Select Code Content:</label>
            <select
              value={selectedContentId || ""}
              onChange={(e) => handleSelectContent(e.currentTarget.value)}
              class="code-select"
              disabled={isComplete}
            >
              {relevantContentItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div class="code-actions">
            <button
              onClick={loadRandomItem}
              class="code-button code-button-random"
              type="button"
              disabled={isComplete}
            >
              Load Random
            </button>
            <button
              onClick={handleManualFocus}
              class="code-button code-button-focus"
              type="button"
            >
              Click to Focus
            </button>
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
          max-width: 800px;
          margin: 0 auto;
          padding: 1rem;
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

        .code-content-selector {
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
          background-color: #3b82f6;
          color: white;
        }

        .code-button-random:hover:not(:disabled) {
          background-color: #2563eb;
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
