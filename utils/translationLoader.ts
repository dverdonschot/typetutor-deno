// Translation loader that reads from JSON files in static/languages/

export interface Translations {
  [key: string]: string | Translations;
}

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  completeness: number;
}

// Cache for loaded translations
const translationCache: Record<string, Translations> = {};
let availableLanguages: LanguageInfo[] | null = null;

// Check if we're running on the server side
function isServerSide(): boolean {
  return typeof window === "undefined";
}

/**
 * Load available languages from API or server cache
 */
export async function loadAvailableLanguages(): Promise<LanguageInfo[]> {
  if (availableLanguages !== null) {
    return availableLanguages;
  }

  // If we're on the server side, use the server cache directly
  if (isServerSide()) {
    try {
      const serverCache = await import("./translationCache.ts");
      const languages = await serverCache.translationCache.getLanguages();
      availableLanguages = languages;
      return availableLanguages;
    } catch (error) {
      console.error("Error loading languages from server cache:", error);
    }
  }

  // Client-side: use API
  try {
    const response = await fetch("/api/translations/languages");
    if (!response.ok) {
      throw new Error(`Failed to load languages: ${response.statusText}`);
    }
    availableLanguages = await response.json();
    return availableLanguages as LanguageInfo[];
  } catch (error) {
    console.error("Error loading available languages:", error);
    // Fallback to default languages
    availableLanguages = [
      {
        code: "en",
        name: "English",
        nativeName: "English",
        flag: "🇺🇸",
        rtl: false,
        completeness: 100,
      },
    ];
    return availableLanguages;
  }
}

/**
 * Load all translations at once (more efficient than per-language)
 */
export async function loadAllTranslations(): Promise<
  Record<string, Translations>
> {
  // If we're on the server side, use the server cache directly
  if (isServerSide()) {
    try {
      const serverCache = await import("./translationCache.ts");
      const allTranslations = await serverCache.translationCache
        .getAllTranslations();

      // Cache all translations in client cache too
      for (
        const [languageCode, translations] of Object.entries(allTranslations)
      ) {
        translationCache[languageCode] = translations as Translations;
      }

      return allTranslations;
    } catch (error) {
      console.error("Error loading all translations from server cache:", error);
      return {};
    }
  }

  // Client-side: use API
  try {
    const response = await fetch("/api/translations/all");
    if (!response.ok) {
      throw new Error(
        `Failed to load all translations: ${response.statusText}`,
      );
    }
    const allTranslations = await response.json();

    // Cache all translations
    for (
      const [languageCode, translations] of Object.entries(allTranslations)
    ) {
      translationCache[languageCode] = translations as Translations;
    }

    return allTranslations;
  } catch (error) {
    console.error("Error loading all translations:", error);
    return {};
  }
}

/**
 * Load translations for a specific language from API or server cache
 */
export async function loadTranslations(
  languageCode: string,
): Promise<Translations> {
  // Check cache first
  if (translationCache[languageCode]) {
    return translationCache[languageCode];
  }

  // If we're on the server side, use the server cache directly
  if (isServerSide()) {
    try {
      const serverCache = await import("./translationCache.ts");
      const translations = await serverCache.translationCache.getTranslations(
        languageCode,
      );

      // Cache the translations in client cache too
      translationCache[languageCode] = translations;
      return translations;
    } catch (error) {
      console.error(
        `Error loading translations for ${languageCode} from server cache:`,
        error,
      );
      return {};
    }
  }

  // Client-side: use API
  try {
    const response = await fetch(`/api/translations/${languageCode}`);
    if (!response.ok) {
      throw new Error(
        `Failed to load translations for ${languageCode}: ${response.statusText}`,
      );
    }
    const translations = await response.json();

    // Cache the translations
    translationCache[languageCode] = translations;
    return translations;
  } catch (error) {
    console.error(`Error loading translations for ${languageCode}:`, error);

    // If not English and failed, try to load English as fallback
    if (languageCode !== "en") {
      console.warn(`Falling back to English translations for ${languageCode}`);
      return loadTranslations("en");
    }

    // If English also failed, return empty object
    console.error("Failed to load any translations, using empty fallback");
    return {};
  }
}

/**
 * Get a translation value by key path (e.g., "common.loading")
 */
export function getTranslationFromObject(
  translations: Translations,
  key: string,
): string {
  if (!key || typeof key !== "string") {
    return key || "";
  }

  const keys = key.split(".");
  let current: unknown = translations;

  for (const k of keys) {
    if (
      current && typeof current === "object" && current !== null && k in current
    ) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return key; // Return key if no translation found
    }
  }

  return typeof current === "string" ? current : key;
}

/**
 * Get reference to the translation cache
 */
export function getTranslationCache(): Record<string, Translations> {
  return translationCache;
}

/**
 * Clear translation cache (useful for development/testing)
 */
export function clearTranslationCache(): void {
  Object.keys(translationCache).forEach((key) => {
    delete translationCache[key];
  });
  availableLanguages = null;
}
