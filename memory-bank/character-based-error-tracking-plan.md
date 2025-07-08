# Character-Based Error Tracking Implementation Plan

## Problem Summary

The current wrong key tracking implementation is fundamentally flawed. When a
user types `@7m6h^FhG7Tujr` instead of `%7m6h%FhG7Tujr`, the system incorrectly
shows errors for keys like `ASDFGLIBN` and space, which don't even appear in the
target text.

**Root Cause**: The system tracks the "intended key" that should have been
pressed instead of tracking which expected characters were typed incorrectly.

## Solution Overview

Replace the complex key-mapping based error tracking with a simple
character-based approach:

- Track which **expected characters** were typed incorrectly
- Use a simple dictionary: `expectedChar -> errorCount`
- Aggregate this data across games for meaningful statistics

## Implementation Plan

### Phase 1: Update Type Definitions

**File**: `types/userStats.ts`

1. **Replace** the existing `GameWrongKeyData` interface:
   ```typescript
   // OLD (to be removed):
   export interface GameWrongKeyData {
     keyCode: string;
     keyLabel: string;
     expectedChar: string;
     errorCount: number;
     positions: number[];
   }

   // NEW:
   export interface GameWrongCharacterData {
     expectedChar: string; // The character that should have been typed
     errorCount: number; // How many times this character was typed wrong
     positions: number[]; // Character positions where errors occurred
   }
   ```

2. **Update** the `DetailedGameResult` interface:
   ```typescript
   export interface DetailedGameResult {
     // ... existing fields ...
     wrongCharacters: GameWrongCharacterData[]; // Changed from wrongKeys
   }
   ```

3. **Update** aggregate stats interface:
   ```typescript
   export interface UserStatsData {
     // ... existing fields ...
     characterErrorStats: Record<string, {
       totalErrors: number;
       gamesWithErrors: number;
       averageErrorsPerGame: number;
     }>;
   }
   ```

### Phase 2: Update useQuoteInput Hook

**File**: `hooks/useQuoteInput.ts`

1. **Replace** the `wrongKeysInGame` Map:
   ```typescript
   // OLD:
   wrongKeysInGame: Map<string, GameWrongKeyData>;

   // NEW:
   wrongCharactersInGame: Map<string, GameWrongCharacterData>;
   ```

2. **Update** the tracking logic in `processInput` function:
   ```typescript
   // Replace lines 156-172 with:
   if (!correct && expectedChar) {
     const existing = newWrongCharactersInGame.get(expectedChar);

     if (existing) {
       existing.errorCount++;
       existing.positions.push(i);
     } else {
       newWrongCharactersInGame.set(expectedChar, {
         expectedChar,
         errorCount: 1,
         positions: [i],
       });
     }
   }
   ```

3. **Update** the `getWrongKeysArray` function:
   ```typescript
   // Rename and update:
   const getWrongCharactersArray = useCallback((): GameWrongCharacterData[] => {
     return Array.from(state.wrongCharactersInGame.values());
   }, [state.wrongCharactersInGame]);
   ```

4. **Update** the return object:
   ```typescript
   return {
     // ... existing fields ...
     getWrongCharactersArray, // Changed from getWrongKeysArray
   };
   ```

### Phase 3: Update Game Components

**Files**: `islands/QuoteTyperMode.tsx`, `islands/TrigraphsTyperMode.tsx`

1. **Update** the destructuring from `useQuoteInput`:
   ```typescript
   const {
     // ... existing fields ...
     getWrongCharactersArray, // Changed from getWrongKeysArray
   } = useQuoteInput(targetText);
   ```

2. **Update** the `gameResult` object creation:
   ```typescript
   const gameResult: DetailedGameResult = {
     // ... existing fields ...
     wrongCharacters: getWrongCharactersArray(), // Changed from wrongKeys
   };
   ```

**File**: `islands/KeyLogger.tsx`

