import { useEffect, useState } from "preact/hooks";
import {
  DetailedGameResult,
  PerformanceTrends,
  ProgressSummary,
  UserStatsData,
} from "../types/userStats.ts";
import { UserStatsManager } from "../utils/userStatsManager.ts";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "blue" | "green" | "yellow" | "red" | "gray";
}

function StatsCard({ title, value, subtitle, color = "blue" }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    yellow: "bg-yellow-50 border-yellow-200",
    red: "bg-red-50 border-red-200",
    gray: "bg-gray-50 border-gray-200",
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

interface GameHistoryTableProps {
  games: DetailedGameResult[];
}

function GameHistoryTable({ games }: GameHistoryTableProps) {
  if (games.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No games completed yet. Start typing to see your history!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mode
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              WPM
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Accuracy
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {games.map((game) => (
            <tr key={game.gameId}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(game.endTime).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                {game.mode}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {game.wpm.toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {game.accuracy.toFixed(1)}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {Math.round(game.duration)}s
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PerformanceTrendChartProps {
  data: PerformanceTrends;
  type: "wpm" | "accuracy";
}

function PerformanceTrendChart({ data, type }: PerformanceTrendChartProps) {
  const trendData = type === "wpm" ? data.wpmTrend : data.accuracyTrend;

  if (trendData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>
          Not enough data to show trends yet. Complete more games to see your
          progress!
        </p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...trendData.map((d) => type === "wpm" ? d.avgWPM : d.avgAccuracy),
  );
  const minValue = Math.min(
    ...trendData.map((d) => type === "wpm" ? d.avgWPM : d.avgAccuracy),
  );
  const range = maxValue - minValue;
  const padding = range * 0.1;

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">
        {type === "wpm" ? "WPM Trend" : "Accuracy Trend"}
      </h3>
      <div className="h-64 relative">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 480 240"
          className="border rounded"
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id={`grid-${type}`}
              width="40"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 20"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect x="70" y="10" width="380" height="180" fill={`url(#grid-${type})`} />

          {/* Y-axis labels */}
          <text x="20" y="15" fontSize="10" fill="#666" textAnchor="end" dominantBaseline="middle">
            {(maxValue + padding).toFixed(type === "wpm" ? 0 : 1)}{type === "accuracy" ? "%" : ""}
          </text>
          <text x="20" y="100" fontSize="10" fill="#666" textAnchor="end" dominantBaseline="middle">
            {((maxValue + minValue) / 2).toFixed(type === "wpm" ? 0 : 1)}{type === "accuracy" ? "%" : ""}
          </text>
          <text x="20" y="185" fontSize="10" fill="#666" textAnchor="end" dominantBaseline="middle">
            {(minValue - padding).toFixed(type === "wpm" ? 0 : 1)}{type === "accuracy" ? "%" : ""}
          </text>

          {/* X-axis labels (first and last dates) */}
          <text x="80" y="205" fontSize="10" fill="#666" textAnchor="start" dominantBaseline="middle">
            {new Date(trendData[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
          <text x="440" y="205" fontSize="10" fill="#666" textAnchor="end" dominantBaseline="middle">
            {new Date(trendData[trendData.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>

          {/* Trend line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={trendData.map((d, i) => {
              const x = (i / (trendData.length - 1)) * 360 + 80;
              const value = type === "wpm" ? d.avgWPM : d.avgAccuracy;
              const y = 180 -
                ((value - minValue + padding) / (range + 2 * padding)) * 160 + 10;
              return `${x},${y}`;
            }).join(" ")}
          />

          {/* Data points */}
          {trendData.map((d, i) => {
            const x = (i / (trendData.length - 1)) * 360 + 80;
            const value = type === "wpm" ? d.avgWPM : d.avgAccuracy;
            const y = 180 -
              ((value - minValue + padding) / (range + 2 * padding)) * 160 + 10;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="#3b82f6"
                title={`${d.date}: ${value.toFixed(1)}${
                  type === "accuracy" ? "%" : ""
                }`}
              />
            );
          })}

          {/* Y-axis line */}
          <line x1="70" y1="10" x2="70" y2="190" stroke="#ccc" strokeWidth="1"/>
          
          {/* X-axis line */}
          <line x1="70" y1="190" x2="450" y2="190" stroke="#ccc" strokeWidth="1"/>
        </svg>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <p>
            Latest {trendData.length} data points •{" "}
            {type === "wpm" ? "Words per minute" : "Accuracy percentage"}
          </p>
          <div className="text-xs">
            <span className="font-medium">Range:</span> {minValue.toFixed(type === "wpm" ? 0 : 1)} - {maxValue.toFixed(type === "wpm" ? 0 : 1)}{type === "accuracy" ? "%" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}


/**
 * UserStatsIsland - Main user statistics dashboard component
 *
 * This Fresh island component provides a comprehensive view of user performance data.
 * It integrates with UserStatsManager to display:
 *
 * Features:
 * - Overall performance metrics (WPM, accuracy, games played)
 * - Game history table with detailed results
 * - Performance trends and progress tracking
 * - Data export/import functionality for backup
 * - Data clearing option for privacy
 *
 * Data Operations:
 * - Loads data from UserStatsManager on mount
 * - Provides export functionality to download JSON file
 * - Supports import to restore backed up data
 * - Offers complete data clearing with confirmation
 *
 * Privacy: All operations are local - no server communication
 */
export default function UserStatsIsland() {
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [progressSummary, setProgressSummary] = useState<
    ProgressSummary | null
  >(null);
  const [trends, setTrends] = useState<PerformanceTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const userStatsManager = UserStatsManager.getInstance();
        await userStatsManager.initialize();

        const userStats = await userStatsManager.getUserStats();
        const progress = userStatsManager.getProgressSummary();
        const performanceTrends = userStatsManager.getPerformanceTrends();

        setStats(userStats);
        setProgressSummary(progress);
        setTrends(performanceTrends);
      } catch (err) {
        console.error("Failed to load user stats:", err);
        setError("Failed to load statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleExportStats = async () => {
    try {
      const userStatsManager = UserStatsManager.getInstance();
      const exportData = await userStatsManager.exportStats();

      const blob = new Blob([exportData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `typetutor-stats-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export stats:", err);
      alert("Failed to export statistics. Please try again.");
    }
  };

  const handleImportStats = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const userStatsManager = UserStatsManager.getInstance();
      const success = await userStatsManager.importStats(text);

      if (success) {
        // Reload stats after import
        const userStats = await userStatsManager.getUserStats();
        const progress = userStatsManager.getProgressSummary();
        const performanceTrends = userStatsManager.getPerformanceTrends();

        setStats(userStats);
        setProgressSummary(progress);
        setTrends(performanceTrends);

        alert("Statistics imported successfully!");
      } else {
        alert("Failed to import statistics. Please check the file format.");
      }
    } catch (err) {
      console.error("Failed to import stats:", err);
      alert("Failed to import statistics. Please try again.");
    }

    // Reset the file input
    target.value = "";
  };

  const handleClearStats = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all statistics? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const userStatsManager = UserStatsManager.getInstance();
      await userStatsManager.clearStats();

      // Reload empty stats
      const userStats = await userStatsManager.getUserStats();
      const progress = userStatsManager.getProgressSummary();
      const performanceTrends = userStatsManager.getPerformanceTrends();

      setStats(userStats);
      setProgressSummary(progress);
      setTrends(performanceTrends);

      alert("Statistics cleared successfully!");
    } catch (err) {
      console.error("Failed to clear stats:", err);
      alert("Failed to clear statistics. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500">
        </div>
        <span className="ml-2 text-gray-600">Loading statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          type="button"
          onClick={() => globalThis.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No statistics available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Best WPM"
          value={stats.bestWPM.toFixed(1)}
          subtitle="Personal best"
          color="green"
        />
        <StatsCard
          title="Average WPM"
          value={stats.averageWPM.toFixed(1)}
          subtitle="Overall average"
          color="blue"
        />
        <StatsCard
          title="Average Accuracy"
          value={`${stats.averageAccuracy.toFixed(1)}%`}
          subtitle="Overall average"
          color="yellow"
        />
        <StatsCard
          title="Total Games"
          value={stats.totalGamesCompleted}
          subtitle="Games completed"
          color="gray"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Time"
          value={formatTime(stats.totalTimeSpent)}
          subtitle="Time spent typing"
          color="blue"
        />
        <StatsCard
          title="Characters Typed"
          value={stats.totalCharactersTyped.toLocaleString()}
          subtitle="Total characters"
          color="green"
        />
        <StatsCard
          title="Current Streak"
          value={progressSummary?.currentStreak || 0}
          subtitle="Games with 95%+ accuracy"
          color="yellow"
        />
      </div>


      {/* Performance Trends */}
      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceTrendChart data={trends} type="wpm" />
          <PerformanceTrendChart data={trends} type="accuracy" />
        </div>
      )}

      {/* Recent Games */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Games</h2>
          <span className="text-sm text-gray-500">
            Showing last {Math.min(10, stats.gameHistory.length)} games
          </span>
        </div>
        <GameHistoryTable games={stats.gameHistory.slice(-10)} />
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Data Management</h2>
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={handleExportStats}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Export Stats
          </button>

          <label className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer">
            Import Stats
            <input
              type="file"
              accept=".json"
              onChange={handleImportStats}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleClearStats}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Clear All Stats
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Export your statistics for backup or import previously exported data.
        </p>
      </div>
    </div>
  );
}
