import { useEffect, useState } from "preact/hooks";
import RandomToggle from "./RandomToggle.tsx";

interface Language {
  code: string;
  name: string;
  icon: string;
  description: string;
}

interface CodeLanguageSelectorProps {
  selectedLanguage: string | null;
  onLanguageChange: (languageCode: string, language: Language) => void;
  hideLabel?: boolean;
  label?: string;
  randomMode?: boolean;
  onRandomModeChange?: (enabled: boolean) => void;
}

export default function CodeLanguageSelector(
  {
    selectedLanguage,
    onLanguageChange,
    hideLabel,
    label,
    randomMode = false,
    onRandomModeChange,
  }: CodeLanguageSelectorProps,
) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Fetches available programming languages. */
  useEffect(() => {
    async function fetchLanguages() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/code-collections/languages");
        if (!response.ok) {
          throw new Error(`Failed to fetch languages: ${response.status}`);
        }

        const languageData: Language[] = await response.json();
        setLanguages(languageData);

        // Auto-select first language if none selected
        if (languageData.length > 0 && !selectedLanguage) {
          onLanguageChange(languageData[0].code, languageData[0]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : "Unknown error";
        setError(errorMessage);
        console.error("Error fetching programming languages:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLanguages();
  }, []); // Only run once on mount

  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const selectedLang = languages.find((lang) => lang.code === target.value);
    if (selectedLang) {
      onLanguageChange(selectedLang.code, selectedLang);
    }
  };

  if (loading) {
    return (
      <div class="animate-pulse">
        {!hideLabel && <div class="h-4 bg-gray-200 rounded mb-2 w-32"></div>}
        <div class="h-10 bg-gray-200 rounded-md"></div>
        <div class="mt-1 h-3 bg-gray-100 rounded w-40"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="bg-red-50 border border-red-200 rounded-md p-3">
        <div class="flex items-center justify-between">
          <p class="text-sm text-red-600">Error loading languages: {error}</p>
          <button
            type="button"
            onClick={() => globalThis.location.reload()}
            class="text-xs text-red-700 hover:text-red-800 underline focus:outline-none"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (languages.length === 0) {
    return (
      <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <p class="text-sm text-yellow-600">
          No programming languages available
        </p>
      </div>
    );
  }

  return (
    <div>
      {!hideLabel && (
        <label
          htmlFor="code-language-selector"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          {label || "Programming Language"}:
        </label>
      )}
      <select
        id="code-language-selector"
        value={selectedLanguage || ""}
        onChange={handleChange}
        class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-tt-lightblue focus:border-tt-lightblue sm:text-sm rounded-md shadow-sm bg-white border transition-colors duration-200 hover:border-gray-400"
      >
        <option value="" disabled>-- Select a programming language --</option>
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.icon} {lang.name}
          </option>
        ))}
      </select>

      {/* Random mode toggle */}
      {onRandomModeChange && selectedLanguage && (
        <div class="mt-3">
          <RandomToggle
            id="language-random-toggle"
            label="Random from All Collections"
            checked={randomMode}
            onChange={onRandomModeChange}
          />
        </div>
      )}
    </div>
  );
}
