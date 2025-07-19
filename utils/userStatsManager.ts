import {
  DetailedGameResult,
  KeyboardHeatmapData,
  PerformanceTrends,
  ProgressSummary,
  UserStatsData,
  UserStatsExport,
} from "../types/userStats.ts";
import { getKeyLabel } from "./keyboardLayout.ts";

const STORAGE_KEY = "typetutor_user_stats";
const USER_ID_KEY = "typetutor_user_id";
const VERSION = "1.0.0";

/**
 * UserStatsManager - Singleton class for managing user statistics
 *
 * This class handles all user data operations for TypeTutor including:
 * - User identification via secure random IDs
 * - Persistent storage of typing statistics in localStorage
 * - Aggregation of game results into comprehensive metrics
 * - Keyboard heatmap data generation
 * - Performance trend tracking
 *
 * Data Flow:
 * 1. User starts typing → useQuoteInput hook tracks keystrokes
 * 2. Game completes → DetailedGameResult sent to addGameResult()
 * 3. Stats aggregated → Character stats, WPM trends, heatmap updated
 * 4. Data persisted → localStorage updated with new statistics
 *
 * Privacy: All data is stored locally in the browser. No server transmission.
 *
 * @example
 * const statsManager = UserStatsManager.getInstance();
 * statsManager.initialize();
 * const userStats = statsManager.getUserStats();
 */
export class UserStatsManager {
  private static instance: UserStatsManager;
  private userId: string;
  private stats: UserStatsData | null = null;
  private initialized = false;

  private constructor() {
    this.userId = this.getOrCreateUserId();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): UserStatsManager {
    if (!UserStatsManager.instance) {
      UserStatsManager.instance = new UserStatsManager();
    }
    return UserStatsManager.instance;
  }

  /**
   * Initialize the stats manager
   */
  initialize(): void {
    if (this.initialized) return;

    this.loadStats();
    this.initialized = true;
  }

  /**
   * Get or create user ID
   *
   * Generates a unique, anonymous user identifier for tracking statistics.
   * Format: "user_{timestamp}_{secureRandomString}"
   *
   * Security: Uses crypto.getRandomValues() for cryptographically secure randomness
   * Storage: Persists in localStorage under "typetutor_user_id" key
   *
   * @returns Unique user identifier string
   */
  private getOrCreateUserId(): string {
    let userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
      // Generate cryptographically secure random string
      const randomBytes = new Uint8Array(12);
      crypto.getRandomValues(randomBytes);
      const randomString = Array.from(
        randomBytes,
        (byte) => byte.toString(36).padStart(2, "0"),
      ).join("").substring(0, 13);

      userId = `user_${Date.now()}_${randomString}`;
      localStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  }

  /**
   * Get user ID
   */
  getUserId(): string {
    return this.userId;
  }

  /**
   * Load stats from localStorage
   *
   * Retrieves and validates user statistics from browser storage.
   * Falls back to empty stats if data is corrupted or missing.
   *
   * Storage Key: "typetutor_user_stats"
   * Validation: Ensures all required fields are present
   * Error Handling: Creates fresh stats on any loading error
   */
  private loadStats(): void {
    try {
      const storedStats = localStorage.getItem(STORAGE_KEY);
      if (storedStats) {
        const parsedStats = JSON.parse(storedStats);
        if (this.validateStatsData(parsedStats)) {
          this.stats = parsedStats;
        } else {
          console.warn("Invalid stats data found, initializing new stats");
          this.stats = this.createEmptyStats();
        }
      } else {
        this.stats = this.createEmptyStats();
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      this.stats = this.createEmptyStats();
    }
  }

  /**
   * Save stats to localStorage
   *
   * Persists current user statistics to browser storage.
   * Updates lastUpdated timestamp before saving.
   *
   * @throws Error if localStorage write fails
   */
  private saveStats(): void {
    if (!this.stats) return;

    try {
      this.stats.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
    } catch (error) {
      console.error("Error saving stats:", error);
      throw new Error("Failed to save user statistics");
    }
  }

  /**
   * Create empty stats structure
   */
  private createEmptyStats(): UserStatsData {
    const now = new Date().toISOString();
    return {
      userId: this.userId,
      createdAt: now,
      lastUpdated: now,
      totalGamesCompleted: 0,
      totalCharactersTyped: 0,
      totalTimeSpent: 0,
      bestWPM: 0,
      bestAccuracy: 0,
      averageWPM: 0,
      averageAccuracy: 0,
      characterStats: {},
      keyboardHeatmap: {},
      gameHistory: [],
      performanceTrends: {
        daily: [],
        weekly: [],
      },
      sessionStats: {
        currentSessionStartTime: now,
        currentSessionGames: 0,
        currentSessionWPM: [],
        currentSessionAccuracy: [],
      },
      characterErrorStats: {},
      aggregateMetrics: {
        weakestKeys: [],
        strongestKeys: [],
      },
    };
  }

  /**
   * Validate stats data structure
   */
  private validateStatsData(data: unknown): boolean {
    if (!data || typeof data !== "object") return false;

    const requiredFields = [
      "userId",
      "createdAt",
      "lastUpdated",
      "totalGamesCompleted",
      "totalCharactersTyped",
      "totalTimeSpent",
      "bestWPM",
      "bestAccuracy",
      "averageWPM",
      "averageAccuracy",
      "characterStats",
      "keyboardHeatmap",
      "gameHistory",
      "performanceTrends",
      "sessionStats",
      "characterErrorStats",
      "aggregateMetrics",
    ];

    return requiredFields.every((field) => field in data);
  }

  /**
   * Get user stats
   */
  getUserStats(): UserStatsData {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.stats) {
      this.stats = this.createEmptyStats();
    }

    // Calculate character error statistics
    this.stats.characterErrorStats = this.calculateCharacterErrorStats(
      this.stats.gameHistory,
    );

    return this.stats;
  }

