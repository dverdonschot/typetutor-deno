# User Data System Enhancement Plan

## 1. Introduction

This document outlines a plan to enhance the existing game statistics system by introducing client-side user data storage, a keyboard heatmap for wrongly typed characters, and server-side tracking of unique user sessions via UUIDs. The primary goal is to provide richer user feedback and analytics while maintaining a strong focus on user privacy by keeping detailed game data client-side.

## 2. Goals

*   **Register Wrong Characters:** Track each character typed incorrectly, storing a count for each character.
*   **Heatmap Display:** Visualize wrongly typed characters on a keyboard heatmap at the end of each game.
*   **Client-Side User Data Storage:** Save detailed metrics for the last 30 games in the user's browser memory. This data will include:
    *   Characters per minute (CPM)
    *   Mistakes percentage
    *   Backspace count
    *   Heatmap data (wrongly typed characters)
*   **Server-Side Unique User Tracking:** Generate a UUID for each new user session and store it server-side to compute unique users who have saved data.
*   **Unique Game ID:** Assign a unique ID to each game played, used as a key for storing game details client-side.
*   **Reusable Functionality:** Implement the system as a modular and reusable set of functions applicable to all current and future game modes (random, alphabet, trigraphs, quotes).

## 3. High-Level Architecture

The system will involve both client-side and server-side components:

*   **Client-Side:**
    *   **Data Collection:** `hooks/useTypingMetrics.ts` will be extended to collect `wronglyTypedChars` data, receiving this information from the input handling hooks.
    *   **Data Storage:** Browser's `localStorage` will be used to store the last 30 game records.
    *   **Data Display:** A new React component will render the keyboard heatmap, integrated into `islands/GameScoreDisplayIsland.tsx`.
    *   **Session Management:** Generate a UUID for each new user session that initiates a new `localStorage`(only the first time, not when a new game is finished and the `localstorage` is updated) and send it to the server under specific conditions.
*   **Server-Side:**
    *   **UUID Tracking:** The existing Deno KV setup (via `utils/gameStats.ts` and `routes/api/game-stats.ts`) will be extended to store unique session UUIDs. This will be a simple record of UUIDs, not tied to specific game data. The existing server-side game stats (finished counts for game types/categories) will continue to function independently as an additional stat for the stats page.

## 4. Detailed Plan - Client-Side (User Data & Heatmap)

### 4.1. Data Structure for Client-Side Game Records

A new interface, `UserGameData`, will define the structure for each game record stored client-side:

```typescript
// types/gameData.ts (New file)
import { z } from "https://deno.land/x/zod@v3.23.0/mod.ts";

export const UserGameDataSchema = z.object({
  gameId: z.string().uuid(), // UUID for this specific game
  timestamp: z.number(), // Unix timestamp of game completion
  gameType: z.string(), // e.g., "random", "alphabet", "quote", "trigraphs"
  charactersPerMinute: z.number(),
  wordsPerMinute: z.number(),
  mistakes: z.number(),
  accuracyPercentage: z.number(),
  backspaceCount: z.number(),
  backspaceRatioPercent: z.number(),
  wronglyTypedChars: z.record(z.string(), z.number()), // Key: character, Value: count of wrong presses
});

export type UserGameData = z.infer<typeof UserGameDataSchema>;

export const UserSessionDataSchema = z.object({
  sessionId: z.string().uuid(), // UUID for the user session
  games: z.array(UserGameDataSchema), // Array of the last 30 games
  totalGamesCompleted: z.number().default(0), // New: Total number of games completed
});

export type UserSessionData = z.infer<typeof UserSessionDataSchema>;
```

### 4.2. `wronglyTypedChars` Tracking

