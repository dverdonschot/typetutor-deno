import { PageProps } from "$fresh/server.ts";
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

export default function StatsPage() {
  const [stats, setStats] = useState<GameStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const response = await fetch("/api/game-stats");
      const data = await response.json();
      setStats(data);
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1>Game Statistics</h1>
      {stats ? (
        <div>
          {Object.keys(stats).map((gameType) => (
            <div key={gameType} style={{ marginBottom: '20px' }}>
              <h2>{gameType.charAt(0).toUpperCase() + gameType.slice(1)}</h2>
              {/* Display total finished for the game type if no categories */}
              {!stats[gameType].categories && <p>Finished: {stats[gameType].finished}</p>}

              {stats[gameType].categories && Object.keys(stats[gameType].categories).length > 0 && (
                <div style={{ marginLeft: '20px' }}>
                  <h3>Categories:</h3>
                  {Object.keys(stats[gameType].categories!).map((category) => (
                    <div key={category}>
                      <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                      <p>Finished: {stats[gameType].categories![category].finished}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Loading statistics...</p>
      )}
    </div>
  );
}