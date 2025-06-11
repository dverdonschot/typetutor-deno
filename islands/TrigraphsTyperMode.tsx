import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { FunctionComponent as FC } from "preact";

// Import reusable components and hooks
import ContentSelector from "../components/ContentSelector.tsx"; // Import ContentSelector
import QuoteTextDisplay from "../components/QuoteTextDisplay.tsx";
//import { TypingMetricsDisplay } from "../components/TypingMetricsDisplay.tsx";
import { useQuoteInput } from "../hooks/useQuoteInput.ts"; // Assuming this hook is adaptable
import { useTypingMetrics } from "../hooks/useTypingMetrics.ts"; // Assuming this hook is adaptable
import { Layout } from "../components/Layout.tsx"; // Import Layout component as named import
import GameScoreDisplayIsland from "./GameScoreDisplayIsland.tsx";

// Import content fetching logic
import {
  fetchAvailableTrigraphs,
  fetchTrigraphWords,
} from "../functions/contentFetcher.ts";
import { recordGameStats } from "../utils/recordGameStats.ts";

const TrigraphsTyperMode: FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrigraph, setSelectedTrigraph] = useState<string | null>(null);
  const [targetText, setTargetText] = useState<string>("");
  const [availableTrigraphs, setAvailableTrigraphs] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null); // For metrics calculation
  const hiddenInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden input
  const [currentPath, setCurrentPath] = useState(""); // State to store the current path
  const [hasCompleted, setHasCompleted] = useState(false); // New state to track if the game has been completed at least once
  const [isRandomTrigraphEnabled, setIsRandomTrigraphEnabled] = useState(() => { // Load state from local storage
    if (typeof localStorage !== "undefined") {
      const savedState = localStorage.getItem(
        "typetutor_random_trigraph_enabled",
      );
      const initialState = savedState ? JSON.parse(savedState) : true; // Default to true if no saved state
      return initialState;
    }
    console.log(
      "localStorage not available, isRandomTrigraphEnabled defaulted to true.",
    ); // Log if localStorage is not available
    return true; // Default to true if localStorage is not available
  }); // New state for random trigraph toggle
  const [wordCount, setWordCount] = useState<number>(() => { // Add state for word count, initialized from localStorage
    if (typeof localStorage !== "undefined") {
      const savedWordCount = localStorage.getItem(
        "typetutor_trigraphs_word_count",
      );
      return savedWordCount ? parseInt(savedWordCount, 10) : 20;
    }
    return 20;
  });

  // Effect to set the current path on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(globalThis.location.pathname);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  // Effect to fetch available trigraphs
  useEffect(() => {
    const loadAvailableTrigraphs = async () => {
      setIsLoading(true);
      setError(null);
      const result = await fetchAvailableTrigraphs();
      if (result.success) {
        setAvailableTrigraphs(result.content);
      } else {
        setError(`Error fetching available trigraphs: ${result.error}`);
      }
      setIsLoading(false);
    };
    loadAvailableTrigraphs();
  }, []);

  // Effect to fetch words for the selected trigraph
  useEffect(() => {
    if (!selectedTrigraph) {
      setTargetText("");
      return;
    }

    const loadTrigraphWords = async () => {
      setIsLoading(true);
      setError(null);
      setTargetText(""); // Clear previous text
      setStartTime(null); // Reset start time
      setHasCompleted(false); // Reset completion state for new trigraph

      // Fetch words using the function from contentFetcher.ts, passing the wordCount
      const result = await fetchTrigraphWords(selectedTrigraph, wordCount);

      if (result.success) {
        // Assuming the API now returns an array of words
        setTargetText(result.content.join(" ")); // Join words with space
      } else {
        setError(
          `Error loading words for "${selectedTrigraph}": ${result.error}`,
        );
        setTargetText(""); // Clear text on error
      }
      setIsLoading(false);
    };

    loadTrigraphWords();
  }, [selectedTrigraph, wordCount]); // Depend on selectedTrigraph and wordCount

  // Integrate typing logic and metrics hooks
  const {
    charStates,
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    isComplete,
    inputProps,
    resetInput,
  } = useQuoteInput(targetText); // Hook recalculates internally when targetText changes

  // Modified resetInput to potentially select a new random trigraph
  const resetInputAndMaybeRandom = useCallback(() => {
    resetInput(); // Call the original resetInput from the hook
    setHasCompleted(false); // Always reset hasCompleted when practicing again
    if (isRandomTrigraphEnabled && availableTrigraphs.length > 0) {
      // Select a new random trigraph if random mode is enabled
      const randomIndex = Math.floor(Math.random() * availableTrigraphs.length);
      setSelectedTrigraph(availableTrigraphs[randomIndex]);
      // Note: This will trigger the useEffect that fetches words for the new trigraph
    }
  }, [
    resetInput,
    isRandomTrigraphEnabled,
    availableTrigraphs,
    setHasCompleted,
  ]); // Add setHasCompleted to dependencies

  // Effect to update hasCompleted when isComplete from the hook becomes true
  useEffect(() => {
    if (isComplete) {
      setHasCompleted(true);
    }
  }, [isComplete]); // Depend on isComplete from the hook
  // Effect to send game stats when the game is completed
  useEffect(() => {
    if (hasCompleted && selectedTrigraph) {
      recordGameStats({
        gameType: "trigraphs",
        category: selectedTrigraph,
        isFinished: true,
      }).then(() => {
        console.log("Trigraphs game stats sent");
      }).catch((error) => {
        console.error("Error sending trigraphs game stats:", error);
      });
    }
  }, [hasCompleted, selectedTrigraph]); // Depend on hasCompleted and selectedTrigraph

  // Start timer on first valid input
  useEffect(() => {
    if (typedCount > 0 && startTime === null) {
      setStartTime(Date.now());
    }
  }, [typedCount, startTime]);

  // Calculate typing metrics
  const metrics = useTypingMetrics(
    charStates.map((cs) => ({
      char: cs.original,
      // Map 'current' state to 'none' for compatibility, or handle as needed
      state: cs.state === "current" ? "none" : cs.state,
      typedChar: cs.typed ?? "", // Convert null to empty string
    })),
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    startTime ?? Date.now(), // Provide a start time
  );

  const localStorageKey = "lastSelectedTrigraph"; // Local storage key for trigraphs

  // Effect for initial load logic (localStorage, default, or random)
  useEffect(() => {
    if (availableTrigraphs.length === 0) {
      // Do nothing if no trigraphs are available yet
      return;
    }

    if (isRandomTrigraphEnabled) {
      // Select a random trigraph if random mode is enabled
      const randomIndex = Math.floor(Math.random() * availableTrigraphs.length);
      setSelectedTrigraph(availableTrigraphs[randomIndex]);
      // Do NOT save to local storage in random mode
    } else {
      // Otherwise, load from local storage or default to the first trigraph
      const lastSelectedTrigraph = localStorage.getItem(localStorageKey);
      if (
        lastSelectedTrigraph &&
        availableTrigraphs.includes(lastSelectedTrigraph)
      ) {
        setSelectedTrigraph(lastSelectedTrigraph);
      } else {
        // Select the first trigraph by default if no last selection found
        setSelectedTrigraph(availableTrigraphs[0]);
      }
      // Save the selected trigraph to local storage (only when not in random mode)
      if (selectedTrigraph) { // Ensure selectedTrigraph is not null before saving
        localStorage.setItem(localStorageKey, selectedTrigraph);
      }
    }
  }, [availableTrigraphs, isRandomTrigraphEnabled]); // Depend on availableTrigraphs and isRandomTrigraphEnabled

  // Handler for trigraph selection
  const handleSelectTrigraph = (trigraph: string) => {
    setSelectedTrigraph(trigraph);
    localStorage.setItem(localStorageKey, trigraph); // Save selection to local storage
  };

  // Handler for word count change
  const handleWordCountChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newCount = parseInt(target.value, 10);
    if (!isNaN(newCount) && newCount > 0) {
      setWordCount(newCount);
      // Save the new count to localStorage
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          "typetutor_trigraphs_word_count",
          newCount.toString(),
        );
      }
    }
  };

  return (
    <Layout
      descriptionText="Practice typing common trigraphs."
      currentPath={currentPath}
    >
      {/* Wrap content in Layout component and provide props */}
      <div class="flex flex-col gap-4">
        {/* Use flex column layout with gap */}
        {isLoading && <div class="text-center">Loading...</div>}{" "}
        {/* Removed padding as it's on the container */}
        {error && (
          <div class="text-center text-red-600 bg-red-100 rounded-md">
            {/* Removed padding */}
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Combined Typing Area and Trigraph Selection */}
            <div class="w-full p-4 bg-white rounded-lg shadow">
              {/* Full width, padding, white background, rounded corners, shadow */}
              {/* Typing Area */}
              {targetText && (
                <div class="w-full">
                  {/* Make typing area full width */}
                  {/* Hidden input field to capture typing */}
                  <input
                    ref={hiddenInputRef} // Assign the ref
                    {...inputProps}
                    type="text"
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
                    class="p-4" // Remove background and border, keep padding
                  >
                    <QuoteTextDisplay charStates={charStates} />
                  </div>
                </div>
              )}

              {/* Trigraph Selection and Word Count */}
              <div class="w-full mt-4 flex flex-wrap gap-4 items-center">
                {/* Make selection area full width, add margin-top, use flexbox */}
                <div>
                  <h3 class="text-lg font-normal mb-2">Select a Trigraph:</h3>
                  {" "}
                  {/* Changed font-bold to font-normal */}
                  {availableTrigraphs.length > 0 && (
                    <ContentSelector
                      contentItems={availableTrigraphs.map((trigraph) => ({
                        id: trigraph,
                        name: trigraph,
                        sourceUrl: `/content/trigraphs/${trigraph}.txt`,
                        type: "trigraph",
                      }))} // Map trigraph strings to ContentItem structure
                      selectedId={selectedTrigraph}
                      onSelect={handleSelectTrigraph}
                      contentType="trigraph" // Specify content type
                      hideLabel // Hide the "Select Content:" label
                    />
                  )}
                </div>

                {/* Word Count Setting for Trigraphs */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Number of Words
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={wordCount}
                    onChange={handleWordCountChange}
                    class="w-20 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                {/* Random Trigraph Button */}
                <button
                  type="button"
                  onClick={() => {
                    const newState = !isRandomTrigraphEnabled;
                    setIsRandomTrigraphEnabled(newState);
                    if (typeof localStorage !== "undefined") {
                      localStorage.setItem(
                        "typetutor_random_trigraph_enabled",
                        JSON.stringify(newState),
                      );
                    }
                  }}
                  class={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isRandomTrigraphEnabled
                      ? "bg-tt-darkblue text-white hover:bg-blue-800 focus:ring-tt-darkblue"
                      : "bg-tt-lightblue text-gray-800 hover:bg-blue-300 focus:ring-tt-lightblue"
                  }`}
                >
                  {isRandomTrigraphEnabled
                    ? "Random Trigraph Enabled"
                    : "Random Trigraph Disabled"}
                </button>
              </div>
            </div>

            {/* Display Typing Metrics */}
            {/* Display Typing Metrics and Practice Again Button */}
            {/* Render GameScoreDisplayIsland */}
            <GameScoreDisplayIsland
              metrics={metrics}
              isComplete={hasCompleted}
              onPracticeAgain={resetInputAndMaybeRandom}
              // onNextGame is not needed for trigraphs unless "Next Trigraph" is implemented
            />
          </>
        )}
        {/* Effect to focus the input after initial content load */}
        {useEffect(() => {
          if (
            !isLoading && !error && targetText && hiddenInputRef.current
          ) {
            // Use a small timeout to ensure the element is focusable after render updates
            const focusTimer = setTimeout(() => {
              hiddenInputRef.current?.focus();
              console.log("Attempted to focus hidden input.");
            }, 100); // 100ms delay, adjust if needed

            return () => clearTimeout(focusTimer); // Cleanup timer
          }
        }, [isLoading, error, targetText])} {/* Dependencies */}
        {!isLoading && !error && !targetText && !selectedTrigraph && (
          <div class="text-center text-gray-500">
            {/* Removed padding */}
            Please select a trigraph to start typing.
          </div>
        )}
      </div>{" "}
      {/* Close container div */}
    </Layout> // Close Layout component
  );
};

export default TrigraphsTyperMode;
