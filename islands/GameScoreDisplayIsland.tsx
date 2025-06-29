import { TypingMetricsDisplay } from "../components/TypingMetricsDisplay.tsx";
import { TypingMetrics } from "../hooks/useTypingMetrics.ts";

interface GameScoreDisplayIslandProps {
  metrics: TypingMetrics;
  isComplete: boolean;
  onPracticeAgain?: () => void;
  onNextGame?: () => void;
  gameType?: string; // Optional: to customize messages or buttons if needed
}

export default function GameScoreDisplayIsland(
  { metrics, isComplete, onPracticeAgain, onNextGame, gameType }:
    GameScoreDisplayIslandProps,
) {
  if (!isComplete) {
    return null;
  }

  return (
    <div class="mt-8 p-4 bg-tt-lightblue rounded-lg text-white">
      {/* Use the existing TypingMetricsDisplay component */}
      <TypingMetricsDisplay metrics={metrics} />

      <div class="text-center mt-4">
        {onPracticeAgain && (
          <button
            type="button"
            onClick={onPracticeAgain}
            class="px-4 py-2 bg-tt-darkblue text-white rounded hover:bg-tt-darkblue"
          >
            Practice Again
          </button>
        )}
        {onNextGame && (
          <button
            type="button"
            onClick={onNextGame}
            class="ml-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {gameType === "quote" && metrics.isComplete &&
                metrics.totalTimeSeconds > 0
              ? "Next Quote"
              : gameType === "alphabet"
              ? "Replay"
              : gameType === "random"
              ? "Next Random"
              : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
