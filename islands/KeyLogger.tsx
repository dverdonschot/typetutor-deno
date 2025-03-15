import { useState, useEffect } from 'preact/hooks';
import { TrainingChar } from "../functions/randomTrainingSet.ts";
import RenderedQuoteResult from "./RenderedQuoteResult.tsx";

interface KeyLoggerProps {
  codeableKeys: TrainingChar[];
  startTime: number;
}

interface TypingMetrics {
  charactersPerMinute: number;
  mistakes: number;
  accuracyPercentage: number;
  totalTimeSeconds: number;
  isComplete: boolean;
  backspaceCount: number;
}

const KeyLogger: React.FC<KeyLoggerProps> = ({codeableKeys}) => {
  const [typedKeys, setTypedKeys] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<TypingMetrics>({
    charactersPerMinute: 0,
    mistakes: 0,
    accuracyPercentage: 0,
    totalTimeSeconds: 0,
    isComplete: false,
    backspaceCount: 0
  });
  const [startTime] = useState<number>(Date.now());
  const [typedCount, setTypedCount] = useState<number>(0);
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);

  useEffect(() => {
    if (typedCount === codeableKeys.length) {
      const endTime = Date.now();
      const totalTimeSeconds = (endTime - startTime) / 1000;
      const charactersPerMinute = Math.round((correctCount / totalTimeSeconds) * 60);
      const accuracyPercentage = Math.round((correctCount / codeableKeys.length) * 100);
      
      setMetrics({
        charactersPerMinute,
        mistakes: mistakeCount,
        accuracyPercentage,
        totalTimeSeconds,
        isComplete: true,
        backspaceCount
      });
    }
  }, [typedCount, correctCount, mistakeCount, backspaceCount]);

  const handleKeyPress = (event: KeyboardEvent) => {
    if (typedCount >= codeableKeys.length) return; // Prevent typing after completion
    
    const key = event.key;
    setTypedKeys((prevKeys) => [...prevKeys, key]);

    const currentChar = codeableKeys[typedCount];
    if (!currentChar) return;

    currentChar.time = Math.floor(Date.now() / 1000);

    if (key === 'Backspace') {
      if (typedCount > 0) {
        const prevChar = codeableKeys[typedCount - 1];
        prevChar.state = "none";
        prevChar.typedChar = "none";
        setTypedCount(prev => prev - 1);
        setBackspaceCount(prev => prev + 1);
        // Adjust counts when backspacing
        if (prevChar.state === "correct") {
          setCorrectCount(prev => prev - 1);
        } else if (prevChar.state === "incorrect") {
          setMistakeCount(prev => prev - 1);
        }
      }
    } else if (
      ['Control', 'Shift', 'Alt', 'Tab', 'Enter', 'Escape', 'Delete'].includes(key)
    ) {
      // do nothing for special keys
    } else {
      currentChar.typedChar = key;
      if (currentChar.char === key) {
        currentChar.state = "correct";
        setCorrectCount(prev => prev + 1);
      } else {
        currentChar.state = "incorrect";
        setMistakeCount(prev => prev + 1);
      }
      setTypedCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    globalThis.addEventListener('keydown', handleKeyPress);
    return () => {
      globalThis.removeEventListener('keydown', handleKeyPress);
    };
  }, [typedCount, correctCount, mistakeCount]); // Add dependencies

  const quoteResult = RenderedQuoteResult(codeableKeys);

  return (
    <div>
      {quoteResult}
      {metrics.isComplete && (
        <div class="mt-8 p-4 bg-tt-lightblue rounded-lg text-white">
          <h2 class="text-2xl font-bold mb-4">Typing Summary</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-lg">Speed: {metrics.charactersPerMinute} CPM</p>
              <p class="text-lg">Mistakes: {metrics.mistakes}</p>
              <p class="text-lg">Backspaces: {metrics.backspaceCount}</p>
            </div>
            <div>
              <p class="text-lg">Accuracy: {metrics.accuracyPercentage}%</p>
              <p class="text-lg">Time: {Math.round(metrics.totalTimeSeconds)}s</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyLogger;