1. **Implement** wrong character tracking for the KeyLogger component:
   ```typescript
   // Add logic to track wrong characters based on the existing character checking
   const wrongCharacters: GameWrongCharacterData[] = [];
   // ... implementation needed based on KeyLogger's current logic

   const gameResult: DetailedGameResult = {
     // ... existing fields ...
     wrongCharacters, // Instead of wrongKeys: []
   };
   ```

### Phase 4: Update UserStatsManager

**File**: `utils/userStatsManager.ts`

1. **Add** character error statistics methods:
   ```typescript
   // Add new method to calculate character error stats
   private calculateCharacterErrorStats(games: DetailedGameResult[]): Record<string, {
     totalErrors: number;
     gamesWithErrors: number;
     averageErrorsPerGame: number;
   }> {
     const charStats: Record<string, {
       totalErrors: number;
       gamesWithErrors: number;
       averageErrorsPerGame: number;
     }> = {};

     games.forEach(game => {
       const gameCharsWithErrors = new Set<string>();
       
       game.wrongCharacters.forEach(wrongChar => {
         if (!charStats[wrongChar.expectedChar]) {
           charStats[wrongChar.expectedChar] = {
             totalErrors: 0,
             gamesWithErrors: 0,
             averageErrorsPerGame: 0,
           };
         }
         
         charStats[wrongChar.expectedChar].totalErrors += wrongChar.errorCount;
         gameCharsWithErrors.add(wrongChar.expectedChar);
       });
       
       // Count games with errors for each character
       gameCharsWithErrors.forEach(char => {
         charStats[char].gamesWithErrors++;
       });
     });

     // Calculate averages
     Object.keys(charStats).forEach(char => {
       const stats = charStats[char];
       stats.averageErrorsPerGame = stats.totalErrors / stats.gamesWithErrors;
     });

     return charStats;
   }
   ```

2. **Update** the `getUserStats` method:
   ```typescript
   async getUserStats(): Promise<UserStatsData> {
     // ... existing code ...
     
     const characterErrorStats = this.calculateCharacterErrorStats(this.stats.gameHistory);
     
     return {
       // ... existing fields ...
       characterErrorStats,
     };
   }
   ```

3. **Remove** or deprecate keyboard heatmap methods:
   ```typescript
   // Consider removing these methods entirely:
   // - getKeyboardHeatmapData()
   // - getGameSpecificHeatmapData()
   // - updateKeyboardHeatmap()
   ```

### Phase 5: Update Display Components

**File**: `islands/UserStatsIsland.tsx`

1. **Add** character error statistics display:
   ```typescript
   // Add new component to display character error statistics
   function CharacterErrorStats({ characterStats }: {
     characterStats: Record<string, {
       totalErrors: number;
       gamesWithErrors: number;
       averageErrorsPerGame: number;
     }>;
   }) {
     const sortedChars = Object.entries(characterStats)
       .sort(([, a], [, b]) => b.totalErrors - a.totalErrors)
       .slice(0, 10); // Top 10 problematic characters

     return (
       <div className="bg-white rounded-lg p-6">
         <h3 className="text-lg font-semibold mb-4">
           Most Problematic Characters
         </h3>
         <div className="space-y-2">
           {sortedChars.map(([char, stats]) => (
             <div key={char} className="flex justify-between items-center">
               <span className="font-mono text-lg bg-gray-100 px-2 py-1 rounded">
                 {char === " " ? "(space)" : char}
               </span>
               <div className="text-sm text-gray-600">
                 {stats.totalErrors} errors in {stats.gamesWithErrors}{" "}
                 games (avg: {stats.averageErrorsPerGame.toFixed(1)})
               </div>
             </div>
           ))}
         </div>
       </div>
     );
   }
   ```

2. **Remove** or hide keyboard heatmap display:
   ```typescript
   // Remove keyboard heatmap related UI components
   ```

**File**: `islands/GameScoreDisplayIsland.tsx`

