import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import typingContentData from "../config/typingContent.ts"; // Import the actual data
import ContentSelector from "../components/ContentSelector.tsx";
import QuoteTextDisplay from "../components/QuoteTextDisplay.tsx";
import {
  fetchContentFromUrl,
  FetchResult,
} from "../functions/contentFetcher.ts";
import { useQuoteInput } from "../hooks/useQuoteInput.ts";
import { useTypingMetrics } from "../hooks/useTypingMetrics.ts"; // Assuming this exists and is compatible
//import { TypingMetricsDisplay } from "../components/TypingMetricsDisplay.tsx"; // Assuming this exists
import GameScoreDisplayIsland from "./GameScoreDisplayIsland.tsx";
import { UserStatsManager } from "../utils/userStatsManager.ts";
import { DetailedGameResult } from "../types/userStats.ts";

interface QuoteTyperModeProps {
  contentType?: "quote" | "code"; // Accept contentType prop
}

export default function QuoteTyperMode(
  { contentType }: QuoteTyperModeProps,
) { // Accept contentType
  // Helper function to shuffle an array (Fisher-Yates shuffle)
  function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array]; // Create a copy
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null,
  );
  const [targetText, setTargetText] = useState<string>(""); // The text for the current typing task (single quote or code block)
  const [allQuotes, setAllQuotes] = useState<string[]>([]); // Array of quotes if the content type is 'quote'
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0); // Index of the current quote being typed
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading initially
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null); // For metrics calculation
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(
    false,
  ); // Track initial load
  const [gameResult, setGameResult] = useState<DetailedGameResult | null>(null); // Store game result
  const hiddenInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden input

  // Determine the localStorage key based on content type
  const localStorageKey = contentType === "code"
    ? "lastSelectedCodeId"
    : "lastSelectedQuoteId";

  // Filter content items based on the current contentType
  const relevantContentItems = typingContentData.filter((item) =>
    !contentType || item.type === contentType
  );

  // Find the selected ContentItem based on ID
  const selectedContentItem = relevantContentItems.find((item) =>
    item.id === selectedContentId
  );

  // Fetch content when selectedContentId changes
  useEffect(() => {
    if (!selectedContentItem) {
      setTargetText(""); // Clear text if nothing is selected
      setAllQuotes([]); // Clear quotes
      setCurrentQuoteIndex(0); // Reset index
      setError(null);
      setIsLoading(false);
      return;
    }

    const loadContent = async () => {
      setIsLoading(true);
      setError(null);
      setTargetText(""); // Clear previous text
      setAllQuotes([]); // Clear previous quotes
      setCurrentQuoteIndex(0); // Reset index
      setStartTime(null); // Reset start time

      const result: FetchResult = await fetchContentFromUrl(
        selectedContentItem.sourceUrl,
      );

      if (result.success) {
        if (selectedContentItem.type === "quote") {
          // Split fetched content into individual quotes by newline
          let quotes = result.content.split("\n").filter((quote) =>
            quote.trim() !== ""
          ); // Filter out empty lines

          // Shuffle the quotes if there are any
          if (quotes.length > 0) {
            quotes = shuffleArray(quotes);
          }

          setAllQuotes(quotes);
          setCurrentQuoteIndex(0);
          setTargetText(quotes[0] || ""); // Set the first (now random) quote as the target text
        } else {
          // For code or other types, the entire content is the target text
          setTargetText(result.content);
          setAllQuotes([]); // Ensure quotes array is empty for non-quote types
        }
        // Reset input hook state implicitly via useQuoteInput's useEffect dependency on targetText
      } else {
        setError(`Error loading content: ${result.error}`);
        setTargetText(""); // Ensure text is cleared on error
        setAllQuotes([]); // Ensure quotes array is empty on error
      }
      setIsLoading(false);
    };

    loadContent();
  }, [selectedContentItem]); // Depend on the derived item object

  // Function to load a new random item (memoized with useCallback)
  const loadRandomItem = useCallback(() => {
    if (relevantContentItems.length === 0) {
      console.warn(`No content items found for type: ${contentType}`);
      setError(
        `No content available for the selected type (${contentType || "any"}).`,
      );
      setIsLoading(false); // Ensure loading state is off
      return; // Exit if no relevant items
    }
    const randomIndex = Math.floor(Math.random() * relevantContentItems.length);
    const randomId = relevantContentItems[randomIndex].id;
    setSelectedContentId(randomId);
    localStorage.setItem(localStorageKey, randomId); // Save random selection to the correct key
    console.log(`Loaded random ${contentType || "item"}:`, randomId);
  }, [
    relevantContentItems,
    contentType,
    localStorageKey,
    setSelectedContentId,
    setError,
    setIsLoading,
  ]); // Dependencies for useCallback

  // Effect for initial load logic (localStorage or random)
  useEffect(() => {
    if (initialLoadComplete) return; // Only run once

    const lastSelectedId = localStorage.getItem(localStorageKey);
    // Validate the ID against the *relevant* content items
    if (
      lastSelectedId &&
      relevantContentItems.some((item) => item.id === lastSelectedId)
    ) {
      // Found a valid last selection for the current content type
      setSelectedContentId(lastSelectedId);
      console.log(
        `Loaded last selected ${contentType || "item"}:`,
        lastSelectedId,
      );
    } else {
      // No valid last selection found, load random
      console.log(
        `No valid last selection found for ${
          contentType || "item"
        }, loading random.`,
      );
      loadRandomItem(); // This will now load a random item of the correct type
    }
    setInitialLoadComplete(true); // Mark initial load as done
    // setIsLoading(false); // Loading state is handled by the content fetch effect
  }, [initialLoadComplete, contentType, localStorageKey, loadRandomItem]); // Add loadRandomItem dependency

  // Initialize the input hook with the fetched target text
  const {
    charStates,
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    isComplete, // isComplete now means the current targetText (single quote or code block) is complete
    keystrokeData,
    startTime: inputStartTime,
    getCharacterStats,
    getWrongCharactersArray,
    inputProps,
    resetInput,
  } = useQuoteInput(targetText); // Hook recalculates internally when targetText changes

  // Start timer on first valid input
  useEffect(() => {
    if (typedCount > 0 && startTime === null) {
      setStartTime(Date.now());
    }
  }, [typedCount, startTime]);

  // Calculate typing metrics
  // Note: Ensure useTypingMetrics is adapted if its input differs from the random mode
  const metrics = useTypingMetrics(
    charStates.map((cs) => ({
      char: cs.original,
      // Map 'current' state to 'none' for TrainingChar compatibility, or handle as needed
      state: cs.state === "current" ? "none" : cs.state,
      typedChar: cs.typed ?? "", // Convert null to empty string
      // time is optional in TrainingChar, not present in DisplayCharState
    })),
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    startTime ?? Date.now(), // Provide a start time
  );

  const finishedSentRef = useRef(false);

  // Function to generate a unique game ID
  const generateGameId = (): string => {
    return `game_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  // Function to send detailed stats to UserStatsManager
  const sendDetailedStats = useCallback(async () => {
    if (!inputStartTime || !isComplete) return;

    try {
      const userStatsManager = UserStatsManager.getInstance();
      await userStatsManager.initialize();

      const endTime = Date.now();
      const duration = (endTime - inputStartTime) / 1000; // Duration in seconds

      const gameResult: DetailedGameResult = {
        gameId: generateGameId(),
        userId: userStatsManager.getUserId(),
        mode: contentType === "code" ? "code" : "quotes",
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
          source: selectedContentItem?.name || "unknown",
          totalCharacters: targetText.length,
          uniqueCharacters: new Set(targetText).size,
        },
        wrongCharacters: getWrongCharactersArray(),
      };

      await userStatsManager.updateStats(gameResult);
      setGameResult(gameResult); // Store the game result for heatmap
      console.log("Detailed user stats updated successfully");
    } catch (error) {
      console.error("Failed to update detailed user stats:", error);
    }
  }, [
    inputStartTime,
    isComplete,
    contentType,
    metrics,
    mistakeCount,
    backspaceCount,
    keystrokeData,
    getCharacterStats,
    targetText,
    selectedContentItem,
  ]);

  // Effect to advance to the next quote when the current one is completed and send stats
  useEffect(() => {
    const isGameFinished = isComplete &&
      (selectedContentItem?.type !== "quote" ||
        currentQuoteIndex === allQuotes.length - 1);

    // Send finished stat for individual quote completion (if it's a quote game)
    if (
      isComplete && selectedContentItem?.type === "quote" &&
      !finishedSentRef.current
    ) {
      // Send to existing API
      fetch("/api/game-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameType: contentType,
          category: selectedContentItem?.name,
          isFinished: true,
        }), // Use name as category
      }).then((response) => response.json()).then((data) => {
        console.log("Finished quote stats sent:", data); // Keep this log for now
      }).catch((error) => {
        console.error("Error sending finished quote stats:", error);
      });

      // Send detailed stats to UserStatsManager
      sendDetailedStats();
      finishedSentRef.current = true; // Mark as sent for this quote
    }

    // Send finished game data to API (for non-quotes or the very last quote)
    if (
      isGameFinished && selectedContentItem?.type !== "quote" &&
      !finishedSentRef.current
    ) {
      // Send to existing API
      fetch("/api/game-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameType: contentType,
          category: selectedContentItem?.name,
          isFinished: true,
        }), // Use name as category
      }).then((response) => response.json()).then((data) => {
        console.log("Finished game stats sent:", data); // Keep this log for now
      }).catch((error) => {
        console.error("Error sending finished game stats:", error);
      });

      // Send detailed stats to UserStatsManager
      sendDetailedStats();
      finishedSentRef.current = true;
    }

    // Logic to advance to the next quote
    if (
      isComplete && selectedContentItem?.type === "quote" &&
      currentQuoteIndex < allQuotes.length - 1
    ) {
      const timer = setTimeout(() => {
        const nextQuoteIndex = currentQuoteIndex + 1;
        setCurrentQuoteIndex(nextQuoteIndex);
        setTargetText(allQuotes[nextQuoteIndex]);
        resetInput();
        setStartTime(Date.now());
        setGameResult(null); // Clear previous game result
        finishedSentRef.current = false;
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [
    isComplete,
    currentQuoteIndex,
    allQuotes,
    selectedContentItem,
    resetInput,
    targetText, // Add targetText to dependencies
    contentType, // Add contentType to dependencies
    sendDetailedStats, // Add sendDetailedStats to dependencies
  ]); // Dependencies

  // Handler for the ContentSelector change
  const handleSelectContent = useCallback((id: string) => {
    setSelectedContentId(id);
    localStorage.setItem(localStorageKey, id); // Save selection to the correct key
    // Resetting input state is handled by useQuoteInput's useEffect when targetText changes
    // Resetting quote index and array is handled in the fetch effect
  }, [localStorageKey]); // Add localStorageKey dependency

  // loadRandomItem function moved above the useEffect that uses it.

  // Focus hidden input on component mount or when content loads?
  // Similar logic to KeyLogger might be needed here if auto-focus is desired.
  // For now, user might need to click the area.

  // Global keydown listener to focus the hidden input on Enter key press
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const hiddenInput = document.querySelector(
        'input[aria-hidden="true"]',
      ) as HTMLInputElement;
      // Check if the pressed key is Enter and the hidden input is not already focused
      if (
        event.key === "Enter" && hiddenInput &&
        document.activeElement !== hiddenInput
      ) {
        event.preventDefault(); // Prevent default Enter key behavior (e.g., form submission, scrolling)
        hiddenInput.focus();
      }
    };

    globalThis.addEventListener("keydown", handleGlobalKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      globalThis.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Effect to focus the input after initial content load
  useEffect(() => {
    if (
      !isLoading && !error && targetText && initialLoadComplete &&
      hiddenInputRef.current
    ) {
      // Use a small timeout to ensure the element is focusable after render updates
      const focusTimer = setTimeout(() => {
        hiddenInputRef.current?.focus();
        console.log("Attempted to focus hidden input.");
      }, 100); // 100ms delay, adjust if needed

      return () => clearTimeout(focusTimer); // Cleanup timer
    }
  }, [isLoading, error, targetText, initialLoadComplete]); // Dependencies

  return (
    <>
      {/* Use a fragment to avoid an extra div */}
      {isLoading && <div class="text-center p-4">Loading content...</div>}
      {error && (
        <div class="text-center p-4 text-red-600 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {!isLoading && !error && targetText && (
        <>
          {/* Hidden input field to capture typing */}
          <input
            ref={hiddenInputRef} // Assign the ref
            {...inputProps}
            // Spread props from the hook (value, onInput, etc.)
            type="text"
            // Basic styling to hide it, but keep it accessible
            style={{
              position: "absolute",
              top: "-9999px",
              left: "-9999px",
              opacity: 0,
              pointerEvents: "none",
            }}
            aria-hidden="true" // Hide from screen readers as interaction is visual
          />

          {/* Display the text to be typed */}
          {/* Wrap display in a div to allow focusing the hidden input on click */}
          <div
            onClick={() => hiddenInputRef.current?.focus()}
            style={{ cursor: "text" }}
          >
            <QuoteTextDisplay charStates={charStates} />
          </div>

          <ContentSelector
            contentItems={relevantContentItems} // Pass only relevant items to selector
            selectedId={selectedContentId}
            onSelect={handleSelectContent}
            contentType={contentType} // Pass contentType prop
          />

          {/* Optional: Button to load a random item */}
          <div class="text-center my-4">
            {/* Adjusted margin for better spacing */}
            <button
              type="button"
              onClick={loadRandomItem}
              class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              Load Random
            </button>
          </div>

          {/* Optional: Reset button or completion message */}
          {isComplete && (
            <GameScoreDisplayIsland
              metrics={metrics}
              isComplete={isComplete}
              onPracticeAgain={resetInput}
              onNextGame={loadRandomItem}
              gameType="quote"
              gameResult={gameResult || undefined}
            />
          )}
        </>
      )}
      {!isLoading && !error && !targetText && !selectedContentId && (
        <div class="text-center p-4 text-gray-500">
          Please select content to start typing.
        </div>
      )}
    </>
  );
}
