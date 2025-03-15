import { useState } from 'preact/hooks';
import { TrainingChar } from "../functions/randomTrainingSet.ts";
import RenderedQuoteResult from "./RenderedQuoteResult.tsx";
import { useKeyPress } from "../hooks/useKeyPress.ts";
import { useTypingMetrics } from "../hooks/useTypingMetrics.ts";
import { TypingMetricsDisplay } from "../components/TypingMetricsDisplay.tsx";

interface KeyLoggerProps {
  codeableKeys: TrainingChar[];
}

const KeyLogger: React.FC<KeyLoggerProps> = ({ codeableKeys }) => {
  const [startTime] = useState<number>(Date.now());
  const { typedCount, correctCount, mistakeCount, backspaceCount } = useKeyPress(codeableKeys);
  const metrics = useTypingMetrics(
    codeableKeys,
    typedCount,
    correctCount,
    mistakeCount,
    backspaceCount,
    startTime
  );

  return (
    <div>
      {RenderedQuoteResult(codeableKeys)}
      <TypingMetricsDisplay metrics={metrics} />
    </div>
  );
};

export default KeyLogger;
