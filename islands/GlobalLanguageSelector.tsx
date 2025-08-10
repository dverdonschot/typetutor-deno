import { useEffect } from "preact/hooks";
import {
  availableLanguagesSignal,
  currentLanguageSignal,
  setGlobalLanguage,
} from "../contexts/LanguageContext.ts";

interface GlobalLanguageSelectorProps {
  compact?: boolean;
}

export default function GlobalLanguageSelector(
  { compact = false }: GlobalLanguageSelectorProps,
) {
  const currentLanguage = currentLanguageSignal.value;
  const availableLanguages = availableLanguagesSignal.value;

  // Initialize language from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      const savedLanguageCode = localStorage.getItem("typetutor-language");
      if (savedLanguageCode) {
        const savedLanguage = availableLanguages.find((lang) =>
          lang.code === savedLanguageCode
        );
        if (savedLanguage && savedLanguage.code !== currentLanguage.code) {
          setGlobalLanguage(savedLanguage);
        }
      }
    }
  }, [availableLanguages]); // Run when available languages are loaded

  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const selectedLanguage = availableLanguages.find((lang) =>
      lang.code === target.value
    );
    if (selectedLanguage) {
      setGlobalLanguage(selectedLanguage);
    }
  };

  if (compact) {
    return (
      <div class="relative">
        <select
          value={currentLanguage.code}
          onChange={handleChange}
          class="appearance-none bg-transparent border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-tt-lightblue focus:border-transparent cursor-pointer"
          title="Select Language"
        >
          {availableLanguages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.flag} {language.nativeName || language.name}
            </option>
          ))}
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            class="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">
        Language
      </label>
      <select
        value={currentLanguage.code}
        onChange={handleChange}
        class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-tt-lightblue focus:border-tt-lightblue sm:text-sm rounded-md shadow-sm bg-white border transition-colors duration-200 hover:border-gray-400"
      >
        {availableLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.nativeName || language.name}
          </option>
        ))}
      </select>
    </div>
  );
}
