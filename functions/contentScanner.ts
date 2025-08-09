import type {
  Category,
  FetchResult,
  Language,
  QuoteMetadata,
} from "../types/quotes.ts";

/** Scans the quotes directory and returns available languages. */
export async function scanQuoteLanguages(
  basePath: string = "./static/content/quotes",
): Promise<FetchResult<Language[]>> {
  try {
    const languages: Language[] = [];

    // Check if base directory exists
    try {
      const stat = await Deno.stat(basePath);
      if (!stat.isDirectory) {
        return {
          success: false,
          error: `Quote base path is not a directory: ${basePath}`,
        };
      }
    } catch {
      return {
        success: false,
        error: `Quote base path does not exist: ${basePath}`,
      };
    }

    // Scan for language directories
    for await (const entry of Deno.readDir(basePath)) {
      if (entry.isDirectory && !entry.name.startsWith(".")) {
        // Check if languages.json exists for metadata
        const languagesPath = `${basePath}/languages.json`;
        let languageData: Record<string, { name: string; flag?: string }> = {};

        try {
          const languagesContent = await Deno.readTextFile(languagesPath);
          languageData = JSON.parse(languagesContent);
        } catch {
          // If no languages.json, use defaults
        }

        const langCode = entry.name;
        const langInfo = languageData[langCode];

        languages.push({
          code: langCode,
          name: langInfo?.name || langCode.toUpperCase(),
          flag: langInfo?.flag,
        });
      }
    }

    // Sort languages by code
    languages.sort((a, b) => a.code.localeCompare(b.code));

    return { success: true, content: languages };
  } catch (error) {
    return {
      success: false,
      error: `Cannot scan quote languages: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    };
  }
}

/** Scans a language directory and returns available categories. */
export async function scanQuoteCategories(
  basePath: string = "./static/content/quotes",
  languageCode: string,
): Promise<FetchResult<Category[]>> {
  try {
    const languagePath = `${basePath}/${languageCode}`;
    const categories: Category[] = [];

    // Check if language directory exists
    try {
      const stat = await Deno.stat(languagePath);
      if (!stat.isDirectory) {
        return {
          success: false,
          error: `Language directory is not a directory: ${languagePath}`,
        };
      }
    } catch {
      return {
        success: false,
        error: `Language directory does not exist: ${languagePath}`,
      };
    }

    // Scan for category directories
    for await (const entry of Deno.readDir(languagePath)) {
      if (entry.isDirectory && !entry.name.startsWith(".")) {
        const categoryPath = `${languagePath}/${entry.name}`;

        // Try to read category metadata
        let categoryData: {
          name?: string;
          description?: string;
          icon?: string;
          difficulty?: string;
        } = {};

        try {
          const categoryJsonPath = `${categoryPath}/category.json`;
          const categoryContent = await Deno.readTextFile(categoryJsonPath);
          categoryData = JSON.parse(categoryContent);
        } catch {
          // If no category.json, use defaults
        }

        categories.push({
          name: categoryData.name || formatCategoryName(entry.name),
          directory: entry.name,
          description: categoryData.description,
          icon: categoryData.icon,
          difficulty: categoryData.difficulty,
        });
      }
    }

    // Sort categories by name
    categories.sort((a, b) => a.name.localeCompare(b.name));

    return { success: true, content: categories };
  } catch (error) {
    return {
      success: false,
      error: `Cannot scan quote categories for ${languageCode}: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    };
  }
}

/** Scans a category directory and returns quote file metadata. */
export async function scanQuoteFiles(
  basePath: string = "./static/content/quotes",
  languageCode: string,
  categoryName: string,
): Promise<FetchResult<QuoteMetadata[]>> {
  try {
    const categoryPath = `${basePath}/${languageCode}/${categoryName}`;
    const quotesMetadata: QuoteMetadata[] = [];

    // Check if category directory exists
    try {
      const stat = await Deno.stat(categoryPath);
      if (!stat.isDirectory) {
        return {
          success: false,
          error: `Category directory is not a directory: ${categoryPath}`,
        };
      }
    } catch {
      return {
        success: false,
        error: `Category directory does not exist: ${categoryPath}`,
      };
    }

    // Scan for quote files
    for await (const entry of Deno.readDir(categoryPath)) {
      if (
        entry.isFile &&
        (entry.name.endsWith(".json") || entry.name.endsWith(".txt")) &&
        !entry.name.startsWith(".") &&
        entry.name !== "category.json"
      ) {
        const filePath = `${categoryPath}/${entry.name}`;
        const fileName = entry.name;
        const baseName = fileName.replace(/\.(json|txt)$/, "");

        // Generate metadata for this file
        const metadata: QuoteMetadata = {
          id: `${languageCode}-${categoryName}-${baseName}`,
          fileName,
          fileTitle: formatFileTitle(baseName),
          quoteCount: 0, // Will be filled by cache manager
          language: languageCode,
          category: categoryName,
          filePath,
        };

        quotesMetadata.push(metadata);
      }
    }

    // Sort by file title
    quotesMetadata.sort((a, b) => a.fileTitle.localeCompare(b.fileTitle));

    return { success: true, content: quotesMetadata };
  } catch (error) {
    return {
      success: false,
      error: `Cannot scan quote files for ${languageCode}/${categoryName}: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    };
  }
}

/** Scans the entire quotes directory structure and returns all metadata. */
export async function scanAllQuoteContent(
  basePath: string = "./static/content/quotes",
): Promise<
  FetchResult<{
    languages: Language[];
    categories: Map<string, Category[]>;
    quotesMetadata: Map<string, QuoteMetadata[]>;
  }>
> {
  try {
    // Scan languages
    const languagesResult = await scanQuoteLanguages(basePath);
    if (!languagesResult.success) {
      return languagesResult;
    }

    const languages = languagesResult.content;
    const categories = new Map<string, Category[]>();
    const quotesMetadata = new Map<string, QuoteMetadata[]>();

    // Scan categories and files for each language
    for (const language of languages) {
      const categoriesResult = await scanQuoteCategories(
        basePath,
        language.code,
      );
      if (!categoriesResult.success) {
        console.warn(
          `Failed to scan categories for ${language.code}: ${categoriesResult.error}`,
        );
        continue;
      }

      categories.set(language.code, categoriesResult.content);

      // Scan files for each category
      for (const category of categoriesResult.content) {
        const filesResult = await scanQuoteFiles(
          basePath,
          language.code,
          category.directory,
        );
        if (!filesResult.success) {
          console.warn(
            `Failed to scan files for ${language.code}/${category.directory}: ${filesResult.error}`,
          );
          continue;
        }

        const key = `${language.code}/${category.directory}`;
        quotesMetadata.set(key, filesResult.content);
      }
    }

    return {
      success: true,
      content: {
        languages,
        categories,
        quotesMetadata,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Cannot scan all quote content: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    };
  }
}

/** Formats a category directory name into a display name. */
function formatCategoryName(directoryName: string): string {
  return directoryName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Formats a file basename into a display title. */
function formatFileTitle(baseName: string): string {
  return baseName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
