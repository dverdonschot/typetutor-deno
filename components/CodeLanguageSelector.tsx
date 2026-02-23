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
      <div style={{ opacity: 0.6 }}>
        {!hideLabel && <div class="form-label" style={{ width: "8rem", height: "1rem", backgroundColor: "#e5e7eb", borderRadius: "0.25rem", marginBottom: "0.5rem" }}></div>}
        <div style={{ height: "2.5rem", backgroundColor: "#e5e7eb", borderRadius: "0.375rem" }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="error-container">
        <div class="flex items-center justify-between">
          <p class="error-message">Error loading languages: {error}</p>
          <button
            type="button"
            onClick={() => globalThis.location.reload()}
            class="error-link"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (languages.length === 0) {
    return (
      <div class="card card-padded" style={{ backgroundColor: "#fefce8", borderColor: "#fde047" }}>
        <p class="text-sm" style={{ color: "#ca8a04" }}>
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
          class="form-label"
        >
          {label || "Programming Language"}:
        </label>
      )}
      <select
        id="code-language-selector"
        value={selectedLanguage || ""}
        onChange={handleChange}
        class="form-select"
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