  /**
   * Update stats with new game result
   *
   * Main entry point for processing completed typing games. This method
   * aggregates the game data into comprehensive user statistics.
   *
   * Processing Steps:
   * 1. Updates aggregate metrics (total games, characters typed, time spent)
   * 2. Updates per-character statistics (speed, accuracy per character)
   * 3. Updates keyboard heatmap (error frequency per physical key)
   * 4. Updates character error tracking (specific mistake patterns)
   * 5. Adds game to history for trend analysis
   * 6. Updates performance trends (daily/weekly averages)
   * 7. Updates current session statistics
   * 8. Recalculates aggregate analysis (weakest/strongest keys)
   * 9. Persists all changes to localStorage
   *
   * @param gameResult Complete game data including keystrokes and errors
   */
  updateStats(gameResult: DetailedGameResult): void {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.stats) {
      this.stats = this.createEmptyStats();
    }

    // Update aggregate metrics
    this.updateAggregateMetrics(gameResult);

    // Update character stats
    this.updateCharacterStats(gameResult);

    // Update keyboard heatmap (using new per-game wrong key data)
    this.updateKeyboardHeatmap(gameResult);

    // Update character error statistics
    this.updateCharacterErrorStats(gameResult);

    // Update game history
    this.updateGameHistory(gameResult);

    // Update performance trends
    this.updatePerformanceTrends(gameResult);

    // Update session stats
    this.updateSessionStats(gameResult);

    // Update aggregate analysis
    this.updateAggregateAnalysis();

