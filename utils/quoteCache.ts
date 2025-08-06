import type {
  CacheOptions as _CacheOptions,
  Category,
  Language,
  QuoteCache,
  QuoteMetadata,
} from "../types/quotes.ts";

/** Creates a new empty quote cache. */
export function createQuoteCache(): QuoteCache {
  return {
    languages: [],
    categories: new Map(),
    quotesMetadata: new Map(),
    lastUpdated: new Date(),
    fileWatchers: new Map(),
  };
}

/** Gets cached languages. */
export function getCachedLanguages(cache: QuoteCache): Language[] {
  return [...cache.languages];
}

/** Gets cached categories for a specific language. */
export function getCachedCategories(
  cache: QuoteCache,
  languageCode: string,
): Category[] {
  return cache.categories.get(languageCode) || [];
}

/** Gets cached quote metadata for a language/category combination. */
export function getCachedQuoteMetadata(
  cache: QuoteCache,
  languageCode: string,
  categoryName: string,
): QuoteMetadata[] {
  const key = `${languageCode}/${categoryName}`;
  return cache.quotesMetadata.get(key) || [];
}

/** Updates the languages in the cache. */
export function updateCachedLanguages(
  cache: QuoteCache,
  languages: Language[],
): void {
  cache.languages = [...languages];
  cache.lastUpdated = new Date();
}

/** Updates the categories for a specific language in the cache. */
export function updateCachedCategories(
  cache: QuoteCache,
  languageCode: string,
  categories: Category[],
): void {
  cache.categories.set(languageCode, [...categories]);
  cache.lastUpdated = new Date();
}

/** Updates the quote metadata for a language/category combination. */
export function updateCachedQuoteMetadata(
  cache: QuoteCache,
  languageCode: string,
  categoryName: string,
  metadata: QuoteMetadata[],
): void {
  const key = `${languageCode}/${categoryName}`;
  cache.quotesMetadata.set(key, [...metadata]);
  cache.lastUpdated = new Date();
}

/** Removes a language from the cache. */
export function removeCachedLanguage(
  cache: QuoteCache,
  languageCode: string,
): void {
  // Remove language from languages array
  cache.languages = cache.languages.filter((lang) =>
    lang.code !== languageCode
  );

  // Remove categories for this language
  cache.categories.delete(languageCode);

  // Remove all quote metadata for this language
  const keysToDelete: string[] = [];
  for (const key of cache.quotesMetadata.keys()) {
    if (key.startsWith(`${languageCode}/`)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach((key) => cache.quotesMetadata.delete(key));

  cache.lastUpdated = new Date();
}

/** Removes a category from the cache. */
export function removeCachedCategory(
  cache: QuoteCache,
  languageCode: string,
  categoryName: string,
): void {
  // Remove category from categories map
  const categories = cache.categories.get(languageCode) || [];
  const updatedCategories = categories.filter((cat) =>
    cat.directory !== categoryName
  );
  cache.categories.set(languageCode, updatedCategories);

  // Remove quote metadata for this category
  const key = `${languageCode}/${categoryName}`;
  cache.quotesMetadata.delete(key);

  cache.lastUpdated = new Date();
}

/** Removes specific quote metadata from the cache. */
export function removeCachedQuoteMetadata(
  cache: QuoteCache,
  languageCode: string,
  categoryName: string,
  fileName: string,
): void {
  const key = `${languageCode}/${categoryName}`;
  const metadata = cache.quotesMetadata.get(key) || [];
  const updatedMetadata = metadata.filter((meta) => meta.fileName !== fileName);
  cache.quotesMetadata.set(key, updatedMetadata);

  cache.lastUpdated = new Date();
}

/** Clears all cached data. */
export function clearQuoteCache(cache: QuoteCache): void {
  cache.languages = [];
  cache.categories.clear();
  cache.quotesMetadata.clear();

  // Close all file watchers
  for (const watcher of cache.fileWatchers.values()) {
    try {
      watcher.close();
    } catch {
      // Ignore errors when closing watchers
    }
  }
  cache.fileWatchers.clear();

  cache.lastUpdated = new Date();
}

/** Gets cache statistics for monitoring. */
export function getCacheStats(cache: QuoteCache): {
  languageCount: number;
  categoryCount: number;
  totalCategories: number;
  quoteFileCount: number;
  totalQuoteFiles: number;
  lastUpdated: Date;
  fileWatcherCount: number;
} {
  let totalCategories = 0;
  for (const categories of cache.categories.values()) {
    totalCategories += categories.length;
  }

  let totalQuoteFiles = 0;
  for (const metadata of cache.quotesMetadata.values()) {
    totalQuoteFiles += metadata.length;
  }

  return {
    languageCount: cache.languages.length,
    categoryCount: cache.categories.size,
    totalCategories,
    quoteFileCount: cache.quotesMetadata.size,
    totalQuoteFiles,
    lastUpdated: cache.lastUpdated,
    fileWatcherCount: cache.fileWatchers.size,
  };
}

/** Checks if the cache is empty. */
export function isCacheEmpty(cache: QuoteCache): boolean {
  return cache.languages.length === 0 &&
    cache.categories.size === 0 &&
    cache.quotesMetadata.size === 0;
}

/** Checks if the cache has data for a specific language. */
export function hasCachedLanguage(
  cache: QuoteCache,
  languageCode: string,
): boolean {
  return cache.languages.some((lang) => lang.code === languageCode);
}

/** Checks if the cache has data for a specific category. */
export function hasCachedCategory(
  cache: QuoteCache,
  languageCode: string,
  categoryName: string,
): boolean {
  const categories = cache.categories.get(languageCode) || [];
  return categories.some((cat) => cat.directory === categoryName);
}

/** Validates cache integrity and reports any issues. */
export function validateCacheIntegrity(cache: QuoteCache): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check that all categories reference valid languages
  for (const [languageCode, _categories] of cache.categories.entries()) {
    if (!cache.languages.some((lang) => lang.code === languageCode)) {
      issues.push(
        `Categories exist for language "${languageCode}" but language not in cache`,
      );
    }
  }

  // Check that all quote metadata references valid language/category combinations
  for (const key of cache.quotesMetadata.keys()) {
    const [languageCode, categoryName] = key.split("/");

    if (!cache.languages.some((lang) => lang.code === languageCode)) {
      issues.push(
        `Quote metadata exists for language "${languageCode}" but language not in cache`,
      );
    }

    const categories = cache.categories.get(languageCode) || [];
    if (!categories.some((cat) => cat.directory === categoryName)) {
      issues.push(
        `Quote metadata exists for category "${languageCode}/${categoryName}" but category not in cache`,
      );
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
