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
  const [startTime, setStartTime] = useState<number>(Date.now());
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
    resetInput,
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
    // Reset game state without full page reload
    setIsComplete(false);
    setGameResult(null);
    setStartTime(Date.now());
    finishedSentRef.current = false;
    resetInput();
    // Focus input after state reset
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
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
    // Check if game is actually finished (don't rely on state)
    const totalChars = trainingChars.length;
    const isGameFinished = totalChars > 0 && typedCount === totalChars;
    if (!isGameFinished) return;

    try {
      const userStatsManager = UserStatsManager.getInstance();
      await userStatsManager.initialize();

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

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

      // Create game result directly (don't rely on state)
      const detailedGameResult: DetailedGameResult = {
        gameId: generateGameId(),
        userId: userStatsManager.getUserId(),
        mode: "singleLetters",
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration,
        wpm: metrics.wordsPerMinute,
        cpm: metrics.charactersPerMinute,
        accuracy: metrics.accuracyPercentage,
        mistakeCount,
        backspaceCount,
        keystrokeData,
        characterStats,
        contentMetadata: {
          source: `single-letters-${selectedSet}`,
          totalCharacters: trainingChars.length,
          uniqueCharacters: new Set(trainingChars.map((c) => c.char)).size,
        },
        wrongCharacters: getWrongCharactersArray(),
      };

      await userStatsManager.updateStats(detailedGameResult);
      setGameResult(detailedGameResult);
      console.log("Single letters game stats updated successfully");
    } catch (error) {
      console.error("Failed to update single letters stats:", error);
    }
  }, [
    startTime,
    trainingChars,
    typedCount,
    metrics,
    mistakeCount,
    backspaceCount,
    selectedSet,
    getWrongCharactersArray,
  ]);

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
      setIsComplete(true);

      // Send server stats
      recordGameStats({
        gameType: "singleLetters",
        category: selectedSet,
        isFinished: true,
      }).then(() => {
        console.log("Single letters game finished stats sent");
      }).catch((error) => {
        console.error("Error sending single letters stats:", error);
      });

      // Send detailed stats to UserStatsManager (creates game result and updates state)
      sendDetailedStats();
      finishedSentRef.current = true;
    }
  }, [
    typedCount,
    trainingChars.length,
    sendDetailedStats,
    selectedSet,
  ]);

  return (
    <div class="game-container">
      {/* Character Set Selector */}
      <div class="char-set-container">
        {(Object.keys(CHARACTER_SETS) as CharacterSet[]).map((set) => (
          <button
            type="button"
            key={set}
            onClick={() => handleCharacterSetChange(set)}
            class={`char-set-btn ${selectedSet === set ? "selected" : ""}`}
          >
            {selectedSet === set && <span class="checkmark">✓</span>}
            {CHARACTER_SET_LABELS[set]}
          </button>
        ))}
      </div>

      {/* Main Game Area */}
      <div onClick={focusInput} style={{ cursor: "pointer" }}>
        {!isComplete && (
          <div class="game-area">
            {/* Letter + Emoji: horizontal on mobile, vertical on desktop */}
            <div class="letter-emoji-container">
              {/* Current Letter Display - Responsive sizing */}
              <div class="current-letter">
                {currentChar}
              </div>

              {/* Emoji Feedback - side of letter on mobile, below on desktop */}
              <div class="emoji-container">
                {currentEmoji && (
                  <div
                    key={typedCount}
                    class="emoji-display animate-bounce-three"
                  >
                    {currentEmoji}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Indicator */}
            <div class="progress-indicator">
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
