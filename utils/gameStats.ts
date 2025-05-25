// In-memory storage for game statistics
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

const gameStats: GameStats = {};

export default gameStats;
