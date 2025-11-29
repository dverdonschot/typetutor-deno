import {
  buildQuoteCache,
  getQuoteCache,
} from "../../../../../functions/cacheManager.ts";
import {
  getCachedQuoteMetadata,
  isCacheEmpty,
} from "../../../../../utils/quoteCache.ts";
import { Handlers } from "fresh/compat";

export const handler: Handlers = {
  /** Returns quote file metadata for a specific language and category from cache. */
  async GET(ctx) {
    try {
      const languageCode = ctx.params.lang;
      const categoryName = ctx.params.category;

      if (!languageCode) {
        return new Response(
          JSON.stringify({ error: "Language code not provided" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (!categoryName) {
        return new Response(
          JSON.stringify({ error: "Category name not provided" }),
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

      const metadata = getCachedQuoteMetadata(
        cache,
        languageCode,
        categoryName,
      );

      return new Response(JSON.stringify(metadata), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300", // 5 minutes cache
        },
      });
    } catch (error) {
      console.error(
        `Error fetching metadata for ${ctx.params.lang}/${ctx.params.category}:`,
        error,
      );
      return new Response(
        JSON.stringify({
          error: "Failed to fetch quote metadata",
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