1. **Replace** keyboard heatmap with character error summary:
   ```typescript
   // Replace heatmap section with character error summary
   function GameCharacterErrors(
     { gameResult }: { gameResult?: DetailedGameResult },
   ) {
     if (!gameResult || gameResult.wrongCharacters.length === 0) {
       return (
         <div className="text-center py-4 text-green-600">
           <p>Perfect! No character errors in this game.</p>
         </div>
       );
     }

     return (
       <div className="bg-white rounded-lg p-4">
         <h3 className="text-lg font-semibold mb-3">
           Characters That Caused Errors
         </h3>
         <div className="grid grid-cols-2 gap-2">
           {gameResult.wrongCharacters.map((wrongChar) => (
             <div
               key={wrongChar.expectedChar}
               className="bg-red-50 p-2 rounded"
             >
               <span className="font-mono text-lg">
                 {wrongChar.expectedChar === " "
                   ? "(space)"
                   : wrongChar.expectedChar}
               </span>
               <span className="text-sm text-red-600 ml-2">
                 {wrongChar.errorCount}{" "}
                 error{wrongChar.errorCount > 1 ? "s" : ""}
               </span>
             </div>
           ))}
         </div>
       </div>
     );
   }
   ```

### Phase 6: Testing Plan

**Test Case 1: Basic Error Tracking**

- Input: `@7m6h^FhG7Tujr`
- Expected: `%7m6h%FhG7Tujr`
- Expected Result:
  ```json
  {
    "wrongCharacters": [
      {
        "expectedChar": "%",
        "errorCount": 2,
        "positions": [0, 5]
      }
    ]
  }
  ```

**Test Case 2: Multiple Different Errors**

- Input: `he1lo w@rld`
- Expected: `hello world`
- Expected Result:
  ```json
  {
    "wrongCharacters": [
      {
        "expectedChar": "l",
        "errorCount": 1,
        "positions": [2]
      },
      {
        "expectedChar": "o",
        "errorCount": 1,
        "positions": [7]
      }
    ]
  }
  ```

**Test Case 3: No Errors**

- Input: `perfect`
- Expected: `perfect`
- Expected Result:
  ```json
  {
    "wrongCharacters": []
  }
  ```

### Phase 7: Migration and Cleanup

1. **Database Migration**: If storing stats in localStorage, handle migration
   from old format to new format
2. **Remove Dead Code**: Remove all keyboard heatmap related code
3. **Update Documentation**: Update any documentation that references keyboard
   heatmaps
4. **Performance Testing**: Ensure the new system performs well with large
   datasets

## Expected Benefits

1. **Accurate Error Tracking**: Only track actual character errors, not phantom
   keys
2. **Meaningful Statistics**: Users can see which characters they struggle with
3. **Actionable Insights**: "You often mistype '%' - try focusing on the Shift+5
   combination"
4. **Simplified Codebase**: Remove complex key mapping logic
5. **Better User Experience**: Clear, understandable error feedback

## Migration Notes

- This is a breaking change that will require migrating existing user data
- Consider implementing a feature flag to switch between old and new systems
  during testing
- The new system is fundamentally different, so direct migration of existing
  keyboard heatmap data may not be possible
- Users may need to rebuild their statistics after the migration

## Files to Modify

1. `types/userStats.ts` - Update type definitions
2. `hooks/useQuoteInput.ts` - Update error tracking logic
3. `islands/QuoteTyperMode.tsx` - Update to use new error tracking
4. `islands/TrigraphsTyperMode.tsx` - Update to use new error tracking
5. `islands/KeyLogger.tsx` - Implement character error tracking
6. `utils/userStatsManager.ts` - Update statistics calculation
7. `islands/UserStatsIsland.tsx` - Update display components
8. `islands/GameScoreDisplayIsland.tsx` - Replace heatmap with character errors
9. `components/KeyboardHeatmap.tsx` - Remove or deprecate
10. `islands/KeyboardHeatmapIsland.tsx` - Remove or deprecate

This plan provides a complete roadmap for implementing accurate, character-based
error tracking that will solve the current issues and provide meaningful
insights to users.
