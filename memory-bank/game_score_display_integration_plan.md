# Game Score Display Island Integration Plan

This document outlines the plan to integrate the new `GameScoreDisplayIsland.tsx` component into the existing game mode islands to provide a common display for typing game scores.

## Designed Island: `islands/GameScoreDisplayIsland.tsx`

This island will be responsible for rendering the typing metrics and providing options to the user after a game is completed.

```typescript
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
  { metrics, isComplete, onPracticeAgain, onNextGame, gameType }: GameScoreDisplayIslandProps,
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
            onClick={onPracticeAgain}
            class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Practice Again
          </button>
        )}
        {onNextGame && (
          <button
            onClick={onNextGame}
            class="ml-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {gameType === "quote" && metrics.isComplete && metrics.totalTimeSeconds > 0 ? "Next Quote" : "Next Random"}
          </button>
        )}
      </div>
    </div>
  );
}
```

## Integration Steps:

To integrate `GameScoreDisplayIsland`, the following changes are needed in the existing files:

1.  **`islands/QuoteTyperMode.tsx`**:
    *   Remove the existing game completion message and the "Practice Again" and "Next Random" buttons currently rendered when `isComplete` is true.
    *   Import `GameScoreDisplayIsland`.
    *   Render `GameScoreDisplayIsland`, passing the calculated `metrics`, the `isComplete` state, the `resetInput` function as `onPracticeAgain`, and the `loadRandomItem` function as `onNextGame`. Also pass `gameType="quote"`.

2.  **`islands/TrigraphsTyperMode.tsx`**:
    *   Remove the existing game completion message and the "Practice Again" button currently rendered when `hasCompleted` is true.
    *   Import `GameScoreDisplayIsland`.
    *   Render `GameScoreDisplayIsland`, passing the calculated `metrics`, the `hasCompleted` state as `isComplete`, and the `resetInputAndMaybeRandom` function as `onPracticeAgain`. `onNextGame` might not be needed here unless a "Next Trigraph" functionality is desired, in which case `resetInputAndMaybeRandom` could potentially be used for both.

3.  **`islands/KeyLogger.tsx`**:
    *   This island currently handles the typing logic and likely calculates the metrics and determines completion for the Random mode.
    *   Modify `KeyLogger` to calculate and expose the `metrics` and `isComplete` state.
    *   Modify `KeyLogger` to accept callback props for `onPracticeAgain` and `onNextGame` from its parent (`RandomSettings`).
    *   Inside `KeyLogger`, render `GameScoreDisplayIsland`, passing the calculated `metrics`, the `isComplete` state, and the received `onPracticeAgain` and `onNextGame` callbacks. Also pass `gameType="random"`.

4.  **`islands/RandomSettings.tsx`**:
    *   Modify `RandomSettings` to pass the necessary callbacks (which would trigger regenerating the training set) to the `KeyLogger` island as `onPracticeAgain` and `onNextGame`.

This plan outlines the architectural changes to introduce a common component for displaying game scores, reducing code duplication and simplifying the structure of the game mode islands.