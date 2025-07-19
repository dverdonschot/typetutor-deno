import { FunctionComponent as FC } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { TrainingChar } from "../functions/randomTrainingSet.ts";
import RenderedQuoteResult from "./RenderedQuoteResult.tsx";
import { useMobileInput } from "../hooks/useMobileInput.ts";
import { useTypingMetrics } from "../hooks/useTypingMetrics.ts";
import GameScoreDisplayIsland from "./GameScoreDisplayIsland.tsx";
import { recordGameStats } from "../utils/recordGameStats.ts";
import { UserStatsManager } from "../utils/userStatsManager.ts";
import { CharacterStats, DetailedGameResult } from "../types/userStats.ts";

interface KeyLoggerProps {
  codeableKeys: TrainingChar[];
  gameType: string;
  onPracticeAgain?: () => void; // Add callback prop
  onNextGame?: () => void; // Add callback prop
}

const KeyLogger: FC<KeyLoggerProps> = (
  { codeableKeys, gameType, onPracticeAgain, onNextGame }, // Destructure new props
) => {
  const [startTime] = useState<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputActive, setIsInputActive] = useState(false);
  const {
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    inputProps,
    getWrongCharactersArray,
  } = useMobileInput(codeableKeys);
  const [isComplete, setIsComplete] = useState(false); // Rename state to isComplete
  const [gameResult, setGameResult] = useState<DetailedGameResult | null>(null); // Store game result
  const metrics = useTypingMetrics(
    codeableKeys,
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    startTime,
  );

  // Function to generate a unique game ID
  const generateGameId = (): string => {
    return `game_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  // Function to send detailed stats to UserStatsManager
  const sendDetailedStats = useCallback(async () => {
    if (!isComplete || !gameResult) return;

    try {
      const userStatsManager = UserStatsManager.getInstance();
      await userStatsManager.initialize();

      // Generate keystroke data from the training characters
      const keystrokeData = codeableKeys.map((char, index) => ({
        key: char.char,
        keyCode: char.char,
        expectedChar: char.char,
        actualChar: char.typedChar || char.char,
        correct: char.state === "correct",
        timeSinceLastKey: index === 0 ? 0 : 100, // Approximate timing
        timestamp: startTime + (index * 100),
        position: { row: 0, col: index % 10 }, // Approximate position
      }));

      // Generate character stats from training characters
      const characterStats: { [char: string]: CharacterStats } = {};
      codeableKeys.forEach((char) => {
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

      // Update the existing gameResult with more detailed data
      const updatedGameResult: DetailedGameResult = {
        ...gameResult,
        userId: userStatsManager.getUserId(),
        keystrokeData,
        characterStats,
      };

      await userStatsManager.updateStats(updatedGameResult);
      console.log("Detailed random mode stats updated successfully");
    } catch (error) {
      console.error("Failed to update detailed random mode stats:", error);
    }
  }, [
    isComplete,
    gameResult,
    startTime,
    codeableKeys,
  ]);

  const inputStyle = {
    position: "absolute",
    top: "-9999px",
    left: "-9999px",
    opacity: 0,
    pointerEvents: "none",
  };
  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (
        !isInputActive && !(event.target instanceof HTMLInputElement) &&
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

  const finishedSentRef = useRef(false);

  useEffect(() => {
    const totalChars = codeableKeys.length;
    const isGameFinished = totalChars > 0 && typedCount === totalChars;

    if (isGameFinished && !finishedSentRef.current) {
      // Create the game result synchronously to avoid timing issues
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      const gameResultData: DetailedGameResult = {
        gameId: generateGameId(),
        userId: "user", // Will be updated by UserStatsManager
        mode: "random",
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
          source: "random-characters",
          totalCharacters: codeableKeys.length,
          uniqueCharacters: new Set(codeableKeys.map((c) => c.char)).size,
        },
        wrongCharacters: getWrongCharactersArray(),
      };

      setGameResult(gameResultData); // Set game result synchronously
      setIsComplete(true); // Use setIsComplete

      // Send finished game data to API
      recordGameStats({
        gameType,
        isFinished: true,
      }).then(() => {
        console.log("Finished game stats sent");
      }).catch((error) => {
        console.error("Error sending finished game stats:", error);
      });

      // Send detailed stats to UserStatsManager
      sendDetailedStats();
      finishedSentRef.current = true;
    }
  }, [typedCount, codeableKeys.length, gameType, sendDetailedStats]); // Add sendDetailedStats to dependencies

  return (
    <div onClick={focusInput} style={{ cursor: "pointer" }}>
      {RenderedQuoteResult(codeableKeys)}
      <input
        {...inputProps}
        ref={inputRef}
        style={inputStyle}
        onFocus={() => setIsInputActive(true)}
        onBlur={() => setIsInputActive(false)}
      />
      {/* Render GameScoreDisplayIsland */}
      <GameScoreDisplayIsland
        metrics={metrics}
        isComplete={isComplete} // Use isComplete state
        onPracticeAgain={onPracticeAgain} // Pass callback prop
        onNextGame={onNextGame} // Pass callback prop
        gameType={gameType} // Pass gameType prop
        gameResult={gameResult || undefined} // Pass game result for heatmap
      />
    </div>
  );
};

export default KeyLogger;
