import { useState, useCallback } from 'preact/hooks';
import { TrainingChar } from "../functions/randomTrainingSet.ts";

interface MobileInputState {
  typedCount: number;
  mistakeCount: number;
  correctCount: number;
  backspaceCount: number;
  inputValue: string;
}

const processInput = (
  currentValue: string,
  previousValue: string,
  codeableKeys: TrainingChar[],
  currentState: MobileInputState
): MobileInputState => {
  let newTypedCount = 0;
  let newCorrectCount = 0;
  let newMistakeCount = 0;
  let newBackspaceCount = currentState.backspaceCount;

  if (currentValue.length < previousValue.length) {
      newBackspaceCount += (previousValue.length - currentValue.length);
      for (let i = currentValue.length; i < previousValue.length; i++) {
          if (codeableKeys[i]) {
              codeableKeys[i].state = "none";
              codeableKeys[i].typedChar = "none";
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
    } else if (i >= currentValue.length && targetChar.state !== "none") {
        if (targetChar.state !== 'none' && i >= currentValue.length) {
        }
    } else {
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
  };
};


export function useMobileInput(codeableKeys: TrainingChar[]) {
  const [state, setState] = useState<MobileInputState>({
    typedCount: 0,
    mistakeCount: 0,
    correctCount: 0,
    backspaceCount: 0,
    inputValue: "",
  });

  const handleInput = useCallback((event: Event) => {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;

    if (state.typedCount >= codeableKeys.length && newValue.length > state.inputValue.length) {
        target.value = state.inputValue;
        return;
    }


    setState(prevState => processInput(newValue, prevState.inputValue, codeableKeys, prevState));
  }, [codeableKeys, state.typedCount, state.inputValue]);

  const resetInput = useCallback(() => {
      setState({
          typedCount: 0,
          mistakeCount: 0,
          correctCount: 0,
          backspaceCount: 0,
          inputValue: "",
      });
      codeableKeys.forEach(key => {
          key.state = "none";
          key.typedChar = "none";
          key.time = undefined;
      });
  }, [codeableKeys]);


  return {
    ...state,
    inputProps: {
      value: state.inputValue,
      onInput: handleInput,
      autoCapitalize: "none",
      autoCorrect: "off",
      spellCheck: false,
    },
    resetInput
  };
}