import { define } from "../../../utils.ts";
import {
  buildQuoteCache,
  getQuoteCache,
  refreshCacheSection,
} from "../../../functions/cacheManager.ts";
import { getCachePerformanceMetrics } from "../../../functions/cacheManager.ts";

// The quotes tree is fixed at build time and is never accepted from
// the request: the basePath query parameter this endpoint used to
// accept turned it into an unauthenticated arbitrary file read
// (Deno runs with filesystem access). The endpoint keeps its purpose
// — manually rebuilding/refreshing the quote cache — with the path
// pinned to the app's own content directory.
const QUOTES_BASE_PATH = "./static/content/quotes";

export const handler = define.handlers({
  /** Manually refreshes the quote cache. */
  async POST(ctx) {
    try {
      const url = new URL(ctx.req.url);
      const language = url.searchParams.get("lang");
      const category = url.searchParams.get("category");
      const cache = getQuoteCache();

      let result;

      if (language && category) {
        result = await refreshCacheSection(
          cache,
          QUOTES_BASE_PATH,
          language,
          category,
        );
      } else if (language) {
        result = await refreshCacheSection(
          cache,
          QUOTES_BASE_PATH,
          language,
        );
      } else {
        result = await buildQuoteCache(QUOTES_BASE_PATH);
      }

      if (!result.success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: result.error || "Failed to refresh cache",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Get updated cache metrics
      const metrics = getCachePerformanceMetrics(getQuoteCache());

      return new Response(
        JSON.stringify({
          success: true,
          refreshed: { language, category },
          cache: {
            stats: metrics.stats,
            memoryUsage: metrics.memoryUsage,
          },
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Error refreshing cache:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to refresh cache",
          details: error instanceof Error ? error.message : "unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },

  /** Gets current cache status and metrics. */
  GET() {
    try {
      const cache = getQuoteCache();
      const metrics = getCachePerformanceMetrics(cache);

      return new Response(
        JSON.stringify({
          stats: metrics.stats,
          memoryUsage: metrics.memoryUsage,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Error getting cache status:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to get cache status",
          details: error instanceof Error ? error.message : "unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
});
