import { useState, useEffect } from 'preact/hooks';
import { TrainingChar } from "../functions/randomTrainingSet.ts";

interface KeyPressState {
  typedKeys: string[];
  typedCount: number;
  mistakeCount: number;
  correctCount: number;
  backspaceCount: number;
}

export function useKeyPress(codeableKeys: TrainingChar[]) {
  const [state, setState] = useState<KeyPressState>({
    typedKeys: [],
    typedCount: 0,
    mistakeCount: 0,
    correctCount: 0,
    backspaceCount: 0
  });

  const handleKeyPress = (event: KeyboardEvent) => {
    if (state.typedCount >= codeableKeys.length) return;
    
    const key = event.key;
    setState(prevState => ({
      ...prevState,
      typedKeys: [...prevState.typedKeys, key]
    }));

    const currentChar = codeableKeys[state.typedCount];
    if (!currentChar) return;

    currentChar.time = Math.floor(Date.now() / 1000);

    if (key === 'Backspace') {
      if (state.typedCount > 0) {
        const prevChar = codeableKeys[state.typedCount - 1];
        prevChar.state = "none";
        prevChar.typedChar = "none";
        setState(prevState => ({
          ...prevState,
          typedCount: prevState.typedCount - 1,
          backspaceCount: prevState.backspaceCount + 1,
          correctCount: prevChar.state === "correct" ? prevState.correctCount - 1 : prevState.correctCount,
          mistakeCount: prevChar.state === "incorrect" ? prevState.mistakeCount - 1 : prevState.mistakeCount
        }));
      }
    } else if (
      ['Control', 'Shift', 'Alt', 'Tab', 'Enter', 'Escape', 'Delete'].includes(key)
    ) {
      // do nothing for special keys
    } else {
      currentChar.typedChar = key;
      const isCorrect = currentChar.char === key;
      currentChar.state = isCorrect ? "correct" : "incorrect";
      
      setState(prevState => ({
        ...prevState,
        typedCount: prevState.typedCount + 1,
        correctCount: isCorrect ? prevState.correctCount + 1 : prevState.correctCount,
        mistakeCount: !isCorrect ? prevState.mistakeCount + 1 : prevState.mistakeCount
      }));
    }
  };

  useEffect(() => {
    globalThis.addEventListener('keydown', handleKeyPress);
    return () => {
      globalThis.removeEventListener('keydown', handleKeyPress);
    };
  }, [state.typedCount, state.correctCount, state.mistakeCount]);

  return state;
} 