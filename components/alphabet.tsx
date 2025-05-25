import KeyLogger from "../islands/KeyLogger.tsx";
import { PredefinedTrainingSet } from "../functions/predefinedTrainingSet.ts";

export function Alphabet() {
  const alphabet = "abcdefghijklmnopqrstuvwxz";
  const trainingSet = PredefinedTrainingSet(alphabet);
  return (
    <div class="w-full min-h-[300px] rounded-lg bg-white shadow">
      <KeyLogger codeableKeys={trainingSet} gameType="alphabet" />
    </div>
  );
}
