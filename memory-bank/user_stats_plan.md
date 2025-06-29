# User Stats Function Plan

## 1. Introduction
This document outlines the plan for a new function, `userStats`, aimed at recording and providing insights into user typing behavior across different game modes. The collected data will be stored in the browser's local storage to facilitate analysis and future visualization, such as a heatmap of incorrect key presses. ** This function will be repeatable and callable by various game modes to incrementally build user statistics.** The existing `utils/gameStats.ts` file will be used as a reference and example for implementing similar statistical tracking and data handling.

## 2. Function Name
`userStats` (or a module containing related functions)

## 3. Purpose
To track and aggregate various typing metrics for each game played by the user, offering a comprehensive overview of their performance and areas for improvement. This function will be designed to be repeatable, allowing different game modes (e.g., random, quotes, trigraphs) to contribute data to the overall user statistics.

## 4. Data Storage
All user statistics will be stored in the browser's local storage. This approach is suitable given the expected data size of a few hundred kilobytes. The data will be stored as a single JSON string under a specific key (e.g., `userTypingStats`). The structure will be designed to easily accommodate new metrics and historical data. This local storage entry will be updated incrementally with each game completion.

## 5. Data Points to Record

### 5.1 Character Wrong Counts
*   **Description**: A count of how many times each character has been typed incorrectly across all games.
*   **Structure**: A dictionary (or map) where the key is the character (e.g., 'a', 'b', '!', ' ') and the value is an integer representing the number of incorrect presses for that character. This will be cumulatively updated.
*   **Example**:
    ```json
    {
      "a": 5,
      "s": 2,
      " ": 10
    }
    ```

### 5.2 Last 10 Games Summary
*   **Description**: A summary of key performance indicators for the most recent 10 completed games.
*   **Metrics**:
    *   Average Words Per Minute (WPM)
    *   Average Characters Per Minute (CPM)
    *   Accuracy (percentage)
    *   Game Mode (e.g., 'quotes', 'trigraphs', 'code', 'alphabet')
    *   Timestamp of completion
*   **Structure**: An array of objects, each representing a game summary. The array will maintain a maximum of 10 entries, with older entries being removed as new ones are added (First-In, First-Out).
*   **Example**:
    ```json
    [
      {
        "gameId": "uuid-1",
        "wpm": 65,
        "cpm": 325,
        "accuracy": 98.5,
        "mode": "quotes",
        "timestamp": "2025-06-27T22:00:00Z"
      },
      {
        "gameId": "uuid-2",
        "wpm": 70,
        "cpm": 350,
        "accuracy": 99.0,
        "mode": "trigraphs",
        "timestamp": "2025-06-27T22:05:00Z"
      }
    ]
    ```

## 6. Functionality and Integration
The `userStats` functionality will be implemented as a module (e.g., `utils/userStats.ts`) that exposes functions to:

### 6.1 `GameResult` Interface
The `GameResult` object, passed to `updateUserStats`, will have the following structure:
```typescript
interface GameResult {
  gameId: number; // Simple incrementing counter for uniqueness within local storage
  wpm: number;
  cpm: number;
  accuracy: number;
  mode: string; // e.g., 'quotes', 'trigraphs', 'code', 'alphabet'
  timestamp: string; // ISO 8601 format (e.g., "2025-06-27T22:00:00Z")
  errors: Record<string, number>; // Key: character, Value: count of incorrect presses
}
```

### 6.2 Data Persistence and Validation
To ensure data consistency and prevent corruption when reading and writing the `userTypingStats` object to and from `localStorage`, the following strategy will be employed:
*   **Schema Definition**: Zod will be used to define the schema for the `userTypingStats` object, leveraging its TypeScript-first approach and strong type inference.
*   **Reading**: When `initializeUserStats()` reads data from `localStorage`, it will attempt to parse the JSON string. The parsed object will then be validated against the defined Zod schema. If parsing fails or validation fails, a default empty `userTypingStats` object will be returned to prevent application errors due to corrupted data.
*   **Writing**: Before writing to `localStorage`, the `userTypingStats` object will always be `JSON.stringify`'d. This ensures that only valid JSON strings are stored.

### 6.3 Functions
*   **`initializeUserStats()`**: Load existing user stats from `localStorage` (using `localStorage.getItem('userTypingStats')`). The retrieved data will be parsed and validated against a defined Zod schema. If parsing or validation fails, or if no data exists, a new `userTypingStats` object with the initial structure `{ characterWrongCounts: {}, last10GamesSummary: [], totalGamesCompleted: 0, completedGamesHistory: [] }` will be returned. This function can draw inspiration from how `utils/gameStats.ts` handles initialization and data loading.
*   **`updateUserStats(gameResult: GameResult)`**: This function will be called by each game mode upon completion. It will take a `GameResult` object as input.
    *   It will update the `characterWrongCounts` by iterating through the `errors` in `gameResult`.
    *   It will add the current game's summary to the `last10GamesSummary` array. If the array already contains 10 entries, the oldest entry will be removed (shifted from the beginning of the array) before the new entry is added to the end, maintaining a rolling window of the last 10 games.
    *   It will append the current game's detailed result to the `completedGamesHistory` array.
    *   It will increment `totalGamesCompleted`.
    *   Finally, it will persist the updated user stats back to `localStorage` (using `localStorage.setItem('userTypingStats', JSON.stringify(updatedStats))`).
*   **`getUserStats()`**: Retrieve the current user statistics from `localStorage` for display on the `/userstats` page. This function will also incorporate the validation logic to ensure the returned data is consistent.

**Crucially, each game mode (e.g., `QuoteTyperMode.tsx`, `TrigraphsTyperMode.tsx`, `RandomTyperMode.tsx`, `CodeTyperMode.tsx`, `AlphabetTyperMode.tsx`) will be responsible for calling `updateUserStats` with the relevant `GameResult` data after a game is completed. This ensures the repeatability and aggregation of data from all game types.** The implementation of `updateUserStats` can leverage patterns found in `utils/gameStats.ts` for processing and storing game-related metrics.

## 7. Page Integration
The user statistics will be displayed on a dedicated page accessible via the route `/userstats`. This page will fetch and render the JSON data in a user-friendly format using the `getUserStats()` function.

## 8. Potential Future Enhancements
*   **Heatmap Visualization**: Overlay the `characterWrongCounts` data onto a virtual keyboard layout to visually represent frequently mistyped keys.
*   **Progress Tracking**: Implement charts to show WPM/CPM trends over time.
*   **Game-specific breakdowns**: More detailed statistics for each game mode.