import { useEffect, useState } from "preact/hooks";
import { randomTrainingSet } from "../functions/randomTrainingSet.ts";
import { TrainingChar } from "../functions/randomTrainingSet.ts";

interface RandomSettingsProps {
  initialCharacterLength: number;
  initialCharacterSet: string;
}

export default function RandomSettings(
  { initialCharacterLength, initialCharacterSet }: RandomSettingsProps,
) {
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
      <div class="w-full min-h-[300px] rounded-lg bg-white shadow mb-4">
        <KeyLogger
          key={keyLoggerKey}
          codeableKeys={trainingSet}
          gameType="random"
          onPracticeAgain={handleRegenerate} // Pass handleRegenerate as onPracticeAgain
          onNextGame={handleNextRandom} // Pass handleNextRandom as onNextGame
        />
      </div>

      {/* Settings Bar - moved below the main element */}
      <div class="p-4 bg-gray-100 rounded-lg flex flex-wrap gap-4 items-center">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Character Length
          </label>
          <input
            type="number"
            min="5"
            max="100"
            value={characterLength}
            onChange={handleLengthChange}
            class="w-20 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Character Set
          </label>
          <select
            onChange={handleSetChange}
            // Calculate the display name corresponding to the current characterSet state
            value={Object.keys(characterSetOptions).find((key) =>
              characterSetOptions[key as keyof typeof characterSetOptions] ===
                characterSet
            ) || "All Characters"}
            class="block w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {Object.keys(characterSetOptions).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1 opacity-0">
            Regenerate
          </label>
          <button
            type="button"
            onClick={handleRegenerate}
            class="px-4 py-2 border-tt-lightblue border-2 rounded-md bg-tt-lightblue hover:bg-tt-lightblue-darker text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}

// Import KeyLogger here to avoid circular dependency
import KeyLogger from "./KeyLogger.tsx";
