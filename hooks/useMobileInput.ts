import { useCallback, useState } from "preact/hooks";
import { TrainingChar } from "../functions/randomTrainingSet.ts";
import {
  CharacterStats,
  GameWrongCharacterData,
  KeystrokeData,
} from "../types/userStats.ts";
import { getKeyPosition, mapCharToKeyCode } from "../utils/keyboardLayout.ts";

interface MobileInputState {
  typedCount: number;
  mistakeCount: number;
  correctCount: number;
  backspaceCount: number;
  inputValue: string;
  keystrokeData: KeystrokeData[];
  startTime: number | null;
  lastKeystrokeTime: number;
  wrongCharactersInGame: Map<string, GameWrongCharacterData>;
}

// Function to record keystroke data
const recordKeystroke = (
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
    timeSinceLastKey: lastKeystrokeTime > 0 ? timestamp - lastKeystrokeTime : 0,
    position,
  };
};

const processInput = (
  currentValue: string,
  previousValue: string,
  codeableKeys: TrainingChar[],
  currentState: MobileInputState,
): MobileInputState => {
  const now = Date.now();
  let newTypedCount = 0;
  let newCorrectCount = 0;
  let newMistakeCount = 0;
  let newBackspaceCount = currentState.backspaceCount;
  const newKeystrokeData = [...currentState.keystrokeData];
  let newStartTime = currentState.startTime;
  let newLastKeystrokeTime = currentState.lastKeystrokeTime;
  const newWrongCharactersInGame = new Map(currentState.wrongCharactersInGame);

  // Set start time on first keystroke
  if (newStartTime === null && currentValue.length > 0) {
    newStartTime = now;
  }

  if (currentValue.length < previousValue.length) {
    newBackspaceCount += previousValue.length - currentValue.length;
    for (let i = currentValue.length; i < previousValue.length; i++) {
      if (codeableKeys[i]) {
        codeableKeys[i].state = "none";
        codeableKeys[i].typedChar = "none";
      }
    }
  }

  // Record keystrokes for new characters typed
  if (currentValue.length > previousValue.length) {
    for (let i = previousValue.length; i < currentValue.length; i++) {
      const typedChar = currentValue[i];
      const expectedChar = i < codeableKeys.length ? codeableKeys[i].char : "";
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

      // Track character errors only for newly typed characters
      if (!correct && i < codeableKeys.length) {
        const existing = newWrongCharactersInGame.get(expectedChar);
        if (existing) {
          existing.errorCount++;
          if (!existing.positions.includes(i)) {
            existing.positions.push(i);
          }
        } else {
          newWrongCharactersInGame.set(expectedChar, {
            expectedChar,
            errorCount: 1,
            positions: [i],
          });
        }
      }
    }
  }

  for (let i = 0; i < codeableKeys.length; i++) {
    const targetChar = codeableKeys[i];
    if (i < currentValue.length) {
      const typedChar = currentValue[i];
      targetChar.typedChar = typedChar;
      targetChar.time = Math.floor(Date.now() / 1000);

      if (targetChar.char === typedChar) {
        targetChar.state = "correct";
        newCorrectCount++;
      } else {
        targetChar.state = "incorrect";
        newMistakeCount++;
      }
      newTypedCount = i + 1;
    } else { // i >= currentValue.length
      targetChar.state = "none";
      targetChar.typedChar = "none";
    }
  }

  newTypedCount = Math.min(newTypedCount, codeableKeys.length);

  return {
    typedCount: newTypedCount,
    correctCount: newCorrectCount,
    mistakeCount: newMistakeCount,
    backspaceCount: newBackspaceCount,
    inputValue: currentValue,
    keystrokeData: newKeystrokeData,
    startTime: newStartTime,
    lastKeystrokeTime: newLastKeystrokeTime,
    wrongCharactersInGame: newWrongCharactersInGame,
  };
};

export function useMobileInput(codeableKeys: TrainingChar[]) {
  const [state, setState] = useState<MobileInputState>({
    typedCount: 0,
    mistakeCount: 0,
    correctCount: 0,
    backspaceCount: 0,
    inputValue: "",
    keystrokeData: [],
    startTime: null,
    lastKeystrokeTime: 0,
    wrongCharactersInGame: new Map(),
  });

  const handleInput = useCallback((event: Event) => {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;

    if (
      state.typedCount >= codeableKeys.length &&
      newValue.length > state.inputValue.length
    ) {
      target.value = state.inputValue;
      return;
    }

    setState((prevState) =>
      processInput(newValue, prevState.inputValue, codeableKeys, prevState)
    );
  }, [codeableKeys, state.typedCount, state.inputValue]);

  const resetInput = useCallback(() => {
    setState({
      typedCount: 0,
      mistakeCount: 0,
      correctCount: 0,
      backspaceCount: 0,
      inputValue: "",
      keystrokeData: [],
      startTime: null,
      lastKeystrokeTime: 0,
      wrongCharactersInGame: new Map(),
    });
    codeableKeys.forEach((key) => {
      key.state = "none";
      key.typedChar = "none";
      key.time = undefined;
    });
  }, [codeableKeys]);

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
    return Array.from(state.wrongCharactersInGame.values());
  }, [state.wrongCharactersInGame]);

  return {
    ...state,
    getCharacterStats,
    getWrongCharactersArray,
    inputProps: {
      value: state.inputValue,
      onInput: handleInput,
      autoCapitalize: "none",
      autoCorrect: "off",
      spellCheck: false,
    } as const,
    resetInput,
  };
}
