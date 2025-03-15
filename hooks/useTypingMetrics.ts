import { useState, useEffect } from 'preact/hooks';
import { TrainingChar } from "../functions/randomTrainingSet.ts";

export interface TypingMetrics {
  charactersPerMinute: number;
  mistakes: number;
  accuracyPercentage: number;
  totalTimeSeconds: number;
  isComplete: boolean;
  backspaceCount: number;
}

export function useTypingMetrics(
  codeableKeys: TrainingChar[],
  typedCount: number,
  correctCount: number,
  mistakeCount: number,
  backspaceCount: number,
  startTime: number
) {
  const [metrics, setMetrics] = useState<TypingMetrics>({
    charactersPerMinute: 0,
    mistakes: 0,
    accuracyPercentage: 0,
    totalTimeSeconds: 0,
    isComplete: false,
    backspaceCount: 0
  });

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

  return metrics;
} 