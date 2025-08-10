import { currentLanguageSignal } from "../contexts/LanguageContext.ts";
import {
  getTranslationFromObject,
  loadTranslations,
  type Translations,
} from "./translationLoader.ts";

export type { Translations };

// Use the same cache as translationLoader to avoid duplication
import { getTranslationCache } from "./translationLoader.ts";

/**
 * Load translations for a language and cache them
 */
async function getTranslationsForLanguage(
  languageCode: string,
): Promise<Translations> {
  const cache = getTranslationCache();
  if (!cache[languageCode]) {
    cache[languageCode] = await loadTranslations(languageCode);
  }
  return cache[languageCode];
}

/**
 * Get translation by key and language
 */
export async function getTranslationAsync(
  key: string,
  language: string = "en",
): Promise<string> {
  if (!key || typeof key !== "string") {
    return key || "";
  }

  try {
    const translations = await getTranslationsForLanguage(language);
    const translation = getTranslationFromObject(translations, key);

    // If translation not found in requested language and not English, try English
    if (translation === key && language !== "en") {
      const englishTranslations = await getTranslationsForLanguage("en");
      return getTranslationFromObject(englishTranslations, key);
    }

    return translation;
  } catch (error) {
    console.error(`Error getting translation for ${key}:`, error);
    return key;
  }
}

/**
 * Synchronous translation function (for backward compatibility)
 * This will use cached translations if available, otherwise return the key
 */
export function getTranslation(key: string, language: string = "en"): string {
  if (!key || typeof key !== "string") {
    return key || "";
  }

  const cache = getTranslationCache();

  // Try to get from requested language cache
  const translations = cache[language];
  if (translations) {
    const translation = getTranslationFromObject(translations, key);
    if (translation !== key) {
      return translation;
    }
  }

  // If not found and not English, try English as fallback
  if (language !== "en") {
    const englishTranslations = cache["en"];
    if (englishTranslations) {
      const englishTranslation = getTranslationFromObject(
        englishTranslations,
        key,
      );
      if (englishTranslation !== key) {
        return englishTranslation;
      }
    }
  }

  // If not in cache, trigger async load for future use (non-blocking)
  if (!cache[language]) {
    getTranslationsForLanguage(language).catch(console.error);
  }

  return key;
}

export function useTranslation(language: string) {
  return (key: string) => getTranslation(key, language);
}

// Reactive translation hook that automatically updates when language changes
export function useReactiveTranslation() {
  return (key: string) => {
    const languageCode = currentLanguageSignal.value.code;
    const cache = getTranslationCache();

    // Try to get from cache first
    const translations = cache[languageCode];
    if (translations) {
      const translation = getTranslationFromObject(translations, key);
      if (translation !== key) {
        return translation;
      }
    }

    // If not in current language cache, try English
    const englishTranslations = cache["en"];
    if (englishTranslations && languageCode !== "en") {
      const englishTranslation = getTranslationFromObject(
        englishTranslations,
        key,
      );
      if (englishTranslation !== key) {
        return englishTranslation;
      }
    }

    // Only log missing translations if cache is populated (not during initialization)
    const cacheKeys = Object.keys(cache);
    if (cacheKeys.length > 0) {
      console.warn(
        `Translation missing for key "${key}" in language "${languageCode}"`,
      );
    }

    // If not in cache at all, trigger async load for future use (but don't wait)
    if (!cache[languageCode]) {
      getTranslationsForLanguage(languageCode).catch(console.error);
    }

    return key;
  };
}

/**
 * Preload translations for a language
 */
export async function preloadTranslations(languageCode: string): Promise<void> {
  await getTranslationsForLanguage(languageCode);
}

/**
 * Clear translation cache (useful for development)
 */
export function clearTranslationCache(): void {
  const cache = getTranslationCache();
  Object.keys(cache).forEach((key) => {
    delete cache[key];
  });
}
