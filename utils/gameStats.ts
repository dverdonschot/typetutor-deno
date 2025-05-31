import { join } from "https://deno.land/std/path/mod.ts";

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
let useDenoKv = Deno.env.get("USE_DENO_KV") === "true";
const kvPath = Deno.env.get("DENO_KV_PATH");

let kv: Deno.Kv | undefined;
let inMemoryStats: GameStats = {};

// Initialize Deno KV if enabled
async function initKv() {
  if (useDenoKv) {
    try {
      kv = await Deno.openKv(kvPath ? join(Deno.cwd(), kvPath) : undefined);
      console.log("Deno KV initialized.");
    } catch (error) {
      console.error("Failed to initialize Deno KV:", error);
      // Fallback to in-memory storage if KV fails
      useDenoKv = false;
      console.log("Falling back to in-memory storage.");
    }
  }
}

// Load stats from Deno KV or return in-memory stats
async function loadStats(): Promise<GameStats> {
  if (useDenoKv && kv) {
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
      // Fallback to in-memory storage if loading fails
      useDenoKv = false;
      console.log("Falling back to in-memory storage.");
      return inMemoryStats;
    }
  } else {
    return inMemoryStats;
  }
}

// Save stats to Deno KV or update in-memory stats
async function saveStats(stats: GameStats): Promise<void> {
  if (useDenoKv && kv) {
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
      // If saving to KV fails, log the error but don't necessarily switch back to in-memory
      // as the in-memory state might be inconsistent with the failed KV write.
    }
  } else {
    inMemoryStats = stats;
  }
}

// Get current stats
export async function getGameStats(): Promise<GameStats> {
  await initKv(); // Ensure KV is initialized before loading
  return loadStats();
}

// Update stats
export async function updateGameStats(
  gameType: string,
  category?: string,
  isFinished?: boolean,
): Promise<GameStats> {
  await initKv(); // Ensure KV is initialized before loading/saving
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

// Export the initialization function if needed elsewhere
export { initKv };
