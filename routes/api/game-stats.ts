import { Handlers } from "$fresh/server.ts";
import gameStats from "../../utils/gameStats.ts";

export const handler: Handlers = {
  GET(_req, _ctx) {
    return new Response(JSON.stringify(gameStats), {
      headers: { "Content-Type": "application/json" },
    });
  },

  async POST(req) {
    try {
      const { gameType, category, isFinished } = await req.json();

      if (!gameStats[gameType]) {
        gameStats[gameType] = { finished: 0 };
      }

      if (category) {
        if (!gameStats[gameType].categories) {
          gameStats[gameType].categories = {};
        }
        if (!gameStats[gameType].categories[category]) {
          gameStats[gameType].categories[category] = { finished: 0 };
        }
        if (isFinished) {
          gameStats[gameType].categories[category].finished++;
        }
      } else {
        if (isFinished) {
          gameStats[gameType].finished++;
        }
      }

      return new Response(JSON.stringify({ success: true, gameStats }), {
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
