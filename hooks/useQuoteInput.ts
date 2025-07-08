import { useCallback, useEffect, useState } from "preact/hooks";
import { DisplayCharState } from "../components/QuoteTextDisplay.tsx"; // Import the state interface
import {
  CharacterStats,
  GameWrongCharacterData,
  KeystrokeData,
} from "../types/userStats.ts";
import {
  getKeyLabel,
  getKeyPosition,
  mapCharToKeyCode,
} from "../utils/keyboardLayout.ts";

// Helper function to initialize character states from the target text
const initializeCharStates = (text: string): DisplayCharState[] => {
  return text.split("").map((char) => ({
    original: char,
    typed: null,
    state: "none",
  }));
};

interface QuoteInputState {
  inputValue: string;
  charStates: DisplayCharState[];
  typedCount: number;
  correctCount: number;
  mistakeCount: number;
  backspaceCount: number;
  isComplete: boolean;
  keystrokeData: KeystrokeData[];
  startTime: number | null;
  lastKeystrokeTime: number;
  wrongCharactersInGame: Map<string, GameWrongCharacterData>; // Track wrong characters per game
}

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
      console.log(`processInput called: currentValue="${currentValue}", previousValue="${previousValue}"`);
      
      const now = Date.now();
      let newBackspaceCount = state.backspaceCount;
      let newKeystrokeData = [...state.keystrokeData];
      let newStartTime = state.startTime;
      let newLastKeystrokeTime = state.lastKeystrokeTime;
      let newWrongCharactersInGame = new Map(state.wrongCharactersInGame);

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
          
          // Debug: Log every character comparison
          console.log(`Processing position ${i}: expected "${targetChar}", typed "${typedChar}", match: ${typedChar === targetChar}`);

          // Explicitly handle newline character comparison
          if (targetChar === "\n") {
            if (typedChar === "\n") {
              newStates[i].state = "correct";
              newStates[i].typed = typedChar; // Store the typed newline
            } else {
              newStates[i].state = "incorrect";
              newStates[i].typed = typedChar; // Store the incorrect typed character
            }
            
            // Always track character errors when state is incorrect for newlines too
            if (newStates[i].state === "incorrect") {
              const existing = newWrongCharactersInGame.get(targetChar);
              if (existing) {
                existing.errorCount++;
                if (!existing.positions.includes(i)) {
                  existing.positions.push(i);
                }
              } else {
                newWrongCharactersInGame.set(targetChar, {
                  expectedChar: targetChar,
                  errorCount: 1,
                  positions: [i],
                });
              }
              
              // Debug logging
              console.log(`Character error tracked (newline): expected "${targetChar}" at position ${i}, got "${typedChar}"`);
            }
          } else {
            // Existing logic for non-newline characters
            if (newStates[i].typed === null || currentLength > previousLength) {
              newStates[i].typed = typedChar;
              if (typedChar === targetChar) {
                newStates[i].state = "correct";
              } else {
                newStates[i].state = "incorrect";
              }
            }
            
            // Always track character errors when state is incorrect, regardless of the condition above
            if (newStates[i].state === "incorrect") {
              const existing = newWrongCharactersInGame.get(targetChar);
              if (existing) {
                existing.errorCount++;
                if (!existing.positions.includes(i)) {
                  existing.positions.push(i);
                }
              } else {
                newWrongCharactersInGame.set(targetChar, {
                  expectedChar: targetChar,
                  errorCount: 1,
                  positions: [i],
                });
              }
              
              // Debug logging
              console.log(`Character error tracked: expected "${targetChar}" at position ${i}, got "${typedChar}"`);
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

    state.keystrokeData.forEach((keystroke, index) => {
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
    console.log(`getWrongCharactersArray called, returning ${wrongChars.length} wrong characters:`, wrongChars);
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
