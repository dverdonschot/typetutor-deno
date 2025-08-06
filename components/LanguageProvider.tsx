import { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";
import {
  availableLanguagesSignal,
  initializeLanguage,
  setGlobalLanguage,
} from "../contexts/LanguageContext.ts";

interface LanguageProviderProps {
  children: ComponentChildren;
}

export default function LanguageProvider({ children }: LanguageProviderProps) {
  // Initialize language on mount (client-side only)
  useEffect(() => {
    // First, load saved language from localStorage if available
    if (typeof localStorage !== "undefined") {
      const savedLanguageCode = localStorage.getItem("typetutor-language");
      if (savedLanguageCode) {
        // Try to find the language in default languages first
        const DEFAULT_LANGUAGES = [
          { code: "en", name: "English", flag: "🇺🇸" },
          { code: "es", name: "Español", flag: "🇪🇸" },
          { code: "fr", name: "Français", flag: "🇫🇷" },
        ];
        const savedLanguage = DEFAULT_LANGUAGES.find((lang) =>
          lang.code === savedLanguageCode
        );
        if (savedLanguage) {
          setGlobalLanguage(savedLanguage);
        }
      }
    }

    // Then fetch available languages from API and update if needed
    initializeLanguage();
  }, []);

  // Since we're using signals, we don't need a provider - just return children
  return <>{children}</>;
}
