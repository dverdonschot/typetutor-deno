import { useEffect, useState } from "preact/hooks";
import { TrainingChar } from "../functions/randomTrainingSet.ts";

export interface TypingMetrics {
  charactersPerMinute: number;
  wordsPerMinute: number; // Added WPM
  mistakes: number;
  accuracyPercentage: number;
  totalTimeSeconds: number;
  isComplete: boolean;
  backspaceCount: number;
  backspaceRatioPercent: number; // Added backspace ratio
}

export function useTypingMetrics(
  codeableKeys: TrainingChar[],
  typedCount: number,
  correctCount: number,
  mistakeCount: number,
  backspaceCount: number,
  startTime: number,
) {
  const [metrics, setMetrics] = useState<TypingMetrics>({
    charactersPerMinute: 0,
    wordsPerMinute: 0, // Added WPM
    mistakes: 0,
    accuracyPercentage: 0,
    totalTimeSeconds: 0,
    isComplete: false,
    backspaceCount: 0,
    backspaceRatioPercent: 0, // Added backspace ratio
  });

  useEffect(() => {
    if (typedCount > 0 && startTime && codeableKeys.length > 0) { // Calculate metrics if typing has started
      const endTime = Date.now();
      const totalTimeSeconds = (endTime - startTime) / 1000;

      // Prevent division by zero if totalTimeSeconds is very small or zero
      if (totalTimeSeconds > 0) {
        const charactersPerMinute = Math.round(
          (correctCount / totalTimeSeconds) * 60,
        );
        // WPM = (Keystrokes / 5) / Time in Minutes
        // Keystrokes = typedCount (includes correct and incorrect, as per standard WPM)
        // Time in Minutes = totalTimeSeconds / 60
        const wordsPerMinute = Math.round(
          (typedCount / 5) / (totalTimeSeconds / 60),
        );
        const accuracyPercentage = Math.round(
          (correctCount / typedCount) * 100,
        ); // Accuracy based on typed chars
        const backspaceRatioPercent = codeableKeys.length > 0
          ? Math.round((backspaceCount / codeableKeys.length) * 100)
          : 0;

        const isNowComplete = typedCount === codeableKeys.length;

        setMetrics({
          charactersPerMinute,
          wordsPerMinute,
          mistakes: mistakeCount,
          accuracyPercentage,
          totalTimeSeconds,
          isComplete: isNowComplete,
          backspaceCount,
          backspaceRatioPercent,
        });
      } else {
        // Handle case where time is too short to calculate, or set to 0
        const backspaceRatioPercent = codeableKeys.length > 0
          ? Math.round((backspaceCount / codeableKeys.length) * 100)
          : 0;
        setMetrics((prevMetrics) => ({
          ...prevMetrics,
          mistakes: mistakeCount,
          backspaceCount,
          backspaceRatioPercent,
          isComplete: typedCount === codeableKeys.length,
        }));
      }
    } else if (typedCount === 0) {
      // Reset metrics if input is cleared or at the beginning
      setMetrics({
        charactersPerMinute: 0,
        wordsPerMinute: 0,
        mistakes: 0,
        accuracyPercentage: 0,
        totalTimeSeconds: 0,
        isComplete: false,
        backspaceCount: 0,
        backspaceRatioPercent: 0, // Added backspace ratio
      });
    }
  }, [
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    startTime,
    codeableKeys.length,
  ]);

  return metrics;
}
