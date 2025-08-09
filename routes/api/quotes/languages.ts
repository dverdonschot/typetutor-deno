import { Handlers } from "$fresh/server.ts";
import {
  buildQuoteCache,
  getQuoteCache,
} from "../../../functions/cacheManager.ts";
import { getCachedLanguages, isCacheEmpty } from "../../../utils/quoteCache.ts";

export const handler: Handlers = {
  /** Returns all available quote languages from cache. */
  async GET(_req) {
    try {
      const cache = getQuoteCache();

      // If cache is empty, try to initialize it
      if (isCacheEmpty(cache)) {
        console.log("Cache is empty, attempting to build it...");
        const buildResult = await buildQuoteCache("./static/content/quotes");
        if (!buildResult.success) {
          console.error("Failed to build cache:", buildResult.error);
          return new Response(
            JSON.stringify({
              error: "Failed to build quote cache",
              details: buildResult.error,
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      }

      const languages = getCachedLanguages(cache);

      return new Response(JSON.stringify(languages), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300", // 5 minutes cache
        },
      });
    } catch (error) {
      console.error("Error fetching quote languages:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch quote languages",
          details: error instanceof Error ? error.message : "unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};
