import { FunctionComponent as FC } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import {
  randomTrainingSet,
  TrainingChar,
} from "../functions/randomTrainingSet.ts";
import { useMobileInput } from "../hooks/useMobileInput.ts";
import { useTypingMetrics } from "../hooks/useTypingMetrics.ts";
import GameScoreDisplayIsland from "./GameScoreDisplayIsland.tsx";
import { recordGameStats } from "../utils/recordGameStats.ts";
import { UserStatsManager } from "../utils/userStatsManager.ts";
import { CharacterStats, DetailedGameResult } from "../types/userStats.ts";
import {
  getRandomHappyEmoji,
  getRandomSadEmoji,
} from "../functions/getRandomEmoji.ts";

type CharacterSet = "lowercase" | "uppercase" | "numbers" | "special" | "all";

const CHARACTER_SETS: Record<CharacterSet, string> = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  special: "!@#$%^&*()_+-=[]{}|;:',.<>?/`~",
  all:
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:',.<>?/`~",
};

const CHARACTER_SET_LABELS: Record<CharacterSet, string> = {
  lowercase: "Lowercase",
  uppercase: "Uppercase",
  numbers: "Numbers",
  special: "Special",
  all: "All",
};

const TRAINING_LENGTH = 50; // Number of random characters to practice

