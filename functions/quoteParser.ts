import type { FetchResult, ParseQuoteOptions, Quote } from "../types/quotes.ts";

/** Detects the format of a quote file based on content. */
export function detectFileFormat(content: string): "json" | "text" {
  const trimmed = content.trim();

  // Check if content starts and ends with square brackets (JSON array)
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return "json";
  }

  // Check if content starts with curly brace (single JSON object)
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return "json";
  }

  return "text";
}

/** Validates a quote object against the expected schema. */
export function validateQuoteFormat(quote: Quote): boolean {
  // Required fields
  if (
    !quote.text || typeof quote.text !== "string" || quote.text.trim() === ""
  ) {
    return false;
  }

  if (
    !quote.language || typeof quote.language !== "string" ||
    quote.language.trim() === ""
  ) {
    return false;
  }

  // Optional field validation
  if (
    quote.author !== undefined &&
    (typeof quote.author !== "string" || quote.author.trim() === "")
  ) {
    return false;
  }

  if (
    quote.year !== undefined &&
    (typeof quote.year !== "number" || quote.year < 0)
  ) {
    return false;
  }

  if (
    quote.source !== undefined &&
    (typeof quote.source !== "string" || quote.source.trim() === "")
  ) {
    return false;
  }

  if (
    quote.authorBio !== undefined &&
    (typeof quote.authorBio !== "string" || quote.authorBio.trim() === "")
  ) {
    return false;
  }

  if (quote.tags !== undefined && !Array.isArray(quote.tags)) {
    return false;
  }

  if (quote.difficulty !== undefined) {
    const validDifficulties = ["beginner", "intermediate", "advanced"];
    if (!validDifficulties.includes(quote.difficulty)) {
      return false;
    }
  }

  return true;
}

/** Parses a JSON quote file and returns an array of Quote objects. */
export function parseJsonQuoteFile(
  content: string,
  options: ParseQuoteOptions = {},
): FetchResult<Quote[]> {
  try {
    const parsed = JSON.parse(content);

    // Ensure we have an array
    const quotes: unknown[] = Array.isArray(parsed) ? parsed : [parsed];

    const validQuotes: Quote[] = [];
    const errors: string[] = [];

    for (let i = 0; i < quotes.length; i++) {
      const quote = quotes[i] as Quote;

      // Validate format if requested
      if (options.validateFormat && !validateQuoteFormat(quote)) {
        errors.push(`Invalid quote format at index ${i}`);
        continue;
      }

      // Filter by language if requested
      if (
        options.filterByLanguage && quote.language !== options.filterByLanguage
      ) {
        continue;
      }

      validQuotes.push(quote);
    }

    if (errors.length > 0 && validQuotes.length === 0) {
      return {
        success: false,
        error: `Cannot parse quote file: ${errors.join(", ")}`,
      };
    }

    return { success: true, content: validQuotes };
  } catch (error) {
    return {
      success: false,
      error: `Cannot parse quote file: invalid JSON format - ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    };
  }
}

/** Parses a legacy text quote file and converts to Quote objects. */
export function parseTextQuoteFile(
  content: string,
  options: ParseQuoteOptions = {},
): FetchResult<Quote[]> {
  try {
    const lines = content.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return {
        success: false,
        error: "Cannot parse quote file: no valid quotes found",
      };
    }

    const quotes: Quote[] = lines.map((text) => ({
      text,
      language: options.filterByLanguage || "en", // Default to English for legacy files
    }));

    // Apply language filtering if needed
    const filteredQuotes = options.filterByLanguage
      ? quotes.filter((quote) => quote.language === options.filterByLanguage)
      : quotes;

    return { success: true, content: filteredQuotes };
  } catch (error) {
    return {
      success: false,
      error: `Cannot parse text quote file: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    };
  }
}

/** Main function to parse any quote file format. */
export function parseQuoteFile(
  content: string,
  options: ParseQuoteOptions = {},
): FetchResult<Quote[]> {
  const format = detectFileFormat(content);

  if (format === "json") {
    return parseJsonQuoteFile(content, options);
  } else {
    return parseTextQuoteFile(content, options);
  }
}

/** Extracts summary information from a quote array for metadata. */
export function extractQuoteSummary(quotes: Quote[]): {
  quoteCount: number;
  languages: string[];
  commonTags: string[];
  averageDifficulty?: string;
} {
  if (quotes.length === 0) {
    return {
      quoteCount: 0,
      languages: [],
      commonTags: [],
    };
  }

  // Count languages
  const languageSet = new Set(quotes.map((q) => q.language));

  // Collect all tags
  const allTags = quotes.flatMap((q) => q.tags || []);
  const tagCounts = new Map<string, number>();
  allTags.forEach((tag) => {
    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
  });

  // Find common tags (appear in more than 25% of quotes)
  const threshold = Math.max(1, Math.ceil(quotes.length * 0.25));
  const commonTags = Array.from(tagCounts.entries())
    .filter(([, count]) => count >= threshold)
    .map(([tag]) => tag)
    .sort();

  // Calculate average difficulty
  const difficulties = quotes
    .map((q) => q.difficulty)
    .filter((d): d is "beginner" | "intermediate" | "advanced" =>
      d !== undefined
    );

  let averageDifficulty: string | undefined;
  if (difficulties.length > 0) {
    const difficultyMap: Record<
      "beginner" | "intermediate" | "advanced",
      number
    > = { beginner: 1, intermediate: 2, advanced: 3 };
    const avgScore = difficulties.reduce((sum, diff) =>
      sum + difficultyMap[diff], 0) / difficulties.length;

    if (avgScore <= 1.5) {
      averageDifficulty = "beginner";
    } else if (avgScore <= 2.5) {
      averageDifficulty = "intermediate";
    } else averageDifficulty = "advanced";
  }

  return {
    quoteCount: quotes.length,
    languages: Array.from(languageSet).sort(),
    commonTags,
    averageDifficulty,
  };
}
