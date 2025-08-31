# CodeNew Integration Plan

## Overview
Replace the existing `/code` route with the new `codenew` functionality and integrate it with the existing ingame metrics system used by quotes and random modes.

## Current State Analysis

### Existing Code Structure
- **Current `/code` route**: `routes/code.tsx` and `islands/CodeTyperMode.tsx` (standard implementation)
- **New implementation**: `routes/codenew.tsx` and `islands/CodeNewTyperMode.tsx` (overtype system)
- **Metrics system**: `hooks/useTypingMetrics.ts` (comprehensive metrics) + `hooks/useQuoteInput.ts` (detailed keystroke tracking)
- **Display components**: `GameScoreDisplayIsland.tsx` (results display), `QuoteTextDisplay.tsx` (text rendering)

### Key Differences
1. **Input System**:
   - Old: Uses `useQuoteInput` hook with full keystroke tracking and character states
   - New: Uses `useOvertypeInput` hook with simplified overtype functionality
   
2. **Metrics System**:
   - Old: Integrated with `useTypingMetrics` + detailed `UserStatsManager` integration
   - New: Simple local metrics calculation (WPM, accuracy, errors)
   
3. **Visual Display**:
   - Old: Uses `QuoteTextDisplay` component with character-by-character state tracking
   - New: Uses `OvertypeContainer` component with overlay typing approach

## Implementation Plan

### Phase 1: Route Replacement
1. **Back up existing code route** to `routes/code-backup.tsx`
2. **Replace `routes/code.tsx`** with modified version of `codenew.tsx`
3. **Update navigation links** to point to `/code` instead of `/codenew`

### Phase 2: Metrics Integration
1. **Modify `CodeNewTyperMode` to use `useQuoteInput`**:
   - Replace `useOvertypeInput` with `useQuoteInput` for full keystroke tracking
   - Maintain the overtype visual approach with `OvertypeContainer`
   - Map `useQuoteInput` states to `charStates` needed by `OvertypeContainer`

2. **Integrate `useTypingMetrics`**:
   - Add `useTypingMetrics` hook alongside `useQuoteInput`
   - Replace simple metrics calculation with comprehensive metrics
   - Ensure metrics are properly passed to display components

3. **Add `UserStatsManager` integration**:
   - Import and use `UserStatsManager` for game result storage
   - Create `DetailedGameResult` objects when typing is complete
   - Store results in user stats system

### Phase 3: Component Integration
1. **Replace simple metrics display** with `GameScoreDisplayIsland`
2. **Ensure compatibility** between `OvertypeContainer` and character states from `useQuoteInput`
3. **Add completion handling** similar to other typing modes

### Phase 4: Testing and Cleanup
1. **Test all functionality**:
   - Overtype visual behavior
   - Metrics calculation and storage
   - Navigation and content selection
   - Game completion and stats storage
   
2. **Remove obsolete files**:
   - `routes/codenew.tsx`
   - `hooks/useOvertypeInput.ts`
   - `utils/overtypeContentFetcher.ts`
   - `components/overtype/` directory

3. **Update imports** throughout the codebase

## Technical Details

### Key Challenges
1. **State Mapping**: `useQuoteInput` returns `DisplayCharState[]` while `OvertypeContainer` expects character states for overlay rendering
2. **Metrics Compatibility**: Ensure overtype system works with existing typing metrics
3. **Content Fetching**: Maintain overtype content fetching while using standard input system

### Integration Points
1. **Character States**: Map `useQuoteInput.charStates` to format expected by `OvertypeContainer`
2. **Metrics Flow**: `useQuoteInput` → `useTypingMetrics` → `GameScoreDisplayIsland` → `UserStatsManager`
3. **Completion Handling**: Use `isComplete` from `useQuoteInput` to trigger stats storage and completion display

## Files to Modify
1. `routes/code.tsx` (replace with integrated version)
2. `islands/CodeNewTyperMode.tsx` (integrate with existing metrics system)
3. Navigation components (update links from `/codenew` to `/code`)
4. Any references to the old code route

## Files to Remove (after successful integration)
- `routes/codenew.tsx`
- `hooks/useOvertypeInput.ts`
- `utils/overtypeContentFetcher.ts`
- `components/overtype/` directory (if not needed)

## Success Criteria
- [x] `/code` route uses overtype visual system
- [x] Full metrics integration (WPM, accuracy, errors, timing data)
- [x] Game results stored in UserStatsManager
- [x] Completion screen matches other typing modes
- [x] All existing functionality maintained
- [x] No broken links or imports

## Stats Integration Requirements
Once the metrics integration is complete, code typing should be fully tracked and displayed:

### User Stats Page (`/userstats`)
- Code games appear in game history table with mode="code"
- Code typing contributes to overall WPM/accuracy averages
- Code games included in performance trend charts
- Code typing time counts toward total time spent
- Code characters count toward total characters typed

### Server Stats Page (`/serverstats`)
- Code mode appears as a card alongside other modes (Quotes, Random, Trigraphs)
- Code categories displayed (JavaScript, Python, TypeScript, etc.)
- Each programming language shows completion counts
- Follows same display pattern as other modes with categories

### Technical Implementation
- `UserStatsManager.recordGameResult()` called with mode="code" 
- Categories should be the programming language (e.g. "javascript", "python")
- Server stats API (`/api/game-stats`) automatically includes code data
- No additional API changes needed - existing infrastructure handles all modes