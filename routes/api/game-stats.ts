import { Handlers } from "$fresh/server.ts";
import { getGameStats, updateGameStats } from "../../utils/gameStats.ts";

export const handler: Handlers = {
  async GET(_req, _ctx) {
    const stats = await getGameStats();
    return new Response(JSON.stringify(stats), {
      headers: { "Content-Type": "application/json" },
    });
  },

  async POST(req) {
    try {
      const { gameType, category, isFinished } = await req.json();
      const updatedStats = await updateGameStats(gameType, category, isFinished);

      return new Response(JSON.stringify({ success: true, gameStats: updatedStats }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "An unknown error occurred";
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};
