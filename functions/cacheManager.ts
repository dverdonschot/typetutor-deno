import type {
  CacheOptions,
  FetchResult,
  Quote,
  QuoteCache,
} from "../types/quotes.ts";
import { scanAllQuoteContent } from "./contentScanner.ts";
import { extractQuoteSummary, parseQuoteFile } from "./quoteParser.ts";
import {
  clearQuoteCache,
  createQuoteCache,
  getCacheStats,
  removeCachedCategory,
  removeCachedLanguage,
  removeCachedQuoteMetadata,
  updateCachedCategories,
  updateCachedLanguages,
  updateCachedQuoteMetadata,
} from "../utils/quoteCache.ts";

/** Global cache instance. */
let globalCache: QuoteCache | null = null;

/** Gets or creates the global cache instance. */
export function getQuoteCache(): QuoteCache {
  if (!globalCache) {
    globalCache = createQuoteCache();
  }
  return globalCache;
}

/** Builds the initial quote cache by scanning the directory structure. */
export async function buildQuoteCache(
  basePath: string = "./static/content/quotes",
  options: CacheOptions = {},
): Promise<FetchResult<QuoteCache>> {
  try {
    const cache = getQuoteCache();

    // Clear existing cache
    clearQuoteCache(cache);

    // Scan all content
    const scanResult = await scanAllQuoteContent(basePath);
    if (!scanResult.success) {
      return scanResult;
    }

    const { languages, categories, quotesMetadata } = scanResult.content;

    // Update cache with scanned data
    updateCachedLanguages(cache, languages);

    for (const [languageCode, cats] of categories.entries()) {
      updateCachedCategories(cache, languageCode, cats);
    }

    // Process quote metadata to get actual quote counts
    for (const [key, metadata] of quotesMetadata.entries()) {
      const processedMetadata = await Promise.all(
        metadata.map(async (meta) => {
          try {
            // Read and parse the file to get accurate quote count and summary
            const content = await Deno.readTextFile(meta.filePath);
            const parseResult = parseQuoteFile(content, {
              validateFormat: true,
            });

            if (parseResult.success) {
              const summary = extractQuoteSummary(parseResult.content);
              return {
                ...meta,
                quoteCount: summary.quoteCount,
                tags: summary.commonTags,
                difficulty: summary.averageDifficulty,
              };
            } else {
              console.warn(
                `Failed to parse ${meta.filePath}: ${parseResult.error}`,
              );
              return meta; // Return original metadata if parsing fails
            }
          } catch (error) {
            console.warn(`Failed to read ${meta.filePath}: ${error}`);
            return meta; // Return original metadata if reading fails
          }
        }),
      );

      const [languageCode, categoryName] = key.split("/");
      updateCachedQuoteMetadata(
        cache,
        languageCode,
        categoryName,
        processedMetadata,
      );
    }

    // Setup file watchers if enabled
    if (options.watchFiles) {
      await setupFileWatchers(cache, basePath);
    }

    console.log(`Quote cache built successfully:`, getCacheStats(cache));

    return { success: true, content: cache };
  } catch (error) {
    return {
      success: false,
      error: `Failed to build quote cache: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    };
  }
}

/** Refreshes a specific part of the cache. */
export async function refreshCacheSection(
  cache: QuoteCache,
  basePath: string,
  languageCode?: string,
  categoryName?: string,
): Promise<FetchResult<void>> {
  try {
    if (languageCode && categoryName) {
      // Refresh specific category
      const { scanQuoteFiles } = await import("./contentScanner.ts");
      const filesResult = await scanQuoteFiles(
        basePath,
        languageCode,
        categoryName,
      );

      if (filesResult.success) {
        // Process metadata with quote counts
        const processedMetadata = await Promise.all(
          filesResult.content.map(async (meta) => {
            try {
              const content = await Deno.readTextFile(meta.filePath);
              const parseResult = parseQuoteFile(content, {
                validateFormat: true,
              });

              if (parseResult.success) {
                const summary = extractQuoteSummary(parseResult.content);
                return {
                  ...meta,
                  quoteCount: summary.quoteCount,
                  tags: summary.commonTags,
                  difficulty: summary.averageDifficulty,
                };
              }
              return meta;
            } catch {
              return meta;
            }
          }),
        );

        updateCachedQuoteMetadata(
          cache,
          languageCode,
          categoryName,
          processedMetadata,
        );
        console.log(`Refreshed cache for ${languageCode}/${categoryName}`);
      }
    } else if (languageCode) {
      // Refresh specific language
      const { scanQuoteCategories } = await import("./contentScanner.ts");
      const categoriesResult = await scanQuoteCategories(
        basePath,
        languageCode,
      );

      if (categoriesResult.success) {
        updateCachedCategories(cache, languageCode, categoriesResult.content);

        // Refresh all categories for this language
        for (const category of categoriesResult.content) {
          await refreshCacheSection(
            cache,
            basePath,
            languageCode,
            category.directory,
          );
        }

        console.log(`Refreshed cache for language ${languageCode}`);
      }
    } else {
      // Full refresh
      const buildResult = await buildQuoteCache(basePath);
      if (!buildResult.success) {
        return { success: false, error: buildResult.error };
      }
    }

    return { success: true, content: undefined };
  } catch (error) {
    return {
      success: false,
      error: `Failed to refresh cache section: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    };
  }
}

