import { useEffect, useState } from "preact/hooks";
import { preloadTranslations } from "../utils/translations.ts";
import {
  currentLanguageSignal,
  initializeLanguage,
} from "../contexts/LanguageContext.ts";

interface TranslationInitializerProps {
  children: preact.ComponentChildren;
}

export default function TranslationInitializer(
  { children }: TranslationInitializerProps,
) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      console.log("TranslationInitializer: Starting initialization...");
      try {
        // Initialize language system and preload translations
        console.log("TranslationInitializer: Calling initializeLanguage...");
        await initializeLanguage();
        console.log(
          "TranslationInitializer: Language initialized, current language:",
          currentLanguageSignal.value.code,
        );

        // Also preload the current language translations to be sure
        console.log(
          "TranslationInitializer: Preloading translations for",
          currentLanguageSignal.value.code,
        );
        await preloadTranslations(currentLanguageSignal.value.code);
        console.log(
          "TranslationInitializer: Translations preloaded successfully",
        );

        setIsInitialized(true);
        console.log("TranslationInitializer: Initialization complete");
      } catch (error) {
        console.error(
          "TranslationInitializer: Failed to initialize translations:",
          error,
        );
        // Even if there's an error, we should show the content
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  // Show loading state until translations are ready
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500">
        </div>
        <span className="ml-2 text-gray-600">Loading translations...</span>
      </div>
    );
  }

  return <>{children}</>;
}
