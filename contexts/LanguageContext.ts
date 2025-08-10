import { signal } from "@preact/signals";
import { createContext as _createContext } from "preact";
import {
  useContext as _useContext,
  useEffect as _useEffect,
} from "preact/hooks";
import {
  loadAllTranslations,
  loadAvailableLanguages,
} from "../utils/translationLoader.ts";
import { preloadTranslations } from "../utils/translations.ts";

export interface GlobalLanguage {
  code: string;
  name: string;
  flag: string;
  nativeName?: string;
  rtl?: boolean;
  completeness?: number;
}

// Default languages (will be populated from API)
const DEFAULT_LANGUAGES: GlobalLanguage[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

const DEFAULT_LANGUAGE = DEFAULT_LANGUAGES[0];

// Global signals for language state - start with default, will be updated client-side
export const currentLanguageSignal = signal<GlobalLanguage>(DEFAULT_LANGUAGE);
export const availableLanguagesSignal = signal<GlobalLanguage[]>(
  DEFAULT_LANGUAGES,
);

// Helper function to set language and persist to localStorage
export const setGlobalLanguage = (language: GlobalLanguage) => {
  currentLanguageSignal.value = language;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("typetutor-language", language.code);
  }
  // Preload translations for the new language
  preloadTranslations(language.code).catch(console.error);
};

// Helper function to initialize language from new translation system and sync with localStorage
export const initializeLanguage = async () => {
  try {
    console.log("Initializing language system...");

    // Load all translations at once (more efficient)
    console.log("Loading all translations...");
    await loadAllTranslations();
    console.log("All translations loaded and cached");

    // Load available languages
    const languageInfos = await loadAvailableLanguages();
    const languages: GlobalLanguage[] = languageInfos.map((info) => ({
      code: info.code,
      name: info.name,
      flag: info.flag,
      nativeName: info.nativeName,
      rtl: info.rtl,
      completeness: info.completeness,
    }));

    availableLanguagesSignal.value = languages;
    console.log(
      `Loaded ${languages.length} languages:`,
      languages.map((l) => l.code),
    );

    // Initialize current language from localStorage or default
    if (typeof localStorage !== "undefined") {
      const savedLanguageCode = localStorage.getItem("typetutor-language");
      if (savedLanguageCode) {
        const savedLanguage = languages.find((lang) =>
          lang.code === savedLanguageCode
        );
        if (savedLanguage) {
          currentLanguageSignal.value = savedLanguage;
          console.log(`Set current language to saved: ${savedLanguageCode}`);
        }
      }
    }

    // Also try to fetch from API as backup (for quote languages)
    try {
      const response = await fetch("/api/quotes/languages");
      if (response.ok) {
        const apiLanguages: GlobalLanguage[] = await response.json();
        // Merge API languages if they have additional data
        const mergedLanguages = languages.map((lang) => {
          const apiLang = apiLanguages.find((al) => al.code === lang.code);
          return apiLang ? { ...lang, ...apiLang } : lang;
        });
        availableLanguagesSignal.value = mergedLanguages;
      }
    } catch (apiError) {
      console.warn(
        "Failed to fetch API languages, using translation system languages:",
        apiError,
      );
    }

    console.log("Language system initialized successfully");
  } catch (error) {
    console.error("Failed to initialize language system:", error);
    throw error; // Re-throw to let the caller handle it
  }
};

// Hook to use language signals (works in both islands and regular components)
export const useLanguage = () => {
  return {
    currentLanguage: currentLanguageSignal.value,
    setLanguage: setGlobalLanguage,
    availableLanguages: availableLanguagesSignal.value,
  };
};
