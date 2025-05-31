// Define the interface for game statistics
interface GameStats {
  [gameType: string]: {
    finished: number;
    categories?: { // Optional nested categories
      [category: string]: {
        finished: number;
      };
    };
  };
}

// Determine if we are using Deno KV based on environment variable
let kv: Deno.Kv | undefined;

// Initialize Deno KV
async function initKv() {
  if (!kv) {
    try {
      kv = await Deno.openKv();
      console.log("Deno KV initialized.");
    } catch (error) {
      console.error("Failed to initialize Deno KV:", error);
      // Log error but don't prevent the application from running
    }
  }
}

// Load stats from Deno KV
async function loadStats(): Promise<GameStats> {
  await initKv(); // Ensure KV is initialized
  if (kv) {
    try {
      const entries = kv.list({ prefix: ["gameStats"] });
      const stats: GameStats = {};
      for await (const entry of entries) {
        const key = entry.key[1] as string; // Assuming the key is ["gameStats", gameType]
        stats[key] = entry.value as GameStats[string];
      }
      return stats;
    } catch (error) {
      console.error("Failed to load stats from Deno KV:", error);
      return {}; // Return empty stats on failure
    }
  } else {
    return {}; // Return empty stats if KV is not initialized
  }
}

// Save stats to Deno KV
async function saveStats(stats: GameStats): Promise<void> {
  await initKv(); // Ensure KV is initialized
  if (kv) {
    try {
      const atomic = kv.atomic();
      // Clear existing stats before writing new ones (simple approach, can be optimized)
      const entries = kv.list({ prefix: ["gameStats"] });
      for await (const entry of entries) {
        atomic.delete(entry.key);
      }
      // Write new stats
      for (const gameType in stats) {
        atomic.set(["gameStats", gameType], stats[gameType]);
      }
      await atomic.commit();
    } catch (error) {
      console.error("Failed to save stats to Deno KV:", error);
      // Log the error but don't prevent the application from running
    }
  }
}

// Get current stats
export function getGameStats(): Promise<GameStats> {
  return loadStats();
}

// Update stats
export async function updateGameStats(
  gameType: string,
  category?: string,
  isFinished?: boolean,
): Promise<GameStats> {
  const currentStats = await loadStats();

  if (!currentStats[gameType]) {
    currentStats[gameType] = { finished: 0 };
  }

  if (category) {
    if (!currentStats[gameType].categories) {
      currentStats[gameType].categories = {};
    }
    if (!currentStats[gameType].categories[category]) {
      currentStats[gameType].categories[category] = { finished: 0 };
    }
    if (isFinished) {
      currentStats[gameType].categories[category].finished++;
    }
  } else {
    if (isFinished) {
      currentStats[gameType].finished++;
    }
  }

  await saveStats(currentStats);
  return currentStats;
}
