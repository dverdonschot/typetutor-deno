import { TypingMetricsDisplay } from "../components/TypingMetricsDisplay.tsx";
import { TypingMetrics } from "../hooks/useTypingMetrics.ts";
import { DetailedGameResult } from "../types/userStats.ts";

interface GameScoreDisplayIslandProps {
  metrics: TypingMetrics;
  isComplete: boolean;
  onPracticeAgain?: () => void;
  onNextGame?: () => void;
  gameType?: string; // Optional: to customize messages or buttons if needed
  gameResult?: DetailedGameResult; // Game-specific data for heatmap
}

export default function GameScoreDisplayIsland(
  { metrics, isComplete, onPracticeAgain, onNextGame, gameType, gameResult }:
    GameScoreDisplayIslandProps,
) {
  if (!isComplete) {
    return null;
  }

  return (
    <div class="mt-8 space-y-6">
      {/* Game Summary */}
      <div class="p-4 bg-tt-lightblue rounded-lg text-white">
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

      {/* Character Errors Section */}
      <div class="p-4 bg-white rounded-lg shadow-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Character Errors This Game
        </h3>

        {gameResult && gameResult.wrongCharacters.length > 0
          ? (
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {gameResult.wrongCharacters.map((wrongChar) => (
                <div
                  key={wrongChar.expectedChar}
                  class="bg-red-50 border border-red-200 rounded-lg p-3 text-center"
                >
                  <div class="font-mono text-2xl mb-1">
                    {wrongChar.expectedChar === " "
                      ? "⎵"
                      : wrongChar.expectedChar}
                  </div>
                  <div class="text-sm text-red-600">
                    {wrongChar.errorCount}{" "}
                    error{wrongChar.errorCount > 1 ? "s" : ""}
                  </div>
                  <div class="text-xs text-gray-500">
                    {wrongChar.expectedChar === " "
                      ? "Space"
                      : `"${wrongChar.expectedChar}"`}
                  </div>
                </div>
              ))}
            </div>
          )
          : (
            <div class="text-center py-8 text-green-600">
              <div class="text-4xl mb-2">🎉</div>
              <p class="text-lg font-medium">
                Perfect! No character errors in this game.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
