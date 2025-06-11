import { FunctionComponent as FC } from "preact";
import { useEffect, useRef, useState } from "preact/hooks"; // Import useRef and useEffect
import { TrainingChar } from "../functions/randomTrainingSet.ts";
import RenderedQuoteResult from "./RenderedQuoteResult.tsx";
import { useMobileInput } from "../hooks/useMobileInput.ts";
import { useTypingMetrics } from "../hooks/useTypingMetrics.ts";
import { TypingMetricsDisplay } from "../components/TypingMetricsDisplay.tsx";
import GameScoreDisplayIsland from "./GameScoreDisplayIsland.tsx";
import { recordGameStats } from "../utils/recordGameStats.ts";

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
  } = useMobileInput(codeableKeys);
  const [isComplete, setIsComplete] = useState(false); // Rename state to isComplete
  const metrics = useTypingMetrics(
    codeableKeys,
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    startTime,
  );

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
      finishedSentRef.current = true;
    }
  }, [typedCount, codeableKeys.length, gameType]); // Add gameType to dependencies

  const handleReload = () => {
    if (typeof window !== "undefined") {
      globalThis.location.reload();
    }
  };

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
      />
    </div>
  );
};

export default KeyLogger;
