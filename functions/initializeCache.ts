import { buildQuoteCache } from "./cacheManager.ts";

/** Initializes the quote cache on server startup. */
export async function initializeQuoteCache(): Promise<void> {
  try {
    console.log("🔄 Initializing quote cache...");
    const startTime = Date.now();

    const result = await buildQuoteCache("./static/content/quotes", {
      watchFiles: Deno.env.get("DENO_ENV") !== "test", // Enable file watching except in tests
    });

    if (!result.success) {
      console.error("❌ Failed to initialize quote cache:", result.error);
      console.warn("⚠️  Quote system will not be available");
      return;
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Quote cache initialized successfully in ${duration}ms`);

    // Log cache statistics
    const { getCachePerformanceMetrics } = await import("./cacheManager.ts");
    const cache = result.content;
    const metrics = getCachePerformanceMetrics(cache);

    console.log("📊 Cache statistics:", {
      languages: metrics.stats.languageCount,
      categories: metrics.stats.totalCategories,
      quoteFiles: metrics.stats.totalQuoteFiles,
      memoryUsage: `${
        Math.round(
          (metrics.memoryUsage.languagesSize +
            metrics.memoryUsage.categoriesSize +
            metrics.memoryUsage.quotesMetadataSize) / 1024,
        )
      }KB`,
    });
  } catch (error) {
    console.error("❌ Error during quote cache initialization:", error);
    console.warn("⚠️  Quote system may not work correctly");
  }
}
