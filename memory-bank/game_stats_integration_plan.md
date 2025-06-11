# Game Stats Recording Integration Plan

This document outlines the plan to integrate and centralize the game statistics recording logic to reduce code duplication in the game mode island components.

## Problem:

Currently, the logic for sending game completion statistics to the `/api/game-stats` endpoint is duplicated in each game mode island (`QuoteTyperMode.tsx`, `TrigraphsTyperMode.tsx`, and `KeyLogger.tsx`). This leads to redundant code and makes it harder to modify the stats recording process in the future.

## Goal:

Centralize the game statistics recording logic into a single reusable function or hook that can be called by all game mode islands.

## Proposed Solution:

1.  **Create a Shared Utility for Stats Recording:**
    *   Create a new file, possibly in the `utils` directory (e.g., `utils/recordGameStats.ts`), or a custom hook in the `hooks` directory (e.g., `hooks/useGameStatsRecorder.ts`). A simple function might be sufficient if no complex state or lifecycle management is needed within the recording logic itself. Let's propose a simple function for now, as the recording is a single action on game completion.
    *   This function (e.g., `recordGameStats`) will accept parameters like `gameType: string`, `category?: string`, and `isFinished: boolean`.
    *   Inside this function, implement the `fetch` call to the `/api/game-stats` endpoint with the provided data. Include basic error handling.

    ```typescript
    // Example: utils/recordGameStats.ts
    interface GameStatsPayload {
      gameType: string;
      category?: string;
      isFinished: boolean;
    }

    export async function recordGameStats(payload: GameStatsPayload): Promise<void> {
      try {
        const response = await fetch("/api/game-stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          console.error(
            "Failed to record game stats:",
            response.status,
            response.statusText,
          );
          // Optionally, parse and log the error response body
          const errorData = await response.json();
          console.error("Error details:", errorData);
        } else {
          const data = await response.json();
          console.log("Game stats recorded successfully:", data);
        }
      } catch (error) {
        console.error("Error sending game stats:", error);
      }
    }
    ```

2.  **Refactor Game Mode Islands:**
    *   In `islands/QuoteTyperMode.tsx`, `islands/TrigraphsTyperMode.tsx`, and `islands/KeyLogger.tsx`:
        *   Import the new `recordGameStats` function.
        *   Replace the existing `fetch` calls within the `useEffect` hooks (that trigger on game completion) with a call to `recordGameStats`, passing the appropriate `gameType`, `category` (where applicable), and `isFinished: true`.

## Benefits:

*   **Reduced Code Duplication:** Eliminates the repetitive `fetch` logic in multiple island components.
*   **Improved Maintainability:** Changes to the stats recording process only need to be made in one place.
*   **Increased Consistency:** Ensures that stats are recorded consistently across all game modes.
*   **Cleaner Code:** Makes the island components more focused on their core game logic.

## Considerations:

*   The `/stats` page display logic (`islands/StatsPage.tsx`) is currently distinct and does not appear to have significant duplication with the real-time metrics display, so no integration is proposed for the display at this time.
*   Error handling in the `recordGameStats` function can be further refined if needed (e.g., retries, user feedback).

This plan focuses on the immediate goal of centralizing the stats recording logic. Further integration of stats display components could be considered in the future if duplication arises or a need for a more unified display across different parts of the application is identified.