/** Invalidates cache entries based on file path changes. */
export async function invalidateCacheEntry(
  cache: QuoteCache,
  basePath: string,
  changedPath: string,
): Promise<void> {
  try {
    const relativePath = changedPath.replace(basePath + "/", "");
    const pathParts = relativePath.split("/");

    if (pathParts.length >= 2) {
      const languageCode = pathParts[0];
      const categoryName = pathParts[1];

      if (pathParts.length === 2) {
        // Directory change (language or category level)
        if (pathParts[1] === "languages.json") {
          // Languages metadata changed, refresh all languages
          await refreshCacheSection(cache, basePath);
        } else {
          // Category directory changed
          await refreshCacheSection(cache, basePath, languageCode);
        }
      } else if (pathParts.length >= 3) {
        const fileName = pathParts[2];

        if (fileName === "category.json") {
          // Category metadata changed
          await refreshCacheSection(cache, basePath, languageCode);
        } else if (fileName.endsWith(".json") || fileName.endsWith(".txt")) {
          // Quote file changed
          await refreshCacheSection(
            cache,
            basePath,
            languageCode,
            categoryName,
          );
        }
      }
    }

    console.log(`Cache invalidated for path: ${changedPath}`);
  } catch (error) {
    console.error(
      `Failed to invalidate cache entry for ${changedPath}:`,
      error,
    );
  }
}

/** Sets up file watchers for automatic cache invalidation. */
export async function setupFileWatchers(
  cache: QuoteCache,
  basePath: string,
): Promise<void> {
  try {
    // Close existing watchers
    for (const watcher of cache.fileWatchers.values()) {
      try {
        watcher.close();
      } catch {
        // Ignore errors when closing
      }
    }
    cache.fileWatchers.clear();

    // Create new watcher for the entire quotes directory
    const watcher = Deno.watchFs(basePath);
    cache.fileWatchers.set(basePath, watcher);

    // Start watching for changes
    (async () => {
      try {
        for await (const event of watcher) {
          if (
            event.kind === "create" || event.kind === "modify" ||
            event.kind === "remove"
          ) {
            // Debounce multiple rapid changes
            setTimeout(() => {
              for (const path of event.paths) {
                invalidateCacheEntry(cache, basePath, path);
              }
            }, 100);
          }
        }
      } catch (error) {
        console.error("File watcher error:", error);
      }
    })();

    console.log(`File watcher setup for: ${basePath}`);
  } catch (error) {
    console.error(`Failed to setup file watchers: ${error}`);
  }
}

/** Removes file watchers (useful for cleanup). */
export function removeFileWatchers(cache: QuoteCache): void {
  for (const watcher of cache.fileWatchers.values()) {
    try {
      watcher.close();
    } catch {
      // Ignore errors when closing
    }
  }
  cache.fileWatchers.clear();
  console.log("File watchers removed");
}

/** Gets cache performance metrics. */
export function getCachePerformanceMetrics(cache: QuoteCache): {
  stats: ReturnType<typeof getCacheStats>;
  memoryUsage: {
    languagesSize: number;
    categoriesSize: number;
    quotesMetadataSize: number;
  };
} {
  const stats = getCacheStats(cache);

  // Estimate memory usage (rough calculation)
  const languagesSize = JSON.stringify(cache.languages).length;
  const categoriesSize = JSON.stringify([...cache.categories.entries()]).length;
  const quotesMetadataSize =
    JSON.stringify([...cache.quotesMetadata.entries()]).length;

  return {
    stats,
    memoryUsage: {
      languagesSize,
      categoriesSize,
      quotesMetadataSize,
    },
  };
}
