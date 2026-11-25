import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { useOvertypeInput } from "../hooks/useOvertypeInput.ts";
import { useTypingMetrics } from "../hooks/useTypingMetrics.ts";
import { useCodeContent } from "../hooks/useCodeContent.ts";
import { colorByChar } from "../functions/syntaxTokens.ts";
import OvertypeContainer from "../components/overtype/OvertypeContainer.tsx";
import GameScoreDisplayIsland from "./GameScoreDisplayIsland.tsx";
import { UserStatsManager } from "../utils/userStatsManager.ts";
import { DetailedGameResult } from "../types/userStats.ts";
import CodeDropdown from "../components/CodeDropdown.tsx";
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
  // One color per character of targetText (server-side Shiki tokens)
  const [tokenColors, setTokenColors] = useState<(string | null)[]>([]);

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
        // Never steal focus from the code menu — the user may be browsing it
        // with the keyboard. Typing focus resumes once the menu closes (the
        // content change from the commit re-arms this timer).
        if (document.querySelector('[data-code-menu][data-open="true"]')) {
          return;
        }
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

  // Syntax highlighting: fetch server-side Shiki tokens for the current text.
  useEffect(() => {
    if (!targetText) {
      setTokenColors([]);
      return;
    }
    const lang = sourceType === "github"
      ? githubFileInfo?.fileExtension || ""
      : content.selectedLanguage || "";
    if (!lang) {
      setTokenColors([]);
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch("/api/highlight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, code: targetText }),
          signal: controller.signal,
        });
        if (!response.ok) {
          setTokenColors([]);
          return;
        }
        const data = await response.json();
        if (controller.signal.aborted) return;
        setTokenColors(colorByChar(targetText.length, data.tokens ?? []));
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setTokenColors([]);
      }
    })();
    return () => controller.abort();
  }, [targetText, sourceType, githubFileInfo, content.selectedLanguage]);

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

      {!content.error && !githubError && (
        <>
          {/* Compact toolbar: all controls above the code panel */}
          <div class="code-toolbar">
            <CodeSourceSelector
              selectedSource={sourceType}
              onSourceChange={handleSourceTypeChange}
            />

            {sourceType === "collections" && (
              <>
                <CodeDropdown
                  options={content.languages.map((lang) => ({
                    value: lang.code,
                    label: `${lang.icon} ${lang.name}`,
                  }))}
                  selected={content.selectedLanguage}
                  onChange={content.selectLanguage}
                  ariaLabel="Programming language"
                  placeholder="-- Select a language --"
                />
                <CodeDropdown
                  options={content.collections.map((coll) => ({
                    value: coll.id,
                    label:
                      `${coll.name} (${coll.snippetCount} snippets) - ${coll.difficulty}`,
                  }))}
                  selected={content.selectedCollectionId}
                  onChange={content.selectCollection}
                  ariaLabel="Code collection"
                  placeholder="-- Select a code collection --"
                />
                <CodeDropdown
                  options={content.snippets.map((snippet, index) => ({
                    value: String(index),
                    label: `${index + 1}. ${snippet.title}`,
                  }))}
                  selected={String(content.selectedSnippetIndex)}
                  onChange={(value) =>
                    content.selectSnippet(parseInt(value, 10))}
                  ariaLabel="Code snippet"
                  disabled={isComplete}
                  placeholder="-- Select a snippet --"
                  className="code-dropdown-snippet"
                />
                <button
                  type="button"
                  class="code-random-button"
                  onClick={content.loadLanguageRandomSnippet}
                  disabled={isComplete}
                  aria-label="Random snippet from any collection"
                  title="Random snippet from any collection of this language"
                >
                  🎲
                </button>
              </>
            )}

            {sourceType === "github" && (
              <GitHubUrlInput
                value={githubUrl}
                onChange={handleGithubUrlChange}
                onFetch={handleGithubFetch}
                loading={githubLoading}
                error={githubError}
                disabled={showCompletion}
              />
            )}
          </div>

          {/* Caption line: what you're typing */}
          <div class="code-caption">
            {sourceType === "collections" && content.currentSnippet && (
              <>
                <span class="caption-position">
                  {content.selectedSnippetIndex + 1} of{" "}
                  {content.snippets.length}
                </span>
                <span class="caption-title">
                  {content.currentSnippet.title}
                </span>
                <span class="caption-badge">
                  {content.currentSnippet.difficulty}
                </span>
                {content.currentSnippet.tags.length > 0 && (
                  <span class="caption-tags">
                    {content.currentSnippet.tags.join(", ")}
                  </span>
                )}
                <span
                  class="caption-description"
                  title={content.currentSnippet.description}
                >
                  {content.currentSnippet.description}
                </span>
                {content.currentSnippet.tip && (
                  <span class="caption-tip" title={content.currentSnippet.tip}>
                    💡 {content.currentSnippet.tip}
                  </span>
                )}
              </>
            )}
            {sourceType === "github" && githubFileInfo && (
              <>
                <span class="caption-title">
                  📁 {githubFileInfo.fileName}
                </span>
                <span class="caption-tags">
                  {githubFileInfo.user}/{githubFileInfo.repo}
                  #{githubFileInfo.branch}
                </span>
                <span class="caption-position">
                  {targetText.length} chars
                </span>
                {githubFileInfo.fileExtension && (
                  <span class="caption-badge">
                    .{githubFileInfo.fileExtension}
                  </span>
                )}
              </>
            )}
          </div>

          {targetText && (
            <div ref={overtypeRef}>
              <OvertypeContainer
                charStates={charStates}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                disabled={showCompletion}
                tokenColors={tokenColors}
              />
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
    </div>
  );
}
