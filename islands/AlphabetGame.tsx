import { FunctionComponent as FC } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { PredefinedTrainingSet } from "../functions/predefinedTrainingSet.ts";
import { TrainingChar } from "../functions/randomTrainingSet.ts";
import { useMobileInput } from "../hooks/useMobileInput.ts";
import { useTypingMetrics } from "../hooks/useTypingMetrics.ts";
import {
  stripLetterClasses,
  stripLetterOpacity,
} from "../functions/alphabetStrip.ts";
import {
  getRandomHappyEmoji,
  getRandomSadEmoji,
} from "../functions/getRandomEmoji.ts";
import { cn } from "../functions/utils.ts";
import GameScoreDisplayIsland from "./GameScoreDisplayIsland.tsx";
import { recordGameStats } from "../utils/recordGameStats.ts";
import { UserStatsManager } from "../utils/userStatsManager.ts";
import { CharacterStats, DetailedGameResult } from "../types/userStats.ts";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

// Alphabet mode redesigned: one letter at a time (big letter + emoji feedback,
// like SingleLetters) framed by a sliding A–Z strip. The strip is a native
// scroll container that keeps the current letter centered via
// scrollIntoView({ inline: "center" }); % -width spacers at both ends make the
// first and last letters centerable too, so no manual transform math is needed.
export const AlphabetGame: FC = () => {
  const [trainingChars, setTrainingChars] = useState<TrainingChar[]>(() =>
    PredefinedTrainingSet(ALPHABET)
  );
  const [currentEmoji, setCurrentEmoji] = useState<string>("");
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isInputActive, setIsInputActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [gameResult, setGameResult] = useState<DetailedGameResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentLetterRef = useRef<HTMLSpanElement>(null);
  const finishedSentRef = useRef(false);

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

  const currentChar = typedCount < trainingChars.length
    ? trainingChars[typedCount].char
    : "";

  // Slide the strip so the current letter stays anchored at the center.
  useEffect(() => {
    currentLetterRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [typedCount]);

  // Emoji feedback on each keystroke, as in SingleLetters.
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
    } catch (error) {
      console.error("Failed to update alphabet stats:", error);
    }
  }, [isComplete, gameResult, startTime, trainingChars]);

  // Reset in place: no page reload, unlike the KeyLogger-based modes.
  const resetGame = useCallback(() => {
    setTrainingChars(PredefinedTrainingSet(ALPHABET));
    setCurrentEmoji("");
    setIsComplete(false);
    setGameResult(null);
    setStartTime(Date.now());
    finishedSentRef.current = false;
    resetInput();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [resetInput]);

  useEffect(() => {
    const totalChars = trainingChars.length;
    const isGameFinished = totalChars > 0 && typedCount === totalChars;

    if (isGameFinished && !finishedSentRef.current) {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      const gameResultData: DetailedGameResult = {
        gameId: `game_${Date.now()}_${
          Math.random().toString(36).substring(2, 15)
        }`,
        userId: "user",
        mode: "alphabet",
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
          source: "alphabet-lowercase",
          totalCharacters: trainingChars.length,
          uniqueCharacters: new Set(trainingChars.map((c) => c.char)).size,
        },
        wrongCharacters: getWrongCharactersArray(),
      };

      setGameResult(gameResultData);
      setIsComplete(true);

      recordGameStats({
        gameType: "alphabet",
        isFinished: true,
      }).catch((error) => {
        console.error("Error sending alphabet game stats:", error);
      });

      sendDetailedStats();
      finishedSentRef.current = true;
    }
  }, [
    typedCount,
    trainingChars,
    sendDetailedStats,
    metrics,
    mistakeCount,
    backspaceCount,
    getWrongCharactersArray,
    startTime,
  ]);

  // Auto-focus the hidden input on any keypress, as in the other modes.
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

  const inputStyle = {
    position: "absolute",
    top: "-9999px",
    left: "-9999px",
    opacity: 0,
    pointerEvents: "none",
  } as const;

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div onClick={focusInput} style={{ cursor: "pointer" }}>
      {!isComplete && (
        <div class="flex flex-col items-center justify-center min-h-[300px] space-y-6 py-4">
          {/* Sliding A–Z strip: current letter always centered */}
          <div class="w-full overflow-hidden py-2">
            <div class="flex items-center gap-1 whitespace-nowrap">
              <div class="shrink-0 w-[calc(50%-1.25rem)]" aria-hidden="true" />
              {trainingChars.map((item, index) => (
                <span
                  key={index}
                  ref={index === typedCount ? currentLetterRef : undefined}
                  class={cn(
                    "shrink-0 w-10 text-center text-3xl font-bold transition-all duration-150 rounded",
                    stripLetterClasses(index, typedCount, item.state),
                  )}
                  style={{ opacity: stripLetterOpacity(index, typedCount) }}
                >
                  {item.state === "correct" ? item.typedChar : item.char}
                </span>
              ))}
              <div class="shrink-0 w-[calc(50%-1.25rem)]" aria-hidden="true" />
            </div>
          </div>

          {/* Current Letter Display - Very Large */}
          <div class="text-[12rem] leading-none font-bold text-tt-darkblue select-none">
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
        onPracticeAgain={resetGame}
        onNextGame={resetGame}
        gameType="alphabet"
        gameResult={gameResult || undefined}
      />
    </div>
  );
};
