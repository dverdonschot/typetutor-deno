import { useCallback, useEffect, useState } from "preact/hooks";
import { DisplayCharState } from "../components/QuoteTextDisplay.tsx"; // Import the state interface
import {
  CharacterStats,
  GameWrongCharacterData,
  KeystrokeData,
} from "../types/userStats.ts";
import {
  getKeyLabel as _getKeyLabel,
  getKeyPosition,
  mapCharToKeyCode,
} from "../utils/keyboardLayout.ts";

/**
 * Helper function to initialize character states from the target text
 *
 * Creates an array of DisplayCharState objects for each character in the text.
 * Used to track the visual state (correct/incorrect/current) of each character.
 */
const initializeCharStates = (text: string): DisplayCharState[] => {
  return text.split("").map((char) => ({
    original: char,
    typed: null,
    state: "none",
  }));
};

/**
 * Internal state interface for the useQuoteInput hook
 *
 * This interface tracks all user data during a typing session:
 * - Visual character states for rendering
 * - Performance metrics (counts, timing)
 * - Detailed keystroke data for analysis
 * - Error tracking for keyboard heatmap generation
 */
interface QuoteInputState {
  inputValue: string; // Current user input
  charStates: DisplayCharState[]; // Visual state of each character
  typedCount: number; // Number of characters typed
  correctCount: number; // Number of correct characters
  mistakeCount: number; // Number of mistakes made
  backspaceCount: number; // Number of backspaces used
  isComplete: boolean; // Whether typing is finished
  keystrokeData: KeystrokeData[]; // Detailed data for every keystroke
  startTime: number | null; // When typing started (null if not started)
  lastKeystrokeTime: number; // Timestamp of last keystroke
  wrongCharactersInGame: Map<string, GameWrongCharacterData>; // Error tracking by character
}

/**
 * Custom hook for managing typing input and user data collection
 *
 * This hook is the core of TypeTutor's data collection system. It:
 * 1. Tracks every keystroke with timing and accuracy data
 * 2. Maintains visual state for character-by-character feedback
 * 3. Collects detailed error information for keyboard heatmaps
 * 4. Calculates real-time performance metrics
 *
 * Data Collection:
 * - Every key press is logged with timestamp and position data
 * - Errors are tracked by character and position for analysis
 * - Backspace usage is monitored for typing pattern insights
 *
 * Usage: Called by typing components (CodeTyperMode, TrigraphsTyperMode, NewQuoteTyperMode, etc.)
 * Output: Provides game result data to UserStatsManager when complete
 *
 * @param targetText The text the user should type
 * @returns Object with input handlers, state, and performance data
 */
