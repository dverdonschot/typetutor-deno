// Server-side translation cache system
// Similar to quote cache but for translations

import { join } from "https://deno.land/std@0.208.0/path/mod.ts";

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

export interface TranslationCacheData {
  languages: LanguageInfo[];
  translations: Record<string, Translations>;
  lastUpdated: Date;
  translationCount: number;
}

class TranslationCache {
  private cache: TranslationCacheData | null = null;
  private isBuilding = false;

  /**
   * Get translation cache data, building it if necessary
   */
  async getCache(): Promise<TranslationCacheData> {
    if (this.cache) {
      return this.cache;
    }

    if (this.isBuilding) {
      // Wait for current build to complete
      while (this.isBuilding) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return this.cache!;
    }

    return await this.buildCache();
  }

  /**
   * Build the translation cache by loading all JSON files
   */
  private async buildCache(): Promise<TranslationCacheData> {
    this.isBuilding = true;
    console.log("Building translation cache...");
    const startTime = performance.now();

    try {
      const languagesPath = join(Deno.cwd(), "static", "languages");

      // Load languages metadata
      const languagesFile = join(languagesPath, "languages.json");
      const languagesData = JSON.parse(await Deno.readTextFile(languagesFile));
      const languages: LanguageInfo[] = languagesData.languages;

      // Load translations for each language
      const translations: Record<string, Translations> = {};
      let translationCount = 0;

      for (const language of languages) {
        const translationFile = join(languagesPath, `${language.code}.json`);
        try {
          const translationData = JSON.parse(
            await Deno.readTextFile(translationFile),
          );
          translations[language.code] = translationData;

          // Count translation keys recursively
          translationCount += this.countTranslationKeys(translationData);

          console.log(
            `Loaded translations for ${language.code} (${language.name})`,
          );
        } catch (error) {
          console.error(
            `Failed to load translations for ${language.code}:`,
            error,
          );
          // Continue with other languages
        }
      }

      this.cache = {
        languages,
        translations,
        lastUpdated: new Date(),
        translationCount,
      };

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      // Calculate cache size
      const cacheSize = JSON.stringify({
        languages,
        translations,
      }).length;
      const sizeMB = (cacheSize / 1024 / 1024).toFixed(2);
      
      console.log(
        `Translation cache built successfully: ${languages.length} languages, ${translationCount} total translation keys (~${sizeMB}MB) (${duration}ms)`,
      );
      return this.cache;
    } catch (error) {
      console.error("Failed to build translation cache:", error);
      // Return minimal cache with just English
      this.cache = {
        languages: [{
          code: "en",
          name: "English",
          nativeName: "English",
          flag: "🇺🇸",
          rtl: false,
          completeness: 100,
        }],
        translations: { en: {} },
        lastUpdated: new Date(),
        translationCount: 0,
      };
      return this.cache;
    } finally {
      this.isBuilding = false;
    }
  }

  /**
   * Count translation keys recursively
   */
  private countTranslationKeys(obj: any): number {
    let count = 0;
    for (const value of Object.values(obj)) {
      if (typeof value === "string") {
        count++;
      } else if (typeof value === "object" && value !== null) {
        count += this.countTranslationKeys(value);
      }
    }
    return count;
  }

  /**
   * Get available languages
   */
  async getLanguages(): Promise<LanguageInfo[]> {
    const cache = await this.getCache();
    return cache.languages;
  }

  /**
   * Get translations for a specific language
   */
  async getTranslations(languageCode: string): Promise<Translations> {
    const cache = await this.getCache();
    return cache.translations[languageCode] || cache.translations["en"] || {};
  }

  /**
   * Get all translations
   */
  async getAllTranslations(): Promise<Record<string, Translations>> {
    const cache = await this.getCache();
    return cache.translations;
  }

  /**
   * Clear the cache (useful for development)
   */
  clearCache(): void {
    this.cache = null;
  }

  /**
   * Get cache stats
   */
  async getCacheStats(): Promise<TranslationCacheData> {
    return await this.getCache();
  }
}

// Global translation cache instance
export const translationCache = new TranslationCache();
