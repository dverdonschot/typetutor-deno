import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { GameWrongCharacterData } from "../types/userStats.ts";

// Character state for overtype display
export interface OvertypeCharState {
  original: string;
  typed: string | null;
  state: "none" | "correct" | "incorrect" | "current";
}

// Keystroke data for analytics
export interface OvertypeKeystroke {
  key: string;
  timestamp: number;
  correct: boolean;
}

export interface OvertypeInputState {
  charStates: OvertypeCharState[];
  typedCount: number;
  correctCount: number;
  mistakeCount: number;
  backspaceCount: number;
  isComplete: boolean;
  startTime: number | null;
  keystrokeData: OvertypeKeystroke[];
}

export function useOvertypeInput(targetText: string) {
  const [inputValue, setInputValue] = useState("");
  const [charStates, setCharStates] = useState<OvertypeCharState[]>([]);
  const [typedCount, setTypedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [keystrokeData, setKeystrokeData] = useState<OvertypeKeystroke[]>([]);
  const [wrongCharactersInGame, setWrongCharactersInGame] = useState<
    Map<string, GameWrongCharacterData>
  >(new Map());
  const previousLengthRef = useRef(0);

  // Initialize character states when target text changes
  useEffect(() => {
    if (!targetText) {
      setCharStates([]);
      return;
    }

    const initialStates: OvertypeCharState[] = targetText.split("").map((
      char,
      index,
    ) => ({
      original: char,
      typed: null,
      state: index === 0 ? "current" : "none",
    }));

    setCharStates(initialStates);
    setInputValue("");
    setTypedCount(0);
    setCorrectCount(0);
    setMistakeCount(0);
    setBackspaceCount(0);
    setStartTime(null);
    setKeystrokeData([]);
    setWrongCharactersInGame(new Map());
    previousLengthRef.current = 0;
  }, [targetText]);

  // Handle input changes
  const handleInputChange = useCallback((value: string) => {
    if (!targetText) return;

    const currentTime = Date.now();
    const previousLength = previousLengthRef.current;
    const isBackspace = value.length < previousLength;

    // Set start time on first input
    if (value.length > 0 && !startTime) {
      setStartTime(currentTime);
    }

    // Track backspaces
    if (isBackspace) {
      setBackspaceCount((prev) => prev + 1);
    }

    // Track wrong characters BEFORE updating states (only on new input, not backspace)
    if (!isBackspace && value.length > previousLength) {
      setWrongCharactersInGame((prevWrongChars) => {
        const newWrongChars = new Map(prevWrongChars);

        // Check each newly typed character
        for (let i = previousLength; i < value.length; i++) {
          if (i < targetText.length) {
            const typedChar = value[i];
            const expectedChar = targetText[i];

            // Track error if character is wrong
            if (typedChar !== expectedChar) {
              const existing = newWrongChars.get(expectedChar);

              if (existing) {
                if (!existing.positions.includes(i)) {
                  existing.errorCount++;
                  existing.positions.push(i);
                }
              } else {
                newWrongChars.set(expectedChar, {
                  expectedChar: expectedChar,
                  errorCount: 1,
                  positions: [i],
                });
              }
            }
          }
        }

        return newWrongChars;
      });
    }

    setInputValue(value);
    previousLengthRef.current = value.length;

    // Update character states
    const newCharStates: OvertypeCharState[] = targetText.split("").map(
      (targetChar, index) => {
        const typedChar = value[index] || null;
        let state: OvertypeCharState["state"] = "none";

        if (index < value.length) {
          state = typedChar === targetChar ? "correct" : "incorrect";
        } else if (index === value.length && index < targetText.length) {
          state = "current";
        }

        return {
          original: targetChar,
          typed: typedChar,
          state,
        };
      },
    );

    setCharStates(newCharStates);

    // Calculate metrics
    const typed = value.length;
    const correct = newCharStates.slice(0, value.length).filter((cs) =>
      cs.state === "correct"
    ).length;
    const mistakes = typed - correct;

    setTypedCount(typed);
    setCorrectCount(correct);
    setMistakeCount(mistakes);

    // Record keystroke if not backspace
    if (!isBackspace && value.length > previousLength) {
      const newChar = value[value.length - 1];
      const expectedChar = targetText[value.length - 1];

      setKeystrokeData((prev) => [...prev, {
        key: newChar,
        timestamp: currentTime,
        correct: newChar === expectedChar,
      }]);
    }
  }, [targetText, startTime]);

  // Calculate completion - only complete if there's actually content to complete
  // Use length-based completion like quotes mode (allows completion with mistakes)
  const isComplete = targetText.length > 0 &&
    inputValue.length === targetText.length;

  // Debug logging for completion detection
  useEffect(() => {
    if (targetText.length > 0 && inputValue.length === targetText.length) {
      console.log("🎯 Completion check:", {
        inputLength: inputValue.length,
        targetLength: targetText.length,
        isComplete,
        wrongCharacters: wrongCharactersInGame.size,
        charStates: charStates.map((cs, i) => `${i}:${cs.state}`).join(","),
      });
    }
  }, [targetText, inputValue, charStates, isComplete, wrongCharactersInGame]);

  // Reset function
  const resetInput = useCallback(() => {
    setInputValue("");
    setTypedCount(0);
    setCorrectCount(0);
    setMistakeCount(0);
    setBackspaceCount(0);
    setStartTime(null);
    setKeystrokeData([]);
    setWrongCharactersInGame(new Map());
    previousLengthRef.current = 0;

    if (targetText) {
      const resetStates: OvertypeCharState[] = targetText.split("").map((
        char,
        index,
      ) => ({
        original: char,
        typed: null,
        state: index === 0 ? "current" : "none",
      }));
      setCharStates(resetStates);
    }
  }, [targetText]);

  // Character statistics
  const getCharacterStats = useCallback(() => {
    const stats: Record<string, { correct: number; incorrect: number }> = {};

    keystrokeData.forEach((keystroke) => {
      if (!stats[keystroke.key]) {
        stats[keystroke.key] = { correct: 0, incorrect: 0 };
      }

      if (keystroke.correct) {
        stats[keystroke.key].correct++;
      } else {
        stats[keystroke.key].incorrect++;
      }
    });

    return stats;
  }, [keystrokeData]);

  // Wrong characters array
  // Get wrong characters array (matching quotes mode)
  const getWrongCharactersArray = useCallback((): GameWrongCharacterData[] => {
    return Array.from(wrongCharactersInGame.values());
  }, [wrongCharactersInGame]);

  return {
    inputValue,
    charStates,
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    isComplete,
    startTime,
    keystrokeData,
    handleInputChange,
    resetInput,
    getCharacterStats,
    getWrongCharactersArray,
  };
}
