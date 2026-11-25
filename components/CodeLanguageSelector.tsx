import { Language } from "../hooks/useCodeContent.ts";

interface CodeLanguageSelectorProps {
  languages: Language[];
  selectedLanguage: string | null;
  onLanguageChange: (languageCode: string) => void;
}

// Presentational only: fetching and validation live in useCodeContent.
export default function CodeLanguageSelector(
  { languages, selectedLanguage, onLanguageChange }: CodeLanguageSelectorProps,
) {
  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    if (languages.some((lang) => lang.code === target.value)) {
      onLanguageChange(target.value);
    }
  };

  return (
    <div>
      <select
        id="code-language-selector"
        aria-label="Programming language"
        value={selectedLanguage || ""}
        onChange={handleChange}
        class="code-select"
      >
        {selectedLanguage === null && (
          <option value="" disabled>-- Select a programming language --</option>
        )}
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.icon} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