*   **Modification in `hooks/useQuoteInput.ts` (Primary Candidate):**
    *   The `useQuoteInput.ts` hook already tracks `charStates` which contain `original` and `typed` characters, and a `state` (`correct`, `incorrect`).
    *   To accurately capture *which specific key* was pressed incorrectly, `useQuoteInput.ts` will be modified to incorporate a `keydown` event listener. This listener will capture `event.key` for each key press.
    *   Add a new state variable, `wronglyTypedChars: Record<string, number>`, initialized as an empty object within `useQuoteInput.ts`.
    *   Modify the logic within `useQuoteInput.ts` to increment the count for the `event.key` (the character actually typed by the user) in `wronglyTypedChars` whenever a character is typed incorrectly (i.e., `event.key` does not match `charStates[index].original` and it's not a special key like Backspace). This ensures that the heatmap reflects the *incorrectly pressed key*.
    *   The `useQuoteInput.ts` hook will then return this `wronglyTypedChars` map as part of its return value.
*   **Modification in `hooks/useTypingMetrics.ts`:**
    *   Update the `TypingMetrics` interface to include `wronglyTypedChars: Record<string, number>`.
    *   Modify the `useTypingMetrics` hook to accept `wronglyTypedChars` as a new parameter and include it in the `metrics` state.
*   **Consideration for `hooks/useKeyPress.ts` and `islands/KeyLogger.tsx`:**
    *   The `useKeyPress.ts` hook is marked as deprecated. For consistency and to leverage the robust tracking capabilities of `useQuoteInput.ts`, it is recommended to refactor `islands/KeyLogger.tsx` to utilize `useQuoteInput.ts`.
    *   **Refactoring `islands/KeyLogger.tsx`:**
        1.  **Replace `useKeyPress` with `useQuoteInput`:** The `KeyLogger` component will import and use `useQuoteInput` instead of `useKeyPress`.
        2.  **Convert `codeableKeys` to `targetText`:** The `codeableKeys: TrainingChar[]` prop passed to `KeyLogger` will need to be converted into a plain string (`targetText`) to be compatible with `useQuoteInput`. This can be done by mapping `codeableKeys.map(c => c.char).join('')`.
        3.  **Hidden Input:** `KeyLogger` will need to render a hidden `<input type="text" />` element, similar to `QuoteTyperMode.tsx`, and spread the `inputProps` returned by `useQuoteInput` onto it.
        4.  **Display Rendering:** The `charStates` returned by `useQuoteInput` will be used to render the visual display of characters, replacing the current logic that iterates over `codeableKeys`.
        5.  **Reset Logic:** The `onPracticeAgain` and `onNextGame` callbacks passed to `KeyLogger` will need to trigger the `resetInput` function returned by `useQuoteInput` to clear the typing state.
        6.  **Focus Management:** Implement `useEffect` to focus the hidden input, similar to `QuoteTyperMode.tsx`.
    *   This refactoring ensures all game modes consistently provide the necessary data for the heatmap via `useQuoteInput`.

### 4.3. Client-Side Storage Mechanism

*   **Storage Choice:** `localStorage` is suitable for this purpose due to its simplicity and the relatively small data size (last 30 games).
*   **New Utility File:** Create `utils/clientGameData.ts` to manage client-side data.

    *   **`isLocalStorageAvailable(): boolean`:** A new function to check if `localStorage` is available and writable. This will involve a `try-catch` block around a dummy `localStorage.setItem` and `removeItem` operation.
    *   **`generateGameId(): string`:** A function to generate a UUID for each game.
    *   **`getOrCreateSessionId(): string`:** A function to retrieve an existing session UUID from `localStorage` or generate a new one if none exists. This function will also manage a flag in `localStorage` (e.g., `sessionSentToServer: boolean`) to prevent redundant server calls.
    *   **`saveUserGameData(gameData: UserGameData): void`:**
        *   Retrieves the current `UserSessionData` from `localStorage`.
        *   **Zod Validation:** The retrieved data will be parsed and validated against `UserSessionDataSchema` using Zod. If parsing or validation fails, a default empty `UserSessionData` object will be used to prevent application errors.
        *   **UUID Sending Logic:** Before adding the new `gameData`, check if the retrieved `UserSessionData` is empty or if the `games` array within it is empty. If so, this indicates the very first game being saved for this user session. In this case, call `getOrCreateSessionId()` to ensure a `sessionId` exists, and then send this `sessionId` to the server via the new API endpoint. After sending, set a flag in `localStorage` (e.g., `sessionSentToServer: true`) to prevent future redundant sends within the same session.
        *   Adds the new `gameData` to the `games` array.
        *   Ensures the `games` array contains only the last 30 entries (e.g., by slicing the array).
        *   Increments `totalGamesCompleted` in `UserSessionData`.
        *   Saves the updated `UserSessionData` back to `localStorage`.
        *   Includes `try-catch` blocks for robust error handling with `localStorage` operations, logging errors to the console without disrupting the user experience.
    *   **`getUserSessionData(): UserSessionData`:** Retrieves and parses the `UserSessionData` from `localStorage`. Includes `try-catch` blocks for error handling, logging errors to the console. The retrieved data will also be validated against `UserSessionDataSchema` using Zod.
    *   **Displaying Message on Stats Page:** The `islands/StatsPage.tsx` component will import `isLocalStorageAvailable()` from `utils/clientGameData.ts`. If `isLocalStorageAvailable()` returns `false`, `StatsPage.tsx` will display a user-friendly message indicating that `localStorage` is not enabled and historical stats cannot be saved, potentially with a generic instruction on how to enable it (e.g., "Please check your browser settings to enable local storage for this site.").

### 4.4. Heatmap Display Component

*   **New Component:** Create `components/KeyboardHeatmap.tsx`.
    *   This component will take `wronglyTypedChars: Record<string, number>` as a prop.
    *   It will render a visual representation of a keyboard.
    *   Each key will be colored based on the count of wrong presses for that character, using a color scale (e.g., green for 0, yellow for low, red for high).
    *   **Keyboard Layout:** For the initial implementation, a standard **QWERTY layout** will be prioritized.
    *   **Special Keys:** Special keys like Shift, Alt, Ctrl, Enter, Space, Backspace will be represented visually on the heatmap. While they are not "typed wrong" in the same way as character keys, their involvement in typing (e.g., accidental presses, or backspace usage) can be indicated. For the purpose of `wronglyTypedChars`, only actual character keys that were typed incorrectly will contribute to the heatmap's color intensity. Special keys can be displayed with a default color or a color indicating their presence but not necessarily an "incorrect" count. The `backspaceCount` metric is already available and can be displayed separately or used to color the Backspace key if desired, but it won't be part of `wronglyTypedChars`.
    *   **Visual Design & Responsiveness:** The heatmap will use a clear color gradient (e.g., shades of green to red) and aim for a clean, modern look consistent with the existing UI. It will be designed using CSS Grid or SVG with `viewBox` to ensure keys scale proportionally and the layout adapts responsively to different screen sizes.
*   **Integration:**
    *   Import `KeyboardHeatmap` into `islands/GameScoreDisplayIsland.tsx`.
    *   Pass the `wronglyTypedChars` metric (from `useTypingMetrics`) to `GameScoreDisplayIslandProps` and then to the `KeyboardHeatmap` component, displaying it when `isComplete` is true.

## 5. Detailed Plan - Server-Side (UUID Tracking)

### 5.1. UUID Generation and Initial Send

*   **Client-Side:** The `getOrCreateSessionId()` function in `utils/clientGameData.ts` will be responsible for generating a UUID if one doesn't exist in `localStorage` and managing the `sessionSentToServer` flag.
*   **Initial Server Call:** The `sessionId` should only be sent to the server if the `UserSessionData` in `localStorage` is *initially empty* (i.e., no previous game data has been saved for this user in this browser). This indicates a new user session that is about to save data for the first time. This check should occur when the `saveUserGameData` function is first called and detects an empty `games` array in `localStorage`.

### 5.2. Server-Side API Endpoint Modification

*   **New Endpoint:** Create a new API endpoint, e.g., `routes/api/session-tracker.ts`.
    *   This endpoint will have a `POST` handler to accept a `sessionId` (UUID).
    *   It will receive the `sessionId` from the client.
    *   It will then use `utils/gameStats.ts` to store this `sessionId` in Deno KV under a new key prefix (e.g., `["userSessions", sessionId]`).
    *   The server-side logic should be idempotent, meaning it can handle receiving the same UUID multiple times without creating duplicate records in Deno KV.

*   **Modification in `utils/gameStats.ts`:**
    *   Add a new function, `recordUserSession(sessionId: string): Promise<void>`.
    *   This function will use `kv.set(["userSessions", sessionId], true)` (or a timestamp) to record the unique session.
    *   It should handle potential errors during KV operations.

## 6. Integration with Games

The core logic for collecting metrics and saving data will reside in `hooks/useTypingMetrics.ts` and `utils/clientGameData.ts`.

*   **Game Completion Flow:**
    1.  In each game island component (e.g., `islands/QuoteTyperMode.tsx`, `islands/RandomSettings.tsx`, `islands/TrigraphsTyperMode.tsx`, `components/alphabet.tsx`), when a game is detected as complete (`metrics.isComplete` from `useTypingMetrics`):
    2.  Call a new orchestrating function (e.g., `handleGameCompletion` in `utils/clientGameData.ts`).
    3.  This function will:
        *   Retrieve the `sessionId` using `getOrCreateSessionId()`.
        *   Generate a `gameId` using `generateGameId()`.
        *   Construct the `UserGameData` object using the `metrics` from `useTypingMetrics` (including the new `wronglyTypedChars`).
        *   Call `saveUserGameData()` to store the data client-side. This function will also contain the logic to send the `sessionId` to the server if it's the very first game being saved for this user session.

## 7. Privacy Considerations

*   **Client-Side Data:** All detailed game performance data (CPM, mistakes, heatmap) will be stored exclusively in the user's browser. This ensures that no personally identifiable performance data leaves the user's device.
*   **Server-Side UUIDs:** Only a randomly generated, anonymous UUID is sent to the server. This UUID cannot be linked back to an individual user without additional, separate information (which is not collected). Its sole purpose is to count unique user sessions for aggregate statistics (e.g., "how many unique users played a game and saved data").

## 8. Modularity

*   **`hooks/useTypingMetrics.ts`:** Centralized metric calculation, easily integrated into any typing game.
*   **`utils/clientGameData.ts`:** Encapsulates all client-side data storage and retrieval logic, making it reusable across different game components.
*   **`components/KeyboardHeatmap.tsx`:** A standalone component for visualization, decoupled from data collection.
*   **Server API:** A clear endpoint for session UUID registration, separate from game-specific data.

This revised plan provides a clear roadmap for implementing the requested features, ensuring data privacy and system modularity, with added details on `wronglyTypedChars` tracking, UUID sending mechanism, `localStorage` error handling, and clarification on existing server-side stats.