import { signal } from "@preact/signals";
import { createContext } from "preact";
import { useContext, useEffect } from "preact/hooks";

export interface GlobalLanguage {
  code: string;
  name: string;
  flag: string;
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
};

// Helper function to initialize language from API and sync with localStorage
export const initializeLanguage = async () => {
  // Fetch available languages from API
  try {
    const response = await fetch("/api/quotes/languages");
    if (response.ok) {
      const languages: GlobalLanguage[] = await response.json();
      availableLanguagesSignal.value = languages;

      // Only update current language if we have more complete data from API
      if (typeof localStorage !== "undefined") {
        const savedLanguageCode = localStorage.getItem("typetutor-language");
        if (savedLanguageCode) {
          const savedLanguage = languages.find((lang) =>
            lang.code === savedLanguageCode
          );
          if (savedLanguage && savedLanguage !== currentLanguageSignal.value) {
            // Update with more complete language data from API
            currentLanguageSignal.value = savedLanguage;
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch available languages:", error);
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
