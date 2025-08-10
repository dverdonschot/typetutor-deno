/** Core quote interface with rich metadata support. */
export interface Quote {
  text: string; // Required: The quote text
  language: string; // Required: ISO 639-1 code (en, es, fr, etc.)
  author?: string; // Optional: Quote attribution
  authorBio?: string; // Optional: Author biographical info (e.g., "Vlaams dichter (1919 - 2003)")
  year?: number; // Optional: Year quote was said/written
  source?: string; // Optional: Book, speech, interview, etc.
  tags?: string[]; // Optional: Thematic tags
  difficulty?: "beginner" | "intermediate" | "advanced";
}

/** Metadata about a quote file for caching purposes. */
export interface QuoteMetadata {
  id: string; // Unique identifier for the file
  fileName: string; // e.g., "george-washington.json"
  fileTitle: string; // e.g., "George Washington Quotes"
  quoteCount: number; // Number of quotes in this file
  language: string; // Primary language of the file
  category: string; // Category directory name
  tags?: string[]; // Common tags across quotes in file
  difficulty?: string; // Average difficulty of quotes in file
  filePath: string; // Full path for loading content
}

/** Language metadata for the cache. */
export interface Language {
  code: string; // ISO 639-1 code (en, es, fr)
  name: string; // Display name (English, Español, Français)
  flag?: string; // Optional flag emoji
}

/** Category metadata for the cache. */
export interface Category {
  name: string; // Category display name
  directory: string; // Directory name on filesystem
  description?: string; // Optional description
  icon?: string; // Optional icon/emoji
  difficulty?: string; // Optional difficulty indicator
}

/** Main cache structure for quote system. */
export interface QuoteCache {
  languages: Language[]; // All available languages
  categories: Map<string, Category[]>; // lang -> categories
  quotesMetadata: Map<string, QuoteMetadata[]>; // "lang/category" -> metadata
  lastUpdated: Date; // Cache timestamp
  fileWatchers: Map<string, Deno.FsWatcher>; // File watchers for invalidation
}

/** Options for parsing quote files. */
export interface ParseQuoteOptions {
  validateFormat?: boolean; // Validate quote format
  includeMetadata?: boolean; // Include metadata extraction
  filterByLanguage?: string; // Filter quotes by language
}

/** Options for cache operations. */
export interface CacheOptions {
  watchFiles?: boolean; // Enable file watching
  maxCacheSize?: number; // Maximum cache entries
  refreshInterval?: number; // Auto-refresh interval in ms
}

/** Result type for file operations (following existing pattern). */
export type FetchResult<T = string> =
  | { success: true; content: T }
  | { success: false; error: string };
