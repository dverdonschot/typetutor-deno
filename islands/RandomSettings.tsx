import { useEffect, useState } from "preact/hooks";
import { randomTrainingSet } from "../functions/randomTrainingSet.ts";
import { TrainingChar } from "../functions/randomTrainingSet.ts";
import { useReactiveTranslation } from "../utils/translations.ts";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

interface RandomSettingsProps {
  initialCharacterLength: number;
  initialCharacterSet: string;
}

export default function RandomSettings(
  { initialCharacterLength, initialCharacterSet }: RandomSettingsProps,
) {
  const t = useReactiveTranslation();
  const [characterLength, setCharacterLength] = useState<number>(
    initialCharacterLength,
  );
  const localStorageKey = "typetutor_random_character_set";

  // Initialize characterSet state directly from localStorage if available
  const [characterSet, setCharacterSet] = useState<string>(() => {
    // This function runs only on initial mount
    let initialSet = initialCharacterSet; // Default to prop
    // localStorage is only available on the client
    if (typeof localStorage !== "undefined") {
      try {
        const savedSet = localStorage.getItem(localStorageKey);
        if (savedSet) {
          initialSet = savedSet;
        }
      } catch (error) {
        // localStorage might not be available or accessible
        console.warn("Error accessing localStorage:", error);
      }
    }
    return initialSet;
  });

  const [trainingSet, setTrainingSet] = useState<TrainingChar[]>([]);
  // Add a key state to force KeyLogger remount when training set changes
  const [keyLoggerKey, setKeyLoggerKey] = useState<number>(0);

  // Define character set options
  const characterSetOptions = {
    "All Characters": initialCharacterSet,
    "Lowercase Letters": "abcdefghijklmnopqrstuvwxz",
    "Uppercase Letters": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "Numbers": "1234567890",
    "Numpad": "1234567890/*-+",
    "Special Characters": "*&-+;:./,~][)(}{|`!@$#%^\\_",
    "Home Row": "ASDFGHJKL;asdfghjkl:",
    "Top Row": "QWERTYUIOP[]{}qwertyuiop|\\",
    "Bottom Row": "ZXCVBNM,./zxcvbnm<>?",
    "Index Fingers": "4567$%^&rtRTYUyuFGfgHJhjVBvbNMnm",
    "Middle Fingers": "3#eEdDcC8*IKik<,",
    "Ring Fingers": "2@wWsSxX9(OolL>.",
    "Pinky Fingers": "1!qQaAzZ0)Pp;:/'\"/?|\\[]){}",
  };

  // Generate training set when component mounts or when values change
  useEffect(() => {
    setTrainingSet(randomTrainingSet(characterLength, characterSet));
    // Increment key to force KeyLogger remount
    setKeyLoggerKey((prev) => prev + 1);
  }, [characterLength, characterSet]);

  // Handle character length change
  const handleLengthChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newLength = parseInt(target.value, 10);
    if (!isNaN(newLength) && newLength > 0) {
      setCharacterLength(newLength);
    }
  };

  // Handle character set change
  const handleSetChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const selectedOption = target.value as keyof typeof characterSetOptions;
    const newSet = characterSetOptions[selectedOption];
    setCharacterSet(newSet);
    // Save the new selection to localStorage
    try {
      localStorage.setItem(localStorageKey, newSet);
    } catch (error) {
      console.error("Failed to save character set to localStorage:", error);
    }
  };

  // Regenerate training set with current settings
  const handleRegenerate = () => {
    setTrainingSet(randomTrainingSet(characterLength, characterSet));
    // Increment key to force KeyLogger remount
    setKeyLoggerKey((prev) => prev + 1);
  };

  // Select a random character set and regenerate
  const handleNextRandom = () => {
    const options = Object.values(characterSetOptions);
    const randomSet = options[Math.floor(Math.random() * options.length)];
    setCharacterSet(randomSet);
    setTrainingSet(randomTrainingSet(characterLength, randomSet));
    // Increment key to force KeyLogger remount
    setKeyLoggerKey((prev) => prev + 1);
  };

  return (
    <div>
      {/* KeyLogger Component with key prop to force remount */}
      <div class="game-container mb-4">
        <KeyLogger
          key={keyLoggerKey}
          codeableKeys={trainingSet}
          gameType="random"
          onPracticeAgain={handleRegenerate}
          onNextGame={handleNextRandom}
        />
      </div>

      {/* Settings Bar - moved below the main element */}
      <div class="settings-panel">
        <div class="settings-row">
          <div class="form-group" style={{ marginBottom: 0 }}>
            <label class="form-label">
              {t(TRANSLATION_KEYS.RANDOM.CHARACTER_LENGTH)}
            </label>
            <input
              type="number"
              min="5"
              max="100"
              value={characterLength}
              onChange={handleLengthChange}
              class="form-input"
              style={{ width: "5rem" }}
            />
          </div>

          <div class="form-group" style={{ marginBottom: 0 }}>
            <label class="form-label">
              {t(TRANSLATION_KEYS.RANDOM.CHARACTER_SET)}
            </label>
            <select
              onChange={handleSetChange}
              value={Object.keys(characterSetOptions).find((key) =>
                characterSetOptions[key as keyof typeof characterSetOptions] ===
                  characterSet
              ) || "All Characters"}
              class="form-select"
              style={{ width: "12rem" }}
            >
              {Object.keys(characterSetOptions).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div class="form-group" style={{ marginBottom: 0 }}>
            <label class="form-label" style={{ opacity: 0 }}>
              {t(TRANSLATION_KEYS.RANDOM.REGENERATE)}
            </label>
            <button
              type="button"
              onClick={handleRegenerate}
              class="action-btn-primary"
            >
              {t(TRANSLATION_KEYS.RANDOM.REGENERATE)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import KeyLogger here to avoid circular dependency
import KeyLogger from "./KeyLogger.tsx";
