import { useEffect, useState } from "preact/hooks";
import type { Language } from "../types/quotes.ts";
import { useReactiveTranslation } from "../utils/translations.ts";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

interface LanguageSelectorProps {
  selectedLanguage: string | null;
  onLanguageChange: (languageCode: string) => void;
  hideLabel?: boolean;
}

export default function LanguageSelector(
  { selectedLanguage, onLanguageChange, hideLabel }: LanguageSelectorProps,
) {
  const t = useReactiveTranslation();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetches available languages from the API. */
  useEffect(() => {
    async function fetchLanguages() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/quotes/languages");
        if (!response.ok) {
          throw new Error(`Failed to fetch languages: ${response.status}`);
        }

        const languageData: Language[] = await response.json();
        setLanguages(languageData);

        // Auto-select first language if none selected
        if (!selectedLanguage && languageData.length > 0) {
          onLanguageChange(languageData[0].code);
        }
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : t(TRANSLATION_KEYS.ERRORS.UNKNOWN_ERROR);
        setError(errorMessage);
        console.error("Error fetching languages:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLanguages();
  }, [selectedLanguage, onLanguageChange]);

  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    onLanguageChange(target.value);
  };

  if (loading) {
    return (
      <div class="animate-pulse">
        {!hideLabel && <div class="h-4 bg-gray-200 rounded mb-2 w-20"></div>}
        <div class="h-10 bg-gray-200 rounded-md"></div>
        <div class="mt-1 h-3 bg-gray-100 rounded w-24"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="bg-red-50 border border-red-200 rounded-md p-3">
        <div class="flex items-center justify-between">
          <p class="text-sm text-red-600">
            {t(TRANSLATION_KEYS.ERRORS.ERROR_LOADING_LANGUAGES)}: {error}
          </p>
          <button
            type="button"
            onClick={() => globalThis.location.reload()}
            class="text-xs text-red-700 hover:text-red-800 underline focus:outline-none"
          >
            {t(TRANSLATION_KEYS.ACTIONS.RETRY)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <select
        id="language-selector"
        value={selectedLanguage || ""}
        onChange={handleChange}
        class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-tt-lightblue focus:border-tt-lightblue sm:text-sm rounded-md shadow-sm bg-white border transition-colors duration-200 hover:border-gray-400"
      >
        <option value="" disabled>
          {t(TRANSLATION_KEYS.CONTENT.SELECT_LANGUAGE_PLACEHOLDER)}
        </option>
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag ? `${language.flag} ` : ""}
            {language.nativeName || language.name}
          </option>
        ))}
      </select>
    </div>
  );
}
