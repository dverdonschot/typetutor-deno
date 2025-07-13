import { TypingMetricsDisplay } from "../components/TypingMetricsDisplay.tsx";
import { TypingMetrics } from "../hooks/useTypingMetrics.ts";
import { DetailedGameResult, KeyboardHeatmapData } from "../types/userStats.ts";
import KeyboardHeatmap from "../components/KeyboardHeatmap.tsx";
import { getKeyPosition, mapCharToKeyCode } from "../utils/keyboardLayout.ts";

// Convert game result to keyboard heatmap data
function createGameHeatmapData(
  gameResult: DetailedGameResult,
): KeyboardHeatmapData {
  const heatmapData: KeyboardHeatmapData = {};

  // Group wrong characters by their key code (physical key)
  const keyErrorMap = new Map<string, {
    keyCode: string;
    position: { row: number; col: number };
    characters: { char: string; count: number }[];
  }>();

  // Add all the wrong characters to the grouped map
  gameResult.wrongCharacters.forEach((wrongChar) => {
    const keyCode = mapCharToKeyCode(wrongChar.expectedChar);
    const position = getKeyPosition(keyCode) || { row: 0, col: 0 };

    if (!keyErrorMap.has(keyCode)) {
      keyErrorMap.set(keyCode, {
        keyCode,
        position,
        characters: [],
      });
    }

    const keyData = keyErrorMap.get(keyCode)!;
    keyData.characters.push({
      char: wrongChar.expectedChar,
      count: wrongChar.errorCount,
    });
  });

  // Convert grouped data to heatmap format
  keyErrorMap.forEach((keyData, keyCode) => {
    const totalErrors = keyData.characters.reduce(
      (sum, char) => sum + char.count,
      0,
    );

    // Create label showing both cases if applicable
    const labelParts = keyData.characters.map((char) =>
      `${char.char}: ${char.count}`
    );
    const combinedLabel = labelParts.join("\n");

    heatmapData[keyCode] = {
      keyCode,
      keyLabel: combinedLabel,
      totalPresses: totalErrors,
      errorCount: totalErrors,
      averageSpeed: 0,
      position: keyData.position,
    };
  });

  return heatmapData;
}

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

      {/* Character Errors Heatmap Section */}
      <div class="p-4 bg-white rounded-lg shadow-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Character Errors This Game
        </h3>

        {gameResult && gameResult.wrongCharacters.length > 0
          ? (
            <div class="space-y-4">
              <div class="flex justify-center">
                <KeyboardHeatmap
                  heatmapData={createGameHeatmapData(gameResult)}
                  colorScheme="game-errors"
                  showLabels={true}
                  className="max-w-4xl"
                />
              </div>
              <div class="text-sm text-gray-600 text-center">
                <p>Red keys show characters you had trouble with this game.</p>
                <p>
                  {(() => {
                    const totalErrors = gameResult.wrongCharacters.reduce(
                      (sum, char) => sum + char.errorCount,
                      0,
                    );
                    const uniqueChars = gameResult.wrongCharacters.length;

                    if (totalErrors === uniqueChars) {
                      return `${totalErrors} character${
                        totalErrors > 1 ? "s" : ""
                      } with errors`;
                    } else {
                      return `${totalErrors} total errors across ${uniqueChars} character${
                        uniqueChars > 1 ? "s" : ""
                      }`;
                    }
                  })()}
                </p>
              </div>
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
