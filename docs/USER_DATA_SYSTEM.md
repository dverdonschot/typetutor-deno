# TypeTutor User Data System

This document provides an overview of how TypeTutor handles user data for new
developers.

## Overview

TypeTutor collects detailed typing performance data to provide users with
insights into their progress and areas for improvement. All data is stored
locally in the browser - no information is transmitted to servers.

## Data Flow

```
User Types → useQuoteInput Hook → DetailedGameResult → UserStatsManager → localStorage
```

### 1. Data Collection (`hooks/useQuoteInput.ts`)

- Tracks every keystroke with timing and accuracy data
- Records character-by-character performance
- Captures error patterns for keyboard heatmap generation
- Monitors backspace usage and typing rhythm

### 2. Data Processing (`utils/userStatsManager.ts`)

- Aggregates game results into comprehensive statistics
- Updates keyboard heatmap with error frequency data
- Calculates performance trends and progress metrics
- Manages data persistence in localStorage

### 3. Data Storage

- **Storage**: Browser localStorage (client-side only)
- **Key**: `typetutor_user_stats` (main data), `typetutor_user_id` (user
  identifier)
- **Privacy**: No server transmission, fully anonymous local storage
- **Retention**: Data persists until manually cleared

## Key Components

### UserStatsManager (`utils/userStatsManager.ts`)

Singleton class that manages all user statistics:

- Secure user ID generation using `crypto.getRandomValues()`
- Game result processing and aggregation
- Keyboard heatmap data generation
- Performance trend analysis
- Data export/import functionality

### KeystrokeData Collection (`types/userStats.ts`)

Detailed information captured for each key press:

- Physical key position and timing
- Accuracy (correct/incorrect)
- Character mapping for heatmap analysis
- Typing speed calculations

### Keyboard Heatmap (`utils/keyboardLayout.ts`)

Maps typing errors to physical keyboard layout:

- Character-to-key conversion (`mapCharToKeyCode`)
- Physical key positioning (`getKeyPosition`)
- Visual error frequency display

## Data Structures

### UserStatsData

Main structure containing all user performance data:

- Aggregate metrics (total games, characters typed, time spent)
- Performance records (best/average WPM and accuracy)
- Detailed game history (last 100 games)
- Character-level error statistics
- Keyboard heatmap data
- Session tracking and trends

### DetailedGameResult

Complete data for a single typing session:

- Performance metrics (WPM, accuracy, errors)
- Every keystroke with timing data
- Character-by-character analysis
- Content metadata

## Privacy & Security

- **Anonymous**: Users identified by cryptographically secure random IDs
- **Local Storage**: All data remains in the browser
- **No Tracking**: No analytics or user behavior tracking
- **User Control**: Complete data export, import, and clearing functionality

## Developer Guidelines

1. **Never transmit user data** to servers
2. **Use UserStatsManager.getInstance()** for all data operations
3. **Handle localStorage errors** gracefully (storage limits, privacy mode)
4. **Preserve user privacy** in all feature development
5. **Test data operations** thoroughly to prevent data loss

## Data Operations

### Adding New Metrics

1. Update `types/userStats.ts` with new data structures
2. Modify `UserStatsManager.updateStats()` to process new data
3. Update `createEmptyStats()` for default values
4. Test data migration for existing users

### Keyboard Layout Changes

1. Update `QWERTY_LAYOUT` in `utils/keyboardLayout.ts`
2. Add character mappings to `buildLookupMaps()`
3. Test heatmap visualization with new keys
4. Ensure backward compatibility

This system provides comprehensive typing analytics while maintaining complete
user privacy and data control.
