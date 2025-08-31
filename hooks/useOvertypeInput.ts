import { useCallback, useEffect, useRef, useState } from "preact/hooks";

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

    setInputValue(value);
    previousLengthRef.current = value.length;

    // Update character states
    const newCharStates: OvertypeCharState[] = targetText.split("").map(
      (targetChar, index) => {
        const typedChar = value[index] || null;
        let state: OvertypeCharState["state"] = "none";

        if (index < value.length) {
          state = typedChar === targetChar ? "correct" : "incorrect";
        } else if (index === value.length) {
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
  const isComplete = targetText.length > 0 && 
    inputValue.length === targetText.length &&
    charStates.every((cs) => cs.state === "correct");

  // Reset function
  const resetInput = useCallback(() => {
    setInputValue("");
    setTypedCount(0);
    setCorrectCount(0);
    setMistakeCount(0);
    setBackspaceCount(0);
    setStartTime(null);
    setKeystrokeData([]);
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
  const getWrongCharactersArray = useCallback(() => {
    return keystrokeData
      .filter((keystroke) => !keystroke.correct)
      .map((keystroke) => keystroke.key);
  }, [keystrokeData]);

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