    this.saveStats();
  }

  /**
   * Update aggregate metrics
   */
  private updateAggregateMetrics(gameResult: DetailedGameResult): void {
    if (!this.stats) return;

    this.stats.totalGamesCompleted += 1;
    this.stats.totalCharactersTyped +=
      gameResult.contentMetadata.totalCharacters;
    this.stats.totalTimeSpent += gameResult.duration;

    // Update best scores
    if (gameResult.wpm > this.stats.bestWPM) {
      this.stats.bestWPM = gameResult.wpm;
    }
    if (gameResult.accuracy > this.stats.bestAccuracy) {
      this.stats.bestAccuracy = gameResult.accuracy;
    }

    // Update averages
    const totalGames = this.stats.totalGamesCompleted;
    this.stats.averageWPM =
      (this.stats.averageWPM * (totalGames - 1) + gameResult.wpm) / totalGames;
    this.stats.averageAccuracy =
      (this.stats.averageAccuracy * (totalGames - 1) + gameResult.accuracy) /
      totalGames;
  }

  /**
   * Update character statistics
   */
  private updateCharacterStats(gameResult: DetailedGameResult): void {
    if (!this.stats) return;

    Object.entries(gameResult.characterStats).forEach(([char, charStats]) => {
      if (!this.stats!.characterStats[char]) {
        this.stats!.characterStats[char] = {
          totalAttempts: 0,
          correctAttempts: 0,
          errorCount: 0,
          averageSpeed: 0,
          firstSeenAt: new Date().toISOString(),
        };
      }

      const existing = this.stats!.characterStats[char];
      existing.totalAttempts += charStats.attempts;
      existing.correctAttempts += charStats.attempts - charStats.errors;
      existing.errorCount += charStats.errors;

      // Update average speed
      existing.averageSpeed =
        (existing.averageSpeed + charStats.avgTimeBetweenKeys) / 2;

      // Update last error time if there were errors
      if (charStats.errors > 0) {
        existing.lastErrorAt = new Date().toISOString();
      }
    });
  }

  /**
   * Update keyboard heatmap
   */
  private updateKeyboardHeatmap(gameResult: DetailedGameResult): void {
    if (!this.stats) return;

    gameResult.keystrokeData.forEach((keystroke) => {
      const keyCode = keystroke.keyCode;

      if (!this.stats!.keyboardHeatmap[keyCode]) {
        this.stats!.keyboardHeatmap[keyCode] = {
          keyCode,
          keyLabel: getKeyLabel(keyCode),
          position: keystroke.position,
          errorCount: 0,
          totalPresses: 0,
          averageSpeed: 0,
        };
      }

      const keyData = this.stats!.keyboardHeatmap[keyCode];
      keyData.totalPresses += 1;

      if (!keystroke.correct) {
        keyData.errorCount += 1;
      }

      // Update average speed
      keyData.averageSpeed =
        (keyData.averageSpeed + keystroke.timeSinceLastKey) / 2;
    });
  }

  /**
   * Update game history
   */
  private updateGameHistory(gameResult: DetailedGameResult): void {
    if (!this.stats) return;

    // Add new game to history
    this.stats.gameHistory.push(gameResult);

    // Keep only last 100 games
    if (this.stats.gameHistory.length > 100) {
      this.stats.gameHistory = this.stats.gameHistory.slice(-100);
    }
  }

  /**
   * Update performance trends
   */
  private updatePerformanceTrends(gameResult: DetailedGameResult): void {
    if (!this.stats) return;

    const gameDate = new Date(gameResult.endTime);
    const dateStr = gameDate.toISOString().split("T")[0]; // YYYY-MM-DD format

    // Update daily trends
    let dailyTrend = this.stats.performanceTrends.daily.find((trend) =>
      trend.date === dateStr
    );
    if (!dailyTrend) {
      dailyTrend = {
        date: dateStr,
        avgWPM: 0,
        avgAccuracy: 0,
        gameCount: 0,
      };
      this.stats.performanceTrends.daily.push(dailyTrend);
    }

    // Update daily average
    dailyTrend.avgWPM =
      (dailyTrend.avgWPM * dailyTrend.gameCount + gameResult.wpm) /
      (dailyTrend.gameCount + 1);
    dailyTrend.avgAccuracy =
      (dailyTrend.avgAccuracy * dailyTrend.gameCount + gameResult.accuracy) /
      (dailyTrend.gameCount + 1);
    dailyTrend.gameCount += 1;

    // Keep only last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    this.stats.performanceTrends.daily = this.stats.performanceTrends.daily
      .filter(
        (trend) => new Date(trend.date) >= ninetyDaysAgo,
      );

    // Update weekly trends
    const weekStart = new Date(gameDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStr = weekStart.toISOString().split("T")[0];

    let weeklyTrend = this.stats.performanceTrends.weekly.find((trend) =>
      trend.date === weekStr
    );
    if (!weeklyTrend) {
      weeklyTrend = {
        date: weekStr,
        avgWPM: 0,
        avgAccuracy: 0,
        gameCount: 0,
      };
      this.stats.performanceTrends.weekly.push(weeklyTrend);
    }

    // Update weekly average
    weeklyTrend.avgWPM =
      (weeklyTrend.avgWPM * weeklyTrend.gameCount + gameResult.wpm) /
      (weeklyTrend.gameCount + 1);
    weeklyTrend.avgAccuracy =
      (weeklyTrend.avgAccuracy * weeklyTrend.gameCount + gameResult.accuracy) /
      (weeklyTrend.gameCount + 1);
    weeklyTrend.gameCount += 1;

    // Keep only last 52 weeks
    const fiftyTwoWeeksAgo = new Date();
    fiftyTwoWeeksAgo.setDate(fiftyTwoWeeksAgo.getDate() - 52 * 7);
    this.stats.performanceTrends.weekly = this.stats.performanceTrends.weekly
      .filter(
        (trend) => new Date(trend.date) >= fiftyTwoWeeksAgo,
      );
  }

  /**
   * Update session statistics
   */
  private updateSessionStats(gameResult: DetailedGameResult): void {
    if (!this.stats) return;

    this.stats.sessionStats.currentSessionGames += 1;
    this.stats.sessionStats.currentSessionWPM.push(gameResult.wpm);
    this.stats.sessionStats.currentSessionAccuracy.push(gameResult.accuracy);

    // Keep only last 50 games in session
    if (this.stats.sessionStats.currentSessionWPM.length > 50) {
      this.stats.sessionStats.currentSessionWPM = this.stats.sessionStats
        .currentSessionWPM.slice(-50);
    }
    if (this.stats.sessionStats.currentSessionAccuracy.length > 50) {
      this.stats.sessionStats.currentSessionAccuracy = this.stats.sessionStats
        .currentSessionAccuracy.slice(-50);
    }
  }

  /**
   * Update character error statistics
   */
  private updateCharacterErrorStats(_gameResult: DetailedGameResult): void {
    if (!this.stats) return;

    // This method is called during updateStats, but the actual calculation
    // is done in calculateCharacterErrorStats which is called in getUserStats
    // This ensures the stats are always up to date when requested
  }

  /**
   * Calculate character error statistics from game history
   */
  private calculateCharacterErrorStats(
    games: DetailedGameResult[],
  ): Record<string, {
    totalErrors: number;
    gamesWithErrors: number;
    averageErrorsPerGame: number;
  }> {
    const charStats: Record<string, {
      totalErrors: number;
      gamesWithErrors: number;
      averageErrorsPerGame: number;
    }> = {};

    games.forEach((game) => {
      const gameCharsWithErrors = new Set<string>();

      game.wrongCharacters.forEach((wrongChar) => {
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
      gameCharsWithErrors.forEach((char) => {
        charStats[char].gamesWithErrors++;
      });
    });

    // Calculate averages
    Object.keys(charStats).forEach((char) => {
      const stats = charStats[char];
      stats.averageErrorsPerGame = stats.totalErrors / stats.gamesWithErrors;
    });

    return charStats;
  }

  /**
   * Update aggregate analysis (weakest/strongest keys)
   */
  private updateAggregateAnalysis(): void {
    if (!this.stats) return;

    // Calculate error rates for each key
    const keyErrorRates = Object.entries(this.stats.keyboardHeatmap).map((
      [keyCode, data],
    ) => ({
      keyCode,
      errorRate: data.totalPresses > 0
        ? data.errorCount / data.totalPresses
        : 0,
      totalPresses: data.totalPresses,
    }));

    // Filter keys with meaningful data (at least 10 presses)
    const meaningfulKeys = keyErrorRates.filter((key) =>
      key.totalPresses >= 10
    );

    // Sort by error rate
    meaningfulKeys.sort((a, b) => b.errorRate - a.errorRate);

    // Update weakest keys (highest error rate)
    this.stats.aggregateMetrics.weakestKeys = meaningfulKeys.slice(0, 10).map(
      (key) => key.keyCode,
    );

    // Update strongest keys (lowest error rate)
    this.stats.aggregateMetrics.strongestKeys = meaningfulKeys.slice(-10)
      .reverse().map((key) => key.keyCode);
  }

  /**
   * Get keyboard heatmap data
   */
  getKeyboardHeatmapData(): KeyboardHeatmapData {
    if (!this.stats) return {};
    return this.stats.keyboardHeatmap;
  }

  /**
   * Get keyboard heatmap data for a specific game
   */
  getGameSpecificHeatmapData(
    gameResult: DetailedGameResult,
  ): KeyboardHeatmapData {
    const gameHeatmap: KeyboardHeatmapData = {};

    gameResult.keystrokeData.forEach((keystroke) => {
      const keyCode = keystroke.keyCode;

      if (!gameHeatmap[keyCode]) {
        gameHeatmap[keyCode] = {
          keyCode,
          keyLabel: getKeyLabel(keyCode),
          position: keystroke.position,
          errorCount: 0,
          totalPresses: 0,
          averageSpeed: 0,
        };
      }

      const keyData = gameHeatmap[keyCode];
      keyData.totalPresses += 1;

      if (!keystroke.correct) {
        keyData.errorCount += 1;
      }

      // Calculate average speed for this game
      keyData.averageSpeed =
        (keyData.averageSpeed * (keyData.totalPresses - 1) +
          keystroke.timeSinceLastKey) / keyData.totalPresses;
    });

    return gameHeatmap;
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(): PerformanceTrends {
    if (!this.stats) {
      return { wpmTrend: [], accuracyTrend: [] };
    }

    return {
      wpmTrend: this.stats.performanceTrends.daily.map((trend) => ({
        date: trend.date,
        avgWPM: trend.avgWPM,
        avgAccuracy: trend.avgAccuracy,
        gameCount: trend.gameCount,
      })),
      accuracyTrend: this.stats.performanceTrends.daily.map((trend) => ({
        date: trend.date,
        avgWPM: trend.avgWPM,
        avgAccuracy: trend.avgAccuracy,
        gameCount: trend.gameCount,
      })),
    };
  }

  /**
   * Get weakest keys
   */
  getWeakestKeys(): string[] {
    if (!this.stats) return [];
    return this.stats.aggregateMetrics.weakestKeys;
  }

  /**
   * Get strongest keys
   */
  getStrongestKeys(): string[] {
    if (!this.stats) return [];
    return this.stats.aggregateMetrics.strongestKeys;
  }

  /**
   * Get progress summary
   */
  getProgressSummary(): ProgressSummary {
    if (!this.stats) {
      return {
        improvementRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        recentPerformance: {
          last10GamesWPM: 0,
          last10GamesAccuracy: 0,
        },
        goals: {},
      };
    }

    const recentGames = this.stats.gameHistory.slice(-10);
    const recentWPM = recentGames.reduce((sum, game) => sum + game.wpm, 0) /
        recentGames.length || 0;
    const recentAccuracy =
      recentGames.reduce((sum, game) => sum + game.accuracy, 0) /
        recentGames.length || 0;

    return {
      improvementRate: this.calculateImprovementRate(),
      currentStreak: this.calculateCurrentStreak(),
      longestStreak: this.calculateLongestStreak(),
      recentPerformance: {
        last10GamesWPM: recentWPM,
        last10GamesAccuracy: recentAccuracy,
      },
      goals: {},
    };
  }

  /**
   * Calculate improvement rate
   */
  private calculateImprovementRate(): number {
    if (!this.stats || this.stats.gameHistory.length < 10) return 0;

    const firstTenGames = this.stats.gameHistory.slice(0, 10);
    const lastTenGames = this.stats.gameHistory.slice(-10);

    const firstAvgWPM = firstTenGames.reduce((sum, game) => sum + game.wpm, 0) /
      firstTenGames.length;
    const lastAvgWPM = lastTenGames.reduce((sum, game) => sum + game.wpm, 0) /
      lastTenGames.length;

    return ((lastAvgWPM - firstAvgWPM) / firstAvgWPM) * 100;
  }

  /**
   * Calculate current streak
   */
  private calculateCurrentStreak(): number {
    if (!this.stats || this.stats.gameHistory.length === 0) return 0;

    let streak = 0;
    for (let i = this.stats.gameHistory.length - 1; i >= 0; i--) {
      if (this.stats.gameHistory[i].accuracy >= 95) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate longest streak
   */
  private calculateLongestStreak(): number {
    if (!this.stats || this.stats.gameHistory.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 0;

    for (const game of this.stats.gameHistory) {
      if (game.accuracy >= 95) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return longestStreak;
  }

  /**
   * Export user stats
   */
  exportStats(): string {
    if (!this.stats) {
      this.initialize();
    }

    const exportData: UserStatsExport = {
      version: VERSION,
      exportDate: new Date().toISOString(),
      data: this.stats!,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import user stats
   */
  importStats(data: string): boolean {
    try {
      const importData: UserStatsExport = JSON.parse(data);

      if (!importData.version || !importData.data) {
        throw new Error("Invalid import data format");
      }

      if (!this.validateStatsData(importData.data)) {
        throw new Error("Invalid stats data structure");
      }

      this.stats = importData.data;
      this.saveStats();
      return true;
    } catch (error) {
      console.error("Error importing stats:", error);
      return false;
    }
  }

  /**
   * Clear all user stats
   */
  clearStats(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.stats = this.createEmptyStats();
    this.saveStats();
  }

  /**
   * Reset session stats
   */
  resetSession(): void {
    if (!this.stats) return;

    this.stats.sessionStats = {
      currentSessionStartTime: new Date().toISOString(),
      currentSessionGames: 0,
      currentSessionWPM: [],
      currentSessionAccuracy: [],
    };

    this.saveStats();
  }
}
