import { FunctionComponent as FC } from "preact";
import { useEffect, useRef, useState } from "preact/hooks"; // Import useRef and useEffect
import { TrainingChar } from "../functions/randomTrainingSet.ts";
import RenderedQuoteResult from "./RenderedQuoteResult.tsx";
import { useMobileInput } from "../hooks/useMobileInput.ts";
import { useTypingMetrics } from "../hooks/useTypingMetrics.ts";
import { TypingMetricsDisplay } from "../components/TypingMetricsDisplay.tsx";

interface KeyLoggerProps {
  codeableKeys: TrainingChar[];
  gameType: string;
}

const KeyLogger: FC<KeyLoggerProps> = ({ codeableKeys, gameType }) => {
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
  const [isFinished, setIsFinished] = useState(false);
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
      setIsFinished(true);
      // Send finished game data to API
      fetch("/api/game-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameType,
          isFinished: true,
        }),
      }).then((response) => response.json()).then((data) => {
        console.log("Finished game stats sent:", data);
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
      {metrics.isComplete && (
        <div class="mt-8 p-4 bg-tt-lightblue rounded-lg text-white">
          <TypingMetricsDisplay metrics={metrics} />
          {isFinished && (
            <button
              type="button"
              onClick={handleReload}
              class="mt-4 px-4 py-2 bg-tt-darkblue text-white rounded"
            >
              Reload Game
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default KeyLogger;