export function useQuoteInput(targetText: string) {
  const [state, setState] = useState<QuoteInputState>(() => {
    const initialStates = initializeCharStates(targetText);
    if (initialStates.length > 0) {
      initialStates[0].state = "current"; // Set initial cursor position
    }
    return {
      inputValue: "",
      charStates: initialStates,
      typedCount: 0,
      correctCount: 0,
      mistakeCount: 0,
      backspaceCount: 0,
      isComplete: false,
      keystrokeData: [],
      startTime: null,
      lastKeystrokeTime: 0,
      wrongCharactersInGame: new Map(),
    };
  });

  // Recalculate state when targetText changes (e.g., new quote loaded)
  useEffect(() => {
    const initialStates = initializeCharStates(targetText);
    if (initialStates.length > 0) {
      initialStates[0].state = "current"; // Set initial cursor position
    }
    setState({
      inputValue: "",
      charStates: initialStates,
      typedCount: 0,
      correctCount: 0,
      mistakeCount: 0,
      backspaceCount: 0,
      isComplete: false,
      keystrokeData: [],
      startTime: null,
      lastKeystrokeTime: 0,
      wrongCharactersInGame: new Map(),
    });
  }, [targetText]); // Dependency array ensures this runs when targetText changes

  // Function to record keystroke data
  const recordKeystroke = useCallback((
    key: string,
    correct: boolean,
    expectedChar: string,
    timestamp: number,
    lastKeystrokeTime: number,
  ): KeystrokeData => {
    const keyCode = mapCharToKeyCode(key);
    const position = getKeyPosition(keyCode) || { row: -1, col: -1 };

    return {
      key,
      keyCode,
      timestamp,
      correct,
      expectedChar,
      actualChar: key,
      timeSinceLastKey: lastKeystrokeTime > 0
        ? timestamp - lastKeystrokeTime
        : 0,
      position,
    };
  }, []);

  const processInput = useCallback(
    (
      currentValue: string,
      previousValue: string,
      currentStates: DisplayCharState[],
    ): QuoteInputState => {
      const now = Date.now();
      let newBackspaceCount = state.backspaceCount;
      const newKeystrokeData = [...state.keystrokeData];
      let newStartTime = state.startTime;
      let newLastKeystrokeTime = state.lastKeystrokeTime;
      const newWrongCharactersInGame = new Map(state.wrongCharactersInGame);

      // Set start time on first keystroke
      if (newStartTime === null && currentValue.length > 0) {
        newStartTime = now;
      }

      const newStates = [...currentStates]; // Create a mutable copy
      const currentLength = currentValue.length;
      const previousLength = previousValue.length;
      const targetLength = targetText.length;

      // --- Handle Backspaces ---
      if (currentLength < previousLength) {
        newBackspaceCount += previousLength - currentLength;
        // Reset states for characters that were backspaced over
        // Note: We don't remove errors from wrongCharactersInGame to match useMobileInput behavior
        for (let i = currentLength; i < previousLength; i++) {
          if (newStates[i]) {
            newStates[i].state = "none";
            newStates[i].typed = null;
          }
        }
      }

      // --- Process Current Input ---
      let newCorrectCount = 0;
      let newMistakeCount = 0;
      let _typedIndex = -1; // Index of the last character processed

      // Record keystrokes for new characters typed
      if (currentLength > previousLength) {
        for (let i = previousLength; i < currentLength; i++) {
          const typedChar = currentValue[i];
          const expectedChar = i < targetLength ? targetText[i] : "";
          const correct = typedChar === expectedChar;

          const keystroke = recordKeystroke(
            typedChar,
            correct,
            expectedChar,
            now,
            newLastKeystrokeTime,
          );

          newKeystrokeData.push(keystroke);
          newLastKeystrokeTime = now;

          // Character error tracking moved to second loop for accuracy
        }
      }

      for (let i = 0; i < targetLength; i++) {
        const targetChar = targetText[i];
        // Reset 'current' state before potentially setting it again
        if (newStates[i].state === "current") {
          newStates[i].state = "none"; // Reset previous current marker
        }

        if (i < currentLength) {
          const typedChar = currentValue[i];
          _typedIndex = i; // Update last processed index

          // Explicitly handle newline character comparison
          if (targetChar === "\n") {
            const isCorrect = typedChar === "\n";
            if (isCorrect) {
              newStates[i].state = "correct";
              newStates[i].typed = typedChar; // Store the typed newline
            } else {
              newStates[i].state = "incorrect";
              newStates[i].typed = typedChar; // Store the incorrect typed character
            }

            // Track error based on correctness, like useMobileInput does
            if (!isCorrect) {
              const existing = newWrongCharactersInGame.get(targetChar);
              if (existing) {
                // Only increment if this position hasn't been tracked yet
                if (!existing.positions.includes(i)) {
                  existing.errorCount++;
                  existing.positions.push(i);
                }
              } else {
                newWrongCharactersInGame.set(targetChar, {
                  expectedChar: targetChar,
                  errorCount: 1,
                  positions: [i],
                });
              }
            }
          } else {
            // Existing logic for non-newline characters
            if (newStates[i].typed === null || currentLength > previousLength) {
              newStates[i].typed = typedChar;
              const isCorrect = typedChar === targetChar;
              if (isCorrect) {
                newStates[i].state = "correct";
              } else {
                newStates[i].state = "incorrect";
              }

              // Track error based on correctness, like useMobileInput does
              if (!isCorrect) {
                const existing = newWrongCharactersInGame.get(targetChar);
                if (existing) {
                  // Only increment if this position hasn't been tracked yet
                  if (!existing.positions.includes(i)) {
                    existing.errorCount++;
                    existing.positions.push(i);
                  }
                } else {
                  newWrongCharactersInGame.set(targetChar, {
                    expectedChar: targetChar,
                    errorCount: 1,
                    positions: [i],
                  });
                }
              }
            }
          }

          // Recalculate counts based on current state up to typedIndex
          if (newStates[i].state === "correct") newCorrectCount++;
          if (newStates[i].state === "incorrect") newMistakeCount++;
        } else if (i === currentLength) {
          // This is the next character to be typed, mark as 'current'
          newStates[i].state = "current";
          newStates[i].typed = null; // Ensure typed is null if cursor is here
        } else {
          // Characters beyond the cursor that might have been typed previously but now aren't
          // Ensure they are reset if they weren't already handled by backspace logic
          if (newStates[i].state !== "none") {
            // This case should ideally be covered by backspace logic,
            // but as a safeguard, reset if needed.
            // newStates[i].state = 'none';
            // newStates[i].typed = null;
          }
        }
      }

      // If typed full length, remove 'current' marker from last char if it exists
      if (
        currentLength === targetLength &&
        newStates[targetLength - 1]?.state === "current"
      ) {
        // No 'current' needed if text is fully typed. State is correct/incorrect.
        // Re-evaluate the last character's state based on input
        const lastTypedChar = currentValue[targetLength - 1];
        const lastTargetChar = targetText[targetLength - 1];
        newStates[targetLength - 1].state = lastTypedChar === lastTargetChar
          ? "correct"
          : "incorrect";
      } else if (currentLength < targetLength && newStates[currentLength]) {
        // Ensure the character *at* the current input length is marked current
        newStates[currentLength].state = "current";
      }

      const newTypedCount = currentLength;
      const isComplete = newTypedCount === targetLength;

      // If complete, remove the 'current' marker from the character after the last one if it exists
      if (
        isComplete && newStates[targetLength] &&
        newStates[targetLength].state === "current"
      ) {
        newStates[targetLength].state = "none";
      }

      return {
        inputValue: currentValue,
        charStates: newStates,
        typedCount: Math.min(newTypedCount, targetLength), // Cannot type more than target length
        correctCount: newCorrectCount,
        mistakeCount: newMistakeCount,
        backspaceCount: newBackspaceCount,
        isComplete: isComplete,
        keystrokeData: newKeystrokeData,
        startTime: newStartTime,
        lastKeystrokeTime: newLastKeystrokeTime,
        wrongCharactersInGame: newWrongCharactersInGame,
      };
    },
    [
      targetText,
      state.backspaceCount,
      state.keystrokeData,
      state.startTime,
      state.lastKeystrokeTime,
      state.wrongCharactersInGame,
      recordKeystroke,
    ],
  ); // Include dependencies

  const handleInput = useCallback((event: Event) => {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;

    // Prevent further input if target text length is reached? Optional.
    // if (newValue.length > targetText.length) {
    //   target.value = state.inputValue; // Revert to previous value
    //   return;
    // }

    setState((prevState) =>
      processInput(newValue, prevState.inputValue, prevState.charStates)
    );
  }, [processInput, targetText.length]); // Add targetText.length if using the length check above

  const resetInput = useCallback(() => {
    const initialStates = initializeCharStates(targetText);
    if (initialStates.length > 0) {
      initialStates[0].state = "current"; // Set initial cursor position
    }
    setState({
      inputValue: "",
      charStates: initialStates,
      typedCount: 0,
      correctCount: 0,
      mistakeCount: 0,
      backspaceCount: 0,
      isComplete: false,
      keystrokeData: [],
      startTime: null,
      lastKeystrokeTime: 0,
      wrongCharactersInGame: new Map(),
    });
  }, [targetText]);

  // Function to get character-level statistics
  const getCharacterStats = useCallback((): Record<string, CharacterStats> => {
    const charStats: Record<string, CharacterStats> = {};

    state.keystrokeData.forEach((keystroke, _index) => {
      const char = keystroke.expectedChar;
      if (!charStats[char]) {
        charStats[char] = {
          attempts: 0,
          errors: 0,
          avgTimeBetweenKeys: 0,
        };
      }

      charStats[char].attempts++;
      if (!keystroke.correct) {
        charStats[char].errors++;
      }

      // Calculate average time between keys
      if (keystroke.timeSinceLastKey > 0) {
        charStats[char].avgTimeBetweenKeys =
          (charStats[char].avgTimeBetweenKeys * (charStats[char].attempts - 1) +
            keystroke.timeSinceLastKey) /
          charStats[char].attempts;
      }
    });

    return charStats;
  }, [state.keystrokeData]);

  // Get wrong characters array from Map
  const getWrongCharactersArray = useCallback((): GameWrongCharacterData[] => {
    const wrongChars = Array.from(state.wrongCharactersInGame.values());
    return wrongChars;
  }, [state.wrongCharactersInGame]);

  return {
    inputValue: state.inputValue,
    charStates: state.charStates,
    typedCount: state.typedCount,
    correctCount: state.correctCount,
    mistakeCount: state.mistakeCount,
    backspaceCount: state.backspaceCount,
    isComplete: state.isComplete,
    keystrokeData: state.keystrokeData,
    startTime: state.startTime,
    getCharacterStats,
    getWrongCharactersArray,
    inputProps: {
      value: state.inputValue,
      onInput: handleInput,
      autoCapitalize: "none",
      autoCorrect: "off",
      spellCheck: false,
      // Consider adding maxLength={targetText.length} if strict length limit is desired
    } as const,
    resetInput,
  };
}
