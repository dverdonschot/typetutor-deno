import { TypingMetrics } from "../hooks/useTypingMetrics.ts";
import { useReactiveTranslation } from "../utils/translations.ts";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

interface TypingMetricsDisplayProps {
  metrics: TypingMetrics;
}

export function TypingMetricsDisplay({ metrics }: TypingMetricsDisplayProps) {
  if (!metrics.isComplete) return null;

  const t = useReactiveTranslation();

  return (
    <div class="mt-8 p-4 bg-tt-lightblue rounded-lg text-white">
      <h2 class="text-2xl font-bold mb-4">
        {t(TRANSLATION_KEYS.METRICS.TYPING_SUMMARY)}
      </h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-lg">
            {t(TRANSLATION_KEYS.METRICS.SPEED)}: {metrics.charactersPerMinute}
            {" "}
            {t(TRANSLATION_KEYS.METRICS.CPM)} / {metrics.wordsPerMinute}{" "}
            {t(TRANSLATION_KEYS.METRICS.WPM)}
          </p>
          <p class="text-lg">
            {t(TRANSLATION_KEYS.METRICS.MISTAKES)}: {metrics.mistakes}
          </p>
          <p class="text-lg">
            {t(TRANSLATION_KEYS.METRICS.BACKSPACES)}: {metrics.backspaceCount}
          </p>
          <p class="text-lg">
            {t(TRANSLATION_KEYS.METRICS.BACKSPACE_RATIO)}:{" "}
            {metrics.backspaceRatioPercent}%
          </p>
        </div>
        <div>
          <p class="text-lg">
            {t(TRANSLATION_KEYS.METRICS.ACCURACY)}:{" "}
            {metrics.accuracyPercentage}%
          </p>
          <p class="text-lg">
            {t(TRANSLATION_KEYS.METRICS.TIME)}:{" "}
            {Math.round(metrics.totalTimeSeconds)}s
          </p>
        </div>
      </div>
    </div>
  );
}
