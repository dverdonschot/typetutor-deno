import { define } from "../../../utils.ts";
import {
  buildQuoteCache,
  getQuoteCache,
  refreshCacheSection,
} from "../../../functions/cacheManager.ts";
import { getCachePerformanceMetrics } from "../../../functions/cacheManager.ts";

export const handler = define.handlers({
  /** Manually refreshes the quote cache. */
  async POST(ctx) {
    try {
      const url = new URL(ctx.req.url);
      const language = url.searchParams.get("lang");
      const category = url.searchParams.get("category");
      const basePath = url.searchParams.get("basePath") ||
        "./static/content/quotes";

      let result;

      if (language && category) {
        result = await refreshCacheSection(basePath, language, category);
      } else if (language) {
        result = await refreshCacheSection(basePath, language);
      } else {
        result = await buildQuoteCache(basePath);
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
      const cache = getQuoteCache();
      const metrics = getCachePerformanceMetrics(cache);

      return new Response(
        JSON.stringify({
          success: true,
          refreshed: { language, category },
          cache: {
            size: cache.size,
            hitRate: metrics.hitRate,
            missRate: metrics.missRate,
            totalHits: metrics.totalHits,
            totalMisses: metrics.totalMisses,
            lastRefreshed: cache.lastUpdated,
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
  GET(_ctx) {
    try {
      const cache = getQuoteCache();
      const metrics = getCachePerformanceMetrics(cache);

      return new Response(
        JSON.stringify({
          size: cache.size,
          hitRate: metrics.hitRate,
          missRate: metrics.missRate,
          totalHits: metrics.totalHits,
          totalMisses: metrics.totalMisses,
          lastRefreshed: cache.lastUpdated,
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
