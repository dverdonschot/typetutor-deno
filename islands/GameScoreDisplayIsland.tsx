import { useEffect, useRef, useState } from "preact/hooks";
import { TypingMetricsDisplay } from "../components/TypingMetricsDisplay.tsx";
import { TypingMetrics } from "../hooks/useTypingMetrics.ts";
import { DetailedGameResult, KeyboardHeatmapData } from "../types/userStats.ts";
import KeyboardHeatmap from "../components/KeyboardHeatmap.tsx";
import { getKeyPosition, mapCharToKeyCode } from "../utils/keyboardLayout.ts";
import { useReactiveTranslation } from "../utils/translations.ts";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

// Convert game result to keyboard heatmap data
function createGameHeatmapData(
  gameResult: DetailedGameResult,
): KeyboardHeatmapData {
  const heatmapData: KeyboardHeatmapData = {};

  // First, count total presses per key from keystroke data
  const keyPressCount = new Map<string, number>();
  gameResult.keystrokeData.forEach((keystroke) => {
    const count = keyPressCount.get(keystroke.keyCode) || 0;
    keyPressCount.set(keystroke.keyCode, count + 1);
  });

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
    const totalPresses = keyPressCount.get(keyCode) || totalErrors;

    // Create label showing both cases if applicable
    const labelParts = keyData.characters.map((char) =>
      `${char.char}: ${char.count}`
    );
    const combinedLabel = labelParts.join("\n");

    heatmapData[keyCode] = {
      keyCode,
      keyLabel: combinedLabel,
      totalPresses: totalPresses,
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
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const practiceButtonRef = useRef<HTMLButtonElement>(null);
  const t = useReactiveTranslation();

  // State to track if button has been "selected" with first Enter press
  const [isNextButtonSelected, setIsNextButtonSelected] = useState(false);
  const [isPracticeButtonSelected, setIsPracticeButtonSelected] = useState(
    false,
  );

  // Focus the primary button when component becomes visible and reset selection state
  useEffect(() => {
    if (isComplete) {
      // Reset selection states when component becomes complete
      setIsNextButtonSelected(false);
      setIsPracticeButtonSelected(false);

      // Focus Next Quote button if available, otherwise Practice Again
      const buttonToFocus = onNextGame
        ? nextButtonRef.current
        : practiceButtonRef.current;
      if (buttonToFocus) {
        setTimeout(() => {
          buttonToFocus.focus();
        }, 100);
      }
    }
  }, [isComplete, onNextGame]);

  // Handle keyboard events for two-press Enter behavior
  useEffect(() => {
    if (!isComplete) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();

        const activeElement = document.activeElement;

        // Handle Next button
        if (activeElement === nextButtonRef.current && onNextGame) {
          if (!isNextButtonSelected) {
            // First Enter: Select the button
            setIsNextButtonSelected(true);
          } else {
            // Second Enter: Trigger the action
            onNextGame();
          }
        } // Handle Practice Again button
        else if (
          activeElement === practiceButtonRef.current && onPracticeAgain
        ) {
          if (!isPracticeButtonSelected) {
            // First Enter: Select the button
            setIsPracticeButtonSelected(true);
          } else {
            // Second Enter: Trigger the action
            onPracticeAgain();
          }
        }
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isComplete,
    onNextGame,
    onPracticeAgain,
    isNextButtonSelected,
    isPracticeButtonSelected,
  ]);

  if (!isComplete) {
    return null;
  }

  return (
    <div class="mt-8 space-y-6">
      {/* Game Summary */}
      <div class="p-4 bg-tt-lightblue rounded-lg text-white">
        {/* Use the existing TypingMetricsDisplay component */}
        <TypingMetricsDisplay metrics={metrics} />

        <div class="text-center mt-4 space-x-3">
          {onNextGame && (
            <button
              ref={nextButtonRef}
              type="button"
              onClick={(e) => {
                // Allow mouse clicks to work immediately
                // Only prevent for keyboard-triggered clicks
                if (e.detail === 0) {
                  // This is a keyboard-triggered click, prevent it
                  e.preventDefault();
                } else {
                  // This is a mouse click, allow it
                  onNextGame();
                }
              }}
              class={`px-6 py-3 font-medium rounded-lg hover:bg-tt-darkblue-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tt-darkblue transition-all duration-200 transform hover:scale-105 ${
                isNextButtonSelected
                  ? "bg-tt-lightblue text-white ring-2 ring-tt-lightblue/50"
                  : "bg-tt-darkblue text-white"
              }`}
            >
              {isNextButtonSelected ? "Press Enter again" : (
                gameType === "quote" && metrics.isComplete &&
                  metrics.totalTimeSeconds > 0
                  ? t(TRANSLATION_KEYS.ACTIONS.NEXT_QUOTE)
                  : gameType === "alphabet"
                  ? t(TRANSLATION_KEYS.ACTIONS.REPLAY)
                  : gameType === "random"
                  ? t(TRANSLATION_KEYS.ACTIONS.NEXT_RANDOM)
                  : t(TRANSLATION_KEYS.ACTIONS.NEXT)
              )}
            </button>
          )}
          {onPracticeAgain && (
            <button
              ref={practiceButtonRef}
              type="button"
              onClick={(e) => {
                // Allow mouse clicks to work immediately
                // Only prevent for keyboard-triggered clicks
                if (e.detail === 0) {
                  // This is a keyboard-triggered click, prevent it
                  e.preventDefault();
                } else {
                  // This is a mouse click, allow it
                  onPracticeAgain();
                }
              }}
              class={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                isPracticeButtonSelected
                  ? "bg-tt-lightblue text-white ring-2 ring-tt-lightblue/50 focus:ring-tt-lightblue"
                  : "bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500"
              }`}
            >
              {isPracticeButtonSelected
                ? "Press Enter again"
                : t(TRANSLATION_KEYS.ACTIONS.PRACTICE_AGAIN)}
            </button>
          )}
        </div>
      </div>

      {/* Character Errors Heatmap Section */}
      <div class="p-4 bg-white rounded-lg shadow-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {t(TRANSLATION_KEYS.METRICS.CHARACTER_ERRORS_THIS_GAME)}
        </h3>

        {gameResult && gameResult.wrongCharacters.length > 0
          ? (
            <div class="space-y-4">
              <div class="flex justify-center">
                <KeyboardHeatmap
                  heatmapData={createGameHeatmapData(gameResult)}
                  colorScheme="game-errors"
                  showLabels
                  className="max-w-4xl"
                />
              </div>
              <div class="text-sm text-gray-600 text-center">
                <p>{t(TRANSLATION_KEYS.METRICS.RED_KEYS_EXPLANATION)}</p>
                <p>
                  {(() => {
                    const totalErrors = gameResult.wrongCharacters.reduce(
                      (sum, char) => sum + char.errorCount,
                      0,
                    );
                    const uniqueChars = gameResult.wrongCharacters.length;

                    if (totalErrors === uniqueChars) {
                      const charKey = totalErrors > 1
                        ? TRANSLATION_KEYS.METRICS.CHARACTERS_WITH_ERRORS
                        : TRANSLATION_KEYS.METRICS.CHARACTER_WITH_ERRORS;
                      return `${totalErrors} ${t(charKey)}`;
                    } else {
                      const charKey = uniqueChars > 1
                        ? TRANSLATION_KEYS.METRICS.CHARACTERS_WITH_ERRORS
                        : TRANSLATION_KEYS.METRICS.CHARACTER_WITH_ERRORS;
                      return `${totalErrors} ${
                        t(TRANSLATION_KEYS.METRICS.TOTAL_ERRORS_ACROSS)
                      } ${uniqueChars} ${t(charKey)}`;
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
