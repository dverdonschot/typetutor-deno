/**
 * Core type definitions for user statistics and keyboard heatmap functionality
 *
 * This file defines the data structures used throughout TypeTutor for tracking
 * user performance, keyboard usage patterns, and game statistics.
 *
 * Data Flow Overview:
 * KeystrokeData → CharacterStats → DetailedGameResult → UserStatsData
 *
 * Storage: All data persists in localStorage via UserStatsManager
 * Privacy: No data is transmitted to servers - everything stays local
 */

/**
 * Individual keystroke event data
 *
 * Captured for every key press during typing practice.
 * Used for detailed analysis of typing patterns and speed.
 */
export interface KeystrokeData {
  key: string; // The visual key pressed (e.g., "a", "A", "1")
  keyCode: string; // Physical key identifier (e.g., "KeyA", "Digit1")
  timestamp: number; // When the key was pressed (Date.now())
  correct: boolean; // Whether this matched the expected character
  expectedChar: string; // What character was supposed to be typed
  actualChar: string; // What character was actually typed
  timeSinceLastKey: number; // Milliseconds since previous keystroke
  position: { row: number; col: number }; // Physical keyboard position
}

/**
 * Aggregated statistics for a specific character
 *
 * Tracks performance over time for individual characters.
 * Used to identify which characters a user struggles with.
 */
export interface CharacterStats {
  attempts: number; // Total times this character was typed
  errors: number; // Total mistakes on this character
  avgTimeBetweenKeys: number; // Average typing speed for this character
}

/**
 * Complete result data for a single typing game
 *
 * Generated when a user completes a typing exercise. Contains all
 * performance metrics, keystroke data, and error information.
 * This is the primary data structure sent to UserStatsManager.updateStats()
 */
export interface DetailedGameResult {
  gameId: string; // Unique identifier for this game session
  userId: string; // localStorage-based user ID
  mode: "quotes" | "trigraphs" | "code" | "alphabet" | "random"; // Game type
  startTime: string; // ISO timestamp when game started
  endTime: string; // ISO timestamp when game ended
  duration: number; // Total time in milliseconds

  // Performance metrics (calculated by useTypingMetrics hook)
  wpm: number; // Words per minute
  cpm: number; // Characters per minute
  accuracy: number; // Percentage of correct characters
  mistakeCount: number; // Total mistakes made
  backspaceCount: number; // Total backspaces used

  // Detailed keystroke analysis
  keystrokeData: KeystrokeData[]; // Every individual key press
  characterStats: Record<string, CharacterStats>; // Per-character performance

  // Error tracking for keyboard heatmap
  wrongCharacters: GameWrongCharacterData[]; // Characters typed incorrectly

  // Content information
  contentMetadata: {
    source: string; // Which quote/exercise was used
    totalCharacters: number; // Length of the text
    uniqueCharacters: number; // Number of different characters
    difficulty?: "easy" | "medium" | "hard"; // Optional difficulty rating
  };
}

export interface KeyboardKeyData {
  keyCode: string;
  keyLabel: string;
  position: { row: number; col: number };
  errorCount: number;
  totalPresses: number;
  averageSpeed: number;
}

export interface UserCharacterStats {
  totalAttempts: number;
  correctAttempts: number;
  errorCount: number;
  averageSpeed: number;
  firstSeenAt: string;
  lastErrorAt?: string;
}

export interface PerformanceTrendData {
  date: string;
  avgWPM: number;
  avgAccuracy: number;
  gameCount: number;
}

/**
 * Complete user statistics data structure
 *
 * This is the main data structure stored in localStorage that contains
 * all accumulated user performance data across all typing sessions.
 *
 * Updated by: UserStatsManager.updateStats() after each game
 * Storage: localStorage key "typetutor_user_stats"
 * Size limit: Keeps last 100 games to prevent storage bloat
 */
export interface UserStatsData {
  // User identification and timestamps
  userId: string; // Unique anonymous user identifier
  createdAt: string; // When the user first used TypeTutor
  lastUpdated: string; // When this data was last modified

  // Overall performance metrics
  totalGamesCompleted: number; // Total typing games finished
  totalCharactersTyped: number; // Total characters typed across all games
  totalTimeSpent: number; // Total milliseconds spent typing

  // Best and average performance
  bestWPM: number; // Highest words per minute achieved
  bestAccuracy: number; // Best accuracy percentage achieved
  averageWPM: number; // Average WPM across all games
  averageAccuracy: number; // Average accuracy across all games

  // Character-level statistics
  characterStats: Record<string, UserCharacterStats>;

  // Keyboard heatmap data
  keyboardHeatmap: Record<string, KeyboardKeyData>;

  // Game history (last 100 games)
  gameHistory: DetailedGameResult[];

  // Daily/weekly trends
  performanceTrends: {
    daily: PerformanceTrendData[];
    weekly: PerformanceTrendData[];
  };

  // Session-based statistics
  sessionStats: {
    currentSessionStartTime: string;
    currentSessionGames: number;
    currentSessionWPM: number[];
    currentSessionAccuracy: number[];
  };

  // Character error statistics
  characterErrorStats: Record<string, {
    totalErrors: number;
    gamesWithErrors: number;
    averageErrorsPerGame: number;
  }>;

  // Aggregate analysis
  aggregateMetrics: {
    weakestKeys: string[]; // top 10 most error-prone keys
    strongestKeys: string[]; // top 10 most accurate keys
  };
}

export interface KeyboardHeatmapData {
  [keyCode: string]: KeyboardKeyData;
}

export interface ProgressSummary {
  improvementRate: number;
  currentStreak: number;
  longestStreak: number;
  recentPerformance: {
    last10GamesWPM: number;
    last10GamesAccuracy: number;
  };
  goals: {
    targetWPM?: number;
    targetAccuracy?: number;
  };
}

export interface PerformanceTrends {
  wpmTrend: PerformanceTrendData[];
  accuracyTrend: PerformanceTrendData[];
}

// Keyboard layout types
export interface KeyDefinition {
  keyCode: string;
  label: string;
  width: number; // relative width (1 = standard key)
  position: { row: number; col: number };
  finger?: "thumb" | "index" | "middle" | "ring" | "pinky";
  hand?: "left" | "right";
}

export interface KeyRow {
  keys: KeyDefinition[];
  rowIndex: number;
}

export interface KeyboardLayout {
  name: string;
  rows: KeyRow[];
  layout: "qwerty" | "dvorak" | "colemak";
}

// Export/Import types
export interface UserStatsExport {
  version: string;
  exportDate: string;
  data: UserStatsData;
}

// Color scheme types for heatmap
export type HeatmapColorScheme =
  | "errors"
  | "speed"
  | "accuracy"
  | "game-errors";

// Game mode types
export type GameMode = "quotes" | "trigraphs" | "code" | "alphabet" | "random";

// Time period filters
export type TimePeriod = "last10" | "last30" | "last100" | "allTime";

// Per-game wrong character tracking
export interface GameWrongCharacterData {
  expectedChar: string; // The character that should have been typed
  errorCount: number; // How many times this character was typed wrong
  positions: number[]; // Character positions where errors occurred
}

export interface GameWrongCharactersCollection {
  gameId: string;
  timestamp: string;
  wrongCharacters: GameWrongCharacterData[];
}
