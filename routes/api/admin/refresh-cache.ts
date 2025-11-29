import {
  buildQuoteCache,
  getQuoteCache,
  refreshCacheSection,
} from "../../../functions/cacheManager.ts";
import { getCachePerformanceMetrics } from "../../../functions/cacheManager.ts";
import { Handlers } from "fresh/compat";

export const handler: Handlers = {
  /** Manually refreshes the quote cache. */
  async POST(ctx) {
    const req = ctx.req;

    try {
      const url = new URL(req.url);
      const language = url.searchParams.get("lang");
      const category = url.searchParams.get("category");
      const basePath = url.searchParams.get("basePath") ||
        "./static/content/quotes";

      let result;

      if (language && category) {
        // Refresh specific category
        const cache = getQuoteCache();
        result = await refreshCacheSection(cache, basePath, language, category);
      } else if (language) {
        // Refresh specific language
        const cache = getQuoteCache();
        result = await refreshCacheSection(cache, basePath, language);
      } else {
        // Full cache rebuild
        result = await buildQuoteCache(basePath, { watchFiles: true });
      }

      if (!result.success) {
        return new Response(
          JSON.stringify({
            error: "Cache refresh failed",
            details: result.error,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Get updated cache metrics
      const cache = getQuoteCache();
      const metrics = getCachePerformanceMetrics(cache);

      return new Response(
        JSON.stringify({
          success: true,
          message: language && category
            ? `Cache refreshed for ${language}/${category}`
            : language
            ? `Cache refreshed for language ${language}`
            : "Full cache rebuild completed",
          metrics: metrics.stats,
          memoryUsage: metrics.memoryUsage,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Error refreshing cache:", error);
      return new Response(
        JSON.stringify({
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
          status: "active",
          metrics: metrics.stats,
          memoryUsage: metrics.memoryUsage,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache", // Don't cache admin endpoints
          },
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
};
