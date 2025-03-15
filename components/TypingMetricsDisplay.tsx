import { TypingMetrics } from "../hooks/useTypingMetrics.ts";

interface TypingMetricsDisplayProps {
  metrics: TypingMetrics;
}

export function TypingMetricsDisplay({ metrics }: TypingMetricsDisplayProps) {
  if (!metrics.isComplete) return null;

  return (
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
  );
} 