export const SingleLetters: FC = () => {
  const [selectedSet, setSelectedSet] = useState<CharacterSet>("all");
  const [trainingChars, setTrainingChars] = useState<TrainingChar[]>(() =>
    randomTrainingSet(TRAINING_LENGTH, CHARACTER_SETS.all)
  );
  const [currentEmoji, setCurrentEmoji] = useState<string>("");
  const [startTime] = useState<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputActive, setIsInputActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [gameResult, setGameResult] = useState<DetailedGameResult | null>(null);

  const {
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    inputProps,
    getWrongCharactersArray,
  } = useMobileInput(trainingChars);

  const metrics = useTypingMetrics(
    trainingChars,
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    startTime,
  );

  // Get current character to display
  const currentChar = typedCount < trainingChars.length
    ? trainingChars[typedCount].char
    : "";

  // Generate unique game ID
  const generateGameId = (): string => {
    return `game_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  // Handle character set change
  const handleCharacterSetChange = (set: CharacterSet) => {
    setSelectedSet(set);
    const newTrainingSet = randomTrainingSet(
      TRAINING_LENGTH,
      CHARACTER_SETS[set],
    );
    setTrainingChars(newTrainingSet);
    setCurrentEmoji("");
    globalThis.location.reload(); // Reload to reset the game
  };

  // Handle practice again
  const handlePracticeAgain = () => {
    globalThis.location.reload();
  };

  // Monitor for correct/incorrect keystrokes and show emoji
  const previousTypedCount = useRef(typedCount);
  useEffect(() => {
    if (
      typedCount > previousTypedCount.current &&
      typedCount <= trainingChars.length
    ) {
      const lastChar = trainingChars[typedCount - 1];
      if (lastChar.state === "correct") {
        setCurrentEmoji(getRandomHappyEmoji());
      } else if (lastChar.state === "incorrect") {
        setCurrentEmoji(getRandomSadEmoji());
      }
    }
    previousTypedCount.current = typedCount;
  }, [typedCount, trainingChars]);

  // Send detailed stats to UserStatsManager
  const sendDetailedStats = useCallback(async () => {
    if (!isComplete || !gameResult) return;

    try {
      const userStatsManager = UserStatsManager.getInstance();
      await userStatsManager.initialize();

      const keystrokeData = trainingChars.map((char, index) => ({
        key: char.char,
        keyCode: char.char,
        expectedChar: char.char,
        actualChar: char.typedChar || char.char,
        correct: char.state === "correct",
        timeSinceLastKey: index === 0 ? 0 : 100,
        timestamp: startTime + (index * 100),
        position: { row: 0, col: index % 10 },
      }));

      const characterStats: { [char: string]: CharacterStats } = {};
      trainingChars.forEach((char) => {
        if (!characterStats[char.char]) {
          characterStats[char.char] = {
            attempts: 0,
            errors: 0,
            avgTimeBetweenKeys: 100,
          };
        }
        characterStats[char.char].attempts += 1;
        if (char.state === "incorrect") {
          characterStats[char.char].errors += 1;
        }
      });

      const updatedGameResult: DetailedGameResult = {
        ...gameResult,
        userId: userStatsManager.getUserId(),
        keystrokeData,
        characterStats,
      };

      await userStatsManager.updateStats(updatedGameResult);
      console.log("Single letters game stats updated successfully");
    } catch (error) {
      console.error("Failed to update single letters stats:", error);
    }
  }, [isComplete, gameResult, startTime, trainingChars]);

  // Input style (hidden off-screen)
  const inputStyle = {
    position: "absolute",
    top: "-9999px",
    left: "-9999px",
    opacity: 0,
    pointerEvents: "none",
  };

  // Focus input
  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Auto-focus input on any keypress
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (
        !isInputActive &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        if (event.key.length === 1 || event.key === "Backspace") {
          if (event.key === " ") {
            event.preventDefault();
          }
          inputRef.current?.focus();
        }
      }
    };

    globalThis.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      globalThis.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isInputActive]);

  // Check if game is complete
  const finishedSentRef = useRef(false);
  useEffect(() => {
    const totalChars = trainingChars.length;
    const isGameFinished = totalChars > 0 && typedCount === totalChars;

    if (isGameFinished && !finishedSentRef.current) {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      const gameResultData: DetailedGameResult = {
        gameId: generateGameId(),
        userId: "user",
        mode: "singleLetters",
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration,
        wpm: metrics.wordsPerMinute,
        cpm: metrics.charactersPerMinute,
        accuracy: metrics.accuracyPercentage,
        mistakeCount,
        backspaceCount,
        keystrokeData: [],
        characterStats: {},
        contentMetadata: {
          source: `single-letters-${selectedSet}`,
          totalCharacters: trainingChars.length,
          uniqueCharacters: new Set(trainingChars.map((c) => c.char)).size,
        },
        wrongCharacters: getWrongCharactersArray(),
      };

      setGameResult(gameResultData);
      setIsComplete(true);

      recordGameStats({
        gameType: "singleLetters",
        isFinished: true,
      }).then(() => {
        console.log("Single letters game finished stats sent");
      }).catch((error) => {
        console.error("Error sending single letters stats:", error);
      });

      sendDetailedStats();
      finishedSentRef.current = true;
    }
  }, [
    typedCount,
    trainingChars.length,
    sendDetailedStats,
    selectedSet,
    metrics,
    mistakeCount,
    backspaceCount,
    getWrongCharactersArray,
    startTime,
  ]);

  return (
    <div class="w-full min-h-[500px] rounded-lg bg-white shadow p-8">
      {/* Character Set Selector */}
      <div class="mb-8 flex flex-wrap justify-center gap-3">
        {(Object.keys(CHARACTER_SETS) as CharacterSet[]).map((set) => (
          <button
            key={set}
            onClick={() => handleCharacterSetChange(set)}
            class={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedSet === set
                ? "bg-tt-darkblue text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {selectedSet === set && <span class="mr-2">✓</span>}
            {CHARACTER_SET_LABELS[set]}
          </button>
        ))}
      </div>

      {/* Main Game Area */}
      <div onClick={focusInput} style={{ cursor: "pointer" }}>
        {!isComplete && (
          <div class="flex flex-col items-center justify-center min-h-[300px] space-y-8">
            {/* Current Letter Display - Very Large */}
            <div class="text-[12rem] font-bold text-tt-darkblue select-none">
              {currentChar}
            </div>

            {/* Emoji Feedback - Large, shown below letter */}
            {currentEmoji && (
              <div key={typedCount} class="text-[8rem] animate-bounce-three">
                {currentEmoji}
              </div>
            )}

            {/* Progress Indicator */}
            <div class="text-2xl text-gray-600 font-medium">
              {typedCount} / {trainingChars.length}
            </div>
          </div>
        )}

        {/* Hidden Input */}
        <input
          {...inputProps}
          ref={inputRef}
          style={inputStyle}
          onFocus={() => setIsInputActive(true)}
          onBlur={() => setIsInputActive(false)}
        />

        {/* Game Score Display */}
        <GameScoreDisplayIsland
          metrics={metrics}
          isComplete={isComplete}
          onPracticeAgain={handlePracticeAgain}
          onNextGame={handlePracticeAgain}
          gameType="singleLetters"
          gameResult={gameResult || undefined}
        />
      </div>
    </div>
  );
};
