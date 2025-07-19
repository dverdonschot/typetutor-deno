import { useEffect, useState } from "preact/hooks";

interface GameStats {
  [gameType: string]: {
    finished: number;
    categories?: {
      [category: string]: {
        finished: number;
      };
    };
  };
}

interface StatCardProps {
  title: string;
  count: number;
  color?: "blue" | "green" | "yellow" | "red" | "gray";
}

function StatCard({ title, count, color = "blue" }: StatCardProps) {
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
      <p className="text-2xl font-bold text-gray-900">{count}</p>
      <p className="text-xs text-gray-500 mt-1">games completed</p>
    </div>
  );
}

interface CategoryStatsProps {
  gameType: string;
  categories: { [category: string]: { finished: number } };
}

function CategoryStats({ gameType, categories }: CategoryStatsProps) {
  if (gameType === "Trigraphs") {
    // Special compact handling for Trigraphs
    const sortedCategories = Object.entries(categories)
      .map(([category, data]) => ({ category, finished: data.finished }))
      .sort((a, b) => b.finished - a.finished);

    return (
      <div className="bg-white rounded-lg p-4 mt-4">
        <h3 className="text-lg font-semibold mb-3">Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
          {sortedCategories.map(({ category, finished }) => (
            <div
              key={category}
              className="flex justify-between items-center bg-gray-50 rounded px-2 py-1"
            >
              <span className="font-medium text-gray-700">{category}:</span>
              <span className="text-gray-900">{finished}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Standard handling for other game types
  return (
    <div className="bg-white rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold mb-3">Categories</h3>
      <div className="space-y-3">
        {Object.entries(categories).map(([category, data]) => (
          <div key={category} className="border-l-4 border-blue-200 pl-4">
            <h4 className="font-medium text-gray-900">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h4>
            <p className="text-gray-600">
              <span className="font-semibold">{data.finished}</span>{" "}
              games completed
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to calculate total games for a game type
  const getTotalGamesCompleted = (
    gameData: {
      finished: number;
      categories?: { [key: string]: { finished: number } };
    },
  ) => {
    if (gameData.categories && Object.keys(gameData.categories).length > 0) {
      // Sum all category counts
      return Object.values(gameData.categories).reduce(
        (sum, category) => sum + category.finished,
        0,
      );
    }
    // Fall back to the base finished count if no categories
    return gameData.finished;
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/game-stats");
        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-600">
          <div className="animate-pulse">Loading game statistics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600 bg-red-100 rounded-md p-4">
          Error loading statistics: {error}
        </div>
      </div>
    );
  }

  if (!stats || Object.keys(stats).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <p>No game statistics available yet.</p>
          <p className="text-sm mt-2">
            Complete some typing games to see your progress!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Server Game Completion Statistics
      </h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(stats).map(([gameType, data]) => {
          const colors = ["blue", "green", "yellow", "red", "gray"] as const;
          const colorIndex = Object.keys(stats).indexOf(gameType) %
            colors.length;

          return (
            <StatCard
              key={gameType}
              title={gameType.charAt(0).toUpperCase() + gameType.slice(1)}
              count={getTotalGamesCompleted(data)}
              color={colors[colorIndex]}
            />
          );
        })}
      </div>

      {/* Detailed Statistics */}
      <div className="space-y-6">
        {Object.entries(stats).map(([gameType, data]) => (
          <div key={gameType}>
            <div className="border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {gameType.charAt(0).toUpperCase() + gameType.slice(1)} Details
              </h3>
              <p className="text-gray-600">
                Total completed:{" "}
                <span className="font-semibold">
                  {getTotalGamesCompleted(data)}
                </span>{" "}
                games
              </p>
            </div>

            {data.categories && Object.keys(data.categories).length > 0 && (
              <CategoryStats gameType={gameType} categories={data.categories} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
