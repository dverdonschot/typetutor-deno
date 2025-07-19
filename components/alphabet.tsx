import KeyLogger from "../islands/KeyLogger.tsx";
import { PredefinedTrainingSet } from "../functions/predefinedTrainingSet.ts";

export function Alphabet() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const trainingSet = PredefinedTrainingSet(alphabet);

  const handlePracticeAgain = () => {
    // Reload the page to restart the alphabet practice
    globalThis.location.reload();
  };

  const handleReplay = () => {
    // Reload the page to restart the alphabet practice
    globalThis.location.reload();
  };

  return (
    <div class="w-full min-h-[300px] rounded-lg bg-white shadow">
      <KeyLogger
        codeableKeys={trainingSet}
        gameType="alphabet"
        onPracticeAgain={handlePracticeAgain}
        onNextGame={handleReplay}
      />
    </div>
  );
}
