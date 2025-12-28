import {
  buildQuoteCache,
  getQuoteCache,
} from "../../../../functions/cacheManager.ts";
import {
  getCachedCategories,
  isCacheEmpty,
} from "../../../../utils/quoteCache.ts";
import { Handlers } from "fresh/compat";

export const handler: Handlers = {
  /** Returns all categories for a specific language from cache. */
  async GET(ctx) {
    try {
      const languageCode = ctx.params.lang;

      if (!languageCode) {
        return new Response(
          JSON.stringify({ error: "Language code not provided" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

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

      const categories = getCachedCategories(cache, languageCode);

      return new Response(JSON.stringify(categories), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300", // 5 minutes cache
        },
      });
    } catch (error) {
      console.error(
        `Error fetching categories for language ${ctx.params.lang}:`,
        error,
      );
      return new Response(
        JSON.stringify({
          error: "Failed to fetch quote categories",
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
