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
      <label
        htmlFor="code-language-selector"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Programming Language:
      </label>
      <select
        id="code-language-selector"
        value={selectedLanguage || ""}
        onChange={handleChange}
        class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-tt-lightblue focus:border-tt-lightblue sm:text-sm rounded-md shadow-sm bg-white border transition-colors duration-200 hover:border-gray-400"
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
