// Core type definitions for user statistics and keyboard heatmap functionality

export interface KeystrokeData {
  key: string;
  keyCode: string;
  timestamp: number;
  correct: boolean;
  expectedChar: string;
  actualChar: string;
  timeSinceLastKey: number;
  position: { row: number; col: number };
}

export interface CharacterStats {
  attempts: number;
  errors: number;
  avgTimeBetweenKeys: number;
}

export interface DetailedGameResult {
  gameId: string;
  userId: string; // localStorage-based user ID
  mode: "quotes" | "trigraphs" | "code" | "alphabet" | "random";
  startTime: string;
  endTime: string;
  duration: number;

  // Current metrics (from useTypingMetrics)
  wpm: number;
  cpm: number;
  accuracy: number;
  mistakeCount: number;
  backspaceCount: number;

  // New detailed metrics
  keystrokeData: KeystrokeData[];
  characterStats: Record<string, CharacterStats>;

  // Per-game wrong character data
  wrongCharacters: GameWrongCharacterData[];

  // Content metadata
  contentMetadata: {
    source: string;
    totalCharacters: number;
    uniqueCharacters: number;
    difficulty?: "easy" | "medium" | "hard";
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

export interface UserStatsData {
  userId: string;
  createdAt: string;
  lastUpdated: string;

  // Aggregate metrics
  totalGamesCompleted: number;
  totalCharactersTyped: number;
  totalTimeSpent: number;

  // Performance metrics
  bestWPM: number;
  bestAccuracy: number;
  averageWPM: number;
  averageAccuracy: number;

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
export type HeatmapColorScheme = "errors" | "speed" | "accuracy";

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
